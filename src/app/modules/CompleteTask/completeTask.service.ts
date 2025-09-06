import { JwtPayload } from "jsonwebtoken";
import { Task } from "../Tasks/task.model";
import { AppError } from "../../Errors/appErrors";
import { StatusCodes } from "http-status-codes";
import { CompleteTask } from "./completeTask.model";
import { User } from "../TelegramAuth/telegramAuth.model";

const taskCompleted = async (id: string, user: JwtPayload) => {
  const taskData = await Task.findById(id);
  if (!taskData) {
    throw new AppError(StatusCodes.NOT_FOUND, "no task data found");
  }

  const userData = await User.findById(user?._id);

  const now = new Date();

  // আজকের তারিখ UTC হিসেবে বের করবো
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const utcDate = now.getUTCDate();

  // UTC 00:00:00 থেকে UTC 23:59:59.999 পর্যন্ত
  const startUtc = new Date(Date.UTC(utcYear, utcMonth, utcDate, 0, 0, 0, 0));
  const endUtc = new Date(
    Date.UTC(utcYear, utcMonth, utcDate, 23, 59, 59, 999)
  );

  // find current task is completed

  const completed = await CompleteTask.findOne({
    userId: user?._id,
    taskId: id,
    lastAt: { $gte: startUtc, $lte: endUtc },
  });

  if (completed?.count === taskData?.perUserCap) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Today limit reached");
  }

  if (completed) {
    completed.count = (completed.count ?? 0) + 1;
    completed.lastAt = new Date();
    const reward = Number(taskData?.rewardCoin ?? 0);
    userData!.balance = Number(userData!.balance ?? 0) + reward;
    await completed.save();
    await userData?.save();
    return completed;
  } else {
    const newCompleted = await CompleteTask.create({
      userId: user?._id,
      taskId: id,
      count: 1,
      lastAt: new Date(),
    });

    const reward = Number(taskData?.rewardCoin ?? 0);
    userData!.balance = Number(userData!.balance ?? 0) + reward;
    await userData?.save();
    return newCompleted;
  }
};
export const completeTaskService = {
  taskCompleted,
};
