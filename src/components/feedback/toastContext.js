import { createContext } from 'react'

export const ToastContext = createContext(null)

export const DEFAULT_AUTO_HIDE_DURATION = 3000
const PERSISTENT_TOAST_OPTIONS = Object.freeze({ persistent: true })

/**
 * Tùy chọn dùng sẵn cho showToast:
 *   showToast('...', 'error', TOAST_OPTIONS.PERSISTENT)        // không tự tắt
 *   showToast(message, 'error', TOAST_OPTIONS.fromError(error)) // lỗi mạng/401/403/5xx thì giữ lại
 */
export const TOAST_OPTIONS = Object.freeze({
  PERSISTENT: PERSISTENT_TOAST_OPTIONS,
  fromError: (error) => {
    const status = error?.response?.status
    return !status || status === 401 || status === 403 || status >= 500 ? PERSISTENT_TOAST_OPTIONS : undefined
  },
})
