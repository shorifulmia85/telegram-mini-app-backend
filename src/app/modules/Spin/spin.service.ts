import { StatusCodes } from "http-status-codes";
import { AppError } from "../../Errors/appErrors";
import { Spin } from "./spin.model";
import { ISpin } from "./spin.interface";
import mongoose from "mongoose";
import { User } from "../TelegramAuth/telegramAuth.model";
import { angleForTopPointer, pickWeighted } from "../../ulits/spin";
import { SpinAndWin } from "./spinAndWin.model";

const createSpin = async (payload: ISpin) => {
  const isExists = await Spin.findOne({ segmentIndex: payload?.segmentIndex });
  if (isExists) {
    throw new AppError(StatusCodes.CONFLICT, "Already exists");
  }

  const NUM_SEGMENTS = 10;

  if (payload.segmentIndex < 0 || payload.segmentIndex >= NUM_SEGMENTS) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `segmentIndex must be 0..${NUM_SEGMENTS - 1}`
    );
  }
  // 2) value/coin/weight sanity
  if (payload.coin < 0)
    throw new AppError(StatusCodes.BAD_REQUEST, "coin must be >= 0");
  if (payload.weight < 0)
    throw new AppError(StatusCodes.BAD_REQUEST, "weight must be >= 0");
  if (!payload.bgColor || !payload.textColor) {
    throw new AppError(StatusCodes.BAD_REQUEST, "bgColor/textColor required");
  }

  return await Spin.create(payload);
};

const getAllSpin = async () => {
  const result = await Spin.find();
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "No data found");
  }

  return result;
};

// services/spin.service.ts

const spinAndWin = async (opts: { userId: string; idempotencyKey: string }) => {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      // 1) লোড সক্রিয় সেগমেন্ট + weighted pick
      const segments = await Spin.find({ active: true })
        .sort({ segmentIndex: 1 })
        .session(session);
      if (!segments.length) throw new Error("No segments configured");

      const idx = pickWeighted(segments);

      const chosen = segments[idx];

      const displayAngle = angleForTopPointer(idx, segments.length);

      // 2) ডাবল-ক্লিক গার্ড: একই userId + idempotencyKey থাকলে থামান
      const dup = await SpinAndWin.findOne({
        userId: opts.userId,
        idempotencyKey: opts.idempotencyKey,
      }).session(session);

      if (dup)
        return {
          spinId: String(dup._id),
          displayAngle: dup.displayAngle,
          prize: {
            value: dup.prizeValue,
            coin: dup.coin,
            segmentIndex: dup.segmentIndex,
          },
          createdAt: dup.createdAt,
          // balance পাঠাতে চাইলে নিচে ইনক্রিমেন্ট করবেন না (আগেই ক্রেডিট হয়েছিল)
        };

      // 3) Spin ডকুমেন্ট তৈরি
      const spin = await SpinAndWin.create(
        [
          {
            userId: opts.userId,
            idempotencyKey: opts.idempotencyKey,
            prizeId: chosen._id,
            prizeValue: chosen.value,
            coin: chosen.coin,
            segmentIndex: chosen.segmentIndex,
            displayAngle,
          },
        ],
        { session }
      ).then((r) => r[0]);

      // 4) ইউজারের ব্যালান্সে ক্রেডিট (atomic $inc) এবং আপডেটেড ব্যালান্স নিন
      const updatedUser = await User.findByIdAndUpdate(
        opts.userId,
        { $inc: { balance: chosen.coin, lifeTimeBalance: chosen.coin } },
        { new: true, session }
      );
      const balanceAfter = updatedUser?.balance ?? undefined;
      const lifeTimeBalanceAfter = updatedUser?.lifeTimeBalance ?? undefined;

      // 6) রেসপন্স
      return {
        spinId: String(spin._id),
        displayAngle,
        prize: {
          value: chosen.value,
          coin: chosen.coin,
          segmentIndex: chosen.segmentIndex,
        },
        balance: balanceAfter,
        lifeTimeBalance: lifeTimeBalanceAfter,
        createdAt: spin.createdAt,
      };
    });
  } finally {
    session.endSession();
  }
};

export const spinServices = {
  createSpin,
  getAllSpin,
  spinAndWin,
};
