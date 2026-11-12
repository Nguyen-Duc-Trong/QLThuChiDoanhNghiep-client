import Box from '@mui/material/Box'
import { tones } from '../../theme/tokens'
import { STATUS } from '../../constants/status'

/**
 * Pill trạng thái.
 * - Dùng mã nghiệp vụ: <StatusBadge status="CHO_LANH_DAO" />
 * - Hoặc tự đặt: <StatusBadge tone="success" label="Kế toán đã đối chiếu hồ sơ" />
 */
export default function StatusBadge({ status, label, tone, size = 'medium', sx }) {
  const preset = status ? STATUS[status] : null
  const text = label ?? preset?.label ?? status
  const color = tones[tone ?? preset?.tone ?? 'neutral']

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: size === 'small' ? 0.75 : 1,
        py: size === 'small' ? 0.25 : 0.5,
        borderRadius: 1,
        fontSize: size === 'small' ? 11 : 12,
        fontWeight: 500,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        color: color.fg,
        bgcolor: color.bg,
        ...sx,
      }}
    >
      {text}
    </Box>
  )
}
