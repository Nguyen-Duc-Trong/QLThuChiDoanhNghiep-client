import { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  AppAlert,
  CustomInput,
  CustomSelect,
  CustomTab,
  EmptyState,
  FormDrawer,
  StatusBadge,
  TOAST_OPTIONS,
  usePermission,
  useToast,
} from '../../components'
import { ROLES } from '../../constants/navigation'
import { PERMS } from '../../constants/permissions'
import {
  fetchPermissionCatalog,
  fetchUserPermissions,
  selectPermissionCatalog,
  updateUserPermissions,
} from '../../store/slices/permissionsSlice'
import { colors, radius } from '../../theme/tokens'
import { ADMIN_REQUIRED_REASON, ADMIN_SENSITIVE_REASON, flattenCatalog } from '../../utils/permissionCatalog'

const INHERIT = 'inherit'
const EFFECT_OPTIONS = [
  { value: INHERIT, label: 'Theo vai trò' },
  { value: 'grant', label: 'Cấp thêm' },
  { value: 'deny', label: 'Thu hồi' },
]

// Tên field trong form: "overrides.income.create" (react-hook-form tự lồng theo dấu chấm)
const fieldName = (permissionKey) => `overrides.${permissionKey}`

function readOverride(values, permissionKey) {
  return permissionKey.split('.').reduce((obj, part) => obj?.[part], values) ?? INHERIT
}

function buildDefaults(actions, overrides) {
  const byKey = Object.fromEntries(overrides.map((o) => [o.permission, o.effect]))
  const values = {}
  for (const a of actions) {
    const [moduleKey, actionKey] = a.key.split('.')
    values[moduleKey] = { ...values[moduleKey], [actionKey]: byKey[a.key] ?? INHERIT }
  }
  return { overrides: values, reason: '' }
}

/**
 * Drawer phân quyền riêng cho một người: mỗi quyền chọn Theo vai trò / Cấp thêm / Thu hồi.
 * Quyền hiệu lực = quyền vai trò + cấp thêm − thu hồi. Server kiểm tra lại mọi quy tắc.
 * user: { id, username, role } hoặc null (đóng).
 */
