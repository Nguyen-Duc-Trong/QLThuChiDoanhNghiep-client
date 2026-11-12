import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import StatusBadge from '../common/StatusBadge'

/**
 * Một xác nhận duyệt đã hoàn tất: badge cấp duyệt + người/thời gian + ghi chú.
 * Ví dụ: "Đã duyệt cấp phòng" — "Trần Minh Đức · 20/10/2026, 14:30".
 */
export default function ApprovalRecord({ label, tone = 'success', actor, note }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.75} sx={{ alignItems: 'flex-start' }}>
      <StatusBadge label={label} tone={tone} sx={{ flexShrink: 0 }} />
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{actor}</Typography>
        {note && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{note}</Typography>}
      </Box>
    </Stack>
  )
}
