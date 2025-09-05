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
exports.clearCookie = exports.authCookie = void 0;
const authCookie = (res, token) => {
    if (token.accessToken) {
        res.cookie("accessToken", token.accessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });
    }
    if (token.refreshToken) {
        res.cookie("refreshToken", token.refreshToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });
    }
};
exports.authCookie = authCookie;
const clearCookie = (res, tokenName) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie(tokenName, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
    });
});
exports.clearCookie = clearCookie;
