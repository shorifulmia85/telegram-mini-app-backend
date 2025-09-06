import { StatusCodes } from "http-status-codes";
import { AppError } from "../../Errors/appErrors";
import { ITask } from "./task.interface";
import { Task } from "./task.model";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../TelegramAuth/telegramAuth.model";
import { UserRole } from "../TelegramAuth/telegramAuth.interface";
import { TaskStatus } from "./task.validation";
import { CompleteTask } from "../CompleteTask/completeTask.model";
import mongoose from "mongoose";

const createTask = async (payload: Partial<ITask>) => {
  const thisAdIsRunning = await Task.findOne({ adUnitId: payload?.adUnitId });
  if (thisAdIsRunning) {
    throw new AppError(StatusCodes.CONFLICT, "This ads already running");
  }
  return await Task.create(payload);
};

// const getAllTask = async (user: JwtPayload) => {
//   const userData = await User.findById(user?._id);
//   if (userData?.role === UserRole.USER) {
//     const taskData = await Task.find({ status: "ACTIVE" });
//     return taskData;
//   }
//   return await Task.find();
// };

const getAllTask = async (user: JwtPayload) => {
  const userData = await User.findById(user?._id);

  // Only get active tasks if normal user
  const taskQuery =
    userData?.role === UserRole.USER ? { status: "ACTIVE" } : {};

  const taskData = await Task.find(taskQuery).lean();

  if (userData?.role === UserRole.USER) {
    // ✅ Get UTC start and end of today
    const now = new Date();

    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth();
    const utcDate = now.getUTCDate();

    const startUtc = new Date(Date.UTC(utcYear, utcMonth, utcDate, 0, 0, 0, 0));
    const endUtc = new Date(
      Date.UTC(utcYear, utcMonth, utcDate, 23, 59, 59, 999)
    );

    // ✅ Find all CompleteTask docs created today for this user
    const completions = await CompleteTask.find({
      userId: new mongoose.Types.ObjectId(user._id),
      createdAt: { $gte: startUtc, $lte: endUtc },
    }).lean();

    // ✅ Map of taskId -> count
    const completionMap = new Map(
      completions.map((item) => [item.taskId.toString(), item.count])
    );

    // ✅ Attach completedCount to each task
    taskData.forEach((task: any) => {
      const taskIdStr = task._id.toString();
      task.completedCount = completionMap.get(taskIdStr) || 0;
    });
  }

  return taskData;
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
