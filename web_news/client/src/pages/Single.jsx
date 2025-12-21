import React, { useEffect, useState, useContext, useRef } from "react";
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
  const galleryIntervalsRef = useRef([]);

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

  // Initialize galleries after content is rendered
  useEffect(() => {
    if (!post.content) return;
    
    // Clear any existing intervals
    galleryIntervalsRef.current.forEach(id => clearInterval(id));
    galleryIntervalsRef.current = [];
    
    // Remove initialization markers to allow re-initialization
    document.querySelectorAll('.gallery-container[data-initialized]').forEach(el => {
      el.removeAttribute('data-initialized');
    });
    
    const initializeGalleries = () => {
      const galleries = document.querySelectorAll('.gallery-container:not([data-initialized])');
      
      galleries.forEach((gallery) => {
        gallery.setAttribute('data-initialized', 'true');
        const images = gallery.querySelectorAll('img[data-gallery-image]');
        if (images.length <= 1) return; // Skip if only one or no images
        
        const autoPlay = gallery.getAttribute('data-autoplay') !== 'false';
        const interval = parseInt(gallery.getAttribute('data-interval')) || 3000;
        
        // Create gallery wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'gallery-wrapper';
        
        // Hide all images initially
        images.forEach((img, index) => {
          img.style.display = index === 0 ? 'block' : 'none';
        });
        
        let currentIndex = 0;
        let intervalId = null;
        
        // Create navigation buttons
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '‹';
        prevButton.className = 'gallery-nav-button prev';
        
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '›';
        nextButton.className = 'gallery-nav-button next';
        
        // Create counter
        const counter = document.createElement('div');
        counter.className = 'gallery-counter';
        counter.textContent = `1 / ${images.length}`;
        
        // Create thumbnail strip
        const thumbnailStrip = document.createElement('div');
        thumbnailStrip.className = 'gallery-thumbnail-strip';
        
        const thumbnails = [];
        
        const showImage = (index) => {
          images.forEach((img, i) => {
            img.style.display = i === index ? 'block' : 'none';
          });
          // Update thumbnail highlighting using CSS class
          thumbnails.forEach((thumb, i) => {
            if (i === index) {
              thumb.classList.add('active');
            } else {
              thumb.classList.remove('active');
            }
          });
          currentIndex = index;
          counter.textContent = `${index + 1} / ${images.length}`;
        };
        
        const nextImage = () => {
          showImage((currentIndex + 1) % images.length);
        };
        
        const prevImage = () => {
          showImage((currentIndex - 1 + images.length) % images.length);
        };
        
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
        
        // Create thumbnails
        images.forEach((img, index) => {
          const thumbnail = document.createElement('div');
          thumbnail.className = 'gallery-thumbnail';
          if (index === 0) {
            thumbnail.classList.add('active');
          }
          
          const thumbImg = document.createElement('img');
          thumbImg.src = img.src;
          thumbImg.alt = img.alt || `Thumbnail ${index + 1}`;
          
          thumbnail.appendChild(thumbImg);
          thumbnails.push(thumbnail);
          thumbnailStrip.appendChild(thumbnail);
          
          thumbnail.onclick = () => {
            showImage(index);
            resetAutoPlay();
          };
        });
        
        prevButton.onclick = () => {
          prevImage();
          resetAutoPlay();
        };
        
        nextButton.onclick = () => {
          nextImage();
          resetAutoPlay();
        };
        
        // Wrap gallery content
        gallery.parentNode.insertBefore(wrapper, gallery);
        wrapper.appendChild(gallery);
        wrapper.appendChild(prevButton);
        wrapper.appendChild(nextButton);
        wrapper.appendChild(counter);
        
        // Add thumbnail strip after wrapper
        wrapper.parentNode.insertBefore(thumbnailStrip, wrapper.nextSibling);
        
        // Start auto-play if enabled
        if (autoPlay) {
          intervalId = setInterval(nextImage, interval);
          galleryIntervalsRef.current.push(intervalId);
        }
      });
    };
    
    // Initialize after a short delay to ensure DOM is ready
    const timer = setTimeout(initializeGalleries, 100);
    
    return () => {
      clearTimeout(timer);
      galleryIntervalsRef.current.forEach(id => clearInterval(id));
      galleryIntervalsRef.current = [];
    };
  }, [post.content]);

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
        <div className="interactions">
          
          {/* Nút Like */}
          <button
            onClick={handleLike}
            className={`like-button ${likes.includes(currentUser?.id) ? 'liked' : ''}`}
          >
            <FaThumbsUp /> {likes.includes(currentUser?.id) ? "Đã thích" : "Thích"} ({likes.length})
          </button>

          {/* Nút Lưu (Bookmark) */}
          <button
            onClick={handleBookmark}
            className={`bookmark-button ${isSaved ? 'saved' : ''}`}
          >
            {isSaved ? <FaBookmark /> : <FaRegBookmark />} 
            {isSaved ? "Đã lưu" : "Lưu bài"}
          </button>

        </div>
        {/* -------------------------------------- */}

        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }}></div>
        <hr className="post-content-separator" />
        <h3>Bình luận</h3>
        <Comments postId={postId} />
      </div>
      <div className="menu-container"><Menu cat={post.cat_name} /></div>
    </div>
  );
};

export default Single;