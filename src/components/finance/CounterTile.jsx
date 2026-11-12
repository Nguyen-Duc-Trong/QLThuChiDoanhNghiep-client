import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { tones } from '../../theme/tokens'

/** Ô đếm nhanh có màu nền: "5 Chưa đọc", "3 Đến hạn", "2 Cần xử lý". */
export default function CounterTile({ value, label, tone = 'primary', onClick }) {
  const color = tones[tone]

  return (
    <Box
      component={onClick ? 'button' : 'div'}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      sx={{
        textAlign: 'left',
        font: 'inherit',
        border: 'none',
        bgcolor: color.bg,
        color: color.fg,
        borderRadius: 2,
        p: 1.5,
        minHeight: 72,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <Typography sx={{ fontSize: 20, fontWeight: 600, color: 'inherit' }}>{value}</Typography>
      <Typography sx={{ fontSize: 11, color: 'inherit', mt: 0.5 }}>{label}</Typography>
    </Box>
  )
}
