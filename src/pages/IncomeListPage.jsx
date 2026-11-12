import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import { Download, Plus, SlidersHorizontal } from 'lucide-react'
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
  StatCard,
  StatGrid,
  StatusBadge,
  TablePaginationBar,
  TwoLineText,
  useToast,
} from '../components'
import { INCOMES } from '../mocks/income'
import { formatDate, formatMoney } from '../utils/format'

// Màn 05 · Quản lý khoản thu (kế toán).
const PAGE_SIZE = 6

const TABS = [
  { value: 'ALL', label: 'Tất cả', match: () => true },
  { value: 'CHO_KIEM_TRA', label: 'Chờ kiểm tra', match: (r) => r.status === 'CHO_KIEM_TRA' },
  { value: 'CHO_THU', label: 'Chờ thu', match: (r) => r.status === 'CHO_THU' || r.status === 'QUA_HAN' },
  { value: 'THU_MOT_PHAN', label: 'Thu một phần', match: (r) => r.status === 'THU_MOT_PHAN' },
  { value: 'DA_THU', label: 'Đã thu', match: (r) => r.status === 'DA_THU' },
  { value: 'OTHER', label: 'Khác', match: (r) => !['CHO_KIEM_TRA', 'CHO_THU', 'QUA_HAN', 'THU_MOT_PHAN', 'DA_THU'].includes(r.status) },
]

// Số lượng mỗi tab tính trên toàn bộ danh sách, không phụ thuộc bộ lọc.
const TAB_ITEMS = TABS.map((t) => ({ value: t.value, label: t.label, count: INCOMES.filter(t.match).length }))

const PERIOD_OPTIONS = [
  { value: '2026-10', label: '01–31/10/2026' },
  { value: '2026-09', label: '01–30/09/2026' },
]
const DEPARTMENT_OPTIONS = [{ value: '', label: 'Phòng ban' }, ...['Kinh doanh', 'Marketing', 'Vận hành'].map((d) => ({ value: d, label: d }))]
const ACCOUNT_OPTIONS = [{ value: '', label: 'Tài khoản / quỹ' }, ...['VCB · 1028', 'ACB · 8812', 'Quỹ tiền mặt'].map((a) => ({ value: a, label: a }))]

const sum = (rows, pick) => rows.reduce((total, r) => total + pick(r), 0)

export default function IncomeListPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [tab, setTab] = useState('ALL')
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('2026-10')
  const [department, setDepartment] = useState('')
  const [account, setAccount] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    const matchTab = TABS.find((t) => t.value === tab).match
    return INCOMES.filter(
      (r) =>
        matchTab(r) &&
        (!department || r.department === department) &&
        (!account || r.account === account) &&
        (!keyword || [r.id, r.title, r.customer].some((v) => v.toLowerCase().includes(keyword))),
    )
  }, [tab, search, department, account])

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const resetPage = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const overdue = INCOMES.filter((r) => r.status === 'QUA_HAN')
  const outstanding = INCOMES.filter((r) => r.status !== 'CHO_KIEM_TRA' && r.status !== 'CAN_BO_SUNG')

  const columns = [
    { key: 'id', header: 'Mã / Nội dung', render: (r) => <TwoLineText primary={r.id} secondary={r.title} /> },
    { key: 'customer', header: 'Khách hàng / Phòng', render: (r) => <TwoLineText primary={r.customer} secondary={r.department} /> },
    { key: 'expected', header: 'Dự kiến', align: 'right', render: (r) => formatMoney(r.expected, { unit: false }) },
    { key: 'received', header: 'Thực nhận', align: 'right', render: (r) => formatMoney(r.received, { unit: false }) },
    { key: 'remaining', header: 'Còn phải thu', align: 'right', render: (r) => formatMoney(r.expected - r.received, { unit: false }) },
    { key: 'dueDate', header: 'Hạn / Tài khoản', render: (r) => <TwoLineText primary={formatDate(r.dueDate)} secondary={r.account} /> },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (r) => (r.status === 'QUA_HAN' ? <StatusBadge label="Quá hạn · Chờ thu" tone="danger" /> : <StatusBadge status={r.status} />),
    },
    {
      key: 'action',
      header: '',
      width: 60,
      render: (r) => (
        <Link component="button" underline="hover" sx={{ fontSize: 13, fontWeight: 600 }} onClick={() => navigate(`/income/${r.id}`)}>
          Xem
        </Link>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="05 / KẾ TOÁN"
        title="Quản lý khoản thu"
        description="Theo dõi phải thu và tiền đã thực nhận. Chỉ ghi nhận thực thu khi đã kiểm tra giao dịch."
        actions={
          <>
            <Button variant="outlined" startIcon={<Download size={16} />} onClick={() => showToast('Đang xuất danh sách khoản thu...', 'info')}>
              Xuất danh sách
            </Button>
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => navigate('/income/new')}>
              Tạo khoản thu
            </Button>
          </>
        }
      />

      <StatGrid>
        <StatCard label="Dự kiến thu tháng 10" value={formatMoney(2_280_000_000, { unit: false })} caption="VND · 36 khoản thu" />
        <StatCard label="Đã thực nhận" value={formatMoney(1_860_000_000, { unit: false })} tone="success" caption="VND · Đã đối chiếu" />
        <StatCard
          label="Còn phải thu"
          value={formatMoney(sum(outstanding, (r) => r.expected - r.received), { unit: false })}
          caption="VND · Chưa bao gồm nháp"
        />
        <StatCard
          label="Quá hạn"
          value={formatMoney(sum(overdue, (r) => r.expected - r.received), { unit: false })}
          tone="danger"
          caption={`VND · ${overdue.length} khoản cần theo dõi`}
        />
      </StatGrid>

      <SectionCard sx={{ mb: 3 }}>
        <CustomTab value={tab} onChange={resetPage(setTab)} tabs={TAB_ITEMS} sx={{ mb: 2.5 }} />

        <FilterBar
          search={<SearchInput value={search} onChange={resetPage(setSearch)} placeholder="Tìm mã, nội dung, người nộp / khách hàng..." width="100%" sx={{ flex: 1 }} />}
          sx={{ mb: 2.5 }}
        >
          <FilterSelect value={period} options={PERIOD_OPTIONS} onChange={setPeriod} />
          <FilterSelect value={department} options={DEPARTMENT_OPTIONS} onChange={resetPage(setDepartment)} />
          <FilterSelect value={account} options={ACCOUNT_OPTIONS} onChange={resetPage(setAccount)} />
          <Button variant="outlined" startIcon={<SlidersHorizontal size={16} />} onClick={() => showToast('Bộ lọc nâng cao sẽ có khi nối API', 'info')}>
            Bộ lọc
          </Button>
        </FilterBar>

        <DataTable
          columns={columns}
          rows={pageRows}
          minWidth={1000}
          onRowClick={(r) => navigate(`/income/${r.id}`)}
          emptyState={<EmptyState variant={search || department || account ? 'no-results' : 'empty'} compact />}
        />
        <StatusBadge label="Đơn vị: VND" tone="neutral" sx={{ mt: 2 }} />
        {filtered.length > 0 && (
          <TablePaginationBar page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} itemLabel="khoản thu" />
        )}
      </SectionCard>

      <AppAlert tone="info" title="Thu tiền không đi qua luồng phê duyệt chi">
        Nhân viên gửi đề nghị ghi nhận; kế toán kiểm tra, theo dõi phải thu và xác nhận từng đợt tiền thực nhận. Đã kiểm tra không có nghĩa là đã thu.
      </AppAlert>
    </>
  )
}
