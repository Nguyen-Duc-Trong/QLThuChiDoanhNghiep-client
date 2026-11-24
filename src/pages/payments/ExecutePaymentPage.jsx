import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CircleCheck, FileText } from 'lucide-react'
import {
  AppAlert,
  ApprovalTimeline,
  BudgetCard,
  ConfirmDialog,
  CustomFileUpload,
  CustomForm,
  CustomTab,
  DataTable,
  DescriptionList,
  EmptyState,
  PageHeader,
  SectionCard,
  StatusBadge,
  SummaryBar,
  TOAST_OPTIONS,
  useToast,
} from '../../components'
import { PERMS } from '../../constants/permissions'
import usePermission from '../../hooks/usePermission'
import { fetchExpenseDetail, selectExpenseDetail, selectExpenseDetailError } from '../../store/slices/expensesSlice'
import { executePayment, fetchPaymentStats, selectPaymentExecuting } from '../../store/slices/paymentsSlice'
import { buildExpenseHistory, buildExpenseTimeline } from '../../utils/approvalSteps'
import { formatDate, formatDateTime, formatMoney } from '../../utils/format'
import { PROOF_ACCEPT, openPaymentProof, proofFileError } from '../../utils/paymentProof'
import validationResolver from '../../utils/validationResolver'

// Màn 15 · Kế toán thực hiện chi: chỉ hồ sơ đủ 3 cấp duyệt mới được chi.
// Kế toán tải lên file ủy nhiệm chi rồi bấm "Hoàn thành chi": chi một lần, đủ số tiền đã duyệt, hồ sơ chuyển Hoàn thành.
// Tiền về người thụ hưởng là việc của ngân hàng.

const HISTORY_COLUMNS = [
  { key: 'time', header: 'Thời gian', width: 160 },
  { key: 'actor', header: 'Người thực hiện', width: 170 },
  { key: 'action', header: 'Hành động / Lý do' },
]

const VERSION_COLUMNS = [
  { key: 'version', header: 'Phiên bản', width: 110, render: (v) => `v${v.version}` },
  { key: 'submittedAt', header: 'Gửi lúc', width: 170, render: (v) => formatDateTime(v.submittedAt) },
  { key: 'submittedByName', header: 'Người gửi' },
  { key: 'amount', header: 'Số tiền', align: 'right', render: (v) => formatMoney(v.snapshot?.amount) },
]

function validate(values) {
  const message = proofFileError(values.proof?.[0]?.file)
  return message ? { proof: message } : {}
}

export default function ExecutePaymentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const loaded = useSelector(selectExpenseDetail)
  const detailError = useSelector(selectExpenseDetailError)

  useEffect(() => {
    dispatch(fetchExpenseDetail(id))
  }, [dispatch, id])

  const request = loaded && (loaded.code === id.toUpperCase() || loaded.id === id) ? loaded : null

  if (!request) {
    if (detailError) {
      return (
        <EmptyState
          variant="no-results"
          title={`Không mở được hồ sơ ${id}`}
          description={detailError.message}
          action={<Button variant="outlined" onClick={() => navigate('/payments')}>Về danh sách thanh toán</Button>}
        />
      )
    }
    return <EmptyState variant="loading" />
  }

  if (request.status !== 'DA_DUYET' && request.status !== 'DA_THANH_TOAN') {
    return (
      <EmptyState
        variant="no-results"
        title={`${request.code} chưa đủ điều kiện thực hiện chi`}
        description={`Hồ sơ đang ở trạng thái ${request.statusLabel}. Chỉ hồ sơ đã qua trưởng phòng, kế toán và lãnh đạo mới được thực hiện chi.`}
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate(`/expenses/${request.code}`)}>Xem hồ sơ</Button>
            <Button variant="contained" onClick={() => navigate('/payments')}>Về danh sách thanh toán</Button>
          </Stack>
        }
      />
    )
  }

  return <ExecutePaymentView key={`${request.id}-${request.status}`} request={request} />
}

