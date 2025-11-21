import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "web_news",
  port: process.env.DB_PORT || 3307,
});

console.log("🔍 Checking database...\n");

// Check if database exists
connection.query("SHOW DATABASES LIKE ?", [process.env.DB_NAME || "web_news"], (err, results) => {
  if (err) {
    console.error("❌ Error:", err);
    connection.end();
    return;
  }

  if (results.length === 0) {
    console.log("❌ Database 'web_news' does not exist");
    connection.end();
    return;
  }

  console.log("✅ Database 'web_news' exists\n");

  // Show all tables
  connection.query("SHOW TABLES", (err, tables) => {
    if (err) {
      console.error("❌ Error showing tables:", err);
      connection.end();
      return;
    }

    console.log("📊 Tables in database:");
    tables.forEach((table) => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    console.log();

    // Show users table structure
    connection.query("DESCRIBE users", (err, structure) => {
      if (err) {
        console.error("❌ Error describing users table:", err);
        connection.end();
        return;
      }

      console.log("📋 Users table structure:");
      console.table(structure);
      console.log();

      // Show all users (without passwords)
      connection.query("SELECT id, username, email, created_at FROM users", (err, users) => {
        if (err) {
          console.error("❌ Error fetching users:", err);
          connection.end();
          return;
        }

        console.log(`👥 Users in database (${users.length} total):`);
        if (users.length === 0) {
          console.log("   No users found");
        } else {
          console.table(users);
        }

        connection.end();
      });
    });
  });
});

