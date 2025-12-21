import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; 

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const EDITOR_ROLE_ID = 2;

// --- CẤU HÌNH REGEX (LUẬT KIỂM TRA) ---

// 1. Regex kiểm tra Email: Phải có dạng abc@xyz.com
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 2. Regex kiểm tra Password: 

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;

export const register = (req, res) => {
  const { username, email, password } = req.body;

  // --- BƯỚC 1: VALIDATE DỮ LIỆU ĐẦU VÀO ---

  // Kiểm tra điền thiếu thông tin
  if (!username || !email || !password) {
    return res.status(400).json("Vui lòng nhập đầy đủ thông tin!");
  }

  // Kiểm tra định dạng Email
  if (!emailRegex.test(email)) {
    return res.status(400).json("Email không hợp lệ! (Ví dụ: user@example.com)");
  }

  // Kiểm tra độ mạnh Mật khẩu
  if (!passwordRegex.test(password)) {
    return res.status(400).json(
      "Mật khẩu phải trên 6 ký tự, bao gồm ít nhất 1 chữ cái, 1 số và 1 ký tự đặc biệt (@$!%*?&)."
    );
  }

  // --- BƯỚC 2: KIỂM TRA TRÙNG LẶP TRONG DB ---
  const q = "SELECT * FROM Users WHERE email = ? OR username = ?";

  db.query(q, [email, username], (err, data) => {
    if (err) return res.status(500).json(err.message || "Lỗi server");
    
    if (data.length) {
      // Kiểm tra kỹ xem trùng cái gì để báo lỗi chính xác hơn
      if (data[0].email === email) return res.status(409).json("Email này đã được sử dụng!");
      if (data[0].username === username) return res.status(409).json("Tên đăng nhập đã tồn tại!");
    }

    // --- BƯỚC 3: TẠO USER MỚI ---
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const qInsert = "INSERT INTO Users(`username`,`email`,`password_hash`, `role_id`, `avatar`) VALUES (?)";
    const roleIdUser = 3; 
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    const values = [username, email, hash, roleIdUser, defaultAvatar];

    db.query(qInsert, [values], (err, data) => {
      if (err) return res.status(500).json("Lỗi khi tạo User: " + err.message);
      return res.status(200).json("Đăng ký thành công!");
    });
  });
};

export const login = (req, res) => {
  const q = "SELECT * FROM Users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err.message || "Lỗi khi tìm kiếm người dùng");
    if (data.length === 0) return res.status(404).json("Sai tên đăng nhập hoặc mật khẩu!");

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

  // --- BƯỚC 1: VALIDATE DỮ LIỆU ---

  // 1. Kiểm tra thiếu thông tin quan trọng
  if (!username || !email || !password) {
    return res
      .status(400)
      .json("Vui lòng nhập đầy đủ username, email và password.");
  }

  // 2. Kiểm tra định dạng Email
  if (!emailRegex.test(email)) {
    return res.status(400).json("Email không hợp lệ! (Ví dụ: editor@example.com)");
  }

  // 3. Kiểm tra độ mạnh Mật khẩu
  if (!passwordRegex.test(password)) {
    return res.status(400).json(
      "Mật khẩu phải trên 6 ký tự, bao gồm ít nhất 1 chữ cái, 1 số và 1 ký tự đặc biệt (@$!%*?&)."
    );
  }

  // --- BƯỚC 2: LOGIC ĐĂNG KÝ (Giữ nguyên) ---
  const checkQuery = "SELECT * FROM Users WHERE email = ? OR username = ?";

  db.query(checkQuery, [email, username], (err, data) => {
    if (err) return res.status(500).json(err.message || "Lỗi kiểm tra trùng lặp");
    
    if (data.length) {
       if (data[0].email === email) return res.status(409).json("Email này đã được sử dụng!");
       if (data[0].username === username) return res.status(409).json("Tên đăng nhập đã tồn tại!");
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const insertQuery =
      "INSERT INTO Users(`username`,`email`,`password_hash`,`role_id`,`name`,`age`,`years_of_experience`,`avatar`, `status`) VALUES (?)";

    const values = [
      username,
      email,
      hash,
      2, // Role Editor
      name || null,
      age ? Number(age) : null,
      years_of_experience ? Number(years_of_experience) : null,
      avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      'approved' // Mặc định duyệt luôn để bạn test cho dễ
    ];

    db.query(insertQuery, [values], (insertErr) => {
      if (insertErr) return res.status(500).json(insertErr.message || "Lỗi khi tạo tài khoản Editor");
      return res.status(200).json("Đăng ký Editor thành công! Tài khoản đã được duyệt.");
    });
  });
};