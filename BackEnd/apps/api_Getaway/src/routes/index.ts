import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import chatRoutes from "./chat.routes.js";
import messageRoutes from "./message.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/chats", chatRoutes);
router.use("/messages", messageRoutes);

export default router;
