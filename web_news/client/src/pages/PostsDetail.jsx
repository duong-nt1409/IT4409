import React, { useEffect, useState, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "../utils/axios";
import moment from "moment";
import { AuthContext } from "../context/authContext";
import {
  FaEye,
  FaComment,
  FaThumbsUp,
  FaChartLine,
  FaArrowLeft,
} from "react-icons/fa";

const PostsDetail = () => {
  const location = useLocation();
  const { currentUser } = useContext(AuthContext);
  const postId = location.pathname.split("/")[2];
  const [stats, setStats] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Check if user is logged in
      if (!currentUser) {
        setError("Bạn cần đăng nhập để xem thống kê");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch post details first
        const postRes = await axios.get(`/posts/${postId}`);
        const postData = postRes.data;

        // Check if current user is the owner of the post
        // We need to get the user_id from the post. Let's check the post structure
        // The post should have user_id field, but we might need to fetch it differently
        // For now, let's fetch the post with user_id included
        
        // Fetch statistics with user_id parameter
        const statsRes = await axios.get(`/posts/${postId}/stats?user_id=${currentUser.id}`);
        setPost(postData);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Error fetching post details:", err);
        if (err.response?.status === 403) {
          setError("Bạn không có quyền xem thống kê bài viết này. Chỉ người tạo bài viết mới có thể xem thống kê.");
        } else if (err.response?.status === 404) {
          setError("Không tìm thấy bài viết");
        } else {
          setError("Không thể tải thống kê bài viết");
        }
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchData();
    }
  }, [postId, currentUser]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Đang tải thống kê...</p>
      </div>
    );
  }

  if (error || (!loading && !post)) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "red", fontSize: "18px", marginBottom: "20px" }}>
          {error || "Không tìm thấy bài viết"}
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Link
            to="/editor"
            style={{
              marginTop: "20px",
              display: "inline-block",
              padding: "10px 20px",
              background: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
            }}
          >
            <FaArrowLeft /> Quay lại trang quản lý
          </Link>
          <Link
            to="/"
            style={{
              marginTop: "20px",
              display: "inline-block",
              padding: "10px 20px",
              background: "#6c757d",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
            }}
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "30px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <Link
            to={`/post/${postId}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#007bff",
              textDecoration: "none",
              padding: "8px 16px",
              border: "1px solid #007bff",
              borderRadius: "5px",
            }}
          >
            <FaArrowLeft /> Quay lại bài viết
          </Link>
          <Link
            to="/editor"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#6c757d",
              textDecoration: "none",
              padding: "8px 16px",
              border: "1px solid #6c757d",
              borderRadius: "5px",
            }}
          >
            <FaArrowLeft /> Quản lý bài viết
          </Link>
        </div>
        <h1 style={{ margin: "10px 0", fontSize: "28px", fontWeight: "bold" }}>
          Thống kê bài viết
        </h1>
        <h2 style={{ margin: "10px 0", fontSize: "20px", color: "#666" }}>
          {post.title}
        </h2>
        <p style={{ color: "#999", fontSize: "14px" }}>
          Đăng ngày: {moment(post.date).format("DD/MM/YYYY HH:mm")}
        </p>
      </div>

      {/* Statistics Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {/* Total Reads Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "25px",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <FaEye size={40} />
            <div>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "14px", opacity: 0.9 }}>
                Tổng lượt đọc
              </h3>
              <p style={{ margin: 0, fontSize: "32px", fontWeight: "bold" }}>
                {post.view_count || 0}
              </p>
            </div>
          </div>
        </div>

        {/* New Reads Today Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            padding: "25px",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <FaChartLine size={40} />
            <div>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "14px", opacity: 0.9 }}>
                Lượt đọc mới hôm nay
              </h3>
              <p style={{ margin: 0, fontSize: "32px", fontWeight: "bold" }}>
                {stats?.newReadsToday || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Total Comments Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            padding: "25px",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <FaComment size={40} />
            <div>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "14px", opacity: 0.9 }}>
                Tổng số bình luận
              </h3>
              <p style={{ margin: 0, fontSize: "32px", fontWeight: "bold" }}>
                {stats?.totalComments || 0}
              </p>
            </div>
          </div>
        </div>

        {/* New Comments Today Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            padding: "25px",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <FaComment size={40} />
            <div>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "14px", opacity: 0.9 }}>
                Bình luận mới hôm nay
              </h3>
              <p style={{ margin: 0, fontSize: "32px", fontWeight: "bold" }}>
                {stats?.newCommentsToday || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Total Likes Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            padding: "25px",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <FaThumbsUp size={40} />
            <div>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "14px", opacity: 0.9 }}>
                Tổng số lượt thích
              </h3>
              <p style={{ margin: 0, fontSize: "32px", fontWeight: "bold" }}>
                {stats?.totalLikes || 0}
              </p>
            </div>
          </div>
        </div>

        {/* New Likes Today Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
            padding: "25px",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <FaThumbsUp size={40} />
            <div>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "14px", opacity: 0.9 }}>
                Lượt thích mới hôm nay
              </h3>
              <p style={{ margin: 0, fontSize: "32px", fontWeight: "bold" }}>
                {stats?.newLikesToday || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reads Per Day Chart */}
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            margin: "0 0 25px 0",
            fontSize: "22px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaChartLine /> Lượt đọc theo ngày (30 ngày gần nhất)
        </h2>
        {stats?.readsPerDay && stats.readsPerDay.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8f9fa",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    Ngày
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    Số lượt đọc
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    Biểu đồ
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.readsPerDay.map((item, index) => {
                  const maxReads = Math.max(
                    ...stats.readsPerDay.map((d) => d.read_count)
                  );
                  const percentage = maxReads > 0 ? (item.read_count / maxReads) * 100 : 0;
                  return (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid #e9ecef",
                      }}
                    >
                      <td style={{ padding: "12px" }}>
                        {moment(item.date).format("DD/MM/YYYY")}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: "bold" }}>
                        {item.read_count}
                      </td>
                      <td style={{ padding: "12px", width: "60%" }}>
                        <div
                          style={{
                            background: "#e9ecef",
                            borderRadius: "4px",
                            height: "24px",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                              width: `${percentage}%`,
                              height: "100%",
                              borderRadius: "4px",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "#999", textAlign: "center", padding: "40px" }}>
            Chưa có dữ liệu lượt đọc
          </p>
        )}
      </div>

      {/* Summary Section */}
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            margin: "0 0 20px 0",
            fontSize: "22px",
            fontWeight: "bold",
          }}
        >
          Tóm tắt
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          <div>
            <p style={{ margin: "5px 0", color: "#666", fontSize: "14px" }}>
              Tổng lượt đọc
            </p>
            <p style={{ margin: "5px 0", fontSize: "20px", fontWeight: "bold" }}>
              {post.view_count || 0}
            </p>
          </div>
          <div>
            <p style={{ margin: "5px 0", color: "#666", fontSize: "14px" }}>
              Lượt đọc hôm nay
            </p>
            <p style={{ margin: "5px 0", fontSize: "20px", fontWeight: "bold", color: "#f5576c" }}>
              +{stats?.newReadsToday || 0}
            </p>
          </div>
          <div>
            <p style={{ margin: "5px 0", color: "#666", fontSize: "14px" }}>
              Tổng bình luận
            </p>
            <p style={{ margin: "5px 0", fontSize: "20px", fontWeight: "bold" }}>
              {stats?.totalComments || 0}
            </p>
          </div>
          <div>
            <p style={{ margin: "5px 0", color: "#666", fontSize: "14px" }}>
              Bình luận hôm nay
            </p>
            <p style={{ margin: "5px 0", fontSize: "20px", fontWeight: "bold", color: "#38f9d7" }}>
              +{stats?.newCommentsToday || 0}
            </p>
          </div>
          <div>
            <p style={{ margin: "5px 0", color: "#666", fontSize: "14px" }}>
              Tổng lượt thích
            </p>
            <p style={{ margin: "5px 0", fontSize: "20px", fontWeight: "bold" }}>
              {stats?.totalLikes || 0}
            </p>
          </div>
          <div>
            <p style={{ margin: "5px 0", color: "#666", fontSize: "14px" }}>
              Lượt thích hôm nay
            </p>
            <p style={{ margin: "5px 0", fontSize: "20px", fontWeight: "bold", color: "#330867" }}>
              +{stats?.newLikesToday || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostsDetail;

