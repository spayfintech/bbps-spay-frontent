import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [cookie, , removeCookie] = useCookies(["token", "role", "user"]);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchProfile = async (token = cookie.token) => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(`${BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data.user);
    } catch (error) {
      console.error(error);

      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeCookie("token", { path: "/" });
    removeCookie("role", { path: "/" });
    removeCookie("user", { path: "/" });

    setUser(null);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [cookie.token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        fetchProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
