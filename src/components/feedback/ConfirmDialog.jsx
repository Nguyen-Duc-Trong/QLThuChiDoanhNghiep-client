import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { tones } from '../../theme/tokens'

/**
 * Dialog xác nhận dùng cho 6 mẫu: Gửi yêu cầu, Duyệt, Từ chối, Yêu cầu bổ sung,
 * Xác nhận thực chi, Cảnh báo vượt ngân sách.
 * children: các trường nhập (lý do, số tiền...) hiển thị trong thân dialog.
 * tone="danger": nút xác nhận màu đỏ (Từ chối, Khóa tài khoản).
 * icon: component icon lucide (ví dụ Trash2) hiển thị trong ô màu theo tone phía trên tiêu đề.
 */
export default function ConfirmDialog({
  open,
  title,
  icon: Icon,
  description,
  children,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  tone = 'primary',
  loading = false,
  confirmDisabled = false,
  onConfirm,
  onClose,
}) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      {Icon && (
        <Box sx={{ px: 3, pt: 3 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tones[tone].fg,
              bgcolor: tones[tone].bg,
            }}
          >
            <Icon size={22} />
          </Box>
        </Box>
      )}
      <DialogTitle sx={{ fontSize: 17, fontWeight: 600, pb: description ? 0.5 : 2 }}>{title}</DialogTitle>
      <DialogContent>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: children ? 2 : 0 }}>
            {description}
          </Typography>
        )}
        {children && <Stack spacing={2}>{children}</Stack>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={loading} fullWidth>
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          color={tone === 'danger' ? 'error' : 'primary'}
          onClick={onConfirm}
          loading={loading}
          disabled={confirmDisabled}
          fullWidth
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
