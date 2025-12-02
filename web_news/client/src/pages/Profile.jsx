import React, { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { FaUser, FaBookmark, FaList, FaSignOutAlt, FaArrowLeft } from "react-icons/fa"; 

const Profile = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null); 
  
  // State lưu thông tin User
  const [inputs, setInputs] = useState({
    name: currentUser?.name || currentUser?.username || "",
    email: currentUser?.email || "",
    avatar: currentUser?.avatar || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    dob: currentUser?.dob ? moment(currentUser.dob).format("YYYY-MM-DD") : "",
    gender: currentUser?.gender || "male",
  });

  // State lưu thống kê (MỚI)
  const [stats, setStats] = useState({ savedCount: 0, viewedCount: 0 });
  const [status, setStatus] = useState(null);

  // Gọi API lấy thống kê khi vào trang
  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (currentUser) {
          const res = await axios.get(`http://localhost:8800/api/users/stats/${currentUser.id}`);
          setStats(res.data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchStats();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) { console.log(err); }
  };

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("http://localhost:8800/api/upload", formData);
      const fileName = res.data;
      const avatarUrl = `/upload/${fileName}`; 
      setInputs((prev) => ({ ...prev, avatar: avatarUrl }));
    } catch (err) { alert("Lỗi upload ảnh!"); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8800/api/users/${currentUser.id}`, inputs);
      const updatedUser = { ...currentUser, ...inputs };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setStatus("Cập nhật thành công!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) { setStatus("Lỗi cập nhật!"); }
  };

  return (
    <div className="profile-wrapper">
      <div className="container">
        
        {/* --- SIDEBAR --- */}
        <div className="sidebar">
          <div className="sidebar-home-btn">
            <Link to="/" className="back-link">
               <FaArrowLeft className="icon-arrow" />
               <span className="logo-text">MyNews</span>
               <span className="small-text">Trang chủ</span>
            </Link>
          </div>

          <div className="user-info-header">
            <img src={inputs.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="Avatar" />
            <span className="user-name">{inputs.name}</span>
          </div>
          
          <ul className="sidebar-menu">
            <li className="active">
              <FaUser className="icon" /> Thông tin tài khoản
            </li>
            
            {/* HIỂN THỊ SỐ LIỆU THỰC TẾ */}
            <li>
              <Link to="/saved-posts" style={{display:"flex", alignItems:"center", width:"100%", color:"inherit", textDecoration:"none"}}>
                 <FaBookmark className="icon gray" /> Tin bài đã lưu 
                 <span className="badge">{stats.savedCount}</span>
              </Link>
            </li>
            <li>
              <Link to="/viewed-posts" style={{display:"flex", alignItems:"center", width:"100%", color:"inherit", textDecoration:"none"}}>
                 <FaList className="icon gray" /> Tin bài đã xem 
                 <span className="badge">{stats.viewedCount}</span>
              </Link>
            </li>
            
            <li className="logout" onClick={handleLogout}>
                <FaSignOutAlt className="icon gray" /> Thoát tài khoản
            </li>
          </ul>
        </div>

        {/* --- MAIN FORM (Giữ nguyên) --- */}
        <div className="main-profile">
           <h2 className="title">Thông tin tài khoản</h2>
           
           <div className="avatar-section">
              <label>Ảnh đại diện</label>
              <div className="avatar-row">
                <img src={inputs.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="" />
                <div className="actions">
                  <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleUpload} />
                  <button type="button" className="btn-change-photo" onClick={() => fileInputRef.current.click()}>Đổi ảnh</button>
                  <p className="note">Định dạng PNG, JPG | Dung lượng tối đa 5MB</p>
                </div>
              </div>
           </div>

           <form>
              <div className="form-group">
                <label>Họ và tên <span className="req">*</span></label>
                <input type="text" name="name" value={inputs.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                  <label>Email <span className="req">*</span></label>
                  <input type="email" value={inputs.email} disabled className="disabled" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input type="text" name="phone" value={inputs.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Ngày sinh</label>
                  <input type="date" name="dob" value={inputs.dob} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Địa chỉ</label>
                <textarea rows="3" name="address" value={inputs.address} onChange={handleChange}></textarea>
              </div>
              <div className="form-group">
                <label>Giới tính</label>
                <div className="radio-group">
                  <label><input type="radio" name="gender" value="male" checked={inputs.gender === 'male'} onChange={handleChange} /> Nam</label>
                  <label><input type="radio" name="gender" value="female" checked={inputs.gender === 'female'} onChange={handleChange} /> Nữ</label>
                </div>
              </div>

              {status && <p className="status-msg">{status}</p>}

              <div className="form-actions">
                <button type="submit" className="btn-save" onClick={handleUpdate}>Lưu thay đổi</button>
              </div>
           </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;