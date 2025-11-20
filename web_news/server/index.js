import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js"; // <-- Import route vừa tạo

const app = express();

app.use(express.json());
app.use(cors());

// Sử dụng các Route
app.use("/api/auth", authRoutes); // <-- Định nghĩa đường dẫn gốc

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});