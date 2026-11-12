import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import SectionCard from '../common/SectionCard'
import AppAlert from '../common/AppAlert'
import { formatMoney, toMillions } from '../../utils/format'

/**
 * Thẻ ngân sách liên quan / khả dụng.
 * Khả dụng = Ngân sách − Đã chi − Cam kết chưa chi.
 * alert: { tone, title, message } — ví dụ "Trong hạn mức".
 */
export default function BudgetCard({ title = 'Ngân sách liên quan', scope, total, spent, committed, alert, sx }) {
  const available = total - spent - committed
  const usage = total > 0 ? Math.min(100, ((spent + committed) / total) * 100) : 0
  const progressColor = usage >= 100 ? 'error' : usage >= 80 ? 'warning' : 'primary'

  return (
    <SectionCard title={title} sx={sx}>
      {scope && <Typography variant="body2" color="text.secondary">{scope}</Typography>}
      <Typography sx={{ fontWeight: 600, mt: 0.75 }}>Ngân sách {formatMoney(total)}</Typography>

      <LinearProgress
        variant="determinate"
        value={usage}
        color={progressColor}
        aria-label={`Đã sử dụng ${Math.round(usage)}% ngân sách`}
        sx={{ my: 2.25 }}
      />

      <Stack direction="row" spacing={3}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary">Đã chi / Cam kết chưa chi</Typography>
          <Typography sx={{ fontWeight: 600, mt: 0.75 }}>
            {toMillions(spent)} / {toMillions(committed)} triệu VND
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary">Còn khả dụng</Typography>
          <Typography sx={{ fontWeight: 600, mt: 0.75 }}>{formatMoney(available)}</Typography>
        </Box>
      </Stack>

      {alert && (
        <AppAlert tone={alert.tone} title={alert.title} sx={{ mt: 2.5 }}>
          {alert.message}
        </AppAlert>
      )}
    </SectionCard>
  )
}
