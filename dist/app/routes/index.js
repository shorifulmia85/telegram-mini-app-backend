"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const telegramAuth_route_1 = require("../modules/TelegramAuth/telegramAuth.route");
const referral_route_1 = require("../modules/Referral/referral.route");
const task_route_1 = require("../modules/Tasks/task.route");
const completeTask_route_1 = require("../modules/CompleteTask/completeTask.route");
exports.router = (0, express_1.Router)();
const routerItems = [
    {
        path: "/telegram",
        route: telegramAuth_route_1.TelegramAuthRoutes,
    },
    {
        path: "/referral",
        route: referral_route_1.ReferralRoutes,
    },
    {
        path: "/task",
        route: task_route_1.TaskRoutes,
    },
    {
        path: "/task/complete",
        route: completeTask_route_1.TaskCompletedRoutes,
    },
];
routerItems === null || routerItems === void 0 ? void 0 : routerItems.forEach((route) => {
    exports.router.use(route.path, route.route);
});
