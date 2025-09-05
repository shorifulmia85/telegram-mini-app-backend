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
exports.taskController = void 0;
const catchAsynce_1 = require("../../ulits/catchAsynce");
const task_service_1 = require("./task.service");
const sendResponse_1 = require("../../ulits/sendResponse");
const http_status_codes_1 = require("http-status-codes");
const createTask = (0, catchAsynce_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield task_service_1.taskServices.createTask(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: "task created successfully",
        data: result,
    });
}));
const getAllTask = (0, catchAsynce_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield task_service_1.taskServices.getAllTask(user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "task get successfully",
        data: result,
    });
}));
const getMyTask = (0, catchAsynce_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield task_service_1.taskServices.getMyTask(user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "my task get successfully",
        data: result,
    });
}));
const updateTask = (0, catchAsynce_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield task_service_1.taskServices.updateTask(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "task updated successfully",
        data: result,
    });
}));
const deleteTask = (0, catchAsynce_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield task_service_1.taskServices.deleteTask(id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "task deleted successfully",
        data: result,
    });
}));
exports.taskController = {
    createTask,
    getAllTask,
    updateTask,
    deleteTask,
    getMyTask,
};
