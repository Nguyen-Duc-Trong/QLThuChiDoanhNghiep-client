import axiosInstance from '../utils/axiosInstance'
import { API_CATEGORIES } from '../constants/urlConfig'

/**
 * Gọi API danh mục thu / chi (server/src/categories). Cần quyền "admin.categories".
 * Category: { id, code, name, type: 'THU'|'CHI', typeLabel, description, status: 'DANG_SU_DUNG'|'NGUNG_SU_DUNG',
 *             statusLabel, createdBy, updatedBy, updatedByName, createdAt, updatedAt }
 */
const categoriesApi = {
  /** GET /categories?page&limit&search&type&status — data: Category[], meta: { page, limit, total, totalPages } */
  list: (params) => axiosInstance.get(API_CATEGORIES, { params }),
  /** GET /categories/:id */
  getById: (id) => axiosInstance.get(`${API_CATEGORIES}/${encodeURIComponent(id)}`),
  /** POST /categories — { type, code, name, description?, status? } */
  create: (body) => axiosInstance.post(API_CATEGORIES, body),
  /** PATCH /categories/:id — { name?, description?, status? } (không đổi được type / code) */
  update: (id, body) => axiosInstance.patch(`${API_CATEGORIES}/${encodeURIComponent(id)}`, body),
  /** DELETE /categories — { ids: string[] }, data: { deletedIds, notFoundIds } */
  remove: (ids) => axiosInstance.delete(API_CATEGORIES, { data: { ids } }),
}

export default categoriesApi
