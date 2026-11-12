import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm, useWatch } from 'react-hook-form'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Download } from 'lucide-react'
import {
  AppAlert,
  ApprovalTimeline,
  AttachmentItem,
  BudgetCard,
  ConfirmDialog,
  CustomFileUpload,
  CustomForm,
  CustomInput,
  CustomMoneyInput,
  CustomTab,
  DataTable,
  DescriptionList,
  EmptyState,
  FormFooter,
  FormGrid,
  PageHeader,
  SectionCard,
  StatusBadge,
  SummaryBar,
  useToast,
} from '../components'
import { ACCEPTANCE_FILE, CHANGE_REQUEST, CHI_1024, RESUBMIT_HISTORY } from '../mocks/approvals'
import { MARKETING_BUDGET, findExpense } from '../mocks/data'
import { buildApprovalSteps } from '../utils/approvalSteps'
import { formatDate, formatMoney } from '../utils/format'
import validationResolver from '../utils/validationResolver'

// Màn 14 · Bổ sung hồ sơ và gửi lại (nhân viên). Bản gửi lại bắt đầu lại từ trưởng phòng.
const AVAILABLE = MARKETING_BUDGET.total - MARKETING_BUDGET.spent - MARKETING_BUDGET.committed

const HISTORY_COLUMNS = [
  { key: 'time', header: 'Thời gian', width: 160 },
  { key: 'actor', header: 'Người thực hiện', width: 170 },
  { key: 'action', header: 'Hành động / Lý do' },
]

const DIFF_COLUMNS = [
  { key: 'field', header: 'Trường dữ liệu', width: 180 },
  { key: 'before', header: 'Phiên bản v1', width: 140 },
  { key: 'after', header: 'Phiên bản v2' },
  { key: 'note', header: 'Ghi chú' },
]

const DEFAULT_VALUES = {
  acceptanceDate: '2026-10-21',
  acceptanceAmount: null,
  note: 'Đã nghiệm thu toàn bộ gói truyền thông theo hợp đồng AV-MKT-10.',
  newFiles: [ACCEPTANCE_FILE],
}

function validate(values, { amount }) {
  const errors = {}
  if (!values.acceptanceDate) errors.acceptanceDate = 'Chọn ngày nghiệm thu.'
  if (!values.acceptanceAmount) errors.acceptanceAmount = 'Nhập số tiền nghiệm thu.'
  else if (values.acceptanceAmount > amount) errors.acceptanceAmount = `Không vượt số tiền đề nghị ${formatMoney(amount)}.`
  if (!values.note.trim()) errors.note = 'Ghi rõ nội dung bổ sung.'
  if (values.newFiles.length === 0) errors.newFiles = 'Đính kèm biên bản nghiệm thu.'
  return errors
}

