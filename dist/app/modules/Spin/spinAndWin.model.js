"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinAndWin = void 0;
const mongoose_1 = require("mongoose");
const spinAndWinSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    idempotencyKey: { type: String, required: true },
    prizeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Spin",
        required: true,
    },
    prizeValue: { type: String, required: true },
    coin: { type: Number, required: true },
    segmentIndex: { type: Number, required: true },
    displayAngle: { type: Number, required: true, min: 0, max: 360 },
}, { timestamps: { createdAt: true, updatedAt: false } });
spinAndWinSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });
exports.SpinAndWin = (0, mongoose_1.model)("SpinAndWinSchema", spinAndWinSchema);
