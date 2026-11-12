import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
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
  CustomTab,
  DataTable,
  DescriptionList,
  EmptyState,
  PageHeader,
  SectionCard,
  StatusBadge,
  SummaryBar,
  useToast,
} from '../components'
import { MARKETING_BUDGET, findExpense } from '../mocks/data'
import { formatDate, formatDateTime, formatMoney } from '../utils/format'

// Màn 10 · Chi tiết hồ sơ chi (góc nhìn người tạo).
const DEFAULT_STEPS = [
  { title: 'Nhân viên gửi yêu cầu' },
  { title: 'Trưởng phòng phê duyệt' },
  { title: 'Kế toán thẩm định' },
  { title: 'Lãnh đạo duyệt cuối' },
  { title: 'Kế toán thực hiện chi', note: 'Chỉ sau đủ ba phê duyệt' },
]

const HISTORY_COLUMNS = [
  { key: 'time', header: 'Thời gian', width: 160 },
  { key: 'actor', header: 'Người thực hiện', width: 180 },
  { key: 'action', header: 'Hành động / Lý do' },
]

function buildSteps(expense) {
  const source = expense.approvals ?? DEFAULT_STEPS
  const rejected = expense.status === 'TU_CHOI'
  return source.map((step, index) => {
    let status = 'pending'
    if (index < expense.approvalStep) status = 'done'
    else if (index === expense.approvalStep) status = rejected ? 'rejected' : expense.status === 'NHAP' ? 'pending' : 'current'

    const description =
      status === 'done'
        ? [step.actor, step.at].filter(Boolean).join(' · ') || 'Đã hoàn tất'
        : status === 'current'
          ? [step.actor, 'Chờ đến lượt'].filter(Boolean).join(' · ')
          : step.note
    const badge = status === 'current' ? { label: 'Đang chờ xử lý' } : status === 'rejected' ? { label: 'Từ chối', tone: 'danger' } : undefined
    return { title: step.title, description, status, badge }
  })
}

