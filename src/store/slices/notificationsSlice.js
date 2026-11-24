import { createSlice } from '@reduxjs/toolkit'
import { logout } from './sessionSlice'

// Số trên menu do server đẩy qua SSE: approvals = hồ sơ chờ tôi duyệt, payments = hồ sơ chờ thực chi (chỉ người được thực chi)

const EMPTY = { approvals: 0, payments: 0 }

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { counts: EMPTY },
  reducers: {
    setMenuCounts: (state, action) => {
      state.counts = { ...EMPTY, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    // Đăng xuất: bỏ số của người cũ
    builder.addCase(logout.pending, (state) => {
      state.counts = EMPTY
    })
  },
})

export const { setMenuCounts } = notificationsSlice.actions
export default notificationsSlice.reducer

export const selectMenuCounts = (state) => state.notifications.counts
export const selectApprovalCount = (state) => state.notifications.counts.approvals
export const selectPendingPaymentCount = (state) => state.notifications.counts.payments
