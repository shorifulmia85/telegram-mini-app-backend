"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const appErrors_1 = require("../Errors/appErrors");
const http_status_codes_1 = require("http-status-codes");
const duplicateError_1 = require("../ErrorHelpers/duplicateError");
const validationError_1 = require("../ErrorHelpers/validationError");
const zodError_1 = require("../ErrorHelpers/zodError");
const globalErrorHandler = (err, req, res, next) => {
    let message = "something went wrong";
    let statusCode = 500;
    let errorSources = [];
    if (err instanceof Error) {
        message = err.message;
        statusCode = 500;
    }
    if (err instanceof appErrors_1.AppError) {
        message = err.message;
        statusCode = err.statusCode;
    }
    if (err.code === 11000) {
        // ✅ Mongoose duplicate error handle
        const simplifiedError = (0, duplicateError_1.handleMongooseDuplicateError)(err);
        statusCode = 400;
        message = `${simplifiedError.message} already exists!!`;
    }
    // ✅ Mongoose validationError handle
    if (err.name === "ValidationError") {
        const simplifiedError = (0, validationError_1.handleValidationError)(err);
        statusCode = simplifiedError.statusCode;
        errorSources = simplifiedError.errorSources;
        message = simplifiedError.message;
    }
    if (err.name === "ZodError") {
        const simplifiedError = (0, zodError_1.zodError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    if (err.name === "TokenExpiredError") {
        statusCode = http_status_codes_1.StatusCodes.UNAUTHORIZED;
        message = "token expired, please again login ";
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: process.env.NODE_ENV === "development" ? err : null,
        // stack: envVars.NODE_ENV === "development" ? err.stack : null,
    });
};
exports.globalErrorHandler = globalErrorHandler;
