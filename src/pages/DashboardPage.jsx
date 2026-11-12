import { useSelector } from 'react-redux'
import { selectRole } from '../store/slices/sessionSlice'
import AccountantDashboard from './AccountantDashboard'
import DepartmentDashboard from './DepartmentDashboard'
import EmployeeDashboard from './EmployeeDashboard'
import ExecutiveDashboard from './ExecutiveDashboard'

// Trang "/" hiển thị màn Tổng quan theo vai trò (01–04).
const DASHBOARD_BY_ROLE = {
  NHAN_VIEN: EmployeeDashboard,
  TRUONG_PHONG: DepartmentDashboard,
  KE_TOAN: AccountantDashboard,
  LANH_DAO: ExecutiveDashboard,
  ADMIN: ExecutiveDashboard,
}

export default function DashboardPage() {
  const role = useSelector(selectRole)
  const Dashboard = DASHBOARD_BY_ROLE[role] ?? EmployeeDashboard
  return <Dashboard />
}
