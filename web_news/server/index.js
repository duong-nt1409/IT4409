import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser"; 
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/post.js";
 import adminRoutes from "./routes/admin.js"; 
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import userRoutes from "./routes/users.js";
import interactionRoutes from "./routes/interactions.js";
import multer from "multer";

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());


app.use(cookieParser()); 

//  Cấu hình CORS (Cho phép Frontend 5173 gửi cookie)
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true                // Cho phép gửi cookie/token
}));

// (Tùy chọn) Session - Nếu bạn dùng JWT thì cái này không quá cần thiết, nhưng để cũng được
app.use(session({
  secret: process.env.SESSION_SECRET || "secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/upload"); // Lưu thẳng vào thư mục public của client để hiển thị luôn
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname); // Đặt tên file kèm thời gian để không bị trùng
  },
});

const upload = multer({ storage });

// API Upload: Khi gọi vào đây, nó sẽ lưu ảnh và trả về tên file
app.post("/api/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});
// --- ROUTES ---
app.get("/", (req, res) => {
  res.json("API Server is running...");
});

// Add logging middleware for posts
app.use("/api/posts", (req, res, next) => {
  console.log(`📝 POSTS API: ${req.method} ${req.path}`);
  if (req.method === 'POST') {
    console.log("Request body:", req.body);
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
 app.use("/api/admin", adminRoutes); 
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/interactions", interactionRoutes);

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});