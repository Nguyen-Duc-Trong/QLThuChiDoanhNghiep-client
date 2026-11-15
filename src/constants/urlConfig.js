// Địa chỉ server (NestJS). Để trống = cùng domain với client (dev dùng proxy "/api" trong vite.config.js).
// Khi API ở domain khác: đặt VITE_APP_BASE_URL=http://localhost:3000 trong client/.env
export const APP_BASE = import.meta.env.VITE_APP_BASE_URL ?? ''
export const APP_API_BASE = `${APP_BASE}/api`

// API xác thực (server/src/auth)
export const API_LOGIN = `${APP_API_BASE}/login`
export const API_LOGOUT = `${APP_API_BASE}/logout`
export const API_REFRESH = `${APP_API_BASE}/refresh`
export const API_ME = `${APP_API_BASE}/me`

// API người dùng (server/src/users)
// GET danh sách, POST tạo, PUT sửa, DELETE xóa nhiều; GET `${API_USERS}/:id` chi tiết
export const API_USERS = `${APP_API_BASE}/users`
// GET / PUT quyền riêng của một người: `${API_USERS}/:id${API_USER_PERMISSIONS_SUFFIX}`
export const API_USER_PERMISSIONS_SUFFIX = '/permissions'

// API vai trò & phân quyền (server/src/roles)
// GET danh sách; PUT `${API_ROLES}/:key/permissions` sửa quyền của vai trò
export const API_ROLES = `${APP_API_BASE}/roles`

// API danh mục quyền (server/src/permissions)
export const API_PERMISSION_CATALOG = `${APP_API_BASE}/permissions/catalog`
export const API_PERMISSION_OVERRIDES_SUMMARY = `${APP_API_BASE}/permissions/overrides/summary`

// API danh mục thu / chi (server/src/categories)
// GET danh sách, POST tạo, DELETE xóa nhiều; GET / PATCH `${API_CATEGORIES}/:id`
export const API_CATEGORIES = `${APP_API_BASE}/categories`
