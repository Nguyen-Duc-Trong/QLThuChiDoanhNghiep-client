import { useRouteError } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { EmptyState } from '../components'

/** Hiển thị khi một route ném lỗi (lỗi render, lỗi tải chunk khi mất mạng...). */
export default function RouteErrorPage() {
  const error = useRouteError()
  console.error(error)

  return (
    <Box sx={{ py: 8 }}>
      <EmptyState
        variant="network-error"
        title="Đã xảy ra lỗi"
        description="Không thể hiển thị màn hình này. Thử tải lại trang."
        action={<Button variant="outlined" onClick={() => window.location.reload()}>Tải lại</Button>}
      />
    </Box>
  )
}
