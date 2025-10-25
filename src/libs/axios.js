import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

//Global Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalUrl = error.config?.url;

    if (
      error.response?.status === 401 &&
      originalUrl !== "/auth/login" &&
      originalUrl !== "/auth/register"
    ) {
      localStorage.removeItem("USER_KEY");

      window.dispatchEvent(new Event("force-logout"));
    }

    return Promise.reject(error);
  }
);

export default api;
