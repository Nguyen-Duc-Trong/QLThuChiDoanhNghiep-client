import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import SectionCard from '../common/SectionCard'
import StatusBadge from '../common/StatusBadge'

/**
 * "Việc cần làm": badge ưu tiên, tiêu đề công việc, mô tả, nút hành động.
 * badge: { label, tone }
 */
export default function TodoCard({ title = 'Việc cần làm', subtitle, badge, heading, description, actionLabel, onAction, sx }) {
  return (
    <SectionCard title={title} subtitle={subtitle} sx={sx}>
      {badge && <StatusBadge label={badge.label} tone={badge.tone ?? 'warning'} />}
      {heading && <Typography sx={{ fontWeight: 600, mt: 2.5 }}>{heading}</Typography>}
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {description}
        </Typography>
      )}
      {actionLabel && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 2.5 }}>
          {actionLabel}
        </Button>
      )}
    </SectionCard>
  )
}
