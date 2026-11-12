import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Check } from 'lucide-react'
import SectionCard from '../common/SectionCard'
import AppAlert from '../common/AppAlert'
import FormFooter from '../form/FormFooter'

/**
 * Khối quyết định của người duyệt: chú thích + Từ chối / Yêu cầu bổ sung / Phê duyệt.
 * Chỉ render khối này khi người dùng đúng cấp duyệt (quy tắc ẩn/khóa CTA).
 * - description: đoạn mô tả hoặc nội dung tùy ý (ví dụ ô kết luận thẩm định) phía trên các nút.
 * - approveDisabled: chỉ khóa nút phê duyệt (ví dụ checklist chưa đạt); disabled khóa cả ba nút.
 */
export default function ApprovalDecision({
  title = 'Quyết định phê duyệt',
  description,
  notice,
  note = 'Mọi quyết định được lưu vào lịch sử bất biến.',
  approveLabel = 'Phê duyệt',
  onReject,
  onRequestChanges,
  onApprove,
  disabled = false,
  approveDisabled = false,
  sx,
}) {
  return (
    <SectionCard title={title} sx={sx}>
      {description &&
        (typeof description === 'string' ? (
          <Typography variant="body2" color="text.secondary">{description}</Typography>
        ) : (
          <Box>{description}</Box>
        ))}
      {notice && (
        <AppAlert tone="info" title={notice.title} sx={{ mt: description ? 2 : 0 }}>
          {notice.message}
        </AppAlert>
      )}
      <FormFooter note={note}>
        {onReject && (
          <Button variant="soft" color="error" onClick={onReject} disabled={disabled}>
            Từ chối
          </Button>
        )}
        {onRequestChanges && (
          <Button variant="outlined" onClick={onRequestChanges} disabled={disabled}>
            Yêu cầu bổ sung
          </Button>
        )}
        <Button variant="contained" startIcon={<Check size={16} />} onClick={onApprove} disabled={disabled || approveDisabled}>
          {approveLabel}
        </Button>
      </FormFooter>
    </SectionCard>
  )
}
