import { Controller, useFormContext } from 'react-hook-form'
import MoneyField from '../MoneyField'

/** MoneyField gắn với react-hook-form: giá trị trong form là số nguyên (null khi rỗng). */
export default function CustomMoneyInput({ name, rules, error, ...props }) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { ref, ...field }, fieldState }) => (
        <MoneyField {...field} inputRef={ref} error={fieldState.error?.message ?? error} {...props} />
      )}
    />
  )
}
