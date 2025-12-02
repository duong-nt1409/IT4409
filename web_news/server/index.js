import express from "express";
import cors from "cors";
import session from "express-session";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/post.js";
import adminRoutes from "./routes/admin.js";
const app = express();

app.use(express.json());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173"
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.get("/", (req, res) => {
  res.json({ 
    message: "Web News API Server is running!",
    endpoints: {
      auth: "/api/auth",
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      logout: "POST /api/auth/logout",
      currentUser: "GET /api/auth/current"
    }
  });
});

// Sử dụng các Route
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes);
const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});