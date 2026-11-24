import axiosInstance from '../utils/axiosInstance'
import { API_DELEGATIONS, API_DEPARTMENTS, API_SETTINGS } from '../constants/urlConfig'

/**
 * Gọi API màn 22 (server/src/department). Cần quyền "admin.departments".
 *
 * Department: { id, code, name, description, headId, headName, approverId, approverName, memberCount,
 *               status: 'HOAN_THIEN'|'THIEU_NGUOI_DUYET', missing: string[], createdAt, updatedAt }
 * StaffOption: { id, username, email, role, departmentId }
 * Delegation: { id, fromUserId, fromUserName, toUserId, toUserName, departmentId, departmentName, maxAmount,
 *               startDate, endDate, note, status: 'SAP_HIEU_LUC'|'HIEU_LUC'|'HET_HAN'|'DA_THU_HOI', revokedAt, createdAt }
 * Settings: { currency, budgetWarningThreshold, notificationChannel, documentCodePatterns: { expense },
 *             notificationChannels: [{ value, label }], updatedAt, updatedByName }
 */
const departmentsApi = {
  /** GET /departments — data: Department[] */
  list: () => axiosInstance.get(API_DEPARTMENTS),
  /** GET /departments/form-options — data: StaffOption[] (tài khoản đang hoạt động, trừ ADMIN) */
  staffOptions: () => axiosInstance.get(`${API_DEPARTMENTS}/form-options`),
  /** POST /departments — { code, name, description?, headId?, approverId? } */
  create: (body) => axiosInstance.post(API_DEPARTMENTS, body),
  /** PATCH /departments/:id — chỉ gửi trường cần đổi; headId / approverId = '' để bỏ gán */
  update: (id, body) => axiosInstance.patch(`${API_DEPARTMENTS}/${encodeURIComponent(id)}`, body),
  /** DELETE /departments/:id — 409 khi phòng còn nhân sự / dự án / ngân sách / yêu cầu chi */
  remove: (id) => axiosInstance.delete(`${API_DEPARTMENTS}/${encodeURIComponent(id)}`),

  /** GET /delegations — data: Delegation[] */
  listDelegations: () => axiosInstance.get(API_DELEGATIONS),
  /** POST /delegations — { fromUserId, toUserId, departmentId?, maxAmount?, startDate, endDate, note? } */
  createDelegation: (body) => axiosInstance.post(API_DELEGATIONS, body),
  /** DELETE /delegations/:id — thu hồi (giữ lịch sử) */
  revokeDelegation: (id) => axiosInstance.delete(`${API_DELEGATIONS}/${encodeURIComponent(id)}`),

  /** GET /settings — data: Settings */
  getSettings: () => axiosInstance.get(API_SETTINGS),
  /** PUT /settings — { currency?, budgetWarningThreshold?, notificationChannel? } */
  updateSettings: (body) => axiosInstance.put(API_SETTINGS, body),
}

export default departmentsApi