export default function ResubmitExpensePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const found = findExpense(id)
  const expense = found && { ...CHI_1024, ...found, title: found.title, amount: found.amount ?? CHI_1024.amount }

  const [tab, setTab] = useState('profile')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const methods = useForm({ defaultValues: { ...DEFAULT_VALUES, acceptanceAmount: expense?.amount ?? null }, resolver: validationResolver(validate), context: { amount: expense?.amount ?? 0 } })
  const values = useWatch({ control: methods.control })
  const { isDirty } = methods.formState

  if (!expense || found.status !== 'CAN_BO_SUNG') {
    return (
      <EmptyState
        variant="no-results"
        title={`${id} không ở trạng thái cần bổ sung`}
        description="Chỉ hồ sơ được yêu cầu bổ sung mới chỉnh sửa và gửi lại được."
        action={<Button variant="outlined" onClick={() => navigate(found ? `/expenses/${id}` : '/expenses')}>Quay lại hồ sơ</Button>}
      />
    )
  }

  const diffRows = [
    { field: 'Ngày nghiệm thu', before: 'Chưa có', after: values.acceptanceDate ? formatDate(values.acceptanceDate) : '—', note: 'Cập nhật theo yêu cầu' },
    {
      field: 'Số tiền nghiệm thu',
      before: 'Chưa có',
      after: values.acceptanceAmount ? formatMoney(values.acceptanceAmount) : '—',
      note: values.acceptanceAmount === expense.amount ? 'Khớp với số tiền đề nghị' : 'Khác số tiền đề nghị',
    },
    { field: 'Biên bản nghiệm thu', before: 'Chưa có', after: values.newFiles?.map((f) => f.name).join(', ') || '—', note: 'Đính kèm mới' },
    { field: 'Ghi chú bổ sung', before: 'Không có', after: values.note || '—', note: 'Cập nhật theo yêu cầu' },
  ].map((row, index) => ({ ...row, id: index }))
  const changedCount = diffRows.filter((r) => r.after !== '—').length
  const complete = changedCount === diffRows.length

  const steps = buildApprovalSteps(
    [
      { title: 'Nhân viên gửi yêu cầu', actor: expense.requester, at: '20/10/2026, 09:15' },
      { title: 'Trưởng phòng phê duyệt', actor: 'Trần Minh Đức', at: '20/10/2026, 14:30' },
      { title: 'Kế toán thẩm định', actor: 'Lê Thu Hà', at: '21/10/2026, 10:20' },
      { title: 'Lãnh đạo duyệt cuối', actor: 'Phạm Quốc Huy', at: '22/10/2026, 11:15' },
      { title: 'Nhân viên chỉnh sửa và gửi lại', actor: expense.requester, waiting: 'Đang thực hiện' },
      { title: 'Trưởng phòng duyệt lại', actor: 'Trần Minh Đức' },
      { title: 'Kế toán thẩm định lại', actor: 'Lê Thu Hà' },
      { title: 'Lãnh đạo duyệt cuối', actor: 'Phạm Quốc Huy' },
      { title: 'Kế toán thực hiện chi', note: 'Chỉ sau đủ ba phê duyệt' },
    ],
    4,
    { currentBadge: 'Đang chỉnh sửa' },
  )

  const saveDraft = () => {
    methods.reset(methods.getValues())
    showToast(`Đã lưu nháp ${expense.id} v2`, 'info')
  }

  const resubmit = () => {
    setConfirmOpen(false)
    showToast(`Đã gửi lại ${expense.id} v2, hồ sơ quay về trưởng phòng`, 'success')
    navigate(`/expenses/${expense.id}`)
  }

  return (
    <>
      <PageHeader
        eyebrow="14 / NHÂN VIÊN"
        title={`${expense.id} · Cần bổ sung thông tin và gửi lại yêu cầu chi`}
        description={`Phiên bản v2 · ${isDirty ? 'Có thay đổi chưa lưu' : 'Bản nháp đã lưu 11:40, 22/10/2026'} · Dự án ${expense.project}`}
        actions={
          <Button variant="outlined" startIcon={<Download size={16} />} onClick={() => showToast('Đang chuẩn bị tệp hồ sơ...', 'info')}>
            Tải hồ sơ
          </Button>
        }
        tags={
          <>
            <StatusBadge status="CAN_BO_SUNG" />
            <StatusBadge label="Thanh toán: Chưa đủ điều kiện" tone="neutral" />
            <StatusBadge status="TRONG_HAN_MUC" />
          </>
        }
      />

      <SummaryBar
        items={[
          { label: 'Người tạo / Phòng ban', value: `${expense.requester} / ${expense.department}` },
          { label: 'Số tiền đề nghị', value: formatMoney(expense.amount) },
          { label: 'Ngày cần chi', value: formatDate(expense.dueDate) },
          { label: 'Người thụ hưởng', value: expense.beneficiary },
        ]}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 3, alignItems: 'start', mb: 3 }}>
        <Stack spacing={3}>
          <CustomTab
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'profile', label: 'Hồ sơ' },
              { value: 'history', label: 'Lịch sử xử lý', count: RESUBMIT_HISTORY.length - 1 },
              { value: 'versions', label: 'Phiên bản', count: 2 },
            ]}
          />

          {tab === 'profile' && (
            <>
              <SectionCard title="Mục đích & người thụ hưởng">
                <Typography sx={{ mb: 2.5 }}>{expense.purpose}</Typography>
                <DescriptionList
                  items={[
                    { label: 'Loại chi / Phương thức', value: `${expense.category} / ${expense.method}` },
                    { label: 'Ngân hàng / Số tài khoản', value: `${expense.bank} / ${expense.accountNumber}` },
                    { label: 'Kỳ / Khoản mục ngân sách', value: `${expense.period} / ${expense.budgetLine}` },
                    { label: 'Tên tài khoản', value: expense.accountName },
                  ]}
                />
              </SectionCard>
              <SectionCard title="Chứng từ đính kèm">
                <Stack spacing={1.25}>
                  {[...expense.attachments, ...(values.newFiles ?? []).map((f) => ({ name: f.name, meta: `${expense.requester} · 22/10/2026` }))].map((file) => (
                    <AttachmentItem key={file.name} name={file.name} meta={file.meta} onDownload={() => showToast(`Đang tải ${file.name}`, 'info')} />
                  ))}
                </Stack>
                {values.newFiles?.length > 0 && <StatusBadge label="Đã đính kèm chứng từ mới" tone="success" sx={{ mt: 2 }} />}
              </SectionCard>
            </>
          )}

          {(tab === 'profile' || tab === 'history') && (
            <SectionCard title="Lịch sử xử lý & phiên bản" subtitle="Ai · lúc nào · hành động · lý do">
              <DataTable columns={HISTORY_COLUMNS} rows={RESUBMIT_HISTORY} />
              <Typography variant="caption" component="p" sx={{ mt: 2 }}>
                v1 là bản gửi đầu tiên, chưa có thay đổi. v2 là bản gửi lại sau khi bổ sung biên bản nghiệm thu.
              </Typography>
            </SectionCard>
          )}

          {tab === 'versions' && (
            <SectionCard title="Phiên bản hồ sơ">
              <DescriptionList
                items={[
                  { label: 'v1 · Đã gửi', value: '20/10/2026 09:15 · 48.000.000 VND' },
                  { label: 'v2 · Bản nháp', value: `${changedCount}/${diffRows.length} trường đã bổ sung` },
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
              message: `Yêu cầu ${formatMoney(expense.amount)}. Còn ${formatMoney(AVAILABLE - expense.amount)} nếu được duyệt; không trừ cam kết lần thứ hai.`,
            }}
          />
          <AppAlert tone="info" title="Chỉ sửa các trường được yêu cầu">
            Thông tin đã duyệt được giữ nguyên. Sau khi gửi lại, hồ sơ khóa chỉnh sửa và quay về trưởng phòng.
          </AppAlert>
        </Stack>
      </Box>

      <CustomForm methods={methods} onSubmit={() => setConfirmOpen(true)} onInvalid={() => showToast('Chưa thể gửi lại: cần xử lý các mục được đánh dấu', 'error')}>
        <Stack spacing={3}>
          <SectionCard title="Yêu cầu bổ sung">
            <DescriptionList
              columns={3}
              items={[
                { label: 'Người yêu cầu bổ sung', value: CHANGE_REQUEST.requestedBy },
                { label: 'Thời gian yêu cầu', value: CHANGE_REQUEST.requestedAt },
                { label: 'Lý do bổ sung', value: CHANGE_REQUEST.reason },
                ...CHANGE_REQUEST.fields.map((field, i) => ({ label: `Trường cần sửa ${i + 1}`, value: field })),
              ]}
            />
          </SectionCard>

          <SectionCard title="Chứng từ mới">
            <CustomFileUpload name="newFiles" label="Biên bản nghiệm thu" required placeholder="Chọn biên bản nghiệm thu" accept=".pdf,.jpg,.jpeg,.png" />
          </SectionCard>

          <SectionCard title="Form chỉnh sửa">
            <FormGrid>
              <CustomInput name="acceptanceDate" label="Ngày nghiệm thu" required type="date" />
              <CustomMoneyInput name="acceptanceAmount" label="Số tiền nghiệm thu" required showUnit />
              <Box sx={{ gridColumn: '1 / -1' }}>
                <CustomInput name="note" label="Ghi chú bổ sung" required multiline minRows={2} />
              </Box>
            </FormGrid>
            <StatusBadge label={`Đã chỉnh sửa ${changedCount} trường`} tone="primary" sx={{ mt: 2 }} />
          </SectionCard>

          <SectionCard title="So sánh phiên bản">
            <DataTable columns={DIFF_COLUMNS} rows={diffRows} />
            <StatusBadge
              label={complete ? 'v2 đã cập nhật đủ thông tin bổ sung' : 'v2 còn thiếu thông tin bổ sung'}
              tone={complete ? 'success' : 'warning'}
              sx={{ mt: 2 }}
            />
          </SectionCard>
        </Stack>

        <FormFooter note={isDirty ? 'Có thay đổi chưa lưu.' : 'Bản gửi lại bắt đầu lại từ trưởng phòng.'}>
          <Button variant="outlined" onClick={saveDraft}>Lưu nháp</Button>
          <Button variant="contained" type="submit">Gửi lại yêu cầu</Button>
        </FormFooter>
      </CustomForm>

      <ConfirmDialog
        open={confirmOpen}
        title="Gửi lại yêu cầu chi"
        description="Phiên bản v2 sẽ khóa chỉnh sửa và quay về trưởng phòng duyệt lại từ đầu."
        confirmLabel="Gửi lại"
        onClose={() => setConfirmOpen(false)}
        onConfirm={resubmit}
      >
        <Typography variant="body2">
          <strong>{expense.id} · v2</strong>
          <br />
          {changedCount} trường bổ sung · {formatMoney(values.acceptanceAmount)}
        </Typography>
      </ConfirmDialog>
    </>
  )
}
