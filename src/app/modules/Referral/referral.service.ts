// services/referral.unlock.ts
import mongoose from "mongoose";
import { Referral, ReferralStatus } from "./referral.model";
import { User } from "../TelegramAuth/telegramAuth.model";
import { AppError } from "../../Errors/appErrors";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { checkUserIsValid } from "../../ulits/IsUserExits";
import { QueryBuilder } from "../../ulits/queryBuilder";
import { referralSearchableField } from "./referral.constant";
import { UserRole } from "../TelegramAuth/telegramAuth.interface";
import { PipelineStage } from "mongoose";

const referralUnlocked = async (referralId: string, authUser: JwtPayload) => {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
      // 1) auth user exists?
      const referrer = await User.findById(authUser?._id).session(session);
      if (!referrer) {
        throw new AppError(StatusCodes.NOT_FOUND, "user not found");
      }

      // 2) referral exists?
      const ref = await Referral.findById(referralId).session(session);
      if (!ref) {
        throw new AppError(StatusCodes.BAD_REQUEST, "invalid request");
      }

      // 3) ownership check: only owner can unlock
      if (String(ref.referrerId) !== String(referrer._id)) {
        throw new AppError(StatusCodes.FORBIDDEN, "not your referral");
      }

      // 4) idempotency
      if (ref.status === ReferralStatus?.UNLOCKED) {
        return {
          ok: true,
          alreadyUnlocked: true,
          amount: ref.unlockedAmount ?? ref.lockedAmount,
        };
      }
      if (ref.status === ReferralStatus?.REJECTED) {
        throw new AppError(StatusCodes.BAD_REQUEST, "referral rejected");
      }

      // 5) referred user exists & valid?
      const referred = await User.findById(ref.referredId).session(session);
      if (!referred) {
        throw new AppError(StatusCodes.NOT_FOUND, "referred user not found");
      }
      // আপনার কাস্টম ভ্যালিডেশন (সেশন সহ কল করুন, চাইলে helper-এ session পাস করুন)
      await checkUserIsValid("_id", referred._id);

      // 6) eligibility check (আপনার বিজনেস রুল)
      // উদাহরণ: referred.balance >= lockedAmount  (আপনি যেমন লিখেছিলেন)
      const okActivity = (referred.balance ?? 0) >= (ref.lockedAmount ?? 0);
      if (!okActivity) {
        throw new AppError(StatusCodes.NOT_ACCEPTABLE, "not eligible yet");
      }

      // 7) apply bonus atomically (✅ $inc ডেল্টা নেয়)
      await User.updateOne(
        { _id: referrer._id },
        {
          $inc: {
            balance: ref.lockedAmount,
            lifeTimeBalance: ref.lockedAmount,
          },
        },
        { session }
      );

      // 8) mark referral unlocked
      ref.status = ReferralStatus.UNLOCKED;
      ref.unlockedAmount = ref.lockedAmount;
      ref.unlockedAt = new Date();
      await ref.save({ session });

      return { ok: true, unlocked: true, amount: ref.lockedAmount };
    });
  } finally {
    await session.endSession();
  }
};

const getMyReferrals = async (
  user: JwtPayload,
  query: Record<string, string>
) => {
  const IsUserExits = await User.findById(user?._id);
  if (!IsUserExits) {
    throw new AppError(StatusCodes.NOT_FOUND, "user not found");
  }

  const queryBuilder = new QueryBuilder(
    Referral.find({ referrerId: user?._id }),
    query
  );
  const referralData = queryBuilder.filter().sort().paginate();

  const [data, meta] = await Promise.all([
    referralData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getAllReferrals = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Referral.find(), query);

  const referralsData = queryBuilder
    .filter()
    .search(referralSearchableField)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    referralsData.build(),
    queryBuilder.getMeta(),
  ]);
  console.log(data);
  return {
    data,
    meta,
  };
};
//  get top referrals leaderboard data
// const leaderboard = async (user: JwtPayload) => {
//   const userData = await User.findById(user?._id).lean();
//   if (!userData) {
//     return { ok: false, message: "User not found" };
//   }

//   const leaderboardPipeline: PipelineStage[] = [
//     {
//       $group: {
//         _id: "$referrerId",
//         totalReferrals: { $sum: 1 },
//       },
//     },
//     {
//       $lookup: {
//         from: "users",
//         localField: "_id",
//         foreignField: "_id",
//         as: "user",
//       },
//     },
//     { $unwind: "$user" },
//     {
//       $project: {
//         _id: 1,
//         firstName: "$user.firstName",
//         lastName: "$user.lastName",
//         balance: { $ifNull: ["$user.balance", 0] },
//         totalReferrals: 1,
//       },
//     },
//     { $sort: { balance: -1, _id: 1 } },
//   ];

//   let top;
//   let myTotalReferrals;
//   let myRank;

//   // User-এর জন্য লজিক
//   if (userData.role === UserRole.USER) {
//     const limit = 100;
//     top = await Referral.aggregate([...leaderboardPipeline, { $limit: limit }]);

//     myTotalReferrals = await Referral.countDocuments({
//       referrerId: new mongoose.Types.ObjectId(userData._id),
//     });

//     myRank = top.findIndex((u) => u._id.equals(userData._id)) + 1;

//     return {
//       ok: true,
//       leaderboard: top,
//       me: {
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//         balance: userData.balance ?? 0,
//         totalReferrals: myTotalReferrals,
//         rank: myRank,
//       },
//     };
//   } else {
//     top = await Referral.aggregate(leaderboardPipeline);
//     myTotalReferrals = await Referral.countDocuments({
//       referrerId: new mongoose.Types.ObjectId(userData._id),
//     });

//     myRank = top.findIndex((u) => u._id.equals(userData._id)) + 1;
//     return {
//       ok: true,
//       leaderboard: top,
//     };
//   }
// };

export const leaderboard = async (user: JwtPayload) => {
  const userData = await User.findById(user?._id).lean();
  if (!userData) {
    return { ok: false, message: "User not found" };
  }

  // ====== Top by balance (users collection only) ======
  const limit = 100; // চাইলে কনফিগে রাখুন

  // টপ লিস্ট: balance DESC, _id ASC
  const top = await User.find(
    { role: UserRole.USER },
    { firstName: 1, lastName: 1, balance: 1 }
  )
    .sort({ balance: -1, _id: 1 })
    .limit(limit)
    .lean();

  // আমার rank হিসাব (same ordering logic: balance DESC, _id ASC)
  const myBalance = userData.balance ?? 0;

  const higher = await User.countDocuments({
    role: UserRole.USER,
    balance: { $gt: myBalance },
  });

  const equalBefore = await User.countDocuments({
    role: UserRole.USER,
    balance: myBalance,
    _id: { $lt: userData._id }, // tie হলে _id ছোট যাদের, তারা আগে
  });

  const myRank = higher + equalBefore + 1;

  return {
    ok: true,
    leaderboard: top,
    me: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      balance: myBalance,
      rank: myRank,
    },
  };
};

export const referralServices = {
  referralUnlocked,
  getMyReferrals,
  leaderboard,
  getAllReferrals,
};
