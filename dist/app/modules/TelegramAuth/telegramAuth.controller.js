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
exports.telegramAuthController = void 0;
const http_status_codes_1 = require("http-status-codes");
const sendResponse_1 = require("../../ulits/sendResponse");
const sdk_1 = require("@telegram-apps/sdk");
const init_data_node_1 = require("@telegram-apps/init-data-node");
const appErrors_1 = require("../../Errors/appErrors");
const catchAsynce_1 = require("../../ulits/catchAsynce");
const telegramAuth_service_1 = require("./telegramAuth.service");
const config_1 = require("../../config");
const authCookite_1 = require("../../ulits/authCookite");
const getMe = (0, catchAsynce_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield telegramAuth_service_1.telegramAuthServices.getMe(user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Profile data get successfully",
        data: result,
    });
}));
const createUserOrLogin = (0, catchAsynce_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const { initData } = req.body;
    //console.log(initData);
    if (!initData) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, "initData is required");
    }
    // 1) Verify Telegram initData (hash + age limit)
    (0, init_data_node_1.validate)(initData, config_1.envVars.TELEGRAM_BOT_TOKEN, {
        expiresIn: Number((_a = config_1.envVars.INITDATA_MAX_AGE_SEC) !== null && _a !== void 0 ? _a : 86400), // e.g., 1 day
    });
    // 2) Parse everything from initData
    const parsed = (0, sdk_1.parseInitDataQuery)(initData);
    const startParam = ((_c = (_b = parsed.startParam) !== null && _b !== void 0 ? _b : parsed.start_param) !== null && _c !== void 0 ? _c : null) || null;
    if (!((_d = parsed === null || parsed === void 0 ? void 0 : parsed.user) === null || _d === void 0 ? void 0 : _d.id)) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid initData: user missing");
    }
    // 3) Client IP (optional analytics)
    const userIp = ((_f = (_e = req.headers["x-forwarded-for"]) === null || _e === void 0 ? void 0 : _e.split(",")[0]) === null || _f === void 0 ? void 0 : _f.trim()) ||
        req.socket.remoteAddress ||
        undefined;
    // 4) Prepare payload for service
    const payload = {
        tgId: parsed.user.id,
        userName: parsed.user.username,
        firstName: parsed.user.first_name,
        lastName: parsed.user.last_name,
        photo: (_g = parsed === null || parsed === void 0 ? void 0 : parsed.user) === null || _g === void 0 ? void 0 : _g.photo_url,
        startParam,
        ip: userIp,
    };
    const result = yield telegramAuth_service_1.telegramAuthServices.createUserORrLogin(payload);
    (0, authCookite_1.authCookie)(res, result);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: "User created successfully",
        data: result,
    });
}));
exports.telegramAuthController = { createUserOrLogin, getMe };
