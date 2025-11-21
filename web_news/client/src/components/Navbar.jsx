import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import "../style.scss"; // Tí nữa mình style cho đẹp

const Navbar = () => {
  const [user, setUser] = useState(null);

  // Lấy thông tin user từ server session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/current");
        setUser(res.data);
      } catch (err) {
        // User not logged in or session expired
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
      setUser(null);
      window.location.reload(); // Load lại trang để cập nhật giao diện
    } catch (err) {
      console.error("Logout error:", err);
      // Still clear user state even if request fails
      setUser(null);
      window.location.reload();
    }
  };

  return (
    <div className="navbar">
      <div className="container">
        <div className="logo">
          <Link to="/">
             {/* Bạn có thể chèn ảnh logo vào đây */}
             <h2>MyNews</h2>
          </Link>
        </div>
        <div className="links">
          <Link className="link" to="/?cat=art">NGHỆ THUẬT</Link>
          <Link className="link" to="/?cat=science">KHOA HỌC</Link>
          <Link className="link" to="/?cat=technology">CÔNG NGHỆ</Link>
          <Link className="link" to="/?cat=cinema">ĐIỆN ẢNH</Link>
          
          {/* Phần hiển thị user */}
          <span>{user?.username}</span>
          {user ? (
            <span onClick={logout} style={{cursor:"pointer"}}>Đăng xuất</span>
          ) : (
            <Link className="link" to="/login">Đăng nhập</Link>
          )}
          
          {/* Nút viết bài chỉ hiện cho vui, sau này check Admin sau */}
          <span className="write">
            <Link className="link" to="/write">Viết bài</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;