import { createContext, useContext, useState } from "react";

export const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
    const initValue = {
        user:{
            _id: "",
          imgUrl: "",
          name: "",
          role: ""
        }
    }
    const [auth, setAuth] = useState(initValue);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
};
export const useAuthContext = () => useContext(AuthContext);