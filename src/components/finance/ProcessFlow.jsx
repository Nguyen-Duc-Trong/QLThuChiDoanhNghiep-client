import { Fragment } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ArrowRight } from 'lucide-react'
import { colors } from '../../theme/tokens'

/**
 * Luồng xử lý cố định.
 * - variant="inline": "Bạn → Trưởng phòng → Kế toán → ..." (steps là mảng chuỗi hoặc { title })
 * - variant="cards": các thẻ đánh số 1..n có tiêu đề + mô tả
 */
export default function ProcessFlow({ steps, variant = 'inline', sx }) {
  const items = steps.map((s) => (typeof s === 'string' ? { title: s } : s))

  if (variant === 'inline') {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 0.75, rowGap: 0.5, ...sx }}>
        {items.map((item, index) => (
          <Fragment key={item.title}>
            {index > 0 && <ArrowRight size={13} color={colors.textSecondary} aria-hidden />}
            <Typography variant="body2">{item.title}</Typography>
          </Fragment>
        ))}
      </Box>
    )
  }

  return (
    <Box
      component="ol"
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: `repeat(${items.length}, minmax(0, 1fr))` },
        gap: 1.5,
        ...sx,
      }}
    >
      {items.map((item, index) => (
        <Box component="li" key={item.title} sx={{ bgcolor: colors.surfaceMuted, borderRadius: 2, p: 1.75 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.primary }}>{index + 1}</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 600, mt: 1 }}>{item.title}</Typography>
          {item.description && (
            <Typography variant="caption" component="p" sx={{ mt: 1 }}>{item.description}</Typography>
          )}
        </Box>
      ))}
    </Box>
  )
}
