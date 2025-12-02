import express from "express";
import { updateUser,getUserStats } from "../controllers/user.js";

const router = express.Router();

// Định nghĩa đường dẫn cập nhật: /api/users/:id
router.put("/:id", updateUser);
router.get("/stats/:id", getUserStats);

export default router;