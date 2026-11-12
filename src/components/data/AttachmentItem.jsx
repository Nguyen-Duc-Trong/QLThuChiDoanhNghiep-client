import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Download, FileText } from 'lucide-react'
import { colors } from '../../theme/tokens'

/** Một chứng từ đính kèm: tên tệp, dung lượng · người tải · ngày, nút tải xuống. */
export default function AttachmentItem({ name, meta, onDownload, sx }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ alignItems: 'center', bgcolor: colors.surfaceMuted, borderRadius: 2, px: 2, py: 1.5, ...sx }}
    >
      <Box sx={{ color: colors.primary, display: 'flex' }}>
        <FileText size={20} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>{name}</Typography>
        {meta && <Typography variant="caption" component="p" noWrap>{meta}</Typography>}
      </Box>
      {onDownload && (
        <IconButton size="small" aria-label={`Tải ${name}`} onClick={onDownload} sx={{ color: colors.textSecondary }}>
          <Download size={16} />
        </IconButton>
      )}
    </Stack>
  )
}
