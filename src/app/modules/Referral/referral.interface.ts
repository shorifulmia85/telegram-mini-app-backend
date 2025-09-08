import mongoose from "mongoose";

export type ReferralLean = {
  _id: mongoose.Types.ObjectId;
  referrerId: mongoose.Types.ObjectId;
  referredId?:
    | {
        _id: mongoose.Types.ObjectId;
        firstName?: string;
        lastName?: string;
        photo?: string;
        balance: string;
      }
    | mongoose.Types.ObjectId;
  status: "PENDING" | "APPROVED" | "REJECTED";
  lockedAmount: number;
  unlockedAmount: number;
  createdAt: Date;
  updatedAt: Date;
};
