import { db } from "../db.js";

export const getDashboardStats = (req, res) => {
  const q = `
    SELECT 
      (SELECT COUNT(*) FROM Users WHERE role_id = 3) as total_users,
      (SELECT COUNT(*) FROM Users WHERE role_id = 2) as total_editors,
      (SELECT COUNT(*) FROM Posts) as total_posts,
      (SELECT SUM(view_count) FROM NewsStats) as total_views,
      (SELECT COUNT(*) FROM Posts WHERE status = 'pending') as pending_posts
  `;

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data[0]);
  });
};

export const getEditorsList = (req, res) => {
  const q = `
    SELECT 
      u.id, u.username, u.email, u.avatar, u.name, u.age, 
      TIMESTAMPDIFF(YEAR, u.created_at, NOW()) as years_of_experience, 
      u.created_at,
      COUNT(p.id) as post_count,
      COALESCE(SUM(ns.view_count), 0) as total_views,
      COALESCE(SUM(ns.comment_count), 0) as total_comments
    FROM Users u
    LEFT JOIN Posts p ON u.id = p.user_id
    LEFT JOIN NewsStats ns ON p.id = ns.post_id
    WHERE u.role_id = 2
    GROUP BY u.id
    ORDER BY post_count DESC
  `;

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const getPendingPosts = (req, res) => {
  const q = `
    SELECT p.*, u.username as author_name, c.name as category_name 
    FROM Posts p
    JOIN Users u ON p.user_id = u.id
    LEFT JOIN Categories c ON p.category_id = c.id
    WHERE p.status = 'pending'
    ORDER BY p.created_at ASC
  `;

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const updatePostStatus = (req, res) => {
  const postId = req.params.id;
  const status = req.body.status;

  const q = "UPDATE Posts SET status = ? WHERE id = ?";

  db.query(q, [status, postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Cập nhật trạng thái bài viết thành công!");
  });
};

export const deleteUser = (req, res) => {
  const userId = req.params.id;
  const q = "DELETE FROM Users WHERE id = ?";

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Đã xóa người dùng!");
  });
};

export const getPendingEditors = (req, res) => {
  const q = `
    SELECT id, username, email, name, age, 
           TIMESTAMPDIFF(YEAR, created_at, NOW()) as years_of_experience, 
           created_at, avatar
    FROM Users
    WHERE role_id = 2 AND status = 'pending'
    ORDER BY created_at ASC
  `;

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const updateUserStatus = (req, res) => {
  const userId = req.params.id;
  const status = req.body.status;

  const q = "UPDATE Users SET status = ? WHERE id = ?";

  db.query(q, [status, userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Cập nhật trạng thái Editor thành công!");
  });
};

export const deletePost = (req, res) => {
  const postId = req.params.id;
  const q = "DELETE FROM Posts WHERE id = ?";

  db.query(q, [postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Đã xóa bài viết!");
  });
};
