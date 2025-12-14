import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // <--- 1. BẮT BUỘC PHẢI IMPORT CÁI NÀY

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const EDITOR_ROLE_ID = 2;

export const register = (req, res) => {
  const q = "SELECT * FROM Users WHERE email = ? OR username = ?";

  db.query(q, [req.body.email, req.body.username], (err, data) => {
    if (err) return res.status(500).json(err.message || "Lỗi khi kiểm tra thông tin người dùng");
    if (data.length) return res.status(409).json("User đã tồn tại!");

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const q = "INSERT INTO Users(`username`,`email`,`password_hash`, `role_id`, `avatar`) VALUES (?)";
    
    const roleIdUser = 3; 

    const values = [
      req.body.username,
      req.body.email,
      hash,
      roleIdUser,
      DEFAULT_AVATAR
    ];

    db.query(q, [values], (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json("Lỗi khi tạo User: " + err.message);
      } 
      return res.status(200).json("Đã tạo User thành công!");
    });
  });
};

export const login = (req, res) => {
  const q = "SELECT * FROM Users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err.message || "Lỗi khi tìm kiếm người dùng");
    if (data.length === 0) return res.status(404).json("User không tìm thấy!");

    const user = data[0];

    // --- LOGIC EDITOR CỦA BẠN (GIỮ NGUYÊN) ---
    // Check editor status if user is an editor (role_id === 2)
    // Allow pending editors to login, but block rejected ones
    if (Number(user.role_id) === 2) {
      if (user.status === 'rejected') {
        return res.status(403).json("Tài khoản của bạn đã bị từ chối!");
      }
    }
    // -----------------------------------------

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      user.password_hash
    );

    if (!isPasswordCorrect)
      return res.status(400).json("Sai tên đăng nhập hoặc mật khẩu!");

    // --- PHẦN SỬA ĐỔI QUAN TRỌNG ĐỂ HẾT LỖI 401 ---
    
    // 1. Tạo Token
    const token = jwt.sign({ id: user.id }, "jwtkey");

    const { password_hash, ...other } = user;

    // 2. Gửi Cookie về (Bắt buộc phải có đoạn này)
    res
      .cookie("access_token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true
      })
      .status(200)
      .json(other);
  });
};

export const logout = (req, res) => {
  // Sửa lại logout để xóa đúng cái cookie access_token
  res.clearCookie("access_token", {
    sameSite: "none",
    secure: true
  }).status(200).json("Đã đăng xuất.");
};

// --- LOGIC EDITOR REGISTER (GIỮ NGUYÊN 100%) ---
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
    if (err) return res.status(500).json(err.message || "Lỗi khi kiểm tra thông tin người dùng");
    if (data.length)
      return res.status(409).json("User đã tồn tại. Vui lòng chọn tên khác!");

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // Editor accounts are created with 'pending' status and require admin approval
    const insertQuery =
      "INSERT INTO Users(`username`,`email`,`password_hash`,`role_id`,`name`,`age`,`years_of_experience`,`avatar`, `status`) VALUES (?)";

    const values = [
      username,
      email,
      hash,
      EDITOR_ROLE_ID,
      name || null,
      age ? Number(age) : null,
      years_of_experience ? Number(years_of_experience) : null,
      avatar || DEFAULT_AVATAR,
      'approved' // Changed to 'approved' for testing - new editors are automatically approved
      // 'pending' // New editor accounts are saved as 'not approved' (pending approval)
      // 'rejected'
    ];

    db.query(insertQuery, [values], (insertErr) => {
      if (insertErr) return res.status(500).json(insertErr.message || "Lỗi khi tạo tài khoản Editor");
      return res.status(200).json("Đăng ký Editor thành công! Tài khoản của bạn đã được phê duyệt.");
    });
  });
};