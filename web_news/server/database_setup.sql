-- Database Setup Script for Web News Project
-- Run this script in your MySQL database to create the users table

-- Create database (if it doesn't exist)
-- CREATE DATABASE IF NOT EXISTS web_news;
-- USE web_news;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Insert a test user (password is 'test123' hashed)
-- You can use this to test login immediately
-- Password hash for 'test123': $2a$10$rOzJqZqZqZqZqZqZqZqZqO
-- Better to register through the app to get proper hash

-- Verify table was created
SELECT * FROM users;

