import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ChartNoAxesCombined,
  CircleCheck,
  LayoutDashboard,
  Landmark,
  Palette,
  ShieldCheck,
} from 'lucide-react'
import { PERMS, hasAnyPermission } from './permissions'

export { hasAnyPermission }

// Menu sidebar: mỗi mục cần quyền `<module>.menu` (Admin bật/tắt theo vai trò hoặc riêng từng người).
// Cùng quyền đó dùng để chặn route trong router.jsx (handle.permissions).
const ALL_ITEMS = [
  { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard, path: '/', permissions: [PERMS.DASHBOARD_MENU] },
  { key: 'income', label: 'Quản lý thu', icon: ArrowDownLeft, path: '/income', permissions: [PERMS.INCOME_MENU] },
  { key: 'expense', label: 'Yêu cầu chi', icon: ArrowUpRight, path: '/expenses', permissions: [PERMS.EXPENSE_MENU] },
  { key: 'approval', label: 'Phê duyệt', icon: CircleCheck, path: '/approvals', permissions: [PERMS.APPROVAL_MENU] },
  { key: 'payment', label: 'Thanh toán', icon: Landmark, path: '/payments', permissions: [PERMS.PAYMENT_MENU] },
  { key: 'budget', label: 'Ngân sách', icon: ChartNoAxesCombined, path: '/budgets', permissions: [PERMS.BUDGET_MENU] },
  { key: 'activity', label: 'Nhật ký & thông báo', icon: Bell, path: '/activity', permissions: [PERMS.ACTIVITY_MENU] },
  { key: 'admin', label: 'Quản trị hệ thống', icon: ShieldCheck, path: '/admin', permissions: [PERMS.ADMIN_MENU] },
]

const GALLERY_ITEM = { key: 'gallery', label: 'Thư viện UI', icon: Palette, path: '/ui' }

export const ROLES = {
  NHAN_VIEN: { label: 'Nhân viên', scope: { title: 'Dữ liệu của bạn', description: 'Quyền được cấp bởi quản trị viên. Mọi thao tác đều có nhật ký.' } },
  TRUONG_PHONG: { label: 'Trưởng phòng', scope: { title: 'Phòng Marketing', description: 'Quyền được cấp bởi quản trị viên. Mọi thao tác đều có nhật ký.' } },
  KE_TOAN: { label: 'Kế toán', scope: { title: 'Toàn doanh nghiệp', description: 'Quyền được cấp bởi quản trị viên. Mọi thao tác đều có nhật ký.' } },
  LANH_DAO: { label: 'Lãnh đạo', scope: { title: 'Toàn doanh nghiệp', description: 'Quyền được cấp bởi quản trị viên. Mọi thao tác đều có nhật ký.' } },
  ADMIN: { label: 'Quản trị viên', scope: { title: 'Quản trị viên hệ thống', description: 'Quyền được cấp bởi quản trị viên. Mọi thao tác đều có nhật ký.' } },
}

/** Các mục menu mà người có danh sách quyền `permissions` được thấy */
export function getNavItems(permissions, { includeGallery = false } = {}) {
  const items = ALL_ITEMS.filter((item) => hasAnyPermission(permissions, item.permissions))
  return includeGallery ? [...items, GALLERY_ITEM] : items
}

// Mục menu đang active = mục có path dài nhất khớp với đầu URL hiện tại.
export function findActiveNavKey(items, pathname) {
  const matches = items.filter((i) => (i.path === '/' ? pathname === '/' : pathname === i.path || pathname.startsWith(`${i.path}/`)))
  matches.sort((a, b) => b.path.length - a.path.length)
  return matches[0]?.key
}
