import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

/**
 * Card trắng dùng cho mọi khối nội dung: tiêu đề, phụ đề, hành động góc phải.
 */
export default function SectionCard({ title, subtitle, action, children, padding = 2.75, sx, contentSx }) {
  const hasHeader = title || subtitle || action

  return (
    <Paper variant="outlined" sx={{ p: padding, ...sx }}>
      {hasHeader && (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
          <Box sx={{ minWidth: 0 }}>
            {title && <Typography variant="h3" component="h2" sx={{ fontSize: 17 }}>{title}</Typography>}
            {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
          </Box>
          {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
        </Stack>
      )}
      <Box sx={contentSx}>{children}</Box>
    </Paper>
  )
}
