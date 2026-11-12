import { StatusBadge, TwoLineText } from '../components'
import { formatDate, formatMoney } from '../utils/format'

// Cột bảng yêu cầu chi dùng chung cho Tổng quan và danh sách "Yêu cầu chi của tôi".
export const EXPENSE_COLUMNS = [
  { key: 'id', header: 'Mã / Nội dung', render: (r) => <TwoLineText primary={r.id} secondary={r.title} /> },
  { key: 'amount', header: 'Số tiền', align: 'right', render: (r) => formatMoney(r.amount) },
  { key: 'status', header: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'dueDate', header: 'Cần chi', render: (r) => formatDate(r.dueDate) },
]
