import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import authApi from '../../services/authApi'
import { withApiError } from '../../utils/apiError'

/**
 * Phiên đăng nhập thật (cookie httpOnly do server quản lý).
 * status:
 *   'idle'            chưa kiểm tra phiên (vừa mở app)
 *   'loading'         đang gọi GET /me
 *   'authenticated'   đã có user
 *   'unauthenticated' chưa đăng nhập / phiên hết hạn
 */
export const login = createAsyncThunk('session/login', withApiError(async (body) => (await authApi.login(body)).data))
export const fetchMe = createAsyncThunk('session/fetchMe', withApiError(async () => (await authApi.me()).data), {
  // StrictMode chạy effect 2 lần: đang gọi rồi thì bỏ qua lần sau
  condition: (_, { getState }) => getState().session.status !== 'loading',
})
// Đăng xuất luôn thành công phía client, kể cả khi server báo lỗi (phiên đã hết hạn sẵn)
export const logout = createAsyncThunk('session/logout', async () => {
  try {
    await authApi.logout()
  } catch {
    // bỏ qua
  }
})

const signedOut = (state) => {
  state.user = null
  state.status = 'unauthenticated'
}

const sessionSlice = createSlice({
  name: 'session',
  initialState: { user: null, status: 'idle' },
  reducers: {
    // axiosInstance gọi khi refresh token cũng hỏng
    sessionExpired: signedOut,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'authenticated'
      })
      .addCase(fetchMe.rejected, signedOut)
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'authenticated'
      })
      .addCase(logout.fulfilled, signedOut)
  },
})

export const { sessionExpired } = sessionSlice.actions
export default sessionSlice.reducer

export const selectSessionStatus = (state) => state.session.status
export const selectSessionUser = (state) => state.session.user
export const selectRole = (state) => state.session.user?.role ?? null

const EMPTY_PERMISSIONS = []
export const selectPermissions = (state) => state.session.user?.permissions ?? EMPTY_PERMISSIONS

/** Có quyền không. Dùng: useSelector((s) => selectHasPermission(s, 'pay')) */
export const selectHasPermission = (state, permission) => selectPermissions(state).includes(permission)

/**
 * Người dùng hiện tại theo dạng các trang đang dùng: { id, name, email, department, role (tên hiển thị), roleCode, permissions }.
 * Memo hóa để useSelector không render lại khi không đổi.
 */
export const selectCurrentUser = createSelector([selectSessionUser], (user) =>
  user
    ? {
        id: user.id,
        name: user.username,
        email: user.email,
        // Server chưa có phòng ban; bổ sung khi làm module Department
        department: user.department ?? 'Chưa có phòng ban',
        role: user.roleName,
        roleCode: user.role,
        permissions: user.permissions,
      }
    : null,
)
