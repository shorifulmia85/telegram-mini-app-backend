"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeTaskService = void 0;
const task_model_1 = require("../Tasks/task.model");
const appErrors_1 = require("../../Errors/appErrors");
const http_status_codes_1 = require("http-status-codes");
const completeTask_model_1 = require("./completeTask.model");
const telegramAuth_model_1 = require("../TelegramAuth/telegramAuth.model");
const toDayKeyUTC = (d = new Date()) => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`; // e.g. 2025-09-07
};
const taskCompleted = (id, user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const taskData = yield task_model_1.Task.findById(id);
    if (!taskData)
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "no task data found");
    const userData = yield telegramAuth_model_1.User.findById(user === null || user === void 0 ? void 0 : user._id);
    if (!userData)
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.UNAUTHORIZED, "user not found");
    const perUserCap = Number((_a = taskData.perUserCap) !== null && _a !== void 0 ? _a : 0) || 0;
    const reward = Number((_b = taskData.rewardCoin) !== null && _b !== void 0 ? _b : 0) || 0;
    const dayKey = toDayKeyUTC();
    // 1) আজকের ডক আছে কিনা দেখে CAP চেক
    const todayDoc = yield completeTask_model_1.CompleteTask.findOne({
        userId: user === null || user === void 0 ? void 0 : user._id,
        taskId: id,
        dayKey,
    });
    if (todayDoc && perUserCap > 0 && ((_c = todayDoc.count) !== null && _c !== void 0 ? _c : 0) >= perUserCap) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Today limit reached");
    }
    // 2) থাকলে +1, না থাকলে নতুন ডক (upsert) —> ঠিক এইটাই তোমার চাওয়া
    const filter = { userId: user === null || user === void 0 ? void 0 : user._id, taskId: id, dayKey };
    const update = {
        $inc: { count: 1 },
        $set: { lastAt: new Date() },
        $setOnInsert: { userId: user === null || user === void 0 ? void 0 : user._id, taskId: id, dayKey }, // count এখানে দিচ্ছি না (conflict এড়াতে)
    };
    let updated = yield completeTask_model_1.CompleteTask.findOneAndUpdate(filter, update, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true, // schema default গুলো বসবে
    }).catch((e) => __awaiter(void 0, void 0, void 0, function* () {
        // concurrent upsert হলে ডুপ্লিকেট হতে পারে—একবার রিট্রাই
        if ((e === null || e === void 0 ? void 0 : e.code) === 11000) {
            return completeTask_model_1.CompleteTask.findOneAndUpdate(filter, update, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            });
        }
        throw e;
    }));
    // 3) রেস কন্ডিশনে CAP ক্রস হলে 1 কমিয়ে ব্লক
    if (perUserCap > 0 && updated.count > perUserCap) {
        yield completeTask_model_1.CompleteTask.updateOne(filter, { $inc: { count: -1 } });
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Today limit reached");
    }
    // 4) ব্যালেন্স আপডেট
    userData.balance = Number((_d = userData.balance) !== null && _d !== void 0 ? _d : 0) + reward;
    yield userData.save();
    return updated;
});
exports.completeTaskService = { taskCompleted };
