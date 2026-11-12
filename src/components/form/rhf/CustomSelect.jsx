import { Controller, useFormContext } from 'react-hook-form'
import SelectField from '../SelectField'

/** SelectField gắn với react-hook-form. options: [{ value, label }] hoặc mảng chuỗi. */
export default function CustomSelect({ name, rules, error, ...props }) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { ref, value, ...field }, fieldState }) => (
        <SelectField {...field} value={value ?? ''} inputRef={ref} error={fieldState.error?.message ?? error} {...props} />
      )}
    />
  )
}
