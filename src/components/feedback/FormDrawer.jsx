import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { X } from 'lucide-react'
import { colors, layout } from '../../theme/tokens'

/**
 * Panel trượt từ phải để thêm / sửa nhanh (ví dụ "Thêm / sửa người dùng").
 * actions: nút ở chân panel (Hủy, Lưu thay đổi).
 * note: dòng chú thích nhỏ phía trên các nút (ví dụ "* Thông tin bắt buộc").
 */
export default function FormDrawer({ open, onClose, title, subtitle, children, actions, note, width = layout.drawerWidth }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: width }, display: 'flex', flexDirection: 'column' } } }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', px: 2.25, pt: 2.5, pb: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h3" component="h2" sx={{ fontSize: 17 }}>{title}</Typography>
          {subtitle && <Typography variant="caption" component="p" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
        </Box>
        <IconButton aria-label="Đóng" onClick={onClose} size="small" sx={{ bgcolor: colors.surfaceMuted }}>
          <X size={16} />
        </IconButton>
      </Stack>

      <Stack spacing={2} sx={{ flex: 1, overflowY: 'auto', px: 2.25, pb: 2 }}>
        {children}
      </Stack>

      {actions && (
        <Box sx={{ px: 2.25, py: 2, borderTop: `1px solid ${colors.border}` }}>
          {note && <Typography variant="caption" component="p" sx={{ mb: 1.5 }}>{note}</Typography>}
          <Stack direction="row" spacing={1} sx={{ '& > *': { flex: 1 } }}>
            {actions}
          </Stack>
        </Box>
      )}
    </Drawer>
  )
}
