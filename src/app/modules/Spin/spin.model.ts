import { InferSchemaType, model, Schema } from "mongoose";
import { ISpin } from "./spin.interface";

const SpinSchema = new Schema<ISpin>(
  {
    value: { type: String, required: true, index: true },
    textColor: { type: String, required: true },
    bgColor: { type: String, required: true },
    coin: { type: Number, required: true },
    weight: { type: Number, required: true },
    active: { type: Boolean, default: true },
    segmentIndex: { type: Number, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const Spin = model("Spin", SpinSchema);
