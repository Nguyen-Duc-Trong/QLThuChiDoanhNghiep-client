import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import notificationsApi from '../services/notificationsApi'
import { setMenuCounts } from '../store/slices/notificationsSlice'

const RETRY_MIN_MS = 3_000
const RETRY_MAX_MS = 60_000

/**
 * Mở kết nối SSE nhận số trên menu do server đẩy (không hỏi định kỳ).
 * - Mất kết nối tạm thời: trình duyệt tự kết nối lại.
 * - Server từ chối (vd access token hết hạn → 401): gọi GET /notifications/counts qua axios để tự refresh phiên
 *   và lấy số, rồi mở lại kết nối với thời gian chờ tăng dần (3s → 60s).
 * enabled = false (chưa đăng nhập / không có menu cần số) thì không kết nối.
 */
export default function useNotificationStream(enabled) {
  const dispatch = useDispatch()

  useEffect(() => {
    if (!enabled) return undefined
    let source = null
    let retryTimer = null
    let delay = RETRY_MIN_MS
    let stopped = false

    const onCounts = (event) => {
      try {
        dispatch(setMenuCounts(JSON.parse(event.data)))
      } catch {
        // Bỏ qua dữ liệu hỏng, lần đẩy sau sẽ đúng
      }
    }

    const connect = () => {
      source = new EventSource(notificationsApi.streamUrl, { withCredentials: true })
      source.addEventListener('counts', onCounts)
      source.onopen = () => {
        delay = RETRY_MIN_MS
      }
      source.onerror = () => {
        if (source.readyState !== EventSource.CLOSED || stopped) return
        source.close()
        retryTimer = setTimeout(async () => {
          try {
            dispatch(setMenuCounts((await notificationsApi.counts()).data))
          } catch {
            // Hết phiên thì axios tự báo store; lỗi mạng thì thử lại sau
          }
          if (!stopped) connect()
        }, delay)
        delay = Math.min(delay * 2, RETRY_MAX_MS)
      }
    }

    connect()
    return () => {
      stopped = true
      clearTimeout(retryTimer)
      source?.close()
    }
  }, [enabled, dispatch])
}
