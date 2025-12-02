import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Menu = ({ cat }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi API lấy bài viết cùng danh mục
        const res = await axios.get(`http://localhost:8800/api/posts/?cat=${cat}`);
        setPosts(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [cat]);

  return (
    <div className="menu">
      <h1>Bài viết liên quan</h1>
      {posts.map((post) => (
        <div className="post" key={post.id}>
          <img src={post.thumbnail} alt="" />
          <Link className="link" to={`/post/${post.id}`}>
             <h2>{post.title}</h2>
          </Link>
          <button>Đọc thêm</button>
        </div>
      ))}
    </div>
  );
};

export default Menu;