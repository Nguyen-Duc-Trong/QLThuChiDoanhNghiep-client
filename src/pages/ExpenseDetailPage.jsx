import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Ban, Pencil } from 'lucide-react'
import {
  AppAlert,
  ApprovalTimeline,
  BudgetCard,
  ConfirmDialog,
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
} from '../components'
import {
  cancelExpense,
  fetchExpenseDetail,
  selectExpenseDetail,
  selectExpenseDetailError,
  selectExpenseSaving,
} from '../store/slices/expensesSlice'
import { buildExpenseHistory, buildExpenseTimeline, diffSnapshots, latestChangeRequest, snapshotText } from '../utils/approvalSteps'
import { formatDate, formatDateTime, formatMoney } from '../utils/format'

// Màn 10 · Chi tiết hồ sơ chi (GET /expenses/:mã). Người tạo, người duyệt, kế toán, lãnh đạo đều dùng màn này để xem.
const HISTORY_COLUMNS = [
  { key: 'time', header: 'Thời gian', width: 160 },
  { key: 'actor', header: 'Người thực hiện', width: 200 },
  { key: 'action', header: 'Hành động / Lý do' },
]
const DIFF_COLUMNS = [
  { key: 'label', header: 'Trường dữ liệu', width: 180 },
  { key: 'beforeText', header: 'Trước' },
  { key: 'afterText', header: 'Sau' },
]

const versionDiffRows = (before, after) =>
  diffSnapshots(before, after).map((row) => ({
    id: row.key,
    label: row.label,
    beforeText: snapshotText(row, row.before),
    afterText: snapshotText(row, row.after),
  }))

