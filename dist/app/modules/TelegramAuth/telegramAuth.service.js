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
exports.telegramAuthServices = void 0;
// src/modules/TelegramAuth/telegramAuth.service.ts
const mongoose_1 = __importDefault(require("mongoose"));
const http_status_codes_1 = require("http-status-codes");
const config_1 = require("../../config");
const appErrors_1 = require("../../Errors/appErrors");
const generateToken_1 = require("../../ulits/generateToken");
const referLinkGenerator_1 = require("../../ulits/referLinkGenerator");
const referral_1 = require("../../ulits/referral");
const telegramAuth_interface_1 = require("./telegramAuth.interface");
const telegramAuth_model_1 = require("./telegramAuth.model");
const referral_model_1 = require("../Referral/referral.model");
const createUserORrLogin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(payload === null || payload === void 0 ? void 0 : payload.tgId)) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, "tgId is required");
    }
    // ---------- Check for existing user first (before any transaction) ----------
    const existing = yield telegramAuth_model_1.User.findOne({ tgId: payload.tgId });
    if (existing) {
        if (existing.status === telegramAuth_interface_1.IAuthStatus.BLOCKED ||
            existing.status === telegramAuth_interface_1.IAuthStatus.INACTIVE) {
            throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, `user ${existing.status}`);
        }
        if (existing.isDeleted) {
            throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.LOCKED, "user is deleted");
        }
        const tokenPayload = {
            tgId: existing.tgId,
            _id: existing._id,
            role: existing.role,
        };
        const accessToken = (0, generateToken_1.generateToken)(tokenPayload, config_1.envVars.jWT_SECRET, config_1.envVars.JWT_EXPIRES_IN);
        const refreshToken = (0, generateToken_1.generateToken)(tokenPayload, config_1.envVars.jWT_REFRESH_SECRET, config_1.envVars.jWT_REFRESH_EXPIRES_IN);
        return { accessToken, refreshToken, isNew: false };
    }
    // ---------- CREATE (with transaction and retry logic) ----------
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // Re-check for existing user inside the transaction to prevent race conditions
            const userExistsInTransaction = yield telegramAuth_model_1.User.findOne({ tgId: payload.tgId }, null, { session });
            if (userExistsInTransaction) {
                // If another process already created the user, log them in instead
                yield session.commitTransaction(); // Commit to release locks
                session.endSession();
                return createUserORrLogin(payload); // Recursive call to handle login flow
            }
            let accessToken = "";
            let refreshToken = "";
            const referCode = (0, referral_1.makeReferralCode)();
            const referLink = (0, referLinkGenerator_1.buildReferralLink)(config_1.envVars.TELEGRAM_BOT_USERNAME, referCode);
            const [newUser] = yield telegramAuth_model_1.User.create([
                Object.assign(Object.assign({}, payload), { referCode,
                    referLink }),
            ], { session });
            if (payload === null || payload === void 0 ? void 0 : payload.startParam) {
                const referrer = yield telegramAuth_model_1.User.findOne({ referCode: payload.startParam }, null, { session });
                if (!referrer) {
                    throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, "invalid refer code");
                }
                if (String(referrer._id) === String(newUser._id)) {
                    throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, "self referral not allowed");
                }
                yield referral_model_1.Referral.create([
                    {
                        referrerId: referrer._id,
                        referredId: newUser._id,
                        codeUsed: payload.startParam,
                        status: referral_model_1.ReferralStatus.PENDING,
                        lockedAmount: 10000,
                    },
                ], { session });
                yield telegramAuth_model_1.User.updateOne({ _id: newUser._id }, { $set: { referred_by: referrer._id } }, { session });
            }
            const tokenPayload = {
                tgId: newUser.tgId,
                _id: newUser._id,
                role: newUser.role,
            };
            accessToken = (0, generateToken_1.generateToken)(tokenPayload, config_1.envVars.jWT_SECRET, config_1.envVars.JWT_EXPIRES_IN);
            refreshToken = (0, generateToken_1.generateToken)(tokenPayload, config_1.envVars.jWT_REFRESH_SECRET, config_1.envVars.jWT_REFRESH_EXPIRES_IN);
            yield session.commitTransaction();
            session.endSession();
            return { accessToken, refreshToken, isNew: true };
        }
        catch (err) {
            yield session.abortTransaction();
            session.endSession();
            if (err.message.includes("Please retry your operation or multi-document transaction")) {
                console.warn(`Transient transaction error detected. Retrying... (Attempt ${i + 1}/${maxRetries})`);
                continue;
            }
            else {
                throw err;
            }
        }
    }
    throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Transaction failed after multiple retries.");
});
const getMe = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield telegramAuth_model_1.User.findById(user === null || user === void 0 ? void 0 : user._id);
    if (!isUserExist) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "user not found");
    }
    return isUserExist;
});
exports.telegramAuthServices = { createUserORrLogin, getMe };
