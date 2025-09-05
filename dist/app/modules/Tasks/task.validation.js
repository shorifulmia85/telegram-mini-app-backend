"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskUpdateSchema = exports.TaskCreateSchema = exports.TaskType = exports.AdNetwork = exports.TaskStatus = void 0;
const zod_1 = require("zod");
exports.TaskStatus = zod_1.z.enum(["DRAFT", "ACTIVE", "PAUSED", "ENDED"]);
exports.AdNetwork = zod_1.z.enum([
    "NONE",
    "MONETAG",
    "ADSGRAM",
    "ONCLICKA",
    "GIGAPUB",
    "ADSENSE",
]);
exports.TaskType = zod_1.z.enum(["VIEW", "CLICK", "WATCH", "VISIT"]);
exports.TaskCreateSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "title is required").max(120),
    description: zod_1.z.string().max(500).optional(),
    imageUrl: zod_1.z.string().url().optional(),
    link: zod_1.z.string().optional(),
    type: exports.TaskType,
    adNetwork: exports.AdNetwork,
    adUnitId: zod_1.z.string().max(200).optional(),
    rewardCoin: zod_1.z.number().int().min(0),
    cooldownSec: zod_1.z.number().int().min(0),
    perUserCap: zod_1.z.number().int().min(1).default(15),
    dailyPerUserCap: zod_1.z.number().int().min(1).optional(),
    status: exports.TaskStatus.default("ACTIVE"),
});
// .superRefine((v, ctx) => {
//   if (v.adNetwork !== "NONE" && !v.adUnitId) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       path: ["adUnitId"],
//       message: "adUnitId is required when adNetwork is not NONE",
//     });
//   }
// });
// update এ ফর্ম/JSON থেকে string নাম্বার আসতে পারে—coerce করলে সুবিধা
const toInt = zod_1.z.coerce.number().int();
const toIntG0 = toInt.min(0);
const toIntG1 = toInt.min(1);
exports.TaskUpdateSchema = zod_1.z
    .object({
    title: zod_1.z.string().min(1).max(120).optional(),
    description: zod_1.z.string().max(500).optional().nullable(),
    imageUrl: zod_1.z.string().url().optional().nullable(),
    link: zod_1.z.string().optional(),
    type: exports.TaskType.optional(),
    adNetwork: exports.AdNetwork.optional(),
    // clear করার সুবিধা: ""/null দিলে পরে controller এ $unset করব
    adUnitId: zod_1.z
        .union([zod_1.z.string().max(200), zod_1.z.literal(""), zod_1.z.null()])
        .optional(),
    rewardCoin: toIntG0.optional(),
    cooldownSec: toIntG0.optional(),
    perUserCap: toIntG1.optional(),
    dailyPerUserCap: toIntG1.optional(),
    status: exports.TaskStatus.optional(),
})
    .strict()
    .superRefine((v, ctx) => {
    // 1) খালি বডি রিজেক্ট
    if (Object.keys(v).length === 0) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["_root"],
            message: "At least one field is required to update",
        });
    }
    // 2) adNetwork দিলে এবং NONE না হলে adUnitId আবশ্যক (empty নয়)
    if (v.adNetwork && v.adNetwork !== "NONE") {
        const u = v.adUnitId;
        const empty = u === undefined || u === null || u === "";
        if (empty) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["adUnitId"],
                message: "adUnitId is required when adNetwork is not NONE",
            });
        }
    }
});
