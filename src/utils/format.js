const numberFormatter = new Intl.NumberFormat('vi-VN')

// 48000000 -> "48.000.000 VND"
export function formatMoney(value, { unit = true } = {}) {
  if (value === null || value === undefined || value === '') return '—'
  const text = numberFormatter.format(Number(value))
  return unit ? `${text} VND` : text
}

// 240000000 -> "240" (đơn vị triệu)
export function toMillions(value) {
  return numberFormatter.format(Math.round(Number(value) / 1_000_000))
}

// Chuỗi người dùng gõ -> số nguyên (bỏ dấu chấm phân cách).
export function parseMoney(text) {
  const digits = String(text ?? '').replace(/\D/g, '')
  return digits ? Number(digits) : null
}

function pad(n) {
  return String(n).padStart(2, '0')
}

// Date | ISO string -> "25/10/2026"
export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

// Date | ISO string -> "20/10/2026 09:15"
export function formatDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// "Nguyễn Mai Anh" -> "MA"
export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase()
}
