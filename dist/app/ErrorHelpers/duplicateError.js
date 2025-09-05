"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMongooseDuplicateError = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const handleMongooseDuplicateError = (err) => {
    const duplicateMatch = err.message.match(/"([^"]*)"/);
    const duplicate = duplicateMatch ? duplicateMatch[1] : "Field";
    return {
        success: false,
        statusCode: 400,
        message: duplicate,
    };
};
exports.handleMongooseDuplicateError = handleMongooseDuplicateError;
