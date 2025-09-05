import { z } from "zod";

export const TelegramUserSchema = z.object({
  tgId: z.number(),
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  userName: z.string().optional(),
  photo: z.string().url().optional(),
  startParam: z.string().optional(),
});
