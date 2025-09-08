import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../TelegramAuth/telegramAuth.interface";
import { taskController } from "./task.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { TaskCreateSchema, TaskUpdateSchema } from "./task.validation";

const router = Router();
router.get(
  "/",
  checkAuth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  taskController.getAllTask
);
router.get(
  "/my-task",
  checkAuth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  taskController.getMyTask
);
router.post(
  "/create",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(TaskCreateSchema),
  taskController.createTask
);

router.patch(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(TaskUpdateSchema),
  taskController.updateTask
);

router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  taskController.deleteTask
);
export const TaskRoutes = router;
