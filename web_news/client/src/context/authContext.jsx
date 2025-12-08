// client/src/context/authContext.jsx
import { createContext, useEffect, useState } from "react";
import axios from "../utils/axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const persistUser = (userData) => {
    setCurrentUser(userData);
  };

  const login = async (inputs) => {
    const res = await axios.post("/auth/login", inputs);
    persistUser(res.data);
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed on server:", err);
    }
    setCurrentUser(null);
    localStorage.removeItem("user");
  }; 
  
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);
  return (
    <AuthContext.Provider
      value={{ currentUser, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;