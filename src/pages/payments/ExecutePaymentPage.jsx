import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm, useWatch } from 'react-hook-form'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Download, Plus } from 'lucide-react'
import {
  AppAlert,
  ApprovalTimeline,
  AttachmentItem,
  BudgetCard,
  ConfirmDialog,
  CustomCheckbox,
  CustomForm,
  CustomInput,
  CustomMoneyInput,
  CustomSelect,
  CustomTab,
  DataTable,
  DescriptionList,
  EmptyState,
  FormGrid,
  FormTextField,
  PageHeader,
  SectionCard,
  StatusBadge,
  SummaryBar,
  useToast,
} from '../../components'
import { CHI_1024, PAYMENT_BANKS, PAYMENT_SOURCES, TRANSACTIONS } from '../../mocks/approvals'
import { MARKETING_BUDGET } from '../../mocks/data'
import { buildApprovalSteps } from '../../utils/approvalSteps'
import { formatDate, formatMoney } from '../../utils/format'
import validationResolver from '../../utils/validationResolver'

// Màn 15 · Kế toán thực hiện chi: chỉ hồ sơ đủ 3 cấp duyệt mới được chi.
const TODAY = '2026-10-22'
const AVAILABLE = MARKETING_BUDGET.total - MARKETING_BUDGET.spent - MARKETING_BUDGET.committed

// Hồ sơ đã duyệt cuối, chờ kế toán chi.
const PAYABLE = { [CHI_1024.id]: CHI_1024 }

const HISTORY = [
  { id: 4, time: '22/10/2026 08:40', actor: 'Phạm Quốc Huy', action: 'Duyệt lãnh đạo · Đủ điều kiện thanh toán.' },
  { id: 3, time: '21/10/2026 10:20', actor: 'Lê Thu Hà', action: 'Duyệt kế toán · Chứng từ và tài khoản hợp lệ.' },
  { id: 2, time: '20/10/2026 14:30', actor: 'Trần Minh Đức', action: 'Duyệt cấp phòng · Đúng kế hoạch quý IV.' },
  { id: 1, time: '20/10/2026 09:15', actor: 'Nguyễn Mai Anh', action: 'Gửi hồ sơ v1 · 48.000.000 VND.' },
]

const HISTORY_COLUMNS = [
  { key: 'time', header: 'Thời gian', width: 160 },
  { key: 'actor', header: 'Người thực hiện', width: 170 },
  { key: 'action', header: 'Hành động / Lý do' },
]

const ROUND_COLUMNS = [
  { key: 'round', header: 'Đợt', width: 90 },
  { key: 'date', header: 'Ngày', width: 120, render: (r) => formatDate(r.date) },
  { key: 'amount', header: 'Số tiền', align: 'right', render: (r) => formatMoney(r.amount, { unit: false }) },
  { key: 'status', header: 'Trạng thái', width: 140, render: (r) => <StatusBadge status={r.status} /> },
]

// context: { remaining, usedCodes }
function validate(values, { remaining, usedCodes }) {
  const errors = {}
  if (!values.amount) errors.amount = 'Nhập số tiền chi.'
  else if (values.amount > remaining) errors.amount = `Không vượt quá ${formatMoney(remaining)} còn lại.`
  if (!values.date) errors.date = 'Chọn ngày thực hiện.'
  const code = values.code.trim().toUpperCase()
  if (!code) errors.code = 'Nhập mã giao dịch ngân hàng.'
  else if (usedCodes.includes(code)) errors.code = 'Mã giao dịch đã tồn tại, kiểm tra để tránh chi kép.'
  if (!values.document) errors.document = 'Chọn chứng từ chi.'
  if (!values.reconciled) errors.reconciled = 'Cần xác nhận đã đối soát chứng từ.'
  return errors
}

