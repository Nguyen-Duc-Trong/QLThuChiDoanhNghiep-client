import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { RefreshCw } from 'lucide-react'
import {
  AppAlert,
  ApprovalDecision,
  DecisionDialog,
  DescriptionList,
  EmptyState,
  FilterBar,
  FilterSelect,
  PageHeader,
  SearchInput,
  SectionCard,
  StatusBadge,
} from '../../components'
import { colors, radius } from '../../theme/tokens'
import { buildExpenseHistory } from '../../utils/approvalSteps'
import { formatDate, formatDateTime, formatMoney } from '../../utils/format'
import useDecision from './useDecision'

// Màn 11 · Phê duyệt cấp phòng: hàng chờ bên trái, hồ sơ đang xem bên phải (dữ liệu thật từ /approvals/queue, /expenses/:mã).
const DUE_OPTIONS = [
  { value: '', label: 'Cần chi: tất cả' },
  { value: '7', label: 'Cần chi: 7 ngày tới' },
  { value: '3', label: 'Cần chi: 3 ngày tới' },
]
const daysUntil = (date) => (date ? Math.round((new Date(date) - new Date(new Date().toDateString())) / 86_400_000) : Infinity)

function QueueItem({ item, active, onClick }) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        borderRadius: `${radius.md}px`,
        p: active ? 1.75 : 0,
        py: active ? 1.75 : 1,
        bgcolor: active ? colors.primarySoft : 'transparent',
      }}
    >
      {active && <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.primary, mb: 1 }}>Đang xem</Typography>}
      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
        {item.code}{item.version > 1 ? ` · v${item.version}` : ''} · {item.purpose}
      </Typography>
      <Typography variant="caption" component="p" sx={{ mt: 0.5, color: active ? colors.text : undefined }}>
        {item.requesterName} · {formatMoney(item.amount)}
      </Typography>
      {active && (
        <Typography variant="caption" component="p" sx={{ mt: 0.75, color: colors.textMuted }}>
          Cần chi {formatDate(item.dueDate)} · Gửi {formatDateTime(item.submittedAt)}
          {item.actingForName && ` · Duyệt thay ${item.actingForName}`}
        </Typography>
      )}
    </ButtonBase>
  )
}

