import paymentsApi from '../services/paymentsApi'

export const PROOF_ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png'
export const PROOF_MAX_SIZE = 10 * 1024 * 1024
const PROOF_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png']

/** Lỗi của file ủy nhiệm chi trước khi gửi (khớp kiểm tra ở server), hoặc null nếu hợp lệ */
export function proofFileError(file) {
  if (!file) return 'Tải lên file ủy nhiệm chi.'
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!PROOF_EXTENSIONS.includes(ext)) return 'Chỉ nhận file PDF, JPG hoặc PNG.'
  if (file.size > PROOF_MAX_SIZE) return 'File tối đa 10 MB.'
  return null
}

/**
 * Mở file ủy nhiệm chi ở tab mới. Tải qua axios (kèm cookie, tự refresh token) rồi mở bằng object URL.
 * Mở tab trước khi chờ tải để trình duyệt không chặn popup.
 */
export async function openPaymentProof(expenseId) {
  const win = window.open('', '_blank')
  try {
    const blob = await paymentsApi.proof(expenseId)
    const url = URL.createObjectURL(blob)
    if (win) win.location.href = url
    else window.location.href = url
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (error) {
    win?.close()
    throw error
  }
}
