import { Router } from "express";
import { referralController } from "./referral.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../TelegramAuth/telegramAuth.interface";

const router = Router();
router.get(
  "/my-referrals",
  checkAuth(UserRole.USER),
  referralController.getMyReferrals
);
router.get(
  "/all-referrals",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  referralController.getAllReferrals
);
router.get(
  "/leaderboard",
  checkAuth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  referralController.leaderboard
);
router.post(
  "/unlocked/:id",
  checkAuth(UserRole.USER),
  referralController.referralUnlocked
);

export const ReferralRoutes = router;
