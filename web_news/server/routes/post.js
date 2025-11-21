import express from "express";
import {
  getPosts,
  getPost,
  addPost,
  deletePost,
  updatePost,
} from "../controllers/post.js";

const router = express.Router();

// 1. Lấy danh sách bài viết (Có thể lọc theo ?cat=...)
router.get("/", getPosts);

// 2. Lấy chi tiết 1 bài viết theo ID
router.get("/:id", getPost);

// 3. Thêm bài viết mới
router.post("/", addPost);

// 4. Xóa bài viết
router.delete("/:id", deletePost);

// 5. Cập nhật bài viết
router.put("/:id", updatePost);

export default router;