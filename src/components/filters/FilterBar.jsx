import Stack from '@mui/material/Stack'

/** Hàng bộ lọc: ô tìm kiếm bên trái, các bộ lọc dropdown bên phải. */
export default function FilterBar({ search, children, sx }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, mb: 2.5, ...sx }}
    >
      {search}
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        {children}
      </Stack>
    </Stack>
  )
}
