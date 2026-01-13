import express from "express";
import { 
  getDashboardStats, 
  getEditorsList, 
  getPendingPosts, 
  updatePostStatus,
  deleteUser,
  getPendingEditors,
  updateUserStatus,
  deletePost,
  getReportedPosts,
  deleteReports,
  getWeeklyStats,
  getReportDetails
} from "../controllers/admin.js";

const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/stats/weekly", getWeeklyStats); // Route mới cho biểu đồ
router.get("/editors", getEditorsList);
router.get("/editors/pending", getPendingEditors);
router.put("/users/:id/status", updateUserStatus);
router.get("/posts/pending", getPendingPosts);
router.put("/posts/:id/status", updatePostStatus);
router.delete("/users/:id", deleteUser);
router.delete("/posts/:id", deletePost);
router.get("/reports", getReportedPosts);
router.get("/reports/:id/details", getReportDetails); // Route mới xem chi tiết report
router.delete("/reports/:id", deleteReports);

export default router;
