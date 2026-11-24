import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import departmentsApi from '../../services/departmentsApi'
import { withApiError } from '../../utils/apiError'

// Màn 22 · Phòng ban, ủy quyền phê duyệt, cấu hình hệ thống

export const fetchDepartments = createAsyncThunk('departments/fetchList', withApiError(async () => (await departmentsApi.list()).data ?? []))
export const fetchStaffOptions = createAsyncThunk('departments/fetchStaff', withApiError(async () => (await departmentsApi.staffOptions()).data ?? []))
export const createDepartment = createAsyncThunk('departments/create', withApiError(async (body) => (await departmentsApi.create(body)).data))
export const updateDepartment = createAsyncThunk(
  'departments/update',
  withApiError(async ({ id, ...body }) => (await departmentsApi.update(id, body)).data),
)
export const deleteDepartment = createAsyncThunk('departments/delete', withApiError(async (id) => (await departmentsApi.remove(id)).data))

export const fetchDelegations = createAsyncThunk('departments/fetchDelegations', withApiError(async () => (await departmentsApi.listDelegations()).data ?? []))
export const createDelegation = createAsyncThunk('departments/createDelegation', withApiError(async (body) => (await departmentsApi.createDelegation(body)).data))
export const revokeDelegation = createAsyncThunk('departments/revokeDelegation', withApiError(async (id) => (await departmentsApi.revokeDelegation(id)).data))

export const fetchSettings = createAsyncThunk('departments/fetchSettings', withApiError(async () => (await departmentsApi.getSettings()).data))
export const updateSettings = createAsyncThunk('departments/updateSettings', withApiError(async (body) => (await departmentsApi.updateSettings(body)).data))

const upsert = (list, item) => (list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item])

const departmentsSlice = createSlice({
  name: 'departments',
  initialState: {
    items: [],
    staff: [],
    delegations: [],
    settings: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? { message: action.error.message }
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.items = upsert(state.items, action.payload)
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.items = upsert(state.items, action.payload)
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.items = state.items.filter((d) => d.id !== action.meta.arg)
      })
      .addCase(fetchStaffOptions.fulfilled, (state, action) => {
        state.staff = action.payload
      })
      .addCase(fetchDelegations.fulfilled, (state, action) => {
        state.delegations = action.payload
      })
      .addCase(createDelegation.fulfilled, (state, action) => {
        state.delegations = [action.payload, ...state.delegations]
      })
      .addCase(revokeDelegation.fulfilled, (state, action) => {
        state.delegations = upsert(state.delegations, action.payload)
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settings = action.payload
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settings = action.payload
      })
  },
})

export default departmentsSlice.reducer

export const selectDepartments = (state) => state.departments.items
export const selectDepartmentsLoading = (state) => state.departments.loading
export const selectDepartmentsError = (state) => state.departments.error
export const selectStaffOptions = (state) => state.departments.staff
export const selectDelegations = (state) => state.departments.delegations
export const selectSettings = (state) => state.departments.settings
