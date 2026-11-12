import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import Typography from '@mui/material/Typography'
import ConfirmDialog from '../feedback/ConfirmDialog'
import CustomInput from '../form/rhf/CustomInput'

const CONFIG = {
  approve: {
    title: 'Phê duyệt yêu cầu',
    confirmLabel: 'Phê duyệt',
    tone: 'primary',
    reasonLabel: 'Ghi chú (không bắt buộc)',
    reasonRequired: false,
  },
  changes: {
    title: 'Yêu cầu bổ sung',
    confirmLabel: 'Gửi yêu cầu bổ sung',
    tone: 'primary',
    reasonLabel: 'Lý do bổ sung',
    reasonRequired: true,
  },
  reject: {
    title: 'Từ chối yêu cầu',
    confirmLabel: 'Từ chối',
    tone: 'danger',
    reasonLabel: 'Lý do từ chối',
    reasonRequired: true,
  },
}

const EMPTY = { reason: '', fields: '' }

/**
 * Dialog ghi nhận quyết định duyệt: Phê duyệt / Yêu cầu bổ sung / Từ chối.
 * - type: 'approve' | 'changes' | 'reject' (null = đóng)
 * - Bổ sung và Từ chối bắt buộc lý do; Bổ sung có thêm "Trường cần sửa" (mỗi dòng một trường).
 * onConfirm({ type, reason, fields: string[] })
 */
export default function DecisionDialog({ type, subject, approveLabel, description, onClose, onConfirm }) {
  const methods = useForm({ defaultValues: EMPTY })
  const config = CONFIG[type] ?? CONFIG.approve

  // Mỗi lần mở dialog thì xóa nội dung nhập của lần trước.
  useEffect(() => {
    if (type) methods.reset(EMPTY)
  }, [type, methods])

  const submit = methods.handleSubmit(({ reason, fields }) => {
    onConfirm({
      type,
      reason: reason.trim(),
      fields: fields.split('\n').map((f) => f.trim()).filter(Boolean),
    })
  })

  return (
    <ConfirmDialog
      open={Boolean(type)}
      title={type === 'approve' && approveLabel ? approveLabel : config.title}
      description={description ?? 'Quyết định được lưu vào lịch sử bất biến cùng phiên bản hồ sơ đang xem.'}
      confirmLabel={type === 'approve' && approveLabel ? approveLabel : config.confirmLabel}
      tone={config.tone}
      onClose={onClose}
      onConfirm={submit}
    >
      {subject && <Typography variant="body2" sx={{ fontWeight: 600 }}>{subject}</Typography>}
      <FormProvider {...methods}>
        <CustomInput
          name="reason"
          label={config.reasonLabel}
          required={config.reasonRequired}
          multiline
          minRows={2}
          rules={config.reasonRequired ? { validate: (v) => Boolean(v.trim()) || 'Nhập lý do để người tạo biết cần xử lý gì.' } : undefined}
        />
        {type === 'changes' && (
          <CustomInput
            name="fields"
            label="Trường cần sửa"
            multiline
            minRows={2}
            placeholder={'Đính kèm biên bản nghiệm thu\nCập nhật ngày nghiệm thu'}
            helperText="Mỗi dòng một trường."
          />
        )}
      </FormProvider>
    </ConfirmDialog>
  )
}
