import { useState } from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { ChevronDown } from 'lucide-react'

/**
 * Nút lọc dạng dropdown: "Tất cả vai trò ▾", "Tháng 10/2026".
 * options: [{ value, label }] — giá trị rỗng ('') nghĩa là "tất cả".
 * icon: icon đặt trước nhãn (ví dụ CalendarDays cho bộ lọc kỳ).
 */
export default function FilterSelect({ value, options, onChange, icon, showChevron = true, sx }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const current = options.find((o) => o.value === value) ?? options[0]
  const Icon = icon

  const select = (next) => {
    setAnchorEl(null)
    onChange?.(next)
  }

  return (
    <>
      <Button
        variant="outlined"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        startIcon={Icon ? <Icon size={16} /> : undefined}
        endIcon={showChevron ? <ChevronDown size={14} /> : undefined}
        aria-haspopup="listbox"
        aria-expanded={Boolean(anchorEl)}
        sx={sx}
      >
        {current?.label}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {options.map((option) => (
          <MenuItem key={option.value} selected={option.value === value} onClick={() => select(option.value)} sx={{ fontSize: 14 }}>
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
