import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import paymentsApi from '../../services/paymentsApi'
import { withApiError } from '../../utils/apiError'
import { logout } from './sessionSlice'

// Màn 15–16 · Thực hiện chi: hồ sơ thanh toán (chờ chi + hoàn thành), lịch sử chi, hoàn thành chi (upload ủy nhiệm chi)

export const TRANSACTIONS_PAGE_SIZE = 10
export const PAYMENT_REQUESTS_PAGE_SIZE = 10
const EMPTY_STAT = { count: 0, amount: 0 }

const toParams = (query) => {
  const params = { page: query.page, limit: query.limit }
  if (query.search?.trim()) params.search = query.search.trim()
  if (query.month) params.month = query.month
  if (query.source) params.source = query.source
  if (query.status) params.status = query.status
  return params
}

/** Hồ sơ thanh toán: Đã duyệt (chờ chi) + Hoàn thành, chờ chi lên đầu */
export const fetchPaymentRequests = createAsyncThunk(
  'payments/fetchRequests',
  withApiError(async (query) => {
    const res = await paymentsApi.requests(toParams(query))
    return { items: res.data ?? [], meta: res.meta }
  }),
)
export const fetchPaymentStats = createAsyncThunk('payments/fetchStats', withApiError(async () => (await paymentsApi.stats()).data))
export const fetchTransactions = createAsyncThunk(
  'payments/fetchTransactions',
  withApiError(async (query) => {
    const res = await paymentsApi.transactions(toParams(query))
    return { items: res.data ?? [], meta: res.meta }
  }),
)

/** { expenseId, file: File (ủy nhiệm chi), note? } — Hoàn thành chi */
export const executePayment = createAsyncThunk(
  'payments/execute',
  withApiError(async ({ expenseId, file, note }) => (await paymentsApi.execute(expenseId, { file, note })).data),
)

const paymentsSlice = createSlice({
  name: 'payments',
  initialState: {
    requests: [],
    requestsTotal: 0,
    requestsQuery: { page: 1, limit: PAYMENT_REQUESTS_PAGE_SIZE, search: '', status: '' },
    requestsLoading: false,
    requestsError: null,

    stats: { pending: EMPTY_STAT, thisMonth: EMPTY_STAT },

    transactions: [],
    total: 0,
    query: { page: 1, limit: TRANSACTIONS_PAGE_SIZE, search: '', month: '', source: '' },
    transactionsLoading: false,
    transactionsError: null,

    executing: false,
  },
  reducers: {
    /** Đổi bộ lọc thì về trang 1 (trừ khi chính là đổi trang) */
    setTransactionsQuery: (state, action) => {
      state.query = { ...state.query, page: 1, ...action.payload }
    },
    setPaymentRequestsQuery: (state, action) => {
      state.requestsQuery = { ...state.requestsQuery, page: 1, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentRequests.pending, (state) => {
        state.requestsLoading = true
        state.requestsError = null
      })
      .addCase(fetchPaymentRequests.fulfilled, (state, action) => {
        state.requestsLoading = false
        state.requests = action.payload.items
        state.requestsTotal = action.payload.meta?.total ?? action.payload.items.length
      })
      .addCase(fetchPaymentRequests.rejected, (state, action) => {
        state.requestsLoading = false
        state.requestsError = action.payload ?? { message: action.error.message }
      })
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.stats = action.payload ?? state.stats
      })
      .addCase(fetchTransactions.pending, (state) => {
        state.transactionsLoading = true
        state.transactionsError = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false
        state.transactions = action.payload.items
        state.total = action.payload.meta?.total ?? action.payload.items.length
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.transactionsLoading = false
        state.transactionsError = action.payload ?? { message: action.error.message }
      })
      .addCase(executePayment.pending, (state) => {
        state.executing = true
      })
      .addCase(executePayment.fulfilled, (state, action) => {
        state.executing = false
        // Đã chi: đổi trạng thái dòng tương ứng ngay, không chờ tải lại
        const item = state.requests.find((r) => r.id === action.meta.arg.expenseId)
        if (item) {
          item.status = 'DA_THANH_TOAN'
          item.statusLabel = 'Hoàn thành'
          item.overdue = false
          item.paymentCode = action.payload?.code ?? null
          item.paidAt = action.payload?.executedAt ?? null
        }
        state.stats.pending = {
          count: Math.max(0, state.stats.pending.count - 1),
          amount: Math.max(0, state.stats.pending.amount - (action.payload?.amount ?? 0)),
        }
      })
      .addCase(executePayment.rejected, (state) => {
        state.executing = false
      })
      // Đăng xuất: bỏ dữ liệu của người cũ
      .addCase(logout.pending, (state) => {
        state.requests = []
        state.requestsTotal = 0
        state.stats = { pending: EMPTY_STAT, thisMonth: EMPTY_STAT }
        state.transactions = []
        state.total = 0
      })
  },
})

export const { setTransactionsQuery, setPaymentRequestsQuery } = paymentsSlice.actions
export default paymentsSlice.reducer

export const selectPaymentRequests = (state) => state.payments.requests
export const selectPaymentRequestsTotal = (state) => state.payments.requestsTotal
export const selectPaymentRequestsQuery = (state) => state.payments.requestsQuery
export const selectPaymentRequestsLoading = (state) => state.payments.requestsLoading
export const selectPaymentRequestsError = (state) => state.payments.requestsError
export const selectPaymentStats = (state) => state.payments.stats
export const selectTransactions = (state) => state.payments.transactions
export const selectTransactionsTotal = (state) => state.payments.total
export const selectTransactionsQuery = (state) => state.payments.query
export const selectTransactionsLoading = (state) => state.payments.transactionsLoading
export const selectTransactionsError = (state) => state.payments.transactionsError
export const selectPaymentExecuting = (state) => state.payments.executing
