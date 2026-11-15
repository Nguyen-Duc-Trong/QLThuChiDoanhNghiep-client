import axiosInstance from '../utils/axiosInstance'
import { API_ROLES } from '../constants/urlConfig'

/**
 * Gọi API vai trò & ma trận phân quyền (server/src/roles).
 * Role: { key, name, scope, permissions: string[], updatedAt }
 */
const rolesApi = {
  /** GET /roles — cần quyền "admin.users" hoặc "admin.roles" */
  list: () => axiosInstance.get(API_ROLES),
  /** PUT /roles/:key/permissions — { permissions: string[] }, cần quyền "admin.roles" */
  updatePermissions: (key, permissions) =>
    axiosInstance.put(`${API_ROLES}/${encodeURIComponent(key)}/permissions`, { permissions }),
}

export default rolesApi
