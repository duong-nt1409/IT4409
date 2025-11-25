import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext"; // Import Context

const Navbar = () => {
  // Lấy currentUser và hàm logout từ AuthContext
  const { currentUser, logout } = useContext(AuthContext);

  return (
    <div className="navbar">
      <div className="container"> 
        
        <div className="logo">
          <Link to="/">
             <h2>MyNews</h2>
          </Link>
        </div>
        
        <div className="links">
          <Link className="link" to="/?cat=art"><h6>NGHỆ THUẬT</h6></Link>
          <Link className="link" to="/?cat=science"><h6>KHOA HỌC</h6></Link>
          <Link className="link" to="/?cat=technology"><h6>CÔNG NGHỆ</h6></Link>
          <Link className="link" to="/?cat=cinema"><h6>ĐIỆN ẢNH</h6></Link>
          <Link className="link" to="/?cat=food"><h6>THỰC PHẨM</h6></Link>
          <Link className="link" to="/?cat=DESIGN"><h6>KIẾN TRÚC</h6></Link>
          {currentUser ? (
            <Link className="link" to="/editor">Trang Editor</Link>
          ) : (
            <Link className="link" to="/editor-login">Đăng nhập Editor</Link>
          )}
          {/* HIỂN THỊ TÊN USER TỪ CONTEXT */}
          <span className="user-name">{currentUser?.username}</span>
          
          {currentUser ? (
            <span onClick={logout} className="logout-btn">Đăng xuất</span>
          ) : (
            <Link className="login-link" to="/login">Đăng nhập</Link>
          )}
          


          <span className="write">
            <Link to="/write">Viết bài</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;