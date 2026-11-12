import { Controller, useFormContext } from 'react-hook-form'
import FormTextField from '../FormTextField'

/**
 * FormTextField gắn với react-hook-form (đặt trong <CustomForm> hoặc <FormProvider>).
 *   <CustomInput name="dueDate" label="Ngày cần chi" required type="date" />
 * parse: chuẩn hóa chuỗi người dùng gõ trước khi lưu vào form, ví dụ chỉ giữ chữ số.
 * error: lỗi bổ sung ngoài validate của form, chỉ hiện khi trường không có lỗi validate.
 */
export default function CustomInput({ name, rules, parse, error, ...props }) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { ref, value, onChange, ...field }, fieldState }) => (
        <FormTextField
          {...field}
          value={value ?? ''}
          onChange={(event) => onChange(parse ? parse(event.target.value) : event.target.value)}
          inputRef={ref}
          error={fieldState.error?.message ?? error}
          {...props}
        />
      )}
    />
  )
}
