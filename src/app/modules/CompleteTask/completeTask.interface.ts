import { Types } from "mongoose";

export interface ITaskComplete {
  userId: Types.ObjectId;
  taskId: Types.ObjectId;
  count: number;
  dayKey: string;
  lastAt?: Date | null;
}
