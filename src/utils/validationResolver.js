/**
 * Biến hàm validate thuần `(values, context) => ({ field: 'thông báo lỗi' })` thành resolver cho react-hook-form.
 * Giữ validate là hàm thuần để dùng lại ở chỗ khác (checklist, cảnh báo trực tiếp...).
 *   useForm({ resolver: validationResolver(validate), context: { users } })
 */
export default function validationResolver(validate) {
  return (values, context) => {
    const messages = validate(values, context)
    const fields = Object.keys(messages).filter((key) => messages[key])
    if (fields.length === 0) return { values, errors: {} }
    return {
      values: {},
      errors: Object.fromEntries(fields.map((key) => [key, { type: 'validate', message: messages[key] }])),
    }
  }
}
