
import { db } from "./db.js";

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const run = async () => {
  try {
    console.log("🚀 Starting data seeding...");

    // 1. Get Users and Posts
    const users = await query("SELECT id FROM Users");
    const posts = await query("SELECT id, user_id FROM Posts");

    if (users.length === 0 || posts.length === 0) {
      console.log("❌ Need users and posts to seed data.");
      process.exit(1);
    }

    const userIds = users.map(u => u.id);
    const postIds = posts.map(p => p.id);

    // 2. Clear old stats (optional, but good for clean slate testing)
    // await query("DELETE FROM ReadHistory");
    // await query("DELETE FROM Likes");
    // await query("DELETE FROM Comments");
    // console.log("🧹 Cleared old stats.");

    // 3. Seed for last 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().slice(0, 10);
        console.log(`📅 Seeding for ${dateStr}...`);

        // Seed Views (ReadHistory)
        const viewsCount = getRandomInt(20, 50);
        for(let j=0; j<viewsCount; j++) {
            const pid = postIds[getRandomInt(0, postIds.length - 1)];
            const uid = userIds[getRandomInt(0, userIds.length - 1)];
            // Random time in that day
            const hours = getRandomInt(0, 23);
            const mins = getRandomInt(0, 59);
            const seconds = getRandomInt(0, 59);
            const dateTime = `${dateStr} ${hours}:${mins}:${seconds}`;
            
            await query("INSERT INTO ReadHistory (user_id, post_id, viewed_at) VALUES (?, ?, ?)", [uid, pid, dateTime]);
        }

        // Seed Likes
        const likesCount = getRandomInt(5, 15);
        for(let j=0; j<likesCount; j++) {
            const pid = postIds[getRandomInt(0, postIds.length - 1)];
            const uid = userIds[getRandomInt(0, userIds.length - 1)];
             // Random time
             const hours = getRandomInt(0, 23);
             const mins = getRandomInt(0, 59);
             const seconds = getRandomInt(0, 59);
             const dateTime = `${dateStr} ${hours}:${mins}:${seconds}`;

            // Try insert, ignore if duplicate
            try {
                 await query("INSERT INTO Likes (user_id, post_id, created_at) VALUES (?, ?, ?)", [uid, pid, dateTime]);
            } catch (err) {
                // Ignore duplicates
            }
        }

        // Seed Comments
        const commentsCount = getRandomInt(3, 10);
        for(let j=0; j<commentsCount; j++) {
            const pid = postIds[getRandomInt(0, postIds.length - 1)];
            const uid = userIds[getRandomInt(0, userIds.length - 1)];
            // Random time
            const hours = getRandomInt(0, 23);
            const mins = getRandomInt(0, 59);
            const seconds = getRandomInt(0, 59);
            const dateTime = `${dateStr} ${hours}:${mins}:${seconds}`;
            
            await query("INSERT INTO Comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)", [pid, uid, "Fake comment data for chart testing", dateTime]);
        }
    }

    console.log("✅ Seeding completed! Check your Admin Dashboard Charts.");
    process.exit(0);

  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};

run();
