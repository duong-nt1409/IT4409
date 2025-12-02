import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useLocation } from "react-router-dom";

const Write = () => {
  const state = useLocation().state;
  const [value, setValue] = useState(state?.content || "");
  const [title, setTitle] = useState(state?.title || "");
  const [file, setFile] = useState(state?.thumbnail || "");
  const [cat, setCat] = useState(state?.category_id || "");

  const handleClick = async (e) => {
    e.preventDefault();
    alert("Chức năng đang phát triển (Vui lòng tự implement logic API)");
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
          <h1>Đăng bài</h1>
          <span>
            <b>Trạng thái: </b> {state ? "Chỉnh sửa" : "Tạo mới"}
          </span>
          <span>
            <b>Hiển thị: </b> {state?.status || "Pending"}
          </span>
          
          <input
            style={{ display: "none" }}
            type="file"
            id="file"
            name=""
            // onChange={(e) => setFile(e.target.files[0])} // Tạm thời chưa làm upload file thật
          />
          {/* <label className="file" htmlFor="file">
            Upload Ảnh
          </label> */}
          
          <div className="input-group">
             <label>Link Ảnh Thumbnail:</label>
             <input 
               type="text" 
               value={file} 
               onChange={e=>setFile(e.target.value)} 
               placeholder="https://example.com/image.jpg"
               style={{width: "100%", padding: "5px", marginTop: "5px"}}
             />
             {file && <img src={file} alt="" style={{width: "100%", marginTop: "10px", height: "150px", objectFit: "cover"}} />}
          </div>

          <div className="buttons">
            <button onClick={handleClick}>Xuất bản</button>
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