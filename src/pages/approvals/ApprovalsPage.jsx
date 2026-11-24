import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { AppAlert, EmptyState } from '../../components'
import usePermission from '../../hooks/usePermission'
import { PERMS } from '../../constants/permissions'
import {
  fetchApprovalQueue,
  selectApprovalQueue,
  selectApprovalQueueError,
  selectApprovalQueueLoaded,
} from '../../store/slices/approvalsSlice'
import { fetchExpenseDetail, selectExpenseDetail, selectExpenseDetailError } from '../../store/slices/expensesSlice'
import { selectApprovalCount } from '../../store/slices/notificationsSlice'
import useOnChange from '../../hooks/useOnChange'
import AccountingReviewPage from './AccountingReviewPage'
import ApprovalListPage from './ApprovalListPage'
import DepartmentApprovalPage from './DepartmentApprovalPage'
import FinalApprovalPage from './FinalApprovalPage'

/**
 * /approvals — danh sách mọi hồ sơ trong phạm vi được xem, đủ trạng thái (GET /approvals), hồ sơ chờ tôi in đậm ở đầu.
 * /approvals/:mã — hồ sơ đang chờ tôi: màn 11 / 12 / 13 theo bước của hồ sơ (GET /approvals/queue + GET /expenses/:mã).
 */
export default function ApprovalsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const queue = useSelector(selectApprovalQueue)
  const queueLoaded = useSelector(selectApprovalQueueLoaded)
  const queueError = useSelector(selectApprovalQueueError)
  const loaded = useSelector(selectExpenseDetail)
  const detailError = useSelector(selectExpenseDetailError)
  const canDept = usePermission(PERMS.APPROVAL_DEPT)
  const canAccounting = usePermission(PERMS.APPROVAL_ACCOUNTING)
  const canFinal = usePermission(PERMS.APPROVAL_FINAL)

  const deptQueue = queue.filter((item) => item.step === 'DEPT')
  const targetCode = id

  useEffect(() => {
    dispatch(fetchApprovalQueue())
  }, [dispatch])

  // Server báo số hồ sơ chờ tôi duyệt vừa đổi (có hồ sơ mới / người khác đã xử lý) → tải lại hàng chờ
  useOnChange(useSelector(selectApprovalCount), () => dispatch(fetchApprovalQueue()))

  useEffect(() => {
    if (targetCode) dispatch(fetchExpenseDetail(targetCode))
  }, [dispatch, targetCode])

  const request = loaded && targetCode && (loaded.code === targetCode.toUpperCase() || loaded.id === targetCode) ? loaded : null
  const reload = () => {
    dispatch(fetchApprovalQueue())
    if (targetCode) dispatch(fetchExpenseDetail(targetCode))
  }

  if (queueLoaded && !canDept && !canAccounting && !canFinal && queue.length === 0) {
    return (
      <EmptyState
        variant="no-permission"
        title="Bạn chưa được giao quyền duyệt"
        description="Bạn chưa có quyền duyệt cấp nào và cũng không được ai ủy quyền. Liên hệ quản trị viên nếu cần."
      />
    )
  }

  const errorBanner = queueError && (
    <AppAlert tone="danger" title="Không tải được hàng chờ phê duyệt" sx={{ mb: 2 }}>
      {queueError.message}{' '}
      <Button size="small" onClick={reload}>Thử lại</Button>
    </AppAlert>
  )

  // Danh sách chung cho mọi vai trò duyệt (bảng có cột trạng thái)
  if (!targetCode) return <ApprovalListPage />

  if (!request) {
    if (detailError) {
      return (
        <EmptyState
          variant="no-results"
          title={`Không mở được hồ sơ ${targetCode}`}
          description={detailError.message}
          action={<Button variant="outlined" onClick={() => navigate('/approvals')}>Về hàng chờ</Button>}
        />
      )
    }
    return <EmptyState variant="loading" />
  }

  if (!request.workflow?.canDecide) {
    return (
      <EmptyState
        variant="no-results"
        title={`${request.code} không chờ bạn quyết định`}
        description={
          request.workflow?.step
            ? `Hồ sơ đang ở bước "${request.workflow.stepLabel}"${request.workflow.approverNames.length ? `, chờ ${request.workflow.approverNames.join(', ')}` : ''}.`
            : `Hồ sơ đang ở trạng thái ${request.statusLabel}.`
        }
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate(`/expenses/${request.code}`)}>Xem hồ sơ</Button>
            <Button variant="contained" onClick={() => navigate('/approvals')}>Về hàng chờ</Button>
          </Stack>
        }
      />
    )
  }

  const page =
    request.workflow.step === 'DEPT' ? (
      <DepartmentApprovalPage queue={deptQueue} request={request} loading={false} onReload={reload} />
    ) : request.workflow.step === 'ACCOUNTING' ? (
      <AccountingReviewPage key={`${request.id}-${request.version}`} request={request} queueSize={queue.filter((q) => q.step === 'ACCOUNTING').length} />
    ) : (
      <FinalApprovalPage key={`${request.id}-${request.version}`} request={request} queue={queue.filter((q) => q.step === 'FINAL')} />
    )
  return (
    <>
      {errorBanner}
      {page}
    </>
  )
}
