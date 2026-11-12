import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { colors, tones } from '../../theme/tokens'

/**
 * Thẻ chỉ số KPI: nhãn, giá trị lớn, dòng phụ.
 * tone đổi màu giá trị: 'default' | 'primary' | 'success' | 'warning' | 'danger'
 */
export default function StatCard({ label, value, caption, tone = 'default', sx }) {
  const valueColor = tone === 'default' ? colors.text : tones[tone].fg

  return (
    <Paper variant="outlined" sx={{ px: 2.5, py: 2.75, minWidth: 0, ...sx }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography
        sx={{ fontSize: { xs: 24, lg: 30 }, fontWeight: 600, lineHeight: 1.2, my: 1.5, color: valueColor }}
        noWrap
      >
        {value}
      </Typography>
      {caption && <Typography variant="caption" component="p" noWrap>{caption}</Typography>}
    </Paper>
  )
}
