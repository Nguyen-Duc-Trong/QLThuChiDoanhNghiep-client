import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm, useWatch } from 'react-hook-form'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  AppAlert,
  BudgetCard,
  ChecklistCard,
  ConfirmDialog,
  CustomFileUpload,
  CustomForm,
  CustomInput,
  CustomMoneyInput,
  CustomSelect,
  FormFooter,
  FormGrid,
  FormTextField,
  PageHeader,
  ProcessFlow,
  SectionCard,
  useToast,
} from '../components'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../store/slices/sessionSlice'
import {
  BANKS,
  BUDGET_LINES,
  BUDGET_PERIODS,
  EXPENSE_CATEGORIES,
  MARKETING_BUDGET,
  PAYMENT_METHODS,
  PROJECTS,
} from '../mocks/data'
import { formatMoney } from '../utils/format'
import validationResolver from '../utils/validationResolver'

// Màn 09 · Tạo yêu cầu chi.
const INITIAL_FORM = {
  category: 'Truyền thông',
  purpose: '',
  amount: null,
  dueDate: '',
  project: PROJECTS[0],
  period: BUDGET_PERIODS[0],
  budgetLine: BUDGET_LINES[0],
  beneficiary: '',
  bank: '',
  accountNumber: '',
  method: PAYMENT_METHODS[0],
  note: '',
  documents: [],
  vatInvoices: [],
}

const AVAILABLE = MARKETING_BUDGET.total - MARKETING_BUDGET.spent - MARKETING_BUDGET.committed

function validate(form) {
  const errors = {}
  if (!form.purpose.trim()) errors.purpose = 'Nhập nội dung / mục đích chi.'
  if (!form.amount) errors.amount = 'Số tiền phải là số nguyên lớn hơn 0.'
  if (!form.dueDate) errors.dueDate = 'Chọn ngày cần chi.'
  if (!form.beneficiary.trim()) errors.beneficiary = 'Nhập người thụ hưởng.'
  if (!form.bank) errors.bank = 'Chọn ngân hàng.'
  if (!/^\d{6,20}$/.test(form.accountNumber)) errors.accountNumber = 'Số tài khoản gồm 6–20 chữ số.'
  if (form.documents.length === 0) errors.documents = 'Cần ít nhất một chứng từ (hợp đồng, báo giá...).'
  if (form.vatInvoices.length === 0 && !form.note.trim()) {
    errors.vatInvoices = 'Thiếu hóa đơn VAT. Bổ sung tệp hoặc ghi lý do chưa có vào Ghi chú để được thẩm định.'
  }
  return errors
}

