"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Referral = exports.ReferralStatus = void 0;
const mongoose_1 = require("mongoose");
var ReferralStatus;
(function (ReferralStatus) {
    ReferralStatus["PENDING"] = "PENDING";
    ReferralStatus["UNLOCKED"] = "UNLOCKED";
    ReferralStatus["REJECTED"] = "REJECTED";
})(ReferralStatus || (exports.ReferralStatus = ReferralStatus = {}));
const referralSchema = new mongoose_1.Schema({
    referrerId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    referredId: {
        type: mongoose_1.Types.ObjectId,
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
}, { timestamps: true });
exports.Referral = (0, mongoose_1.model)("Referral", referralSchema);