export default function ExecutePaymentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const request = PAYABLE[id]

  const [tab, setTab] = useState('profile')
  const [rounds, setRounds] = useState([])
  const [pending, setPending] = useState(null)
  const paid = rounds.reduce((sum, r) => sum + r.amount, 0)
  const remaining = (request?.amount ?? 0) - paid
  const relatedIssues = TRANSACTIONS.filter((t) => t.expenseId === id && t.status !== 'THANH_CONG')

  const methods = useForm({
    defaultValues: { source: PAYMENT_SOURCES[0], bank: PAYMENT_BANKS[0], amount: request?.amount ?? null, date: TODAY, code: '', document: '', reconciled: false },
    resolver: validationResolver(validate),
    context: { remaining, usedCodes: [...TRANSACTIONS.map((t) => t.id), ...rounds.map((r) => r.code)] },
  })
  const amount = useWatch({ control: methods.control, name: 'amount' })

  if (!request) {
    return (
      <EmptyState
        variant="no-results"
        title={`${id} chưa đủ điều kiện thực hiện chi`}
        description="Chỉ hồ sơ đã qua trưởng phòng, kế toán và lãnh đạo mới được thực hiện chi."
        action={<Button variant="outlined" onClick={() => navigate('/payments')}>Về danh sách giao dịch</Button>}
      />
    )
  }

  const done = remaining <= 0
  const steps = buildApprovalSteps(
    [
      { title: 'Nhân viên gửi yêu cầu', actor: request.requester, at: '20/10/2026, 09:15' },
      { title: 'Trưởng phòng phê duyệt', actor: request.deptApproval.actor, at: request.deptApproval.at },
      { title: 'Kế toán thẩm định', actor: request.accountingApproval.actor, at: request.accountingApproval.at },
      { title: 'Lãnh đạo duyệt cuối', actor: request.finalApproval.actor, at: request.finalApproval.at },
      { title: 'Kế toán thực hiện chi', waiting: done ? undefined : 'Đang chờ xử lý' },
    ],
    done ? 5 : 4,
  )

  const executePayment = () => {
    const values = pending
    setPending(null)
    setRounds((prev) => [
      ...prev,
      { id: values.code, code: values.code.trim().toUpperCase(), round: `Đợt ${prev.length + 1}`, date: values.date, amount: values.amount, status: 'CHO_DOI_SOAT' },
    ])
    methods.reset({ ...values, amount: remaining - values.amount || null, code: '', reconciled: false })
    showToast(`Đã ghi nhận chi ${formatMoney(values.amount)} cho ${request.id}, chờ đối soát ngân hàng`, 'success')
  }

  return (
    <>
      <PageHeader
        eyebrow="15 / KẾ TOÁN"
        title="Kế toán thực hiện chi"
        description="Chỉ kế toán được thực chi sau đủ phê duyệt Trưởng phòng → Kế toán → Lãnh đạo. Kiểm tra giao dịch trùng trước khi thử lại."
        actions={
          <>
            <Button variant="outlined" startIcon={<Download size={16} />} onClick={() => showToast('Đang xuất báo cáo thực chi...', 'info')}>
              Xuất báo cáo
            </Button>
            <Button variant="contained" startIcon={<Plus size={16} />} disabled={done} onClick={() => document.getElementById('payment-form')?.requestSubmit()}>
              Thực hiện chi
            </Button>
          </>
        }
        tags={
          <>
            <StatusBadge status="DA_DUYET_CUOI" />
            <StatusBadge label={done ? 'Thanh toán: Chờ đối soát' : 'Thanh toán: Chờ kế toán'} tone="neutral" />
            <StatusBadge status="TRONG_HAN_MUC" />
          </>
        }
      />

      <SummaryBar
        items={[
          { label: 'Người tạo / Phòng ban', value: `${request.requester} / ${request.department}` },
          { label: 'Số tiền đề nghị', value: formatMoney(request.amount) },
          { label: 'Ngày cần chi', value: formatDate(request.dueDate) },
          { label: 'Người thụ hưởng', value: request.beneficiary },
        ]}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 3, alignItems: 'start', mb: 3 }}>
        <Stack spacing={3}>
          <CustomTab
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'profile', label: 'Hồ sơ' },
              { value: 'history', label: 'Lịch sử xử lý', count: HISTORY.length },
              { value: 'versions', label: 'Phiên bản', count: request.version },
            ]}
          />

          {tab === 'profile' && (
            <>
              <SectionCard title="Mục đích & người thụ hưởng">
                <Typography sx={{ mb: 2.5 }}>{request.purpose}</Typography>
                <DescriptionList
                  items={[
                    { label: 'Loại chi / Phương thức', value: `${request.category} / ${request.method}` },
                    { label: 'Ngân hàng / Số tài khoản', value: `${request.bank} / ${request.accountNumber}` },
                    { label: 'Kỳ / Khoản mục ngân sách', value: `${request.period} / ${request.budgetLine}` },
                    { label: 'Tên tài khoản', value: request.accountName },
                  ]}
                />
              </SectionCard>
              <SectionCard title="Chứng từ đính kèm">
                <Stack spacing={1.25}>
                  {request.attachments.map((file) => (
                    <AttachmentItem key={file.name} name={file.name} meta={file.meta} onDownload={() => showToast(`Đang tải ${file.name}`, 'info')} />
                  ))}
                </Stack>
                <StatusBadge label="Kế toán đã đối chiếu hồ sơ" tone="success" sx={{ mt: 2 }} />
              </SectionCard>
            </>
          )}

          {(tab === 'profile' || tab === 'history') && (
            <SectionCard title="Lịch sử xử lý & phiên bản" subtitle="Ai · lúc nào · hành động · lý do">
              <DataTable columns={HISTORY_COLUMNS} rows={HISTORY} />
              <Typography variant="caption" component="p" sx={{ mt: 2 }}>
                v1 là bản gửi đầu tiên, chưa có thay đổi. Mỗi quyết định gắn với đúng phiên bản được xem xét.
              </Typography>
            </SectionCard>
          )}

          {tab === 'versions' && (
            <SectionCard title="Phiên bản hồ sơ">
              <DescriptionList
                items={[
                  { label: 'Phiên bản hiện tại', value: `v${request.version}` },
                  { label: 'Thay đổi so với bản trước', value: 'Không có' },
                ]}
              />
            </SectionCard>
          )}
        </Stack>

        <Stack spacing={3}>
          <SectionCard title="Tiến trình phê duyệt" subtitle="3 cấp duyệt, sau đó kế toán thanh toán">
            <ApprovalTimeline steps={steps} />
          </SectionCard>
          <BudgetCard
            title="Ngân sách tại thời điểm gửi"
            {...MARKETING_BUDGET}
            alert={{
              tone: 'success',
              title: 'Trong hạn mức',
              message: `Yêu cầu ${formatMoney(request.amount)}. Còn ${formatMoney(AVAILABLE - request.amount)} nếu được duyệt; không trừ cam kết lần thứ hai.`,
            }}
          />
          <AppAlert tone="info" title="Hồ sơ đang khóa chỉnh sửa">
            Thông tin hồ sơ đã được ba cấp duyệt. Kế toán chỉ ghi nhận giao dịch chi, không sửa nội dung hồ sơ.
          </AppAlert>
        </Stack>
      </Box>

      <SectionCard title="Form thực hiện chi" subtitle="Đợt chi, nguồn tiền, ngân hàng, số tiền, ngày, mã giao dịch, chứng từ, xác nhận thực chi" sx={{ mb: 3 }}>
        <CustomForm
          id="payment-form"
          methods={methods}
          onSubmit={(values) => setPending(values)}
          onInvalid={() => showToast('Chưa thể thực hiện chi: cần xử lý các mục được đánh dấu', 'error')}
        >
          <FormGrid columns={4}>
            <FormTextField label="Đợt chi" value={done ? `Hoàn tất ${rounds.length} đợt` : `Đợt ${rounds.length + 1}`} disabled />
            <CustomSelect name="source" label="Nguồn tiền" required options={PAYMENT_SOURCES} disabled={done} />
            <CustomSelect name="bank" label="Ngân hàng" required options={PAYMENT_BANKS} disabled={done} />
            <CustomMoneyInput name="amount" label="Số tiền (VND)" required disabled={done} helperText={`Còn lại ${formatMoney(remaining)}`} />
            <CustomInput name="date" label="Ngày thực hiện" required type="date" disabled={done} />
            <CustomInput name="code" label="Mã giao dịch" required placeholder="GD-2210-10" disabled={done} />
            <CustomSelect
              name="document"
              label="Chứng từ"
              required
              placeholder="Chọn chứng từ"
              options={request.attachments.map((f) => f.name)}
              disabled={done}
            />
            <Box sx={{ alignSelf: 'end', pb: 1.25 }}>
              <CustomCheckbox name="reconciled" label="Đã đối soát chứng từ" />
            </Box>
          </FormGrid>
          {methods.formState.errors.reconciled && (
            <Typography sx={{ fontSize: 12, color: 'error.main', mt: 1 }}>{methods.formState.errors.reconciled.message}</Typography>
          )}
        </CustomForm>

        {relatedIssues.length > 0 && (
          <AppAlert tone="danger" title="Kiểm tra giao dịch trùng trước khi thử lại" sx={{ mt: 2.5 }}>
            {relatedIssues.map((t) => `${t.id} ${t.status === 'LOI' ? 'thất bại' : 'chưa đối soát'}`).join('; ')}. Kiểm tra mã ngân hàng trước khi thử lại để tránh chi kép.
          </AppAlert>
        )}
      </SectionCard>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, alignItems: 'start' }}>
        <SectionCard title="Tổng duyệt">
          <DescriptionList
            columns={3}
            items={[
              { label: 'Tổng duyệt', value: formatMoney(request.amount) },
              { label: 'Đã chi', value: formatMoney(paid) },
              { label: 'Còn lại', value: formatMoney(remaining) },
            ]}
          />
        </SectionCard>
        <SectionCard title="Lịch sử các đợt">
          <DataTable
            columns={ROUND_COLUMNS}
            rows={rounds.length ? rounds : [{ id: 'draft', round: 'Đợt 1', date: TODAY, amount: amount ?? request.amount, status: 'CHO_CHI' }]}
            minWidth={360}
          />
        </SectionCard>
      </Box>

      <ConfirmDialog
        open={Boolean(pending)}
        title="Xác nhận thực chi"
        description="Giao dịch được ghi nhận và chờ đối soát với sao kê ngân hàng. Không thể xóa sau khi xác nhận."
        confirmLabel="Xác nhận thực chi"
        onClose={() => setPending(null)}
        onConfirm={executePayment}
      >
        {pending && (
          <Typography variant="body2">
            <strong>{formatMoney(pending.amount)}</strong> · {pending.bank} · {pending.code.toUpperCase()}
            <br />
            Thụ hưởng {request.beneficiary} · {request.accountNumber}
          </Typography>
        )}
      </ConfirmDialog>
    </>
  )
}
