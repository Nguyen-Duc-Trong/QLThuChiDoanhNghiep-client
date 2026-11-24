import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
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
  DataTable,
  DescriptionList,
  EmptyState,
  FormFooter,
  FormGrid,
  FormTextField,
  PageHeader,
  ProcessFlow,
  SectionCard,
  StatusBadge,
  TOAST_OPTIONS,
  useToast,
} from '../components'
import {
  fetchExpenseDetail,
  fetchExpenseFormOptions,
  saveExpenseDraft,
  selectExpenseDetail,
  selectExpenseDetailError,
  selectExpenseFormOptions,
  selectExpenseFormOptionsError,
  selectExpenseFormOptionsLoading,
  selectExpenseSaving,
  submitExpense,
} from '../store/slices/expensesSlice'
import { formatDateTime, formatMoney } from '../utils/format'
import { diffSnapshots, latestChangeRequest, snapshotText } from '../utils/approvalSteps'
import validationResolver from '../utils/validationResolver'

// Màn 09 · Tạo yêu cầu chi (/expenses/new). Dữ liệu chọn + ngân sách lấy từ GET /expenses/form-options.
// Cùng màn này: /expenses/:mã/edit tiếp tục sửa bản nháp, /expenses/:mã/resubmit (màn 14) bổ sung hồ sơ
// bị yêu cầu bổ sung rồi gửi lại thành phiên bản mới, quay về trưởng phòng duyệt từ đầu.
const PAYMENT_METHODS = [
  { value: 'CHUYEN_KHOAN', label: 'Chuyển khoản ngân hàng' },
  { value: 'TIEN_MAT', label: 'Tiền mặt' },
]

const INITIAL_FORM = {
  categoryId: '',
  purpose: '',
  amount: null,
  dueDate: '',
  projectId: '',
  periodId: '',
  budgetLineId: '',
  beneficiary: '',
  bank: '',
  accountNumber: '',
  method: 'CHUYEN_KHOAN',
  note: '',
  documents: [],
  vatInvoices: [],
}

// Ngày hôm nay theo giờ máy, dạng YYYY-MM-DD (so sánh chuỗi với input type="date")
const today = () => new Date().toLocaleDateString('sv-SE')

/**
 * editing: đang sửa hồ sơ đã lưu. Tệp đính kèm chưa được lưu lên server (chưa có module chứng từ)
 * nên khi sửa lại không bắt chọn lại tệp.
 */
function validate(form, { editing = false } = {}) {
  const errors = {}
  if (!form.categoryId) errors.categoryId = 'Chọn loại chi.'
  if (!form.purpose?.trim()) errors.purpose = 'Nhập nội dung / mục đích chi.'
  if (!form.amount) errors.amount = 'Số tiền phải là số nguyên lớn hơn 0.'
  if (!form.dueDate) errors.dueDate = 'Chọn ngày cần chi.'
  else if (form.dueDate < today()) errors.dueDate = 'Ngày cần chi không được ở quá khứ.'
  if (!form.periodId) errors.periodId = 'Chọn kỳ ngân sách.'
  if (!form.budgetLineId) errors.budgetLineId = 'Chưa có khoản mục ngân sách cho loại chi và kỳ đã chọn.'
  if (!form.beneficiary?.trim()) errors.beneficiary = 'Nhập người thụ hưởng.'
  if (form.method === 'CHUYEN_KHOAN') {
    if (!form.bank?.trim()) errors.bank = 'Nhập tên ngân hàng.'
    if (!/^\d{6,20}$/.test(form.accountNumber ?? '')) errors.accountNumber = 'Số tài khoản gồm 6–20 chữ số.'
  }
  if (!editing) {
    if (!form.documents?.length) errors.documents = 'Cần ít nhất một chứng từ (hợp đồng, báo giá...).'
    if (!form.vatInvoices?.length && !form.note?.trim()) {
      errors.vatInvoices = 'Thiếu hóa đơn VAT. Bổ sung tệp hoặc ghi lý do chưa có vào Ghi chú để được thẩm định.'
    }
  }
  return errors
}

