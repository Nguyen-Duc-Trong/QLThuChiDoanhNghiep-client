import { memo, useCallback, useEffect, useState } from 'react'
import Collapse from '@mui/material/Collapse'
import Slide from '@mui/material/Slide'
import { DEFAULT_AUTO_HIDE_DURATION, ToastContext } from './toastContext'
import { StyledAlert, ToastContainer } from './ToastProvider.styles'

const ToastItem = memo(function ToastItem({ toast, onClose }) {
  const [open, setOpen] = useState(true)

  const handleClose = useCallback(() => setOpen(false), [])
  const handleExited = useCallback(() => onClose(toast.id), [onClose, toast.id])

  useEffect(() => {
    if (!toast.autoHideDuration) return undefined
    const timer = setTimeout(handleClose, toast.autoHideDuration)
    return () => clearTimeout(timer)
  }, [toast.autoHideDuration, handleClose])

  return (
    <Collapse in={open} onExited={handleExited} unmountOnExit>
      <Slide direction="left" in={open} appear mountOnEnter unmountOnExit>
        <StyledAlert
          onClose={handleClose}
          severity={toast.severity}
          role={toast.severity === 'error' ? 'alert' : 'status'}
          slotProps={{ closeButton: { 'aria-label': 'Đóng thông báo' } }}
        >
          {toast.message}
        </StyledAlert>
      </Slide>
    </Collapse>
  )
})

/**
 * Bọc ứng dụng để dùng useToast() ở bất kỳ đâu.
 * Hiển thị nhiều thông báo xếp chồng; mỗi cái tự tắt sau 3 giây trừ khi persistent.
 */
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }, [])

  /** showToast(message, severity = 'info', { persistent, autoHideDuration | duration }) */
  const showToast = useCallback((message, severity = 'info', options = {}) => {
    if (!message && typeof message !== 'number') return

    const defaultDuration = options?.persistent === true ? null : DEFAULT_AUTO_HIDE_DURATION
    const autoHideDuration = options?.autoHideDuration ?? options?.duration ?? defaultDuration
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    setToasts((prev) => [...prev, { id, message, severity, autoHideDuration }])
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <ToastContainer>
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onClose={removeToast} />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  )
}
