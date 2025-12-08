import React, { useState, useContext, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useLocation, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import axios from "../utils/axios";

const Write = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = location.state;
  const editId = searchParams.get("edit");
  const isEditMode = !!editId || !!state?.id;
  const postId = editId || state?.id;

  const { currentUser } = useContext(AuthContext);
  const [value, setValue] = useState(state?.content || "");
  const [title, setTitle] = useState(state?.title || "");
  const [file, setFile] = useState(state?.thumbnail || "");
  const [cat, setCat] = useState(state?.category_id?.toString() || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // If in edit mode but no state data, fetch the post
  useEffect(() => {
    const fetchPost = async () => {
      if (isEditMode && postId && !state) {
        try {
          const res = await axios.get(`/posts/${postId}`);
          setTitle(res.data.title || "");
          setValue(res.data.content || "");
          setFile(res.data.thumbnail || "");
          setCat(res.data.category_id?.toString() || "");
        } catch (err) {
          console.error("Error fetching post:", err);
          setError("Không thể tải bài viết để chỉnh sửa.");
        }
      }
    };
    fetchPost();
  }, [isEditMode, postId, state]);

  const handleClick = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!currentUser) {
      setError("Bạn cần đăng nhập để đăng bài!");
      return;
    }

    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết!");
      return;
    }

    if (!value.trim() || value.trim() === "<p><br></p>") {
      setError("Vui lòng nhập nội dung bài viết!");
      return;
    }

    if (!cat) {
      setError("Vui lòng chọn danh mục!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Log the data being sent for debugging
      const postData = {
        title: title.trim(),
        content: value,
        thumbnail: file || null,
        category_id: cat ? parseInt(cat) : null,
        user_id: currentUser.id,
      };
      
      console.log("=== FRONTEND: Sending post data ===");
      console.log("Post data:", postData);
      console.log("Current user:", currentUser);
      console.log("Is edit mode:", isEditMode);
      console.log("Post ID:", postId);

      let response;
      if (isEditMode && postId) {
        // Update existing post
        console.log("Updating post:", postId);
        response = await axios.put(`/posts/${postId}`, postData);
        console.log("=== FRONTEND: Post updated successfully ===");
        console.log("Response:", response.data);
      } else {
        // Create new post
        console.log("Creating new post");
        response = await axios.post("/posts", postData);
        console.log("=== FRONTEND: Post created successfully ===");
        console.log("Response:", response.data);
      }

      // Success message
      setSuccess(true);
      
      // Clear form after a short delay (only if creating new post)
      if (!isEditMode) {
        setTimeout(() => {
          setTitle("");
          setValue("");
          setFile("");
          setCat("");
          setSuccess(false);
        }, 3000);
      }
      
      // Navigate to editor dashboard or home
      // Disable this for now
      // if (currentUser.role_id === 2) {
      //   navigate("/editor");
      // } else {
      //   navigate("/");
      // }
    } catch (err) {
      console.error("=== FRONTEND: ERROR creating post ===");
      console.error("Full error object:", err);
      console.error("Error message:", err.message);
      console.error("Error response:", err.response);
      console.error("Error request:", err.request);
      console.error("Error config:", err.config);
      
      // Handle different error response formats
      let errorMessage = isEditMode 
        ? "Đã xảy ra lỗi khi cập nhật bài viết. Vui lòng thử lại!"
        : "Đã xảy ra lỗi khi tạo bài viết. Vui lòng thử lại!";
      
      if (err.response) {
        // Server responded with error status
        console.error("Server responded with status:", err.response.status);
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data) {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (err.request) {
        // Request was made but no response received
        console.error("No response received from server");
        errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra server có đang chạy không!";
      } else if (err.message) {
        // Something else happened
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add">
      <div className="content">
        <input
          type="text"
          placeholder="Tiêu đề bài viết"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="editorContainer">
          <ReactQuill
            className="editor"
            theme="snow"
            value={value}
            onChange={setValue}
          />
        </div>
      </div>
      <div className="menu">
        <div className="item">
          <h1>{isEditMode ? "Chỉnh sửa bài viết" : "Đăng bài"}</h1>
          <span>
            <b>Trạng thái: </b> {isEditMode ? "Chỉnh sửa" : "Tạo mới"}
          </span>
          <span>
            <b>Hiển thị: </b> {state?.status || (isEditMode ? "Đang chỉnh sửa" : "Pending")}
          </span>
          {isEditMode && postId && (
            <span>
              <b>ID bài viết: </b> {postId}
            </span>
          )}
          
          <div className="input-group">
            <label>Link Ảnh Thumbnail:</label>
            <input 
              type="text" 
              value={file} 
              onChange={(e) => setFile(e.target.value)} 
              placeholder="https://example.com/image.jpg"
            />
            {file && <img src={file} alt="Thumbnail preview" />}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              ✅ {isEditMode 
                ? "Bài viết đã được cập nhật thành công!" 
                : "Bài viết đã được tạo thành công với trạng thái 'pending'!"} 
              <br />
              <small>{isEditMode 
                ? "Các thay đổi đã được lưu." 
                : "Bạn có thể xem bài viết trên trang chủ."}</small>
            </div>
          )}

          <div className="buttons">
            <button onClick={handleClick} disabled={isSubmitting}>
              {isSubmitting 
                ? "Đang xử lý..." 
                : isEditMode 
                  ? "Cập nhật bài viết" 
                  : "Xuất bản"}
            </button>
          </div>
        </div>
        <div className="item">
          <h1>Danh mục</h1>
          <div className="cat">
            <input
              type="radio"
              checked={cat == 1}
              name="cat"
              value="1"
              id="art"
              onChange={(e) => setCat(e.target.value)}
            />
            <label htmlFor="art">Thời sự</label>
          </div>
          <div className="cat">
            <input
              type="radio"
              checked={cat == 2}
              name="cat"
              value="2"
              id="science"
              onChange={(e) => setCat(e.target.value)}
            />
            <label htmlFor="science">Thế giới</label>
          </div>
          <div className="cat">
            <input
              type="radio"
              checked={cat == 3}
              name="cat"
              value="3"
              id="technology"
              onChange={(e) => setCat(e.target.value)}
            />
            <label htmlFor="technology">Kinh doanh</label>
          </div>
          <div className="cat">
            <input
              type="radio"
              checked={cat == 4}
              name="cat"
              value="4"
              id="cinema"
              onChange={(e) => setCat(e.target.value)}
            />
            <label htmlFor="cinema">Công nghệ</label>
          </div>
          <div className="cat">
            <input
              type="radio"
              checked={cat == 5}
              name="cat"
              value="5"
              id="design"
              onChange={(e) => setCat(e.target.value)}
            />
            <label htmlFor="design">Thể thao</label>
          </div>
          <div className="cat">
            <input
              type="radio"
              checked={cat == 6}
              name="cat"
              value="6"
              id="food"
              onChange={(e) => setCat(e.target.value)}
            />
            <label htmlFor="food">Giải trí</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Write;