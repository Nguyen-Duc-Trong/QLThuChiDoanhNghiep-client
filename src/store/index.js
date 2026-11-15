import { configureStore } from '@reduxjs/toolkit'
import sessionReducer from './slices/sessionSlice'
import usersReducer from './slices/usersSlice'
import rolesReducer from './slices/rolesSlice'
import permissionsReducer from './slices/permissionsSlice'
import categoriesReducer from './slices/categoriesSlice'

const store = configureStore({
  reducer: {
    session: sessionReducer,
    users: usersReducer,
    roles: rolesReducer,
    permissions: permissionsReducer,
    categories: categoriesReducer,
  },
})

export default store
