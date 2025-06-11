import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:6969",
  withCredentials: true, // Needed for sending cookies
});

// Automatically refresh token on 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await axiosInstance.post("/refresh-token");
        return axiosInstance(originalRequest); // retry original request
      } catch (err) {
        console.error("Refresh token failed", err);
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
