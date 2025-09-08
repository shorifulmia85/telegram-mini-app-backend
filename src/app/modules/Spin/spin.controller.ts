import { Request, Response } from "express";
import { catchAsync } from "../../ulits/catchAsynce";
import { sendResponse } from "../../ulits/sendResponse";
import { StatusCodes } from "http-status-codes";
import { spinServices } from "./spin.service";

const createSpin = catchAsync(async (req: Request, res: Response) => {
  const result = await spinServices.createSpin(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Spin value created",
    data: result,
  });
});
const getAllSpin = catchAsync(async (req: Request, res: Response) => {
  const result = await spinServices.getAllSpin();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Spin data get successfully",
    data: result,
  });
});
const spinAndWin = catchAsync(async (req: Request, res: Response) => {
  const userId = req?.user?._id;
  const { idempotencyKey } = req.body || {};
  const result = await spinServices.spinAndWin({ userId, idempotencyKey });
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Success",
    data: result,
  });
});

export const spinController = {
  createSpin,
  getAllSpin,
  spinAndWin,
};
