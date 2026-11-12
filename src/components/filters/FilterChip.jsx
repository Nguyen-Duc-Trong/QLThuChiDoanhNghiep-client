import Chip from '@mui/material/Chip'
import { colors } from '../../theme/tokens'

/** Chip lọc nhanh: "Hành động: Tất cả", "7 ngày gần nhất" (selected → nền tím nhạt). */
export default function FilterChip({ label, selected = false, onClick, onDelete }) {
  return (
    <Chip
      label={label}
      onClick={onClick}
      onDelete={onDelete}
      variant="outlined"
      sx={{
        height: 30,
        fontSize: 12,
        borderColor: selected ? colors.primarySoft : colors.border,
        bgcolor: selected ? colors.primarySoft : colors.surface,
        color: selected ? colors.primary : colors.text,
      }}
    />
  )
}
