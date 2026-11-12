import { useState } from 'react'
import { useNavigate } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Download, Plus } from 'lucide-react'
import {
  AppAlert,
  ArrowLink,
  DataTable,
  FilterSelect,
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
import { ACCOUNTING_QUEUE_PREVIEW, CASH_FLOW, DUE_PAYMENTS, MONTHS, RECEIVABLES_TO_WATCH } from '../mocks/dashboard'
import { formatDate, formatMoney } from '../utils/format'

// Màn 03 · Tổng quan kế toán.
const ACCOUNT_OPTIONS = [
  { value: '', label: 'Tất cả tài khoản' },
  { value: 'VCB', label: 'Vietcombank · 0071' },
  { value: 'TCB', label: 'Techcombank · 1903' },
  { value: 'CASH', label: 'Quỹ tiền mặt' },
]

const DUE_COLUMNS = [
  { key: 'id', header: 'Mã / Nội dung', render: (r) => <TwoLineText primary={r.id} secondary={r.title} /> },
  { key: 'remaining', header: 'Còn phải chi', align: 'right', width: 160, render: (r) => formatMoney(r.remaining) },
  { key: 'dueDate', header: 'Ngày cần chi', width: 120, render: (r) => formatDate(r.dueDate) },
  {
    key: 'status',
    header: 'Trạng thái',
    width: 160,
    render: (r) => (r.status === 'CHO_CHI' ? <StatusBadge label="Đã duyệt chờ chi" tone="success" /> : <StatusBadge status={r.status} />),
  },
]

export default function AccountantDashboard() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [period, setPeriod] = useState('2026-10')
  const [account, setAccount] = useState('')

  return (
    <>
      <PageHeader
        eyebrow="03 / KẾ TOÁN"
        title="Tổng quan kế toán"
        description="Theo dõi tiền thực tế, khoản đến hạn và các hồ sơ cần thẩm định toàn doanh nghiệp."
        actions={
          <>
            <Button variant="outlined" startIcon={<Download size={16} />} onClick={() => showToast('Đang xuất báo cáo tháng 10/2026...', 'info')}>
              Xuất báo cáo
            </Button>
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => navigate('/income/new')}>
              Ghi nhận thu
            </Button>
          </>
        }
        tags={<StatusBadge label="Toàn công ty · VND" tone="primary" />}
        toolbar={
          <>
            <FilterSelect value={account} options={ACCOUNT_OPTIONS} onChange={setAccount} />
            <PeriodPicker value={period} onChange={setPeriod} />
          </>
        }
      />

      <StatGrid>
        <StatCard label="Số dư tiền hiện tại" value="2.680.000.000" caption="VND · 3 tài khoản / quỹ" />
        <StatCard label="Còn phải thu" value="420.000.000" tone="warning" caption="VND · 12 khoản, 2 quá hạn" />
        <StatCard label="Đến hạn chi trong 7 ngày" value="186.000.000" caption="VND · 6 yêu cầu đã duyệt cuối" />
        <StatCard label="Chờ thẩm định / Giao dịch lỗi" value="8 / 2" tone="primary" caption="Cần kiểm tra trước khi thực hiện" />
      </StatGrid>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 420px' }, gap: 3, alignItems: 'start' }}>
        <Stack spacing={3}>
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

          <SectionCard title="Đến hạn thanh toán" subtitle="Chỉ các hồ sơ đã có đủ ba phê duyệt">
            <DataTable columns={DUE_COLUMNS} rows={DUE_PAYMENTS} onRowClick={(r) => navigate(`/payments/${r.id}`)} />
          </SectionCard>
        </Stack>

        <Stack spacing={3}>
          <SectionCard title="Hàng chờ thẩm định" action={<StatusBadge label="8 hồ sơ" tone="primary" />}>
            <Stack spacing={2}>
              {ACCOUNTING_QUEUE_PREVIEW.map((r) => (
                <TwoLineText key={r.id} primary={`${r.id} · ${formatMoney(r.amount)}`} secondary={`${r.department} · Đã duyệt cấp phòng`} />
              ))}
            </Stack>
            <Button variant="contained" sx={{ mt: 2.5 }} onClick={() => navigate('/approvals')}>
              Mở thẩm định kế toán
            </Button>
          </SectionCard>

          <AppAlert tone="danger" title="2 giao dịch cần xử lý">
            GD-2210-03 thất bại; GD-2210-04 chưa đối soát. Kiểm tra mã ngân hàng trước khi thử lại để tránh chi kép.
          </AppAlert>

          <SectionCard title="Khoản thu cần theo dõi">
            <Stack spacing={2}>
              {RECEIVABLES_TO_WATCH.map((r) => (
                <TwoLineText key={r.id} primary={`${r.id} · ${r.customer}`} secondary={r.note} />
              ))}
            </Stack>
            <ArrowLink onClick={() => navigate('/income')} sx={{ mt: 2.5 }}>Mở quản lý thu</ArrowLink>
          </SectionCard>
        </Stack>
      </Box>
    </>
  )
}
