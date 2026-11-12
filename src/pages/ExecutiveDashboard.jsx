import { useState } from 'react'
import { useNavigate } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { LineChart } from '@mui/x-charts/LineChart'
import { Download } from 'lucide-react'
import {
  AppAlert,
  ArrowLink,
  DataTable,
  PageHeader,
  PeriodPicker,
  SectionCard,
  StatCard,
  StatGrid,
  StatusBadge,
  TwoLineText,
  useToast,
} from '../components'
import SpendingBarChart from '../components/data/SpendingBarChart'
import { BALANCE_FORECAST, CASH_FLOW, FINAL_APPROVAL_QUEUE, MONTHS } from '../mocks/dashboard'
import { colors } from '../theme/tokens'
import { formatDate, formatMoney } from '../utils/format'

// Màn 04 · Tổng quan điều hành (lãnh đạo).
const queueTotal = FINAL_APPROVAL_QUEUE.reduce((sum, r) => sum + r.amount, 0)

export default function ExecutiveDashboard() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [period, setPeriod] = useState('2026-10')

  const columns = [
    {
      key: 'id',
      header: 'Yêu cầu',
      render: (r) => <TwoLineText primary={`${r.id} · ${r.title}`} secondary={`Cần chi ${formatDate(r.dueDate)} · ${r.requester}`} />,
    },
    { key: 'department', header: 'Phòng ban', width: 120 },
    { key: 'amount', header: 'Số tiền', align: 'right', width: 150, render: (r) => formatMoney(r.amount) },
    {
      key: 'budget',
      header: 'Ngân sách',
      width: 140,
      render: (r) => (r.budget === 'GAN_VUOT' ? <StatusBadge label="Gần ngưỡng" tone="warning" /> : <StatusBadge status={r.budget} />),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="04 / LÃNH ĐẠO"
        title="Tổng quan điều hành"
        description="Bức tranh tài chính doanh nghiệp và các quyết định cần phê duyệt cuối."
        actions={
          <Button variant="outlined" startIcon={<Download size={16} />} onClick={() => showToast('Đang tạo báo cáo quản trị...', 'info')}>
            Xuất báo cáo quản trị
          </Button>
        }
        tags={<StatusBadge label="Toàn doanh nghiệp" tone="primary" />}
        toolbar={<PeriodPicker value={period} onChange={setPeriod} />}
      />

      <StatGrid>
        <StatCard label="Thực thu tháng 10" value="1.860.000.000" tone="success" caption="VND · Tăng 12,4% so với tháng 9" />
        <StatCard label="Thực chi tháng 10" value="1.420.000.000" caption="VND · Trong kế hoạch tháng" />
        <StatCard label="Dòng tiền thuần" value="+440.000.000" tone="primary" caption="VND · Không gồm khoản chưa thu/chi" />
        <StatCard label="Ngân sách khả dụng quý IV" value="1.700.000.000" caption="6 tỷ − 3,2 tỷ đã chi − 1,1 tỷ cam kết" />
      </StatGrid>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <SectionCard title="Dòng tiền thực tế" subtitle="Thu và chi theo tháng · Đơn vị: triệu VND">
          <SpendingBarChart
            categories={MONTHS}
            series={[
              { label: 'Thực thu', data: CASH_FLOW.income },
              { label: 'Thực chi', data: CASH_FLOW.expense },
            ]}
            note="Cập nhật 22/10/2026"
            valueFormatter={(v) => `${v} triệu`}
          />
        </SectionCard>

        <SectionCard title="Dự báo số dư cuối kỳ" subtitle="Đơn vị: triệu VND · Dựa trên lịch thu và chi đến hạn">
          <Typography sx={{ fontSize: 28, fontWeight: 600 }}>{formatMoney(BALANCE_FORECAST.closing, { unit: false })} triệu VND</Typography>
          <LineChart
            height={230}
            hideLegend
            grid={{ horizontal: false }}
            xAxis={[
              {
                scaleType: 'point',
                data: BALANCE_FORECAST.labels,
                disableLine: true,
                disableTicks: true,
                tickLabelInterval: (_, index) => [0, 2, 6, 10].includes(index),
              },
            ]}
            yAxis={[{ position: 'none' }]}
            series={[
              {
                data: BALANCE_FORECAST.values,
                curve: 'natural',
                showMark: false,
                color: colors.primary,
                valueFormatter: (v) => `${formatMoney(v, { unit: false })} triệu`,
              },
            ]}
            margin={{ left: 8, right: 16, top: 16, bottom: 8 }}
          />
        </SectionCard>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 374px' }, gap: 3, alignItems: 'start' }}>
        <SectionCard
          title="Chờ phê duyệt cuối"
          subtitle={`${FINAL_APPROVAL_QUEUE.length} hồ sơ · ${formatMoney(queueTotal)} · Đã qua trưởng phòng và kế toán`}
          action={<ArrowLink onClick={() => navigate('/approvals')}>Mở hàng chờ</ArrowLink>}
        >
          <DataTable columns={columns} rows={FINAL_APPROVAL_QUEUE} onRowClick={(r) => navigate(`/approvals/${r.id}`)} />
        </SectionCard>

        <Stack spacing={2}>
          <AppAlert tone="warning" title="Công nghệ sử dụng 92% hạn mức">
            Còn 40 triệu VND khả dụng. Chặn yêu cầu mới vượt hạn mức cho tới khi điều chỉnh được duyệt.
          </AppAlert>
          <AppAlert tone="danger" title="2 khoản thu đã quá hạn">
            Tổng 56.000.000 VND. Kế toán đang theo dõi với các khách hàng liên quan.
          </AppAlert>
          <Typography variant="caption" component="p">
            Dữ liệu cập nhật lúc 09:30, 22/10/2026. Dự báo không thay thế số dư thực tế.
          </Typography>
        </Stack>
      </Box>
    </>
  )
}
