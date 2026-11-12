import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { colors, radius, tones } from '../../theme/tokens'

const TONE_BY_SEVERITY = { success: tones.success, error: tones.danger, warning: tones.warning, info: tones.info }

/** Cột thông báo cố định ở góc trên bên phải, toast mới nằm dưới cùng. */
export const ToastContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: theme.zIndex.snackbar,
  display: 'flex',
  flexDirection: 'column',
  width: 360,
  maxWidth: `calc(100vw - ${theme.spacing(4)})`,
  // Vùng trống giữa các toast không chặn thao tác bên dưới.
  pointerEvents: 'none',
  '& > *': { pointerEvents: 'auto' },
}))

export const StyledAlert = styled(Alert)(({ severity = 'info' }) => {
  const tone = TONE_BY_SEVERITY[severity] ?? tones.info
  return {
    marginBottom: 8,
    alignItems: 'center',
    borderRadius: radius.md,
    border: `1px solid ${tone.border}`,
    backgroundColor: tone.bg,
    color: severity === 'info' ? colors.text : tone.fg,
    fontSize: 13,
    boxShadow: '0 8px 24px rgba(31, 36, 51, 0.12)',
    '& .MuiAlert-icon': { color: tone.fg, opacity: 1 },
    '& .MuiAlert-message': { paddingBlock: 6 },
  }
})
