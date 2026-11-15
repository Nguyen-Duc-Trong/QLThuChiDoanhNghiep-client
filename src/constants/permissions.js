/**
 * Key quyền theo module, khớp danh mục quyền ở server (server/src/permissions/permission-catalog.ts).
 * Code luôn tham chiếu qua PERMS.* thay vì gõ chuỗi tay.
 *
 * Thêm quyền mới: thêm vào catalog ở server trước, rồi thêm hằng ở đây và dùng với
 * usePermission / <Can> / handle.permissions trong router. Nhãn, cột ma trận... lấy từ GET /permissions/catalog.
 */
export const PERMS = Object.freeze({
  DASHBOARD_MENU: 'dashboard.menu',

  INCOME_MENU: 'income.menu',
  INCOME_CREATE: 'income.create',
  INCOME_EDIT: 'income.edit',
  INCOME_DELETE: 'income.delete',
  INCOME_CONFIRM: 'income.confirm',

  EXPENSE_MENU: 'expense.menu',
  EXPENSE_CREATE: 'expense.create',
  EXPENSE_EDIT: 'expense.edit',
  EXPENSE_DELETE: 'expense.delete',
  EXPENSE_SUBMIT: 'expense.submit',

  APPROVAL_MENU: 'approval.menu',
  APPROVAL_DEPT: 'approval.dept',
  APPROVAL_ACCOUNTING: 'approval.accounting',
  APPROVAL_FINAL: 'approval.final',

  PAYMENT_MENU: 'payment.menu',
  PAYMENT_EXECUTE: 'payment.execute',

  BUDGET_MENU: 'budget.menu',
  BUDGET_ALLOCATE: 'budget.allocate',

  ACTIVITY_MENU: 'activity.menu',
  ACTIVITY_AUDIT: 'activity.audit',

  ADMIN_MENU: 'admin.menu',
  ADMIN_USERS: 'admin.users',
  ADMIN_ROLES: 'admin.roles',
  ADMIN_DEPARTMENTS: 'admin.departments',
  ADMIN_CATEGORIES: 'admin.categories',
})

/** Có ít nhất một quyền trong `required` không. `required` rỗng / không có = luôn được. Nhận chuỗi hoặc mảng. */
export function hasAnyPermission(owned = [], required) {
  const list = Array.isArray(required) ? required : required ? [required] : []
  if (list.length === 0) return true
  return list.some((p) => owned.includes(p))
}
