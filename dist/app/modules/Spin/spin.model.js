"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spin = void 0;
const mongoose_1 = require("mongoose");
const SpinSchema = new mongoose_1.Schema({
    value: { type: String, required: true, index: true },
    textColor: { type: String, required: true },
    bgColor: { type: String, required: true },
    coin: { type: Number, required: true },
    weight: { type: Number, required: true },
    active: { type: Boolean, default: true },
    segmentIndex: { type: Number, required: true },
}, {
    versionKey: false,
    timestamps: true,
});
exports.Spin = (0, mongoose_1.model)("Spin", SpinSchema);
