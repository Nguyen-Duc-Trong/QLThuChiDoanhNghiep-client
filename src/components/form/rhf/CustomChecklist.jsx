import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Check } from 'lucide-react'
import { Controller, useFormContext } from 'react-hook-form'
import { colors, radius, tones } from '../../../theme/tokens'

/**
 * Danh sách mục kiểm tra có mô tả, bấm để đánh dấu đạt / chưa đạt (ví dụ "Checklist thẩm định").
 * Giá trị trong form là object { [item.key]: boolean }.
 *   <CustomChecklist name="checks" items={[{ key: 'documents', label: 'Chứng từ hợp lệ', description: '...' }]} />
 */
export default function CustomChecklist({ name, items, disabled = false }) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value = {}, onChange } }) => (
        <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {items.map((item) => {
            const checked = Boolean(value[item.key])
            return (
              <Box component="li" key={item.key}>
                <ButtonBase
                  role="checkbox"
                  aria-checked={checked}
                  disabled={disabled}
                  onClick={() => onChange({ ...value, [item.key]: !checked })}
                  sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, width: '100%', textAlign: 'left', borderRadius: `${radius.sm}px`, p: 0.5 }}
                >
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: `${radius.sm}px`,
                      color: checked ? tones.success.fg : colors.textMuted,
                      bgcolor: checked ? tones.success.bg : colors.surface,
                      border: `1px solid ${checked ? tones.success.border : colors.borderStrong}`,
                    }}
                  >
                    {checked && <Check size={13} strokeWidth={3} />}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{item.label}</Typography>
                    {item.description && <Typography variant="caption" component="p" sx={{ mt: 0.25 }}>{item.description}</Typography>}
                  </Box>
                </ButtonBase>
              </Box>
            )
          })}
        </Stack>
      )}
    />
  )
}
