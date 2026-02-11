import express from "express";
import {
  getStreamToken,
  deleteConversation,
} from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// lấy Stream token
router.get("/token", protectRoute, getStreamToken);

// xoá hội thoại (1–1 hoặc group)
router.delete(
  "/conversation/:channelId",
  protectRoute,
  deleteConversation
);

export default router;
