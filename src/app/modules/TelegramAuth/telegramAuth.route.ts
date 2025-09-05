import { Router } from "express";
import { telegramAuthController } from "./telegramAuth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "./telegramAuth.interface";

const router = Router();
router.get(
  "/me",
  checkAuth(UserRole?.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  telegramAuthController.getMe
);
router.post("/auth", telegramAuthController.createUserOrLogin);

export const TelegramAuthRoutes = router;
