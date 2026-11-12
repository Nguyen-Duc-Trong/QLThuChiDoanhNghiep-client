import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { ArrowRight, Plus } from 'lucide-react'
import {
  AppAlert,
  BudgetCard,
  DataTable,
  PageHeader,
  PeriodPicker,
  SectionCard,
  StatCard,
  StatGrid,
  StatusBadge,
  TodoCard,
} from '../components'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../store/slices/sessionSlice'
import { EXPENSE_COLUMNS } from '../constants/expenseColumns'
import { EXPENSES, MARKETING_BUDGET } from '../mocks/data'

// Màn 01 · Tổng quan của bạn (nhân viên).
const RECENT_REQUESTS = EXPENSES.slice(0, 5)

export default function EmployeeDashboard() {
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const [period, setPeriod] = useState('2026-10')
  const firstName = user.name.split(' ').slice(-2).join(' ')

  return (
    <>
      <PageHeader
        eyebrow="01 / NHÂN VIÊN"
        title="Tổng quan của bạn"
        description={`Chào ${firstName}, bạn có 1 yêu cầu cần bổ sung trước khi được xem xét tiếp.`}
        actions={
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate('/expenses/new')}>
            Tạo yêu cầu chi
          </Button>
        }
        tags={<StatusBadge label="Phạm vi cá nhân" tone="primary" />}
        toolbar={<PeriodPicker value={period} onChange={setPeriod} />}
      />

      <StatGrid>
        <StatCard label="Yêu cầu trong tháng" value="12" caption="Tổng đề nghị 186.500.000 VND" />
        <StatCard label="Đang xét duyệt" value="4" caption="Chưa đồng nghĩa với đã thanh toán" />
        <StatCard label="Cần bổ sung" value="1" tone="warning" caption="CHI-1021 · Hạn 23/10" />
        <StatCard label="Đã thanh toán" value="96.000.000" tone="success" caption="VND · 5 yêu cầu hoàn tất" />
      </StatGrid>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 372px' }, gap: 3, alignItems: 'start' }}>
        <Stack spacing={3}>
          <SectionCard
            title="Yêu cầu gần đây"
            action={
              <Link
                component="button"
                underline="hover"
                onClick={() => navigate('/expenses')}
                sx={{ fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
              >
                Xem tất cả <ArrowRight size={14} />
              </Link>
            }
          >
            <DataTable columns={EXPENSE_COLUMNS} rows={RECENT_REQUESTS} onRowClick={(r) => navigate(`/expenses/${r.id}`)} />
          </SectionCard>

          <AppAlert tone="info" title="Đề nghị ghi nhận thu cũng được theo dõi riêng">
            THU-1009 · Chờ kế toán kiểm tra. Bạn chỉ gửi thông tin thu; kế toán mới xác nhận tiền thực nhận.
          </AppAlert>
        </Stack>

        <Stack spacing={3}>
          <TodoCard
            subtitle="Ưu tiên trong hôm nay"
            badge={{ label: 'Cần bổ sung · CHI-1021', tone: 'warning' }}
            heading="Bổ sung hóa đơn VAT hợp lệ"
            description="Lê Thu Hà yêu cầu ngày 21/10. Hồ sơ gửi lại sẽ bắt đầu từ trưởng phòng."
            actionLabel="Bổ sung hồ sơ"
            onAction={() => navigate('/expenses/CHI-1021/resubmit')}
          />
          <BudgetCard
            {...MARKETING_BUDGET}
            alert={{
              tone: 'success',
              title: 'Trong hạn mức',
              message: 'Yêu cầu 48.000.000 VND. Còn 132.000.000 VND nếu được duyệt; không trừ cam kết lần thứ hai.',
            }}
          />
        </Stack>
      </Box>
    </>
  )
}
