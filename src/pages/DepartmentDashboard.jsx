import { useState } from 'react'
import { useNavigate } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  AppAlert,
  ArrowLink,
  BudgetCard,
  DataTable,
  PageHeader,
  PeriodPicker,
  SectionCard,
  StatCard,
  StatGrid,
  StatusBadge,
  TwoLineText,
} from '../components'
import SpendingBarChart from '../components/data/SpendingBarChart'
import { DEPARTMENT_QUEUE, DEPARTMENT_SPENDING, MONTHS } from '../mocks/dashboard'
import { MARKETING_BUDGET } from '../mocks/data'
import { formatDate, formatMoney, toMillions } from '../utils/format'

// Màn 02 · Tổng quan phòng Marketing (trưởng phòng).
const { total, spent, committed } = MARKETING_BUDGET
const available = total - spent - committed
const queueTotal = DEPARTMENT_QUEUE.reduce((sum, r) => sum + r.amount, 0)

export default function DepartmentDashboard() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('2026-10')

  const columns = [
    {
      key: 'id',
      header: 'Yêu cầu / Người tạo',
      render: (r) => <TwoLineText primary={`${r.id} · ${r.title}`} secondary={`${r.requester} · ${formatDate(r.submittedAt)}`} />,
    },
    { key: 'amount', header: 'Số tiền', align: 'right', width: 150, render: (r) => formatMoney(r.amount) },
    { key: 'dueDate', header: 'Cần chi', width: 110, render: (r) => formatDate(r.dueDate) },
    { key: 'action', header: 'Thao tác', width: 110, render: (r) => <ArrowLink onClick={() => navigate(`/approvals/${r.id}`)}>Xem xét</ArrowLink> },
  ]

  return (
    <>
      <PageHeader
        eyebrow="02 / TRƯỞNG PHÒNG"
        title="Tổng quan phòng Marketing"
        description="Kiểm soát chi tiêu của phòng và xử lý yêu cầu đang chờ bạn phê duyệt."
        actions={<Button variant="contained" onClick={() => navigate('/approvals')}>Mở hàng chờ duyệt</Button>}
        tags={<StatusBadge label="Marketing · 12 nhân sự" tone="primary" />}
        toolbar={<PeriodPicker value={period} onChange={setPeriod} />}
      />

      <StatGrid>
        <StatCard label="Chờ bạn duyệt" value={DEPARTMENT_QUEUE.length} tone="primary" caption={`Tổng ${formatMoney(queueTotal)}`} />
        <StatCard label="Ngân sách quý IV" value={formatMoney(total, { unit: false })} caption="VND · Truyền thông" />
        <StatCard
          label="Đã chi / cam kết chưa chi"
          value={formatMoney(spent + committed, { unit: false })}
          caption={`VND · ${toMillions(spent)} triệu / ${toMillions(committed)} triệu`}
        />
        <StatCard
          label="Còn khả dụng"
          value={formatMoney(available, { unit: false })}
          tone="success"
          caption={`VND · Sử dụng ${Math.round(((spent + committed) / total) * 100)}%`}
        />
      </StatGrid>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 374px' }, gap: 3, alignItems: 'start' }}>
        <Stack spacing={3}>
          <SectionCard
            title="Hàng chờ cấp phòng"
            subtitle="Chỉ hồ sơ chờ trưởng phòng · Ưu tiên ngày cần chi"
            action={<ArrowLink onClick={() => navigate('/approvals')}>Xem {DEPARTMENT_QUEUE.length} yêu cầu</ArrowLink>}
          >
            <DataTable columns={columns} rows={DEPARTMENT_QUEUE.slice(0, 3)} onRowClick={(r) => navigate(`/approvals/${r.id}`)} />
          </SectionCard>

          <SectionCard title="Chi tiêu phòng Marketing" subtitle="Đã chi và cam kết chưa chi · Đơn vị: triệu VND">
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
        </Stack>

        <Stack spacing={3}>
          <BudgetCard
            title="Khả dụng quý IV"
            {...MARKETING_BUDGET}
            alert={{
              tone: 'success',
              title: 'Trong hạn mức',
              message: 'Yêu cầu 48.000.000 VND. Còn 132.000.000 VND nếu được duyệt; không trừ cam kết lần thứ hai.',
            }}
          />
          <AppAlert tone="warning" title="2 hồ sơ đến hạn trong 48 giờ">
            Xem xét đúng bước để kế toán có đủ thời gian thẩm định. Duyệt cấp phòng chưa cho phép thanh toán.
          </AppAlert>
          <SectionCard title="Hoạt động gần đây">
            <Typography variant="body2">21/10 · Bạn duyệt CHI-1024, 48.000.000 VND.</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Hồ sơ đã chuyển kế toán và đang chờ lãnh đạo duyệt cuối.
            </Typography>
          </SectionCard>
        </Stack>
      </Box>
    </>
  )
}
