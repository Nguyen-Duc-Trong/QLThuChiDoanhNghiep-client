import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm, useWatch } from 'react-hook-form'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Send } from 'lucide-react'
import {
  AppAlert,
  AttachmentItem,
  ConfirmDialog,
  CustomFileUpload,
  CustomForm,
  CustomInput,
  CustomMoneyInput,
  CustomSelect,
  FormFooter,
  FormGrid,
  PageHeader,
  SectionCard,
  StatusBadge,
  useToast,
} from '../components'
import { DEPARTMENTS } from '../mocks/data'
import { INCOME_PAYERS, INCOME_SOURCES, RECEIVING_ACCOUNTS } from '../mocks/income'
import { formatMoney } from '../utils/format'
import validationResolver from '../utils/validationResolver'

// Màn 06 · Đề nghị ghi nhận khoản thu (nhân viên).
const DRAFT_ID = 'THU-1009'

const EXISTING_ATTACHMENTS = [
  { name: 'Hợp đồng AV-MKT-10.pdf', meta: '1,2 MB · Nguyễn Mai Anh · 20/10/2026' },
  { name: 'Báo giá chiến dịch quý IV.pdf', meta: '486 KB · Nguyễn Mai Anh · 20/10/2026' },
]

const INITIAL_FORM = {
  payer: INCOME_PAYERS[0],
  source: INCOME_SOURCES[0],
  title: 'Hoàn tạm ứng sự kiện ra mắt sản phẩm',
  department: 'Marketing',
  amount: 6_000_000,
  expectedDate: '2026-10-23',
  dueDate: '2026-10-24',
  account: RECEIVING_ACCOUNTS[0],
  note: 'Đối chiếu tạm ứng TU-0086; kinh phí sử dụng thực tế 24.000.000 VND.',
  files: [],
}

const AFTER_SUBMIT = ['Kế toán kiểm tra hồ sơ.', 'Có thể yêu cầu bổ sung hoặc đưa vào chờ thu.', 'Xác nhận tiền thực nhận theo từng đợt.']

function validate(form) {
  const errors = {}
  if (!form.title.trim()) errors.title = 'Nhập nội dung khoản thu.'
  if (!form.amount) errors.amount = 'Số tiền phải lớn hơn 0.'
  if (!form.expectedDate) errors.expectedDate = 'Chọn ngày dự kiến nhận.'
  if (!form.dueDate) errors.dueDate = 'Chọn ngày đến hạn.'
  else if (form.expectedDate && form.dueDate < form.expectedDate) errors.dueDate = 'Ngày đến hạn không trước ngày dự kiến.'
  return errors
}

function SummaryItem({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" component="p">{label}</Typography>
      <Typography sx={{ fontWeight: 600, mt: 0.5 }}>{value}</Typography>
    </Box>
  )
}

