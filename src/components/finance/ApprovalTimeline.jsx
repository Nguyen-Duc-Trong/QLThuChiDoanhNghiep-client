import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Check } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'
import { colors, tones } from '../../theme/tokens'

function StepMarker({ index, status }) {
  const styles = {
    done: { color: tones.success.fg, bgcolor: tones.success.bg },
    current: { color: colors.primary, bgcolor: colors.primarySoft },
    rejected: { color: tones.danger.fg, bgcolor: tones.danger.bg },
    pending: { color: colors.textMuted, bgcolor: colors.surfaceMuted },
  }[status]

  return (
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        fontSize: 11,
        fontWeight: 600,
        flexShrink: 0,
        ...styles,
      }}
    >
      {status === 'done' ? <Check size={13} strokeWidth={3} /> : index + 1}
    </Box>
  )
}

/**
 * Tiến trình phê duyệt dạng dọc.
 * steps: [{ title, description, status: 'done' | 'current' | 'pending' | 'rejected', badge? }]
 * badge: { label, tone } hiển thị dưới bước (ví dụ "Đang chờ xử lý").
 */
export default function ApprovalTimeline({ steps }) {
  return (
    <Stack component="ol" spacing={2.25} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {steps.map((step, index) => (
        <Stack component="li" key={step.title} direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <StepMarker index={index} status={step.status} />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ fontSize: 13, fontWeight: 600, color: step.status === 'pending' ? colors.textSecondary : colors.text }}
            >
              {step.title}
            </Typography>
            {step.description && (
              <Typography variant="caption" component="p" sx={{ mt: 0.25 }}>{step.description}</Typography>
            )}
            {step.badge && <StatusBadge label={step.badge.label} tone={step.badge.tone ?? 'primary'} sx={{ mt: 1 }} />}
          </Box>
        </Stack>
      ))}
    </Stack>
  )
}
