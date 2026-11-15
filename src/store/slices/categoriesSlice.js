import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import categoriesApi from '../../services/categoriesApi'
import { withApiError } from '../../utils/apiError'

export const CATEGORIES_PAGE_SIZE = 8

// Bỏ tham số rỗng để server không phải lọc
function toParams(query) {
  const params = { page: query.page, limit: query.limit }
  if (query.search?.trim()) params.search = query.search.trim()
  if (query.type) params.type = query.type
  if (query.status) params.status = query.status
  return params
}

export const fetchCategories = createAsyncThunk(
  'categories/fetchList',
  withApiError(async (query) => {
    const res = await categoriesApi.list(toParams(query))
    return { items: res.data ?? [], meta: res.meta }
  }),
)

/**
 * Số liệu 4 thẻ thống kê (tổng / thu / chi / đang dùng) + thời điểm cập nhật mới nhất.
 * Server chưa có API thống kê riêng nên đọc meta.total của 4 truy vấn limit=1 (chạy song song).
 */
export const fetchCategoryStats = createAsyncThunk(
  'categories/fetchStats',
  withApiError(async () => {
    const count = (extra) => categoriesApi.list({ page: 1, limit: 1, ...extra })
    const [all, income, expense, active] = await Promise.all([
      count({}),
      count({ type: 'THU' }),
      count({ type: 'CHI' }),
      count({ status: 'DANG_SU_DUNG' }),
    ])
    return {
      total: all.meta?.total ?? 0,
      income: income.meta?.total ?? 0,
      expense: expense.meta?.total ?? 0,
      active: active.meta?.total ?? 0,
      latestUpdate: all.data?.[0]?.updatedAt ?? null,
    }
  }),
)

export const createCategory = createAsyncThunk('categories/create', withApiError(async (body) => (await categoriesApi.create(body)).data))
export const updateCategory = createAsyncThunk(
  'categories/update',
  withApiError(async ({ id, ...body }) => (await categoriesApi.update(id, body)).data),
)
export const deleteCategories = createAsyncThunk('categories/delete', withApiError(async (ids) => (await categoriesApi.remove(ids)).data))

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    total: 0,
    query: { page: 1, limit: CATEGORIES_PAGE_SIZE, search: '', type: '', status: '' },
    stats: { total: 0, income: 0, expense: 0, active: 0, latestUpdate: null },
    loading: false,
    error: null,
  },
  reducers: {
    /** Đổi bộ lọc / trang. Đổi bộ lọc (không phải page) thì quay về trang 1. */
    setCategoriesQuery(state, action) {
      const patch = action.payload
      const resetPage = Object.keys(patch).some((key) => key !== 'page')
      state.query = { ...state.query, ...patch, ...(resetPage && !('page' in patch) ? { page: 1 } : {}) }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.meta?.total ?? action.payload.items.length
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? { message: action.error.message }
      })
      .addCase(fetchCategoryStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
  },
})

export const { setCategoriesQuery } = categoriesSlice.actions
export default categoriesSlice.reducer

export const selectCategories = (state) => state.categories.items
export const selectCategoriesTotal = (state) => state.categories.total
export const selectCategoriesQuery = (state) => state.categories.query
export const selectCategoriesLoading = (state) => state.categories.loading
export const selectCategoriesError = (state) => state.categories.error
export const selectCategoryStats = (state) => state.categories.stats
