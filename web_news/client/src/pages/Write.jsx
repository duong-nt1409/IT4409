import React, { useState, useContext, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import axios from "../utils/axios";

// Block component types
const BlockTypes = {
  HEADER: "header",
  PARAGRAPH: "paragraph",
  IMAGE: "image",
};

const HeaderBlock = ({ block, onUpdate, onDelete }) => {
  const [level, setLevel] = useState(block.data.level || 1);
  const h1Ref = useRef(null);
  const h2Ref = useRef(null);
  const h3Ref = useRef(null);
  const isFocusedRef = useRef(false);
  const headerRef = level === 1 ? h1Ref : level === 2 ? h2Ref : h3Ref;

  // Initialize and sync contentEditable with block data
  useEffect(() => {
    const currentRef = level === 1 ? h1Ref : level === 2 ? h2Ref : h3Ref;
    if (currentRef.current && !isFocusedRef.current) {
      const currentText = currentRef.current.textContent || "";
      const blockText = block.data.text || "";
      // Only update if the block data changed externally and element is not focused
      if (currentText !== blockText) {
        currentRef.current.textContent = blockText || "";
      }
    }
  }, [block.id, level, block.data.text]); // Include block.data.text but check focus state

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    if (headerRef.current) {
      const text = headerRef.current.textContent || "";
      onUpdate({ ...block, data: { text, level } });
    }
  };

  const placeholder = level === 1 ? "Nhập tiêu đề..." : level === 2 ? "Nhập tiêu đề phụ..." : "Nhập tiêu đề nhỏ...";
  const commonProps = {
    contentEditable: true,
    suppressContentEditableWarning: true,
    onFocus: handleFocus,
    onBlur: handleBlur,
    'data-placeholder': placeholder,
    style: { 
      minHeight: "2em", 
      outline: "none", 
      padding: "10px", 
      border: "1px solid #ddd", 
      borderRadius: "4px"
    }
  };

  return (
    <div className="block-item header-block">
      <div className="block-controls">
        <select 
          value={level} 
          onChange={(e) => {
            const newLevel = parseInt(e.target.value);
            // Save current text before changing level
            const currentText = headerRef.current?.textContent || "";
            setLevel(newLevel);
            // Update with new level
            setTimeout(() => {
              const newRef = newLevel === 1 ? h1Ref : newLevel === 2 ? h2Ref : h3Ref;
              if (newRef.current && currentText) {
                newRef.current.textContent = currentText;
              }
              onUpdate({ ...block, data: { text: currentText, level: newLevel } });
            }, 0);
          }}
        >
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
        </select>
        <button onClick={onDelete} className="delete-block">Xóa</button>
      </div>
      {level === 1 && <h1 ref={h1Ref} {...commonProps} />}
      {level === 2 && <h2 ref={h2Ref} {...commonProps} />}
      {level === 3 && <h3 ref={h3Ref} {...commonProps} />}
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #999;
        }
      `}</style>
    </div>
  );
};
const ParagraphBlock = ({ block, onUpdate, onDelete }) => {
  const paraRef = useRef(null);
  const isFocusedRef = useRef(false);

  // Initialize and sync contentEditable with block data
  useEffect(() => {
    if (paraRef.current && !isFocusedRef.current) {
      const currentText = paraRef.current.textContent || "";
      const blockText = block.data.text || "";
      // Only update if the block data changed externally and element is not focused
      if (currentText !== blockText) {
        paraRef.current.textContent = blockText || "";
      }
    }
  }, [block.id, block.data.text]); // Include block.data.text but check focus state

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    if (paraRef.current) {
      const text = paraRef.current.textContent || "";
      onUpdate({ ...block, data: { text } });
    }
  };

  const handleInput = () => {
    // Don't update state during input to avoid re-renders
    // Only update on blur
  };

  return (
    <div className="block-item paragraph-block">
      <div className="block-controls">
        <button onClick={onDelete} className="delete-block">Xóa</button>
      </div>
      <p
        ref={paraRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        data-placeholder="Nhập đoạn văn..."
        style={{ 
          minHeight: "2em", 
          outline: "none", 
          padding: "10px", 
          border: "1px solid #ddd", 
          borderRadius: "4px"
        }}
      />
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #999;
        }
      `}</style>
    </div>
  );
};
const ImageBlock = ({ block, onUpdate, onDelete }) => {
  const [url, setUrl] = useState(block.data.url || "");
  const [alt, setAlt] = useState(block.data.alt || "");

  const handleBlur = () => {
    onUpdate({ ...block, data: { url, alt } });
  };

  return (
    <div className="block-item image-block">
      <div className="block-controls">
        <button onClick={onDelete} className="delete-block">Xóa</button>
      </div>
      <div style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}>
        <input
          type="text"
          placeholder="URL ảnh (https://example.com/image.jpg)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleBlur}
          style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          type="text"
          placeholder="Mô tả ảnh (alt text)"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={handleBlur}
          style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        {url && (
          <img
            src={url}
            alt={alt}
            style={{ width: "100%", maxWidth: "600px", height: "auto", borderRadius: "4px", marginTop: "10px" }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
      </div>
    </div>
  );
};

const Write = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = location.state;
  const editId = searchParams.get("edit");
  const isEditMode = !!editId || !!state?.id;
  const postId = editId || state?.id;

  const { currentUser } = useContext(AuthContext);
  const [blocks, setBlocks] = useState([]);
  const [title, setTitle] = useState(state?.title || "");
  const [file, setFile] = useState(state?.thumbnail || "");
  const [cat, setCat] = useState(state?.category_id?.toString() || "");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Convert blocks array to HTML
  const blocksToHTML = (blocksArray) => {
    if (!blocksArray || blocksArray.length === 0) return "<p></p>";
    
    return blocksArray
      .map((block) => {
        switch (block.type) {
          case BlockTypes.HEADER: {
            const level = block.data.level || 1;
            const headerText = block.data.text || "";
            return `<h${level}>${headerText}</h${level}>`;
          }
          case BlockTypes.PARAGRAPH: {
            const paraText = block.data.text || "";
            return `<p>${paraText}</p>`;
          }
          case BlockTypes.IMAGE: {
            const imgUrl = block.data.url || "";
            const imgAlt = block.data.alt || "";
            return imgUrl ? `<img src="${imgUrl}" alt="${imgAlt}" style="max-width: 100%; height: auto;" />` : "";
          }
          default:
            return "";
        }
      })
      .filter((html) => html)
      .join("");
  };

  // Parse HTML to blocks array
  const htmlToBlocks = (html) => {
    if (!html || html.trim() === "" || html.trim() === "<p><br></p>") {
      return [];
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const blocks = [];
    let blockId = 1;

    const processNode = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        
        if (tagName === "h1" || tagName === "h2" || tagName === "h3") {
          const level = parseInt(tagName.charAt(1));
          blocks.push({
            id: blockId++,
            type: BlockTypes.HEADER,
            data: {
              text: node.textContent || "",
              level: level,
            },
          });
        } else if (tagName === "p") {
          const text = node.textContent || "";
          if (text.trim() !== "") {
            blocks.push({
              id: blockId++,
              type: BlockTypes.PARAGRAPH,
              data: {
                text: text,
              },
            });
          }
        } else if (tagName === "img") {
          blocks.push({
            id: blockId++,
            type: BlockTypes.IMAGE,
            data: {
              url: node.getAttribute("src") || "",
              alt: node.getAttribute("alt") || "",
            },
          });
        } else {
          // Process child nodes
          Array.from(node.childNodes).forEach(processNode);
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          blocks.push({
            id: blockId++,
            type: BlockTypes.PARAGRAPH,
            data: {
              text: text,
            },
          });
        }
      }
    };

    // Process body children
    Array.from(doc.body.childNodes).forEach(processNode);

    return blocks.length > 0 ? blocks : [];
  };

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await axios.get("/categories");
        setCategories(res.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Không thể tải danh sách danh mục.");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // If in edit mode but no state data, fetch the post
  useEffect(() => {
    const fetchPost = async () => {
      if (isEditMode && postId && !state) {
        try {
          const res = await axios.get(`/posts/${postId}`);
          setTitle(res.data.title || "");
          const parsedBlocks = htmlToBlocks(res.data.content || "");
          setBlocks(parsedBlocks.length > 0 ? parsedBlocks : []);
          setFile(res.data.thumbnail || "");
          setCat(res.data.category_id?.toString() || "");
        } catch (err) {
          console.error("Error fetching post:", err);
          setError("Không thể tải bài viết để chỉnh sửa.");
        }
      } else if (state?.content) {
        const parsedBlocks = htmlToBlocks(state.content);
        setBlocks(parsedBlocks.length > 0 ? parsedBlocks : []);
      }
    };
    fetchPost();
  }, [isEditMode, postId, state]);

  // Block management functions
  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type: type,
      data: type === BlockTypes.HEADER 
        ? { text: "", level: 1 }
        : type === BlockTypes.IMAGE
        ? { url: "", alt: "" }
        : { text: "" },
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (updatedBlock) => {
    setBlocks(blocks.map((block) => (block.id === updatedBlock.id ? updatedBlock : block)));
  };

  const deleteBlock = (blockId) => {
    setBlocks(blocks.filter((block) => block.id !== blockId));
  };

  const moveBlock = (blockId, direction) => {
    const index = blocks.findIndex((block) => block.id === blockId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

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

    if (!blocks || blocks.length === 0) {
      setError("Vui lòng thêm ít nhất một thành phần nội dung!");
      return;
    }

    if (!cat) {
      setError("Vui lòng chọn danh mục!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert blocks to HTML
      const htmlContent = blocksToHTML(blocks);
      
      // Log the data being sent for debugging
      const postData = {
        title: title.trim(),
        content: htmlContent,
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
          setBlocks([]);
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

  const renderBlock = (block) => {
    switch (block.type) {
      case BlockTypes.HEADER:
        return (
          <HeaderBlock
            key={block.id}
            block={block}
            onUpdate={updateBlock}
            onDelete={() => deleteBlock(block.id)}
          />
        );
      case BlockTypes.PARAGRAPH:
        return (
          <ParagraphBlock
            key={block.id}
            block={block}
            onUpdate={updateBlock}
            onDelete={() => deleteBlock(block.id)}
          />
        );
      case BlockTypes.IMAGE:
        return (
          <ImageBlock
            key={block.id}
            block={block}
            onUpdate={updateBlock}
            onDelete={() => deleteBlock(block.id)}
          />
        );
      default:
        return null;
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
          style={{ width: "100%", padding: "15px", fontSize: "24px", marginBottom: "20px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
        
        <div className="block-editor" style={{ minHeight: "400px", padding: "20px", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: "#f9f9f9" }}>
          <div className="add-block-buttons" style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => addBlock(BlockTypes.HEADER)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              + Thêm Tiêu đề
            </button>
            <button
              onClick={() => addBlock(BlockTypes.PARAGRAPH)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              + Thêm Đoạn văn
            </button>
            <button
              onClick={() => addBlock(BlockTypes.IMAGE)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#FF9800",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              + Thêm Ảnh
            </button>
          </div>

          {blocks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              <p>Chưa có nội dung nào. Hãy thêm các thành phần bằng các nút phía trên.</p>
            </div>
          ) : (
            <div className="blocks-container" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {blocks.map((block, index) => (
                <div key={block.id} style={{ position: "relative" }}>
                  {renderBlock(block)}
                  {index > 0 && (
                    <button
                      onClick={() => moveBlock(block.id, "up")}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "50px",
                        padding: "5px 10px",
                        backgroundColor: "#666",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      ↑ Lên
                    </button>
                  )}
                  {index < blocks.length - 1 && (
                    <button
                      onClick={() => moveBlock(block.id, "down")}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        padding: "5px 10px",
                        backgroundColor: "#666",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      ↓ Xuống
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
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
          {categoriesLoading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
              Đang tải danh mục...
            </div>
          ) : categories.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
              Không có danh mục nào
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="cat">
                <input
                  type="radio"
                  checked={cat == category.id}
                  name="cat"
                  value={category.id.toString()}
                  id={`cat-${category.id}`}
                  onChange={(e) => setCat(e.target.value)}
                />
                <label htmlFor={`cat-${category.id}`}>
                  <span style={{ fontWeight: "600" }}>{category.name}</span>
                  {category.description && (
                    <span style={{ display: "block", fontSize: "12px", color: "#666", marginTop: "4px" }}>
                      {category.description}
                    </span>
                  )}
                </label>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Write;