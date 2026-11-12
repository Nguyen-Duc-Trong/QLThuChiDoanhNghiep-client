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

// Menu sidebar theo vai trò (theo ma trận module × vai trò trong màn 24).
const ALL_ITEMS = {
  overview: { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard, path: '/' },
  income: { key: 'income', label: 'Quản lý thu', icon: ArrowDownLeft, path: '/income' },
  expense: { key: 'expense', label: 'Yêu cầu chi', icon: ArrowUpRight, path: '/expenses' },
  approval: { key: 'approval', label: 'Phê duyệt', icon: CircleCheck, path: '/approvals' },
  payment: { key: 'payment', label: 'Thanh toán', icon: Landmark, path: '/payments' },
  budget: { key: 'budget', label: 'Ngân sách', icon: ChartNoAxesCombined, path: '/budgets' },
  activity: { key: 'activity', label: 'Nhật ký & thông báo', icon: Bell, path: '/activity' },
  admin: { key: 'admin', label: 'Quản trị hệ thống', icon: ShieldCheck, path: '/admin' },
  gallery: { key: 'gallery', label: 'Thư viện UI', icon: Palette, path: '/ui' },
}

export const ROLES = {
  NHAN_VIEN: { label: 'Nhân viên', scope: { title: 'Dữ liệu của bạn', description: 'Quyền được cấp bởi quản trị viên. Mọi thao tác đều có nhật ký.' } },
  TRUONG_PHONG: { label: 'Trưởng phòng', scope: { title: 'Phòng Marketing', description: 'Quyền được cấp bởi quản trị viên. Mọi thao tác đều có nhật ký.' } },
  KE_TOAN: { label: 'Kế toán', scope: { title: 'Toàn doanh nghiệp', description: 'Quyền được cấp bởi quản trị viên. Mọi thao tác đều có nhật ký.' } },
  LANH_DAO: { label: 'Lãnh đạo', scope: { title: 'Toàn doanh nghiệp', description: 'Quyền được cấp bởi quản trị viên. Mọi thao tác đều có nhật ký.' } },
  ADMIN: { label: 'Quản trị viên', scope: { title: 'Quản trị viên hệ thống', description: 'Quyền được cấp bởi quản trị viên. Mọi thao tác đều có nhật ký.' } },
}

export const NAV_BY_ROLE = {
  NHAN_VIEN: ['overview', 'income', 'expense', 'budget', 'activity'],
  TRUONG_PHONG: ['overview', 'income', 'expense', 'approval', 'budget', 'activity'],
  KE_TOAN: ['overview', 'income', 'expense', 'approval', 'payment', 'budget', 'activity'],
  LANH_DAO: ['overview', 'income', 'expense', 'approval', 'budget', 'activity'],
  ADMIN: ['overview', 'income', 'expense', 'approval', 'payment', 'budget', 'activity', 'admin'],
}

export function getNavItems(role, { includeGallery = false } = {}) {
  const keys = [...(NAV_BY_ROLE[role] ?? NAV_BY_ROLE.NHAN_VIEN), ...(includeGallery ? ['gallery'] : [])]
  return keys.map((key) => ALL_ITEMS[key])
}

// Mục menu đang active = mục có path dài nhất khớp với đầu URL hiện tại.
export function findActiveNavKey(items, pathname) {
  const matches = items.filter((i) => (i.path === '/' ? pathname === '/' : pathname === i.path || pathname.startsWith(`${i.path}/`)))
  matches.sort((a, b) => b.path.length - a.path.length)
  return matches[0]?.key
}
