import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

/** Dòng chính đậm + dòng phụ xám (mã + nội dung, tên + email, ...). */
export default function TwoLineText({ primary, secondary, sx }) {
  return (
    <Box sx={{ minWidth: 0, ...sx }}>
      <Typography sx={{ fontSize: 14, fontWeight: 600 }} noWrap>{primary}</Typography>
      {secondary && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }} noWrap>{secondary}</Typography>
      )}
    </Box>
  )
}
