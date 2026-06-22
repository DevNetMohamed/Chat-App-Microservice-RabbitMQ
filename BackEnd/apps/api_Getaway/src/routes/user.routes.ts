import { Router } from "express";
import * as userController from "../controller/user.controller.js";
import { isAuth } from "../middleware/auth.middleware.js";
import { requireSocketId } from "../middleware/requireSocketId.js";
import { validateBody, validateQuery } from "../middleware/validateRequest.js";
import {
  updateProfileSchema,
  getUsersByIdsSchema,
  searchUsersSchema,
} from "../validators/user.validator.js";

const router = Router();

router.use(isAuth, requireSocketId);
router.get("/me", userController.getMe);

router.patch(
  "/me",
  validateBody(updateProfileSchema),
  userController.updateProfile,
);

router.get(
  "/search",
  validateQuery(searchUsersSchema),
  userController.searchUsers,
);

router.post(
  "/batch",
  validateBody(getUsersByIdsSchema),
  userController.getUsersByIds,
);

router.get("/:id", userController.getUserById);

export default router;
