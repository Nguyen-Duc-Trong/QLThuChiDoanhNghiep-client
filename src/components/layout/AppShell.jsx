import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

/**
 * Khung ứng dụng: Sidebar cố định bên trái (thành Drawer trên mobile) + Topbar + vùng nội dung.
 * sidebarProps / topbarProps được chuyển thẳng xuống Sidebar / Topbar.
 */
export default function AppShell({ sidebarProps, topbarProps, children, contentSx, scrollResetKey }) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const mainRef = useRef(null)

  // Vùng nội dung tự cuộn riêng nên phải tự đưa về đầu trang khi đổi màn hình.
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [scrollResetKey])

  const handleNavigate = (key) => {
    setMobileOpen(false)
    sidebarProps?.onNavigate?.(key)
  }

  const sidebar = <Sidebar {...sidebarProps} onNavigate={handleNavigate} />

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {isDesktop ? (
        sidebar
      ) : (
        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
          {sidebar}
        </Drawer>
      )}

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar {...topbarProps} onMenuClick={isDesktop ? undefined : () => setMobileOpen(true)} />
        <Box component="main" ref={mainRef} sx={{ flex: 1, overflowY: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 4.5 }, ...contentSx }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
