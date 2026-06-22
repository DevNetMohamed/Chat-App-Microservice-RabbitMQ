import { Router } from "express";
import * as messageController from "../controller/message.controller.js";
import { isAuth } from "../middleware/auth.middleware.js";
import { requireSocketId } from "../middleware/requireSocketId.js";

const router = Router();

router.use(isAuth, requireSocketId);

router.post("/", messageController.sendMessage);
router.get("/:chatId", messageController.getMessagesByChat);
router.patch("/:chatId/read", messageController.markAsRead);

export default router;
