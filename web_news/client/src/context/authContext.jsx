// client/src/context/authContext.jsx
import { createContext, useEffect, useState } from "react";
import axios from "../utils/axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  // 1. Kiểm tra xem có user trong LocalStorage không khi web vừa load
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const persistUser = (userData) => {
    setCurrentUser(userData);
  };

  // 2. Hàm Đăng Nhập (Gọi API xong thì lưu vào State)
  const login = async (inputs) => {
    const res = await axios.post("/auth/login", inputs);
    persistUser(res.data);
  };

  // 2b. Hàm đăng nhập dành riêng cho Editor
  const editorLogin = async (inputs) => {
    const res = await axios.post("/auth/editor-login", inputs);

    // Kiểm tra role_id nếu có để đảm bảo đúng quyền Editor (role_id = 2)
    if (res.data.role_id && Number(res.data.role_id) !== 2) {
      throw new Error("Tài khoản này không có quyền Editor");
    }

    persistUser(res.data);
  };

  // 3. Hàm Đăng Xuất
  const logout = async () => {
    await axios.post("/auth/logout");
    setCurrentUser(null);
  };

  // 4. Tự động lưu vào LocalStorage mỗi khi currentUser thay đổi
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{ currentUser, login, editorLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;