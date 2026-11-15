/**
 * Tiện ích đọc danh mục quyền (GET /permissions/catalog) và các quy tắc cố định với ADMIN,
 * dùng chung cho màn phân quyền vai trò và quyền riêng từng người.
 */

/** Tất cả action trong catalog, kèm moduleKey/moduleLabel */
export function flattenCatalog(catalog) {
  return catalog.flatMap((m) => m.actions.map((a) => ({ ...a, moduleKey: m.key, moduleLabel: m.label })))
}

/** Map key -> action để tra nhanh */
export function indexCatalog(catalog) {
  return Object.fromEntries(flattenCatalog(catalog).map((a) => [a.key, a]))
}

export const ADMIN_SENSITIVE_REASON = 'Admin chỉ quản trị cấu hình, không được cấp quyền duyệt, thực chi hay ngân sách'
export const ADMIN_REQUIRED_REASON = 'Admin bắt buộc giữ quyền này, nếu bỏ sẽ không ai vào được màn quản trị'

/**
 * Lý do một quyền không được đổi với vai trò ADMIN (hoặc người có vai trò ADMIN), ngược lại null.
 * granted: hiện đang có quyền hay không.
 */
export function adminLockReason(roleKey, action, granted) {
  if (roleKey !== 'ADMIN' || !action) return null
  if (action.sensitive && !granted) return ADMIN_SENSITIVE_REASON
  if (action.adminRequired && granted) return ADMIN_REQUIRED_REASON
  return null
}
