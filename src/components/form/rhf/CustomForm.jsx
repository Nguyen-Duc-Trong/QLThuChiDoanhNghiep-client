import Box from '@mui/material/Box'
import { FormProvider } from 'react-hook-form'

/**
 * Thẻ <form> gắn với react-hook-form: cấp context cho các trường Custom* bên trong
 * và chỉ gọi onSubmit khi dữ liệu hợp lệ (onInvalid khi có lỗi).
 *   const methods = useForm({ defaultValues })
 *   <CustomForm methods={methods} onSubmit={save}>...</CustomForm>
 */
export default function CustomForm({ methods, onSubmit, onInvalid, children, ...boxProps }) {
  return (
    <FormProvider {...methods}>
      <Box component="form" noValidate onSubmit={methods.handleSubmit(onSubmit, onInvalid)} {...boxProps}>
        {children}
      </Box>
    </FormProvider>
  )
}
