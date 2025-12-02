import { db } from "../db.js";

// --- BOOKMARK (LƯU BÀI) ---

// Lấy danh sách ID bài đã lưu của User (để tô màu nút Save)
export const getSavedPostIds = (req, res) => {
  const q = "SELECT post_id FROM Bookmarks WHERE user_id = ?";
  db.query(q, [req.query.userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data.map(item => item.post_id));
  });
};

// Toggle: Lưu hoặc Bỏ lưu
export const toggleBookmark = (req, res) => {
  const { user_id, post_id } = req.body;

  // Kiểm tra xem đã lưu chưa
  const qCheck = "SELECT * FROM Bookmarks WHERE user_id = ? AND post_id = ?";
  db.query(qCheck, [user_id, post_id], (err, data) => {
    if (err) return res.status(500).json(err);

    if (data.length > 0) {
      // Đã lưu -> Xóa (Bỏ lưu)
      const qDelete = "DELETE FROM Bookmarks WHERE user_id = ? AND post_id = ?";
      db.query(qDelete, [user_id, post_id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Đã bỏ lưu bài viết.");
      });
    } else {
      // Chưa lưu -> Thêm mới
      const qInsert = "INSERT INTO Bookmarks (user_id, post_id) VALUES (?, ?)";
      db.query(qInsert, [user_id, post_id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Đã lưu bài viết.");
      });
    }
  });
};

// Lấy danh sách đầy đủ bài đã lưu (cho trang SavedPosts)
export const getSavedPosts = (req, res) => {
  const userId = req.query.userId;
  const q = `
    SELECT 
      p.*, c.name as cat_name, b.created_at as saved_at,
      (SELECT COUNT(*) FROM Bookmarks WHERE post_id = p.id AND user_id = ?) AS is_saved,
      (SELECT COUNT(*) FROM Likes WHERE post_id = p.id AND user_id = ?) AS is_liked
    FROM Posts p 
    JOIN Bookmarks b ON p.id = b.post_id 
    JOIN Categories c ON p.category_id = c.id
    WHERE b.user_id = ? 
    ORDER BY b.created_at DESC`;
    
  db.query(q, [userId, userId, userId], (err, data) => {
    if (err) return res.status(500).json(err);
    // Chuyển đổi 1/0 thành boolean true/false cho dễ dùng
    const enrichedData = data.map(post => ({
      ...post,
      is_saved: post.is_saved > 0,
      is_liked: post.is_liked > 0
    }));
    return res.status(200).json(enrichedData);
  });
}

// --- HISTORY (LỊCH SỬ XEM) ---

export const addToHistory = (req, res) => {
  const { user_id, post_id } = req.body;
  // Xóa cũ thêm mới để cập nhật thời gian xem mới nhất (hoặc dùng INSERT IGNORE nếu muốn lưu lần đầu)
  const q = "INSERT INTO ReadHistory (user_id, post_id, viewed_at) VALUES (?, ?, NOW())";
  
  db.query(q, [user_id, post_id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Đã ghi lịch sử.");
  });
};

export const getHistoryPosts = (req, res) => {
  const userId = req.query.userId;
  const q = `
    SELECT DISTINCT 
      p.*, c.name as cat_name, rh.viewed_at,
      (SELECT COUNT(*) FROM Bookmarks WHERE post_id = p.id AND user_id = ?) AS is_saved,
      (SELECT COUNT(*) FROM Likes WHERE post_id = p.id AND user_id = ?) AS is_liked
    FROM Posts p 
    JOIN ReadHistory rh ON p.id = rh.post_id 
    JOIN Categories c ON p.category_id = c.id
    WHERE rh.user_id = ? 
    ORDER BY rh.viewed_at DESC`;

  db.query(q, [userId, userId, userId], (err, data) => {
    if (err) return res.status(500).json(err);
    const enrichedData = data.map(post => ({
      ...post,
      is_saved: post.is_saved > 0,
      is_liked: post.is_liked > 0
    }));
    return res.status(200).json(enrichedData);
  });
};
export const deleteHistory = (req, res) => {
  // Lấy userId từ query params
  const userId = req.query.userId; 

  const q = "DELETE FROM ReadHistory WHERE user_id = ?";

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Đã xóa toàn bộ lịch sử.");
  });
};