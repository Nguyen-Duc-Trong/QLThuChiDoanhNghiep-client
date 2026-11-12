import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import rolesApi from '../../services/rolesApi'
import { withApiError } from '../../utils/apiError'

export const fetchRoles = createAsyncThunk('roles/fetchList', withApiError(async () => (await rolesApi.list()).data ?? []))

/** { key, permissions: string[] } -> Role đã lưu */
export const updateRolePermissions = createAsyncThunk(
  'roles/updatePermissions',
  withApiError(async ({ key, permissions }) => (await rolesApi.updatePermissions(key, permissions)).data),
)

const rolesSlice = createSlice({
  name: 'roles',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? { message: action.error.message }
      })
      .addCase(updateRolePermissions.fulfilled, (state, action) => {
        const saved = action.payload
        state.items = state.items.map((r) => (r.key === saved.key ? saved : r))
      })
  },
})

export default rolesSlice.reducer

export const selectRoles = (state) => state.roles.items
export const selectRolesLoading = (state) => state.roles.loading
export const selectRolesError = (state) => state.roles.error
