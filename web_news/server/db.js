import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config(); // Đọc file .env

export const db = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1", // Use 127.0.0.1 instead of localhost (forces IPv4)
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "", // Empty string for XAMPP default
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3307, // Explicitly set port
});

// Kiểm tra kết nối
db.connect((err) => {
  if (err) {
    console.error("❌ Kết nối MySQL thất bại:", err);
  } else {
    console.log("✅ Đã kết nối MySQL thành công!");
  }
});