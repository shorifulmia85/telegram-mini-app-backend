// src/modules/TelegramAuth/telegramAuth.service.ts
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { envVars } from "../../config";
import { AppError } from "../../Errors/appErrors";
import { generateToken } from "../../ulits/generateToken";
import { buildReferralLink } from "../../ulits/referLinkGenerator";
import { makeReferralCode } from "../../ulits/referral";
import { IAuthStatus, IAuthUser } from "./telegramAuth.interface";
import { User } from "./telegramAuth.model";
import { Referral, ReferralStatus } from "../Referral/referral.model";
import { JwtPayload } from "jsonwebtoken";

const createUserORrLogin = async (payload: Partial<IAuthUser>) => {
  if (!payload?.tgId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "tgId is required");
  }

  // ---------- Check for existing user first (before any transaction) ----------
  const existing = await User.findOne({ tgId: payload.tgId });
  if (existing) {
    if (
      existing.status === IAuthStatus.BLOCKED ||
      existing.status === IAuthStatus.INACTIVE
    ) {
      throw new AppError(StatusCodes.BAD_REQUEST, `user ${existing.status}`);
    }
    if (existing.isDeleted) {
      throw new AppError(StatusCodes.LOCKED, "user is deleted");
    }

    const tokenPayload = {
      tgId: existing.tgId,
      _id: existing._id,
      role: existing.role,
    };
    const accessToken = generateToken(
      tokenPayload,
      envVars.jWT_SECRET,
      envVars.JWT_EXPIRES_IN
    );
    const refreshToken = generateToken(
      tokenPayload,
      envVars.jWT_REFRESH_SECRET,
      envVars.jWT_REFRESH_EXPIRES_IN
    );

    return { accessToken, refreshToken, isNew: false };
  }

  // ---------- CREATE (with transaction and retry logic) ----------
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Re-check for existing user inside the transaction to prevent race conditions
      const userExistsInTransaction = await User.findOne(
        { tgId: payload.tgId },
        null,
        { session }
      );
      if (userExistsInTransaction) {
        // If another process already created the user, log them in instead
        await session.commitTransaction(); // Commit to release locks
        session.endSession();
        return createUserORrLogin(payload); // Recursive call to handle login flow
      }

      let accessToken = "";
      let refreshToken = "";

      const referCode = makeReferralCode();
      const referLink = buildReferralLink(
        envVars.TELEGRAM_BOT_USERNAME,
        referCode
      );

      const [newUser] = await User.create(
        [
          {
            ...payload,
            referCode,
            referLink,
          },
        ],
        { session }
      );

      if (payload?.startParam) {
        const referrer = await User.findOne(
          { referCode: payload.startParam },
          null,
          { session }
        );

        if (!referrer) {
          throw new AppError(StatusCodes.BAD_REQUEST, "invalid refer code");
        }
        if (String(referrer._id) === String(newUser._id)) {
          throw new AppError(
            StatusCodes.BAD_REQUEST,
            "self referral not allowed"
          );
        }

        await Referral.create(
          [
            {
              referrerId: referrer._id,
              referredId: newUser._id,
              codeUsed: payload.startParam,
              status: ReferralStatus.PENDING,
              lockedAmount: 10000,
            },
          ],
          { session }
        );

        await User.updateOne(
          { _id: newUser._id },
          { $set: { referred_by: referrer._id } },
          { session }
        );
      }

      const tokenPayload = {
        tgId: newUser.tgId,
        _id: newUser._id,
        role: newUser.role,
      };
      accessToken = generateToken(
        tokenPayload,
        envVars.jWT_SECRET,
        envVars.JWT_EXPIRES_IN
      );
      refreshToken = generateToken(
        tokenPayload,
        envVars.jWT_REFRESH_SECRET,
        envVars.jWT_REFRESH_EXPIRES_IN
      );

      await session.commitTransaction();
      session.endSession();
      return { accessToken, refreshToken, isNew: true };
    } catch (err: any) {
      await session.abortTransaction();
      session.endSession();

      if (
        err.message.includes(
          "Please retry your operation or multi-document transaction"
        )
      ) {
        console.warn(
          `Transient transaction error detected. Retrying... (Attempt ${
            i + 1
          }/${maxRetries})`
        );
        continue;
      } else {
        throw err;
      }
    }
  }

  throw new AppError(
    StatusCodes.INTERNAL_SERVER_ERROR,
    "Transaction failed after multiple retries."
  );
};

const getMe = async (user: JwtPayload) => {
  const isUserExist = await User.findById(user?._id);
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "user not found");
  }
  return isUserExist;
};

export const telegramAuthServices = { createUserORrLogin, getMe };
