import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import FormHelperText from '@mui/material/FormHelperText'
import Typography from '@mui/material/Typography'
import { Check } from 'lucide-react'
import { Controller, useFormContext } from 'react-hook-form'
import { colors, tones } from '../../../theme/tokens'

/**
 * Chọn một trong vài lựa chọn dạng ô bấm nằm ngang (ví dụ "Đang sử dụng" / "Ngừng sử dụng").
 *   <CustomSegmented name="status" label="Trạng thái" required options={[{ value: 'A', label: 'A' }]} />
 * options: [{ value, label, disabled? }] hoặc mảng chuỗi.
 */
export default function CustomSegmented({ name, label, required, helperText, options = [], disabled = false, rules, sx }) {
  const { control } = useFormContext()
  const items = options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt))

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { value, onChange, onBlur }, fieldState }) => {
        const error = fieldState.error?.message
        return (
          <Box sx={sx}>
            {label && (
              <Typography sx={{ display: 'block', fontSize: 12, fontWeight: 600, mb: 0.75 }}>
                {label}
                {required && ' *'}
              </Typography>
            )}
            <Box
              role="radiogroup"
              aria-label={label}
              sx={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`, gap: 1 }}
            >
              {items.map((item) => {
                const selected = item.value === value
                return (
                  <ButtonBase
                    key={item.value}
                    role="radio"
                    aria-checked={selected}
                    disabled={disabled || item.disabled}
                    onClick={() => onChange(item.value)}
                    onBlur={onBlur}
                    sx={{
                      justifyContent: 'flex-start',
                      gap: 1,
                      minHeight: 44,
                      px: 1.5,
                      borderRadius: 1.5,
                      border: `1px solid ${selected ? colors.primary : error ? tones.danger.fg : colors.border}`,
                      bgcolor: selected ? colors.primarySoft : colors.surface,
                      color: selected ? colors.primary : colors.textSecondary,
                      fontSize: 13,
                      fontWeight: selected ? 600 : 400,
                      textAlign: 'left',
                      '&.Mui-disabled': { opacity: 0.6 },
                      '&.Mui-focusVisible': { outline: `2px solid ${colors.primary}`, outlineOffset: 2 },
                    }}
                  >
                    {selected && <Check size={16} />}
                    {item.label}
                  </ButtonBase>
                )
              })}
            </Box>
            {(error || helperText) && <FormHelperText error={Boolean(error)}>{error ?? helperText}</FormHelperText>}
          </Box>
        )
      }}
    />
  )
}
