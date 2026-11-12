import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Plus } from 'lucide-react'
import {
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
} from '../components'
import { EXPENSE_COLUMNS } from '../constants/expenseColumns'
import { STATUS } from '../constants/status'
import { EXPENSES } from '../mocks/data'
import { formatDateTime, formatMoney } from '../utils/format'

// Màn 08 · Yêu cầu chi của tôi.
const PAGE_SIZE = 5
const IN_REVIEW = ['CHO_TRUONG_PHONG', 'CHO_KE_TOAN', 'CHO_LANH_DAO']

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...['NHAP', ...IN_REVIEW, 'CAN_BO_SUNG', 'DA_THANH_TOAN', 'TU_CHOI'].map((code) => ({ value: code, label: STATUS[code].label })),
]

const COLUMNS = [
  ...EXPENSE_COLUMNS,
  { key: 'createdAt', header: 'Ngày tạo', render: (r) => formatDateTime(r.createdAt) },
]

export default function ExpenseListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return EXPENSES.filter(
      (e) =>
        (!status || e.status === status) &&
        (!keyword || e.id.toLowerCase().includes(keyword) || e.title.toLowerCase().includes(keyword)),
    )
  }, [search, status])

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const sumBy = (predicate) => EXPENSES.filter(predicate).reduce((total, e) => total + e.amount, 0)

  const resetPage = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  return (
    <>
      <PageHeader
        eyebrow="08 / NHÂN VIÊN"
        title="Yêu cầu chi của tôi"
        description="Theo dõi từng hồ sơ chi đã tạo, bước duyệt hiện tại và tình trạng thanh toán."
        actions={
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate('/expenses/new')}>
            Tạo yêu cầu chi
          </Button>
        }
        tags={<StatusBadge label="Phạm vi cá nhân" tone="primary" />}
      />

      <StatGrid>
        <StatCard label="Tổng hồ sơ" value={EXPENSES.length} caption={`${formatMoney(sumBy(() => true))} đề nghị`} />
        <StatCard
          label="Đang xét duyệt"
          value={EXPENSES.filter((e) => IN_REVIEW.includes(e.status)).length}
          tone="primary"
          caption={formatMoney(sumBy((e) => IN_REVIEW.includes(e.status)))}
        />
        <StatCard label="Cần bổ sung" value={EXPENSES.filter((e) => e.status === 'CAN_BO_SUNG').length} tone="warning" caption="Sửa và gửi lại từ trưởng phòng" />
        <StatCard
          label="Đã thanh toán"
          value={formatMoney(sumBy((e) => e.status === 'DA_THANH_TOAN'), { unit: false })}
          tone="success"
          caption="VND"
        />
      </StatGrid>

      <FilterBar search={<SearchInput value={search} onChange={resetPage(setSearch)} placeholder="Tìm theo mã hoặc nội dung" />}>
        <FilterSelect value={status} options={STATUS_OPTIONS} onChange={resetPage(setStatus)} />
      </FilterBar>

      <SectionCard
        title="Danh sách yêu cầu"
        action={<Typography variant="caption">{filtered.length} hồ sơ</Typography>}
      >
        <DataTable
          columns={COLUMNS}
          rows={pageRows}
          onRowClick={(r) => navigate(`/expenses/${r.id}`)}
          emptyState={<EmptyState variant={search || status ? 'no-results' : 'empty'} compact />}
        />
        {filtered.length > 0 && (
          <TablePaginationBar page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} itemLabel="hồ sơ" />
        )}
      </SectionCard>
    </>
  )
}
