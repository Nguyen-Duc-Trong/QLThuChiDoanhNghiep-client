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

// API yêu cầu chi (server/src/expenses)
// GET `${API_EXPENSES}/form-options`; POST tạo nháp, POST `/submit` tạo + gửi; GET / PATCH `/:id`; POST `/:id/submit`
export const API_EXPENSES = `${APP_API_BASE}/expenses`

// API phòng ban, ủy quyền phê duyệt, cấu hình hệ thống (server/src/department) — quyền "admin.departments"
// GET danh sách, POST tạo; GET `${API_DEPARTMENTS}/form-options`; GET / PATCH / DELETE `${API_DEPARTMENTS}/:id`
export const API_DEPARTMENTS = `${APP_API_BASE}/departments`
// GET danh sách, POST tạo; DELETE `${API_DELEGATIONS}/:id` thu hồi
export const API_DELEGATIONS = `${APP_API_BASE}/delegations`
// GET / PUT cấu hình
export const API_SETTINGS = `${APP_API_BASE}/settings`

// API phê duyệt chi 3 cấp (server/src/approvals)
// GET `${API_APPROVALS}/queue` hàng chờ của tôi; POST `${API_APPROVALS}/:id/decision`
export const API_APPROVALS = `${APP_API_BASE}/approvals`

// API thực hiện chi (server/src/payments)
// GET `${API_PAYMENTS}/requests` hồ sơ thanh toán; GET `/stats`; GET `/transactions` lịch sử chi; POST `${API_PAYMENTS}/:expenseId` hoàn thành chi (kèm file UNC); GET `/:expenseId/proof` file UNC
export const API_PAYMENTS = `${APP_API_BASE}/payments`

// Thông báo thời gian thực (server/src/notifications)
// EventSource `${API_NOTIFICATIONS}/stream` (sự kiện `counts`: { approvals, payments }); GET `${API_NOTIFICATIONS}/counts`
export const API_NOTIFICATIONS = `${APP_API_BASE}/notifications`
