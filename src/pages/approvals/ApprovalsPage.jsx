import { useNavigate, useParams } from 'react-router'
import Button from '@mui/material/Button'
import { useSelector } from 'react-redux'
import { EmptyState } from '../../components'
import { ACCOUNTING_QUEUE, CHI_1024, FINAL_QUEUE } from '../../mocks/approvals'
import { selectRole } from '../../store/slices/sessionSlice'
import AccountingReviewPage from './AccountingReviewPage'
import ApprovalQueuePage from './ApprovalQueuePage'
import DepartmentApprovalPage from './DepartmentApprovalPage'
import FinalApprovalPage from './FinalApprovalPage'

// Hồ sơ trong hàng chờ: CHI-1024 có đủ dữ liệu mẫu, các hồ sơ khác dùng dữ liệu hàng chờ + phần chung của CHI-1024.
function findRequest(queue, id) {
  const row = queue.find((r) => r.id === id)
  if (!row) return null
  if (id === CHI_1024.id) return CHI_1024
  return { ...CHI_1024, ...row, purpose: `${row.title} · Đề nghị của ${row.requester}, phòng ${row.department}.`, budgetLine: row.department }
}

/**
 * Trang /approvals và /approvals/:id hiển thị theo vai trò:
 * - Trưởng phòng: màn 11 (hàng chờ + hồ sơ trên cùng một màn).
 * - Kế toán: hàng chờ thẩm định → màn 12.
 * - Lãnh đạo / Admin: hàng chờ duyệt cuối → màn 13.
 */
export default function ApprovalsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const role = useSelector(selectRole)

  if (role === 'TRUONG_PHONG') return <DepartmentApprovalPage />

  const isAccounting = role === 'KE_TOAN'
  const queue = isAccounting ? ACCOUNTING_QUEUE : FINAL_QUEUE

  if (!id) {
    return isAccounting ? (
      <ApprovalQueuePage
        eyebrow="12 / KẾ TOÁN"
        title="Hàng chờ thẩm định"
        description="Hồ sơ đã được trưởng phòng duyệt, chờ kế toán đối chiếu chứng từ và ngân sách."
        rows={queue}
        notice={{ title: 'Chỉ hồ sơ sau cấp phòng', message: 'Kế toán không tự duyệt hồ sơ do mình tạo; hồ sơ đó chuyển cho người được ủy quyền.' }}
      />
    ) : (
      <ApprovalQueuePage
        eyebrow="13 / LÃNH ĐẠO"
        title="Chờ phê duyệt cuối"
        description="Hồ sơ đã qua trưởng phòng và kế toán, chờ lãnh đạo quyết định."
        rows={queue}
        showBudget
        notice={{ title: 'Phê duyệt không phải là thanh toán', message: 'Sau khi duyệt cuối, kế toán mới thực hiện chi và đối soát giao dịch.' }}
      />
    )
  }

  const request = findRequest(queue, id)
  if (!request) {
    return (
      <EmptyState
        variant="no-results"
        title={`${id} không có trong hàng chờ của bạn`}
        description="Hồ sơ đã được xử lý hoặc chưa đến bước của bạn."
        action={<Button variant="outlined" onClick={() => navigate('/approvals')}>Về hàng chờ</Button>}
      />
    )
  }

  return isAccounting ? <AccountingReviewPage key={request.id} request={request} /> : <FinalApprovalPage key={request.id} request={request} />
}
