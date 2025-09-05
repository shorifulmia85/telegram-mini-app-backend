import { Types } from "mongoose";

export interface IAuthUser {
  _id: string;
  tgId: number;
  userName?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  photo?: string;
  startParam?: string | null;
  referCode: string;
  ip?: string;
  role: UserRole;
  status: IAuthStatus;
  balance: number;
  lifeTimeBalance: number;
  referLink: string;
  isDeleted?: boolean;
  referred_by?: Types.ObjectId;
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum IAuthStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}
