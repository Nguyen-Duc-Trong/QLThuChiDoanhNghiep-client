import { configureStore } from '@reduxjs/toolkit'
import sessionReducer from './slices/sessionSlice'
import usersReducer from './slices/usersSlice'
import rolesReducer from './slices/rolesSlice'

const store = configureStore({
  reducer: {
    session: sessionReducer,
    users: usersReducer,
    roles: rolesReducer,
  },
})

export default store
