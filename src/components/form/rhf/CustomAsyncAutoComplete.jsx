import { Controller, useFormContext } from 'react-hook-form'
import AsyncAutoComplete from '../AsyncAutoComplete'

/**
 * AsyncAutoComplete gắn với react-hook-form (đặt trong <CustomForm> / <FormProvider>).
 * Giá trị trong form là object (mặc định) hoặc id khi returnObject={false}; mảng khi isMulti.
 *   <CustomAsyncAutoComplete name="beneficiary" label="Người thụ hưởng" url="beneficiaries" optionLabel="name" />
 */
export default function CustomAsyncAutoComplete({ name, rules, error, ...props }) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { value, onChange, onBlur }, fieldState }) => (
        <AsyncAutoComplete value={value} onChange={onChange} onBlur={onBlur} error={fieldState.error?.message ?? error} {...props} />
      )}
    />
  )
}
