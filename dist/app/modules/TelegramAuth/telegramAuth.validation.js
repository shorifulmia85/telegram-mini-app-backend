"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramUserSchema = void 0;
const zod_1 = require("zod");
exports.TelegramUserSchema = zod_1.z.object({
    tgId: zod_1.z.number(),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().optional(),
    userName: zod_1.z.string().optional(),
    photo: zod_1.z.string().url().optional(),
    startParam: zod_1.z.string().optional(),
});
