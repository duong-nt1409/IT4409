import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const Login = () => {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });
  const [err, setError] = useState(null);

  const navigate = useNavigate();

  const { login, currentUser } = useContext(AuthContext);

  // Redirect nếu đã đăng nhập
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role_id === 1) {
        navigate("/admin");
      } else if (currentUser.role_id === 2) {
        navigate("/editor");
      } else {
        navigate("/");
      }
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(inputs);
      
      if (user.role_id === 1) {
        navigate("/admin");
      } else if (user.role_id === 2) {
        navigate("/editor");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data || "Đã xảy ra lỗi đăng nhập");
    }
  };

  return (
    <div className="auth">
      <form>
        <h1>Đăng Nhập</h1>
        
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