import { db } from "../db.js";
// Import hàm gửi mail vừa tạo
import { sendEmail } from "../utils/email.js"; 

export const getDashboardStats = (req, res) => {
  const q = `
    SELECT 
      (SELECT COUNT(*) FROM Users WHERE role_id = 3) as total_users,
      (SELECT COUNT(*) FROM Users WHERE role_id = 2) as total_editors,
      (SELECT COUNT(*) FROM Posts) as total_posts,
      (SELECT COALESCE(SUM(view_count), 0) FROM Posts) as total_views, 
      (SELECT COUNT(*) FROM Posts WHERE status = 'pending') as pending_posts
  `;
  // Lưu ý: Mình sửa total_views lấy từ bảng Posts (nếu bạn không dùng bảng NewsStats) 
  // hoặc giữ nguyên NewsStats nếu DB bạn có.

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data[0]);
  });
};

export const getEditorsList = (req, res) => {
  const q = `
    SELECT 
      u.id, u.username, u.email, u.avatar, u.name, u.age, 
      u.years_of_experience as years_of_experience,
      u.status,
      u.created_at,
      COUNT(p.id) as post_count,
      COALESCE(SUM(p.view_count), 0) as total_views
    FROM Users u
    LEFT JOIN Posts p ON u.id = p.user_id
    WHERE u.role_id = 2 AND u.status = 'approved'
    GROUP BY u.id
    ORDER BY post_count DESC
  `;

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const getPendingPosts = (req, res) => {
  const q = `
    SELECT p.*, u.username as author_name, c.name as category_name 
    FROM Posts p
    JOIN Users u ON p.user_id = u.id
    LEFT JOIN Categories c ON p.category_id = c.id
    WHERE p.status = 'pending'
    ORDER BY p.created_at ASC
  `;

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const updatePostStatus = (req, res) => {
  const postId = req.params.id;
  const status = req.body.status;

  const q = "UPDATE Posts SET status = ? WHERE id = ?";

  db.query(q, [status, postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Cập nhật trạng thái bài viết thành công!");
  });
};

export const deleteUser = (req, res) => {
  const userId = req.params.id;
  const q = "DELETE FROM Users WHERE id = ?";

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Đã xóa người dùng!");
  });
};

