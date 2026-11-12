import axiosInstance from '../utils/axiosInstance'

/**
 * Gọi API xác thực (server/src/auth). Token nằm trong cookie httpOnly, không trả trong body.
 * Phiên (SessionProfile): { id, username, email, status, role, roleName, scope, permissions: string[] }
 */
const authApi = {
  /** POST /login — { email, password }, data: SessionProfile */
  login: (body) => axiosInstance.post('/login', body),
  /** GET /me — data: SessionProfile của người đang đăng nhập */
  me: () => axiosInstance.get('/me'),
  /** POST /refresh — cấp lại cookie accessToken từ cookie refreshToken */
  refresh: () => axiosInstance.post('/refresh'),
  /** POST /logout — thu hồi refresh token và xóa cookie */
  logout: () => axiosInstance.post('/logout'),
}

export default authApi
