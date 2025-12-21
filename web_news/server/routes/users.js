import express from "express";
import { updateUser, getUserStats, getEditorStats } from "../controllers/user.js";

const router = express.Router();

// Định nghĩa đường dẫn cập nhật: /api/users/:id
router.put("/:id", updateUser);
router.get("/stats/:id", getUserStats);
router.get("/editor-stats/:id", getEditorStats);

export default router;