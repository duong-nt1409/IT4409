import { db } from "../db.js";

export const getComments = (req, res) => {
  // SỬA: Viết hoa tên bảng Comments, Users, Posts cho khớp DB
  const q = `
    SELECT c.*, u.id AS userId, u.username, u.avatar 
    FROM Comments c 
    JOIN Users u ON u.id = c.user_id
    WHERE c.post_id = ? 
    ORDER BY c.created_at DESC
  `;

  db.query(q, [req.query.postId], (err, data) => {
    if (err) {
      console.log(err); // In lỗi ra terminal
      return res.status(500).json(err);
    }
    return res.status(200).json(data);
  });
};

export const addComment = (req, res) => {
  if (!req.body.desc || !req.body.user_id || !req.body.post_id) {
    return res.status(400).json("Thiếu thông tin!");
  }

  // SỬA: Thêm cột parent_id vào câu lệnh INSERT
  const q = "INSERT INTO Comments(content, created_at, user_id, post_id, parent_id) VALUES (?, NOW(), ?, ?, ?)";
  
  const values = [
    req.body.desc,
    req.body.user_id,
    req.body.post_id,
    req.body.parent_id || null // Nếu không có parent_id thì gán NULL
  ];

  db.query(q, values, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    return res.status(200).json("Bình luận thành công!");
  });
};