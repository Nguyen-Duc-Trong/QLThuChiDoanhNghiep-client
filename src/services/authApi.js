import axiosInstance from '../utils/axiosInstance'
import { API_LOGIN, API_LOGOUT, API_ME, API_REFRESH } from '../constants/urlConfig'

/**
 * Gọi API xác thực (server/src/auth). Token nằm trong cookie httpOnly, không trả trong body.
 * Phiên (SessionProfile): { id, username, email, status, role, roleName, scope, permissions: string[] }
 */
const authApi = {
  /** POST /login — { email, password }, data: SessionProfile */
  login: (body) => axiosInstance.post(API_LOGIN, body),
  /** GET /me — data: SessionProfile của người đang đăng nhập */
  me: () => axiosInstance.get(API_ME),
  /** POST /refresh — cấp lại cookie accessToken từ cookie refreshToken */
  refresh: () => axiosInstance.post(API_REFRESH),
  /** POST /logout — thu hồi refresh token và xóa cookie */
  logout: () => axiosInstance.post(API_LOGOUT),
}

export default authApi
