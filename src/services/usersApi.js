import axiosInstance from '../utils/axiosInstance'

/**
 * Gọi API người dùng (server/src/users). Mỗi hàm trả về body chuẩn của server:
 *   { success, statusCode, message, data, meta? }
 */
const usersApi = {
  /** GET /users?page&limit&search&status — data: User[], meta: { page, limit, total, totalPages } */
  list: (params) => axiosInstance.get('/users', { params }),
  /** GET /users/:id */
  getById: (id) => axiosInstance.get(`/users/${encodeURIComponent(id)}`),
  /** POST /users — { username, email, password } */
  create: (body) => axiosInstance.post('/users', body),
  /** PUT /users — { id, username?, email?, password?, status? } */
  update: (body) => axiosInstance.put('/users', body),
  /** DELETE /users — { ids: string[] }, data: { deletedIds, notFoundIds } */
  remove: (ids) => axiosInstance.delete('/users', { data: { ids } }),
}

export default usersApi
