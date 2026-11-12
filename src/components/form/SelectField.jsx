import MenuItem from '@mui/material/MenuItem'
import { ChevronDown } from 'lucide-react'
import FormTextField from './FormTextField'

function SelectIcon(props) {
  return <ChevronDown size={16} {...props} style={{ right: 12 }} />
}

/**
 * Dropdown có nhãn phía trên.
 * options: [{ value, label }] hoặc mảng chuỗi.
 */
export default function SelectField({ options = [], placeholder, value, slotProps, ...props }) {
  const items = options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt))

  return (
    <FormTextField
      select
      {...(value !== undefined && { value: value ?? '' })}
      slotProps={{
        ...slotProps,
        select: {
          ...slotProps?.select,
          IconComponent: SelectIcon,
          displayEmpty: Boolean(placeholder),
          renderValue: (selected) =>
            selected === '' ? <span style={{ opacity: 0.5 }}>{placeholder}</span> : items.find((i) => i.value === selected)?.label,
        },
      }}
      {...props}
    >
      {items.map((item) => (
        <MenuItem key={item.value} value={item.value} disabled={item.disabled}>
          {item.label}
        </MenuItem>
      ))}
    </FormTextField>
  )
}