export default function ExpenseDetailPage() {
  const showToast = useToast()
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')
  const expense = findExpense(id)

  if (!expense) {
    return (
      <EmptyState
        variant="no-results"
        title={`Không tìm thấy hồ sơ ${id}`}
        description="Hồ sơ không tồn tại hoặc bạn không có quyền xem."
        action={<Button variant="outlined" onClick={() => navigate('/expenses')}>Về danh sách yêu cầu</Button>}
      />
    )
  }

  const locked = ['CHO_TRUONG_PHONG', 'CHO_KE_TOAN', 'CHO_LANH_DAO'].includes(expense.status)
  const history = expense.history ?? []
  const attachments = expense.attachments ?? []

  return (
    <>
      <PageHeader
        eyebrow="10 / NHÂN VIÊN"
        title={`${expense.id} · ${expense.title}`}
        description={`Phiên bản v${expense.version ?? 1} · Gửi lúc ${formatDateTime(expense.createdAt)}${expense.project ? ` · Dự án ${expense.project}` : ''}`}
        actions={
          <>
            {expense.status === 'CAN_BO_SUNG' && (
              <Button variant="contained" onClick={() => navigate(`/expenses/${expense.id}/resubmit`)}>Bổ sung hồ sơ</Button>
            )}
            <Button variant="outlined" startIcon={<Download size={16} />} onClick={() => showToast('Đang chuẩn bị tệp hồ sơ...', 'info')}>
              Tải hồ sơ
            </Button>
          </>
        }
        tags={
          <>
            <StatusBadge status={expense.status} />
            {expense.paymentStatus && <StatusBadge label={`Thanh toán: ${expense.paymentStatus}`} tone="neutral" />}
            <StatusBadge status="TRONG_HAN_MUC" />
          </>
        }
      />

      <SummaryBar
        items={[
          { label: 'Người tạo / Phòng ban', value: `${expense.createdBy ?? 'Nguyễn Mai Anh'} / ${expense.department ?? 'Marketing'}` },
          { label: 'Số tiền đề nghị', value: formatMoney(expense.amount) },
          { label: 'Ngày cần chi', value: formatDate(expense.dueDate) },
          { label: 'Người thụ hưởng', value: expense.beneficiary ?? '—' },
        ]}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 3, alignItems: 'start' }}>
        <Stack spacing={3}>
          <CustomTab
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'profile', label: 'Hồ sơ' },
              { value: 'history', label: 'Lịch sử xử lý', count: history.length },
              { value: 'versions', label: 'Phiên bản', count: expense.version ?? 1 },
            ]}
          />

          {tab === 'profile' && (
            <>
              <SectionCard title="Mục đích & người thụ hưởng">
                {expense.purpose && <Typography sx={{ mb: 2.5 }}>{expense.purpose}</Typography>}
                <DescriptionList
                  items={[
                    { label: 'Loại chi / Phương thức', value: `${expense.category ?? '—'} / ${expense.method ?? '—'}` },
                    { label: 'Ngân hàng / Số tài khoản', value: `${expense.bank ?? '—'} / ${expense.accountNumber ?? '—'}` },
                    { label: 'Kỳ / Khoản mục ngân sách', value: `${expense.period ?? '—'} / ${expense.budgetLine ?? '—'}` },
                    { label: 'Tên tài khoản', value: expense.accountName ?? '—' },
                  ]}
                />
              </SectionCard>

              <SectionCard title="Chứng từ đính kèm">
                {attachments.length === 0 ? (
                  <EmptyState variant="empty" compact title="Chưa có chứng từ" description="Hồ sơ này chưa đính kèm tệp nào." />
                ) : (
                  <Stack spacing={1.25}>
                    {attachments.map((file) => (
                      <AttachmentItem key={file.name} name={file.name} meta={file.meta} onDownload={() => showToast(`Đang tải ${file.name}`, 'info')} />
                    ))}
                  </Stack>
                )}
                {expense.accountantVerified && <StatusBadge label="Kế toán đã đối chiếu hồ sơ" tone="success" sx={{ mt: 2 }} />}
              </SectionCard>
            </>
          )}

          {tab === 'history' && (
            <SectionCard title="Lịch sử xử lý & phiên bản" subtitle="Ai · lúc nào · hành động · lý do">
              <DataTable
                columns={HISTORY_COLUMNS}
                rows={history}
                emptyState={<EmptyState compact title="Chưa có lịch sử" description="Hồ sơ chưa được gửi duyệt." />}
              />
              <Typography variant="caption" component="p" sx={{ mt: 2 }}>
                v1 là bản gửi đầu tiên, chưa có thay đổi. Mỗi quyết định gắn với đúng phiên bản được xem xét.
              </Typography>
            </SectionCard>
          )}

          {tab === 'versions' && (
            <SectionCard title="Phiên bản hồ sơ">
              <DescriptionList
                items={[
                  { label: 'Phiên bản hiện tại', value: `v${expense.version ?? 1}` },
                  { label: 'Tạo lúc', value: formatDateTime(expense.createdAt) },
                  { label: 'Số tiền', value: formatMoney(expense.amount) },
                  { label: 'Thay đổi so với bản trước', value: 'Không có' },
                ]}
              />
            </SectionCard>
          )}
        </Stack>

        <Stack spacing={3}>
          <SectionCard title="Tiến trình phê duyệt" subtitle="3 cấp duyệt, sau đó kế toán thanh toán">
            <ApprovalTimeline steps={buildSteps(expense)} />
          </SectionCard>
          <BudgetCard
            title="Ngân sách tại thời điểm gửi"
            {...MARKETING_BUDGET}
            alert={{
              tone: 'success',
              title: 'Trong hạn mức',
              message: `Yêu cầu ${formatMoney(expense.amount)}. Còn ${formatMoney(MARKETING_BUDGET.total - MARKETING_BUDGET.spent - MARKETING_BUDGET.committed - expense.amount)} nếu được duyệt.`,
            }}
          />
          {locked && (
            <AppAlert tone="info" title="Hồ sơ đang khóa chỉnh sửa">
              Bạn không thể sửa khi đang duyệt. Nếu có yêu cầu bổ sung, phiên bản gửi lại sẽ quay về trưởng phòng.
            </AppAlert>
          )}
        </Stack>
      </Box>
    </>
  )
}
