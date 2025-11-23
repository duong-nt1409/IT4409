import express from "express";
// SỬA DÒNG NÀY: Chỉ import register, login, logout thôi
import { register, login, logout } from "../controllers/auth.js"; 

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

export default router;