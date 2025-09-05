import { Request, Response } from "express";
import { catchAsync } from "../../ulits/catchAsynce";
import { taskServices } from "./task.service";
import { sendResponse } from "../../ulits/sendResponse";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

const createTask = catchAsync(async (req: Request, res: Response) => {
  const result = await taskServices.createTask(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "task created successfully",
    data: result,
  });
});
const getAllTask = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await taskServices.getAllTask(user as JwtPayload);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "task get successfully",
    data: result,
  });
});
const getMyTask = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await taskServices.getMyTask(user as JwtPayload);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "my task get successfully",
    data: result,
  });
});
const updateTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await taskServices.updateTask(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "task updated successfully",
    data: result,
  });
});
const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await taskServices.deleteTask(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "task deleted successfully",
    data: result,
  });
});

export const taskController = {
  createTask,
  getAllTask,
  updateTask,
  deleteTask,
  getMyTask,
};
