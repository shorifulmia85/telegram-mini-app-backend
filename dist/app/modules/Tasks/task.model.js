"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = require("mongoose");
const task_interface_1 = require("./task.interface");
const TaskSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String },
    imageUrl: { type: String },
    type: {
        type: String,
        enum: Object.values(task_interface_1.TaskType),
        index: true,
    },
    adNetwork: {
        type: String,
        enum: Object.values(task_interface_1.AdNetwork),
        index: true,
    },
    link: { type: String },
    adUnitId: { type: String },
    rewardCoin: { type: Number, required: true, min: 0, default: 1000 },
    cooldownSec: { type: Number, required: true, min: 0, default: 300 },
    perUserCap: { type: Number, required: true, min: 1, default: 15 },
    status: {
        type: String,
        enum: Object.values(task_interface_1.TaskStatus),
        default: task_interface_1.TaskStatus.ACTIVE,
        index: true,
    },
}, { timestamps: true, versionKey: false });
TaskSchema.index({ status: 1, activeFrom: 1, activeTo: 1 });
exports.Task = (0, mongoose_1.model)("Task", TaskSchema);
