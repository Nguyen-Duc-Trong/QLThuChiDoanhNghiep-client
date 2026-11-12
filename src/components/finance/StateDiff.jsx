import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ArrowRight } from 'lucide-react'
import { colors, tones } from '../../theme/tokens'

function Snapshot({ caption, rows, highlight }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        borderRadius: 2,
        p: 1.75,
        border: `1px solid ${highlight ? tones.success.border : colors.border}`,
        bgcolor: highlight ? tones.success.bg : colors.surfaceMuted,
      }}
    >
      <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', color: highlight ? tones.success.fg : colors.textSecondary }}>
        {caption}
      </Typography>
      <Stack spacing={1} sx={{ mt: 1 }}>
        {rows.map((row, i) => (
          <Typography key={row} variant="body2" sx={{ fontWeight: i === 0 ? 600 : 400, color: i === 0 ? colors.text : colors.textSecondary }}>
            {row}
          </Typography>
        ))}
      </Stack>
    </Box>
  )
}

/**
 * So sánh trạng thái trước → sau của một bản ghi nhật ký.
 * before / after: { caption: 'TRƯỚC · 20/10/2026 09:14', rows: ['Trạng thái: Nháp', ...] }
 */
export default function StateDiff({ before, after }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
      <Snapshot {...before} />
      <Box sx={{ color: colors.textMuted, display: 'flex', justifyContent: 'center', transform: { xs: 'rotate(90deg)', sm: 'none' } }}>
        <ArrowRight size={16} />
      </Box>
      <Snapshot {...after} highlight />
    </Stack>
  )
}
