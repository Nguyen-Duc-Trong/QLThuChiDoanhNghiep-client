import { createBrowserRouter } from 'react-router'
import { EmptyState } from './components'
import RootLayout from './layouts/RootLayout'
import { PERMS } from './constants/permissions'
import { AdminIndexRedirect } from './pages/admin/AdminTabs'
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
          { index: true, handle: { permissions: [PERMS.DASHBOARD_MENU] }, lazy: page(() => import('./pages/DashboardPage')) },
          {
            path: 'expenses',
            handle: { crumb: 'Yêu cầu chi', permissions: [PERMS.EXPENSE_MENU] },
            children: [
              { index: true, lazy: page(() => import('./pages/ExpenseListPage')) },
              { path: 'new', handle: { crumb: 'Tạo yêu cầu chi', permissions: [PERMS.EXPENSE_CREATE] }, lazy: page(() => import('./pages/CreateExpensePage')) },
              { path: ':id', handle: { crumb: (match) => match.params.id }, lazy: page(() => import('./pages/ExpenseDetailPage')) },
              { path: ':id/resubmit', handle: { crumb: 'Bổ sung hồ sơ', permissions: [PERMS.EXPENSE_EDIT] }, lazy: page(() => import('./pages/ResubmitExpensePage')) },
            ],
          },
          {
            path: 'admin',
            handle: { crumb: 'Quản trị hệ thống', permissions: [PERMS.ADMIN_MENU] },
            children: [
              { index: true, Component: AdminIndexRedirect },
              { path: 'users', handle: { crumb: 'Người dùng', permissions: [PERMS.ADMIN_USERS] }, lazy: page(() => import('./pages/UsersPage')) },
              { path: 'roles', handle: { crumb: 'Vai trò & phân quyền', permissions: [PERMS.ADMIN_ROLES] }, lazy: page(() => import('./pages/admin/RolesPage')) },
              { path: 'departments', handle: { crumb: 'Phòng ban & cấu hình', permissions: [PERMS.ADMIN_DEPARTMENTS] }, lazy: page(() => import('./pages/admin/DepartmentsPage')) },
              { path: 'categories', handle: { crumb: 'Danh mục', permissions: [PERMS.ADMIN_CATEGORIES] }, lazy: page(() => import('./pages/admin/CategoriesPage')) },
            ],
          },
          {
            path: 'income',
            handle: { crumb: 'Quản lý thu', permissions: [PERMS.INCOME_MENU] },
            children: [
              { index: true, lazy: page(() => import('./pages/IncomeListPage')) },
              { path: 'new', handle: { crumb: 'Đề nghị ghi nhận thu', permissions: [PERMS.INCOME_CREATE] }, lazy: page(() => import('./pages/CreateIncomePage')) },
              { path: ':id', handle: { crumb: (match) => match.params.id }, lazy: page(() => import('./pages/IncomeDetailPage')) },
            ],
          },
          {
            path: 'approvals',
            handle: { crumb: 'Phê duyệt', permissions: [PERMS.APPROVAL_MENU] },
            children: [
              { index: true, lazy: page(() => import('./pages/approvals/ApprovalsPage')) },
              { path: ':id', handle: { crumb: (match) => match.params.id }, lazy: page(() => import('./pages/approvals/ApprovalsPage')) },
            ],
          },
          {
            path: 'payments',
            handle: { crumb: 'Thanh toán', permissions: [PERMS.PAYMENT_MENU] },
            children: [
              { index: true, lazy: page(() => import('./pages/payments/TransactionsPage')) },
              {
                path: ':id',
                handle: { crumb: (match) => `Thực hiện chi ${match.params.id}`, permissions: [PERMS.PAYMENT_EXECUTE] },
                lazy: page(() => import('./pages/payments/ExecutePaymentPage')),
              },
            ],
          },
          {
            path: 'budgets',
            handle: { crumb: 'Ngân sách', permissions: [PERMS.BUDGET_MENU] },
            children: [
              { index: true, lazy: page(() => import('./pages/budgets/BudgetsPage')) },
              {
                path: 'allocation',
                handle: { crumb: 'Phân bổ ngân sách', permissions: [PERMS.BUDGET_ALLOCATE] },
                lazy: page(() => import('./pages/budgets/BudgetAllocationPage')),
              },
              { path: ':departmentId', handle: { crumb: 'Chi tiết phòng ban' }, lazy: page(() => import('./pages/budgets/BudgetsPage')) },
            ],
          },
          { path: 'activity', handle: { crumb: 'Nhật ký & thông báo', permissions: [PERMS.ACTIVITY_MENU] }, lazy: page(() => import('./pages/ActivityPage')) },
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
