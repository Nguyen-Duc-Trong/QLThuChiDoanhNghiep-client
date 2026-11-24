import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import approvalsApi from '../../services/approvalsApi'
import { withApiError } from '../../utils/apiError'
import { logout } from './sessionSlice'

// Màn 11–13 · Hàng chờ phê duyệt của người đang đăng nhập (mọi bước người đó được quyết định)

export const APPROVAL_LIST_PAGE_SIZE = 10

const toListParams = (query) => {
  const params = { page: query.page, limit: query.limit, view: query.view }
  if (query.search?.trim()) params.search = query.search.trim()
  if (query.status) params.status = query.status
  return params
}

/** Danh sách phê duyệt: mọi trạng thái, hồ sơ chờ tôi lên đầu */
export const fetchApprovalList = createAsyncThunk(
  'approvals/fetchList',
  withApiError(async (query) => {
    const res = await approvalsApi.list(toListParams(query))
    return { items: res.data ?? [], meta: res.meta }
  }),
)

export const fetchApprovalQueue =createAsyncThunk('approvals/fetchQueue', withApiError(async () => (await approvalsApi.queue()).data ?? []))

/** { id, decision, step, version, note?, fields?, checklist? } */
export const decideExpense = createAsyncThunk(
  'approvals/decide',
  withApiError(async ({ id, ...body }) => (await approvalsApi.decide(id, body)).data),
)

const approvalsSlice = createSlice({
  name: 'approvals',
  initialState: {
    queue: [],
    loaded: false,
    loading: false,
    error: null,
    deciding: false,

    list: [],
    listTotal: 0,
    listQuery: { page: 1, limit: APPROVAL_LIST_PAGE_SIZE, search: '', status: '', view: 'all' },
    listLoading: false,
    listError: null,
  },
  reducers: {
    /** Đổi bộ lọc thì về trang 1 (trừ khi chính là đổi trang) */
    setApprovalListQuery: (state, action) => {
      state.listQuery = { ...state.listQuery, page: 1, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovalList.pending, (state) => {
        state.listLoading = true
        state.listError = null
      })
      .addCase(fetchApprovalList.fulfilled, (state, action) => {
        state.listLoading = false
        state.list = action.payload.items
        state.listTotal = action.payload.meta?.total ?? action.payload.items.length
      })
      .addCase(fetchApprovalList.rejected, (state, action) => {
        state.listLoading = false
        state.listError = action.payload ?? { message: action.error.message }
      })
      .addCase(fetchApprovalQueue.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchApprovalQueue.fulfilled, (state, action) => {
        state.loading = false
        state.loaded = true
        state.queue = action.payload
      })
      .addCase(fetchApprovalQueue.rejected, (state, action) => {
        state.loading = false
        state.loaded = true
        state.error = action.payload ?? { message: action.error.message }
      })
      .addCase(decideExpense.pending, (state) => {
        state.deciding = true
      })
      .addCase(decideExpense.fulfilled, (state, action) => {
        state.deciding = false
        // Đã quyết định thì hồ sơ rời hàng chờ của mình ngay, không chờ tải lại
        state.queue = state.queue.filter((item) => item.id !== action.meta.arg.id)
      })
      .addCase(decideExpense.rejected, (state) => {
        state.deciding = false
      })
      // Đăng xuất: bỏ hàng chờ của người cũ để tài khoản kế tiếp không thấy số trên menu Phê duyệt bị sai
      .addCase(logout.pending, (state) => {
        state.queue = []
        state.loaded = false
        state.error = null
        state.list = []
        state.listTotal = 0
      })
  },
})

export const { setApprovalListQuery } = approvalsSlice.actions
export default approvalsSlice.reducer

export const selectApprovalList = (state) => state.approvals.list
export const selectApprovalListTotal = (state) => state.approvals.listTotal
export const selectApprovalListQuery = (state) => state.approvals.listQuery
export const selectApprovalListLoading = (state) => state.approvals.listLoading
export const selectApprovalListError = (state) => state.approvals.listError

export const selectApprovalQueue = (state) => state.approvals.queue
export const selectApprovalQueueLoaded = (state) => state.approvals.loaded
export const selectApprovalQueueLoading = (state) => state.approvals.loading
export const selectApprovalQueueError = (state) => state.approvals.error
export const selectApprovalDeciding = (state) => state.approvals.deciding
