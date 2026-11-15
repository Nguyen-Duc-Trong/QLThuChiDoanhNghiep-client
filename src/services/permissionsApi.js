import axiosInstance from '../utils/axiosInstance'
import {
  API_PERMISSION_CATALOG,
  API_PERMISSION_OVERRIDES_SUMMARY,
  API_USER_PERMISSIONS_SUFFIX,
  API_USERS,
} from '../constants/urlConfig'

const userPermissionsUrl = (id) => `${API_USERS}/${encodeURIComponent(id)}${API_USER_PERMISSIONS_SUFFIX}`

/**
 * Gọi API danh mục quyền & quyền riêng từng người (server/src/permissions).
 * Catalog: [{ key, label, actions: [{ key, label, defaultRoles, sensitive, adminRequired }] }]
 * UserPermissions: { userId, role, rolePermissions: string[], overrides: [{ permission, effect: 'grant'|'deny', reason }], effective: string[] }
 */
const permissionsApi = {
  /** GET /permissions/catalog — ai đăng nhập cũng gọi được */
  catalog: () => axiosInstance.get(API_PERMISSION_CATALOG),
  /** GET /permissions/overrides/summary — { [userId]: số quyền riêng }, cần "admin.users" */
  overridesSummary: () => axiosInstance.get(API_PERMISSION_OVERRIDES_SUMMARY),
  /** GET /users/:id/permissions — cần "admin.users" */
  getUserPermissions: (id) => axiosInstance.get(userPermissionsUrl(id)),
  /** PUT /users/:id/permissions — { overrides }, thay toàn bộ quyền riêng, cần "admin.roles" */
  updateUserPermissions: (id, overrides) => axiosInstance.put(userPermissionsUrl(id), { overrides }),
}

export default permissionsApi
