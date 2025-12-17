import React, { useEffect, useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { AuthContext } from "../context/authContext";
import Menu from "../components/Menu";
import Comments from "../components/Comments";
// Import icon Bookmark
import { FaBookmark, FaRegBookmark, FaThumbsUp } from "react-icons/fa"; 

const Single = () => {
  const [post, setPost] = useState({});
  const [likes, setLikes] = useState([]);
  
  // State kiểm tra đã lưu bài chưa
  const [isSaved, setIsSaved] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const postId = location.pathname.split("/")[2];
  const { currentUser } = useContext(AuthContext);

  // 1. Fetch Post Data & Likes & Check Bookmark
  useEffect(() => {
    const fetchData = async () => {
      try {
        const postRes = await axios.get(`http://localhost:8800/api/posts/${postId}`);
        setPost(postRes.data);
        
        const likesRes = await axios.get(`http://localhost:8800/api/likes?postId=${postId}`);
        setLikes(likesRes.data);

        // Kiểm tra xem user đã lưu bài này chưa
        if (currentUser) {
          const savedRes = await axios.get(`http://localhost:8800/api/interactions/bookmarks/ids?userId=${currentUser.id}`);
          // savedRes.data là mảng ID [1, 5, 9]. Kiểm tra xem có postId không
          // Lưu ý: postId từ URL là string, trong mảng là number nên dùng == hoặc parseInt
          if (savedRes.data.includes(parseInt(postId))) {
            setIsSaved(true);
          }

          // --- GHI LỊCH SỬ XEM NGAY KHI VÀO BÀI ---
          await axios.post("http://localhost:8800/api/interactions/history", {
            user_id: currentUser.id,
            post_id: postId
          });
        }

      } catch (err) { console.log(err); }
    };
    fetchData();
  }, [postId, currentUser]);

  // 2. Xử lý Like
  const handleLike = async () => {
    if (!currentUser) return alert("Bạn cần đăng nhập!");
    const hasLiked = likes.includes(currentUser.id);
    try {
      if (hasLiked) {
        await axios.delete(`http://localhost:8800/api/likes?postId=${postId}&userId=${currentUser.id}`);
        setLikes(likes.filter((id) => id !== currentUser.id));
      } else {
        await axios.post("http://localhost:8800/api/likes", { user_id: currentUser.id, post_id: postId });
        setLikes([...likes, currentUser.id]);
      }
    } catch (err) { console.log(err); }
  };

  // 3. Xử lý Lưu bài (Bookmark)
  const handleBookmark = async () => {
    if (!currentUser) return alert("Bạn cần đăng nhập để lưu bài!");
    try {
      await axios.post("http://localhost:8800/api/interactions/bookmarks", {
        user_id: currentUser.id,
        post_id: postId
      });
      setIsSaved(!isSaved); // Đổi trạng thái icon
    } catch (err) { console.log(err); }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8800/api/posts/${postId}`);
      navigate("/");
    } catch (err) { console.log(err); }
  };

  if (!post.title) return <div className="single">Loading...</div>;

  return (
    <div className="single">
      <div className="content">
        <img src={post.thumbnail} alt="" />
        <div className="user">
          {post.avatar && <img src={post.avatar} alt="" />}
          <div className="info">
            <span>{post.username}</span>
            <p>Đăng {moment(post.date).fromNow()} • {post.view_count || 0} lượt xem</p>
          </div>
          {currentUser && currentUser.username === post.username && (
            <div className="edit">
              <Link to={`/write?edit=${post.id}`}><button className="btn-edit">Sửa</button></Link>
              <button onClick={handleDelete} className="btn-delete">Xóa</button>
            </div>
          )}
        </div>

        <h1>{post.title}</h1>

        {/* --- KHU VỰC TƯƠNG TÁC (LIKE & SAVE) --- */}
        <div className="interactions" style={{ display: "flex", gap: "15px", margin: "20px 0" }}>
          
          {/* Nút Like */}
          <button
            onClick={handleLike}
            style={{
              padding: "8px 15px", border: "1px solid teal", borderRadius: "5px", cursor: "pointer",
              background: likes.includes(currentUser?.id) ? "teal" : "white",
              color: likes.includes(currentUser?.id) ? "white" : "teal",
              display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold"
            }}
          >
            <FaThumbsUp /> {likes.includes(currentUser?.id) ? "Đã thích" : "Thích"} ({likes.length})
          </button>

          {/* Nút Lưu (Bookmark) */}
          <button
            onClick={handleBookmark}
            style={{
              padding: "8px 15px", border: "1px solid #eab308", borderRadius: "5px", cursor: "pointer",
              background: isSaved ? "#eab308" : "white", // Màu vàng
              color: isSaved ? "white" : "#eab308",
              display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold"
            }}
          >
            {isSaved ? <FaBookmark /> : <FaRegBookmark />} 
            {isSaved ? "Đã lưu" : "Lưu bài"}
          </button>

        </div>
        {/* -------------------------------------- */}

        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }}></div>
        <hr style={{ margin: "30px 0", borderTop: "1px solid #eee" }} />
        <h3>Bình luận</h3>
        <Comments postId={postId} />
      </div>
      <div className="menu-container"><Menu cat={post.cat_name} /></div>
    </div>
  );
};

export default Single;