import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Create connection without specifying database (to create it)
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  port: process.env.DB_PORT || 3307,
});

const dbName = process.env.DB_NAME || "web_news";

console.log("🔧 Setting up database...");

// Create database
connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err) => {
  if (err) {
    console.error("❌ Error creating database:", err);
    connection.end();
    return;
  }
  console.log(`✅ Database '${dbName}' created or already exists`);

  // Use the database
  connection.query(`USE ${dbName}`, (err) => {
    if (err) {
      console.error("❌ Error selecting database:", err);
      connection.end();
      return;
    }

    // Create users table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    connection.query(createTableQuery, (err) => {
      if (err) {
        console.error("❌ Error creating users table:", err);
        connection.end();
        return;
      }
      console.log("✅ Users table created or already exists");
      console.log("🎉 Database setup completed successfully!");
      connection.end();
    });
  });
});

