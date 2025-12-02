import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; // <--- 1. Import axios
import { FaUser, FaBookmark, FaList, FaLink, FaSignOutAlt } from "react-icons/fa";

const Dropdown = ({ user, logout }) => {
  // 2. Tạo state để lưu số liệu thống kê
  const [stats, setStats] = useState({ savedCount: 0, viewedCount: 0 });

  // 3. Mỗi khi Dropdown này hiện ra, tự động gọi API lấy số liệu mới nhất
  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user) {
          const res = await axios.get(`http://localhost:8800/api/users/stats/${user.id}`);
          setStats(res.data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchStats();
  }, [user]); // Chạy lại nếu user thay đổi

  return (
    <div className="dropdown-menu">
      <div className="dropdown-header">
        <img 
          src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
          alt="Avatar" 
          className="dropdown-avatar"
        />
        <span className="dropdown-username">{user?.username}</span>
      </div>

      <hr />

      <ul className="dropdown-list">
        <li>
          <Link to="/profile">
            <FaUser className="icon" /> Thông tin tài khoản
          </Link>
        </li>
        <li>
          <Link to="/saved-posts">
            <FaBookmark className="icon" style={{color: "#7cb342"}} /> Tin bài đã lưu
            {/* 4. Hiển thị số liệu thật */}
            <span className="badge">{stats.savedCount}</span>
          </Link>
        </li>
        <li>
          <Link to="/viewed-posts">
            <FaList className="icon" style={{color: "#7cb342"}} /> Tin bài đã xem
            {/* 4. Hiển thị số liệu thật */}
            <span className="badge">{stats.viewedCount}</span>
          </Link>
        </li>
        
        <hr />
        
        <li onClick={logout} className="logout-item">
          <FaSignOutAlt className="icon" style={{color: "#d32f2f"}} /> Thoát tài khoản
        </li>
      </ul>
    </div>
  );
};

export default Dropdown;