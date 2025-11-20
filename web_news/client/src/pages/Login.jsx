import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });
  const [err, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8800/api/auth/login", inputs);
      
      // QUAN TRỌNG: Lưu thông tin user vào Local Storage
      localStorage.setItem("user", JSON.stringify(res.data));
      
      // Chuyển hướng về Trang Chủ
      navigate("/");
    } catch (err) {
      setError(err.response.data);
    }
  };

  return (
    <div className="auth">
      {/* Đã xóa h1 ở đây */}
      <form>
        <h1>Đăng Nhập</h1> {/* Đã chuyển h1 vào trong này */}
        
        <input
          type="text"
          placeholder="username"
          name="username"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          name="password"
          onChange={handleChange}
        />
        <button onClick={handleSubmit}>Đăng Nhập</button>
        {err && <p>{err}</p>}
        <span>
          Bạn chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </span>
      </form>
    </div>
  );
};

export default Login;