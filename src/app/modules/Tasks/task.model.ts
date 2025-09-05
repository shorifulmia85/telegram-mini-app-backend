import { model, Schema } from "mongoose";
import { AdNetwork, ITask, TaskStatus, TaskType } from "./task.interface";

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    imageUrl: { type: String },
    type: {
      type: String,
      enum: Object.values(TaskType),
      index: true,
    },
    adNetwork: {
      type: String,
      enum: Object.values(AdNetwork),
      index: true,
    },
    link: { type: String },
    adUnitId: { type: String },
    rewardCoin: { type: Number, required: true, min: 0, default: 1000 },
    cooldownSec: { type: Number, required: true, min: 0, default: 300 },
    perUserCap: { type: Number, required: true, min: 1, default: 15 },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.ACTIVE,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

TaskSchema.index({ status: 1, activeFrom: 1, activeTo: 1 });

export const Task = model<ITask>("Task", TaskSchema);
