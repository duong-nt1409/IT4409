import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const Navbar = () => {
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
          <Link className="link" to="/?cat=Thời sự"><h6>THỜI SỰ</h6></Link>
          <Link className="link" to="/?cat=Thế giới"><h6>THẾ GIỚI</h6></Link>
          <Link className="link" to="/?cat=Kinh doanh"><h6>KINH DOANH</h6></Link>
          <Link className="link" to="/?cat=Công nghệ"><h6>CÔNG NGHỆ</h6></Link>
          <Link className="link" to="/?cat=Thể thao"><h6>THỂ THAO</h6></Link>
          <Link className="link" to="/?cat=Giải trí"><h6>GIẢI TRÍ</h6></Link>
          {currentUser?.role_id === 2 ? (
            <Link className="link" to="/editor">Trang Editor</Link>
          ) : (
            <Link className="link" to="/editor-login">Đăng nhập Editor</Link>
          )}
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