export default function CreateExpensePage() {
  const showToast = useToast()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const methods = useForm({ defaultValues: INITIAL_FORM, resolver: validationResolver(validate) })
  const form = useWatch({ control: methods.control })
  const { isSubmitted } = methods.formState
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [savedAt, setSavedAt] = useState(null)

  // Tính lỗi trực tiếp từ giá trị đang nhập để cập nhật checklist ngay, không chờ bấm gửi.
  const errors = validate(form)
  const hasErrors = Object.keys(errors).length > 0
  const withinBudget = !form.amount || form.amount <= AVAILABLE
  const blocked = isSubmitted && (hasErrors || !withinBudget)

  const saveDraft = () => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    setSavedAt(time)
    showToast(`Đã lưu nháp lúc ${time}`, 'info')
  }

  const showBlocked = () => showToast('Chưa thể gửi: cần xử lý các mục được đánh dấu', 'error')

  const openConfirm = () => {
    if (!withinBudget) {
      showBlocked()
      return
    }
    setConfirmOpen(true)
  }

  const submit = () => {
    setConfirmOpen(false)
    showToast('Yêu cầu CHI-1029 đã được gửi cho trưởng phòng', 'success')
    navigate('/expenses')
  }

  const checklist = [
    { label: withinBudget ? 'Ngân sách còn đủ' : 'Số tiền vượt ngân sách khả dụng', ok: withinBudget },
    { label: 'Tài khoản thụ hưởng đúng định dạng', ok: !errors.accountNumber && !errors.bank },
    { label: errors.documents || errors.vatInvoices ? 'Chứng từ hóa đơn chưa hoàn tất' : 'Chứng từ đầy đủ', ok: !errors.documents && !errors.vatInvoices },
    { label: 'Thông tin đề nghị đầy đủ', ok: !errors.purpose && !errors.amount && !errors.dueDate && !errors.beneficiary },
  ]

  return (
    <>
      <PageHeader
        eyebrow="09 / NHÂN VIÊN"
        title="Tạo yêu cầu chi"
        description="Mã được cấp khi lưu lần đầu · Mọi thay đổi được lưu theo phiên bản hồ sơ."
        actions={<Button variant="outlined" onClick={() => navigate(-1)}>Quay lại</Button>}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 372px' }, gap: 3, alignItems: 'start' }}>
        <CustomForm methods={methods} onSubmit={openConfirm} onInvalid={showBlocked}>
          <Stack spacing={3}>
            <SectionCard title="Thông tin đề nghị" subtitle="Dấu * là trường bắt buộc · Tiền tệ VND">
              <FormGrid>
                <FormTextField label="Mã yêu cầu" value="Tự sinh · CHI-1029 khi lưu" disabled />
                <CustomSelect name="category" label="Loại chi" required options={EXPENSE_CATEGORIES} />
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <CustomInput
                    name="purpose"
                    label="Nội dung / Mục đích chi"
                    required
                    placeholder="Triển khai chiến dịch thương hiệu quý IV – đợt 2"
                  />
                </Box>
                <CustomMoneyInput
                  name="amount"
                  label="Số tiền đề nghị (VND)"
                  required
                  placeholder="48.000.000"
                  helperText="Số nguyên lớn hơn 0."
                  error={!withinBudget ? `Vượt khả dụng ${formatMoney(AVAILABLE)}.` : undefined}
                />
                <CustomInput name="dueDate" label="Ngày cần chi" required type="date" />
                <FormTextField label="Phòng ban" value={`${user.department} · Theo hồ sơ nhân viên`} disabled />
                <CustomSelect name="project" label="Dự án" required options={PROJECTS} />
                <CustomSelect name="period" label="Kỳ ngân sách" required options={BUDGET_PERIODS} />
                <CustomSelect name="budgetLine" label="Khoản mục" required options={BUDGET_LINES} />
              </FormGrid>
            </SectionCard>

            <SectionCard title="Người thụ hưởng & phương thức">
              <FormGrid>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <CustomInput name="beneficiary" label="Người thụ hưởng" required placeholder="Công ty TNHH Sao Việt" />
                </Box>
                <CustomSelect name="bank" label="Ngân hàng" required options={BANKS} placeholder="Chọn ngân hàng" />
                <CustomInput
                  name="accountNumber"
                  label="Số tài khoản"
                  required
                  parse={(text) => text.replace(/\D/g, '')}
                  slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 20 } }}
                  placeholder="0071008855123"
                  helperText={form.beneficiary ? `Tên tài khoản: ${form.beneficiary.toUpperCase()}` : undefined}
                />
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <CustomSelect name="method" label="Phương thức chi" required options={PAYMENT_METHODS} />
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <CustomInput
                    name="note"
                    label="Ghi chú"
                    multiline
                    minRows={3}
                    placeholder="Thanh toán theo hợp đồng AV-MKT-10, nghiệm thu theo từng đợt."
                  />
                </Box>
              </FormGrid>
            </SectionCard>

            <SectionCard title="Hóa đơn & tệp đính kèm">
              <Stack spacing={2.5}>
                <CustomFileUpload
                  name="documents"
                  label="Chứng từ bắt buộc"
                  required
                  placeholder="Chọn hợp đồng, báo giá..."
                  accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
                />
                <CustomFileUpload
                  name="vatInvoices"
                  label="Hóa đơn VAT"
                  placeholder="Chọn tệp hóa đơn"
                  buttonLabel="Tải hóa đơn"
                  accept=".pdf,.xml,.jpg,.png"
                />
              </Stack>
            </SectionCard>
          </Stack>

          <FormFooter note={blocked ? 'Chưa thể gửi: cần xử lý mục được đánh dấu.' : 'Hồ sơ sẽ chuyển cho trưởng phòng sau khi gửi.'}>
            <Button variant="outlined" onClick={saveDraft}>Lưu nháp</Button>
            <Button variant="contained" type="submit" disabled={blocked}>
              Gửi phê duyệt
            </Button>
          </FormFooter>
        </CustomForm>

        <Stack spacing={3}>
          <BudgetCard
            {...MARKETING_BUDGET}
            alert={
              form.amount
                ? withinBudget
                  ? {
                      tone: 'success',
                      title: 'Trong hạn mức',
                      message: `Yêu cầu ${formatMoney(form.amount)}. Còn ${formatMoney(AVAILABLE - form.amount)} nếu được duyệt.`,
                    }
                  : { tone: 'danger', title: 'Vượt ngân sách', message: `Khả dụng chỉ còn ${formatMoney(AVAILABLE)}.` }
                : undefined
            }
          />
          <SectionCard title="Luồng xử lý bắt buộc">
            <ProcessFlow steps={['Bạn', 'Trưởng phòng', 'Kế toán', 'Lãnh đạo', 'Kế toán thực hiện chi']} />
            <AppAlert tone="info" title="Không tự duyệt" sx={{ mt: 2.5 }}>
              Nếu người tạo đồng thời là người duyệt, hồ sơ chuyển cho người thay thế đã được ủy quyền.
            </AppAlert>
          </SectionCard>
          <ChecklistCard items={checklist} />
          {savedAt && (
            <AppAlert tone="info" title="Không mất dữ liệu">
              Đã lưu nháp lúc {savedAt}. Thay đổi mới chưa lưu sẽ được cảnh báo khi rời trang.
            </AppAlert>
          )}
        </Stack>
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title="Gửi yêu cầu chi"
        description="Sau khi gửi, hồ sơ bị khóa chỉnh sửa cho đến khi có yêu cầu bổ sung."
        confirmLabel="Gửi yêu cầu"
        onClose={() => setConfirmOpen(false)}
        onConfirm={submit}
      >
        <Typography variant="body2">
          <strong>{form.purpose}</strong>
          <br />
          {formatMoney(form.amount)} · {form.beneficiary}
        </Typography>
      </ConfirmDialog>
    </>
  )
}
