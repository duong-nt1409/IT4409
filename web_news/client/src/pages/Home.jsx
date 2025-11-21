import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [posts, setPosts] = useState([]);
  
  // Lấy category từ URL (?cat=1)
  // Lưu ý: DB mới dùng ID (số) cho category chứ không phải tên (chữ)
  // Ví dụ: ?cat=1 (Công nghệ), ?cat=2 (Thể thao)
  const cat = useLocation().search; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8800/api/posts${cat}`);
        setPosts(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [cat]);

  // Hàm phụ: Chuyển HTML thành văn bản thuần để làm mô tả ngắn
  const getText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent.substring(0, 150) + "..."; // Lấy 150 ký tự đầu
  };

  return (
    <div className="home">
      <div className="posts">
        {posts.length === 0 && <p>Chưa có bài viết nào trong mục này.</p>}

        {posts.map((post) => (
          <div className="post" key={post.id}>
            <div className="img">
              {/* SỬA: Dùng post.thumbnail thay vì post.img */}
              <img src={post.thumbnail} alt="" />
            </div>
            <div className="content">
              <Link className="link" to={`/post/${post.id}`}>
                <h1>{post.title}</h1>
              </Link>
              
              {/* SỬA: Tự động tạo mô tả từ nội dung */}
              <p>{getText(post.content)}</p>
              
              <Link to={`/post/${post.id}`}>
                 <button>Đọc thêm</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;