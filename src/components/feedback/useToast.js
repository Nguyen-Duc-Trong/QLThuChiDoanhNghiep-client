import { useContext } from 'react'
import { ToastContext } from './toastContext'

/**
 * const showToast = useToast()
 * showToast('Yêu cầu CHI-1024 đã được gửi thành công', 'success')
 * showToast('Không thể gửi yêu cầu: vượt ngân sách', 'error')
 * showToast('Phiên đăng nhập đã hết hạn', 'warning', { persistent: true })
 * showToast('Đã lưu nháp', 'info', { autoHideDuration: 1500 })
 */
export default function useToast() {
  const showToast = useContext(ToastContext)
  if (!showToast) throw new Error('useToast phải được dùng bên trong <ToastProvider>')
  return showToast
}
