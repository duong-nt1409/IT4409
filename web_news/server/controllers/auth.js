import { db } from "../db.js";
import bcrypt from "bcryptjs";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const EDITOR_ROLE_ID = 2;

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


export const editorRegister = (req, res) => {
  const {
    username,
    email,
    password,
    name,
    age,
    years_of_experience,
    avatar,
  } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json("Vui lòng nhập đầy đủ username, email và password.");
  }

  const checkQuery = "SELECT * FROM Users WHERE email = ? OR username = ?";

  db.query(checkQuery, [email, username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length)
      return res.status(409).json("User đã tồn tại. Vui lòng chọn tên khác!");

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const insertQuery =
      "INSERT INTO Users(`username`,`email`,`password_hash`,`role_id`,`name`,`age`,`years_of_experience`,`avatar`) VALUES (?)";

    const values = [
      username,
      email,
      hash,
      EDITOR_ROLE_ID,
      name || null,
      age ? Number(age) : null,
      years_of_experience ? Number(years_of_experience) : null,
      avatar || DEFAULT_AVATAR,
    ];

    db.query(insertQuery, [values], (insertErr) => {
      if (insertErr) return res.status(500).json(insertErr);
      return res.status(200).json("Đăng ký Editor thành công!");
    });
  });
};

export const editorLogin = (req, res) => {
  const q = "SELECT * FROM Users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Editor không tìm thấy!");

    const user = data[0];

    // Chỉ cho phép tài khoản có role_id = 2 (Editor)
    if (Number(user.role_id) !== 2) {
      return res
        .status(403)
        .json("Tài khoản này không có quyền Editor!");
    }

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      user.password_hash
    );

    if (!isPasswordCorrect) {
      return res.status(400).json("Sai tên đăng nhập hoặc mật khẩu!");
    }

    const { password_hash, ...other } = user;
    res.status(200).json(other);
  });
};

export const editorLogout = (req, res) => {
  res.status(200).json("Đã đăng xuất.");
};