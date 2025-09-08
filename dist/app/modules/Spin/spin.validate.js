"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spinValidationSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.spinValidationSchema = zod_1.default.object({
    value: zod_1.default.string(),
    bgColor: zod_1.default.string(),
    textColor: zod_1.default.string(),
    coin: zod_1.default.number(),
    weight: zod_1.default.number(),
    segmentIndex: zod_1.default.number(),
});
