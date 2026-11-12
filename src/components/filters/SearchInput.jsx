import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { Search } from 'lucide-react'
import { colors } from '../../theme/tokens'

/** Ô tìm kiếm có icon kính lúp, ví dụ "Tìm theo họ tên, email hoặc mã nhân viên". */
export default function SearchInput({ value, onChange, placeholder = 'Tìm kiếm', width = 280, sx, ...props }) {
  return (
    <TextField
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      placeholder={placeholder}
      size="small"
      sx={{ width: { xs: '100%', sm: width }, ...sx }}
      slotProps={{
        htmlInput: { 'aria-label': placeholder },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search size={16} color={colors.textMuted} />
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  )
}
