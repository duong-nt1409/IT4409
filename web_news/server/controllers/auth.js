import { db } from "../db.js";
import bcrypt from "bcryptjs";

// Xử lý Đăng Ký
export const register = (req, res) => {
  // 1. Kiểm tra xem user đã tồn tại chưa
  const q = "SELECT * FROM users WHERE email = ? OR username = ?";

  db.query(q, [req.body.email, req.body.username], (err, data) => {
    if (err) return res.json(err);
    if (data.length) return res.status(409).json("User đã tồn tại!");

    // 2. Mã hóa mật khẩu và tạo user
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const q = "INSERT INTO users(`username`,`email`,`password`) VALUES (?)";
    const values = [req.body.username, req.body.email, hash];

    db.query(q, [values], (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json("Đã tạo User thành công!");
    });
  });
};

// Xử lý Đăng Nhập
export const login = (req, res) => {
  // 1. Kiểm tra user có tồn tại không
  const q = "SELECT * FROM users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.json(err);
    if (data.length === 0) return res.status(404).json("User không tìm thấy!");

    // 2. So sánh mật khẩu nhập vào với mật khẩu mã hóa trong DB
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!isPasswordCorrect)
      return res.status(400).json("Sai tên đăng nhập hoặc mật khẩu!");

    // 3. Lưu thông tin user vào session (trừ mật khẩu)
    const { password, ...other } = data[0];
    req.session.user = other;
    
    res.status(200).json({ message: "Đăng nhập thành công!", user: other });
  });
};

// Lấy thông tin user hiện tại từ session
export const getCurrentUser = (req, res) => {
  if (req.session.user) {
    res.status(200).json(req.session.user);
  } else {
    res.status(401).json("Chưa đăng nhập");
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json("Lỗi khi đăng xuất");
    }
    res.clearCookie("connect.sid"); // Clear session cookie
    res.status(200).json("Đã đăng xuất.");
  });
};