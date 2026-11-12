/**
 * Chuẩn hóa lỗi axios để đưa qua rejectWithValue (phải serializable).
 * Giữ dạng { message, response: { status } } để dùng được với TOAST_OPTIONS.fromError.
 */
export function toApiError(error) {
  const body = error?.response?.data
  return {
    message: body?.message || error?.message || 'Có lỗi xảy ra, vui lòng thử lại',
    errors: body?.errors,
    response: error?.response ? { status: error.response.status } : undefined,
  }
}

/** Bọc payloadCreator của createAsyncThunk: lỗi axios -> rejectWithValue(toApiError(error)) */
export const withApiError = (request) => async (arg, { rejectWithValue }) => {
  try {
    return await request(arg)
  } catch (error) {
    return rejectWithValue(toApiError(error))
  }
}
