
import { db } from "./db.js";

const q = `
    SELECT 
      u.id, u.username, u.email, u.avatar, u.name, u.age, 
      u.years_of_experience as years_of_experience,
      u.created_at,
      COUNT(p.id) as post_count,
      COALESCE(SUM(p.view_count), 0) as total_views
    FROM Users u
    LEFT JOIN Posts p ON u.id = p.user_id
    WHERE u.role_id = 2 AND u.status = 'approved'
    GROUP BY u.id
    ORDER BY post_count DESC
`;

console.log("Running Query that mimics controller...");

db.query(q, (err, data) => {
    if (err) {
        console.error("❌ QUERY ERROR:", err.code, err.sqlMessage);
        console.error(err);
    } else {
        console.log("✅ Query Success. Rows found:", data.length);
        console.log("Sample Row:", data[0]);
    }
    process.exit();
});
