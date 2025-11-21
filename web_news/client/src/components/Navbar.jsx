import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  
  const logout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <div className="navbar">
      {/* QUAN TRỌNG: Thẻ này giúp nội dung co vào giữa 1024px */}
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
          
          <span className="user-name">{user?.username}</span>
          
          {user ? (
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