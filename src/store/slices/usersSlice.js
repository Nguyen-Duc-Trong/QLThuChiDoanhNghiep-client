import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import usersApi from '../../services/usersApi'
import { withApiError } from '../../utils/apiError'

export const USERS_PAGE_SIZE = 10

export const fetchUsers = createAsyncThunk(
  'users/fetchList',
  withApiError(async (query) => {
    const params = { page: query.page, limit: query.limit }
    if (query.search?.trim()) params.search = query.search.trim()
    if (query.status) params.status = query.status
    if (query.role) params.role = query.role
    const res = await usersApi.list(params)
    return { items: res.data ?? [], meta: res.meta }
  }),
)

export const fetchUserById = createAsyncThunk('users/fetchOne', withApiError(async (id) => (await usersApi.getById(id)).data))
export const createUser = createAsyncThunk('users/create', withApiError(async (body) => (await usersApi.create(body)).data))
export const updateUser = createAsyncThunk('users/update', withApiError(async (body) => (await usersApi.update(body)).data))
export const deleteUsers = createAsyncThunk('users/delete', withApiError(async (ids) => (await usersApi.remove(ids)).data))

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    total: 0,
    query: { page: 1, limit: USERS_PAGE_SIZE, search: '', status: '', role: '' },
    loading: false,
    error: null,
  },
  reducers: {
    /** Đổi bộ lọc / trang. Đổi bộ lọc (không phải page) thì quay về trang 1. */
    setUsersQuery(state, action) {
      const patch = action.payload
      const resetPage = Object.keys(patch).some((key) => key !== 'page')
      state.query = { ...state.query, ...patch, ...(resetPage && !('page' in patch) ? { page: 1 } : {}) }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.meta?.total ?? action.payload.items.length
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? { message: action.error.message }
      })
  },
})

export const { setUsersQuery } = usersSlice.actions
export default usersSlice.reducer

export const selectUsers = (state) => state.users.items
export const selectUsersTotal = (state) => state.users.total
export const selectUsersQuery = (state) => state.users.query
export const selectUsersLoading = (state) => state.users.loading
export const selectUsersError = (state) => state.users.error
