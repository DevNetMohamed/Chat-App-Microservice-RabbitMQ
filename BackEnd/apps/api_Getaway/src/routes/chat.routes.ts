import { Router } from "express";
import * as chatController from "../controller/chat.controller.js";
import { isAuth } from "../middleware/auth.middleware.js";
import { requireSocketId } from "../middleware/requireSocketId.js";

const router = Router();

router.use(isAuth, requireSocketId);

router.post("/", chatController.createChat);
router.get("/", chatController.getUserChats);
router.get("/:id", chatController.getChatById);

export default router;
