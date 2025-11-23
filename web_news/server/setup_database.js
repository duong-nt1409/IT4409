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

  -- 3. Bảng Users (Có avatar)
  CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    avatar VARCHAR(255) DEFAULT 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
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

  -- ==========================================
  -- SEED DATA (DỮ LIỆU MẪU)
  -- ==========================================

  -- 1. Roles
  INSERT INTO Roles (name) VALUES ('Admin'), ('Editor'), ('User');

  -- 2. Users (Pass: 123456)
  INSERT INTO Users (username, email, password_hash, role_id) VALUES 
  ('admin', 'admin@gmail.com', '$2a$10$N.zmdr9k7uOcQb376.e.oeJp.wz.iY/7x1.x1.x1.x1.x1.x1.x1.', 1),
  ('user1', 'user1@gmail.com', '$2a$10$N.zmdr9k7uOcQb376.e.oeJp.wz.iY/7x1.x1.x1.x1.x1.x1.x1.', 3);

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
  (1, 4, 'Phim bom tấn mới ra rạp', 'Review phim...', 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 'approved', FALSE);
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