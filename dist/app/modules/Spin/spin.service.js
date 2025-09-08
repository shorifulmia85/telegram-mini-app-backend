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
exports.spinServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const appErrors_1 = require("../../Errors/appErrors");
const spin_model_1 = require("./spin.model");
const mongoose_1 = __importDefault(require("mongoose"));
const telegramAuth_model_1 = require("../TelegramAuth/telegramAuth.model");
const spin_1 = require("../../ulits/spin");
const spinAndWin_model_1 = require("./spinAndWin.model");
const createSpin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExists = yield spin_model_1.Spin.findOne({ segmentIndex: payload === null || payload === void 0 ? void 0 : payload.segmentIndex });
    if (isExists) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.CONFLICT, "Already exists");
    }
    const NUM_SEGMENTS = 10;
    if (payload.segmentIndex < 0 || payload.segmentIndex >= NUM_SEGMENTS) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, `segmentIndex must be 0..${NUM_SEGMENTS - 1}`);
    }
    // 2) value/coin/weight sanity
    if (payload.coin < 0)
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, "coin must be >= 0");
    if (payload.weight < 0)
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, "weight must be >= 0");
    if (!payload.bgColor || !payload.textColor) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, "bgColor/textColor required");
    }
    return yield spin_model_1.Spin.create(payload);
});
const getAllSpin = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield spin_model_1.Spin.find();
    if (!result) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "No data found");
    }
    return result;
});
// services/spin.service.ts
const spinAndWin = (opts) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        return yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            // 1) লোড সক্রিয় সেগমেন্ট + weighted pick
            const segments = yield spin_model_1.Spin.find({ active: true })
                .sort({ segmentIndex: 1 })
                .session(session);
            if (!segments.length)
                throw new Error("No segments configured");
            const idx = (0, spin_1.pickWeighted)(segments);
            const chosen = segments[idx];
            const displayAngle = (0, spin_1.angleForTopPointer)(idx, segments.length);
            // 2) ডাবল-ক্লিক গার্ড: একই userId + idempotencyKey থাকলে থামান
            const dup = yield spinAndWin_model_1.SpinAndWin.findOne({
                userId: opts.userId,
                idempotencyKey: opts.idempotencyKey,
            }).session(session);
            if (dup)
                return {
                    spinId: String(dup._id),
                    displayAngle: dup.displayAngle,
                    prize: {
                        value: dup.prizeValue,
                        coin: dup.coin,
                        segmentIndex: dup.segmentIndex,
                    },
                    createdAt: dup.createdAt,
                    // balance পাঠাতে চাইলে নিচে ইনক্রিমেন্ট করবেন না (আগেই ক্রেডিট হয়েছিল)
                };
            // 3) Spin ডকুমেন্ট তৈরি
            const spin = yield spinAndWin_model_1.SpinAndWin.create([
                {
                    userId: opts.userId,
                    idempotencyKey: opts.idempotencyKey,
                    prizeId: chosen._id,
                    prizeValue: chosen.value,
                    coin: chosen.coin,
                    segmentIndex: chosen.segmentIndex,
                    displayAngle,
                },
            ], { session }).then((r) => r[0]);
            // 4) ইউজারের ব্যালান্সে ক্রেডিট (atomic $inc) এবং আপডেটেড ব্যালান্স নিন
            const updatedUser = yield telegramAuth_model_1.User.findByIdAndUpdate(opts.userId, { $inc: { balance: chosen.coin, lifeTimeBalance: chosen.coin } }, { new: true, session });
            const balanceAfter = (_a = updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.balance) !== null && _a !== void 0 ? _a : undefined;
            const lifeTimeBalanceAfter = (_b = updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.lifeTimeBalance) !== null && _b !== void 0 ? _b : undefined;
            // 6) রেসপন্স
            return {
                spinId: String(spin._id),
                displayAngle,
                prize: {
                    value: chosen.value,
                    coin: chosen.coin,
                    segmentIndex: chosen.segmentIndex,
                },
                balance: balanceAfter,
                lifeTimeBalance: lifeTimeBalanceAfter,
                createdAt: spin.createdAt,
            };
        }));
    }
    finally {
        session.endSession();
    }
});
exports.spinServices = {
    createSpin,
    getAllSpin,
    spinAndWin,
};
