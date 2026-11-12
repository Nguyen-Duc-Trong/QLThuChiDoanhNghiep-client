import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Eye } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { CustomCheckbox, CustomForm, CustomInput, TOAST_OPTIONS, useToast } from '../components'
import { login, selectSessionStatus } from '../store/slices/sessionSlice'
import { colors, radius } from '../theme/tokens'
import validationResolver from '../utils/validationResolver'
import logoChart from '../assets/login/logo-chart.svg'
import eyeOffIcon from '../assets/login/eye-off.svg'
import shieldIcon from '../assets/login/shield.svg'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Ô nhập cao 48px như thiết kế (mặc định của theme là 40px).
const inputSx = { '& .MuiOutlinedInput-root': { height: 48, pr: 0.5 }, '& .MuiOutlinedInput-input': { px: 1.75 } }

function validate({ email, password }) {
  const errors = {}
  if (!email.trim()) errors.email = 'Vui lòng nhập email công ty'
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Email không hợp lệ'
  if (!password) errors.password = 'Vui lòng nhập mật khẩu'
  return errors
}

/**
 * Trang đăng nhập (đứng ngoài khung sidebar/topbar).
 * Gọi POST /api/login: server đặt cookie httpOnly và trả về người dùng + vai trò + quyền.
 * Đăng nhập xong quay lại trang đang mở trước đó (RootLayout truyền qua state.from).
 */
export default function LoginPage() {
  const showToast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const status = useSelector(selectSessionStatus)
  const redirectTo = location.state?.from ?? '/'
  const methods = useForm({
    defaultValues: { email: '', password: '', remember: false },
    resolver: validationResolver(validate),
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (values) => {
    setSubmitting(true)
    try {
      await dispatch(login({ email: values.email.trim().toLowerCase(), password: values.password })).unwrap()
      navigate(redirectTo, { replace: true })
    } catch (error) {
      // 401: sai email/mật khẩu -> báo dưới ô mật khẩu; 403 (bị khóa), lỗi mạng... -> toast
      if (error?.response?.status === 401) methods.setError('password', { message: error.message })
      else showToast(error?.message || 'Đăng nhập thất bại', 'error', TOAST_OPTIONS.fromError(error))
    } finally {
      setSubmitting(false)
    }
  }

  // Đã đăng nhập rồi mà vào /login thì quay lại ứng dụng
  if (status === 'authenticated' && !submitting) return <Navigate to={redirectTo} replace />

  return (
    <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column', bgcolor: colors.background }}>
      <Box
        component="header"
        sx={{
          height: 96,
          flexShrink: 0,
          px: { xs: 2, sm: 6 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 34, height: 34, borderRadius: '9px', bgcolor: colors.primary, display: 'grid', placeItems: 'center' }}>
            <img src={logoChart} alt="" width={21} height={21} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 600, lineHeight: 1.5 }}>An Việt</Typography>
            <Typography sx={{ fontSize: 10, lineHeight: 1.5, color: colors.textSecondary }}>QUẢN TRỊ TÀI CHÍNH</Typography>
          </Box>
        </Stack>
        <Typography sx={{ fontSize: 13, color: colors.textSecondary, display: { xs: 'none', sm: 'block' } }}>
          Công ty CP An Việt
        </Typography>
      </Box>

      <Box
        component="main"
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, px: 2, py: 6 }}
      >
        <CustomForm
          methods={methods}
          onSubmit={submit}
          sx={{
            width: 480,
            maxWidth: '100%',
            p: { xs: 3, sm: 4 },
            bgcolor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: `${radius.lg}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: 3.5,
          }}
        >
          <Stack spacing={1}>
            <Typography sx={{ fontSize: 10, fontWeight: 600, color: colors.primary }}>AN VIỆT FINANCE</Typography>
            <Typography variant="h1" component="h1" sx={{ letterSpacing: 0, lineHeight: 1.5 }}>
              Chào mừng trở lại
            </Typography>
            <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>
              Đăng nhập để quản lý thu chi và ngân sách doanh nghiệp.
            </Typography>
          </Stack>

          <Stack spacing={2.5}>
            <CustomInput
              name="email"
              label="Email công ty"
              type="email"
              autoComplete="username"
              placeholder="ten@anviet.vn"
              sx={inputSx}
            />
            <CustomInput
              name="password"
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              sx={inputSx}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        onClick={() => setShowPassword((s) => !s)}
                        sx={{ color: colors.text }}
                      >
                        {showPassword ? <Eye size={18} /> : <img src={eyeOffIcon} alt="" width={18} height={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <CustomCheckbox name="remember" label="Ghi nhớ đăng nhập" />
              <Link
                component="button"
                type="button"
                underline="hover"
                onClick={() => showToast('Vui lòng liên hệ quản trị viên để đặt lại mật khẩu', 'info')}
                sx={{ fontSize: 13, fontWeight: 600 }}
              >
                Quên mật khẩu?
              </Link>
            </Stack>

            <Button type="submit" variant="contained" fullWidth loading={submitting} sx={{ height: 48 }}>
              Đăng nhập
            </Button>
          </Stack>

          <Stack spacing={0.75} sx={{ alignItems: 'center', pt: 2.75, borderTop: `1px solid ${colors.border}` }}>
            <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>Bạn chưa được cấp tài khoản?</Typography>
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={() => showToast('Liên hệ phòng Kế toán – Quản trị hệ thống để được cấp tài khoản', 'info')}
              sx={{ fontSize: 13, fontWeight: 600 }}
            >
              Liên hệ quản trị viên
            </Link>
          </Stack>
        </CustomForm>

        <Stack direction="row" spacing={1.25} sx={{ width: 448, maxWidth: '100%', alignItems: 'flex-start' }}>
          <img src={shieldIcon} alt="" width={18} height={18} style={{ flexShrink: 0 }} />
          <Typography sx={{ fontSize: 11, lineHeight: 1.5, color: colors.textSecondary }}>
            Chỉ đăng nhập trên thiết bị tin cậy. Không chia sẻ mật khẩu và đăng xuất khi dùng xong trên máy tính chung.
          </Typography>
        </Stack>
      </Box>

      <Box
        component="footer"
        sx={{
          height: 96,
          flexShrink: 0,
          px: { xs: 2, sm: 6 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: 11, color: colors.textMuted }}>An Việt Finance · 2026</Typography>
        <Typography sx={{ fontSize: 11, color: colors.textSecondary }}>Hệ thống quản trị tài chính nội bộ</Typography>
      </Box>
    </Box>
  )
}
