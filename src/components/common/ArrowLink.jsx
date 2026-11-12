import Link from '@mui/material/Link'
import { ArrowRight } from 'lucide-react'

/** Liên kết dạng chữ tím đậm kèm mũi tên: "Xem tất cả →", "Xem xét →", "Mở quản lý thu →". */
export default function ArrowLink({ children, onClick, sx }) {
  return (
    <Link
      component="button"
      type="button"
      underline="hover"
      onClick={(event) => {
        event.stopPropagation()
        onClick?.(event)
      }}
      sx={{ fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap', ...sx }}
    >
      {children} <ArrowRight size={14} />
    </Link>
  )
}
