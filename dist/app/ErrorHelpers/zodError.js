"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodError = void 0;
const http_status_codes_1 = require("http-status-codes");
/* eslint-disable @typescript-eslint/no-explicit-any */
const zodError = (err) => {
    var _a;
    const errorSources = [];
    (_a = err === null || err === void 0 ? void 0 : err.issues) === null || _a === void 0 ? void 0 : _a.forEach((issue) => {
        errorSources.push({
            path: issue === null || issue === void 0 ? void 0 : issue.path,
            message: issue === null || issue === void 0 ? void 0 : issue.message,
        });
    });
    return {
        success: false,
        statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
        message: "Zod error",
        errorSources,
    };
};
exports.zodError = zodError;