function ExecutePaymentView({ request }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const showToast = useToast()
  // Mở từ tab "Lịch sử lệnh chi" thì quay về đúng tab đó
  const backTo = location.state?.from === 'history' ? '/payments?tab=history' : '/payments'
  const executing = useSelector(selectPaymentExecuting)
  const canExecute = usePermission(PERMS.PAYMENT_EXECUTE)
  const [tab, setTab] = useState('profile')
  const [pending, setPending] = useState(null)

  const paid = request.status === 'DA_THANH_TOAN'
  const payment = request.payment
  const transfer = request.paymentMethod === 'CHUYEN_KHOAN'
  const amount = (request.amount ?? 0) - (request.paidAmount ?? 0)
  const history = buildExpenseHistory(request)
  const line = request.budgetLine

  const methods = useForm({ defaultValues: { proof: [] }, resolver: validationResolver(validate) })

  const showProof = () => openPaymentProof(request.id).catch(() => showToast('Không mở được file ủy nhiệm chi', 'error'))

  const completePayment = async () => {
    try {
      await dispatch(executePayment({ expenseId: request.id, file: pending.proof[0].file })).unwrap()
      setPending(null)
      showToast(`Đã hoàn thành chi ${formatMoney(amount)} cho ${request.code}`, 'success')
      dispatch(fetchPaymentStats())
      dispatch(fetchExpenseDetail(request.code))
    } catch (error) {
      setPending(null)
      showToast(error?.message || 'Hoàn thành chi thất bại', 'error', TOAST_OPTIONS.fromError(error))
      // Hồ sơ đã được người khác chi / đổi trạng thái → tải lại để thấy hiện trạng
      if (error?.response?.status === 409) dispatch(fetchExpenseDetail(request.code))
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="15 / KẾ TOÁN"
        title={paid ? `Chi tiết chi · ${request.code}` : `Thực hiện chi · ${request.code}`}
        description={
          paid
            ? 'Hồ sơ đã hoàn thành chi: thông tin lệnh chi, ủy nhiệm chi và toàn bộ quá trình phê duyệt.'
            : 'Chỉ kế toán được thực chi sau đủ phê duyệt Trưởng phòng → Kế toán → Lãnh đạo. Tải lên ủy nhiệm chi rồi bấm Hoàn thành chi.'
        }
        actions={
          <>
            <Button variant="outlined" onClick={() => navigate(backTo)}>Về danh sách</Button>
            {!paid && canExecute && (
              <Button variant="contained" startIcon={<CircleCheck size={16} />} onClick={() => document.getElementById('payment-form')?.requestSubmit()}>
                Hoàn thành chi
              </Button>
            )}
          </>
        }
        tags={
          <>
            <StatusBadge status={request.status} label={request.statusLabel} />
            {request.version > 1 && <StatusBadge label={`Phiên bản v${request.version}`} tone="neutral" />}
          </>
        }
      />

      <SummaryBar
        items={[
          { label: 'Người tạo / Phòng ban', value: `${request.requesterName ?? '—'} / ${request.departmentName ?? '—'}` },
          { label: 'Số tiền đã duyệt', value: formatMoney(request.amount) },
          { label: 'Ngày cần chi', value: formatDate(request.dueDate) },
          { label: 'Người thụ hưởng', value: request.beneficiaryName ?? '—' },
        ]}
      />

      {/* Đã chi: thông tin lệnh chi + file ủy nhiệm chi đặt ngay đầu trang (mở từ Lịch sử lệnh chi) */}
      {paid && (
        <SectionCard title="Chi tiết lệnh chi" action={<StatusBadge status="DA_THANH_TOAN" />} sx={{ mb: 3 }}>
          {payment ? (
            <DescriptionList
              columns={3}
              items={[
                { label: 'Mã lệnh chi', value: payment.code },
                { label: 'Số tiền', value: formatMoney(payment.amount) },
                { label: 'Ngày hoàn thành', value: formatDate(payment.executedAt) },
                { label: 'Người thực hiện', value: payment.executedByName ?? '—' },
                { label: 'Ghi nhận lúc', value: formatDateTime(payment.createdAt) },
                {
                  label: 'Ủy nhiệm chi',
                  value: payment.proofFileName ? (
                    // Tên file dài: cắt bằng "…" trong ô, rê chuột để xem đủ tên
                    <Button
                      size="small"
                      title={payment.proofFileName}
                      startIcon={<FileText size={14} />}
                      onClick={showProof}
                      sx={{ px: 0, minWidth: 0, maxWidth: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
                    >
                      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                        {payment.proofFileName}
                      </Box>
                    </Button>
                  ) : (
                    '—'
                  ),
                },
                {
                  label: 'Tài khoản thụ hưởng',
                  value: transfer ? `${request.beneficiaryBankName ?? '—'} · ${request.beneficiaryAccountNumber ?? '—'}` : 'Tiền mặt',
                },
                // Lệnh chi cũ (trước khi đổi sang upload ủy nhiệm chi)
                ...(payment.sourceAccount ? [{ label: 'Nguồn tiền / Ngân hàng', value: `${payment.sourceAccount} · ${payment.bankName ?? 'Tiền mặt'}` }] : []),
                ...(payment.bankRef ? [{ label: transfer ? 'Mã giao dịch ngân hàng' : 'Số phiếu chi', value: payment.bankRef }] : []),
                ...(payment.note ? [{ label: 'Ghi chú', value: payment.note }] : []),
              ]}
            />
          ) : (
            <Typography variant="body2">Hồ sơ đã hoàn thành chi.</Typography>
          )}
        </SectionCard>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 3, alignItems: 'start', mb: 3 }}>
        <Stack spacing={3}>
          <CustomTab
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'profile', label: 'Hồ sơ' },
              { value: 'history', label: 'Lịch sử xử lý', count: history.length },
              { value: 'versions', label: 'Phiên bản', count: request.versions?.length ?? 0 },
            ]}
          />

          {tab === 'profile' && (
            <SectionCard title="Mục đích & người thụ hưởng">
              <Typography sx={{ mb: 2.5 }}>{request.purpose}</Typography>
              <DescriptionList
                items={[
                  { label: 'Loại chi / Phương thức', value: `${request.categoryName ?? '—'} / ${request.paymentMethodLabel}` },
                  {
                    label: 'Ngân hàng / Số tài khoản',
                    value: transfer ? `${request.beneficiaryBankName ?? '—'} / ${request.beneficiaryAccountNumber ?? '—'}` : 'Chi tiền mặt',
                  },
                  { label: 'Kỳ / Khoản mục ngân sách', value: line ? `${line.periodName} / ${line.label}` : '—' },
                  { label: 'Tên tài khoản', value: transfer ? (request.beneficiaryAccountName ?? '—') : '—' },
                  ...(request.projectName ? [{ label: 'Dự án', value: request.projectName }] : []),
                  ...(request.note ? [{ label: 'Ghi chú', value: request.note, span: 2 }] : []),
                ]}
              />
            </SectionCard>
          )}

          {(tab === 'profile' || tab === 'history') && (
            <SectionCard title="Lịch sử xử lý" subtitle="Ai · lúc nào · hành động · lý do">
              <DataTable columns={HISTORY_COLUMNS} rows={history} />
            </SectionCard>
          )}

          {tab === 'versions' && (
            <SectionCard title="Phiên bản hồ sơ" subtitle="Mỗi lần gửi / gửi lại tạo một phiên bản; quyết định duyệt gắn với đúng phiên bản">
              <DataTable columns={VERSION_COLUMNS} rows={request.versions ?? []} rowKey="version" minWidth={480} />
            </SectionCard>
          )}
        </Stack>

        <Stack spacing={3}>
          <SectionCard title="Tiến trình phê duyệt" subtitle="3 cấp duyệt, sau đó kế toán thực hiện chi">
            <ApprovalTimeline steps={buildExpenseTimeline(request)} />
          </SectionCard>
          {line && (
            <BudgetCard
              title="Ngân sách khoản mục"
              scope={`${line.label} · ${line.periodName}`}
              total={line.plannedAmount}
              spent={line.spentAmount}
              committed={line.committedAmount}
              alert={
                paid
                  ? { tone: 'success', title: 'Đã ghi nhận chi', message: `${formatMoney(request.amount)} đã chuyển từ cam kết sang đã chi.` }
                  : { tone: 'info', title: 'Đang là cam kết', message: `Khi hoàn thành chi, ${formatMoney(amount)} chuyển từ cam kết sang đã chi; không trừ ngân sách lần hai.` }
              }
            />
          )}
          <AppAlert tone="info" title="Hồ sơ đang khóa chỉnh sửa">
            Thông tin hồ sơ đã được ba cấp duyệt. Kế toán chỉ ghi nhận lệnh chi, không sửa nội dung hồ sơ.
          </AppAlert>
        </Stack>
      </Box>

      {!paid && (
        <SectionCard title="Ủy nhiệm chi" subtitle={`Tải lên ủy nhiệm chi của khoản ${formatMoney(amount)}, sau đó bấm Hoàn thành chi`}>
          {!canExecute ? (
            <AppAlert tone="info" title="Bạn chỉ có quyền xem">
              Chỉ người có quyền thực chi (kế toán) mới hoàn thành chi được.
            </AppAlert>
          ) : (
            <CustomForm
              id="payment-form"
              methods={methods}
              onSubmit={(values) => setPending(values)}
              onInvalid={() => showToast('Chưa thể hoàn thành chi: cần tải lên file ủy nhiệm chi hợp lệ', 'error')}
            >
              <Box sx={{ maxWidth: 520 }}>
                <CustomFileUpload
                  name="proof"
                  label="File ủy nhiệm chi"
                  required
                  multiple={false}
                  accept={PROOF_ACCEPT}
                  placeholder="Chọn file PDF, JPG hoặc PNG (tối đa 10 MB)"
                  showButton={false}
                />
              </Box>
            </CustomForm>
          )}
        </SectionCard>
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        title="Xác nhận hoàn thành chi"
        description="Hồ sơ chuyển sang trạng thái Hoàn thành. Không thể sửa hoặc xóa sau khi xác nhận."
        confirmLabel="Hoàn thành chi"
        loading={executing}
        onClose={() => !executing && setPending(null)}
        onConfirm={completePayment}
      >
        {pending && (
          <Typography variant="body2">
            <strong>{formatMoney(amount)}</strong> · Thụ hưởng {request.beneficiaryName}
            {transfer ? ` · ${request.beneficiaryBankName ?? ''} ${request.beneficiaryAccountNumber ?? ''}` : ' · Tiền mặt'}
            <br />
            Ủy nhiệm chi: {pending.proof[0].name}
          </Typography>
        )}
      </ConfirmDialog>
    </>
  )
}
