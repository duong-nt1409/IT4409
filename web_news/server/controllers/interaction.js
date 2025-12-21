import { db } from "../db.js";

// --- BOOKMARK (LƯU BÀI) ---

export const getSavedPostIds = (req, res) => {
  const q = "SELECT post_id FROM Bookmarks WHERE user_id = ?";
  db.query(q, [req.query.userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data.map(item => item.post_id));
  });
};

export const toggleBookmark = (req, res) => {
  const { user_id, post_id } = req.body;

  const qCheck = "SELECT * FROM Bookmarks WHERE user_id = ? AND post_id = ?";
  db.query(qCheck, [user_id, post_id], (err, data) => {
    if (err) return res.status(500).json(err);

    if (data.length > 0) {
      const qDelete = "DELETE FROM Bookmarks WHERE user_id = ? AND post_id = ?";
      db.query(qDelete, [user_id, post_id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Đã bỏ lưu bài viết.");
      });
    } else {
      const qInsert = "INSERT INTO Bookmarks (user_id, post_id) VALUES (?, ?)";
      db.query(qInsert, [user_id, post_id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Đã lưu bài viết.");
      });
    }
  });
};

export const getSavedPosts = (req, res) => {
  const userId = req.query.userId;
  const q = `
    SELECT 
      p.*, c.name as cat_name, b.created_at as saved_at,
      COALESCE(ns.view_count, 0) as view_count,
      (SELECT COUNT(*) FROM Bookmarks WHERE post_id = p.id AND user_id = ?) AS is_saved,
      (SELECT COUNT(*) FROM Likes WHERE post_id = p.id AND user_id = ?) AS is_liked
    FROM Posts p 
    JOIN Bookmarks b ON p.id = b.post_id 
    JOIN Categories c ON p.category_id = c.id
    LEFT JOIN NewsStats ns ON p.id = ns.post_id
    WHERE b.user_id = ? 
    ORDER BY b.created_at DESC`;
    
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

// --- HISTORY (LỊCH SỬ XEM) ---

export const addToHistory = (req, res) => {
  const { user_id, post_id } = req.body;

  // 1. Xóa lịch sử cũ của bài này (để tránh trùng lặp và cập nhật thời gian mới nhất)
  const qDelete = "DELETE FROM ReadHistory WHERE user_id = ? AND post_id = ?";

  db.query(qDelete, [user_id, post_id], (err, resultDelete) => {
    if (err) return res.status(500).json(err);

    const alreadyRead = resultDelete.affectedRows > 0;

    // 2. Thêm lại vào bảng
    const qInsert = "INSERT INTO ReadHistory (user_id, post_id, viewed_at) VALUES (?, ?, NOW())";
    
    db.query(qInsert, [user_id, post_id], (err, data) => {
       if (err) return res.status(500).json(err);

       // 3. Cập nhật view_count nếu là lượt đọc mới
       if (!alreadyRead) {
         // Update NewsStats view_count, create entry if it doesn't exist
         const qCheck = "SELECT post_id FROM NewsStats WHERE post_id = ?";
         db.query(qCheck, [post_id], (err, stats) => {
           if (err) {
             console.error("Error checking NewsStats:", err);
             return;
           }
           if (stats.length === 0) {
             // Create NewsStats entry if it doesn't exist
             const qInsert = "INSERT INTO NewsStats (post_id, view_count, comment_count, rating_avg) VALUES (?, 1, 0, 0)";
             db.query(qInsert, [post_id], (err) => {
               if (err) console.error("Error creating NewsStats:", err);
             });
           } else {
             // Update existing entry
             const qUpdate = "UPDATE NewsStats SET view_count = view_count + 1 WHERE post_id = ?";
             db.query(qUpdate, [post_id], (err) => {
               if (err) console.error("Error updating view_count:", err);
             });
           }
         });
       }

       return res.status(200).json("Đã cập nhật lịch sử.");
    });
  });
};

export const getHistoryPosts = (req, res) => {
  const userId = req.query.userId;
  const q = `
    SELECT DISTINCT 
      p.*, c.name as cat_name, rh.viewed_at,
      COALESCE(ns.view_count, 0) as view_count,
      (SELECT COUNT(*) FROM Bookmarks WHERE post_id = p.id AND user_id = ?) AS is_saved,
      (SELECT COUNT(*) FROM Likes WHERE post_id = p.id AND user_id = ?) AS is_liked
    FROM Posts p 
    JOIN ReadHistory rh ON p.id = rh.post_id 
    JOIN Categories c ON p.category_id = c.id
    LEFT JOIN NewsStats ns ON p.id = ns.post_id
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

// --- QUAN TRỌNG: HÀM NÀY ĐANG BỊ THIẾU ---
export const deleteHistory = (req, res) => {
  const userId = req.query.userId;
  const q = "DELETE FROM ReadHistory WHERE user_id = ?";

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Đã xóa toàn bộ lịch sử.");
  });
};