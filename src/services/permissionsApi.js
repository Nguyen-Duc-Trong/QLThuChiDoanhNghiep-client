import axiosInstance from '../utils/axiosInstance'

/**
 * Gọi API danh mục quyền & quyền riêng từng người (server/src/permissions).
 * Catalog: [{ key, label, actions: [{ key, label, defaultRoles, sensitive, adminRequired }] }]
 * UserPermissions: { userId, role, rolePermissions: string[], overrides: [{ permission, effect: 'grant'|'deny', reason }], effective: string[] }
 */
const permissionsApi = {
  /** GET /permissions/catalog — ai đăng nhập cũng gọi được */
  catalog: () => axiosInstance.get('/permissions/catalog'),
  /** GET /permissions/overrides/summary — { [userId]: số quyền riêng }, cần "admin.users" */
  overridesSummary: () => axiosInstance.get('/permissions/overrides/summary'),
  /** GET /users/:id/permissions — cần "admin.users" */
  getUserPermissions: (id) => axiosInstance.get(`/users/${encodeURIComponent(id)}/permissions`),
  /** PUT /users/:id/permissions — { overrides }, thay toàn bộ quyền riêng, cần "admin.roles" */
  updateUserPermissions: (id, overrides) =>
    axiosInstance.put(`/users/${encodeURIComponent(id)}/permissions`, { overrides }),
}

export default permissionsApi
