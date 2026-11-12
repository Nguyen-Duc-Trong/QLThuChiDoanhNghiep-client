import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { Inbox, Lock, SearchX, WifiOff } from 'lucide-react'
import { colors } from '../../theme/tokens'

const PRESETS = {
  empty: { icon: Inbox, title: 'Chưa có dữ liệu', description: 'Không có hồ sơ nào trong bộ lọc hiện tại.' },
  'no-results': { icon: SearchX, title: 'Không tìm thấy kết quả', description: 'Không tìm thấy hồ sơ phù hợp với từ khóa.' },
  'no-permission': { icon: Lock, title: 'Không có quyền truy cập', description: 'Bạn không có quyền truy cập màn hình này.' },
  'network-error': { icon: WifiOff, title: 'Lỗi kết nối mạng', description: 'Thử lại để tải dữ liệu.' },
}

/**
 * Trạng thái rỗng / không có kết quả / không có quyền / lỗi mạng / đang tải.
 * variant: 'empty' | 'no-results' | 'no-permission' | 'network-error' | 'loading'
 */
export default function EmptyState({ variant = 'empty', title, description, action, compact = false, sx }) {
  if (variant === 'loading') {
    return (
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center', py: compact ? 2 : 6, ...sx }}>
        <CircularProgress size={18} />
        <Typography variant="body2" color="text.secondary">{title ?? 'Đang tải dữ liệu...'}</Typography>
      </Stack>
    )
  }

  const preset = PRESETS[variant] ?? PRESETS.empty
  const Icon = preset.icon

  return (
    <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center', py: compact ? 3 : 6, px: 2, ...sx }}>
      <Box sx={{ color: colors.textMuted, display: 'flex', mb: 0.5 }}>
        <Icon size={compact ? 24 : 32} strokeWidth={1.5} />
      </Box>
      <Typography sx={{ fontWeight: 600 }}>{title ?? preset.title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
        {description ?? preset.description}
      </Typography>
      {action && <Box sx={{ pt: 1 }}>{action}</Box>}
    </Stack>
  )
}