/** queue: hồ sơ bước DEPT trong hàng chờ của tôi · request: hồ sơ đang xem (null khi chưa chọn / hàng chờ trống) */
export default function DepartmentApprovalPage({ queue, request, loading, onReload }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [due, setDue] = useState('')
  const [requester, setRequester] = useState('')
  const { decision, setDecision, confirm, deciding } = useDecision(request)

  const requesterOptions = [
    { value: '', label: 'Người tạo' },
    ...[...new Set(queue.map((r) => r.requesterName).filter(Boolean))].map((r) => ({ value: r, label: r })),
  ]
  const departments = [...new Set(queue.map((r) => r.departmentName).filter(Boolean))]

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return queue.filter(
      (r) =>
        (!due || daysUntil(r.dueDate) <= Number(due)) &&
        (!requester || r.requesterName === requester) &&
        (!keyword || `${r.code} ${r.purpose ?? ''} ${r.requesterName ?? ''}`.toLowerCase().includes(keyword)),
    )
  }, [queue, search, due, requester])

  const line = request?.budgetLine
  const after = line && request ? line.availableAmount - (request.amount ?? 0) : 0
  const history = request ? buildExpenseHistory(request) : []

  return (
    <>
      <PageHeader
        eyebrow="11 / TRƯỞNG PHÒNG"
        title="Phê duyệt cấp phòng"
        description={`${departments.join(', ') || 'Phòng ban của bạn'} · ${queue.length} yêu cầu đang chờ đúng bước của bạn.`}
        actions={
          <Button variant="outlined" startIcon={<RefreshCw size={16} />} onClick={onReload}>
            Làm mới hàng chờ
          </Button>
        }
      />

      <FilterBar search={<SearchInput value={search} onChange={setSearch} placeholder="Tìm yêu cầu, người tạo..." width="100%" sx={{ flex: 1 }} />}>
        <FilterSelect value={due} options={DUE_OPTIONS} onChange={setDue} />
        <FilterSelect value={requester} options={requesterOptions} onChange={setRequester} />
      </FilterBar>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '350px minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
        <Stack spacing={2}>
          <SectionCard title={`Chờ bạn duyệt (${filtered.length})`}>
            {loading && queue.length === 0 ? (
              <EmptyState compact variant="loading" />
            ) : filtered.length === 0 ? (
              <EmptyState compact variant={search || requester || due ? 'no-results' : 'empty'} title="Không còn hồ sơ chờ duyệt" />
            ) : (
              <Stack spacing={1}>
                {filtered.map((item) => (
                  <QueueItem key={item.id} item={item} active={item.id === request?.id} onClick={() => navigate(`/approvals/${item.code}`)} />
                ))}
              </Stack>
            )}
          </SectionCard>
          <AppAlert tone="info" title="Chỉ hàng chờ đúng cấp">
            Hồ sơ đã xử lý không còn trong hàng chờ. Hồ sơ do bạn tạo do người phụ trách duyệt hoặc người được ủy quyền xử lý.
          </AppAlert>
        </Stack>

        {request ? (
          <Stack spacing={3}>
            <SectionCard
              title={`${request.code} · ${request.purpose ?? ''}`}
              subtitle={`Phiên bản v${request.version}${request.workflow.actingForName ? ` · Bạn duyệt thay ${request.workflow.actingForName}` : ''}`}
              action={<StatusBadge status={request.status} label={request.statusLabel} />}
            >
              <DescriptionList
                columns={3}
                items={[
                  { label: 'Người đề nghị', value: `${request.requesterName ?? '—'} · ${request.departmentName ?? ''}` },
                  { label: 'Số tiền', value: formatMoney(request.amount) },
                  { label: 'Cần chi', value: formatDate(request.dueDate) },
                ]}
              />
              <Box sx={{ mt: 2.5 }}>
                <DescriptionList
                  items={[
                    { label: 'Loại chi / Khoản mục', value: `${request.categoryName ?? '—'} / ${line ? `${line.label} · ${line.periodName}` : '—'}` },
                    { label: 'Người thụ hưởng', value: request.beneficiaryName ?? '—' },
                    {
                      label: 'Phương thức / Tài khoản',
                      value:
                        request.paymentMethod === 'TIEN_MAT'
                          ? 'Tiền mặt'
                          : `${request.beneficiaryBankName ?? '—'} · ${request.beneficiaryAccountNumber ?? '—'}`,
                    },
                    { label: 'Ghi chú', value: request.note || '—' },
                  ]}
                />
              </Box>
            </SectionCard>

            {line && (
              <SectionCard title="Kiểm tra ngân sách">
                <DescriptionList
                  columns={3}
                  items={[
                    { label: 'Khả dụng trước yêu cầu', value: formatMoney(line.availableAmount) },
                    { label: 'Yêu cầu', value: formatMoney(request.amount) },
                    { label: 'Khả dụng sau dự kiến', value: formatMoney(after) },
                  ]}
                />
                <AppAlert tone={after >= 0 ? 'success' : 'danger'} title={after >= 0 ? 'Trong hạn mức' : 'Vượt hạn mức'} sx={{ mt: 2.5 }}>
                  {after >= 0
                    ? 'Chưa phát sinh cam kết cho tới khi lãnh đạo duyệt cuối. Kế toán sẽ kiểm tra lại trước khi chuyển lãnh đạo.'
                    : `Yêu cầu vượt khả dụng ${formatMoney(-after)}. Duyệt cuối sẽ bị chặn nếu ngân sách không được điều chỉnh.`}
                </AppAlert>
              </SectionCard>
            )}

            {history.length > 0 && (
              <SectionCard title="Lịch sử xử lý">
                <Stack spacing={1}>
                  {history.map((row) => (
                    <Typography key={row.id} variant="body2" color="text.secondary">
                      {row.time} · <strong>{row.actor}</strong> · {row.action}
                    </Typography>
                  ))}
                </Stack>
              </SectionCard>
            )}

            <ApprovalDecision
              title="Quyết định của trưởng phòng"
              onReject={() => setDecision('reject')}
              onRequestChanges={() => setDecision('changes')}
              onApprove={() => setDecision('approve')}
              disabled={deciding}
              description="Phê duyệt chuyển kế toán thẩm định. Yêu cầu bổ sung phải có lý do và trường cần sửa; từ chối phải có lý do."
            />
          </Stack>
        ) : (
          <SectionCard>
            {queue.length > 0 || loading ? (
              <EmptyState variant="loading" />
            ) : (
              <EmptyState title="Đã xử lý hết hàng chờ" description="Không còn hồ sơ nào chờ bạn duyệt cấp phòng." />
            )}
          </SectionCard>
        )}
      </Box>

      <DecisionDialog
        type={decision}
        subject={request && `${request.code} · ${request.purpose ?? ''} · ${formatMoney(request.amount)}`}
        loading={deciding}
        onClose={() => !deciding && setDecision(null)}
        onConfirm={(value) => confirm(value)}
      />
    </>
  )
}
