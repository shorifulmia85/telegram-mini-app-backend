import { model, Schema, Types } from "mongoose";

export enum ReferralStatus {
  PENDING = "PENDING",
  UNLOCKED = "UNLOCKED",
  REJECTED = "REJECTED",
}

const referralSchema = new Schema(
  {
    referrerId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referredId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    codeUsed: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(ReferralStatus),
      default: ReferralStatus.PENDING,
      index: true,
    },
    reason: { type: String },
    lockedAmount: { type: Number, default: 10000 },
    unlockedAmount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    unlockedAt: { type: Date },
  },
  { timestamps: true }
);

export const Referral = model("Referral", referralSchema);
