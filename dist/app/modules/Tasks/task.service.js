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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const appErrors_1 = require("../../Errors/appErrors");
const task_model_1 = require("./task.model");
const telegramAuth_model_1 = require("../TelegramAuth/telegramAuth.model");
const telegramAuth_interface_1 = require("../TelegramAuth/telegramAuth.interface");
const completeTask_model_1 = require("../CompleteTask/completeTask.model");
const mongoose_1 = __importDefault(require("mongoose"));
const createTask = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const thisAdIsRunning = yield task_model_1.Task.findOne({ adUnitId: payload === null || payload === void 0 ? void 0 : payload.adUnitId });
    if (thisAdIsRunning) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.CONFLICT, "This ads already running");
    }
    return yield task_model_1.Task.create(payload);
});
// const getAllTask = async (user: JwtPayload) => {
//   const userData = await User.findById(user?._id);
//   if (userData?.role === UserRole.USER) {
//     const taskData = await Task.find({ status: "ACTIVE" });
//     return taskData;
//   }
//   return await Task.find();
// };
const getAllTask = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield telegramAuth_model_1.User.findById(user === null || user === void 0 ? void 0 : user._id);
    // Only get active tasks if normal user
    const taskQuery = (userData === null || userData === void 0 ? void 0 : userData.role) === telegramAuth_interface_1.UserRole.USER ? { status: "ACTIVE" } : {};
    const taskData = yield task_model_1.Task.find(taskQuery).lean();
    if ((userData === null || userData === void 0 ? void 0 : userData.role) === telegramAuth_interface_1.UserRole.USER) {
        // ✅ Get UTC start and end of today
        const now = new Date();
        const utcYear = now.getUTCFullYear();
        const utcMonth = now.getUTCMonth();
        const utcDate = now.getUTCDate();
        const startUtc = new Date(Date.UTC(utcYear, utcMonth, utcDate, 0, 0, 0, 0));
        const endUtc = new Date(Date.UTC(utcYear, utcMonth, utcDate, 23, 59, 59, 999));
        // ✅ Find all CompleteTask docs created today for this user
        const completions = yield completeTask_model_1.CompleteTask.find({
            userId: new mongoose_1.default.Types.ObjectId(user._id),
            createdAt: { $gte: startUtc, $lte: endUtc },
        }).lean();
        // ✅ Map of taskId -> count
        const completionMap = new Map(completions.map((item) => [item.taskId.toString(), item.count]));
        // ✅ Attach completedCount to each task
        taskData.forEach((task) => {
            const taskIdStr = task._id.toString();
            task.completedCount = completionMap.get(taskIdStr) || 0;
        });
    }
    return taskData;
});
const getMyTask = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield telegramAuth_model_1.User.findById(user === null || user === void 0 ? void 0 : user._id);
    return yield completeTask_model_1.CompleteTask.find({ userId: userData === null || userData === void 0 ? void 0 : userData._id });
});
const updateTask = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(payload);
    const taskData = yield task_model_1.Task.findById(id);
    if (!taskData) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "task data not found");
    }
    const updateTask = yield task_model_1.Task.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return updateTask;
});
const deleteTask = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const taskData = yield task_model_1.Task.findById(id);
    if (!taskData) {
        throw new appErrors_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "task not found");
    }
    return yield task_model_1.Task.findByIdAndDelete(id);
});
exports.taskServices = {
    createTask,
    getAllTask,
    updateTask,
    deleteTask,
    getMyTask,
};
