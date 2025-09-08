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
exports.spinController = void 0;
const catchAsynce_1 = require("../../ulits/catchAsynce");
const sendResponse_1 = require("../../ulits/sendResponse");
const http_status_codes_1 = require("http-status-codes");
const spin_service_1 = require("./spin.service");
const createSpin = (0, catchAsynce_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield spin_service_1.spinServices.createSpin(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: "Spin value created",
        data: result,
    });
}));
const getAllSpin = (0, catchAsynce_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield spin_service_1.spinServices.getAllSpin();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: "Spin data get successfully",
        data: result,
    });
}));
const spinAndWin = (0, catchAsynce_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { idempotencyKey } = req.body || {};
    const result = yield spin_service_1.spinServices.spinAndWin({ userId, idempotencyKey });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Success",
        data: result,
    });
}));
exports.spinController = {
    createSpin,
    getAllSpin,
    spinAndWin,
};
