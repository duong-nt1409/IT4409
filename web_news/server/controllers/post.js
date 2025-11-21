import { db } from "../db.js";

// Lấy danh sách bài viết
export const getPosts = (req, res) => {
  const catName = req.query.cat;

  // Nếu có catName thì JOIN bảng để lọc theo tên danh mục
  // Nếu không thì lấy hết
  const q = catName
    ? "SELECT p.*, c.name as cat_name FROM Posts p JOIN Categories c ON p.category_id = c.id WHERE c.name = ?"
    : "SELECT * FROM Posts";

  db.query(q, [catName], (err, data) => {
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
    "JOIN Categories c ON c.id = p.category_id " +
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