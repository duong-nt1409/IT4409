import express from "express";
import cors from "cors";
import session from "express-session";
import authRoutes from "./routes/auth.js"; // <-- Import route vừa tạo

const app = express();

app.use(express.json());
// Configure CORS to allow credentials (cookies)
// Allow common development ports for React/Vite
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost on common development ports
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173", // Vite default
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

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Root route
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
app.use("/api/auth", authRoutes); // <-- Định nghĩa đường dẫn gốc

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});