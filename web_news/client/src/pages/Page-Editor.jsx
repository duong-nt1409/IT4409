import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import axios from "../utils/axios";

const defaultAvatar =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const EditorPage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    } else {
      fetchMyPosts();
    }
  }, [currentUser, navigate]);

  const fetchMyPosts = async () => {
    try {
      const res = await axios.get(`/posts?uid=${currentUser.id}`);
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    alert("Chức năng xóa đang phát triển (Vui lòng tự implement logic API)");
  };

  if (!currentUser) return null;

  return (
    <div className="editor-dashboard">
      <div className="sidebar">
        <div className="user-profile">
          <img
            src={currentUser.avatar || defaultAvatar}
            alt=""
            className="avatar"
          />
          <h3>{currentUser.name || currentUser.username}</h3>
          <span>Editor</span>
        </div>
        <div className="menu">
          <button className="active">Bài viết của tôi</button>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      </div>

      <div className="main-content-editor">
        <div className="header">
          <h1>Quản lý bài viết</h1>
          <Link to="/write" className="btn-create">
            + Viết bài mới
          </Link>
        </div>

        <div className="posts-list">
          {posts.length === 0 ? (
            <p>Bạn chưa có bài viết nào.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Danh mục</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <img src={post.thumbnail} alt="" className="thumb" />
                    </td>
                    <td>{post.title}</td>
                    <td>{post.cat_name}</td>
                    <td>{new Date(post.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`status ${post.status}`}>
                        {post.status}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <Link to={`/write?edit=${post.id}`} state={post} className="btn-edit">
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="btn-delete"
                        >
                          Xóa
                        </button>
                        <Link to={`/post/${post.id}`} className="btn-view">
                          Xem
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
