import { db } from "../db.js";

export const updateUser = (req, res) => {
  const userId = req.params.id;
  
  // Câu lệnh UPDATE cập nhật đầy đủ thông tin
  const q = "UPDATE Users SET `name`=?, `email`=?, `avatar`=?, `phone`=?, `address`=?, `dob`=?, `gender`=? WHERE id=?";

  const values = [
    req.body.name,    // Họ và tên
    req.body.email,
    req.body.avatar,
    req.body.phone,   // Số điện thoại
    req.body.address, // Địa chỉ
    req.body.dob,     // Ngày sinh (YYYY-MM-DD)
    req.body.gender,  // Giới tính
    userId
  ];

  db.query(q, values, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    return res.json("Cập nhật thông tin thành công!");
  });
};
export const getUserStats = (req, res) => {
  const userId = req.params.id;

  // Query đếm số lượng từ 2 bảng Bookmarks và ReadHistory
  const q = `
    SELECT 
      (SELECT COUNT(*) FROM Bookmarks WHERE user_id = ?) AS savedCount,
      (SELECT COUNT(*) FROM ReadHistory WHERE user_id = ?) AS viewedCount
  `;

  db.query(q, [userId, userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data[0]);
  });
};

export const getEditorStats = (req, res) => {
  const userId = req.params.id;

  // Query lấy thống kê cho Editor
  const q = `
    SELECT 
      u.years_of_experience,
      u.status as editor_status,
      u.created_at as editor_since,
      COUNT(DISTINCT p.id) as total_posts,
      COUNT(DISTINCT CASE WHEN p.status = 'approved' THEN p.id END) as approved_posts,
      COUNT(DISTINCT CASE WHEN p.status = 'pending' THEN p.id END) as pending_posts,
      COUNT(DISTINCT CASE WHEN p.status = 'rejected' THEN p.id END) as rejected_posts,
      COALESCE(SUM(ns.view_count), 0) as total_views,
      (SELECT COUNT(*) FROM Likes l INNER JOIN Posts p2 ON l.post_id = p2.id WHERE p2.user_id = ?) as total_likes,
      (SELECT COUNT(*) FROM Comments c INNER JOIN Posts p3 ON c.post_id = p3.id WHERE p3.user_id = ?) as total_comments
    FROM Users u
    LEFT JOIN Posts p ON u.id = p.user_id
    LEFT JOIN NewsStats ns ON p.id = ns.post_id
    WHERE u.id = ?
    GROUP BY u.id, u.years_of_experience, u.status, u.created_at
  `;

  db.query(q, [userId, userId, userId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) {
      // If no posts, return basic editor info
      const basicQ = `SELECT years_of_experience, status as editor_status, created_at as editor_since FROM Users WHERE id = ?`;
      db.query(basicQ, [userId], (err2, basicData) => {
        if (err2) return res.status(500).json(err2);
        return res.status(200).json({
          ...basicData[0],
          total_posts: 0,
          approved_posts: 0,
          pending_posts: 0,
          rejected_posts: 0,
          total_views: 0,
          total_likes: 0,
          total_comments: 0
        });
      });
    } else {
      return res.status(200).json(data[0]);
    }
  });
};