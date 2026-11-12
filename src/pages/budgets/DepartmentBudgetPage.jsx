import { useState } from 'react'
import { useNavigate } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CalendarDays } from 'lucide-react'
import {
  AppAlert,
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
import { DEPARTMENT_SPENDING, MONTHS } from '../../mocks/dashboard'
import { BUDGET_PERIOD_OPTIONS, MARKETING_BUDGET_LOG, MARKETING_LINES, MARKETING_REQUESTS } from '../../mocks/budgets'
import { MARKETING_BUDGET } from '../../mocks/data'
import { colors } from '../../theme/tokens'
import { formatMoney } from '../../utils/format'

// Màn 19 · Chi tiết ngân sách phòng Marketing (trưởng phòng xem phòng mình; kế toán, lãnh đạo xem mọi phòng).
const { total, spent, committed } = MARKETING_BUDGET
const available = total - spent - committed
const usagePercent = (row) => Math.round(((row.spent + row.committed) / row.plan) * 100)

const LINE_COLUMNS = [
  { key: 'name', header: 'Khoản mục', render: (r) => <TwoLineText primary={r.name} secondary={r.ref} /> },
  { key: 'plan', header: 'Kế hoạch', align: 'right', render: (r) => formatMoney(r.plan, { unit: false }) },
  { key: 'spent', header: 'Thực chi', align: 'right', render: (r) => formatMoney(r.spent, { unit: false }) },
  { key: 'committed', header: 'Cam kết chưa chi', align: 'right', render: (r) => formatMoney(r.committed, { unit: false }) },
  { key: 'available', header: 'Còn khả dụng', align: 'right', render: (r) => formatMoney(r.plan - r.spent - r.committed, { unit: false }) },
  {
    key: 'usage',
    header: '% sử dụng',
    align: 'right',
    width: 100,
    render: (r) => {
      const percent = usagePercent(r)
      return <Typography sx={{ fontSize: 14, fontWeight: 600, color: percent >= 90 ? 'warning.main' : colors.primary }}>{percent}%</Typography>
    },
  },
]

export default function DepartmentBudgetPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [period, setPeriod] = useState('Q4-2026')

  const requestColumns = [
    { key: 'id', header: 'Yêu cầu', render: (r) => <TwoLineText primary={`${r.id} · ${r.title}`} secondary={`${r.requester} · ${r.date}`} /> },
    { key: 'amount', header: 'Số tiền', align: 'right', width: 110, render: (r) => formatMoney(r.amount, { unit: false }) },
    { key: 'status', header: 'Trạng thái', width: 120, render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <>
      <PageHeader
        eyebrow="19 / NGÂN SÁCH PHÒNG"
        title="Chi tiết ngân sách phòng Marketing"
        description="Theo dõi chi tiêu theo tháng, theo dõi cam kết chưa chi và cảnh báo vượt hạn mức."
        actions={
          <Button variant="contained" onClick={() => showToast('Đang xuất báo cáo ngân sách phòng Marketing...', 'info')}>
            Xuất báo cáo
          </Button>
        }
        tags={<StatusBadge label={`Marketing · Truyền thông · ${BUDGET_PERIOD_OPTIONS.find((p) => p.value === period).label}`} tone="primary" />}
        toolbar={<FilterSelect value={period} options={BUDGET_PERIOD_OPTIONS} onChange={setPeriod} icon={CalendarDays} />}
      />

      <StatGrid>
        <StatCard label="Ngân sách" value={formatMoney(total, { unit: false })} caption="VND · Truyền thông quý IV/2026" />
        <StatCard label="Đã chi" value={formatMoney(spent, { unit: false })} caption="VND · 4 tháng đã thanh toán" />
        <StatCard label="Cam kết chưa chi" value={formatMoney(committed, { unit: false })} caption="VND · Đã duyệt nhưng chưa thanh toán" />
        <StatCard
          label="Còn khả dụng"
          value={formatMoney(available, { unit: false })}
          tone="success"
          caption={`VND · Sử dụng ${Math.round(((spent + committed) / total) * 100)}%`}
        />
      </StatGrid>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 3, alignItems: 'start' }}>
        <Stack spacing={3}>
          <SectionCard title="Biểu đồ theo tháng" subtitle="Đã chi và cam kết chưa chi theo tháng · Đơn vị: triệu VND">
            <SpendingBarChart
              categories={MONTHS}
              series={[
                { label: 'Đã chi', data: DEPARTMENT_SPENDING.spent },
                { label: 'Cam kết chưa chi', data: DEPARTMENT_SPENDING.committed },
              ]}
              note="Cập nhật 22/10/2026"
              valueFormatter={(v) => `${v} triệu`}
            />
          </SectionCard>

          <SectionCard title="Bảng chi tiết theo khoản mục" subtitle="Kế hoạch / Thực chi / Cam kết chưa chi / Còn khả dụng / % sử dụng">
            <DataTable columns={LINE_COLUMNS} rows={MARKETING_LINES} minWidth={720} />
          </SectionCard>
        </Stack>

        <Stack spacing={3}>
          <BudgetCard
            title="Khả dụng ngân sách"
            {...MARKETING_BUDGET}
            alert={{
              tone: 'success',
              title: 'Trong hạn mức',
              message: `Yêu cầu 48.000.000 VND. Còn ${formatMoney(available - 48_000_000)} nếu được duyệt; không trừ cam kết lần thứ hai.`,
            }}
          />

          <SectionCard title="Yêu cầu chi liên quan" subtitle="Hồ sơ đang chờ duyệt và liên quan đến khoản mục này">
            <DataTable columns={requestColumns} rows={MARKETING_REQUESTS} minWidth={320} onRowClick={(r) => navigate(`/expenses/${r.id}`)} />
          </SectionCard>

          <SectionCard title="Cảnh báo và lịch sử điều chỉnh">
            <AppAlert tone="warning" title="2 hồ sơ đến hạn trong 48 giờ">
              Xem xét đúng bước để kế toán có đủ thời gian thẩm định. Duyệt cấp phòng chưa cho phép thanh toán.
            </AppAlert>
            <Stack spacing={1.5} sx={{ mt: 2.5 }}>
              {MARKETING_BUDGET_LOG.map((entry) => (
                <Typography key={entry} variant="body2" color="text.secondary">{entry}</Typography>
              ))}
            </Stack>
          </SectionCard>
        </Stack>
      </Box>
    </>
  )
}
