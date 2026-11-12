import InputAdornment from '@mui/material/InputAdornment'
import FormTextField from './FormTextField'
import { formatMoney, parseMoney } from '../../utils/format'

/**
 * Ô nhập số tiền VND, tự chèn dấu chấm phân cách hàng nghìn.
 * value / onChange làm việc với số nguyên (hoặc null khi rỗng).
 */
export default function MoneyField({ value, onChange, showUnit = false, slotProps, ...props }) {
  return (
    <FormTextField
      value={value === null || value === undefined ? '' : formatMoney(value, { unit: false })}
      onChange={(event) => onChange?.(parseMoney(event.target.value))}
      slotProps={{
        ...slotProps,
        htmlInput: { inputMode: 'numeric', ...slotProps?.htmlInput },
        input: showUnit
          ? { endAdornment: <InputAdornment position="end">VND</InputAdornment>, ...slotProps?.input }
          : slotProps?.input,
      }}
      {...props}
    />
  )
}
