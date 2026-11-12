import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

/**
 * Lưới cặp nhãn – giá trị (thông tin hồ sơ, người thụ hưởng, ngân hàng...).
 * items: [{ label, value, span? }] — span: số cột chiếm (ví dụ mô tả dài).
 */
export default function DescriptionList({ items, columns = 2, sx }) {
  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: `repeat(${Math.min(columns, 2)}, minmax(0, 1fr))`,
          md: `repeat(${columns}, minmax(0, 1fr))`,
        },
        columnGap: 3,
        rowGap: 2.5,
        ...sx,
      }}
    >
      {items.map((item) => (
        <Box key={item.label} sx={{ minWidth: 0, gridColumn: item.span ? { sm: `span ${item.span}` } : undefined }}>
          <Typography component="dt" variant="body2" color="text.secondary">
            {item.label}
          </Typography>
          <Typography component="dd" sx={{ m: 0, mt: 0.75, fontSize: 14, fontWeight: 600 }}>
            {item.value}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
