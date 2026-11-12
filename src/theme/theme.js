import { createTheme } from '@mui/material/styles'
import { colors, radius, tones } from './tokens'

const fontFamily = '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

// Nút "soft": nền nhạt, chữ đậm (ví dụ nút "Từ chối", "Khóa", "Mở khóa").
const softButton = (tone) => ({
  props: { variant: 'soft', color: tone === 'danger' ? 'error' : tone },
  style: {
    color: tones[tone].fg,
    backgroundColor: tones[tone].bg,
    '&:hover': { backgroundColor: tones[tone].border },
  },
})

const theme = createTheme({
  palette: {
    primary: { main: colors.primary, dark: colors.primaryDark, light: colors.primarySoft, contrastText: '#fff' },
    success: { main: tones.success.fg, light: tones.success.bg },
    warning: { main: tones.warning.fg, light: tones.warning.bg },
    error: { main: tones.danger.fg, light: tones.danger.bg },
    info: { main: tones.info.fg, light: tones.info.bg },
    background: { default: colors.background, paper: colors.surface },
    text: { primary: colors.text, secondary: colors.textSecondary, disabled: colors.textMuted },
    divider: colors.border,
  },
  shape: { borderRadius: radius.md },
  typography: {
    fontFamily,
    h1: { fontSize: 28, fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.01em' },
    h2: { fontSize: 20, fontWeight: 600, lineHeight: 1.35 },
    h3: { fontSize: 16, fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: 14, lineHeight: 1.55 },
    body2: { fontSize: 13, lineHeight: 1.5 },
    caption: { fontSize: 12, lineHeight: 1.45, color: colors.textSecondary },
    overline: { fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', lineHeight: 1.4 },
    button: { textTransform: 'none', fontWeight: 600, fontSize: 14 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: colors.background } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: radius.md, paddingInline: 16, minHeight: 40 },
        sizeSmall: { minHeight: 30, paddingInline: 10, fontSize: 12 },
        outlined: {
          borderColor: colors.border,
          color: colors.text,
          backgroundColor: colors.surface,
          '&:hover': { borderColor: colors.borderStrong, backgroundColor: colors.surfaceMuted },
        },
      },
      variants: ['primary', 'info', 'success', 'warning', 'danger'].map(softButton),
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: radius.md } },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        outlined: { borderColor: colors.border, borderRadius: radius.lg },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          backgroundColor: colors.surface,
          fontSize: 14,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.borderStrong },
        },
        input: { paddingBlock: 10 },
      },
    },
    MuiFormHelperText: {
      styleOverrides: { root: { marginInline: 0, marginTop: 6, fontSize: 12 } },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: colors.border, fontSize: 14, paddingBlock: 14 },
        head: {
          backgroundColor: colors.surfaceMuted,
          color: colors.textSecondary,
          fontSize: 12,
          fontWeight: 500,
          paddingBlock: 10,
          borderBottom: 'none',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 40, borderBottom: `1px solid ${colors.border}` },
        indicator: { height: 2 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', minHeight: 40, minWidth: 0, paddingInline: 0, marginRight: 24, fontWeight: 500, fontSize: 14 },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500, borderRadius: radius.sm } },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 6, borderRadius: 99, backgroundColor: colors.surfaceMuted },
        bar: { borderRadius: 99 },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: radius.lg } },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
  },
})

export default theme
