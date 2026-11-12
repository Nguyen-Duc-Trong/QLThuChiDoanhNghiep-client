import Pagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { colors } from '../../theme/tokens'

const PrevLabel = () => 'Trước'
const NextLabel = () => 'Sau'

/**
 * Chân bảng: "Hiển thị 1–5 trên 24 người dùng" + Trước / 1 2 3 / Sau.
 * page bắt đầu từ 1.
 */
export default function TablePaginationBar({ page, pageSize, total, onPageChange, itemLabel = 'bản ghi', sx }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', pt: 2.5, ...sx }}
    >
      <Typography variant="body2" color="text.secondary">
        Hiển thị {from}–{to} trên {total} {itemLabel}
      </Typography>
      <Pagination
        page={page}
        count={pageCount}
        onChange={(_, value) => onPageChange?.(value)}
        shape="rounded"
        renderItem={(item) => (
          <PaginationItem
            slots={{ previous: PrevLabel, next: NextLabel }}
            {...item}
            sx={{
              border: `1px solid ${colors.border}`,
              fontWeight: 600,
              fontSize: 13,
              minWidth: 32,
              height: 32,
              px: item.type === 'previous' || item.type === 'next' ? 1.5 : 0.5,
              '&.Mui-selected': { bgcolor: colors.primarySoft, color: colors.primary, borderColor: colors.primarySoft },
            }}
          />
        )}
      />
    </Stack>
  )
}
