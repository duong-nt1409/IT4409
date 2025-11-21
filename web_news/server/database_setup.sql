-- 1. Tạo Database (Nếu chưa có)
CREATE DATABASE IF NOT EXISTS news_db;
USE news_db;

-- 2. Bảng Users (Cập nhật thêm role và ảnh đại diện)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  img VARCHAR(255), -- Ảnh đại diện (Avatar)
  role ENUM('user', 'admin') DEFAULT 'user', -- Phân quyền: user thường hoặc admin
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng Categories (Danh mục tin tức)
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

-- Thêm sẵn các danh mục mẫu để đỡ phải tạo tay
INSERT INTO categories (name) VALUES 
('art'), 
('science'), 
('technology'), 
('cinema'), 
('design'), 
('food');

-- 4. Bảng Posts (Bài viết tin tức)
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  `desc` VARCHAR(1000) NOT NULL, -- Mô tả ngắn
  img VARCHAR(255) NOT NULL,     -- Link ảnh bìa bài viết
  content TEXT NOT NULL,         -- Nội dung chi tiết (dài)
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  uid INT NOT NULL,              -- ID người viết (Liên kết với bảng users)
  cat_id INT DEFAULT NULL,       -- ID danh mục (Liên kết với bảng categories)
  
  -- Tạo khóa ngoại (Ràng buộc dữ liệu)
  FOREIGN KEY (uid) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (cat_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 5. (Tùy chọn) Bảng Comments - Nếu bạn muốn làm tính năng bình luận
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  desc_comment VARCHAR(500) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  uid INT NOT NULL,
  post_id INT NOT NULL,
  
  FOREIGN KEY (uid) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);