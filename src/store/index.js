import { configureStore } from '@reduxjs/toolkit'
import sessionReducer from './slices/sessionSlice'
import usersReducer from './slices/usersSlice'
import rolesReducer from './slices/rolesSlice'
import permissionsReducer from './slices/permissionsSlice'
import categoriesReducer from './slices/categoriesSlice'
import expensesReducer from './slices/expensesSlice'
import departmentsReducer from './slices/departmentsSlice'
import approvalsReducer from './slices/approvalsSlice'
import paymentsReducer from './slices/paymentsSlice'
import notificationsReducer from './slices/notificationsSlice'

const store = configureStore({
  reducer: {
    session: sessionReducer,
    users: usersReducer,
    roles: rolesReducer,
    permissions: permissionsReducer,
    categories: categoriesReducer,
    expenses: expensesReducer,
    departments: departmentsReducer,
    approvals: approvalsReducer,
    payments: paymentsReducer,
    notifications: notificationsReducer,
  },
})

export default store
