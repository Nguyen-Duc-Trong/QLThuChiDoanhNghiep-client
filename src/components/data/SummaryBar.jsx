import Paper from '@mui/material/Paper'
import DescriptionList from './DescriptionList'

/** Dải tóm tắt ở đầu màn chi tiết (Người tạo, Số tiền, Ngày cần chi, Thụ hưởng). */
export default function SummaryBar({ items, sx }) {
  return (
    <Paper variant="outlined" sx={{ px: 2.75, py: 2.5, mb: 3, ...sx }}>
      <DescriptionList items={items} columns={items.length} />
    </Paper>
  )
}
