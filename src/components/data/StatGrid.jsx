import Box from '@mui/material/Box'

/** Hàng thẻ chỉ số: 4 cột desktop, 2 cột tablet, 1 cột mobile. */
export default function StatGrid({ columns = 4, children, sx }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: `repeat(${columns}, minmax(0, 1fr))` },
        gap: 2,
        mb: 3,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
