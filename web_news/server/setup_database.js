import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Cấu hình kết nối
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  port: process.env.DB_PORT || 3306,
  multipleStatements: true // QUAN TRỌNG
});

const dbName = "web_news"; // Tên Database

console.log("🚀 Đang khởi tạo Database News Website...");

const initQuery = `
  -- 1. Reset Database
  DROP DATABASE IF EXISTS ${dbName};
  CREATE DATABASE ${dbName};
  USE ${dbName};

  -- 2. Bảng Roles
  CREATE TABLE Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
  );

  -- 3. Bảng Users (Có avatar và thông tin Editor)
  CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    avatar VARCHAR(255) DEFAULT 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    -- Thông tin Editor (cho đăng ký)
    name VARCHAR(100),
    age INT,
    years_of_experience INT,
    -- Thông tin chi tiết (cho admin quản lý)
    article_count INT DEFAULT 0,
    total_likes INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(id)
  );

  -- 4. Bảng Categories (Danh mục)
  CREATE TABLE Categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT -- Cho phép để trống (NULL)
  );

  -- 5. Bảng Tags
  CREATE TABLE Tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
  );

  -- 6. Bảng Posts (Bài viết - Có thumbnail & status)
  CREATE TABLE Posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NULL, -- cho phép NULL để ON DELETE SET NULL
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    thumbnail VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE SET NULL
);

  -- 7. Bảng PostTags
  CREATE TABLE PostTags (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
  );

  -- 8. Bảng Comments
  CREATE TABLE Comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
  );

  -- 9. Bảng Likes (Thích bài viết)
  CREATE TABLE Likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
  );

  -- ==========================================
  -- SEED DATA (DỮ LIỆU MẪU)
  -- ==========================================

  -- 1. Roles
  INSERT INTO Roles (name) VALUES ('Admin'), ('Editor'), ('User');

  -- 2. Users (Pass: 123456)
  INSERT INTO Users (username, email, password_hash, role_id, name, age, years_of_experience) VALUES 
  ('admin', 'admin@gmail.com', '$2a$10$N.zmdr9k7uOcQb376.e.oeJp.wz.iY/7x1.x1.x1.x1.x1.x1.x1.', 1, 'Admin User', 30, 5),
  ('user1', 'user1@gmail.com', '$2a$10$N.zmdr9k7uOcQb376.e.oeJp.wz.iY/7x1.x1.x1.x1.x1.x1.x1.', 3, 'Regular User', 25, 0),
  ('editor1', 'editor1@gmail.com', '$2a$10$N.zmdr9k7uOcQb376.e.oeJp.wz.iY/7x1.x1.x1.x1.x1.x1.x1.', 2, 'Nguyễn Văn Editor', 28, 3);

  -- 3. Categories (Đúng theo yêu cầu của bạn)
  INSERT INTO Categories (name) VALUES 
  ('art'), 
  ('science'), 
  ('technology'), 
  ('cinema'), 
  ('design'), 
  ('food');

  -- 4. Tags
  INSERT INTO Tags (name) VALUES ('#HotTrend'), ('#Review'), ('#Tips');

  -- 5. Posts mẫu
  INSERT INTO Posts (user_id, category_id, title, content, thumbnail, status, is_featured) VALUES 
  (1, 3, 'Công nghệ AI năm 2025', 'Nội dung về AI...', 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg', 'approved', TRUE),
  (1, 1, 'Triển lãm nghệ thuật số', 'Nội dung về Art...', 'https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg', 'approved', FALSE),
  (1, 4, 'Phim bom tấn mới ra rạp', 'Review phim...', 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 'approved', FALSE),
  (3, 2, 'Khám phá khoa học vũ trụ', 'Nội dung về khoa học vũ trụ...', 'https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg', 'approved', TRUE),
  (3, 5, 'Xu hướng thiết kế 2025', 'Nội dung về thiết kế...', 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg', 'approved', FALSE);

  -- 6. Likes mẫu (cho Editor - user_id = 3)
  INSERT INTO Likes (post_id, user_id) VALUES 
  (4, 1), (4, 2), (4, 3),
  (5, 1), (5, 2);

  -- 7. Comments mẫu (cho Editor - user_id = 3)
  INSERT INTO Comments (post_id, user_id, content) VALUES 
  (4, 1, 'Bài viết rất hay!'),
  (4, 2, 'Cảm ơn bạn đã chia sẻ'),
  (5, 1, 'Thông tin hữu ích');

  -- 8. Cập nhật thống kê cho Editor (user_id = 3)
  -- Số bài viết: 2, Tổng số like: 5, Số comment: 3
  UPDATE Users SET 
    article_count = (SELECT COUNT(*) FROM Posts WHERE user_id = 3),
    total_likes = (SELECT COUNT(*) FROM Likes WHERE post_id IN (SELECT id FROM Posts WHERE user_id = 3)),
    comment_count = (SELECT COUNT(*) FROM Comments WHERE post_id IN (SELECT id FROM Posts WHERE user_id = 3))
  WHERE id = 3;
`;

// Thực thi
connection.query(initQuery, (err) => {
  if (err) {
    console.error("❌ Lỗi tạo database:", err);
  } else {
    console.log("✅ Database 'news_website' đã được cài đặt thành công!");
    console.log("✅ Đã cập nhật danh mục theo yêu cầu.");
    console.log("⚠️  Nhớ sửa file .env thành: DB_NAME=web_news");
  }
  connection.end();
});