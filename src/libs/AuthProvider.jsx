import { useContext, useEffect, useState, createContext } from "react";
import { getSingleUser } from "../api-endpoint/auth/auths";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("USER_KEY");
    return storedUser !== undefined ? JSON?.parse(storedUser) : null;
  });

  console.log("user at authprovider", user);

  const [loading, setLoading] = useState(false);

  // const fetchUser = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await getSingleUser();
  //     console.log("Ath authporvider", res);

  //     setUser(res.data);
  //   } catch (error) {
  //     setUser(null);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchUser();
  // }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        // fetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