export default function CreateIncomePage() {
  const showToast = useToast()
  const navigate = useNavigate()
  const methods = useForm({ defaultValues: INITIAL_FORM, resolver: validationResolver(validate) })
  const form = useWatch({ control: methods.control })
  const { isDirty, isSubmitted, errors } = methods.formState
  const [confirmOpen, setConfirmOpen] = useState(false)

  const saveDraft = () => {
    methods.reset(methods.getValues())
    showToast(`Đã lưu nháp ${DRAFT_ID}`, 'info')
  }

  const showBlocked = () => showToast('Chưa thể gửi: cần xử lý các mục được đánh dấu', 'error')

  const submit = () => {
    setConfirmOpen(false)
    showToast(`Đề nghị ${DRAFT_ID} đã được gửi cho kế toán`, 'success')
    navigate('/income')
  }

  return (
    <>
      <PageHeader
        eyebrow="06 / NHÂN VIÊN"
        title="Đề nghị ghi nhận khoản thu"
        description={`${DRAFT_ID} · Bản nháp của bạn · Cập nhật lần cuối 22/10/2026, 09:18`}
        actions={<Button variant="outlined" onClick={() => navigate('/income')}>Quay lại danh sách</Button>}
      />

      <AppAlert tone="info" title="Đây là đề nghị ghi nhận thu, chưa phải tiền đã nhận" sx={{ mb: 3 }}>
        Kế toán sẽ kiểm tra thông tin và đối chiếu giao dịch thực tế. Không cần trưởng phòng hoặc lãnh đạo phê duyệt theo luồng chi.
      </AppAlert>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 350px' }, gap: 3, alignItems: 'start' }}>
        <CustomForm methods={methods} onSubmit={() => setConfirmOpen(true)} onInvalid={showBlocked}>
          <Stack spacing={3}>
            <SectionCard title="Thông tin khoản thu" subtitle="Các trường có dấu * là bắt buộc">
              <FormGrid>
                <CustomSelect name="payer" label="Đối tượng nộp" required options={INCOME_PAYERS} />
                <CustomSelect name="source" label="Nguồn thu" required options={INCOME_SOURCES} />
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <CustomInput name="title" label="Nội dung khoản thu" required />
                </Box>
                <CustomSelect name="department" label="Phòng ban" required options={DEPARTMENTS} />
                <CustomMoneyInput
                  name="amount"
                  label="Số tiền dự kiến (VND)"
                  required
                  helperText="Số tiền phải lớn hơn 0; không bao gồm ký tự chữ."
                />
                <CustomInput
                  name="expectedDate"
                  label="Ngày dự kiến nhận"
                  required
                  type="date"
                />
                <CustomInput
                  name="dueDate"
                  label="Ngày đến hạn"
                  required
                  type="date"
                  helperText="Ngày đến hạn không trước ngày dự kiến."
                />
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <CustomSelect name="account" label="Tài khoản / quỹ nhận" required options={RECEIVING_ACCOUNTS} />
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <CustomInput name="note" label="Ghi chú" multiline minRows={3} />
                </Box>
              </FormGrid>
            </SectionCard>

            <SectionCard title="Chứng từ" subtitle="PDF, JPG, PNG · Tối đa 20 MB / tệp">
              <Stack spacing={1.5}>
                <CustomFileUpload
                  name="files"
                  placeholder="+ Tải bảng quyết toán và chứng từ liên quan"
                  buttonLabel="Tải thêm chứng từ"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {EXISTING_ATTACHMENTS.map((file) => (
                  <AttachmentItem key={file.name} name={file.name} meta={file.meta} onDownload={() => showToast(`Đang tải ${file.name}`, 'info')} />
                ))}
              </Stack>
            </SectionCard>
          </Stack>

          <FormFooter note={isDirty ? 'Có thay đổi chưa lưu · Dữ liệu chỉ được gửi khi hợp lệ.' : 'Dữ liệu chỉ được gửi khi hợp lệ.'}>
            <Button variant="outlined" onClick={saveDraft}>Lưu nháp</Button>
            <Button variant="contained" type="submit" startIcon={<Send size={16} />} disabled={isSubmitted && Object.keys(errors).length > 0}>
              Gửi ghi nhận
            </Button>
          </FormFooter>
        </CustomForm>

        <Stack spacing={3}>
          <SectionCard title="Tóm tắt">
            <Stack spacing={2}>
              <StatusBadge status="NHAP" sx={{ alignSelf: 'flex-start' }} />
              <SummaryItem label="Mã tự sinh" value={DRAFT_ID} />
              <SummaryItem label="Người tạo" value="Nguyễn Mai Anh" />
              <SummaryItem label="Dự kiến thu" value={formatMoney(form.amount)} />
              <SummaryItem label="Nơi nhận" value={form.account.split(' · ')[0]} />
            </Stack>
          </SectionCard>

          <SectionCard title="Sau khi gửi">
            <Stack spacing={1.75}>
              {AFTER_SUBMIT.map((step, i) => (
                <Typography key={step} variant="body2">{i + 1}. {step}</Typography>
              ))}
            </Stack>
            <AppAlert tone="info" title="Bảo toàn dữ liệu" sx={{ mt: 2.5 }}>
              Rời trang khi chưa lưu sẽ cần xác nhận. Gửi trùng được ngăn bằng mã hồ sơ.
            </AppAlert>
          </SectionCard>
        </Stack>
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title="Gửi đề nghị ghi nhận thu"
        description="Kế toán sẽ kiểm tra và đối chiếu giao dịch trước khi ghi nhận thực thu."
        confirmLabel="Gửi ghi nhận"
        onClose={() => setConfirmOpen(false)}
        onConfirm={submit}
      >
        <Typography variant="body2">
          <strong>{form.title}</strong>
          <br />
          {formatMoney(form.amount)} · {form.account}
        </Typography>
      </ConfirmDialog>
    </>
  )
}
