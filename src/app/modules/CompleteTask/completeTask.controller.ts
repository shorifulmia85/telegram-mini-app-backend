import { Request, Response } from "express";
import { catchAsync } from "../../ulits/catchAsynce";
import { JwtPayload } from "jsonwebtoken";
import { sendResponse } from "../../ulits/sendResponse";
import { StatusCodes } from "http-status-codes";
import { completeTaskService } from "./completeTask.service";

const taskCompleted = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  const result = await completeTaskService.taskCompleted(
    id,
    user as JwtPayload
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "task completed successfully",
    data: result,
  });
});
export const taskCompletedController = {
  taskCompleted,
};
