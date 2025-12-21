import express from "express";
import {
  getPosts,
  getPost,
  addPost,
  deletePost,
  updatePost,
  getPostStats,
} from "../controllers/post.js";

const router = express.Router();

router.get("/", getPosts);

router.get("/:id/stats", getPostStats);

router.get("/:id", getPost);

router.post("/", addPost);

router.delete("/:id", deletePost);

router.put("/:id", updatePost);

export default router;