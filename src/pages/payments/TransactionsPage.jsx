import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CalendarDays } from 'lucide-react'
import {
  AppAlert,
  DataTable,
  DescriptionList,
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
  useToast,
} from '../../components'
import { TRANSACTIONS } from '../../mocks/approvals'
import { selectRole } from '../../store/slices/sessionSlice'
import { formatMoney } from '../../utils/format'

// Màn 16 · Giao dịch và đối soát thanh toán. Kế toán thao tác; lãnh đạo chỉ xem.
const PAGE_SIZE = 9
const PERIOD_OPTIONS = [
  { value: '2026-10', label: 'Tháng 10/2026' },
  { value: '2026-09', label: 'Tháng 9/2026' },
]
const SOURCE_OPTIONS = [{ value: '', label: 'Tất cả nguồn' }, ...[...new Set(TRANSACTIONS.map((t) => t.source))].map((s) => ({ value: s, label: s }))]
const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'THANH_CONG', label: 'Thành công' },
  { value: 'CHO_DOI_SOAT', label: 'Chờ đối soát' },
  { value: 'LOI', label: 'Lỗi' },
]

export default function TransactionsPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const canOperate = ['KE_TOAN', 'ADMIN'].includes(useSelector(selectRole))
  const [transactions, setTransactions] = useState(TRANSACTIONS)
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('2026-10')
  const [source, setSource] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(TRANSACTIONS.find((t) => t.status === 'LOI')?.id)

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return transactions.filter(
      (t) =>
        (!source || t.source === source) &&
        (!status || t.status === status) &&
        (!keyword || `${t.id} ${t.expenseId} ${t.source} ${t.beneficiary}`.toLowerCase().includes(keyword)),
    )
  }, [transactions, search, source, status])

  const resetPage = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const count = (predicate) => transactions.filter(predicate).length
  const selected = transactions.find((t) => t.id === selectedId)

  const checkBankCode = () => {
    setTransactions((prev) => prev.map((t) => (t.id === selected.id ? { ...t, status: 'CHO_DOI_SOAT' } : t)))
    showToast(`${selected.id}: mã ngân hàng đã được kiểm tra, chuyển sang chờ đối soát`, 'info')
  }

  const columns = [
    { key: 'id', header: 'Mã giao dịch', render: (t) => <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{t.id}</Typography> },
    { key: 'expenseId', header: 'Yêu cầu chi' },
    { key: 'round', header: 'Lần chi', width: 70 },
    { key: 'source', header: 'Tài khoản nguồn' },
    { key: 'beneficiary', header: 'Thụ hưởng' },
    { key: 'amount', header: 'Số tiền VND', align: 'right', render: (t) => formatMoney(t.amount, { unit: false }) },
    { key: 'time', header: 'Thời gian' },
    { key: 'actor', header: 'Người thực hiện' },
    { key: 'bankRef', header: 'Mã ngân hàng' },
    { key: 'status', header: 'Trạng thái giao dịch', render: (t) => <StatusBadge status={t.status} /> },
    { key: 'reconcile', header: 'Trạng thái đối soát', render: (t) => <StatusBadge status={t.reconcile} /> },
  ]

  return (
    <>
      <PageHeader
        eyebrow="16 / THANH TOÁN"
        title="Giao dịch và đối soát thanh toán"
        description="Theo dõi mã giao dịch, yêu cầu chi, lần chi, tài khoản nguồn, thụ hưởng, số tiền VND, thời gian, người thực hiện, mã ngân hàng, trạng thái giao dịch và đối soát."
      />

      <StatGrid columns={3}>
        <StatCard label="Chờ đối soát" value={count((t) => t.reconcile === 'CHO_DOI_SOAT')} caption="Cần kiểm tra mã ngân hàng và đối soát trước khi thực hiện lại." />
        <StatCard label="Thành công" value={count((t) => t.status === 'THANH_CONG')} caption="Đã đối soát thành công trong 24 giờ qua." />
        <StatCard label="Lỗi cần xử lý" value={count((t) => t.status === 'LOI')} tone="danger" caption="Cần kiểm tra mã ngân hàng trước khi thử lại để tránh chi kép." />
      </StatGrid>

      <FilterBar search={<SearchInput value={search} onChange={resetPage(setSearch)} placeholder="Tìm mã giao dịch, yêu cầu chi, tài khoản nguồn hoặc thụ hưởng" width={360} />}>
        <FilterSelect value={period} options={PERIOD_OPTIONS} onChange={setPeriod} icon={CalendarDays} />
        <FilterSelect value={source} options={SOURCE_OPTIONS} onChange={resetPage(setSource)} />
        <FilterSelect value={status} options={STATUS_OPTIONS} onChange={resetPage(setStatus)} />
      </FilterBar>

      <SectionCard
        title="Danh sách giao dịch và đối soát"
        action={<Typography variant="caption">Cập nhật 22/10/2026 · {filtered.length} bản ghi</Typography>}
        sx={{ mb: 3 }}
      >
        <DataTable
          columns={columns}
          rows={filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
          onRowClick={(t) => setSelectedId(t.id)}
          minWidth={1200}
          emptyState={<EmptyState compact variant={search || source || status ? 'no-results' : 'empty'} />}
        />
        {filtered.length > 0 && (
          <TablePaginationBar page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} itemLabel="giao dịch" />
        )}
      </SectionCard>

      {selected && (
        <SectionCard
          title={`Chi tiết giao dịch${selected.status === 'LOI' ? ' lỗi' : ''} ${selected.id}`}
          subtitle={`Yêu cầu chi ${selected.expenseId} · Lần chi ${selected.round} · Thời gian ${selected.time}`}
          action={<StatusBadge status={selected.status} />}
        >
          <DescriptionList
            columns={3}
            items={[
              { label: 'Yêu cầu chi', value: selected.expenseId },
              { label: 'Lần chi', value: selected.round },
              { label: 'Tài khoản nguồn', value: selected.source },
              { label: 'Thụ hưởng', value: selected.beneficiary },
              { label: 'Số tiền VND', value: formatMoney(selected.amount, { unit: false }) },
              { label: 'Thời gian', value: selected.time },
              { label: 'Người thực hiện', value: selected.actor },
              { label: 'Mã ngân hàng', value: selected.bankRef },
              { label: 'Trạng thái giao dịch', value: <StatusBadge status={selected.status} /> },
              { label: 'Trạng thái đối soát', value: <StatusBadge status={selected.reconcile} /> },
              ...(selected.error ? [{ label: 'Lý do lỗi', value: selected.error, span: 2 }] : []),
            ]}
          />

          {selected.status === 'LOI' && (
            <AppAlert tone="danger" title="Kiểm tra trước khi thử lại" sx={{ mt: 2.5 }}>
              Kiểm tra mã ngân hàng trước khi thực hiện lại để tránh chi kép. Chỉ kế toán thực thi, lãnh đạo xem, không mở quyền thực chi cho nhân viên/trưởng phòng.
              <Stack direction="row" spacing={1.5} sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1 }}>
                {canOperate && (
                  <Button variant="contained" onClick={checkBankCode}>
                    Kiểm tra mã ngân hàng
                  </Button>
                )}
                <Button variant="outlined" onClick={() => navigate(canOperate ? `/payments/${selected.expenseId}` : `/expenses/${selected.expenseId}`)}>
                  Mở yêu cầu chi
                </Button>
              </Stack>
            </AppAlert>
          )}
        </SectionCard>
      )}
    </>
  )
}
