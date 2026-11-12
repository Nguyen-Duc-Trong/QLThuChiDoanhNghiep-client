import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Controller, useFormContext } from 'react-hook-form'

/** Ô chọn có nhãn gắn với react-hook-form: giá trị trong form là boolean. */
export default function CustomCheckbox({ name, label, rules, sx }) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { ref, value, onChange, ...field } }) => (
        <FormControlLabel
          control={
            <Checkbox
              {...field}
              size="small"
              checked={Boolean(value)}
              onChange={(event) => onChange(event.target.checked)}
              slotProps={{ input: { ref } }}
              sx={{ p: 0, mr: 1 }}
            />
          }
          label={label}
          slotProps={{ typography: { sx: { fontSize: 13 } } }}
          sx={{ m: 0, ...sx }}
        />
      )}
    />
  )
}
