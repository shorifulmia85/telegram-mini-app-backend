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
const taskCompleted = (id, user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const taskData = yield task_model_1.Task.findById(id);
    if (!taskData) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "no task data found");
    }
    const userData = yield telegramAuth_model_1.User.findById(user === null || user === void 0 ? void 0 : user._id);
    const now = new Date();
    // আজকের তারিখ UTC হিসেবে বের করবো
    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth();
    const utcDate = now.getUTCDate();
    // UTC 00:00:00 থেকে UTC 23:59:59.999 পর্যন্ত
    const startUtc = new Date(Date.UTC(utcYear, utcMonth, utcDate, 0, 0, 0, 0));
    const endUtc = new Date(Date.UTC(utcYear, utcMonth, utcDate, 23, 59, 59, 999));
    // find current task is completed
    const completed = yield completeTask_model_1.CompleteTask.findOne({
        userId: user === null || user === void 0 ? void 0 : user._id,
        taskId: id,
        lastAt: { $gte: startUtc, $lte: endUtc },
    });
    console.log(completed);
    if ((completed === null || completed === void 0 ? void 0 : completed.count) === (taskData === null || taskData === void 0 ? void 0 : taskData.perUserCap)) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, "Today limit reached");
    }
    if (completed) {
        completed.count = ((_a = completed.count) !== null && _a !== void 0 ? _a : 0) + 1;
        completed.lastAt = new Date();
        const reward = Number((_b = taskData === null || taskData === void 0 ? void 0 : taskData.rewardCoin) !== null && _b !== void 0 ? _b : 0);
        userData.balance = Number((_c = userData.balance) !== null && _c !== void 0 ? _c : 0) + reward;
        yield completed.save();
        yield (userData === null || userData === void 0 ? void 0 : userData.save());
        return completed;
    }
    else {
        const newCompleted = yield completeTask_model_1.CompleteTask.create({
            userId: user === null || user === void 0 ? void 0 : user._id,
            taskId: id,
            count: 1,
            lastAt: new Date(),
        });
        const reward = Number((_d = taskData === null || taskData === void 0 ? void 0 : taskData.rewardCoin) !== null && _d !== void 0 ? _d : 0);
        userData.balance = Number((_e = userData.balance) !== null && _e !== void 0 ? _e : 0) + reward;
        yield (userData === null || userData === void 0 ? void 0 : userData.save());
        return newCompleted;
    }
});
exports.completeTaskService = {
    taskCompleted,
};
