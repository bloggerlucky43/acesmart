import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Attach Authorization Bearer token from localStorage for seamless cross-subdomain API calls
api.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem("USER_KEY");
      if (stored) {
        const user = JSON.parse(stored);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch (e) {
      console.warn("Failed to attach auth token from storage", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// //Global Response Interceptor
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalUrl = error.config?.url;
//     console.warn("⚠️ Interceptor caught 401 on:", originalUrl);

//     if (
//       error.response?.status === 401 &&
//       !originalUrl?.includes("/auth/login") &&
//       !originalUrl?.includes("/auth/register")
//     ) {
//       console.warn("🚪 Forcing logout due to unauthorized request.");
//       localStorage.removeItem("USER_KEY");

//       window.dispatchEvent(new Event("force-logout"));
//     }

//     return Promise.reject(error);
//   }
// );

export default api;
