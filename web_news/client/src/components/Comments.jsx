import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import axios from "axios";
import moment from "moment";

const Comments = ({ postId }) => {
  const { currentUser } = useContext(AuthContext);
  const [desc, setDesc] = useState("");
  const [comments, setComments] = useState([]);
  
  // State lưu ID của comment đang được trả lời (để hiện ô nhập liệu con)
  const [replyingTo, setReplyingTo] = useState(null); 
  const [replyDesc, setReplyDesc] = useState("");

  // Load comments
  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:8800/api/comments?postId=${postId}`);
      setComments(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // Hàm gửi comment (chung cho cả cha và con)
  const handleSend = async (e, parentId = null) => {
    e.preventDefault();
    if (!currentUser) return alert("Bạn cần đăng nhập!");

    const content = parentId ? replyDesc : desc; // Nếu là reply thì lấy text của ô reply
    if (!content.trim()) return;

    try {
      await axios.post("http://localhost:8800/api/comments", {
        desc: content,
        post_id: postId,
        user_id: currentUser.id,
        parent_id: parentId // Gửi kèm ID cha (nếu có)
      });
      
      // Reset form
      if (parentId) {
        setReplyingTo(null);
        setReplyDesc("");
      } else {
        setDesc("");
      }
      fetchComments(); // Load lại danh sách
    } catch (err) { console.log(err); }
  };

  // --- LOGIC LỌC BÌNH LUẬN CHA / CON ---
  // 1. Lấy danh sách comment gốc (parent_id là null)
  const rootComments = comments.filter(c => c.parent_id === null);

  // 2. Hàm lấy comment con dựa vào ID cha
  const getReplies = (parentId) => {
    return comments.filter(c => c.parent_id === parentId);
  };

  return (
    <div className="comments">
      {/* Ô nhập comment gốc */}
      <div className="write">
        <img src={currentUser?.avatar} alt="" />
        <input 
          type="text" 
          placeholder="Viết bình luận..." 
          value={desc} 
          onChange={e => setDesc(e.target.value)} 
        />
        <button onClick={(e) => handleSend(e, null)}>Gửi</button>
      </div>
      
      {/* Render danh sách comment */}
      {rootComments.map((comment) => (
        <div key={comment.id} className="comment-block">
          
          {/* COMMENT CHA */}
          <div className="comment">
            <img src={comment.avatar} alt="" />
            <div className="info">
              <span>{comment.username}</span>
              <p>{comment.content}</p>
              <div className="actions">
                 <span className="date">{moment(comment.created_at).fromNow()}</span>
                 <span className="reply-btn" onClick={() => setReplyingTo(comment.id)}>Trả lời</span>
              </div>
            </div>
          </div>

          {/* Ô NHẬP TRẢ LỜI (Chỉ hiện khi bấm nút Trả lời) */}
          {replyingTo === comment.id && (
            <div className="write reply-input" style={{marginLeft: "50px"}}>
               <input 
                 autoFocus
                 type="text" 
                 placeholder={`Trả lời ${comment.username}...`} 
                 value={replyDesc} 
                 onChange={e => setReplyDesc(e.target.value)} 
               />
               <button onClick={(e) => handleSend(e, comment.id)}>Gửi</button>
               <button className="cancel" onClick={() => setReplyingTo(null)}>Hủy</button>
            </div>
          )}

          {/* DANH SÁCH COMMENT CON (Thụt đầu dòng) */}
          {getReplies(comment.id).length > 0 && (
            <div className="replies" style={{marginLeft: "50px", borderLeft: "2px solid #eee", paddingLeft: "10px"}}>
              {getReplies(comment.id).map(reply => (
                <div className="comment" key={reply.id}>
                  <img src={reply.avatar} alt="" />
                  <div className="info">
                    <span>{reply.username}</span>
                    <p>{reply.content}</p>
                    <span className="date">{moment(reply.created_at).fromNow()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      ))}
    </div>
  );
};

export default Comments;