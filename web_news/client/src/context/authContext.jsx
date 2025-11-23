// client/src/context/authContext.jsx
import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  // 1. Kiểm tra xem có user trong LocalStorage không khi web vừa load
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  // 2. Hàm Đăng Nhập (Gọi API xong thì lưu vào State)
  const login = async (inputs) => {
    const res = await axios.post("http://localhost:8800/api/auth/login", inputs);
    setCurrentUser(res.data);
  };

  // 3. Hàm Đăng Xuất
  const logout = async () => {
    await axios.post("http://localhost:8800/api/auth/logout");
    setCurrentUser(null);
  };

  // 4. Tự động lưu vào LocalStorage mỗi khi currentUser thay đổi
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};