"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteTask = void 0;
const mongoose_1 = require("mongoose");
const taskCompleteSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    taskId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Task",
        required: true,
        index: true,
    },
    dayKey: { type: String, required: true },
    count: { type: Number, default: 0 },
    lastAt: { type: Date, default: null },
}, { timestamps: true });
taskCompleteSchema.index({ userId: 1, taskId: 1 }, { unique: true });
taskCompleteSchema.index({ userId: 1, taskId: 1, dayKey: 1 }, { unique: true });
exports.CompleteTask = (0, mongoose_1.model)("CompleteTask", taskCompleteSchema);
