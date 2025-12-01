import { db } from "../db.js";

// Lấy danh sách bài viết
export const getPosts = (req, res) => {
  const catName = req.query.cat;
  const uid = req.query.uid; // Lọc theo User ID (cho Editor)

  let q = "SELECT p.*, c.name as cat_name FROM Posts p LEFT JOIN Categories c ON p.category_id = c.id WHERE 1=1";
  const params = [];

  if (catName) {
    q += " AND c.name = ?";
    params.push(catName);
  }

  if (uid) {
    q += " AND p.user_id = ?";
    params.push(uid);
  }

  q += " ORDER BY p.created_at DESC";

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).send(err);
    return res.status(200).json(data);
  });
};

// Lấy chi tiết 1 bài
export const getPost = (req, res) => {
  const q =
    "SELECT p.id, u.username, p.title, p.content, p.thumbnail, u.avatar, p.category_id, c.name as cat_name, p.created_at as date " +
    "FROM Posts p " +
    "JOIN Users u ON u.id = p.user_id " +
    "LEFT JOIN Categories c ON c.id = p.category_id " +
    "WHERE p.id = ?";

  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data[0]);
  });
};

export const addPost = (req, res) => {
  res.json("Chức năng đang phát triển");
};

export const deletePost = (req, res) => {
  res.json("Chức năng đang phát triển");
};

export const updatePost = (req, res) => {
  res.json("Chức năng đang phát triển");
};