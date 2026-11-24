import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Plus } from 'lucide-react'
import {
  AppAlert,
  DataTable,
  EmptyState,
  FilterBar,
  FilterSelect,
  PageHeader,
  SearchInput,
  SectionCard,
  StatCard,
  StatGrid,
  StatusBadge,
  TablePaginationBar,
  TwoLineText,
} from '../components'
import { STATUS } from '../constants/status'
import {
  fetchMyExpenseStats,
  fetchMyExpenses,
  selectMyExpenseStats,
  selectMyExpenses,
  selectMyExpensesError,
  selectMyExpensesLoading,
  selectMyExpensesQuery,
  selectMyExpensesTotal,
  setExpensesQuery,
} from '../store/slices/expensesSlice'
import { formatDate, formatDateTime, formatMoney } from '../utils/format'
import Can from '../components/common/Can'
import { PERMS } from '../constants/permissions'

// Màn 08 · Yêu cầu chi của tôi (GET /expenses, /expenses/stats).
const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...['NHAP', 'CHO_TRUONG_PHONG', 'CHO_KE_TOAN', 'CHO_LANH_DAO', 'CAN_BO_SUNG', 'DA_DUYET', 'CHI_MOT_PHAN', 'DA_THANH_TOAN', 'TU_CHOI', 'HUY'].map(
    (code) => ({ value: code, label: STATUS[code].label }),
  ),
]

const buildColumns = (offset, rows) => [
  { key: 'stt', header: 'STT', width: 60, render: (r) => offset + rows.indexOf(r) + 1 },
  {
    key: 'code',
    header: 'Mã / Nội dung',
    render: (r) => <TwoLineText primary={r.version > 1 ? `${r.code} · v${r.version}` : r.code} secondary={r.purpose || 'Chưa nhập nội dung'} />,
  },
  { key: 'amount', header: 'Số tiền', align: 'right', width: 160, render: (r) => formatMoney(r.amount) },
  { key: 'status', header: 'Trạng thái', width: 170, render: (r) => <StatusBadge pill status={r.status} label={r.statusLabel} /> },
  { key: 'dueDate', header: 'Cần chi', width: 110, render: (r) => formatDate(r.dueDate) },
  { key: 'updatedAt', header: 'Cập nhật', width: 150, render: (r) => formatDateTime(r.updatedAt) },
]

export default function ExpenseListPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const rows = useSelector(selectMyExpenses)
  const total = useSelector(selectMyExpensesTotal)
  const query = useSelector(selectMyExpensesQuery)
  const loading = useSelector(selectMyExpensesLoading)
  const loadError = useSelector(selectMyExpensesError)
  const stats = useSelector(selectMyExpenseStats)
  const [search, setSearch] = useState(query.search)

  const reload = useCallback(() => dispatch(fetchMyExpenses(query)), [dispatch, query])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    dispatch(fetchMyExpenseStats())
  }, [dispatch])

  // Chờ người dùng gõ xong 300ms mới gọi API tìm kiếm
  useEffect(() => {
    if (search === query.search) return undefined
    const timer = setTimeout(() => dispatch(setExpensesQuery({ search })), 300)
    return () => clearTimeout(timer)
  }, [search, query.search, dispatch])

  return (
    <>
      <PageHeader
        eyebrow="08 / NHÂN VIÊN"
        title="Yêu cầu chi của tôi"
        description="Theo dõi từng hồ sơ chi đã tạo, bước duyệt hiện tại và tình trạng thanh toán."
        actions={
          <Can permission={PERMS.EXPENSE_CREATE}>
            <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate('/expenses/new')}>
              Tạo yêu cầu chi
            </Button>
          </Can>
        }
        tags={<StatusBadge label="Phạm vi cá nhân" tone="primary" />}
      />

      <StatGrid>
        <StatCard label="Tổng hồ sơ" value={stats.total.count} caption={`${formatMoney(stats.total.amount)} đề nghị · không tính hồ sơ hủy`} />
        <StatCard label="Đang xét duyệt" value={stats.inReview.count} tone="primary" caption={formatMoney(stats.inReview.amount)} />
        <StatCard label="Cần bổ sung" value={stats.needChanges.count} tone="warning" caption="Sửa và gửi lại, duyệt lại từ trưởng phòng" />
        <StatCard label="Hoàn thành chi" value={formatMoney(stats.paid.amount, { unit: false })} tone="success" caption="VND" />
      </StatGrid>

      <FilterBar search={<SearchInput value={search} onChange={setSearch} placeholder="Tìm theo mã, nội dung hoặc người thụ hưởng" />}>
        <FilterSelect value={query.status} options={STATUS_OPTIONS} onChange={(status) => dispatch(setExpensesQuery({ status }))} />
      </FilterBar>

      {loadError && (
        <AppAlert tone="danger" title="Không tải được danh sách yêu cầu chi" sx={{ mb: 2 }}>
          {loadError.message}{' '}
          <Button size="small" onClick={reload}>Thử lại</Button>
        </AppAlert>
      )}

      <SectionCard title="Danh sách yêu cầu" action={<Typography variant="caption">{total} hồ sơ</Typography>}>
        <DataTable
          columns={buildColumns((query.page - 1) * query.limit, rows)}
          rows={rows}
          loading={loading && rows.length === 0}
          onRowClick={(r) => navigate(`/expenses/${r.code}`)}
          minWidth={760}
          emptyState={<EmptyState variant={query.search || query.status ? 'no-results' : 'empty'} compact />}
        />
        {total > 0 && (
          <TablePaginationBar
            page={query.page}
            pageSize={query.limit}
            total={total}
            onPageChange={(page) => dispatch(setExpensesQuery({ page }))}
            itemLabel="hồ sơ"
          />
        )}
      </SectionCard>
    </>
  )
}
