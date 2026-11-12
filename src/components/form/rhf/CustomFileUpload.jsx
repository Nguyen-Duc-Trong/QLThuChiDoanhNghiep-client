import { Controller, useFormContext } from 'react-hook-form'
import FileUploadField from '../FileUploadField'

/** FileUploadField gắn với react-hook-form: giá trị trong form là mảng [{ name, size, file }]. */
export default function CustomFileUpload({ name, rules, error, ...props }) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { value, onChange }, fieldState }) => (
        <FileUploadField files={value ?? []} onChange={onChange} error={fieldState.error?.message ?? error} {...props} />
      )}
    />
  )
}
