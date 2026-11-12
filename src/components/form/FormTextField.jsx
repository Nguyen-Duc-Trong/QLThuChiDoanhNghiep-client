import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useId } from 'react'

/**
 * Ô nhập có nhãn nằm phía trên (theo thiết kế), dấu * khi bắt buộc, helper/lỗi bên dưới.
 * Các prop còn lại được chuyển xuống MUI TextField (multiline, select, type, slotProps...).
 */
export default function FormTextField({ label, required, helperText, error, id, sx, children, ...props }) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <Box sx={sx}>
      {label && (
        <Typography component="label" htmlFor={inputId} sx={{ display: 'block', fontSize: 12, fontWeight: 600, mb: 0.75 }}>
          {label}
          {required && ' *'}
        </Typography>
      )}
      <TextField
        id={inputId}
        fullWidth
        required={required}
        error={Boolean(error)}
        helperText={typeof error === 'string' ? error : helperText}
        {...props}
      >
        {children}
      </TextField>
    </Box>
  )
}
