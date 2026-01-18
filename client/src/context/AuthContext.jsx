import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [auth, setAuth] = useState({
        token: null,
        id: null,
        user: null,
        role: null,
    });


    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            const decoded = jwtDecode(storedToken);
            setAuth({
                token: storedToken,
                id: decoded.id,
                user: { id: decoded.id, email: decoded.email, username: decoded.username },
                role: decoded.role,
            });
        }
    }, []);


    const login = (token) => {
        const decoded = jwtDecode(token);
        localStorage.setItem("token", token);
        setAuth({
            token,
            id: decoded.id,
            user: { id: decoded.id, email: decoded.email, username: decoded.username },
            role: decoded.role,
        });
    };

    return (
        <AuthContext.Provider value={{
            auth,
            login,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);