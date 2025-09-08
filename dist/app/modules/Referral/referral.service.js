"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralServices = exports.leaderboard = void 0;
// services/referral.unlock.ts
const mongoose_1 = __importDefault(require("mongoose"));
const referral_model_1 = require("./referral.model");
const telegramAuth_model_1 = require("../TelegramAuth/telegramAuth.model");
const appErrors_1 = require("../../Errors/appErrors");
const http_status_codes_1 = require("http-status-codes");
const IsUserExits_1 = require("../../ulits/IsUserExits");
const queryBuilder_1 = require("../../ulits/queryBuilder");
const referral_constant_1 = require("./referral.constant");
const telegramAuth_interface_1 = require("../TelegramAuth/telegramAuth.interface");
const referralUnlocked = (referralId, authUser) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        return yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            // 1) auth user exists?
            const referrer = yield telegramAuth_model_1.User.findById(authUser === null || authUser === void 0 ? void 0 : authUser._id).session(session);
            if (!referrer) {
                throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "user not found");
            }
            // 2) referral exists?
            const ref = yield referral_model_1.Referral.findById(referralId).session(session);
            if (!ref) {
                throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, "invalid request");
            }
            // 3) ownership check: only owner can unlock
            if (String(ref.referrerId) !== String(referrer._id)) {
                throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.FORBIDDEN, "not your referral");
            }
            // 4) idempotency
            if (ref.status === (referral_model_1.ReferralStatus === null || referral_model_1.ReferralStatus === void 0 ? void 0 : referral_model_1.ReferralStatus.UNLOCKED)) {
                throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Already claimed");
            }
            if (ref.status === (referral_model_1.ReferralStatus === null || referral_model_1.ReferralStatus === void 0 ? void 0 : referral_model_1.ReferralStatus.REJECTED)) {
                throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, "referral rejected");
            }
            // 5) referred user exists & valid?
            const referred = yield telegramAuth_model_1.User.findById(ref.referredId).session(session);
            if (!referred) {
                throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "referred user not found");
            }
            // আপনার কাস্টম ভ্যালিডেশন (সেশন সহ কল করুন, চাইলে helper-এ session পাস করুন)
            yield (0, IsUserExits_1.checkUserIsValid)("_id", referred._id);
            // 6) eligibility check (আপনার বিজনেস রুল)
            // উদাহরণ: referred.balance >= lockedAmount  (আপনি যেমন লিখেছিলেন)
            const okActivity = ((_a = referred.balance) !== null && _a !== void 0 ? _a : 0) >= ((_b = ref.lockedAmount) !== null && _b !== void 0 ? _b : 0);
            if (!okActivity) {
                throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.NOT_ACCEPTABLE, "not eligible yet");
            }
            // 7) apply bonus atomically (✅ $inc ডেল্টা নেয়)
            yield telegramAuth_model_1.User.updateOne({ _id: referrer._id }, {
                $inc: {
                    balance: ref.lockedAmount,
                    lifeTimeBalance: ref.lockedAmount,
                    referIncome: ref === null || ref === void 0 ? void 0 : ref.lockedAmount,
                },
            }, { session });
            // 8) mark referral unlocked
            ref.status = referral_model_1.ReferralStatus.UNLOCKED;
            ref.unlockedAmount = ref.lockedAmount;
            ref.unlockedAt = new Date();
            yield ref.save({ session });
            return { ok: true, unlocked: true, amount: ref.lockedAmount };
        }));
    }
    finally {
        yield session.endSession();
    }
});
const getMyReferrals = (user, query) => __awaiter(void 0, void 0, void 0, function* () {
    const me = yield telegramAuth_model_1.User.findById(user === null || user === void 0 ? void 0 : user._id).lean();
    if (!me)
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "user not found");
    // চাইলে Referral ডক থেকে কোন কোন ফিল্ড নেবেন তা select() দিয়ে সীমিত করুন
    const baseQuery = referral_model_1.Referral.find({ referrerId: user === null || user === void 0 ? void 0 : user._id })
        .select("_id referrerId referredId status lockedAmount unlockedAmount createdAt updatedAt ")
        .populate({
        path: "referredId",
        model: "User",
        select: "firstName lastName photo balance",
    });
    const qb = new queryBuilder_1.QueryBuilder(baseQuery, query);
    const built = qb.filter().sort().build().lean();
    const [data, meta] = yield Promise.all([built.exec(), qb.getMeta()]);
    //  Referral ডক + populated user info একসাথে রিটার্ন
    const shaped = data.map((doc) => {
        var _a, _b, _c, _d, _e, _f;
        const ref = doc.referredId;
        const referred = ref && typeof ref === "object" && "_id" in ref
            ? {
                _id: ref._id,
                firstName: (_a = ref.firstName) !== null && _a !== void 0 ? _a : null,
                lastName: (_b = ref.lastName) !== null && _b !== void 0 ? _b : null,
                photo: (_c = ref.photo) !== null && _c !== void 0 ? _c : null,
                balance: (_d = ref.balance) !== null && _d !== void 0 ? _d : null,
            }
            : {
                _id: ref !== null && ref !== void 0 ? ref : null,
                firstName: null,
                lastName: null,
                photo: null,
                balance: null,
            };
        return {
            _id: doc._id,
            referrerId: doc.referrerId,
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            lockedAmount: (_e = doc.lockedAmount) !== null && _e !== void 0 ? _e : null,
            unlockedAmount: (_f = doc.unlockedAmount) !== null && _f !== void 0 ? _f : null,
            //  Referred user info
            referred,
        };
    });
    return { data: shaped, meta };
});
const getAllReferrals = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new queryBuilder_1.QueryBuilder(referral_model_1.Referral.find(), query);
    const referralsData = queryBuilder
        .filter()
        .search(referral_constant_1.referralSearchableField)
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        referralsData.build(),
        queryBuilder.getMeta(),
    ]);
    console.log(data);
    return {
        data,
        meta,
    };
});
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
const leaderboard = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userData = yield telegramAuth_model_1.User.findById(user === null || user === void 0 ? void 0 : user._id).lean();
    if (!userData) {
        return { ok: false, message: "User not found" };
    }
    // ====== Top by balance (users collection only) ======
    const limit = 100; // চাইলে কনফিগে রাখুন
    // টপ লিস্ট: balance DESC, _id ASC
    const top = yield telegramAuth_model_1.User.find({ role: telegramAuth_interface_1.UserRole.USER }, { firstName: 1, lastName: 1, balance: 1 })
        .sort({ balance: -1, _id: 1 })
        .limit(limit)
        .lean();
    // আমার rank হিসাব (same ordering logic: balance DESC, _id ASC)
    const myBalance = (_a = userData.balance) !== null && _a !== void 0 ? _a : 0;
    const higher = yield telegramAuth_model_1.User.countDocuments({
        role: telegramAuth_interface_1.UserRole.USER,
        balance: { $gt: myBalance },
    });
    const equalBefore = yield telegramAuth_model_1.User.countDocuments({
        role: telegramAuth_interface_1.UserRole.USER,
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
});
exports.leaderboard = leaderboard;
exports.referralServices = {
    referralUnlocked,
    getMyReferrals,
    leaderboard: exports.leaderboard,
    getAllReferrals,
};
