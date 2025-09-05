import { z } from "zod";

export const TaskStatus = z.enum(["DRAFT", "ACTIVE", "PAUSED", "ENDED"]);
export const AdNetwork = z.enum([
  "NONE",
  "MONETAG",
  "ADSGRAM",
  "ONCLICKA",
  "GIGAPUB",
  "ADSENSE",
]);
export const TaskType = z.enum(["VIEW", "CLICK", "WATCH", "VISIT"]);

export const TaskCreateSchema = z.object({
  title: z.string().min(1, "title is required").max(120),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  link: z.string().optional(),
  type: TaskType,
  adNetwork: AdNetwork,
  adUnitId: z.string().max(200).optional(),

  rewardCoin: z.number().int().min(0),
  cooldownSec: z.number().int().min(0),

  perUserCap: z.number().int().min(1).default(15),
  dailyPerUserCap: z.number().int().min(1).optional(),

  status: TaskStatus.default("ACTIVE"),
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
const toInt = z.coerce.number().int();
const toIntG0 = toInt.min(0);
const toIntG1 = toInt.min(1);

export const TaskUpdateSchema = z
  .object({
    title: z.string().min(1).max(120).optional(),
    description: z.string().max(500).optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
    link: z.string().optional(),
    type: TaskType.optional(),
    adNetwork: AdNetwork.optional(),

    // clear করার সুবিধা: ""/null দিলে পরে controller এ $unset করব
    adUnitId: z
      .union([z.string().max(200), z.literal(""), z.null()])
      .optional(),

    rewardCoin: toIntG0.optional(),
    cooldownSec: toIntG0.optional(),

    perUserCap: toIntG1.optional(),
    dailyPerUserCap: toIntG1.optional(),

    status: TaskStatus.optional(),
  })
  .strict()
  .superRefine((v, ctx) => {
    // 1) খালি বডি রিজেক্ট
    if (Object.keys(v).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
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
          code: z.ZodIssueCode.custom,
          path: ["adUnitId"],
          message: "adUnitId is required when adNetwork is not NONE",
        });
      }
    }
  });
