import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

/** Hàng cuối form: ghi chú bên trái ("Chưa thể gửi: ..."), các nút bên phải. */
export default function FormFooter({ note, children, sx }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', mt: 3, ...sx }}
    >
      <Typography variant="body2" color="text.secondary">{note}</Typography>
      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
        {children}
      </Stack>
    </Stack>
  )
}
