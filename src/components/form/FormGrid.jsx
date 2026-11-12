import Box from '@mui/material/Box'

/**
 * Lưới 2 cột cho các trường trong form (1 cột trên mobile).
 * Trường cần chiếm cả hàng: bọc trong <Box sx={{ gridColumn: '1 / -1' }}>.
 */
export default function FormGrid({ columns = 2, children, sx }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: `repeat(${columns}, minmax(0, 1fr))` },
        columnGap: 2,
        rowGap: 2.25,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
