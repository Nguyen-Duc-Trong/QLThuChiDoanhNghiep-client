import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import ButtonBase from '@mui/material/ButtonBase'
import { Bell, Menu } from 'lucide-react'
import UserAvatar from '../common/UserAvatar'
import { colors, layout } from '../../theme/tokens'

/**
 * Thanh công cụ trên cùng: breadcrumb, ngày, chuông thông báo, tài khoản.
 * breadcrumbs: [{ label, onClick? }] — mục cuối là trang hiện tại.
 */
export default function Topbar({
  breadcrumbs = [],
  dateLabel,
  user,
  notificationCount = 0,
  onNotificationsClick,
  onUserClick,
  onMenuClick,
}) {
  return (
    <Box
      component="header"
      sx={{
        height: layout.topbarHeight,
        flexShrink: 0,
        bgcolor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: { xs: 2, md: 4 },
      }}
    >
      {onMenuClick && (
        <IconButton onClick={onMenuClick} aria-label="Mở menu" sx={{ display: { md: 'none' }, ml: -1 }}>
          <Menu size={20} />
        </IconButton>
      )}

      <Breadcrumbs separator="/" sx={{ fontSize: 13, flex: 1, minWidth: 0, '& .MuiBreadcrumbs-separator': { color: colors.textMuted } }}>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1
          return isLast ? (
            <Typography key={item.label} sx={{ fontSize: 13, color: colors.text }} aria-current="page">
              {item.label}
            </Typography>
          ) : (
            <Link
              key={item.label}
              component="button"
              underline="hover"
              onClick={item.onClick}
              sx={{ fontSize: 13, color: colors.textSecondary }}
            >
              {item.label}
            </Link>
          )
        })}
      </Breadcrumbs>

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        {dateLabel && (
          <Typography sx={{ fontSize: 12, color: colors.textSecondary, display: { xs: 'none', sm: 'block' } }}>
            {dateLabel}
          </Typography>
        )}
        <IconButton aria-label="Thông báo" onClick={onNotificationsClick} sx={{ color: colors.textSecondary }}>
          <Badge color="error" variant="dot" invisible={notificationCount === 0}>
            <Bell size={18} />
          </Badge>
        </IconButton>
        {user && (
          <ButtonBase
            onClick={onUserClick}
            disabled={!onUserClick}
            aria-label="Tài khoản"
            sx={{ borderRadius: 2, px: 0.75, py: 0.5, mr: -0.75, textAlign: 'left', gap: 1.25 }}
          >
            <UserAvatar name={user.name} />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{user.name}</Typography>
              <Typography sx={{ fontSize: 11, color: colors.textSecondary }}>{user.role}</Typography>
            </Box>
          </ButtonBase>
        )}
      </Stack>
    </Box>
  )
}
