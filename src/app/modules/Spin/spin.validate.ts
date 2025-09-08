import z from "zod";

export const spinValidationSchema = z.object({
  value: z.string(),
  bgColor: z.string(),
  textColor: z.string(),
  coin: z.number(),
  weight: z.number(),
  segmentIndex: z.number(),
});
