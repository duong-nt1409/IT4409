import { db } from "../db.js";

// Lấy danh sách bài viết
export const getPosts = (req, res) => {
  const catName = req.query.cat;
  const uid = req.query.uid; // Lọc theo User ID (cho Editor)
  const status = req.query.status; // Optional status filter

  let q = "SELECT p.*, c.name as cat_name FROM Posts p LEFT JOIN Categories c ON p.category_id = c.id WHERE 1=1";
  const params = [];

  // If uid is provided (for editor dashboard), show all posts regardless of status
  // Otherwise, only show approved posts on the home page
  if (!uid) {
    q += " AND p.status = 'approved'";
  }

  if (catName) {
    q += " AND c.name = ?";
    params.push(catName);
  }

  if (uid) {
    q += " AND p.user_id = ?";
    params.push(uid);
  }

  if (status) {
    q += " AND p.status = ?";
    params.push(status);
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
  console.log("=== ADD POST REQUEST RECEIVED ===");
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers);
  
  const { title, content, thumbnail, category_id, user_id } = req.body;

  // Log received data for debugging
  console.log("Parsed post data:", {
    title,
    contentLength: content?.length,
    thumbnail,
    category_id,
    user_id,
  });

  // Validation
  if (!title || !title.trim()) {
    return res.status(400).json("Vui lòng nhập đầy đủ tiêu đề và nội dung!");
  }

  if (!content || !content.trim() || content.trim() === "<p><br></p>") {
    return res.status(400).json("Vui lòng nhập đầy đủ tiêu đề và nội dung!");
  }

  if (!user_id) {
    return res.status(401).json("Bạn cần đăng nhập để đăng bài!");
  }

  // Insert post with approved status
  const q = `
    INSERT INTO Posts (user_id, category_id, title, content, thumbnail, status) 
    VALUES (?, ?, ?, ?, ?, 'pending')
  `;

  const values = [
    user_id,
    category_id || null,
    title.trim(),
    content,
    thumbnail || null,
  ];

  console.log("Executing query with values:", values);

  console.log("About to execute query:", q);
  console.log("With values:", values);
  console.log("Database connection state:", db.state);

  db.query(q, values, (err, data) => {
    if (err) {
      console.error("❌ ERROR creating post:", err);
      console.error("Error details:", {
        code: err.code,
        sqlMessage: err.sqlMessage,
        sql: err.sql,
        errno: err.errno,
      });
      return res.status(500).json("Lỗi khi tạo bài viết: " + err.message);
    }

    console.log("✅ Post created successfully with ID:", data.insertId);
    console.log("Insert result:", data);

    // Also create NewsStats entry for the new post
    const statsQuery = "INSERT INTO NewsStats (post_id, view_count, comment_count, rating_avg) VALUES (?, 0, 0, 0)";
    db.query(statsQuery, [data.insertId], (statsErr) => {
      if (statsErr) {
        console.error("Error creating stats:", statsErr);
        // Don't fail the request if stats creation fails
      } else {
        console.log("NewsStats created for post ID:", data.insertId);
      }
    });

    return res.status(200).json({
      message: "Bài viết đã được tạo thành công!",
      postId: data.insertId,
    });
  });
};

export const deletePost = (req, res) => {
  const postId = req.params.id;
  const { user_id } = req.body;

  console.log("=== DELETE POST REQUEST RECEIVED ===");
  console.log("Post ID:", postId);
  console.log("User ID:", user_id);

  // Validation
  if (!user_id) {
    return res.status(401).json("Bạn cần đăng nhập để xóa bài viết!");
  }

  // First, check if the post exists and belongs to the user
  const checkQuery = "SELECT id, user_id FROM Posts WHERE id = ?";
  
  db.query(checkQuery, [postId], (err, data) => {
    if (err) {
      console.error("❌ ERROR checking post:", err);
      return res.status(500).json("Lỗi khi kiểm tra bài viết: " + err.message);
    }

    if (data.length === 0) {
      return res.status(404).json("Không tìm thấy bài viết!");
    }

    if (data[0].user_id !== user_id) {
      return res.status(403).json("Bạn không có quyền xóa bài viết này!");
    }

    // Delete the post (CASCADE will automatically delete related records)
    const deleteQuery = "DELETE FROM Posts WHERE id = ? AND user_id = ?";
    
    db.query(deleteQuery, [postId, user_id], (deleteErr, deleteData) => {
      if (deleteErr) {
        console.error("❌ ERROR deleting post:", deleteErr);
        console.error("Error details:", {
          code: deleteErr.code,
          sqlMessage: deleteErr.sqlMessage,
          sql: deleteErr.sql,
          errno: deleteErr.errno,
        });
        return res.status(500).json("Lỗi khi xóa bài viết: " + deleteErr.message);
      }

      if (deleteData.affectedRows === 0) {
        return res.status(404).json("Không tìm thấy bài viết hoặc bạn không có quyền xóa!");
      }

      console.log("✅ Post deleted successfully. ID:", postId);
      console.log("Affected rows:", deleteData.affectedRows);

      return res.status(200).json({
        message: "Bài viết đã được xóa thành công!",
        postId: postId,
      });
    });
  });
};

export const updatePost = (req, res) => {
  const postId = req.params.id;
  const { title, content, thumbnail, category_id, user_id } = req.body;

  console.log("=== UPDATE POST REQUEST RECEIVED ===");
  console.log("Post ID:", postId);
  console.log("Request body:", req.body);

  // Validation
  if (!title || !title.trim()) {
    return res.status(400).json("Vui lòng nhập đầy đủ tiêu đề và nội dung!");
  }

  if (!content || !content.trim() || content.trim() === "<p><br></p>") {
    return res.status(400).json("Vui lòng nhập đầy đủ tiêu đề và nội dung!");
  }

  if (!user_id) {
    return res.status(401).json("Bạn cần đăng nhập để chỉnh sửa bài viết!");
  }

  // Update post - keep the original status unless explicitly changed
  const q = `
    UPDATE Posts 
    SET title = ?, 
        content = ?, 
        thumbnail = ?, 
        category_id = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `;

  const values = [
    title.trim(),
    content,
    thumbnail || null,
    category_id || null,
    postId,
    user_id,
  ];

  console.log("Executing update query:", q);
  console.log("With values:", values);

  db.query(q, values, (err, data) => {
    if (err) {
      console.error("❌ ERROR updating post:", err);
      console.error("Error details:", {
        code: err.code,
        sqlMessage: err.sqlMessage,
        sql: err.sql,
        errno: err.errno,
      });
      return res.status(500).json("Lỗi khi cập nhật bài viết: " + err.message);
    }

    if (data.affectedRows === 0) {
      return res.status(404).json("Không tìm thấy bài viết hoặc bạn không có quyền chỉnh sửa!");
    }

    console.log("✅ Post updated successfully. ID:", postId);
    console.log("Affected rows:", data.affectedRows);

    return res.status(200).json({
      message: "Bài viết đã được cập nhật thành công!",
      postId: postId,
    });
  });
};