import { Navigate, useLocation, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { CustomTab, EmptyState } from '../../components'
import { PERMS, hasAnyPermission } from '../../constants/permissions'
import { selectPermissions } from '../../store/slices/sessionSlice'

const TABS = [
  { value: '/admin/users', label: 'Người dùng', permission: PERMS.ADMIN_USERS },
  { value: '/admin/roles', label: 'Vai trò & phân quyền', permission: PERMS.ADMIN_ROLES },
  { value: '/admin/departments', label: 'Phòng ban & cấu hình', permission: PERMS.ADMIN_DEPARTMENTS },
  { value: '/admin/categories', label: 'Danh mục', permission: PERMS.ADMIN_CATEGORIES },
]

function useAllowedTabs() {
  const owned = useSelector(selectPermissions)
  return TABS.filter((t) => hasAnyPermission(owned, t.permission))
}

/** Chuyển giữa các màn quản trị hệ thống (20, 21, 22, 26) — chỉ hiện tab người dùng có quyền. */
export default function AdminTabs() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const tabs = useAllowedTabs()
  if (tabs.length === 0) return null
  return <CustomTab value={tabs.find((t) => pathname.startsWith(t.value))?.value ?? false} onChange={navigate} tabs={tabs} sx={{ mb: 3 }} />
}

/** Vào /admin thì chuyển tới tab đầu tiên được phép */
export function AdminIndexRedirect() {
  const tabs = useAllowedTabs()
  return tabs.length > 0 ? <Navigate to={tabs[0].value} replace /> : <EmptyState variant="no-permission" />
}
