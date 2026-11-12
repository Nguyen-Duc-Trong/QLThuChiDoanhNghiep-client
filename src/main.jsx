import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import '@fontsource-variable/inter'
import './index.css'
import theme from './theme/theme'
import { ToastProvider } from './components'
import store from './store'
import router from './router'
import { setOnSessionExpired } from './utils/axiosInstance'
import { sessionExpired } from './store/slices/sessionSlice'

// Refresh token hết hạn / bị thu hồi -> xóa phiên, RootLayout tự chuyển về /login
setOnSessionExpired(() => store.dispatch(sessionExpired()))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
