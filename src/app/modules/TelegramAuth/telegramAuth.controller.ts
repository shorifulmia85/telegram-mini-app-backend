import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../ulits/sendResponse";
import { parseInitDataQuery } from "@telegram-apps/sdk";
import { validate } from "@telegram-apps/init-data-node";
import { AppError } from "../../Errors/appErrors";
import { catchAsync } from "../../ulits/catchAsynce";
import { Request, Response } from "express";
import { telegramAuthServices } from "./telegramAuth.service";
import { envVars } from "../../config";
import { authCookie } from "../../ulits/authCookite";
import { JwtPayload } from "jsonwebtoken";

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await telegramAuthServices.getMe(user as JwtPayload);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Profile data get successfully",
    data: result,
  });
});

const createUserOrLogin = catchAsync(async (req: Request, res: Response) => {
  const { initData } = req.body;
  //console.log(initData);
  if (!initData) {
    throw new AppError(StatusCodes.BAD_REQUEST, "initData is required");
  }

  // 1) Verify Telegram initData (hash + age limit)
  validate(initData, envVars.TELEGRAM_BOT_TOKEN as string, {
    expiresIn: Number(envVars.INITDATA_MAX_AGE_SEC ?? 86400), // e.g., 1 day
  });

  // 2) Parse everything from initData
  const parsed = parseInitDataQuery(initData);

  const startParam: string | null =
    ((parsed as any).startParam ?? (parsed as any).start_param ?? null) || null;

  if (!parsed?.user?.id) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid initData: user missing"
    );
  }

  // 3) Client IP (optional analytics)
  const userIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    undefined;

  // 4) Prepare payload for service
  const payload = {
    tgId: parsed.user.id,
    userName: parsed.user.username,
    firstName: parsed.user.first_name,
    lastName: parsed.user.last_name,
    photo: parsed?.user?.photo_url,
    startParam,
    ip: userIp,
  };

  const result = await telegramAuthServices.createUserORrLogin(payload);
  authCookie(res, result);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "User created successfully",
    data: result,
  });
});

export const telegramAuthController = { createUserOrLogin, getMe };
