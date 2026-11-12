import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useMatches, useNavigate } from 'react-router'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { LogOut } from 'lucide-react'
import { AppShell, EmptyState } from '../components'
import { ROLES, findActiveNavKey, getNavItems } from '../constants/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe, logout, selectCurrentUser, selectSessionStatus } from '../store/slices/sessionSlice'
import { formatDate } from '../utils/format'

const TODAY_LABEL = formatDate(new Date())

/**
 * Cổng đăng nhập cho mọi route trong khung: mở app thì hỏi GET /me,
 * chưa đăng nhập (hoặc phiên hết hạn) thì chuyển về /login, nhớ trang đang mở để quay lại.
 */
export default function RootLayout() {
  const dispatch = useDispatch()
  const status = useSelector(selectSessionStatus)
  const location = useLocation()

  useEffect(() => {
    if (status === 'idle') dispatch(fetchMe())
  }, [status, dispatch])

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  if (status !== 'authenticated') {
    return <EmptyState variant="loading" title="Đang kiểm tra phiên đăng nhập..." sx={{ minHeight: '100vh' }} />
  }
  return <AppLayout />
}

/**
 * Khung chung cho mọi route: sidebar theo vai trò, breadcrumb lấy từ `handle.crumb`
 * của các route đang khớp, menu tài khoản để đăng xuất.
 */
function AppLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const matches = useMatches()
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const role = user.roleCode
  const [userMenuEl, setUserMenuEl] = useState(null)

  const navItems = getNavItems(role, { includeGallery: import.meta.env.DEV })
  const activeKey = findActiveNavKey(navItems, pathname)

  const crumbs = matches
    .filter((m) => m.handle?.crumb)
    .map((m) => ({
      label: typeof m.handle.crumb === 'function' ? m.handle.crumb(m) : m.handle.crumb,
      path: m.pathname,
    }))
  const breadcrumbs = [{ label: 'An Việt', path: '/' }, ...crumbs].map((c) => ({ label: c.label, onClick: () => navigate(c.path) }))

  // Route khai báo `handle.roles` thì chỉ các vai trò đó được xem (ví dụ /admin chỉ ADMIN).
  // Đây chỉ là ẩn giao diện; server vẫn tự kiểm tra quyền ở từng API.
  const allowedRoles = matches.findLast((m) => m.handle?.roles)?.handle.roles
  const forbidden = allowedRoles && !allowedRoles.includes(role)

  const signOut = () => {
    setUserMenuEl(null)
    // status -> 'unauthenticated', RootLayout tự chuyển về /login
    dispatch(logout())
  }

  return (
    <>
      <AppShell
        scrollResetKey={pathname}
        sidebarProps={{
          organization: { name: 'Công ty CP An Việt', description: 'Không gian doanh nghiệp' },
          navItems,
          activeKey,
          onNavigate: (key) => navigate(navItems.find((i) => i.key === key).path),
          scope: ROLES[role]?.scope,
        }}
        topbarProps={{
          breadcrumbs,
          dateLabel: TODAY_LABEL,
          user,
          notificationCount: 5,
          onNotificationsClick: () => navigate('/activity'),
          onUserClick: (event) => setUserMenuEl(event.currentTarget),
        }}
      >
        {forbidden ? <EmptyState variant="no-permission" /> : <Outlet />}
      </AppShell>

      <Menu
        anchorEl={userMenuEl}
        open={Boolean(userMenuEl)}
        onClose={() => setUserMenuEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled sx={{ '&.Mui-disabled': { opacity: 1 } }}>
          <ListItemText
            primary={user.name}
            secondary={`${user.email} · ${user.role}`}
            slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 600 } }, secondary: { sx: { fontSize: 12 } } }}
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={signOut}>
          <ListItemIcon>
            <LogOut size={16} />
          </ListItemIcon>
          <ListItemText primary="Đăng xuất" slotProps={{ primary: { sx: { fontSize: 14 } } }} />
        </MenuItem>
      </Menu>
    </>
  )
}
