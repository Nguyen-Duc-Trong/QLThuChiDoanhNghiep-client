import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { colors } from '../../theme/tokens'

/**
 * Tiêu đề màn hình.
 * - eyebrow: "01 / NHÂN VIÊN"
 * - actions: nút chính góc phải (Tạo yêu cầu chi, Xuất danh sách...)
 * - tags: chip/badge dưới mô tả (Phạm vi cá nhân, trạng thái hồ sơ...)
 * - toolbar: cụm bộ lọc bên phải hàng tags (PeriodPicker, FilterSelect...)
 */
export default function PageHeader({ eyebrow, title, description, actions, tags, toolbar, sx }) {
  return (
    <Box sx={{ mb: 3, ...sx }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'flex-start' } }}
      >
        <Box sx={{ minWidth: 0 }}>
          {eyebrow && (
            <Typography variant="overline" component="p" sx={{ color: colors.primary, display: 'block', mb: 0.75 }}>
              {eyebrow}
            </Typography>
          )}
          <Typography variant="h1">{title}</Typography>
          {description && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {description}
            </Typography>
          )}
        </Box>
        {actions && (
          <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0, flexWrap: 'wrap', rowGap: 1 }}>
            {actions}
          </Stack>
        )}
      </Stack>

      {(tags || toolbar) && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mt: 2.5, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}
        >
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, alignItems: 'center' }}>
            {tags}
          </Stack>
          {toolbar && (
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              {toolbar}
            </Stack>
          )}
        </Stack>
      )}
    </Box>
  )
}
