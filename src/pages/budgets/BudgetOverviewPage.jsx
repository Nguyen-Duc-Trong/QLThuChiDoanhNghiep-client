import { useState } from 'react'
import { useNavigate } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Download, Plus } from 'lucide-react'
import {
  ArrowLink,
  BudgetCard,
  DataTable,
  FilterSelect,
  PageHeader,
  SectionCard,
  StatCard,
  StatGrid,
  StatusBadge,
  TwoLineText,
  useToast,
} from '../../components'
import SpendingBarChart from '../../components/data/SpendingBarChart'
import { MONTHS } from '../../mocks/dashboard'
import { BUDGET_PERIOD_OPTIONS, DEPARTMENT_BUDGETS, PLAN_VS_ACTUAL, RELATED_REQUESTS, budgetStatus } from '../../mocks/budgets'
import { formatMoney } from '../../utils/format'

// Màn 17 · Tổng quan ngân sách (kế toán, lãnh đạo xem toàn công ty).
const DEPARTMENT_OPTIONS = [{ value: '', label: 'Tất cả phòng ban' }, ...DEPARTMENT_BUDGETS.map((b) => ({ value: b.department, label: b.department }))]
const LINE_OPTIONS = [{ value: '', label: 'Tất cả khoản mục' }, ...DEPARTMENT_BUDGETS.map((b) => ({ value: b.line, label: b.line }))]

const sum = (rows, key) => rows.reduce((total, r) => total + r[key], 0)

export default function BudgetOverviewPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [period, setPeriod] = useState('Q4-2026')
  const [department, setDepartment] = useState('Marketing')
  const [line, setLine] = useState('Truyền thông')

  const rows = DEPARTMENT_BUDGETS.filter((b) => (!department || b.department === department) && (!line || b.line === line))
  const scope = rows.length === 1 ? rows[0] : null
  const totals = { total: sum(rows, 'total'), spent: sum(rows, 'spent'), committed: sum(rows, 'committed') }
  const available = totals.total - totals.spent - totals.committed
  const periodLabel = BUDGET_PERIOD_OPTIONS.find((p) => p.value === period).label
  const scopeLabel = scope ? `${scope.department} · ${periodLabel}` : `${rows.length} phòng ban · ${periodLabel}`
  const related = RELATED_REQUESTS.filter((r) => (!department || r.department === department) && (!line || r.line === line))

  const columns = [
    { key: 'department', header: 'Phòng ban / Khoản mục', render: (b) => <TwoLineText primary={b.department} secondary={b.line} /> },
    { key: 'total', header: 'Ngân sách', align: 'right', render: (b) => formatMoney(b.total, { unit: false }) },
    { key: 'spent', header: 'Đã chi', align: 'right', render: (b) => formatMoney(b.spent, { unit: false }) },
    { key: 'committed', header: 'Cam kết', align: 'right', render: (b) => formatMoney(b.committed, { unit: false }) },
    { key: 'available', header: 'Còn khả dụng', align: 'right', render: (b) => formatMoney(b.total - b.spent - b.committed, { unit: false }) },
    { key: 'status', header: 'Tình trạng', render: (b) => <StatusBadge status={budgetStatus(b)} /> },
  ]

  return (
    <>
      <PageHeader
        eyebrow="17 / NGÂN SÁCH"
        title="Tổng quan ngân sách"
        description="Theo dõi ngân sách theo kỳ, phòng ban, khoản mục và các yêu cầu liên quan đang xử lý."
        actions={
          <>
            <Button variant="outlined" startIcon={<Download size={16} />} onClick={() => showToast(`Đang xuất báo cáo ngân sách ${periodLabel}...`, 'info')}>
              Xuất báo cáo
            </Button>
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => navigate('/budgets/allocation')}>
              Mở phân bổ
            </Button>
          </>
        }
        tags={<StatusBadge label="Toàn công ty · VND" tone="primary" />}
        toolbar={
          <>
            <FilterSelect value={period} options={BUDGET_PERIOD_OPTIONS} onChange={setPeriod} />
            <FilterSelect value={department} options={DEPARTMENT_OPTIONS} onChange={setDepartment} />
            <FilterSelect value={line} options={LINE_OPTIONS} onChange={setLine} />
          </>
        }
      />

      <StatGrid>
        <StatCard label="Ngân sách kế hoạch" value={formatMoney(totals.total, { unit: false })} caption={`VND · ${scopeLabel}`} />
        <StatCard label="Đã chi thực tế" value={formatMoney(totals.spent, { unit: false })} caption={`VND · ${sum(rows, 'transactions')} giao dịch đã thanh toán`} />
        <StatCard label="Cam kết chưa chi" value={formatMoney(totals.committed, { unit: false })} caption={`VND · ${sum(rows, 'approvedWaiting')} hồ sơ đã duyệt chờ chi`} />
        <StatCard
          label="Còn khả dụng"
          value={formatMoney(available, { unit: false })}
          tone={available > 0 ? 'primary' : 'danger'}
          caption={`VND · ${[totals.total, totals.spent, totals.committed].map((v) => Math.round(v / 1_000_000)).join(' - ')} = ${Math.round(available / 1_000_000)}`}
        />
      </StatGrid>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 420px' }, gap: 3, alignItems: 'start' }}>
        <Stack spacing={3}>
          <SectionCard title="Biểu đồ thực tế so kế hoạch" subtitle="So sánh chi thực tế với kế hoạch theo tháng · Đơn vị: triệu VND">
            <SpendingBarChart
              categories={MONTHS}
              series={[
                { label: 'Thực tế', data: PLAN_VS_ACTUAL.actual },
                { label: 'Kế hoạch', data: PLAN_VS_ACTUAL.plan },
              ]}
              note="Cập nhật 22/10/2026"
              valueFormatter={(v) => `${v} triệu`}
            />
          </SectionCard>

          <SectionCard title="Bảng phân bổ phòng ban" subtitle="Tình hình phân bổ theo phòng ban và khoản mục đang theo dõi">
            <DataTable
              columns={columns}
              rows={DEPARTMENT_BUDGETS}
              onRowClick={(b) => navigate(`/budgets/${b.id}`)}
              minWidth={720}
            />
          </SectionCard>
        </Stack>

        <Stack spacing={3}>
          <BudgetCard
            title="Ngưỡng ngân sách"
            scope="Tình trạng theo khả năng chi còn lại"
            {...totals}
            alert={
              available >= 48_000_000
                ? {
                    tone: 'success',
                    title: 'Trong hạn mức',
                    message: `Yêu cầu 48.000.000 VND. Còn ${formatMoney(available - 48_000_000)} nếu được duyệt; không tính trùng đã trả trong cam kết.`,
                  }
                : { tone: 'danger', title: 'Không đủ khả dụng', message: `Khả dụng chỉ còn ${formatMoney(available)}.` }
            }
          />

          <SectionCard title="Yêu cầu liên quan" subtitle="Các đề nghị đang chờ xử lý liên quan đến khoản mục này">
            {related.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Không có yêu cầu đang xử lý.</Typography>
            ) : (
              <Stack spacing={2}>
                {related.map((r) => (
                  <TwoLineText key={r.id} primary={`${r.id} · ${formatMoney(r.amount)}`} secondary={`${r.department} · ${r.line} · ${r.step}`} />
                ))}
              </Stack>
            )}
            <ArrowLink onClick={() => navigate('/approvals')} sx={{ mt: 2.5 }}>Mở danh sách yêu cầu</ArrowLink>
          </SectionCard>
        </Stack>
      </Box>
    </>
  )
}
