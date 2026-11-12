import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Download, Plus } from 'lucide-react'
import {
  AttachmentItem,
  ConfirmDialog,
  CustomFileUpload,
  CustomForm,
  CustomInput,
  CustomMoneyInput,
  CustomSelect,
  DataTable,
  DescriptionList,
  EmptyState,
  FormGrid,
  PageHeader,
  SectionCard,
  StatCard,
  StatGrid,
  StatusBadge,
  useToast,
} from '../components'
import { BANK_REFERENCES, INCOMES, INCOME_DETAIL } from '../mocks/income'
import { colors } from '../theme/tokens'
import { formatDate, formatMoney } from '../utils/format'
import validationResolver from '../utils/validationResolver'

// Màn 07 · Chi tiết khoản thu, kế toán ghi nhận từng đợt thực thu.
const TODAY = '2026-10-22'
const EMPTY_RECEIPT = { amount: null, date: TODAY, reference: '', files: [] }

// context: { remaining, receipts } — truyền qua useForm({ context }) vì thay đổi sau mỗi đợt thu.
function validateReceipt(values, { remaining, receipts }) {
  const errors = {}
  if (!values.amount) errors.amount = 'Nhập số tiền nhận.'
  else if (values.amount > remaining) errors.amount = `Không vượt quá ${formatMoney(remaining)} còn phải thu.`
  if (!values.date) errors.date = 'Chọn ngày nhận.'
  if (!values.reference) errors.reference = 'Chọn mã giao dịch ngân hàng.'
  else if (receipts.some((r) => r.id === values.reference)) errors.reference = 'Mã giao dịch đã được ghi nhận.'
  if (values.files.length === 0) errors.files = 'Đính kèm sao kê / phiếu thu.'
  return errors
}

function findIncome(id) {
  if (id === INCOME_DETAIL.id) return INCOME_DETAIL
  const row = INCOMES.find((r) => r.id === id)
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    customer: row.customer,
    department: row.department,
    source: '—',
    requester: '—',
    account: row.account,
    dueDate: row.dueDate,
    total: row.expected,
    receipts: row.received ? [{ id: `${row.id}-01`, date: row.dueDate, amount: row.received, confirmedBy: 'Lê Thu Hà', matched: true }] : [],
    attachments: [],
    history: [],
  }
}

const RECEIPT_COLUMNS = [
  { key: 'id', header: 'Ngày / Mã giao dịch', render: (r) => `${formatDate(r.date)} · ${r.id}` },
  { key: 'amount', header: 'Số tiền VND', align: 'right', width: 140, render: (r) => formatMoney(r.amount, { unit: false }) },
  { key: 'confirmedBy', header: 'Người xác nhận', width: 140 },
  {
    key: 'matched',
    header: 'Đối soát',
    width: 110,
    render: (r) => (r.matched ? <StatusBadge label="Khớp" tone="success" /> : <StatusBadge label="Chưa đối soát" tone="warning" />),
  },
]

