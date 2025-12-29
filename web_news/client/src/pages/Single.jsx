import React, { useEffect, useState, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { AuthContext } from "../context/authContext";
import Menu from "../components/Menu";
import Comments from "../components/Comments";
import Weather from "../components/Weather";
import Trending from "../components/Trending";
// Import icon
import { FaBookmark, FaRegBookmark, FaThumbsUp } from "react-icons/fa"; 

const Single = () => {
  const [post, setPost] = useState({});
  const [likes, setLikes] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const galleryIntervalsRef = useRef([]);

  const location = useLocation();
  const navigate = useNavigate();
  const postId = location.pathname.split("/")[2];
  const { currentUser } = useContext(AuthContext);

  // 1. Fetch Dữ liệu bài viết, Likes & Bookmark
  useEffect(() => {
    const fetchData = async () => {
      try {
        const postRes = await axios.get(`http://localhost:8800/api/posts/${postId}`);
        setPost(postRes.data);
        
        const likesRes = await axios.get(`http://localhost:8800/api/likes?postId=${postId}`);
        setLikes(likesRes.data);

        if (currentUser) {
          // Kiểm tra đã lưu bài chưa
          const savedRes = await axios.get(`http://localhost:8800/api/interactions/bookmarks/ids?userId=${currentUser.id}`);
          if (savedRes.data.includes(parseInt(postId))) {
            setIsSaved(true);
          }

          // Ghi lịch sử xem
          await axios.post("http://localhost:8800/api/interactions/history", {
            user_id: currentUser.id,
            post_id: postId
          });
        }
      } catch (err) { console.log(err); }
    };
    fetchData();
  }, [postId, currentUser]);

  // 2. Logic xử lý Gallery (Album ảnh trong bài viết) - GIỮ NGUYÊN
  useEffect(() => {
    if (!post.content) return;
    galleryIntervalsRef.current.forEach(id => clearInterval(id));
    galleryIntervalsRef.current = [];
    document.querySelectorAll('.gallery-container[data-initialized]').forEach(el => {
      el.removeAttribute('data-initialized');
    });
    
    const initializeGalleries = () => {
      const galleries = document.querySelectorAll('.gallery-container:not([data-initialized])');
      galleries.forEach((gallery) => {
        gallery.setAttribute('data-initialized', 'true');
        const images = gallery.querySelectorAll('img[data-gallery-image]');
        if (images.length <= 1) return;
        
        const autoPlay = gallery.getAttribute('data-autoplay') !== 'false';
        const interval = parseInt(gallery.getAttribute('data-interval')) || 3000;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'gallery-wrapper';
        images.forEach((img, index) => { img.style.display = index === 0 ? 'block' : 'none'; });
        
        let currentIndex = 0;
        let intervalId = null;
        
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '‹'; prevButton.className = 'gallery-nav-button prev';
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '›'; nextButton.className = 'gallery-nav-button next';
        
        const thumbnailStrip = document.createElement('div');
        thumbnailStrip.className = 'gallery-thumbnail-strip';
        const thumbnails = [];
        
        const showImage = (index) => {
          images.forEach((img, i) => { img.style.display = i === index ? 'block' : 'none'; });
          thumbnails.forEach((thumb, i) => {
            if (i === index) thumb.classList.add('active');
            else thumb.classList.remove('active');
          });
          currentIndex = index;
        };
        
        const nextImage = () => { showImage((currentIndex + 1) % images.length); };
        const prevImage = () => { showImage((currentIndex - 1 + images.length) % images.length); };
        
        const resetAutoPlay = () => {
          if (intervalId) {
            clearInterval(intervalId);
            const idx = galleryIntervalsRef.current.indexOf(intervalId);
            if (idx > -1) galleryIntervalsRef.current.splice(idx, 1);
          }
          if (autoPlay) {
            intervalId = setInterval(nextImage, interval);
            galleryIntervalsRef.current.push(intervalId);
          }
        };
        
        images.forEach((img, index) => {
          const thumbnail = document.createElement('div');
          thumbnail.className = 'gallery-thumbnail';
          if (index === 0) thumbnail.classList.add('active');
          const thumbImg = document.createElement('img');
          thumbImg.src = img.src;
          thumbnail.appendChild(thumbImg);
          thumbnails.push(thumbnail);
          thumbnailStrip.appendChild(thumbnail);
          thumbnail.onclick = () => { showImage(index); resetAutoPlay(); };
        });
        
        prevButton.onclick = () => { prevImage(); resetAutoPlay(); };
        nextButton.onclick = () => { nextImage(); resetAutoPlay(); };
        
        gallery.parentNode.insertBefore(wrapper, gallery);
        wrapper.appendChild(gallery);
        wrapper.appendChild(prevButton);
        wrapper.appendChild(nextButton);
        wrapper.parentNode.insertBefore(thumbnailStrip, wrapper.nextSibling);
        
        if (autoPlay) {
          intervalId = setInterval(nextImage, interval);
          galleryIntervalsRef.current.push(intervalId);
        }
      });
    };
    const timer = setTimeout(initializeGalleries, 100);
    return () => { clearTimeout(timer); galleryIntervalsRef.current.forEach(id => clearInterval(id)); galleryIntervalsRef.current = []; };
  }, [post.content]);

  // 3. Xử lý Like & Bookmark & Delete
  const handleLike = async () => {
    if (!currentUser) return alert("Bạn cần đăng nhập!");
    try {
      if (likes.includes(currentUser.id)) {
        await axios.delete(`http://localhost:8800/api/likes?postId=${postId}&userId=${currentUser.id}`);
        setLikes(likes.filter((id) => id !== currentUser.id));
      } else {
        await axios.post("http://localhost:8800/api/likes", { user_id: currentUser.id, post_id: postId });
        setLikes([...likes, currentUser.id]);
      }
    } catch (err) { console.log(err); }
  };

  const handleBookmark = async () => {
    if (!currentUser) return alert("Bạn cần đăng nhập để lưu bài!");
    try {
      await axios.post("http://localhost:8800/api/interactions/bookmarks", { user_id: currentUser.id, post_id: postId });
      setIsSaved(!isSaved);
    } catch (err) { console.log(err); }
  };

  const handleDelete = async () => {
    if(!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    try {
      await axios.delete(`http://localhost:8800/api/posts/${postId}`, { data: { user_id: currentUser.id } }); // Gửi kèm user_id để check quyền
      navigate("/");
    } catch (err) { console.log(err); }
  };

  if (!post.title) return <div className="single" style={{marginTop: "100px", textAlign:"center"}}>Đang tải bài viết...</div>;

  return (
    <>
    <div className="single">
      
      {/* --- CỘT TRÁI: NỘI DUNG CHÍNH (70%) --- */}
      <div className="content">
        
        {/* THÊM CLASS 'hero-image' ĐỂ KHỚP VỚI CSS STYLE MỚI */}
        <img src={post.thumbnail} alt="" className="hero-image" />
        
        {/* Thông tin User & Nút Sửa/Xóa */}
        <div className="user">
          {post.avatar && <img src={post.avatar} alt="" />}
          <div className="info">
            <span>{post.username}</span>
            <p>Đăng {moment(post.date).fromNow()} • {post.view_count || 0} lượt xem</p>
          </div>
          {currentUser && currentUser.username === post.username && (
            <div className="edit">
              <Link to={`/write?edit=${post.id}`}><button className="btn-edit">Sửa bài</button></Link>
              <button onClick={handleDelete} className="btn-delete">Xóa bài</button>
            </div>
          )}
        </div>

        {/* Tiêu đề bài viết */}
        <h1>{post.title}</h1>

        {/* --- KHU VỰC TƯƠNG TÁC (LIKE & SAVE) --- */}
        <div className="interactions">
          <button onClick={handleLike} className={`like-button ${likes.includes(currentUser?.id) ? 'liked' : ''}`}>
            <FaThumbsUp /> {likes.includes(currentUser?.id) ? "Đã thích" : "Thích"} ({likes.length})
          </button>

          <button onClick={handleBookmark} className={`bookmark-button ${isSaved ? 'saved' : ''}`}>
            {isSaved ? <FaBookmark /> : <FaRegBookmark />} 
            {isSaved ? "Đã lưu" : "Lưu bài"}
          </button>
        </div>

        {/* Nội dung bài viết (Rich Text) */}
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }}></div>
        
        <hr className="post-content-separator" />
        
        {/* Bình luận */}
        <h3>Bình luận</h3>
        <Comments postId={postId} />
      </div>

      {/* --- CỘT PHẢI: MENU STICKY (30%) --- */}
      <div className="menu-container">
        {/* Truyền cat_name vào Menu để lấy bài liên quan */}
        <Menu cat={post.cat_name} />
        <Weather/>
      </div>
    </div>
    <Trending />
    </>
  );
};

export default Single;