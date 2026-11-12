import axios from 'axios'

/**
 * Client gọi API backend (server/ NestJS).
 * Địa chỉ lấy từ VITE_API_URL (ví dụ http://localhost:3000/api), mặc định "/api" cùng domain.
 * Interceptor trả thẳng body của response, nên `await axiosInstance.get(url)` nhận dữ liệu luôn.
 *
 * Xác thực bằng cookie httpOnly (accessToken, refreshToken) do server đặt, JS không đọc được token.
 * Gặp 401 -> tự gọi POST /refresh một lần rồi gửi lại request; refresh cũng hỏng -> báo hết phiên.
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15000,
  // Gửi kèm cookie cả khi API khác domain (VITE_API_URL)
  withCredentials: true,
})

// Các API xác thực: không tự refresh khi lỗi, tránh vòng lặp vô hạn
const AUTH_PATHS = ['/login', '/refresh', '/logout']
const isAuthRequest = (config) => AUTH_PATHS.some((path) => config?.url?.endsWith(path))

// Nhiều request cùng gặp 401 thì chỉ gọi /refresh một lần, các request khác chờ chung
let refreshPromise = null

// main.jsx gán hàm này để báo store khi phiên hết hạn (không import store ở đây để tránh vòng import)
let onSessionExpired = null
export function setOnSessionExpired(handler) {
  onSessionExpired = handler
}

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const { config, response } = error
    if (response?.status !== 401 || !config || config._retried || isAuthRequest(config)) {
      return Promise.reject(error)
    }

    config._retried = true
    try {
      refreshPromise ??= axiosInstance.post('/refresh').finally(() => {
        refreshPromise = null
      })
      await refreshPromise
    } catch {
      onSessionExpired?.()
      return Promise.reject(error)
    }
    return axiosInstance(config)
  },
)

export default axiosInstance
