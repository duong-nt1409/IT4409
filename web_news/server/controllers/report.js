import { db } from "../db.js";

export const addReport = (req, res) => {
  const { user_id, post_id, reason } = req.body;

  // Check if user already reported this post? Maybe optional. 
  // For now let's allow multiple reports or just insert.
  
  const q = "INSERT INTO Reports (user_id, post_id, reason) VALUES (?, ?, ?)";
  db.query(q, [user_id, post_id, reason], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Báo cáo bài viết thành công.");
  });
};

export const getReportedPosts = (req, res) => {
  // Get posts that have at least one report
  // Also count reports
  const q = `
    SELECT p.*, u.username as author_name, COUNT(r.id) as report_count
    FROM Posts p
    JOIN Reports r ON p.id = r.post_id
    JOIN Users u ON p.user_id = u.id
    GROUP BY p.id
    ORDER BY report_count DESC
  `;

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const getReportsForPost = (req, res) => {
  const postId = req.params.id;
  const q = `
    SELECT r.*, u.username as reporter_name
    FROM Reports r
    JOIN Users u ON r.user_id = u.id
    WHERE r.post_id = ?
    ORDER BY r.created_at DESC
  `;
  
  db.query(q, [postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const checkReport = (req, res) => {
  const { postId, userId } = req.query;
  const q = "SELECT * FROM Reports WHERE post_id = ? AND user_id = ?";
  
  db.query(q, [postId, userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ reported: data.length > 0 });
  });
};
