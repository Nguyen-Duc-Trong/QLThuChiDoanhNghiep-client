import axiosInstance from '../utils/axiosInstance'
import { API_USERS } from '../constants/urlConfig'

/**
 * Gọi API người dùng (server/src/users). Mỗi hàm trả về body chuẩn của server:
 *   { success, statusCode, message, data, meta? }
 */
const usersApi = {
  /** GET /users?page&limit&search&status — data: User[], meta: { page, limit, total, totalPages } */
  list: (params) => axiosInstance.get(API_USERS, { params }),
  /** GET /users/:id */
  getById: (id) => axiosInstance.get(`${API_USERS}/${encodeURIComponent(id)}`),
  /** POST /users — { username, email, password } */
  create: (body) => axiosInstance.post(API_USERS, body),
  /** PUT /users — { id, username?, email?, password?, status? } */
  update: (body) => axiosInstance.put(API_USERS, body),
  /** DELETE /users — { ids: string[] }, data: { deletedIds, notFoundIds } */
  remove: (ids) => axiosInstance.delete(API_USERS, { data: { ids } }),
}

export default usersApi
