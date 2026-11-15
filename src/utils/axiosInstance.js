import axios from 'axios'
import { API_LOGIN, API_LOGOUT, API_REFRESH } from '../constants/urlConfig'

/**
 * Client gọi API backend (server/ NestJS).
 * Đường dẫn đầy đủ khai báo trong constants/urlConfig.js (APP_BASE lấy từ VITE_APP_BASE_URL),
 * nên ở đây không đặt baseURL. Interceptor trả thẳng body của response.
 *
 * Xác thực bằng cookie httpOnly (accessToken, refreshToken) do server đặt, JS không đọc được token.
 * Gặp 401 -> tự gọi POST /refresh một lần rồi gửi lại request; refresh cũng hỏng -> báo hết phiên.
 */
const axiosInstance = axios.create({
  timeout: 15000,
  // Gửi kèm cookie cả khi API khác domain (VITE_APP_BASE_URL)
  withCredentials: true,
})

// Các API xác thực: không tự refresh khi lỗi, tránh vòng lặp vô hạn
const AUTH_URLS = [API_LOGIN, API_REFRESH, API_LOGOUT]
const isAuthRequest = (config) => AUTH_URLS.includes(config?.url)

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
      refreshPromise ??= axiosInstance.post(API_REFRESH).finally(() => {
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
