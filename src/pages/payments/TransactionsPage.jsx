import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { CalendarDays } from 'lucide-react'
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
} from '../../components'
import { PERMS } from '../../constants/permissions'
import usePermission from '../../hooks/usePermission'
import useOnChange from '../../hooks/useOnChange'
import {
  fetchPaymentRequests,
  fetchPaymentStats,
  fetchTransactions,
  selectPaymentRequests,
  selectPaymentRequestsError,
  selectPaymentRequestsLoading,
  selectPaymentRequestsQuery,
  selectPaymentRequestsTotal,
  selectPaymentStats,
  selectTransactions,
  selectTransactionsError,
  selectTransactionsLoading,
  selectTransactionsQuery,
  selectTransactionsTotal,
  setPaymentRequestsQuery,
  setTransactionsQuery,
} from '../../store/slices/paymentsSlice'
import { selectPendingPaymentCount } from '../../store/slices/notificationsSlice'
import { formatDate, formatMoney } from '../../utils/format'

// Màn 16 · Thanh toán: hồ sơ thanh toán (chờ chi + đã chi, có cột trạng thái) và lịch sử lệnh chi.
// Kế toán tải ủy nhiệm chi và Hoàn thành chi; người chỉ có quyền xem thì xem. Không theo dõi đối soát ngân hàng.

