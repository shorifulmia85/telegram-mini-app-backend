import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../TelegramAuth/telegramAuth.interface";
import { spinController } from "./spin.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { spinValidationSchema } from "./spin.validate";

const router = Router();

router.get(
  "/",
  checkAuth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  spinController.getAllSpin
);
router.post(
  "/create",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER),
  validateRequest(spinValidationSchema),
  spinController.createSpin
);
router.post(
  "/spin-and-win",
  checkAuth(UserRole.USER),
  spinController.spinAndWin
);

export const SpinRoutes = router;
