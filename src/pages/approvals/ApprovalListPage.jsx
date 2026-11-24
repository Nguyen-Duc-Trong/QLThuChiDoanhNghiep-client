import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { RefreshCw } from 'lucide-react'
import {
  AppAlert,
  CustomTab,
  DataTable,
  EmptyState,
  FilterBar,
  FilterSelect,
  PageHeader,
  SearchInput,
  SectionCard,
  StatusBadge,
  TablePaginationBar,
} from '../../components'
import { STATUS } from '../../constants/status'
import {
  fetchApprovalList,
  selectApprovalList,
  selectApprovalListError,
  selectApprovalListLoading,
  selectApprovalListQuery,
  selectApprovalListTotal,
  setApprovalListQuery,
} from '../../store/slices/approvalsSlice'
import { selectApprovalCount } from '../../store/slices/notificationsSlice'
import useOnChange from '../../hooks/useOnChange'
import { formatDate, formatDateTime, formatMoney } from '../../utils/format'

// Danh sách phê duyệt (màn 11–13): mọi hồ sơ trong phạm vi được xem, đủ trạng thái.
// Dòng in đậm = đang chờ bạn quyết định (luôn ở đầu danh sách); bấm vào để duyệt. Dòng khác mở chi tiết hồ sơ.
const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...['CHO_TRUONG_PHONG', 'CHO_KE_TOAN', 'CHO_LANH_DAO', 'CAN_BO_SUNG', 'DA_DUYET', 'DA_THANH_TOAN', 'TU_CHOI', 'HUY'].map((code) => ({
    value: code,
    label: STATUS[code].label,
  })),
]

const EMPTY_TITLES = { awaiting: 'Không có hồ sơ chờ bạn duyệt', approved: 'Bạn chưa phê duyệt hồ sơ nào' }

const AWAITING_ROW_SX = { '& td': { fontWeight: 700 } }

export default function ApprovalListPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const rows = useSelector(selectApprovalList)
  const total = useSelector(selectApprovalListTotal)
  const query = useSelector(selectApprovalListQuery)
  const loading = useSelector(selectApprovalListLoading)
  const loadError = useSelector(selectApprovalListError)
  const awaitingCount = useSelector(selectApprovalCount)
  const [search, setSearch] = useState(query.search)

  const reload = useCallback(() => dispatch(fetchApprovalList(query)), [dispatch, query])

  useEffect(() => {
    reload()
  }, [reload])

  // Server báo số hồ sơ chờ tôi vừa đổi (hồ sơ mới / người khác đã xử lý) → tải lại để thấy trạng thái mới
  useOnChange(awaitingCount, reload)

  // Chờ người dùng gõ xong 300ms mới gọi API tìm kiếm
  useEffect(() => {
    if (search === query.search) return undefined
    const timer = setTimeout(() => dispatch(setApprovalListQuery({ search })), 300)
    return () => clearTimeout(timer)
  }, [search, query.search, dispatch])

  const open = (r) => navigate(r.awaitingMe ? `/approvals/${r.code}` : `/expenses/${r.code}`)
  const offset = (query.page - 1) * query.limit

  const columns = [
    { key: 'stt', header: 'STT', width: 60, render: (r) => offset + rows.indexOf(r) + 1 },
    { key: 'code', header: 'Mã yêu cầu', width: 170, render: (r) => `${r.code}${r.version > 1 ? ` · v${r.version}` : ''}` },
    {
      key: 'purpose',
      header: 'Nội dung',
      render: (r) => (
        <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit', display: 'block', maxWidth: 320 }} noWrap>
          {r.purpose || '—'}
        </Typography>
      ),
    },
    { key: 'requester', header: 'Người tạo', width: 150, render: (r) => r.requesterName ?? '—' },
    { key: 'department', header: 'Phòng ban', width: 160, render: (r) => r.departmentName ?? '—' },
    { key: 'amount', header: 'Số tiền (VND)', align: 'right', width: 140, render: (r) => formatMoney(r.amount, { unit: false }) },
    query.view === 'approved'
      ? {
          key: 'myApprovedAt',
          header: 'Bạn duyệt lúc',
          width: 170,
          render: (r) => (
            <>
              {formatDateTime(r.myApprovedAt)}
              {r.myApprovedStepLabel && (
                <Typography variant="caption" component="span" sx={{ display: 'block' }}>{r.myApprovedStepLabel}</Typography>
              )}
            </>
          ),
        }
      : { key: 'dueDate', header: 'Cần chi', width: 110, render: (r) => formatDate(r.dueDate) },
    {
      key: 'status',
      header: 'Trạng thái',
      width: 190,
      render: (r) =>
        r.awaitingMe ? (
          <StatusBadge pill tone="warning" label={r.actingForName ? `Chờ bạn duyệt (thay ${r.actingForName})` : 'Chờ bạn duyệt'} />
        ) : (
          <StatusBadge pill status={r.status} label={r.statusLabel} />
        ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="11–13 / PHÊ DUYỆT"
        title="Danh sách phê duyệt"
        description="Mọi yêu cầu chi trong phạm vi bạn được xem, kể cả đã duyệt, đã chi hoặc bị từ chối. Dòng in đậm đang chờ bạn quyết định."
        actions={
          <Button variant="outlined" startIcon={<RefreshCw size={16} />} onClick={reload}>
            Làm mới
          </Button>
        }
      />

      <CustomTab
        value={query.view}
        onChange={(view) => dispatch(setApprovalListQuery({ view }))}
        sx={{ mb: 2 }}
        tabs={[
          { value: 'all', label: 'Tất cả' },
          { value: 'awaiting', label: 'Chờ tôi duyệt', count: awaitingCount },
          { value: 'approved', label: 'Đã phê duyệt' },
        ]}
      />

      <FilterBar search={<SearchInput value={search} onChange={setSearch} placeholder="Tìm mã, nội dung, người tạo hoặc người thụ hưởng" width="100%" sx={{ flex: 1 }} />}>
        <FilterSelect value={query.status} options={STATUS_OPTIONS} onChange={(status) => dispatch(setApprovalListQuery({ status }))} />
      </FilterBar>

      {loadError && (
        <AppAlert tone="danger" title="Không tải được danh sách phê duyệt" sx={{ mb: 2 }}>
          {loadError.message}{' '}
          <Button size="small" onClick={reload}>Thử lại</Button>
        </AppAlert>
      )}

      <SectionCard title="Yêu cầu chi" action={<Typography variant="caption">{total} hồ sơ</Typography>} sx={{ mb: 3 }}>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading && rows.length === 0}
          onRowClick={open}
          getRowSx={(r) => (r.awaitingMe ? AWAITING_ROW_SX : undefined)}
          minWidth={1100}
          emptyState={
            <EmptyState
              compact
              variant={query.search || query.status ? 'no-results' : 'empty'}
              title={EMPTY_TITLES[query.view]}
            />
          }
        />
        {total > 0 && (
          <TablePaginationBar
            page={query.page}
            pageSize={query.limit}
            total={total}
            onPageChange={(page) => dispatch(setApprovalListQuery({ page }))}
            itemLabel="hồ sơ"
          />
        )}
      </SectionCard>

      <AppAlert tone="info" title="Không tự duyệt · Phê duyệt không phải là thanh toán">
        Hồ sơ do bạn tạo không bao giờ chờ bạn duyệt. Sau khi lãnh đạo duyệt cuối, kế toán mới thực hiện chi.
      </AppAlert>
    </>
  )
}
