import axiosInstance from '../utils/axiosInstance'

/**
 * Gọi API vai trò & ma trận phân quyền (server/src/roles).
 * Role: { key, name, scope, permissions: string[], updatedAt }
 */
const rolesApi = {
  /** GET /roles — cần quyền "users" */
  list: () => axiosInstance.get('/roles'),
  /** PUT /roles/:key/permissions — { permissions: string[] }, cần quyền "config" */
  updatePermissions: (key, permissions) =>
    axiosInstance.put(`/roles/${encodeURIComponent(key)}/permissions`, { permissions }),
}

export default rolesApi
