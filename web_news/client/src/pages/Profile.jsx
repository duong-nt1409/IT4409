import React, { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { FaUser, FaBookmark, FaList, FaSignOutAlt, FaArrowLeft, FaEdit, FaThumbsUp, FaComment, FaEye, FaFileAlt, FaCheckCircle, FaClock, FaTimesCircle, FaTimes, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBirthdayCake, FaVenusMars } from "react-icons/fa"; 

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
  const [editorStats, setEditorStats] = useState(null);
  const [status, setStatus] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // "profile" or "editor"
  const isEditor = currentUser?.role_id === 2;

  // Gọi API lấy thống kê khi vào trang
  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (currentUser) {
          const res = await axios.get(`http://localhost:8800/api/users/stats/${currentUser.id}`);
          setStats(res.data);
          
          // Nếu là Editor, lấy thống kê Editor
          if (isEditor) {
            try {
              const editorRes = await axios.get(`http://localhost:8800/api/users/editor-stats/${currentUser.id}`);
              setEditorStats(editorRes.data);
            } catch (err) {
              console.log("Error fetching editor stats:", err);
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchStats();
  }, [currentUser, isEditor]);

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
    } catch (err) { 
      console.log(err);
      alert("Lỗi upload ảnh!"); 
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8800/api/users/${currentUser.id}`, inputs);
      const updatedUser = { ...currentUser, ...inputs };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setStatus("Cập nhật thành công!");
      setShowEditModal(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) { 
      console.log(err);
      setStatus("Lỗi cập nhật!"); 
    }
  };

  const openEditModal = () => {
    setInputs({
      name: currentUser?.name || currentUser?.username || "",
      email: currentUser?.email || "",
      avatar: currentUser?.avatar || "",
      phone: currentUser?.phone || "",
      address: currentUser?.address || "",
      dob: currentUser?.dob ? moment(currentUser.dob).format("YYYY-MM-DD") : "",
      gender: currentUser?.gender || "male",
    });
    setStatus(null);
    setShowEditModal(true);
  };

  return (
    <div className="profile-wrapper">
      <div className="container">
        
        {/* --- SIDEBAR --- */}
        <div className="sidebar">
          <div className="sidebar-home-btn">
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
                 <FaBookmark className="icon gray" /> Tin bài đã lưu:  
                 <span className="badge">{stats.savedCount}</span>
              </Link>
            </li>
            <li>
              <Link to="/viewed-posts" style={{display:"flex", alignItems:"center", width:"100%", color:"inherit", textDecoration:"none"}}>
                 <FaList className="icon gray" /> Tin bài đã xem : 
                 <span className="badge">{stats.viewedCount}</span>
              </Link>
            </li>
            
            {/* Editor menu items */}
            {isEditor && (
              <li>
                <Link to="/editor" style={{display:"flex", alignItems:"center", width:"100%", color:"inherit", textDecoration:"none"}}>
                  <FaEdit className="icon" style={{color: "#1976d2"}} /> Trang Editor
                </Link>
              </li>
            )}
            
            <li className="logout" onClick={handleLogout}>
                <FaSignOutAlt className="icon gray" /> Thoát tài khoản
            </li>
          </ul>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="main-profile">
          {/* Tab Navigation */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "30px", borderBottom: "2px solid #e0e0e0" }}>
            <button
              onClick={() => setActiveTab("profile")}
              style={{
                padding: "12px 24px",
                border: "none",
                background: "transparent",
                borderBottom: activeTab === "profile" ? "3px solid #1976d2" : "none",
                color: activeTab === "profile" ? "#1976d2" : "#666",
                fontWeight: activeTab === "profile" ? "bold" : "normal",
                cursor: "pointer",
                fontSize: "16px",
                transition: "all 0.3s"
              }}
            >
              <FaUser style={{ marginRight: "8px" }} /> Thông tin cá nhân
            </button>
            {isEditor && (
              <button
                onClick={() => setActiveTab("editor")}
                style={{
                  padding: "12px 24px",
                  border: "none",
                  background: "transparent",
                  borderBottom: activeTab === "editor" ? "3px solid #1976d2" : "none",
                  color: activeTab === "editor" ? "#1976d2" : "#666",
                  fontWeight: activeTab === "editor" ? "bold" : "normal",
                  cursor: "pointer",
                  fontSize: "16px",
                  transition: "all 0.3s"
                }}
              >
                <FaEdit style={{ marginRight: "8px" }} /> Thông tin Editor
              </button>
            )}
          </div>

          {/* Profile Tab Content */}
          {activeTab === "profile" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <h2 className="title" style={{ margin: 0 }}>Thông tin tài khoản</h2>
                <button
                  onClick={openEditModal}
                  style={{
                    padding: "10px 20px",
                    background: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "bold",
                    fontSize: "14px"
                  }}
                >
                  <FaEdit /> Chỉnh sửa
                </button>
              </div>

              {/* Read-only Profile Display */}
              <div style={{
                background: "white",
                borderRadius: "12px",
                padding: "40px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "40px" }}>
                  <img
                    src={currentUser?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt="Avatar"
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "4px solid #1976d2",
                      marginBottom: "20px"
                    }}
                  />
                  <h3 style={{ margin: "10px 0", fontSize: "24px", color: "#333" }}>
                    {currentUser?.name || currentUser?.username || "Chưa có tên"}
                  </h3>
                </div>

                <div style={{ display: "grid", gap: "25px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "15px", padding: "15px", background: "#f8f9fa", borderRadius: "8px" }}>
                    <FaEnvelope style={{ color: "#1976d2", fontSize: "20px", marginTop: "3px", minWidth: "20px" }} />
                    <div>
                      <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Email</div>
                      <div style={{ fontSize: "16px", color: "#333", fontWeight: "500" }}>{currentUser?.email || "Chưa có"}</div>
                    </div>
                  </div>

                  {currentUser?.phone && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "15px", padding: "15px", background: "#f8f9fa", borderRadius: "8px" }}>
                      <FaPhone style={{ color: "#1976d2", fontSize: "20px", marginTop: "3px", minWidth: "20px" }} />
                      <div>
                        <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Số điện thoại</div>
                        <div style={{ fontSize: "16px", color: "#333", fontWeight: "500" }}>{currentUser.phone}</div>
                      </div>
                    </div>
                  )}

                  {currentUser?.dob && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "15px", padding: "15px", background: "#f8f9fa", borderRadius: "8px" }}>
                      <FaBirthdayCake style={{ color: "#1976d2", fontSize: "20px", marginTop: "3px", minWidth: "20px" }} />
                      <div>
                        <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Ngày sinh</div>
                        <div style={{ fontSize: "16px", color: "#333", fontWeight: "500" }}>
                          {moment(currentUser.dob).format("DD/MM/YYYY")}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentUser?.address && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "15px", padding: "15px", background: "#f8f9fa", borderRadius: "8px" }}>
                      <FaMapMarkerAlt style={{ color: "#1976d2", fontSize: "20px", marginTop: "3px", minWidth: "20px" }} />
                      <div>
                        <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Địa chỉ</div>
                        <div style={{ fontSize: "16px", color: "#333", fontWeight: "500" }}>{currentUser.address}</div>
                      </div>
                    </div>
                  )}

                  {currentUser?.gender && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "15px", padding: "15px", background: "#f8f9fa", borderRadius: "8px" }}>
                      <FaVenusMars style={{ color: "#1976d2", fontSize: "20px", marginTop: "3px", minWidth: "20px" }} />
                      <div>
                        <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Giới tính</div>
                        <div style={{ fontSize: "16px", color: "#333", fontWeight: "500" }}>
                          {currentUser.gender === 'male' ? 'Nam' : currentUser.gender === 'female' ? 'Nữ' : currentUser.gender}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Editor Tab Content */}
          {activeTab === "editor" && isEditor && editorStats && (
            <div>
              <h2 className="title" style={{ marginBottom: "30px" }}>Thông tin Editor</h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "20px" }}>
                {/* Years of Experience */}
                {editorStats.years_of_experience && (
                  <div style={{ padding: "20px", background: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                      <FaClock style={{ color: "#667eea", fontSize: "24px" }} />
                      <span style={{ fontWeight: "bold", color: "#333", fontSize: "14px" }}>Kinh nghiệm</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "32px", color: "#667eea", fontWeight: "bold" }}>
                      {editorStats.years_of_experience} năm
                    </p>
                  </div>
                )}

                {/* Editor Status */}
                <div style={{ padding: "20px", background: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    {editorStats.editor_status === 'approved' ? (
                      <FaCheckCircle style={{ color: "#4caf50", fontSize: "24px" }} />
                    ) : editorStats.editor_status === 'pending' ? (
                      <FaClock style={{ color: "#ff9800", fontSize: "24px" }} />
                    ) : (
                      <FaTimesCircle style={{ color: "#f44336", fontSize: "24px" }} />
                    )}
                    <span style={{ fontWeight: "bold", color: "#333", fontSize: "14px" }}>Trạng thái</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "20px", color: editorStats.editor_status === 'approved' ? "#4caf50" : editorStats.editor_status === 'pending' ? "#ff9800" : "#f44336", fontWeight: "bold", textTransform: "capitalize" }}>
                    {editorStats.editor_status === 'approved' ? 'Đã duyệt' : editorStats.editor_status === 'pending' ? 'Chờ duyệt' : 'Bị từ chối'}
                  </p>
                </div>

                {/* Total Posts */}
                <div style={{ padding: "20px", background: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <FaFileAlt style={{ color: "#1976d2", fontSize: "24px" }} />
                    <span style={{ fontWeight: "bold", color: "#333", fontSize: "14px" }}>Tổng bài viết</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "32px", color: "#1976d2", fontWeight: "bold" }}>
                    {editorStats.total_posts || 0}
                  </p>
                </div>

                {/* Total Views */}
                <div style={{ padding: "20px", background: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <FaEye style={{ color: "#f5576c", fontSize: "24px" }} />
                    <span style={{ fontWeight: "bold", color: "#333", fontSize: "14px" }}>Tổng lượt xem</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "32px", color: "#f5576c", fontWeight: "bold" }}>
                    {editorStats.total_views || 0}
                  </p>
                </div>

                {/* Total Likes */}
                <div style={{ padding: "20px", background: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <FaThumbsUp style={{ color: "#667eea", fontSize: "24px" }} />
                    <span style={{ fontWeight: "bold", color: "#333", fontSize: "14px" }}>Tổng lượt thích</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "32px", color: "#667eea", fontWeight: "bold" }}>
                    {editorStats.total_likes || 0}
                  </p>
                </div>

                {/* Total Comments */}
                <div style={{ padding: "20px", background: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <FaComment style={{ color: "#4facfe", fontSize: "24px" }} />
                    <span style={{ fontWeight: "bold", color: "#333", fontSize: "14px" }}>Tổng bình luận</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "32px", color: "#4facfe", fontWeight: "bold" }}>
                    {editorStats.total_comments || 0}
                  </p>
                </div>
              </div>

              {/* Post Status Breakdown */}
              {editorStats.total_posts > 0 && (
                <div style={{ marginTop: "30px", padding: "25px", background: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <h4 style={{ marginBottom: "20px", color: "#333", fontSize: "18px" }}>Phân loại bài viết</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px" }}>
                    <div style={{ textAlign: "center", padding: "20px", background: "#e8f5e9", borderRadius: "8px" }}>
                      <p style={{ margin: "5px 0", fontSize: "28px", fontWeight: "bold", color: "#4caf50" }}>
                        {editorStats.approved_posts || 0}
                      </p>
                      <p style={{ margin: 0, fontSize: "14px", color: "#666", fontWeight: "500" }}>Đã duyệt</p>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px", background: "#fff3e0", borderRadius: "8px" }}>
                      <p style={{ margin: "5px 0", fontSize: "28px", fontWeight: "bold", color: "#ff9800" }}>
                        {editorStats.pending_posts || 0}
                      </p>
                      <p style={{ margin: 0, fontSize: "14px", color: "#666", fontWeight: "500" }}>Chờ duyệt</p>
                    </div>
                    <div style={{ textAlign: "center", padding: "20px", background: "#ffebee", borderRadius: "8px" }}>
                      <p style={{ margin: "5px 0", fontSize: "28px", fontWeight: "bold", color: "#f44336" }}>
                        {editorStats.rejected_posts || 0}
                      </p>
                      <p style={{ margin: 0, fontSize: "14px", color: "#666", fontWeight: "500" }}>Bị từ chối</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Editor Since */}
              {editorStats.editor_since && (
                <div style={{ marginTop: "20px", padding: "15px", background: "white", borderRadius: "8px", fontSize: "14px", color: "#666", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <strong>Tham gia từ:</strong> {moment(editorStats.editor_since).format("DD/MM/YYYY")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px"
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowEditModal(false);
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "30px",
                maxWidth: "600px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                <h3 style={{ margin: 0, fontSize: "24px", color: "#333" }}>Chỉnh sửa thông tin</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#666",
                    padding: "5px 10px"
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleUpdate}>
                <div className="avatar-section" style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>Ảnh đại diện</label>
                  <div className="avatar-row" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <img
                      src={inputs.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      alt=""
                      style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div className="actions">
                      <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleUpload} />
                      <button
                        type="button"
                        className="btn-change-photo"
                        onClick={() => fileInputRef.current.click()}
                        style={{
                          padding: "8px 16px",
                          background: "#1976d2",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                      >
                        Đổi ảnh
                      </button>
                      <p className="note" style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#666" }}>
                        Định dạng PNG, JPG | Dung lượng tối đa 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                    Họ và tên <span className="req" style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={inputs.name}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                    Email <span className="req" style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={inputs.email}
                    disabled
                    className="disabled"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                      background: "#f5f5f5",
                      color: "#666"
                    }}
                  />
                </div>

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                  <div className="form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Số điện thoại</label>
                    <input
                      type="text"
                      name="phone"
                      value={inputs.phone}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "14px"
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Ngày sinh</label>
                    <input
                      type="date"
                      name="dob"
                      value={inputs.dob}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "14px"
                      }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Địa chỉ</label>
                  <textarea
                    rows="3"
                    name="address"
                    value={inputs.address}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                      resize: "vertical"
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Giới tính</label>
                  <div className="radio-group" style={{ display: "flex", gap: "20px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={inputs.gender === 'male'}
                        onChange={handleChange}
                      />
                      Nam
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={inputs.gender === 'female'}
                        onChange={handleChange}
                      />
                      Nữ
                    </label>
                  </div>
                </div>

                {status && (
                  <p className="status-msg" style={{
                    padding: "10px",
                    marginBottom: "15px",
                    borderRadius: "6px",
                    background: status.includes("thành công") ? "#d4edda" : "#f8d7da",
                    color: status.includes("thành công") ? "#155724" : "#721c24"
                  }}>
                    {status}
                  </p>
                )}

                <div className="form-actions" style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    style={{
                      padding: "10px 20px",
                      background: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn-save"
                    style={{
                      padding: "10px 20px",
                      background: "#1976d2",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;