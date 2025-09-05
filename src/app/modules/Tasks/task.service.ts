import { StatusCodes } from "http-status-codes";
import { AppError } from "../../Errors/appErrors";
import { ITask } from "./task.interface";
import { Task } from "./task.model";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../TelegramAuth/telegramAuth.model";
import { UserRole } from "../TelegramAuth/telegramAuth.interface";
import { TaskStatus } from "./task.validation";
import { CompleteTask } from "../CompleteTask/completeTask.model";

const createTask = async (payload: Partial<ITask>) => {
  const thisAdIsRunning = await Task.findOne({ adUnitId: payload?.adUnitId });
  if (thisAdIsRunning) {
    throw new AppError(StatusCodes.CONFLICT, "This ads already running");
  }
  return await Task.create(payload);
};

const getAllTask = async (user: JwtPayload) => {
  const userData = await User.findById(user?._id);
  if (userData?.role === UserRole.USER) {
    const taskData = await Task.find({ status: "ACTIVE" });
    return taskData;
  }
  return await Task.find();
};

const getMyTask = async (user: JwtPayload) => {
  const userData = await User.findById(user?._id);
  return await CompleteTask.find({ userId: userData?._id });
};

const updateTask = async (id: string, payload: Partial<ITask>) => {
  console.log(payload);
  const taskData = await Task.findById(id);
  if (!taskData) {
    throw new AppError(StatusCodes.NOT_FOUND, "task data not found");
  }

  const updateTask = await Task.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return updateTask;
};

const deleteTask = async (id: string) => {
  const taskData = await Task.findById(id);
  if (!taskData) {
    throw new AppError(StatusCodes.NOT_FOUND, "task not found");
  }
  return await Task.findByIdAndDelete(id);
};
export const taskServices = {
  createTask,
  getAllTask,
  updateTask,
  deleteTask,
  getMyTask,
};
