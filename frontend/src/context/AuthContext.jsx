import { createContext, useState, useEffect, useContext } from "react";
import { api } from "../services/api";

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      console.log("[AuthContext] Starting auth verification...");
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log(
        "[AuthContext] Token from localStorage:",
        token ? "Exists" : "Not Exists"
      );

      if (token) {
        try {
          console.log(
            "[AuthContext] Token exists, attempting to fetch profile..."
          );
          const response = await api.getProfile();
          const userData = response.data.data || response.data;
          console.log("[AuthContext] Profile fetched successfully:", userData);

          localStorage.setItem("user", JSON.stringify(userData));
          setCurrentUser(userData);
          setIsAuthenticated(true);
          setError(null);
          console.log(
            "[AuthContext] User authenticated, isAuthenticated: true"
          );
        } catch (err) {
          console.error(
            "[AuthContext] Token validation failed or error fetching profile:",
            err.response?.status,
            err.message
          );
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setCurrentUser(null);
          setIsAuthenticated(false);
          console.log(
            "[AuthContext] User NOT authenticated, isAuthenticated: false"
          );
        }
      } else {
        console.log("[AuthContext] No token found. User not authenticated.");
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
      console.log(
        "[AuthContext] Auth verification finished. Loading:",
        false,
        "IsAuthenticated:",
        isAuthenticated
      );
    };

    verifyAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    try {
      let apiResponse;
      if (credentials.loginType === "customer") {
        apiResponse = await api.customerLogin({
          email: credentials.email,
          password: credentials.password,
        });
      } else {
        apiResponse = await api.login({
          email: credentials.email,
          password: credentials.password,
        });
      }

      const { token, user } = apiResponse.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setCurrentUser(user);
      setIsAuthenticated(true);
      setError(null);
      setLoading(false);
      console.log(
        "[AuthContext] Login successful. User:",
        user,
        "IsAuthenticated:",
        true
      );
      return apiResponse.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed";
      setError(errorMessage);
      setIsAuthenticated(false);
      setLoading(false);
      console.error("[AuthContext] Login failed:", errorMessage);
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    console.log("[AuthContext] Logging out...");
    try {
      await api.logout();
    } catch (err) {
      console.warn("[AuthContext] Logout API call failed:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setCurrentUser(null);
      setError(null);
      setIsAuthenticated(false);
      setLoading(false);
      console.log("[AuthContext] Logout complete. IsAuthenticated:", false);
    }
  };

  const hasRole = (role) => {
    if (!currentUser) return false;

    return (
      currentUser.role === role ||
      (Array.isArray(currentUser.roles) && currentUser.roles.includes(role))
    );
  };

  const isStaff = () => {
    return hasRole("admin") || hasRole("petugas") || hasRole("officer");
  };

  const isCustomer = () => {
    return hasRole("customer");
  };

  const updateUserData = (newUserData) => {
    localStorage.setItem("user", JSON.stringify(newUserData));
    setCurrentUser(newUserData);
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    hasRole,
    isStaff,
    isCustomer,
    updateUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
