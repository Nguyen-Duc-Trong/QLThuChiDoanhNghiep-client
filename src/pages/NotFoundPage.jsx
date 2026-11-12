import { useNavigate } from 'react-router'
import Button from '@mui/material/Button'
import { EmptyState } from '../components'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <EmptyState
      variant="no-results"
      title="Không tìm thấy trang"
      description="Đường dẫn không tồn tại hoặc đã bị thay đổi."
      action={<Button variant="contained" onClick={() => navigate('/')}>Về trang tổng quan</Button>}
    />
  )
}
