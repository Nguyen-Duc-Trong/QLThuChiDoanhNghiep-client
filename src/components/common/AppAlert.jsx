import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import { tones } from '../../theme/tokens'

const ICONS = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
  primary: Info,
  neutral: Info,
}

/**
 * Hộp chú thích có icon + tiêu đề + nội dung.
 * Ví dụ: "Trong hạn mức" (success), "Không tự duyệt" (info), "Khóa tài khoản phải xác nhận" (danger).
 */
export default function AppAlert({ tone = 'info', title, children, icon, action, sx }) {
  const color = tones[tone]
  const Icon = icon ?? ICONS[tone]

  return (
    <Box role={tone === 'danger' ? 'alert' : 'status'} sx={{ bgcolor: color.bg, borderRadius: 2, px: 2.25, py: 2, ...sx }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Box sx={{ color: color.fg, display: 'flex', mt: '1px' }}>
          <Icon size={18} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {title && (
            <Typography sx={{ color: color.fg, fontWeight: 600, fontSize: 14, mb: children ? 0.5 : 0 }}>{title}</Typography>
          )}
          {children && (
            <Typography component="div" variant="body2" sx={{ color: color.fg, opacity: 0.92 }}>
              {children}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Stack>
    </Box>
  )
}
