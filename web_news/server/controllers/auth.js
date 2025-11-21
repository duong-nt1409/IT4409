import { db } from "../db.js";
import bcrypt from "bcryptjs";

export const register = (req, res) => {
  // 1. Kiểm tra user đã tồn tại chưa
  const q = "SELECT * FROM Users WHERE email = ? OR username = ?";

  db.query(q, [req.body.email, req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User đã tồn tại!");

    // 2. Mã hóa mật khẩu
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    // 3. INSERT VÀO DB MỚI
    // Lưu ý: Bảng mới cần 'role_id' (Mặc định là 3 - User thường) và 'avatar' mặc định
    const q = "INSERT INTO Users(`username`,`email`,`password_hash`, `role_id`, `avatar`) VALUES (?)";
    
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    const roleIdUser = 3; // Role ID 3 tương ứng với 'User' trong bảng Roles

    const values = [
      req.body.username,
      req.body.email,
      hash,         // Lưu vào cột password_hash
      roleIdUser,   // Phải có role_id
      defaultAvatar
    ];

    db.query(q, [values], (err, data) => {
      if (err) {
        console.log(err); // In lỗi ra terminal để dễ debug
        return res.status(500).json("Lỗi khi tạo User: " + err.message);
      } 
      return res.status(200).json("Đã tạo User thành công!");
    });
  });
};

export const login = (req, res) => {
  // 1. Kiểm tra user
  const q = "SELECT * FROM Users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User không tìm thấy!");

    // 2. Kiểm tra mật khẩu (So sánh với cột password_hash)
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password_hash // <--- Sửa tên cột ở đây
    );

    if (!isPasswordCorrect)
      return res.status(400).json("Sai tên đăng nhập hoặc mật khẩu!");

    // 3. Trả về thông tin (Trừ mật khẩu)
    const { password_hash, ...other } = data[0];
    res.status(200).json(other);
  });
};

export const logout = (req, res) => {
    res.status(200).json("Đã đăng xuất.");
};