import { model, Schema, Types } from "mongoose";
import { IAuthStatus, IAuthUser, UserRole } from "./telegramAuth.interface";

const userSchema = new Schema<IAuthUser>(
  {
    tgId: { type: Number, required: true, unique: true },
    userName: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    country: { type: String },
    ip: { type: String },
    photo: { type: String },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },

    status: {
      type: String,
      enum: Object.values(IAuthStatus),
      default: IAuthStatus.ACTIVE,
    },

    referCode: { type: String, required: true },
    referLink: { type: String, required: true },
    balance: { type: Number, default: 0 },
    referIncome: { type: Number, default: 0 },
    lifeTimeBalance: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    referred_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<IAuthUser>("User", userSchema);
