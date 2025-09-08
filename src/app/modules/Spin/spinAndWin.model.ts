import { InferSchemaType, model, Schema } from "mongoose";

const spinAndWinSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    idempotencyKey: { type: String, required: true },
    prizeId: {
      type: Schema.Types.ObjectId,
      ref: "Spin",
      required: true,
    },
    prizeValue: { type: String, required: true },
    coin: { type: Number, required: true },
    segmentIndex: { type: Number, required: true },
    displayAngle: { type: Number, required: true, min: 0, max: 360 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

spinAndWinSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });
export type SpinDoc = InferSchemaType<typeof spinAndWinSchema>;
export const SpinAndWin = model("SpinAndWinSchema", spinAndWinSchema);
