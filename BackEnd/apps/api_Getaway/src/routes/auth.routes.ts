import { Router } from "express";
import * as authController from "../controller/auth.controller.js";
import { validateBody } from "../middleware/validateRequest.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import {
  resendOtpSchema,
  verifyOtpSchema,
} from "../validators/otp.validator.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validateBody(registerSchema),
  authController.register,
);

router.post(
  "/login",
  authRateLimiter,
  validateBody(loginSchema),
  authController.login,
);

router.post(
  "/refresh",
  validateBody(refreshTokenSchema),
  authController.refresh,
);

router.post("/logout", authController.logout);

router.post(
  "/password-reset/request",
  authRateLimiter,
  validateBody(requestPasswordResetSchema),
  authController.requestPasswordReset,
);

router.post(
  "/password-reset/confirm",
  authRateLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword,
);

router.post(
  "/verify-otp",
  authRateLimiter,
  validateBody(verifyOtpSchema),
  authController.verifyOtp,
);

router.post(
  "/resend-otp",
  authRateLimiter,
  validateBody(resendOtpSchema),
  authController.resendOtp,
);

export default router;
