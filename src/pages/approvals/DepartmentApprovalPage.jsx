import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { RefreshCw, SlidersHorizontal } from 'lucide-react'
import {
  AppAlert,
  ApprovalDecision,
  AttachmentItem,
  DecisionDialog,
  DescriptionList,
  EmptyState,
  FilterBar,
  FilterSelect,
  PageHeader,
  SearchInput,
  SectionCard,
  StatusBadge,
  useToast,
} from '../../components'
import { DEPARTMENT_AVAILABLE, DEPARTMENT_QUEUE } from '../../mocks/approvals'
import { colors, radius } from '../../theme/tokens'
import { formatDate, formatMoney } from '../../utils/format'

// Màn 11 · Phê duyệt cấp phòng (trưởng phòng): hàng chờ bên trái, hồ sơ đang xem bên phải.
const TODAY = '2026-10-22'
const DUE_OPTIONS = [
  { value: '7', label: 'Cần chi: 7 ngày tới' },
  { value: '3', label: 'Cần chi: 3 ngày tới' },
  { value: '', label: 'Cần chi: tất cả' },
]
const daysUntil = (date) => Math.round((new Date(date) - new Date(TODAY)) / 86_400_000)

const DECISION_TOAST = {
  approve: (id) => [`Đã duyệt ${id}, hồ sơ chuyển kế toán thẩm định`, 'success'],
  changes: (id) => [`Đã gửi yêu cầu bổ sung ${id} cho người tạo`, 'warning'],
  reject: (id) => [`Đã từ chối ${id}`, 'error'],
}

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
      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{item.id} · {item.title}</Typography>
      <Typography variant="caption" component="p" sx={{ mt: 0.5, color: active ? colors.text : undefined }}>
        {item.requester} · {formatMoney(item.amount)}
      </Typography>
      {active && (
        <Typography variant="caption" component="p" sx={{ mt: 0.75, color: colors.textMuted }}>
          Cần chi {formatDate(item.dueDate)} · Gửi {item.submittedAt}
        </Typography>
      )}
    </ButtonBase>
  )
}