/** Giá trị form -> body API. Chuỗi rỗng server tự coi là chưa nhập. */
function toBody(form) {
  const isTransfer = form.method === 'CHUYEN_KHOAN'
  return {
    purpose: form.purpose,
    amount: form.amount || null,
    categoryId: form.categoryId || null,
    projectId: form.projectId || null,
    budgetLineId: form.budgetLineId || null,
    dueDate: form.dueDate || null,
    beneficiaryName: form.beneficiary,
    // Chi tiền mặt không cần tài khoản thụ hưởng
    beneficiaryBankName: isTransfer ? form.bank : null,
    beneficiaryAccountNumber: isTransfer ? form.accountNumber : null,
    paymentMethod: form.method,
    note: form.note,
  }
}

/** Hồ sơ đã lưu (GET /expenses/:id) -> giá trị form */
const toFormValues = (expense) => ({
  ...INITIAL_FORM,
  categoryId: expense.categoryId ?? '',
  purpose: expense.purpose ?? '',
  amount: expense.amount ?? null,
  dueDate: expense.dueDate ?? '',
  projectId: expense.projectId ?? '',
  periodId: expense.budgetLine?.periodId ?? '',
  budgetLineId: expense.budgetLineId ?? '',
  beneficiary: expense.beneficiaryName ?? '',
  bank: expense.beneficiaryBankName ?? '',
  accountNumber: expense.beneficiaryAccountNumber ?? '',
  method: expense.paymentMethod ?? 'CHUYEN_KHOAN',
  note: expense.note ?? '',
})

const blankToNull = (value) => (value === '' || value === undefined ? null : value)

/** Lỗi API -> một dòng thông báo (lỗi kiểm tra trả về mảng errors) */
const errorMessage = (error, fallback) =>
  error?.errors?.length ? error.errors.join(' · ') : error?.message || fallback