export default function ExpenseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const showToast = useToast()
  const loaded = useSelector(selectExpenseDetail)
  const loadError = useSelector(selectExpenseDetailError)
  const saving = useSelector(selectExpenseSaving)
  const [tab, setTab] = useState('profile')
  const [cancelOpen, setCancelOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchExpenseDetail(id))
  }, [dispatch, id])

  // Detail trong store có thể là hồ sơ khác (vừa mở trước đó) → chỉ dùng khi đúng mã / id
  const expense = loaded && (loaded.code === id.toUpperCase() || loaded.id === id) ? loaded : null

  if (loadError && !expense) {
    return (
      <EmptyState
        variant={loadError.response?.status === 403 ? 'no-permission' : 'no-results'}
        title={loadError.response?.status === 403 ? 'Bạn không có quyền xem hồ sơ này' : `Không tìm thấy hồ sơ ${id}`}
        description={loadError.message}
        action={<Button variant="outlined" onClick={() => navigate('/expenses')}>Về danh sách yêu cầu</Button>}
      />
    )
  }
  if (!expense) return <EmptyState variant="loading" />

  const line = expense.budgetLine
  const history = buildExpenseHistory(expense)
  const changeRequest = expense.status === 'CAN_BO_SUNG' ? latestChangeRequest(expense) : null
  const rejection = expense.status === 'TU_CHOI' ? [...expense.approvals].reverse().find((r) => r.decision === 'TU_CHOI') : null
  const locked = ['CHO_TRUONG_PHONG', 'CHO_KE_TOAN', 'CHO_LANH_DAO'].includes(expense.status)
  const isPending = ['NHAP', 'CHO_TRUONG_PHONG', 'CHO_KE_TOAN', 'CHO_LANH_DAO', 'CAN_BO_SUNG'].includes(expense.status)
  const afterApproval = line ? line.availableAmount - (isPending ? (expense.amount ?? 0) : 0) : 0

  const confirmCancel = async () => {
    try {
      await dispatch(cancelExpense(expense.id)).unwrap()
      showToast(`Đã hủy yêu cầu ${expense.code}`, 'success')
      setCancelOpen(false)
      dispatch(fetchExpenseDetail(id))
    } catch (error) {
      showToast(error?.message || 'Hủy yêu cầu thất bại', 'error', TOAST_OPTIONS.fromError(error))
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="10 / CHI TIẾT HỒ SƠ"
        title={`${expense.code} · ${expense.purpose || 'Chưa nhập nội dung'}`}
        description={[
          `Phiên bản v${expense.version}`,
          expense.submittedAt ? `Gửi lúc ${formatDateTime(expense.submittedAt)}` : `Tạo lúc ${formatDateTime(expense.createdAt)}`,
          expense.projectName && `Dự án ${expense.projectName}`,
        ]
          .filter(Boolean)
          .join(' · ')}
        actions={
          <>
            {expense.workflow?.canDecide && (
              <Button variant="contained" onClick={() => navigate(`/approvals/${expense.code}`)}>Xem xét & quyết định</Button>
            )}
            {expense.canEdit && expense.status === 'CAN_BO_SUNG' && (
              <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => navigate(`/expenses/${expense.code}/resubmit`)}>
                Bổ sung hồ sơ
              </Button>
            )}
            {expense.canEdit && expense.status === 'NHAP' && (
              <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => navigate(`/expenses/${expense.code}/edit`)}>
                Tiếp tục chỉnh sửa
              </Button>
            )}
            {expense.canCancel && (
              <Button variant="outlined" color="error" startIcon={<Ban size={16} />} onClick={() => setCancelOpen(true)}>
                Hủy yêu cầu
              </Button>
            )}
          </>
        }
        tags={<StatusBadge status={expense.status} label={expense.statusLabel} />}
      />

      {changeRequest && (
        <AppAlert tone="warning" title={`${changeRequest.actorName} yêu cầu bổ sung · ${formatDateTime(changeRequest.createdAt)}`} sx={{ mb: 3 }}>
          {changeRequest.note}
          {changeRequest.fields?.length > 0 && ` · Cần sửa: ${changeRequest.fields.join(', ')}`}
        </AppAlert>
      )}
      {rejection && (
        <AppAlert tone="danger" title={`${rejection.actorName} đã từ chối ở bước ${rejection.stepLabel.toLowerCase()}`} sx={{ mb: 3 }}>
          {rejection.note}
        </AppAlert>
      )}

      <SummaryBar
        items={[
          { label: 'Người tạo / Phòng ban', value: `${expense.requesterName ?? '—'} / ${expense.departmentName ?? '—'}` },
          { label: 'Số tiền đề nghị', value: formatMoney(expense.amount) },
          { label: 'Ngày cần chi', value: formatDate(expense.dueDate) },
          { label: 'Người thụ hưởng', value: expense.beneficiaryName ?? '—' },
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
              { value: 'versions', label: 'Phiên bản', count: expense.versions.length },
            ]}
          />

          {tab === 'profile' && (
            <SectionCard title="Mục đích & người thụ hưởng">
              {expense.purpose && <Typography sx={{ mb: 2.5 }}>{expense.purpose}</Typography>}
              <DescriptionList
                items={[
                  { label: 'Loại chi / Phương thức', value: `${expense.categoryName ?? '—'} / ${expense.paymentMethodLabel}` },
                  {
                    label: 'Ngân hàng / Số tài khoản',
                    value: expense.paymentMethod === 'TIEN_MAT' ? 'Chi tiền mặt' : `${expense.beneficiaryBankName ?? '—'} / ${expense.beneficiaryAccountNumber ?? '—'}`,
                  },
                  { label: 'Kỳ / Khoản mục ngân sách', value: line ? `${line.periodName} / ${line.label}` : '—' },
                  { label: 'Tên tài khoản', value: expense.beneficiaryAccountName ?? '—' },
                  { label: 'Ghi chú', value: expense.note || '—' },
                ]}
              />
            </SectionCard>
          )}

          {tab === 'history' && (
            <SectionCard title="Lịch sử xử lý" subtitle="Ai · lúc nào · hành động · lý do. Mỗi quyết định gắn với đúng phiên bản được xem xét.">
              <DataTable
                columns={HISTORY_COLUMNS}
                rows={history}
                emptyState={<EmptyState compact title="Chưa có lịch sử" description="Hồ sơ chưa được gửi duyệt." />}
              />
            </SectionCard>
          )}

          {tab === 'versions' &&
            (expense.versions.length === 0 ? (
              <SectionCard title="Phiên bản hồ sơ">
                <EmptyState compact title="Chưa có phiên bản" description="Phiên bản v1 được tạo khi gửi duyệt lần đầu." />
              </SectionCard>
            ) : (
              [...expense.versions].reverse().map((v, index, list) => {
                const previous = list[index + 1]
                const rows = previous ? versionDiffRows(previous.snapshot, v.snapshot) : []
                return (
                  <SectionCard
                    key={v.version}
                    title={`Phiên bản v${v.version}${v.version === expense.version ? ' · hiện tại' : ''}`}
                    subtitle={`Gửi ${formatDateTime(v.submittedAt)} · ${v.submittedByName ?? '—'} · ${formatMoney(v.snapshot.amount)}`}
                  >
                    {previous ? (
                      rows.length > 0 ? (
                        <DataTable columns={DIFF_COLUMNS} rows={rows} minWidth={520} />
                      ) : (
                        <Typography variant="body2" color="text.secondary">Không có thay đổi so với v{previous.version}.</Typography>
                      )
                    ) : (
                      <Typography variant="body2" color="text.secondary">Bản gửi đầu tiên.</Typography>
                    )}
                  </SectionCard>
                )
              })
            ))}
        </Stack>

        <Stack spacing={3}>
          <SectionCard title="Tiến trình phê duyệt" subtitle="3 cấp duyệt, sau đó kế toán thanh toán">
            <ApprovalTimeline steps={buildExpenseTimeline(expense)} />
          </SectionCard>
          {line && (
            <BudgetCard
              title="Ngân sách khoản mục"
              scope={`${line.label} · ${line.periodName}`}
              total={line.plannedAmount}
              spent={line.spentAmount}
              committed={line.committedAmount}
              alert={
                isPending && expense.amount
                  ? afterApproval >= 0
                    ? { tone: 'success', title: 'Trong hạn mức', message: `Yêu cầu ${formatMoney(expense.amount)}. Còn ${formatMoney(afterApproval)} nếu được duyệt.` }
                    : { tone: 'danger', title: 'Vượt ngân sách khả dụng', message: `Khả dụng hiện chỉ còn ${formatMoney(line.availableAmount)}.` }
                  : undefined
              }
            />
          )}
          {locked && (
            <AppAlert tone="info" title="Hồ sơ đang khóa chỉnh sửa">
              Không thể sửa khi đang duyệt. Nếu có yêu cầu bổ sung, phiên bản gửi lại sẽ quay về trưởng phòng.
            </AppAlert>
          )}
        </Stack>
      </Box>

      <ConfirmDialog
        open={cancelOpen}
        icon={Ban}
        tone="danger"
        title="Hủy yêu cầu chi?"
        description={`${expense.code} sẽ chuyển sang trạng thái Hủy, không gửi duyệt được nữa và không tính vào ngân sách.`}
        confirmLabel="Hủy yêu cầu"
        cancelLabel="Đóng"
        loading={saving}
        onClose={() => !saving && setCancelOpen(false)}
        onConfirm={confirmCancel}
      />
    </>
  )
}
