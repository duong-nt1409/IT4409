import express from "express";
import { 
  getDashboardStats, 
  getEditorsList, 
  getPendingPosts, 
  updatePostStatus,
  deleteUser,
  getPendingEditors,
  updateUserStatus
} from "../controllers/admin.js";

const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/editors", getEditorsList);
router.get("/editors/pending", getPendingEditors); // <-- Route mới
router.put("/users/:id/status", updateUserStatus); // <-- Route mới
router.get("/posts/pending", getPendingPosts);
router.put("/posts/:id/status", updatePostStatus);
router.delete("/users/:id", deleteUser);

export default router;
