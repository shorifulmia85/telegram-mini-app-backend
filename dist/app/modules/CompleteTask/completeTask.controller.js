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
exports.taskCompletedController = void 0;
const catchAsynce_1 = require("../../ulits/catchAsynce");
const sendResponse_1 = require("../../ulits/sendResponse");
const http_status_codes_1 = require("http-status-codes");
const completeTask_service_1 = require("./completeTask.service");
const taskCompleted = (0, catchAsynce_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = req.user;
    const result = yield completeTask_service_1.completeTaskService.taskCompleted(id, user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "task completed successfully",
        data: result,
    });
}));
exports.taskCompletedController = {
    taskCompleted,
};