/** 6 tháng gần nhất (theo giờ Việt Nam) cho bộ lọc */
const MONTH_OPTIONS = (() => {
  const [year, month] = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).split('-').map(Number)
  const options = [{ value: '', label: 'Tất cả thời gian' }]
  for (let i = 0; i < 6; i += 1) {
    const d = new Date(year, month - 1 - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    options.push({ value, label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}` })
  }
  return options
})()
const REQUEST_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'DA_DUYET', label: 'Chờ chi' },
  { value: 'DA_THANH_TOAN', label: 'Hoàn thành' },
]

// Dòng in đậm: hồ sơ chờ chi (cần kế toán xử lý)
const PENDING_ROW_SX = { '& td': { fontWeight: 700 } }

const requestStatusBadge = (r) => {
  if (r.status === 'DA_THANH_TOAN') return <StatusBadge pill status="DA_THANH_TOAN" />
  return r.overdue ? <StatusBadge pill tone="danger" label="Chờ chi · Quá hạn" /> : <StatusBadge pill status="CHO_CHI" />
}

export default function TransactionsPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const canExecute = usePermission(PERMS.PAYMENT_EXECUTE)
  const stats = useSelector(selectPaymentStats)
  const pendingCount = useSelector(selectPendingPaymentCount)

  const requests = useSelector(selectPaymentRequests)
  const requestsTotal = useSelector(selectPaymentRequestsTotal)
  const requestsQuery = useSelector(selectPaymentRequestsQuery)
  const requestsLoading = useSelector(selectPaymentRequestsLoading)
  const requestsError = useSelector(selectPaymentRequestsError)

  const rows = useSelector(selectTransactions)
  const total = useSelector(selectTransactionsTotal)
  const query = useSelector(selectTransactionsQuery)
  const loading = useSelector(selectTransactionsLoading)
  const loadError = useSelector(selectTransactionsError)

  // Tab lưu trên URL (?tab=history) để quay lại từ màn chi tiết vẫn đúng tab
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'history' ? 'history' : 'requests'
  const setTab = (value) => setSearchParams(value === 'history' ? { tab: 'history' } : {}, { replace: true })
  const [requestSearch, setRequestSearch] = useState(requestsQuery.search)
  const [search, setSearch] = useState(query.search)

  const reloadRequests = useCallback(() => {
    dispatch(fetchPaymentRequests(requestsQuery))
    dispatch(fetchPaymentStats())
  }, [dispatch, requestsQuery])
  const reloadTransactions = useCallback(() => dispatch(fetchTransactions(query)), [dispatch, query])

  useEffect(() => {
    reloadRequests()
  }, [reloadRequests])

  useEffect(() => {
    reloadTransactions()
  }, [reloadTransactions])

  // Server báo số hồ sơ chờ chi vừa đổi (lãnh đạo vừa duyệt cuối / kế toán khác vừa chi) → tải lại
  useOnChange(pendingCount, () => {
    reloadRequests()
    reloadTransactions()
  })

  // Chờ người dùng gõ xong 300ms mới gọi API tìm kiếm
  useEffect(() => {
    if (requestSearch === requestsQuery.search) return undefined
    const timer = setTimeout(() => dispatch(setPaymentRequestsQuery({ search: requestSearch })), 300)
    return () => clearTimeout(timer)
  }, [requestSearch, requestsQuery.search, dispatch])

  useEffect(() => {
    if (search === query.search) return undefined
    const timer = setTimeout(() => dispatch(setTransactionsQuery({ search })), 300)
    return () => clearTimeout(timer)
  }, [search, query.search, dispatch])

  const requestOffset = (requestsQuery.page - 1) * requestsQuery.limit
  const requestColumns = [
    { key: 'stt', header: 'STT', width: 60, render: (r) => requestOffset + requests.indexOf(r) + 1 },
    { key: 'code', header: 'Mã yêu cầu', width: 160 },
    {
      key: 'purpose',
      header: 'Nội dung',
      render: (r) => (
        <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit', display: 'block', maxWidth: 280 }} noWrap>
          {r.purpose || '—'}
        </Typography>
      ),
    },
    { key: 'department', header: 'Phòng ban', width: 160, render: (r) => r.departmentName ?? '—' },
    { key: 'beneficiaryName', header: 'Thụ hưởng', width: 170, render: (r) => r.beneficiaryName ?? '—' },
    { key: 'amount', header: 'Số tiền (VND)', align: 'right', width: 140, render: (r) => formatMoney(r.amount, { unit: false }) },
    { key: 'date', header: 'Cần chi / Ngày chi', width: 130, render: (r) => formatDate(r.status === 'DA_THANH_TOAN' ? r.paidAt : r.dueDate) },
    { key: 'status', header: 'Trạng thái', width: 170, render: requestStatusBadge },
  ]

  const txOffset = (query.page - 1) * query.limit
  const transactionColumns = [
    { key: 'stt', header: 'STT', width: 60, render: (t) => txOffset + rows.indexOf(t) + 1 },
    { key: 'code', header: 'Mã lệnh chi', width: 150 },
    { key: 'expenseCode', header: 'Yêu cầu chi', width: 160 },
    { key: 'beneficiaryName', header: 'Thụ hưởng' },
    { key: 'amount', header: 'Số tiền (VND)', align: 'right', width: 140, render: (t) => formatMoney(t.amount, { unit: false }) },
    {
      key: 'proof',
      header: 'Ủy nhiệm chi',
      width: 220,
      render: (t) => (
        <Typography component="span" sx={{ fontSize: 'inherit', display: 'block', maxWidth: 210 }} noWrap>
          {t.proofFileName ?? (t.bankRef ? `Mã GD ${t.bankRef}` : '—')}
        </Typography>
      ),
    },
    { key: 'executedAt', header: 'Ngày chi', width: 110, render: (t) => formatDate(t.executedAt) },
    { key: 'status', header: 'Trạng thái', width: 150, render: () => <StatusBadge pill status="DA_THANH_TOAN" /> },
  ]

  return (
    <>
      <PageHeader
        eyebrow="16 / THANH TOÁN"
        title="Thực hiện chi và lịch sử lệnh chi"
        description="Hồ sơ đã duyệt cuối (chờ chi) và đã hoàn thành chi. Kế toán tải lên ủy nhiệm chi rồi bấm Hoàn thành chi; tiền về người thụ hưởng do ngân hàng xử lý."
        tags={!canExecute ? <StatusBadge label="Chỉ xem" tone="neutral" /> : undefined}
      />

      <StatGrid columns={2}>
        <StatCard label="Chờ thực chi" value={stats.pending.count} tone="primary" caption={`${formatMoney(stats.pending.amount)} đã duyệt cuối, chưa chi`} />
        <StatCard label="Đã chi tháng này" value={formatMoney(stats.thisMonth.amount, { unit: false })} tone="success" caption={`VND · ${stats.thisMonth.count} lệnh chi`} />
      </StatGrid>

      <CustomTab
        value={tab}
        onChange={setTab}
        sx={{ mb: 2 }}
        tabs={[
          { value: 'requests', label: 'Hồ sơ thanh toán', count: stats.pending.count },
          { value: 'history', label: 'Lịch sử lệnh chi', count: total },
        ]}
      />

      {tab === 'requests' && (
        <>
          <FilterBar search={<SearchInput value={requestSearch} onChange={setRequestSearch} placeholder="Tìm mã, nội dung, người tạo hoặc thụ hưởng" width={360} />}>
            <FilterSelect value={requestsQuery.status} options={REQUEST_STATUS_OPTIONS} onChange={(status) => dispatch(setPaymentRequestsQuery({ status }))} />
          </FilterBar>

          {requestsError && (
            <AppAlert tone="danger" title="Không tải được hồ sơ thanh toán" sx={{ mb: 2 }}>
              {requestsError.message}{' '}
              <Button size="small" onClick={reloadRequests}>Thử lại</Button>
            </AppAlert>
          )}

          <SectionCard
            title="Hồ sơ thanh toán"
            subtitle={canExecute ? 'Dòng in đậm đang chờ chi: bấm để tải ủy nhiệm chi và hoàn thành chi' : 'Bấm vào hồ sơ để xem chi tiết và ủy nhiệm chi'}
            action={<Typography variant="caption">{requestsTotal} hồ sơ</Typography>}
          >
            <DataTable
              columns={requestColumns}
              rows={requests}
              loading={requestsLoading && requests.length === 0}
              onRowClick={(r) => navigate(`/payments/${r.code}`)}
              getRowSx={(r) => (r.status === 'DA_DUYET' ? PENDING_ROW_SX : undefined)}
              minWidth={1100}
              emptyState={
                <EmptyState
                  compact
                  variant={requestsQuery.search || requestsQuery.status ? 'no-results' : 'empty'}
                  title={requestsQuery.search || requestsQuery.status ? undefined : 'Chưa có hồ sơ thanh toán'}
                  description={requestsQuery.search || requestsQuery.status ? undefined : 'Hồ sơ được lãnh đạo duyệt cuối sẽ xuất hiện ở đây.'}
                />
              }
            />
            {requestsTotal > 0 && (
              <TablePaginationBar
                page={requestsQuery.page}
                pageSize={requestsQuery.limit}
                total={requestsTotal}
                onPageChange={(page) => dispatch(setPaymentRequestsQuery({ page }))}
                itemLabel="hồ sơ"
              />
            )}
          </SectionCard>
        </>
      )}

      {tab === 'history' && (
        <>
          <FilterBar search={<SearchInput value={search} onChange={setSearch} placeholder="Tìm mã lệnh chi, yêu cầu chi hoặc thụ hưởng" width={360} />}>
            <FilterSelect value={query.month} options={MONTH_OPTIONS} onChange={(month) => dispatch(setTransactionsQuery({ month }))} icon={CalendarDays} />
          </FilterBar>

          {loadError && (
            <AppAlert tone="danger" title="Không tải được lịch sử lệnh chi" sx={{ mb: 2 }}>
              {loadError.message}{' '}
              <Button size="small" onClick={reloadTransactions}>Thử lại</Button>
            </AppAlert>
          )}

          <SectionCard title="Lịch sử lệnh chi" subtitle="Bấm vào một lệnh chi để mở màn chi tiết" action={<Typography variant="caption">{total} lệnh chi</Typography>} sx={{ mb: 3 }}>
            <DataTable
              columns={transactionColumns}
              rows={rows}
              loading={loading && rows.length === 0}
              onRowClick={(t) => navigate(`/payments/${t.expenseCode}`, { state: { from: 'history' } })}
              minWidth={1150}
              emptyState={<EmptyState compact variant={query.search || query.month ? 'no-results' : 'empty'} />}
            />
            {total > 0 && (
              <TablePaginationBar
                page={query.page}
                pageSize={query.limit}
                total={total}
                onPageChange={(page) => dispatch(setTransactionsQuery({ page }))}
                itemLabel="lệnh chi"
              />
            )}
          </SectionCard>

        </>
      )}
    </>
  )
}
