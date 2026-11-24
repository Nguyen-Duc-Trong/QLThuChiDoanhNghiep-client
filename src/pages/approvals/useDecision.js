import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { TOAST_OPTIONS, useToast } from '../../components'
import { decideExpense, fetchApprovalQueue, selectApprovalDeciding, selectApprovalQueue } from '../../store/slices/approvalsSlice'
import { fetchExpenseDetail } from '../../store/slices/expensesSlice'

const DECISION_OF_TYPE = { approve: 'DUYET', changes: 'BO_SUNG', reject: 'TU_CHOI' }

const TOAST = {
  approve: {
    DEPT: (code) => `Đã duyệt ${code}, hồ sơ chuyển kế toán thẩm định`,
    ACCOUNTING: (code) => `Đã duyệt kế toán ${code}, hồ sơ chuyển lãnh đạo duyệt cuối`,
    FINAL: (code) => `Đã duyệt cuối ${code}, hồ sơ chuyển kế toán thực hiện chi`,
  },
  changes: (code) => `Đã gửi yêu cầu bổ sung ${code}; bản gửi lại sẽ duyệt lại từ trưởng phòng`,
  reject: (code) => `Đã từ chối ${code}`,
}

/**
 * Ghi nhận quyết định cho hồ sơ đang xem (request = GET /expenses/:id).
 * Xong thì mở hồ sơ kế tiếp cùng bước trong hàng chờ, hết thì về /approvals.
 * Hồ sơ đã bị người khác xử lý / gửi lại (409) → tải lại hồ sơ để người duyệt xem hiện trạng.
 */
export default function useDecision(request) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const showToast = useToast()
  const queue = useSelector(selectApprovalQueue)
  const deciding = useSelector(selectApprovalDeciding)
  const [decision, setDecision] = useState(null)

  const confirm = async ({ type, reason, fields }, extra = {}) => {
    const step = request.workflow.step
    try {
      await dispatch(
        decideExpense({
          id: request.id,
          decision: DECISION_OF_TYPE[type],
          step,
          version: request.version,
          note: reason || extra.note || undefined,
          fields: type === 'changes' ? fields : undefined,
          checklist: extra.checklist,
        }),
      ).unwrap()
      setDecision(null)
      const message = type === 'approve' ? TOAST.approve[step](request.code) : TOAST[type](request.code)
      showToast(message, type === 'approve' ? 'success' : type === 'changes' ? 'warning' : 'info')
      const next = queue.find((item) => item.id !== request.id && item.step === step)
      dispatch(fetchApprovalQueue())
      navigate(next ? `/approvals/${next.code}` : '/approvals', { replace: true })
    } catch (error) {
      setDecision(null)
      showToast(error?.message || 'Ghi nhận quyết định thất bại', 'error', TOAST_OPTIONS.fromError(error))
      if (error?.response?.status === 409) {
        dispatch(fetchExpenseDetail(request.code))
        dispatch(fetchApprovalQueue())
      }
    }
  }

  return { decision, setDecision, confirm, deciding }
}
