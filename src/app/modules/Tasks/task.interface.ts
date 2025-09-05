import { Types } from "mongoose";

export enum TaskStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  ENDED = "ENDED",
}
export enum AdNetwork {
  NONE = "NONE",
  MONETAG = "MONETAG",
  ADSGRAM = "ADSGRAM",
  ONCLICKA = "ONCLICKA",
  GIGAPUB = "GIGAPUB",
  ADSENSE = "ADSENSE",
}
export enum TaskType {
  VIEW = "VIEW",
  CLICK = "CLICK",
  WATCH = "WATCH",
  VISIT = "VISIT",
}

export interface ITask {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  type: TaskType;
  adNetwork: AdNetwork;
  adUnitId?: string;
  rewardCoin: number;
  cooldownSec: number;
  perUserCap: number;
  status: TaskStatus;
}
