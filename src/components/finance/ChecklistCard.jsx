import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Check } from 'lucide-react'
import SectionCard from '../common/SectionCard'
import StatusBadge from '../common/StatusBadge'
import { colors, tones } from '../../theme/tokens'

/**
 * "Kiểm tra trước khi gửi": danh sách điều kiện đạt / chưa đạt.
 * items: [{ label, ok: boolean }]
 */
export default function ChecklistCard({ title = 'Kiểm tra trước khi gửi', items, sx }) {
  const issues = items.filter((i) => !i.ok).length

  return (
    <SectionCard title={title} sx={sx}>
      <StatusBadge
        label={issues > 0 ? `${issues} mục cần xử lý` : 'Sẵn sàng gửi'}
        tone={issues > 0 ? 'warning' : 'success'}
        size="small"
      />
      <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', p: 0, m: 0, mt: 2 }}>
        {items.map((item) => (
          <Stack
            component="li"
            key={item.label}
            direction="row"
            spacing={0.75}
            sx={{ alignItems: 'center', color: item.ok ? colors.textSecondary : tones.danger.fg }}
          >
            {item.ok ? <Check size={12} /> : <Typography component="span" sx={{ fontSize: 12, fontWeight: 600 }}>!</Typography>}
            <Typography variant="body2" sx={{ color: 'inherit' }}>{item.label}</Typography>
          </Stack>
        ))}
      </Stack>
    </SectionCard>
  )
}
