import axiosInstance from '../utils/axiosInstance'
import { API_EXPENSES } from '../constants/urlConfig'

/**
 * Gọi API yêu cầu chi (server/src/expenses).
 *
 * Body lưu / gửi (mọi trường đều có thể rỗng khi lưu nháp):
 * { purpose, amount, categoryId, projectId, budgetLineId, dueDate: 'YYYY-MM-DD', beneficiaryName,
 *   beneficiaryBankName, beneficiaryAccountNumber, paymentMethod: 'CHUYEN_KHOAN'|'TIEN_MAT', note }
 *
 * Expense trả về: các trường trên + { id, code, status, statusLabel, paymentMethodLabel, categoryName, projectName,
 *   departmentName, budgetLine: BudgetLine|null, submittedAt, createdAt, updatedAt }
 * BudgetLine: { id, periodId, periodName, departmentName, categoryId, categoryName, label,
 *   plannedAmount, spentAmount, committedAmount, availableAmount }
 */
const expensesApi = {
  /** GET /expenses/form-options — { department, categories, projects, periods, budgetLines } */
  formOptions: () => axiosInstance.get(`${API_EXPENSES}/form-options`),
  /** POST /expenses — tạo bản nháp (server cấp mã CHI-YYYYMM-XXXX) */
  createDraft: (body) => axiosInstance.post(API_EXPENSES, body),
  /** PATCH /expenses/:id — lưu bản nháp đã có */
  updateDraft: (id, body) => axiosInstance.patch(`${API_EXPENSES}/${encodeURIComponent(id)}`, body),
  /** POST /expenses/submit — tạo và gửi phê duyệt luôn */
  createAndSubmit: (body) => axiosInstance.post(`${API_EXPENSES}/submit`, body),
  /** POST /expenses/:id/submit — lưu rồi gửi phê duyệt; hồ sơ Cần bổ sung thì gửi lại thành phiên bản mới */
  submit: (id, body) => axiosInstance.post(`${API_EXPENSES}/${encodeURIComponent(id)}/submit`, body),
  /**
   * GET /expenses/:idOrCode — nhận id hoặc mã CHI-YYYYMM-XXXX. Thêm so với Expense:
   * { requesterName, approvals: ApprovalRecord[], versions: [{ version, submittedAt, submittedByName, snapshot }],
   *   workflow: { step, stepLabel, approverNames, blockedReason, canDecide, actingForName }, canEdit, canCancel }
   * ApprovalRecord: { id, version, step, stepLabel, decision: 'DUYET'|'BO_SUNG'|'TU_CHOI'|'BO_QUA', decisionLabel,
   *   actorName, onBehalfOfName, note, fields, checklist, createdAt }
   */
  getById: (id) => axiosInstance.get(`${API_EXPENSES}/${encodeURIComponent(id)}`),
  /** GET /expenses?page&limit&search&status — yêu cầu chi của tôi; data: [{ id, code, purpose, amount, status, dueDate, version, ... }] */
  list: (params) => axiosInstance.get(API_EXPENSES, { params }),
  /** GET /expenses/stats — { total, inReview, needChanges, paid }: mỗi mục { count, amount } */
  stats: () => axiosInstance.get(`${API_EXPENSES}/stats`),
  /** POST /expenses/:id/cancel — hủy hồ sơ Nháp / Cần bổ sung */
  cancel: (id) => axiosInstance.post(`${API_EXPENSES}/${encodeURIComponent(id)}/cancel`),
}

export default expensesApi
