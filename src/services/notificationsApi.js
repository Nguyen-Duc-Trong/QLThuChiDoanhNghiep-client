import axiosInstance from '../utils/axiosInstance'
import { API_NOTIFICATIONS } from '../constants/urlConfig'

/**
 * Số trên menu (server/src/notifications). Kênh chính là SSE `${API_NOTIFICATIONS}/stream` (xem hooks/useNotificationStream);
 * counts() dùng khi kết nối SSE bị từ chối: vừa lấy số, vừa để axios tự refresh phiên nếu access token hết hạn.
 */
const notificationsApi = {
  /** GET /notifications/counts — { approvals, payments } */
  counts: () => axiosInstance.get(`${API_NOTIFICATIONS}/counts`),
  streamUrl: `${API_NOTIFICATIONS}/stream`,
}

export default notificationsApi
