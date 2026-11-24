import axiosInstance from '../utils/axiosInstance'
import { API_PAYMENTS } from '../constants/urlConfig'

/**
 * Gọi API thực hiện chi (server/src/payments). Kế toán tải lên file ủy nhiệm chi rồi Hoàn thành chi; không đối soát ngân hàng.
 *
 * RequestItem: { id, code, purpose, amount, dueDate, overdue, status: 'DA_DUYET'|'DA_THANH_TOAN', statusLabel, requesterName,
 *   departmentName, beneficiaryName, paymentMethod, paymentMethodLabel, finalApprovedAt, paymentCode, paidAt }
 * Payment: { id, code, expenseId, expenseCode, expensePurpose, departmentName, beneficiaryName, beneficiaryBankName,
 *   beneficiaryAccountNumber, amount, paymentMethod, paymentMethodLabel, proofFileName, proofMimeType, proofSize,
 *   sourceAccount?, bankName?, bankRef? (chỉ lệnh chi cũ), executedAt: 'YYYY-MM-DD', executedByName, note, createdAt }
 */
const paymentsApi = {
  /** GET /payments/requests?page&limit&search&status — hồ sơ chờ chi + đã chi, chờ chi lên đầu */
  requests: (params) => axiosInstance.get(`${API_PAYMENTS}/requests`, { params }),
  /** GET /payments/stats — { pending: { count, amount }, thisMonth: { count, amount } } */
  stats: () => axiosInstance.get(`${API_PAYMENTS}/stats`),
  /** GET /payments/transactions?page&limit&search&month=YYYY-MM&source — lịch sử lệnh chi */
  transactions: (params) => axiosInstance.get(`${API_PAYMENTS}/transactions`, { params }),
  /**
   * POST /payments/:expenseId (multipart) — file: ủy nhiệm chi (PDF/JPG/PNG ≤ 10 MB), note?
   * Chi một lần, đủ số tiền đã duyệt; hồ sơ chuyển Hoàn thành.
   */
  execute: (expenseId, { file, note }) => {
    const form = new FormData()
    form.append('file', file)
    if (note) form.append('note', note)
    return axiosInstance.post(`${API_PAYMENTS}/${encodeURIComponent(expenseId)}`, form, { timeout: 60000 })
  },
  /** GET /payments/:expenseId/proof — file ủy nhiệm chi (Blob) */
  proof: (expenseId) => axiosInstance.get(`${API_PAYMENTS}/${encodeURIComponent(expenseId)}/proof`, { responseType: 'blob' }),
}

export default paymentsApi
