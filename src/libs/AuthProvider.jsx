import { useContext, useEffect, useState, createContext } from "react";
import { getSingleUser } from "../api-endpoint/auth/auths";
import { logoutUser } from "../api-endpoint/auth/auths";
import { useNavigate } from "react-router-dom";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("USER_KEY");
    return storedUser !== undefined ? JSON?.parse(storedUser) : null;
  });

  console.log("user at authprovider", user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("USER_KEY");

      navigate("/");
    }
  };
  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await getSingleUser();
      console.log("Ath authporvider", res);

      setUser(res.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const logoutHandler = () => {
      setUser(null);
    };

    window.addEventListener("force-logout", logoutHandler);
    return () => window.removeEventListener("force-logout", logoutHandler);
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        logout,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
