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
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralController = void 0;
const catchAsynce_1 = require("../../ulits/catchAsynce");
const sendResponse_1 = require("../../ulits/sendResponse");
const http_status_codes_1 = require("http-status-codes");
const referral_service_1 = require("./referral.service");
const referralUnlocked = (0, catchAsynce_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const user = req.user;
    const result = yield referral_service_1.referralServices.referralUnlocked(id, user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Success",
        data: result,
    });
}));
const getMyReferrals = (0, catchAsynce_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield referral_service_1.referralServices.getMyReferrals(user, req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "referral data get successfully",
        data: result === null || result === void 0 ? void 0 : result.data,
        meta: result === null || result === void 0 ? void 0 : result.meta,
    });
}));
const getAllReferrals = (0, catchAsynce_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield referral_service_1.referralServices.getAllReferrals(req === null || req === void 0 ? void 0 : req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "get all referrals data successfully",
        data: result === null || result === void 0 ? void 0 : result.data,
        meta: result === null || result === void 0 ? void 0 : result.meta,
    });
}));
const leaderboard = (0, catchAsynce_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield referral_service_1.referralServices.leaderboard(user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "leaderboard data successfully",
        data: result,
    });
}));
exports.referralController = {
    referralUnlocked,
    getMyReferrals,
    getAllReferrals,
    leaderboard,
};
