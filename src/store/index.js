import { configureStore } from '@reduxjs/toolkit'
import sessionReducer from './slices/sessionSlice'
import usersReducer from './slices/usersSlice'
import rolesReducer from './slices/rolesSlice'
import permissionsReducer from './slices/permissionsSlice'

const store = configureStore({
  reducer: {
    session: sessionReducer,
    users: usersReducer,
    roles: rolesReducer,
    permissions: permissionsReducer,
  },
})

export default store
