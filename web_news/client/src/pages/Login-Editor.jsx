import React, { useState, useContext } from "react"; // Thêm useContext
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext"; // Import Context

const LoginEditor = () => {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });
  const [err, setError] = useState(null);

  const navigate = useNavigate();

  // Lấy hàm login từ Context
  const { editorLogin } = useContext(AuthContext);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gọi hàm login của Context (nó sẽ tự gọi API và lưu user)
      await editorLogin(inputs);
      
      // Chuyển hướng về trang thông tin Editor
      navigate("/editor");
    } catch (err) {
      // Xử lý lỗi nếu API trả về lỗi
      setError(err.response?.data || "Đã xảy ra lỗi đăng nhập");
      console.log(err);
    }
  };

  return (
    <div className="auth">
      <form>
        <h1>Đăng Nhập Editor</h1>
        
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
          Bạn chưa có tài khoản? <Link to="/register-editor">Đăng ký</Link>
        </span>
        <button onClick={() => navigate("/")}>Home</button>
      </form>
    </div>
  );
};

export default LoginEditor;