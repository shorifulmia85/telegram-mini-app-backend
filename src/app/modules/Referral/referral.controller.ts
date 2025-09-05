import { Request, Response } from "express";
import { catchAsync } from "../../ulits/catchAsynce";
import { sendResponse } from "../../ulits/sendResponse";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { referralServices } from "./referral.service";

const referralUnlocked = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const user = req.user;
  const result = await referralServices.referralUnlocked(
    id,
    user as JwtPayload
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Success",
    data: result,
  });
});
const getMyReferrals = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await referralServices.getMyReferrals(
    user as JwtPayload,
    req.query as Record<string, string>
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "referral data get successfully",
    data: result?.data,
    meta: result?.meta,
  });
});
const getAllReferrals = catchAsync(async (req: Request, res: Response) => {
  const result = await referralServices.getAllReferrals(
    req?.query as Record<string, string>
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "get all referrals data successfully",
    data: result?.data,
    meta: result?.meta,
  });
});
const leaderboard = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await referralServices.leaderboard(user as JwtPayload);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "leaderboard data successfully",
    data: result,
  });
});

export const referralController = {
  referralUnlocked,
  getMyReferrals,
  getAllReferrals,
  leaderboard,
};
