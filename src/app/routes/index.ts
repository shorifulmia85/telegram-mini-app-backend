import { Router } from "express";
import { TelegramAuthRoutes } from "../modules/TelegramAuth/telegramAuth.route";
import { ReferralRoutes } from "../modules/Referral/referral.route";
import { TaskRoutes } from "../modules/Tasks/task.route";
import { TaskCompletedRoutes } from "../modules/CompleteTask/completeTask.route";

export const router = Router();
const routerItems = [
  {
    path: "/telegram",
    route: TelegramAuthRoutes,
  },
  {
    path: "/referral",
    route: ReferralRoutes,
  },
  {
    path: "/task",
    route: TaskRoutes,
  },
  {
    path: "/task/complete",
    route: TaskCompletedRoutes,
  },
];

routerItems?.forEach((route) => {
  router.use(route.path, route.route);
});
