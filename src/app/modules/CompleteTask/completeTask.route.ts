import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../TelegramAuth/telegramAuth.interface";
import { taskCompletedController } from "./completeTask.controller";

const router = Router();
router.post(
  "/:id",
  checkAuth(UserRole.USER),
  taskCompletedController.taskCompleted
);
export const TaskCompletedRoutes = router;
