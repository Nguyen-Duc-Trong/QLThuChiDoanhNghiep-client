import axiosInstance from '../utils/axiosInstance'
import { API_APPROVALS } from '../constants/urlConfig'

/**
 * Gọi API phê duyệt chi (server/src/approvals).
 * QueueItem: { id, code, purpose, amount, dueDate, status, statusLabel, step: 'DEPT'|'ACCOUNTING'|'FINAL', stepLabel,
 *              version, submittedAt, requesterName, departmentId, departmentName, budgetLineLabel, availableAmount,
 *              budgetHealth: 'TRONG_HAN_MUC'|'GAN_VUOT'|'VUOT_HAN_MUC'|null, actingForName }
 */
const approvalsApi = {
  /**
   * GET /approvals?page&limit&search&status&view=all|awaiting — mọi hồ sơ (trừ nháp) trong phạm vi được xem, hồ sơ chờ tôi lên đầu.
   * Item: { id, code, purpose, amount, dueDate, status, statusLabel, version, submittedAt, updatedAt, requesterName,
   *         departmentName, awaitingMe, step, stepLabel, actingForName, budgetHealth }
   */
  list: (params) => axiosInstance.get(API_APPROVALS, { params }),
  /** GET /approvals/queue — hồ sơ đang chờ đúng bước tôi được quyết định (kể cả theo ủy quyền) */
  queue: () => axiosInstance.get(`${API_APPROVALS}/queue`),
  /**
   * POST /approvals/:id/decision — { decision: 'DUYET'|'BO_SUNG'|'TU_CHOI', step, version, note?, fields?, checklist? }
   * step + version là bước / phiên bản đang xem; hồ sơ đã đổi thì server trả 409.
   */
  decide: (id, body) => axiosInstance.post(`${API_APPROVALS}/${encodeURIComponent(id)}/decision`, body),
}

export default approvalsApi
