import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import permissionsApi from '../../services/permissionsApi'
import { withApiError } from '../../utils/apiError'

/** Danh mục quyền theo module (tải một lần, dùng cho màn phân quyền vai trò và quyền riêng từng người) */
export const fetchPermissionCatalog = createAsyncThunk(
  'permissions/fetchCatalog',
  withApiError(async () => (await permissionsApi.catalog()).data ?? []),
  { condition: (_, { getState }) => !getState().permissions.catalogLoading && getState().permissions.catalog.length === 0 },
)

/** { [userId]: số quyền riêng } */
export const fetchOverridesSummary = createAsyncThunk(
  'permissions/fetchOverridesSummary',
  withApiError(async () => (await permissionsApi.overridesSummary()).data ?? {}),
)

export const fetchUserPermissions = createAsyncThunk(
  'permissions/fetchUser',
  withApiError(async (userId) => (await permissionsApi.getUserPermissions(userId)).data),
)

/** { userId, overrides: [{ permission, effect, reason }] } -> UserPermissions đã lưu */
export const updateUserPermissions = createAsyncThunk(
  'permissions/updateUser',
  withApiError(async ({ userId, overrides }) => (await permissionsApi.updateUserPermissions(userId, overrides)).data),
)

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState: { catalog: [], catalogLoading: false, catalogError: null, overridesSummary: {} },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissionCatalog.pending, (state) => {
        state.catalogLoading = true
        state.catalogError = null
      })
      .addCase(fetchPermissionCatalog.fulfilled, (state, action) => {
        state.catalogLoading = false
        state.catalog = action.payload
      })
      .addCase(fetchPermissionCatalog.rejected, (state, action) => {
        state.catalogLoading = false
        state.catalogError = action.payload ?? { message: 'Không tải được danh mục quyền' }
      })
      .addCase(fetchOverridesSummary.fulfilled, (state, action) => {
        state.overridesSummary = action.payload
      })
      .addCase(updateUserPermissions.fulfilled, (state, action) => {
        const { userId, overrides } = action.payload
        state.overridesSummary = { ...state.overridesSummary, [userId]: overrides.length }
      })
  },
})

export default permissionsSlice.reducer

export const selectPermissionCatalog = (state) => state.permissions.catalog
export const selectPermissionCatalogLoading = (state) => state.permissions.catalogLoading
export const selectPermissionCatalogError = (state) => state.permissions.catalogError
export const selectOverridesSummary = (state) => state.permissions.overridesSummary