export default function CreateExpensePage() {
  const showToast = useToast()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const options = useSelector(selectExpenseFormOptions)
  const optionsLoading = useSelector(selectExpenseFormOptionsLoading)
  const optionsError = useSelector(selectExpenseFormOptionsError)
  const saving = useSelector(selectExpenseSaving)
  const { id: routeId } = useParams()
  const editing = Boolean(routeId)
  const loadedExpense = useSelector(selectExpenseDetail)
  const detailError = useSelector(selectExpenseDetailError)
  // Detail trong store có thể là hồ sơ khác vừa xem → chỉ dùng khi đúng mã / id trên URL
  const existing =
    editing && loadedExpense && (loadedExpense.code === routeId.toUpperCase() || loadedExpense.id === routeId) ? loadedExpense : null
  const resubmitting = existing?.status === 'CAN_BO_SUNG'
  const changeRequest = resubmitting ? latestChangeRequest(existing) : null
  const previousVersion = existing?.versions?.at(-1) ?? null

  const methods = useForm({ defaultValues: INITIAL_FORM, resolver: validationResolver(validate), context: { editing } })
  const { setValue, getValues } = methods
  const form = useWatch({ control: methods.control })
  const { isSubmitted } = methods.formState
  const [confirmOpen, setConfirmOpen] = useState(false)
  // Bản nháp đã lưu trên server (có id + mã CHI-...) và thời điểm lưu
  const [saved, setSaved] = useState(null)
  const [savedAt, setSavedAt] = useState(null)
  // Hồ sơ đang sửa: bản vừa lưu ở màn này, hoặc hồ sơ tải từ URL
  const current = saved ?? existing
  const initializedFor = useRef(null)

  useEffect(() => {
    dispatch(fetchExpenseFormOptions())
  }, [dispatch])

  useEffect(() => {
    if (routeId) dispatch(fetchExpenseDetail(routeId))
  }, [dispatch, routeId])

  // Nạp hồ sơ đã lưu vào form một lần
  useEffect(() => {
    if (!existing || initializedFor.current === existing.id) return
    initializedFor.current = existing.id
    methods.reset(toFormValues(existing))
  }, [existing, methods])

  // Có dữ liệu chọn thì điền sẵn loại chi + kỳ đầu tiên (chỉ khi người dùng chưa chọn)
  useEffect(() => {
    if (!getValues('categoryId') && options.categories[0]) setValue('categoryId', options.categories[0].id)
    if (!getValues('periodId') && options.periods[0]) setValue('periodId', options.periods[0].id)
  }, [options, getValues, setValue])

  // Khoản mục = dòng ngân sách của phòng, đúng kỳ + loại chi đang chọn
  const lineOptions = useMemo(
    () => options.budgetLines.filter((line) => line.periodId === form.periodId && line.categoryId === form.categoryId),
    [options.budgetLines, form.periodId, form.categoryId],
  )

  // Đổi kỳ / loại chi làm khoản mục đang chọn không còn hợp lệ -> chọn khoản mục đầu tiên còn hợp lệ
  // (chờ tải xong dữ liệu chọn, tránh xóa khoản mục của hồ sơ đang sửa)
  useEffect(() => {
    if (options.budgetLines.length === 0) return
    if (!lineOptions.some((line) => line.id === form.budgetLineId)) {
      setValue('budgetLineId', lineOptions[0]?.id ?? '', { shouldValidate: isSubmitted })
    }
  }, [lineOptions, options.budgetLines.length, form.budgetLineId, setValue, isSubmitted])

  const selectedLine = lineOptions.find((line) => line.id === form.budgetLineId) ?? null
  const available = selectedLine?.availableAmount ?? 0
  const noDepartment = !optionsLoading && !optionsError && !options.department

  // Tính lỗi trực tiếp từ giá trị đang nhập để cập nhật checklist ngay, không chờ bấm gửi.
  const errors = validate(form, { editing })
  const hasErrors = Object.keys(errors).length > 0
  const withinBudget = !form.amount || !selectedLine || form.amount <= available
  const blocked = isSubmitted && (hasErrors || !withinBudget)
  const busy = saving || optionsLoading || noDepartment

  const showError = (error, fallback) => showToast(errorMessage(error, fallback), 'error', TOAST_OPTIONS.fromError(error))

  const saveDraft = async () => {
    try {
      const result = await dispatch(saveExpenseDraft({ id: current?.id, body: toBody(getValues()) })).unwrap()
      const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      setSaved(result)
      setSavedAt(time)
      showToast(`Đã lưu nháp ${result.code} lúc ${time}`, 'info')
    } catch (error) {
      showError(error, 'Lưu nháp thất bại')
    }
  }

  const showBlocked = () => showToast('Chưa thể gửi: cần xử lý các mục được đánh dấu', 'error')

  const openConfirm = () => {
    if (!withinBudget) {
      showBlocked()
      return
    }
    setConfirmOpen(true)
  }

  const submit = async () => {
    setConfirmOpen(false)
    try {
      const result = await dispatch(submitExpense({ id: current?.id, body: toBody(getValues()) })).unwrap()
      const sentTo =
        result.status === 'CHO_KE_TOAN' ? 'chuyển thẳng kế toán (bạn là trưởng phòng, không có người duyệt thay)' : 'chuyển trưởng phòng'
      showToast(`${resubmitting ? `Đã gửi lại ${result.code} v${result.version}` : `Đã gửi ${result.code}`}, ${sentTo}`, 'success')
      navigate(`/expenses/${result.code}`)
    } catch (error) {
      showError(error, 'Gửi yêu cầu chi thất bại')
    }
  }

  const checklist = [
    { label: withinBudget ? 'Ngân sách còn đủ' : 'Số tiền vượt ngân sách khả dụng', ok: withinBudget && Boolean(selectedLine) },
    { label: 'Tài khoản thụ hưởng đúng định dạng', ok: !errors.accountNumber && !errors.bank },
    { label: errors.documents || errors.vatInvoices ? 'Chứng từ hóa đơn chưa hoàn tất' : 'Chứng từ đầy đủ', ok: !errors.documents && !errors.vatInvoices },
    {
      label: 'Thông tin đề nghị đầy đủ',
      ok: !errors.categoryId && !errors.purpose && !errors.amount && !errors.dueDate && !errors.budgetLineId && !errors.beneficiary,
    },
  ]

  const categoryOptions = options.categories.map((c) => ({ value: c.id, label: c.name }))
  const projectOptions = [
    { value: '', label: 'Không thuộc dự án' },
    ...options.projects.map((p) => ({ value: p.id, label: `${p.name} · ${p.code}` })),
  ]
  const periodOptions = options.periods.map((p) => ({ value: p.id, label: p.name }))
  const budgetLineOptions = lineOptions.map((line) => ({ value: line.id, label: line.label }))

  // Màn 14: so sánh nội dung đang sửa với phiên bản đã gửi gần nhất
  const project = options.projects.find((p) => p.id === form.projectId)
  const isTransfer = form.method === 'CHUYEN_KHOAN'
  const draftSnapshot = {
    purpose: blankToNull(form.purpose?.trim()),
    amount: form.amount || null,
    categoryName: options.categories.find((c) => c.id === form.categoryId)?.name ?? null,
    projectName: project ? `${project.name} · ${project.code}` : null,
    budgetLineLabel: selectedLine ? `${selectedLine.label} · ${selectedLine.periodName}` : null,
    dueDate: blankToNull(form.dueDate),
    beneficiaryName: blankToNull(form.beneficiary?.trim()),
    beneficiaryBankName: isTransfer ? blankToNull(form.bank?.trim()) : null,
    beneficiaryAccountNumber: isTransfer ? blankToNull(form.accountNumber) : null,
    paymentMethod: PAYMENT_METHODS.find((m) => m.value === form.method)?.label ?? form.method,
    note: blankToNull(form.note?.trim()),
  }
  const changes = resubmitting && previousVersion ? diffSnapshots(previousVersion.snapshot, draftSnapshot) : []

  if (editing && !existing) {
    return detailError ? (
      <EmptyState
        variant="no-results"
        title={`Không mở được hồ sơ ${routeId}`}
        description={detailError.message}
        action={<Button variant="outlined" onClick={() => navigate('/expenses')}>Về danh sách yêu cầu</Button>}
      />
    ) : (
      <EmptyState variant="loading" />
    )
  }
  if (editing && !existing.canEdit) {
    return (
      <EmptyState
        variant="no-results"
        title={`${existing.code} không sửa được`}
        description={`Chỉ người tạo sửa được hồ sơ ở trạng thái Nháp hoặc Cần bổ sung (hiện tại: ${existing.statusLabel}).`}
        action={<Button variant="outlined" onClick={() => navigate(`/expenses/${existing.code}`)}>Xem hồ sơ</Button>}
      />
    )
  }

  return (
    <>
      <PageHeader
        eyebrow={resubmitting ? '14 / NHÂN VIÊN' : '09 / NHÂN VIÊN'}
        title={
          resubmitting
            ? `${existing.code} · Bổ sung thông tin và gửi lại`
            : existing
              ? `Chỉnh sửa yêu cầu chi ${existing.code}`
              : 'Tạo yêu cầu chi'
        }
        description={
          resubmitting
            ? `Đang soạn phiên bản v${existing.version + 1} · Gửi lại sẽ quay về trưởng phòng duyệt từ đầu.`
            : 'Mã được cấp khi lưu lần đầu · Mọi thay đổi được lưu theo phiên bản hồ sơ.'
        }
        actions={<Button variant="outlined" onClick={() => navigate(-1)}>Quay lại</Button>}
        tags={existing && <StatusBadge status={existing.status} label={existing.statusLabel} />}
      />

      {changeRequest && (
        <SectionCard title="Yêu cầu bổ sung" sx={{ mb: 3 }}>
          <DescriptionList
            columns={3}
            items={[
              { label: 'Người yêu cầu', value: [changeRequest.actorName, changeRequest.onBehalfOfName && `thay ${changeRequest.onBehalfOfName}`].filter(Boolean).join(' ') },
              { label: 'Bước / thời gian', value: `${changeRequest.stepLabel} · ${formatDateTime(changeRequest.createdAt)}` },
              { label: 'Lý do', value: changeRequest.note },
              ...changeRequest.fields.map((field, i) => ({ label: `Cần sửa ${i + 1}`, value: field })),
            ]}
          />
        </SectionCard>
      )}

      {optionsError && (
        <AppAlert tone="danger" title="Không tải được dữ liệu" sx={{ mb: 3 }}>
          {optionsError.message}{' '}
          <Button size="small" onClick={() => dispatch(fetchExpenseFormOptions())}>Thử lại</Button>
        </AppAlert>
      )}
      {noDepartment && (
        <AppAlert tone="warning" title="Chưa thuộc phòng ban" sx={{ mb: 3 }}>
          Tài khoản của bạn chưa được gán phòng ban nên chưa tạo được yêu cầu chi. Liên hệ quản trị viên.
        </AppAlert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 372px' }, gap: 3, alignItems: 'start' }}>
        <CustomForm methods={methods} onSubmit={openConfirm} onInvalid={showBlocked}>
          <Stack spacing={3}>
            <SectionCard title="Thông tin đề nghị" subtitle="Dấu * là trường bắt buộc · Tiền tệ VND">
              <FormGrid>
                <FormTextField label="Mã yêu cầu" value={current?.code ?? 'Tự sinh khi lưu lần đầu'} disabled />
                <CustomSelect name="categoryId" label="Loại chi" required options={categoryOptions} placeholder="Chọn loại chi" />
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
                  error={!withinBudget ? `Vượt khả dụng ${formatMoney(available)}.` : undefined}
                />
                <CustomInput name="dueDate" label="Ngày cần chi" required type="date" />
                <FormTextField
                  label="Phòng ban"
                  value={options.department ? `${options.department.name} · Theo hồ sơ nhân viên` : 'Chưa có phòng ban'}
                  disabled
                />
                <CustomSelect name="projectId" label="Dự án" options={projectOptions} placeholder="Không thuộc dự án" />
                <CustomSelect name="periodId" label="Kỳ ngân sách" required options={periodOptions} placeholder="Chọn kỳ ngân sách" />
                <CustomSelect
                  name="budgetLineId"
                  label="Khoản mục"
                  required
                  options={budgetLineOptions}
                  placeholder={budgetLineOptions.length ? 'Chọn khoản mục' : 'Không có khoản mục phù hợp'}
                />
              </FormGrid>
            </SectionCard>

            <SectionCard title="Người thụ hưởng & phương thức">
              <FormGrid>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <CustomInput name="beneficiary" label="Người thụ hưởng" required placeholder="Công ty TNHH Sao Việt" />
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <CustomSelect name="method" label="Phương thức chi" required options={PAYMENT_METHODS} />
                </Box>
                {form.method === 'CHUYEN_KHOAN' && (
                  <>
                    <CustomInput name="bank" label="Ngân hàng" required placeholder="Vietcombank - CN Hà Nội" />
                    <CustomInput
                      name="accountNumber"
                      label="Số tài khoản"
                      required
                      parse={(text) => text.replace(/\D/g, '')}
                      slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 20 } }}
                      placeholder="0071008855123"
                      helperText={form.beneficiary ? `Tên tài khoản: ${form.beneficiary.toUpperCase()}` : undefined}
                    />
                  </>
                )}
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

            {resubmitting && previousVersion && (
              <SectionCard
                title={`So sánh với phiên bản v${previousVersion.version}`}
                subtitle="Các trường thay đổi so với bản đã gửi gần nhất"
                action={<StatusBadge label={`${changes.length} trường thay đổi`} tone={changes.length ? 'primary' : 'neutral'} size="small" />}
              >
                {changes.length > 0 ? (
                  <DataTable
                    columns={[
                      { key: 'label', header: 'Trường dữ liệu', width: 170 },
                      { key: 'before', header: `v${previousVersion.version}`, render: (r) => snapshotText(r, r.before) },
                      { key: 'after', header: `v${existing.version + 1} (đang sửa)`, render: (r) => snapshotText(r, r.after) },
                    ]}
                    rows={changes.map((c) => ({ ...c, id: c.key }))}
                    minWidth={520}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">Chưa có thay đổi nào so với bản đã gửi.</Typography>
                )}
              </SectionCard>
            )}

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
            <Button variant="outlined" onClick={saveDraft} disabled={busy}>Lưu nháp</Button>
            <Button variant="contained" type="submit" disabled={blocked || busy}>
              {resubmitting ? 'Gửi lại yêu cầu' : 'Gửi phê duyệt'}
            </Button>
          </FormFooter>
        </CustomForm>

        <Stack spacing={3}>
          {selectedLine ? (
            <BudgetCard
              scope={`${selectedLine.label} · ${selectedLine.periodName}`}
              total={selectedLine.plannedAmount}
              spent={selectedLine.spentAmount}
              committed={selectedLine.committedAmount}
              alert={
                form.amount
                  ? withinBudget
                    ? {
                        tone: 'success',
                        title: 'Trong hạn mức',
                        message: `Yêu cầu ${formatMoney(form.amount)}. Còn ${formatMoney(available - form.amount)} nếu được duyệt.`,
                      }
                    : { tone: 'danger', title: 'Vượt ngân sách', message: `Khả dụng chỉ còn ${formatMoney(available)}.` }
                  : undefined
              }
            />
          ) : (
            <SectionCard title="Ngân sách liên quan">
              <Typography variant="body2" color="text.secondary">
                {optionsLoading ? 'Đang tải ngân sách...' : 'Chọn loại chi, kỳ và khoản mục để xem ngân sách khả dụng.'}
              </Typography>
            </SectionCard>
          )}
          <SectionCard title="Luồng xử lý bắt buộc">
            <ProcessFlow steps={['Bạn', 'Trưởng phòng', 'Kế toán', 'Lãnh đạo', 'Kế toán thực hiện chi']} />
            <AppAlert tone="info" title="Không tự duyệt" sx={{ mt: 2.5 }}>
              Nếu người tạo đồng thời là người duyệt, hồ sơ chuyển cho người thay thế đã được ủy quyền.
            </AppAlert>
          </SectionCard>
          <ChecklistCard items={checklist} />
          {savedAt && (
            <AppAlert tone="info" title="Đã lưu">
              Đã lưu {current?.code} lúc {savedAt}.
            </AppAlert>
          )}
          {editing && (
            <AppAlert tone="info" title="Chứng từ đính kèm">
              Hệ thống chưa lưu tệp đính kèm lên server, nên khi sửa lại hồ sơ không bắt buộc chọn lại tệp.
            </AppAlert>
          )}
        </Stack>
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title={resubmitting ? 'Gửi lại yêu cầu chi' : 'Gửi yêu cầu chi'}
        description={
          resubmitting
            ? `Phiên bản v${existing.version + 1} sẽ khóa chỉnh sửa và quay về trưởng phòng duyệt lại từ đầu.`
            : 'Sau khi gửi, hồ sơ bị khóa chỉnh sửa cho đến khi có yêu cầu bổ sung.'
        }
        confirmLabel={resubmitting ? 'Gửi lại' : 'Gửi yêu cầu'}
        loading={saving}
        onClose={() => setConfirmOpen(false)}
        onConfirm={submit}
      >
        <Typography variant="body2">
          {resubmitting && <>{changes.length} trường thay đổi so với v{previousVersion?.version}<br /></>}
          <strong>{form.purpose}</strong>
          <br />
          {formatMoney(form.amount)} · {form.beneficiary}
        </Typography>
      </ConfirmDialog>
    </>
  )
}
