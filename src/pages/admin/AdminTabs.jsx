import { useLocation, useNavigate } from 'react-router'
import { CustomTab } from '../../components'

const TABS = [
  { value: '/admin/users', label: 'Người dùng' },
  { value: '/admin/roles', label: 'Vai trò & phân quyền' },
  { value: '/admin/departments', label: 'Phòng ban & cấu hình' },
  { value: '/admin/categories', label: 'Danh mục' },
]

/** Chuyển giữa các màn quản trị hệ thống (20, 21, 22, 26) — sidebar chỉ có một mục "Quản trị hệ thống". */
export default function AdminTabs() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return <CustomTab value={TABS.find((t) => pathname.startsWith(t.value))?.value ?? TABS[0].value} onChange={navigate} tabs={TABS} sx={{ mb: 3 }} />
}
