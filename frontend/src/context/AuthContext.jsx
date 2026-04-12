import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );

  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken")
  );

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  /* ========================================
     ✅ LOGIN
  ======================================== */
  const login = (tokens, userData) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);

    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    setUser(userData);
  };

  /* ========================================
     ✅ LOGOUT
  ======================================== */
  const logout = useCallback(
    (redirect = true) => {
      clearAuth();

      if (redirect) {
        navigate("/admin/login");
      }
    },
    [clearAuth, navigate]
  );

  /* ========================================
     ✅ LOAD USER ON START
  ======================================== */
  const loadUser = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setUser(res.data);
    } catch (error) {
      clearAuth();

      // Only redirect if user is already trying to access admin area
      if (location.pathname.startsWith("/admin")) {
        navigate("/admin/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, clearAuth, location.pathname, navigate]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /* ========================================
     ✅ REFRESH TOKEN FUNCTION
  ======================================== */
  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/refresh-token`, {
        refreshToken,
      });

      const newAccessToken = res.data.accessToken;

      localStorage.setItem("accessToken", newAccessToken);
      setAccessToken(newAccessToken);

      return newAccessToken;
    } catch (error) {
      clearAuth();

      if (location.pathname.startsWith("/admin")) {
        navigate("/admin/login", { replace: true });
      }

      return null;
    }
  }, [refreshToken, clearAuth, location.pathname, navigate]);

  /* ========================================
     ✅ AXIOS INTERCEPTOR
  ======================================== */
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest?._retry &&
          refreshToken
        ) {
          originalRequest._retry = true;

          const newAccessToken = await refreshAccessToken();

          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshToken, refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);