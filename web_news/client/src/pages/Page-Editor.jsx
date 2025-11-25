import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const defaultAvatar =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const profileFields = [
  { key: "username", label: "Tên đăng nhập" },
  { key: "email", label: "Email" },
  { key: "name", label: "Họ và tên" },
  { key: "age", label: "Tuổi" },
  { key: "years_of_experience", label: "Số năm kinh nghiệm" },
  { key: "role_id", label: "Role ID" },
];

const EditorPage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useContext(AuthContext);

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <section className="editor-page">
      <div className="editor-card">
        <div className="editor-header">
          <img
            src={currentUser.avatar || defaultAvatar}
            alt="Editor avatar"
            className="editor-avatar"
          />
          <div>
            <h1>{currentUser.name || currentUser.username}</h1>
            <p>Editor Dashboard</p>
          </div>
        </div>

        <div className="editor-details">
          {profileFields.map(({ key, label }) => {
            const value = currentUser[key];
            if (value === undefined || value === null || value === "") {
              return null;
            }

            return (
              <div key={key} className="detail-row">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            );
          })}
        </div>

        <button className="editor-logout" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </section>
  );
};

export default EditorPage;
