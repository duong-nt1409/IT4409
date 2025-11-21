import express from "express";
import { register, login, logout, getCurrentUser } from "../controllers/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/current", getCurrentUser);
router.post("/logout", logout);

export default router;