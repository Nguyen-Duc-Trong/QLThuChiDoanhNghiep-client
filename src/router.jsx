import { Navigate, createBrowserRouter } from 'react-router'
import { EmptyState } from './components'
import RootLayout from './layouts/RootLayout'
import RouteErrorPage from './pages/RouteErrorPage'

// Mỗi trang được tải lười (code splitting) để giảm dung lượng tải lần đầu.
const page = (load) => async () => ({ Component: (await load()).default })

const router = createBrowserRouter([
  // Trang đăng nhập không dùng khung sidebar/topbar.
  { path: '/login', lazy: page(() => import('./pages/LoginPage')), errorElement: <RouteErrorPage /> },
  {
    path: '/',
    Component: RootLayout,
    hydrateFallbackElement: <EmptyState variant="loading" />,
    children: [
      {
        // Route không path chỉ để bắt lỗi: lỗi ở một trang không làm mất sidebar/topbar.
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, lazy: page(() => import('./pages/DashboardPage')) },
          {
            path: 'expenses',
            handle: { crumb: 'Yêu cầu chi' },
            children: [
              { index: true, lazy: page(() => import('./pages/ExpenseListPage')) },
              { path: 'new', handle: { crumb: 'Tạo yêu cầu chi' }, lazy: page(() => import('./pages/CreateExpensePage')) },
              { path: ':id', handle: { crumb: (match) => match.params.id }, lazy: page(() => import('./pages/ExpenseDetailPage')) },
              { path: ':id/resubmit', handle: { crumb: 'Bổ sung hồ sơ' }, lazy: page(() => import('./pages/ResubmitExpensePage')) },
            ],
          },
          {
            path: 'admin',
            handle: { crumb: 'Quản trị hệ thống', roles: ['ADMIN'] },
            children: [
              { index: true, element: <Navigate to="users" replace /> },
              { path: 'users', handle: { crumb: 'Người dùng' }, lazy: page(() => import('./pages/UsersPage')) },
              { path: 'roles', handle: { crumb: 'Vai trò & phân quyền' }, lazy: page(() => import('./pages/admin/RolesPage')) },
              { path: 'departments', handle: { crumb: 'Phòng ban & cấu hình' }, lazy: page(() => import('./pages/admin/DepartmentsPage')) },
              { path: 'categories', handle: { crumb: 'Danh mục' }, lazy: page(() => import('./pages/admin/CategoriesPage')) },
            ],
          },
          {
            path: 'income',
            handle: { crumb: 'Quản lý thu' },
            children: [
              { index: true, lazy: page(() => import('./pages/IncomeListPage')) },
              { path: 'new', handle: { crumb: 'Đề nghị ghi nhận thu' }, lazy: page(() => import('./pages/CreateIncomePage')) },
              { path: ':id', handle: { crumb: (match) => match.params.id }, lazy: page(() => import('./pages/IncomeDetailPage')) },
            ],
          },
          {
            path: 'approvals',
            handle: { crumb: 'Phê duyệt', roles: ['TRUONG_PHONG', 'KE_TOAN', 'LANH_DAO', 'ADMIN'] },
            children: [
              { index: true, lazy: page(() => import('./pages/approvals/ApprovalsPage')) },
              { path: ':id', handle: { crumb: (match) => match.params.id }, lazy: page(() => import('./pages/approvals/ApprovalsPage')) },
            ],
          },
          {
            path: 'payments',
            handle: { crumb: 'Thanh toán', roles: ['KE_TOAN', 'LANH_DAO', 'ADMIN'] },
            children: [
              { index: true, lazy: page(() => import('./pages/payments/TransactionsPage')) },
              {
                path: ':id',
                handle: { crumb: (match) => `Thực hiện chi ${match.params.id}`, roles: ['KE_TOAN', 'ADMIN'] },
                lazy: page(() => import('./pages/payments/ExecutePaymentPage')),
              },
            ],
          },
          {
            path: 'budgets',
            handle: { crumb: 'Ngân sách' },
            children: [
              { index: true, lazy: page(() => import('./pages/budgets/BudgetsPage')) },
              {
                path: 'allocation',
                handle: { crumb: 'Phân bổ ngân sách', roles: ['KE_TOAN', 'LANH_DAO', 'ADMIN'] },
                lazy: page(() => import('./pages/budgets/BudgetAllocationPage')),
              },
              { path: ':departmentId', handle: { crumb: 'Chi tiết phòng ban' }, lazy: page(() => import('./pages/budgets/BudgetsPage')) },
            ],
          },
          { path: 'activity', handle: { crumb: 'Nhật ký & thông báo' }, lazy: page(() => import('./pages/ActivityPage')) },
          ...(import.meta.env.DEV
            ? [{ path: 'ui', handle: { crumb: 'Thư viện UI' }, lazy: page(() => import('./pages/ComponentGallery')) }]
            : []),
          { path: '*', lazy: page(() => import('./pages/NotFoundPage')) },
        ],
      },
    ],
  },
])

export default router
