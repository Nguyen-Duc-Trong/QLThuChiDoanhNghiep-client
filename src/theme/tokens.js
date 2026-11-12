// Design tokens lấy từ thiết kế Figma "An Việt – Quản trị tài chính".

export const colors = {
  primary: '#4F46E5',
  primaryDark: '#4338CA',
  primarySoft: '#EEF0FF',
  background: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F8FA',
  border: '#E6E8EC',
  borderStrong: '#D5D8DE',
  text: '#1F2433',
  textSecondary: '#5B6170',
  textMuted: '#8A90A0',
  footer: '#1E2742',
}

// Cặp màu chữ / nền cho badge, alert, số liệu theo tông.
export const tones = {
  neutral: { fg: '#5B6170', bg: '#F1F2F4', border: '#E1E3E8' },
  primary: { fg: '#4F46E5', bg: '#EEF0FF', border: '#D9DCFB' },
  info: { fg: '#2F5FD0', bg: '#EDF3FF', border: '#D6E3FD' },
  success: { fg: '#1E7F4F', bg: '#E9F6EF', border: '#C9EAD7' },
  warning: { fg: '#B4610E', bg: '#FFF4E0', border: '#F8DFB4' },
  danger: { fg: '#D23B3B', bg: '#FDECEC', border: '#F7CFCF' },
}

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
}

export const layout = {
  sidebarWidth: 224,
  topbarHeight: 76,
  drawerWidth: 330,
}
