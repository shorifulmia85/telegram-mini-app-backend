import { model, Schema } from "mongoose";
import { ITaskComplete } from "./completeTask.interface";

const taskCompleteSchema = new Schema<ITaskComplete>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    dayKey: { type: String, required: true },
    count: { type: Number, default: 0 },
    lastAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskCompleteSchema.index({ userId: 1, taskId: 1 }, { unique: true });
taskCompleteSchema.index({ userId: 1, taskId: 1, dayKey: 1 }, { unique: true });

export const CompleteTask = model<ITaskComplete>(
  "CompleteTask",
  taskCompleteSchema
);
