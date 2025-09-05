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
exports.checkAuth = void 0;
const appErrors_1 = require("../Errors/appErrors");
const http_status_codes_1 = require("http-status-codes");
const verifyToken_1 = require("../ulits/verifyToken");
const config_1 = require("../config");
const IsUserExits_1 = require("../ulits/IsUserExits");
const checkAuth = (...roles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = req.cookies.accessToken || req.headers.authorization;
        if (!accessToken) {
            throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.FORBIDDEN, "No accessToken provide");
        }
        const verifiedToken = (0, verifyToken_1.verifyToken)(accessToken, config_1.envVars.jWT_SECRET);
        yield (0, IsUserExits_1.checkUserIsValid)("tgId", verifiedToken === null || verifiedToken === void 0 ? void 0 : verifiedToken.tgId);
        if (!roles.includes(verifiedToken.role)) {
            throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.UNAUTHORIZED, "unauthorized");
        }
        req.user = verifiedToken;
        next();
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
exports.checkAuth = checkAuth;
