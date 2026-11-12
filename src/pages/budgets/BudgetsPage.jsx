import { useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import Button from '@mui/material/Button'
import { EmptyState } from '../../components'
import { selectRole } from '../../store/slices/sessionSlice'
import BudgetOverviewPage from './BudgetOverviewPage'
import DepartmentBudgetPage from './DepartmentBudgetPage'

// Phòng ban có dữ liệu chi tiết theo khoản mục (hiện chỉ Marketing).
const DETAIL_DEPARTMENTS = ['marketing']

/**
 * /budgets: kế toán, lãnh đạo, admin xem tổng quan toàn công ty (màn 17);
 * trưởng phòng, nhân viên xem ngân sách phòng mình (màn 19).
 * /budgets/:departmentId: chi tiết một phòng ban (màn 19).
 */
export default function BudgetsPage() {
  const { departmentId } = useParams()
  const navigate = useNavigate()
  const role = useSelector(selectRole)
  const companyWide = ['KE_TOAN', 'LANH_DAO', 'ADMIN'].includes(role)

  if (!departmentId) return companyWide ? <BudgetOverviewPage /> : <DepartmentBudgetPage />

  if (!companyWide && departmentId !== 'marketing') return <EmptyState variant="no-permission" />
  if (!DETAIL_DEPARTMENTS.includes(departmentId)) {
    return (
      <EmptyState
        title="Chưa có chi tiết khoản mục"
        description="Phòng ban này chưa có dữ liệu chi tiết theo khoản mục trong kỳ đang xem."
        action={<Button variant="outlined" onClick={() => navigate('/budgets')}>Về tổng quan ngân sách</Button>}
      />
    )
  }
  return <DepartmentBudgetPage />
}
