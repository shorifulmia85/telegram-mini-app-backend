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
exports.checkUserIsValid = void 0;
const http_status_codes_1 = require("http-status-codes");
const appErrors_1 = require("../Errors/appErrors");
const telegramAuth_model_1 = require("../modules/TelegramAuth/telegramAuth.model");
const telegramAuth_interface_1 = require("../modules/TelegramAuth/telegramAuth.interface");
const checkUserIsValid = (CField, value) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        [CField]: value,
    };
    let user;
    if (CField === "_id") {
        user = yield telegramAuth_model_1.User.findById(payload);
    }
    user = yield telegramAuth_model_1.User.findOne(payload);
    if (!user) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found");
    }
    if (user && user.status === telegramAuth_interface_1.IAuthStatus.BLOCKED) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Your account is blocked");
    }
    if (user && user.status === telegramAuth_interface_1.IAuthStatus.INACTIVE) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Your account paused...because you're long inactive");
    }
    if (user && user.isDeleted) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Your account is deleted");
    }
    return user;
});
exports.checkUserIsValid = checkUserIsValid;
