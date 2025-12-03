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