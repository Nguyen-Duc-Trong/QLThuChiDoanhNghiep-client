import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useMatches, useNavigate } from 'react-router'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { LogOut } from 'lucide-react'
import { AppShell, EmptyState } from '../components'
import { ROLES, findActiveNavKey, getNavItems, hasAnyPermission } from '../constants/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe, logout, refreshSession, selectCurrentUser, selectSessionStatus } from '../store/slices/sessionSlice'
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
 * Khung chung cho mọi route: sidebar theo quyền, breadcrumb lấy từ `handle.crumb`
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

  // Quay lại tab thì tải lại quyền: Admin có thể vừa đổi quyền vai trò / quyền riêng của người này.
  useEffect(() => {
    const onFocus = () => dispatch(refreshSession())
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [dispatch])

  const navItems = getNavItems(user.permissions, { includeGallery: import.meta.env.DEV })
  const activeKey = findActiveNavKey(navItems, pathname)

  const crumbs = matches
    .filter((m) => m.handle?.crumb)
    .map((m) => ({
      label: typeof m.handle.crumb === 'function' ? m.handle.crumb(m) : m.handle.crumb,
      path: m.pathname,
    }))
  const breadcrumbs = [{ label: 'An Việt', path: '/' }, ...crumbs].map((c) => ({ label: c.label, onClick: () => navigate(c.path) }))

  // Mỗi route khai báo `handle.permissions` thì phải có ít nhất một quyền trong đó; route lồng nhau phải qua đủ mọi cấp
  // (vd. /budgets/allocation cần cả budget.menu lẫn budget.allocate). Đây chỉ là ẩn giao diện; server vẫn tự kiểm tra quyền ở từng API.
  const forbidden = matches.some((m) => !hasAnyPermission(user.permissions, m.handle?.permissions))

  // Vai trò bị tắt menu Tổng quan: vào "/" thì chuyển sang menu đầu tiên còn được thấy.
  if (forbidden && pathname === '/' && navItems.length > 0 && navItems[0].path !== '/') {
    return <Navigate to={navItems[0].path} replace />
  }

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
