import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import Dropdown from "./Dropdown"; 
import { FaCaretDown, FaSearch } from "react-icons/fa"; 

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const menuRef = useRef();

  const handleSearch = (e) => {
    if ((e.type === "click" || e.key === "Enter") && query.trim() !== "") {
      setOpenDropdown(false);
      navigate(`/?search=${query.trim()}`);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="navbar">
      <div className="container"> 
        <div className="logo">
          <Link to="/"><h2>MyNews</h2></Link>
        </div>
        
        <div className="links">
          <Link className="link" to="/?cat=Thời sự"><h6>THỜI SỰ</h6></Link>
          <Link className="link" to="/?cat=Thế giới"><h6>THẾ GIỚI</h6></Link>
          <Link className="link" to="/?cat=Kinh doanh"><h6>KINH DOANH</h6></Link>
          <Link className="link" to="/?cat=Công nghệ"><h6>CÔNG NGHỆ</h6></Link>
          <Link className="link" to="/?cat=Thể thao"><h6>THỂ THAO</h6></Link>
          <Link className="link" to="/?cat=Giải trí"><h6>GIẢI TRÍ</h6></Link>
          
          {/* --- THANH TÌM KIẾM (Vị trí mới: Sát User Profile) --- */}
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <span className="search-icon" onClick={handleSearch}>
              <FaSearch />
            </span>
          </div>
          {/* -------------------------------------------------- */}

          {/* Phần User Profile */}
          {currentUser ? (
            <div className="user-menu-container" ref={menuRef}>
              <div 
                className="user-trigger" 
                onClick={() => setOpenDropdown(!openDropdown)}
              >
                <img 
                  src={currentUser.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                  alt="" 
                  className="nav-avatar" 
                />
                <span className="username">{currentUser.username}</span>
                <FaCaretDown className="icon-down" />
              </div>
              {openDropdown && <Dropdown user={currentUser} logout={logout} />}
            </div>
          ) : (
            <Link className="login-link" to="/login">Đăng nhập</Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;