export const getPendingEditors = (req, res) => {
  const q = `
    SELECT id, username, email, name, age, 
           years_of_experience,
           created_at, avatar
    FROM Users
    WHERE role_id = 2 AND status = 'pending'
    ORDER BY created_at ASC
  `;

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

// --- HÀM NÀY ĐÃ ĐƯỢC SỬA ĐỂ GỬI MAIL ---
export const updateUserStatus = (req, res) => {
  const userId = req.params.id;
  const newStatus = req.body.status; // 'approved' hoặc 'rejected' (accepts 'active' for backward compatibility)

  // 1. Lấy thông tin User trước để gửi mail
  const qGetUser = "SELECT email, username FROM Users WHERE id = ?";
  
  db.query(qGetUser, [userId], (err, data) => {
    if (err || data.length === 0) return res.status(500).json("Không tìm thấy user");
    
    const userEmail = data[0].email;
    const userName = data[0].username;

    // 2. Cập nhật Status
    const qUpdate = "UPDATE Users SET status = ? WHERE id = ?";
    
    db.query(qUpdate, [newStatus, userId], async (err, result) => {
      if (err) return res.status(500).json(err);

      // 3. Gửi Email thông báo (Chạy ngầm, không chặn response)
      let subject = "";
      let htmlContent = "";

      if (newStatus === 'approved' || newStatus === 'active') {
        subject = "🎉 Chúc mừng! Hồ sơ Nhà báo của bạn đã được duyệt";
        htmlContent = `
          <h3>Xin chào ${userName},</h3>
          <p>Chúc mừng bạn! Yêu cầu đăng ký trở thành Nhà báo tại <b>MyNews</b> của bạn đã được Admin phê duyệt.</p>
          <p>Bây giờ bạn có thể đăng nhập và bắt đầu viết bài.</p>
          <a href="http://localhost:5173/login">Đăng nhập ngay</a>
        `;
      } else {
        subject = "❌ Thông báo về hồ sơ đăng ký Nhà báo";
        htmlContent = `
          <h3>Xin chào ${userName},</h3>
          <p>Rất tiếc, hồ sơ đăng ký trở thành Nhà báo của bạn chưa phù hợp với tiêu chí của chúng tôi vào lúc này.</p>
          <p>Hồ sơ của bạn đã bị từ chối. Bạn có thể liên hệ admin để biết thêm chi tiết.</p>
        `;
      }

      // Gọi hàm gửi mail và trả về trạng thái gửi email cho client
      let emailSent = true;
      let emailErrorMessage = null;
      try {
        await sendEmail(userEmail, subject, htmlContent);
      } catch (emailError) {
        console.log("Lỗi gửi mail:", emailError);
        emailSent = false;
        emailErrorMessage = emailError.message || String(emailError);
      }

      if (emailSent) {
        return res.status(200).json({ message: "Đã cập nhật trạng thái và gửi email thông báo!", emailSent: true });
      } else {
        return res.status(200).json({ message: "Đã cập nhật trạng thái, nhưng gửi email thất bại.", emailSent: false, emailError: emailErrorMessage });
      }
    });
  });
};

export const deletePost = (req, res) => {
  const postId = req.params.id;
  const q = "DELETE FROM Posts WHERE id = ?";

  db.query(q, [postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Đã xóa bài viết!");
  });
};

export const getReportedPosts = (req, res) => {
  const q = `
    SELECT p.id, p.title, u.username as author_name, COUNT(r.id) as report_count
    FROM Posts p
    JOIN Users u ON p.user_id = u.id
    JOIN Reports r ON p.id = r.post_id
    GROUP BY p.id
    ORDER BY report_count DESC
  `;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const deleteReports = (req, res) => {
  const postId = req.params.id;
  const q = "DELETE FROM Reports WHERE post_id = ?";

  db.query(q, [postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Đã xóa báo cáo của bài viết!");
  });
};

export const getWeeklyStats = (req, res) => {
  const q = `
    SELECT 
      DATE(created_at) as date,
      COUNT(id) as count
    FROM ReadHistory
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;
  const qLikes = `
    SELECT 
      DATE(created_at) as date,
      COUNT(id) as count
    FROM Likes
    -- Giả sử bảng Likes chưa có created_at, nếu chưa có thì phải thêm, tạm thời dùng NOW() cho demo nếu db chưa có
    -- Nhưng theo logic phải có created_at. Kiểm tra lại DB. 
    -- Nếu bảng Likes chưa có created_at, ta sẽ không lấy được theo ngày.
    -- Giả định bảng Likes đã có created_at hoặc ta sẽ fix DB sau.
    -- Tương tự với Comments.
    GROUP BY DATE(created_at) -- Cần fix DB Likes/Comments nếu chưa có created_at
    ORDER BY date ASC
  `;
  
  // Lấy 7 ngày gần nhất (bao gồm hôm nay)
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10)); // Format YYYY-MM-DD
  }

  // Helper functions to execute queries
  const executeQuery = (query) => {
    return new Promise((resolve, reject) => {
      db.query(query, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  };

  const queryViews = `
    SELECT DATE(viewed_at) as date, COUNT(*) as count 
    FROM ReadHistory 
    WHERE viewed_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) 
    GROUP BY date
  `;

  const queryComments = `
    SELECT DATE(created_at) as date, COUNT(*) as count 
    FROM Comments 
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) 
    GROUP BY date
  `;

  const queryLikes = `
    SELECT DATE(created_at) as date, COUNT(*) as count 
    FROM Likes 
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) 
    GROUP BY date
  `;

  Promise.all([
    executeQuery(queryViews),
    executeQuery(queryComments),
    executeQuery(queryLikes).catch(err => [])
  ])
  .then(([views, comments, likes]) => {
    const result = days.map(date => {
      // Helper to format date consistent with how days array is formatted
      const formatDate = (d) => d ? new Date(d).toISOString().slice(0, 10) : null;

      const v = views.find(item => formatDate(item.date) === date);
      const c = comments.find(item => formatDate(item.date) === date);
      const l = likes.find(item => formatDate(item.date) === date);

      return {
        date,
        views: v ? v.count : 0,
        comments: c ? c.count : 0,
        likes: l ? l.count : 0
      };
    });
    res.status(200).json(result);
  })
  .catch(err => {
    console.error(err);
    res.status(500).json(err);
  });
};

export const getReportDetails = (req, res) => {
    const postId = req.params.id;

    const qPost = `
      SELECT p.id, p.title, p.status, u.username as author_name 
      FROM Posts p 
      JOIN Users u ON p.user_id = u.id 
      WHERE p.id = ?
    `;

    const qReports = `
        SELECT r.id, r.reason, r.created_at, u.username as reporter_name
        FROM Reports r
        JOIN Users u ON r.user_id = u.id
        WHERE r.post_id = ?
        ORDER BY r.created_at DESC
    `;

    db.query(qPost, [postId], (err, postData) => {
       if (err) return res.status(500).json(err);
       if (postData.length === 0) return res.status(404).json("Post not found");

       db.query(qReports, [postId], (err, reportsData) => {
          if (err) return res.status(500).json(err);
          
          return res.status(200).json({
             post: postData[0],
             reports: reportsData
          });
       });
    });
};