export default function IncomeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const income = findIncome(id)

  const [receipts, setReceipts] = useState(income?.receipts ?? [])
  const [history, setHistory] = useState(income?.history ?? [])
  const [pending, setPending] = useState(null) // đợt thu đã hợp lệ, chờ xác nhận trong dialog

  const received = receipts.reduce((sum, r) => sum + r.amount, 0)
  const remaining = (income?.total ?? 0) - received
  const methods = useForm({
    defaultValues: EMPTY_RECEIPT,
    resolver: validationResolver(validateReceipt),
    context: { remaining, receipts },
  })

  if (!income) {
    return (
      <EmptyState
        variant="no-results"
        title={`Không tìm thấy khoản thu ${id}`}
        description="Khoản thu không tồn tại hoặc bạn không có quyền xem."
        action={<Button variant="outlined" onClick={() => navigate('/income')}>Về danh sách khoản thu</Button>}
      />
    )
  }

  const status = remaining <= 0 ? 'DA_THU' : received > 0 ? 'THU_MOT_PHAN' : 'CHO_THU'

  const confirmReceipt = () => {
    setReceipts((prev) => [...prev, { id: pending.reference, date: pending.date, amount: pending.amount, confirmedBy: 'Lê Thu Hà', matched: true }])
    setHistory((prev) => [{ at: `${formatDate(pending.date).slice(0, 5)}, 09:30`, text: `Lê Thu Hà xác nhận ${formatMoney(pending.amount)}.` }, ...prev])
    showToast(`Đã ghi nhận ${formatMoney(pending.amount)} cho ${income.id}`, 'success')
    setPending(null)
    methods.reset(EMPTY_RECEIPT)
  }

  return (
    <>
      <PageHeader
        eyebrow="07 / KẾ TOÁN"
        title={`${income.id} · ${income.title}`}
        description={[income.contract && `Hợp đồng ${income.contract}`, 'Đã kiểm tra hồ sơ', `Hạn thu ${formatDate(income.dueDate)}`].filter(Boolean).join(' · ')}
        actions={
          <>
            <Button variant="outlined" startIcon={<Download size={16} />} onClick={() => showToast('Đang tải chứng từ khoản thu...', 'info')}>
              Tải chứng từ
            </Button>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              disabled={remaining <= 0}
              onClick={() => document.getElementById('receipt-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ghi nhận đợt thu
            </Button>
          </>
        }
        tags={
          <>
            <StatusBadge status={status} />
            <StatusBadge label={income.dueDate >= TODAY ? 'Chưa đến hạn' : 'Quá hạn'} tone={income.dueDate >= TODAY ? 'neutral' : 'danger'} />
            {receipts.length > 0 && <StatusBadge label={`Đã đối soát ${receipts.length}/${receipts.length} đợt`} tone="success" />}
          </>
        }
      />

      <StatGrid columns={3}>
        <StatCard label="Tổng phải thu" value={formatMoney(income.total, { unit: false })} caption="VND · Theo hợp đồng" />
        <StatCard label="Đã thực nhận" value={formatMoney(received, { unit: false })} tone="success" caption={`VND · ${receipts.length} đợt đã xác nhận`} />
        <StatCard label="Còn phải thu" value={formatMoney(remaining, { unit: false })} tone="warning" caption={`VND · Hạn ${formatDate(income.dueDate)}`} />
      </StatGrid>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 384px' }, gap: 3, alignItems: 'start' }}>
        <Stack spacing={3}>
          <SectionCard title="Thông tin khoản thu">
            <DescriptionList
              columns={3}
              items={[
                { label: 'Khách hàng', value: income.customer },
                { label: 'Phòng phụ trách', value: income.department },
                { label: 'Nguồn thu', value: income.source },
                { label: 'Người đề nghị', value: income.requester },
                { label: 'Tài khoản nhận', value: income.account },
                { label: 'Ngày dự kiến / Đến hạn', value: `${formatDate(income.expectedDate)} / ${formatDate(income.dueDate)}` },
              ]}
            />
          </SectionCard>

          <SectionCard title="Các đợt thực thu" subtitle="Giao dịch chỉ tăng thực nhận sau khi kế toán xác nhận">
            <DataTable
              columns={RECEIPT_COLUMNS}
              rows={receipts}
              minWidth={560}
              emptyState={<EmptyState compact title="Chưa có đợt thu" description="Ghi nhận đợt đầu tiên khi tiền về tài khoản." />}
            />
          </SectionCard>

          <SectionCard title="Chứng từ thu">
            {income.attachments.length === 0 ? (
              <EmptyState compact title="Chưa có chứng từ" description="Khoản thu này chưa đính kèm tệp nào." />
            ) : (
              <Stack spacing={1.25}>
                {income.attachments.map((file) => (
                  <AttachmentItem key={file.name} name={file.name} meta={file.meta} onDownload={() => showToast(`Đang tải ${file.name}`, 'info')} />
                ))}
              </Stack>
            )}
          </SectionCard>
        </Stack>

        <Stack spacing={3}>
          <SectionCard title="Ghi nhận đợt thu mới" subtitle="Quyền kế toán · Chưa ghi sổ">
            <CustomForm id="receipt-form" methods={methods} onSubmit={(values) => setPending(values)}>
              <Stack spacing={2}>
                <CustomMoneyInput
                  name="amount"
                  label="Số tiền nhận (VND)"
                  required
                  placeholder={formatMoney(remaining, { unit: false })}
                  helperText={`Không vượt quá ${formatMoney(remaining)} còn phải thu.`}
                  disabled={remaining <= 0}
                />
                <FormGrid>
                  <CustomInput name="date" label="Ngày nhận" required type="date" />
                  <CustomSelect name="reference" label="Mã ngân hàng" required options={BANK_REFERENCES} placeholder="Chọn / nhập mã" />
                </FormGrid>
                <CustomFileUpload
                  name="files"
                  label="Chứng từ giao dịch"
                  required
                  placeholder="+ Đính kèm sao kê / phiếu thu"
                  showButton={false}
                  multiple={false}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }} disabled={remaining <= 0}>
                  Xác nhận thực thu
                </Button>
                <Typography variant="caption" component="p">
                  Kiểm tra trùng mã giao dịch, số tiền và tài khoản trước khi ghi sổ. Tiền chưa xác nhận không được cộng thực nhận.
                </Typography>
              </Stack>
            </CustomForm>
          </SectionCard>

          <SectionCard title="Lịch sử xử lý">
            {history.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Chưa có lịch sử.</Typography>
            ) : (
              <Stack spacing={2}>
                {history.map((h) => (
                  <Typography key={`${h.at}-${h.text}`} variant="body2" sx={{ color: h.muted ? colors.textSecondary : colors.text }}>
                    {h.at} · {h.text}
                  </Typography>
                ))}
              </Stack>
            )}
          </SectionCard>
        </Stack>
      </Box>

      <ConfirmDialog
        open={Boolean(pending)}
        title="Xác nhận thực thu"
        description="Sau khi xác nhận, số tiền được cộng vào thực nhận và ghi vào nhật ký."
        confirmLabel="Xác nhận"
        onClose={() => setPending(null)}
        onConfirm={confirmReceipt}
      >
        {pending && (
          <Typography variant="body2">
            <strong>{formatMoney(pending.amount)}</strong> · {pending.reference} · {formatDate(pending.date)}
          </Typography>
        )}
      </ConfirmDialog>
    </>
  )
}