export default function UserPermissionsDrawer({ user, currentUserId, onClose }) {
  const dispatch = useDispatch()
  const showToast = useToast()
  const catalog = useSelector(selectPermissionCatalog)
  const canEdit = usePermission(PERMS.ADMIN_ROLES)
  const [data, setData] = useState(null) // { rolePermissions, overrides }
  const [loadError, setLoadError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState(null)
  const methods = useForm({ defaultValues: { overrides: {}, reason: '' } })
  const values = useWatch({ control: methods.control })

  const actions = useMemo(() => flattenCatalog(catalog), [catalog])
  const isSelf = user?.id === currentUserId
  const readOnly = !canEdit || isSelf
  const role = data?.role ?? user?.role

  useEffect(() => {
    dispatch(fetchPermissionCatalog())
  }, [dispatch])

  // Component được mount lại theo từng user (key ở UsersPage) nên không cần reset state ở đây
  useEffect(() => {
    if (!user) return undefined
    let cancelled = false
    dispatch(fetchUserPermissions(user.id))
      .unwrap()
      .then((result) => !cancelled && setData(result))
      .catch((error) => !cancelled && setLoadError(error))
    return () => {
      cancelled = true
    }
  }, [user, dispatch])

  useEffect(() => {
    if (data && actions.length > 0) methods.reset(buildDefaults(actions, data.overrides))
  }, [data, actions, methods])

  const activeTab = tab ?? catalog[0]?.key
  const roleHas = (key) => Boolean(data?.rolePermissions.includes(key))
  const effectOf = (key) => readOverride(values.overrides, key)
  const effective = (key) => {
    const effect = effectOf(key)
    return effect === 'grant' ? true : effect === 'deny' ? false : roleHas(key)
  }
  const changedCount = (moduleKey) =>
    actions.filter((a) => a.moduleKey === moduleKey && effectOf(a.key) !== INHERIT).length

  // Ràng buộc với người có vai trò ADMIN (server cũng chặn)
  const optionsFor = (action) =>
    EFFECT_OPTIONS.map((o) => ({
      ...o,
      disabled:
        role === 'ADMIN' &&
        ((o.value === 'grant' && action.sensitive) || (o.value === 'deny' && action.adminRequired)),
    }))
  const adminHint = (action) =>
    role !== 'ADMIN' ? null : action.sensitive ? ADMIN_SENSITIVE_REASON : action.adminRequired ? ADMIN_REQUIRED_REASON : null

  const save = methods.handleSubmit(async (formValues) => {
    const previous = Object.fromEntries(data.overrides.map((o) => [o.permission, o]))
    const reason = formValues.reason.trim()
    const overrides = actions
      .map((a) => ({ permission: a.key, effect: readOverride(formValues.overrides, a.key) }))
      .filter((o) => o.effect !== INHERIT)
      .map((o) => {
        const unchanged = previous[o.permission]?.effect === o.effect
        return { ...o, reason: (unchanged && !reason ? previous[o.permission].reason : reason) || undefined }
      })
    setSaving(true)
    try {
      const saved = await dispatch(updateUserPermissions({ userId: user.id, overrides })).unwrap()
      const dropped = overrides.length - saved.overrides.length
      showToast(
        dropped > 0
          ? `Đã lưu quyền riêng cho ${user.username}. ${dropped} mục trùng với vai trò nên được bỏ qua.`
          : `Đã lưu quyền riêng cho ${user.username}`,
        'success',
      )
      onClose()
    } catch (error) {
      showToast(error?.message || 'Lưu quyền riêng thất bại', 'error', TOAST_OPTIONS.fromError(error))
    } finally {
      setSaving(false)
    }
  })

  const loading = !data && !loadError
  const moduleActions = actions.filter((a) => a.moduleKey === activeTab)

  return (
    <FormDrawer
      open={Boolean(user)}
      onClose={() => !saving && onClose()}
      width={560}
      title={`Phân quyền riêng · ${user?.username ?? ''}`}
      subtitle={`Vai trò: ${ROLES[role]?.label ?? role ?? ''}. Mặc định theo vai trò; chỉ chỉnh những quyền cần khác biệt.`}
      note={readOnly ? undefined : 'Mọi thay đổi quyền được ghi kèm người chỉnh và lý do.'}
      actions={
        readOnly ? (
          <Button variant="outlined" onClick={onClose}>Đóng</Button>
        ) : (
          <>
            <Button variant="outlined" disabled={saving} onClick={onClose}>Hủy</Button>
            <Button variant="contained" loading={saving} disabled={loading || Boolean(loadError)} onClick={save}>
              Lưu quyền riêng
            </Button>
          </>
        )
      }
    >
      {isSelf && (
        <AppAlert tone="warning" title="Không thể tự sửa quyền của chính mình">
          Nhờ một quản trị viên khác chỉnh quyền riêng cho tài khoản này.
        </AppAlert>
      )}
      {!isSelf && !canEdit && (
        <AppAlert tone="info" title="Chỉ xem">
          Bạn cần quyền "Vai trò & phân quyền" để chỉnh quyền riêng.
        </AppAlert>
      )}
      {loadError && (
        <AppAlert tone="danger" title="Không tải được quyền của người dùng">
          {loadError.message}
        </AppAlert>
      )}
      {loading ? (
        <EmptyState variant="loading" compact />
      ) : (
        data && (
          <FormProvider {...methods}>
            <CustomTab
              value={activeTab}
              onChange={setTab}
              tabs={catalog.map((m) => ({ value: m.key, label: m.label, count: changedCount(m.key) || undefined }))}
            />
            <Stack spacing={1}>
              {moduleActions.map((action) => {
                const changed = effectOf(action.key) !== INHERIT
                return (
                  <Box
                    key={action.key}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 170px' },
                      gap: 1.5,
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: `${radius.md}px`,
                      bgcolor: changed ? colors.primarySoft : colors.surfaceMuted,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{action.label}</Typography>
                      <Stack direction="row" spacing={0.75} sx={{ mt: 0.5, flexWrap: 'wrap', rowGap: 0.5 }}>
                        <StatusBadge size="small" tone="neutral" label={`Vai trò: ${roleHas(action.key) ? 'Có' : 'Không'}`} />
                        <StatusBadge
                          size="small"
                          tone={effective(action.key) ? 'success' : 'danger'}
                          label={`Hiệu lực: ${effective(action.key) ? 'Có' : 'Không'}`}
                        />
                        {action.sensitive && <StatusBadge size="small" tone="warning" label="Nhạy cảm" />}
                      </Stack>
                      {adminHint(action) && (
                        <Typography variant="caption" component="p" sx={{ mt: 0.5 }}>{adminHint(action)}</Typography>
                      )}
                    </Box>
                    <CustomSelect name={fieldName(action.key)} options={optionsFor(action)} disabled={readOnly} size="small" />
                  </Box>
                )
              })}
            </Stack>
            {!readOnly && (
              <CustomInput
                name="reason"
                label="Lý do thay đổi"
                multiline
                minRows={2}
                placeholder="Ví dụ: Tạm thu hồi quyền tạo khoản thu trong thời gian rà soát quý IV."
              />
            )}
          </FormProvider>
        )
      )}
    </FormDrawer>
  )
}