export default function DepartmentApprovalPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const [queue, setQueue] = useState(DEPARTMENT_QUEUE)
  const [search, setSearch] = useState('')
  const [due, setDue] = useState('7')
  const [requester, setRequester] = useState('')
  const [decision, setDecision] = useState(null)

  const requesterOptions = [{ value: '', label: 'Người tạo' }, ...[...new Set(DEPARTMENT_QUEUE.map((r) => r.requester))].map((r) => ({ value: r, label: r }))]

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return queue.filter(
      (r) =>
        (!due || daysUntil(r.dueDate) <= Number(due)) &&
        (!requester || r.requester === requester) &&
        (!keyword || `${r.id} ${r.title} ${r.requester}`.toLowerCase().includes(keyword)),
    )
  }, [queue, search, due, requester])

  const current = filtered.find((r) => r.id === id) ?? filtered[0]
  const after = current ? DEPARTMENT_AVAILABLE - current.amount : 0

  const confirmDecision = ({ type }) => {
    const index = filtered.findIndex((r) => r.id === current.id)
    const next = filtered[index + 1] ?? filtered[index - 1]
    setQueue((prev) => prev.filter((r) => r.id !== current.id))
    setDecision(null)
    showToast(...DECISION_TOAST[type](current.id))
    navigate(next ? `/approvals/${next.id}` : '/approvals', { replace: true })
  }

  return (
    <>
      <PageHeader
        eyebrow="11 / TRƯỞNG PHÒNG"
        title="Phê duyệt cấp phòng"
        description={`Phòng Marketing · ${queue.length} yêu cầu đang chờ đúng bước của bạn.`}
        actions={
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} />}
            onClick={() => {
              setQueue(DEPARTMENT_QUEUE)
              showToast('Đã làm mới hàng chờ', 'info')
            }}
          >
            Làm mới hàng chờ
          </Button>
        }
      />

      <FilterBar search={<SearchInput value={search} onChange={setSearch} placeholder="Tìm yêu cầu, người tạo trong phòng Marketing..." width="100%" sx={{ flex: 1 }} />}>
        <FilterSelect value={due} options={DUE_OPTIONS} onChange={setDue} />
        <FilterSelect value={requester} options={requesterOptions} onChange={setRequester} />
        <Button variant="outlined" startIcon={<SlidersHorizontal size={16} />} onClick={() => showToast('Bộ lọc nâng cao sẽ có khi nối API', 'info')}>
          Bộ lọc
        </Button>
      </FilterBar>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '350px minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
        <Stack spacing={2}>
          <SectionCard title={`Chờ bạn duyệt (${filtered.length})`}>
            {filtered.length === 0 ? (
              <EmptyState compact variant={search || requester ? 'no-results' : 'empty'} title="Không còn hồ sơ chờ duyệt" />
            ) : (
              <Stack spacing={1}>
                {filtered.map((item) => (
                  <QueueItem key={item.id} item={item} active={item.id === current?.id} onClick={() => navigate(`/approvals/${item.id}`)} />
                ))}
              </Stack>
            )}
          </SectionCard>
          <AppAlert tone="info" title="Chỉ hàng chờ đúng cấp">
            Hồ sơ trưởng phòng đã xử lý không nằm trong hàng chờ. Hồ sơ do bạn tạo phải do người thay thế có ủy quyền duyệt.
          </AppAlert>
        </Stack>

        {current ? (
          <Stack spacing={3}>
            <SectionCard title={`${current.id} · ${current.title}`} action={<StatusBadge status="CHO_TRUONG_PHONG" />}>
              <DescriptionList
                columns={3}
                items={[
                  { label: 'Người đề nghị', value: current.requester },
                  { label: 'Số tiền', value: formatMoney(current.amount) },
                  { label: 'Cần chi', value: formatDate(current.dueDate) },
                ]}
              />
              <Typography sx={{ my: 2.5 }}>{current.purpose}</Typography>
              <DescriptionList
                items={[
                  { label: 'Khoản mục / Kỳ', value: current.budgetLine },
                  { label: 'Người thụ hưởng', value: current.beneficiary },
                ]}
              />
            </SectionCard>

            <SectionCard title="Kiểm tra ngân sách">
              <DescriptionList
                columns={3}
                items={[
                  { label: 'Khả dụng trước yêu cầu', value: formatMoney(DEPARTMENT_AVAILABLE) },
                  { label: 'Yêu cầu', value: formatMoney(current.amount) },
                  { label: 'Khả dụng sau dự kiến', value: formatMoney(after) },
                ]}
              />
              <AppAlert tone={after >= 0 ? 'success' : 'danger'} title={after >= 0 ? 'Trong hạn mức' : 'Vượt hạn mức'} sx={{ mt: 2.5 }}>
                {after >= 0
                  ? 'Chưa phát sinh cam kết cho tới khi hồ sơ đủ phê duyệt. Kế toán sẽ kiểm tra lại trước khi chuyển lãnh đạo.'
                  : `Yêu cầu vượt khả dụng ${formatMoney(-after)}. Cần điều chỉnh ngân sách trước khi duyệt.`}
              </AppAlert>
            </SectionCard>

            <SectionCard title="Chứng từ & lịch sử">
              <Stack spacing={1.25}>
                {current.attachments.map((file) => (
                  <AttachmentItem key={file.name} name={file.name} meta={file.meta} onDownload={() => showToast(`Đang tải ${file.name}`, 'info')} />
                ))}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5 }}>{current.history}</Typography>
            </SectionCard>

            <ApprovalDecision
              title="Quyết định của trưởng phòng"
              onReject={() => setDecision('reject')}
              onRequestChanges={() => setDecision('changes')}
              onApprove={() => setDecision('approve')}
              description="Phê duyệt chuyển kế toán thẩm định. Yêu cầu bổ sung phải có lý do và trường cần sửa; từ chối phải có lý do."
            />
          </Stack>
        ) : (
          <SectionCard>
            <EmptyState title="Đã xử lý hết hàng chờ" description="Không còn hồ sơ nào chờ trưởng phòng duyệt." />
          </SectionCard>
        )}
      </Box>

      <DecisionDialog
        type={decision}
        subject={current && `${current.id} · ${current.title} · ${formatMoney(current.amount)}`}
        onClose={() => setDecision(null)}
        onConfirm={confirmDecision}
      />
    </>
  )
}
