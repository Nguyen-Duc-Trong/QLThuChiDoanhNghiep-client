import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { colors, tones } from '../../theme/tokens'

/**
 * Thẻ thông báo trong trung tâm thông báo.
 * tone: 'primary' | 'danger' | 'warning' | 'success' — quyết định màu viền trái và chấm loại.
 * read = true: thu gọn, chữ xám, nhãn "Đã đọc".
 */
export default function NotificationItem({ tone = 'primary', category, time, title, description, actionLabel, onAction, read = false }) {
  const color = tones[tone]

  if (read) {
    return (
      <Paper variant="outlined" sx={{ p: 2, bgcolor: colors.surfaceMuted }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption">{category}</Typography>
          <Typography variant="caption" sx={{ color: colors.textMuted }}>Đã đọc</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">{description ?? title}</Typography>
      </Paper>
    )
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, borderLeft: `3px solid ${color.fg}` }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color.fg }} />
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: color.fg }}>{category}</Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: colors.textMuted }}>{time}</Typography>
      </Stack>
      <Typography sx={{ fontSize: 13, fontWeight: 600, mt: 1.25 }}>{title}</Typography>
      {description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>{description}</Typography>}
      {actionLabel && (
        <Button
          size="small"
          variant="soft"
          color={tone === 'danger' ? 'error' : tone}
          onClick={onAction}
          sx={{ mt: 1.5 }}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  )
}
