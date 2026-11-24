import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import expensesApi from '../../services/expensesApi'
import { withApiError } from '../../utils/apiError'

const EMPTY_FORM_OPTIONS = { department: null, categories: [], projects: [], periods: [], budgetLines: [] }
const EMPTY_STAT = { count: 0, amount: 0 }
export const EXPENSES_PAGE_SIZE = 8

/** Dữ liệu cho màn Tạo yêu cầu chi: phòng ban, loại chi, dự án, kỳ đang mở, dòng ngân sách + khả dụng */
export const fetchExpenseFormOptions = createAsyncThunk(
  'expenses/fetchFormOptions',
  withApiError(async () => (await expensesApi.formOptions()).data ?? EMPTY_FORM_OPTIONS),
)

/** Lưu nháp: chưa có id thì tạo mới (server cấp mã), có rồi thì cập nhật */
export const saveExpenseDraft = createAsyncThunk(
  'expenses/saveDraft',
  withApiError(async ({ id, body }) => (await (id ? expensesApi.updateDraft(id, body) : expensesApi.createDraft(body))).data),
)

/** Gửi phê duyệt: chưa lưu nháp thì tạo + gửi, đã có thì lưu + gửi (hồ sơ Cần bổ sung → gửi lại, phiên bản mới) */
export const submitExpense = createAsyncThunk(
  'expenses/submit',
  withApiError(async ({ id, body }) => (await (id ? expensesApi.submit(id, body) : expensesApi.createAndSubmit(body))).data),
)

/** Bỏ tham số rỗng để server không phải lọc */
function toParams(query) {
  const params = { page: query.page, limit: query.limit }
  if (query.search?.trim()) params.search = query.search.trim()
  if (query.status) params.status = query.status
  return params
}

/** Màn 08 · Yêu cầu chi của tôi */
export const fetchMyExpenses = createAsyncThunk(
  'expenses/fetchMine',
  withApiError(async (query) => {
    const res = await expensesApi.list(toParams(query))
    return { items: res.data ?? [], meta: res.meta }
  }),
)
export const fetchMyExpenseStats = createAsyncThunk('expenses/fetchStats', withApiError(async () => (await expensesApi.stats()).data))

/** Chi tiết hồ sơ (id hoặc mã CHI-...) kèm lịch sử duyệt, phiên bản, bước đang chờ */
export const fetchExpenseDetail = createAsyncThunk('expenses/fetchDetail', withApiError(async (idOrCode) => (await expensesApi.getById(idOrCode)).data))
export const cancelExpense = createAsyncThunk('expenses/cancel', withApiError(async (id) => (await expensesApi.cancel(id)).data))

const expensesSlice = createSlice({
  name: 'expenses',
  initialState: {
    formOptions: EMPTY_FORM_OPTIONS,
    formOptionsLoading: false,
    formOptionsError: null,
    saving: false,

    items: [],
    total: 0,
    query: { page: 1, limit: EXPENSES_PAGE_SIZE, search: '', status: '' },
    stats: { total: EMPTY_STAT, inReview: EMPTY_STAT, needChanges: EMPTY_STAT, paid: EMPTY_STAT },
    listLoading: false,
    listError: null,

    detail: null,
    detailKey: null, // id hoặc mã đang tải / đang hiển thị
    detailLoading: false,
    detailError: null,
  },
  reducers: {
    /** Đổi bộ lọc / trang. Đổi bộ lọc (không phải page) thì quay về trang 1. */
    setExpensesQuery(state, action) {
      const patch = action.payload
      const resetPage = Object.keys(patch).some((key) => key !== 'page')
      state.query = { ...state.query, ...patch, ...(resetPage && !('page' in patch) ? { page: 1 } : {}) }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenseFormOptions.pending, (state) => {
        state.formOptionsLoading = true
        state.formOptionsError = null
      })
      .addCase(fetchExpenseFormOptions.fulfilled, (state, action) => {
        state.formOptionsLoading = false
        state.formOptions = action.payload
      })
      .addCase(fetchExpenseFormOptions.rejected, (state, action) => {
        state.formOptionsLoading = false
        state.formOptionsError = action.payload ?? { message: action.error.message }
      })
      .addCase(fetchMyExpenses.pending, (state) => {
        state.listLoading = true
        state.listError = null
      })
      .addCase(fetchMyExpenses.fulfilled, (state, action) => {
        state.listLoading = false
        state.items = action.payload.items
        state.total = action.payload.meta?.total ?? action.payload.items.length
      })
      .addCase(fetchMyExpenses.rejected, (state, action) => {
        state.listLoading = false
        state.listError = action.payload ?? { message: action.error.message }
      })
      .addCase(fetchMyExpenseStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
      .addCase(fetchExpenseDetail.pending, (state, action) => {
        state.detailLoading = true
        state.detailError = null
        // Đổi sang hồ sơ khác thì không hiển thị dữ liệu cũ trong lúc tải
        if (state.detailKey !== action.meta.arg) state.detail = null
        state.detailKey = action.meta.arg
      })
      .addCase(fetchExpenseDetail.fulfilled, (state, action) => {
        if (state.detailKey !== action.meta.arg) return
        state.detailLoading = false
        state.detail = action.payload
      })
      .addCase(fetchExpenseDetail.rejected, (state, action) => {
        if (state.detailKey !== action.meta.arg) return
        state.detailLoading = false
        state.detailError = action.payload ?? { message: action.error.message }
      })
    for (const thunk of [saveExpenseDraft, submitExpense, cancelExpense]) {
      builder
        .addCase(thunk.pending, (state) => {
          state.saving = true
        })
        .addCase(thunk.fulfilled, (state) => {
          state.saving = false
        })
        .addCase(thunk.rejected, (state) => {
          state.saving = false
        })
    }
  },
})

export const { setExpensesQuery } = expensesSlice.actions
export default expensesSlice.reducer

export const selectExpenseFormOptions = (state) => state.expenses.formOptions
export const selectExpenseFormOptionsLoading = (state) => state.expenses.formOptionsLoading
export const selectExpenseFormOptionsError = (state) => state.expenses.formOptionsError
export const selectExpenseSaving = (state) => state.expenses.saving

export const selectMyExpenses = (state) => state.expenses.items
export const selectMyExpensesTotal = (state) => state.expenses.total
export const selectMyExpensesQuery = (state) => state.expenses.query
export const selectMyExpensesLoading = (state) => state.expenses.listLoading
export const selectMyExpensesError = (state) => state.expenses.listError
export const selectMyExpenseStats = (state) => state.expenses.stats

export const selectExpenseDetail = (state) => state.expenses.detail
export const selectExpenseDetailLoading = (state) => state.expenses.detailLoading
export const selectExpenseDetailError = (state) => state.expenses.detailError
