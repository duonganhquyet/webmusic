// src/contexts/auth.context.jsx
import { createContext, useContext, useState } from "react";

export const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
  // Lấy token và user từ localStorage nếu đã login trước đó
  const savedToken = localStorage.getItem("accessToken");
  const savedUser = localStorage.getItem("user");

  const initValue = {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken || null,
  };

  const [auth, setAuth] = useState(initValue);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tiện lợi
export const useAuthContext = () => useContext(AuthContext);
