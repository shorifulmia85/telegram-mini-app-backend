import { JwtPayload } from "jsonwebtoken";
import { Task } from "../Tasks/task.model";
import { AppError } from "../../Errors/appErrors";
import { StatusCodes } from "http-status-codes";
import { CompleteTask } from "./completeTask.model";
import { User } from "../TelegramAuth/telegramAuth.model";

const toDayKeyUTC = (d = new Date()) => {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // e.g. 2025-09-07
};

const taskCompleted = async (id: string, user: JwtPayload) => {
  const taskData = await Task.findById(id);
  if (!taskData)
    throw new AppError(StatusCodes.NOT_FOUND, "no task data found");

  const userData = await User.findById(user?._id);
  if (!userData) throw new AppError(StatusCodes.UNAUTHORIZED, "user not found");

  const perUserCap = Number(taskData.perUserCap ?? 0) || 0;
  const reward = Number(taskData.rewardCoin ?? 0) || 0;
  const dayKey = toDayKeyUTC();

  // 1) আজকের ডক আছে কিনা দেখে CAP চেক
  const todayDoc = await CompleteTask.findOne({
    userId: user?._id,
    taskId: id,
    dayKey,
  });
  if (todayDoc && perUserCap > 0 && (todayDoc.count ?? 0) >= perUserCap) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Today limit reached");
  }

  // 2) থাকলে +1, না থাকলে নতুন ডক (upsert) —> ঠিক এইটাই তোমার চাওয়া
  const filter = { userId: user?._id, taskId: id, dayKey };
  const update = {
    $inc: { count: 1 },
    $set: { lastAt: new Date() },
    $setOnInsert: { userId: user?._id, taskId: id, dayKey }, // count এখানে দিচ্ছি না (conflict এড়াতে)
  } as const;

  let updated = await CompleteTask.findOneAndUpdate(filter, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true, // schema default গুলো বসবে
  }).catch(async (e: any) => {
    // concurrent upsert হলে ডুপ্লিকেট হতে পারে—একবার রিট্রাই
    if (e?.code === 11000) {
      return CompleteTask.findOneAndUpdate(filter, update, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
    }
    throw e;
  });

  // 3) রেস কন্ডিশনে CAP ক্রস হলে 1 কমিয়ে ব্লক
  if (perUserCap > 0 && updated!.count > perUserCap) {
    await CompleteTask.updateOne(filter, { $inc: { count: -1 } });
    throw new AppError(StatusCodes.BAD_REQUEST, "Today limit reached");
  }

  // 4) ব্যালেন্স আপডেট
  userData.balance = Number(userData.balance ?? 0) + reward;
  await userData.save();

  return updated;
};

export const completeTaskService = { taskCompleted };
