import { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Download, Plus } from 'lucide-react'
import {
  AppAlert,
  CustomCheckbox,
  CustomForm,
  CustomInput,
  CustomSelect,
  CustomTab,
  EmptyState,
  FilterSelect,
  FormDrawer,
  FormFooter,
  PageHeader,
  PermissionMatrix,
  ProcessFlow,
  SectionCard,
  StatusBadge,
  TOAST_OPTIONS,
  usePermission,
  useToast,
} from '../../components'
import { ROLE_SCOPES, SPEND_FLOW } from '../../mocks/admin'
import { PERMS } from '../../constants/permissions'
import { fetchRoles, selectRoles, selectRolesError, selectRolesLoading, updateRolePermissions } from '../../store/slices/rolesSlice'
import {
  fetchPermissionCatalog,
  selectPermissionCatalog,
  selectPermissionCatalogError,
  selectPermissionCatalogLoading,
} from '../../store/slices/permissionsSlice'
import { refreshSession, selectCurrentUser } from '../../store/slices/sessionSlice'
import { colors, radius } from '../../theme/tokens'
import { adminLockReason, indexCatalog } from '../../utils/permissionCatalog'
import validationResolver from '../../utils/validationResolver'
import AdminTabs from './AdminTabs'

// Màn 21 · Vai trò và ma trận phân quyền (admin hệ thống).
const SCOPE_FILTER = [{ value: '', label: 'Mọi phạm vi' }, ...ROLE_SCOPES.map((s) => ({ value: s, label: s }))]
const PERMISSION_FILTER = [
  { value: '', label: 'Tất cả quyền' },
  { value: 'sensitive', label: 'Quyền nhạy cảm' },
]

// Cột đặc biệt "Cả module": bấm để cấp / bỏ toàn bộ quyền của module đang xem cho một vai trò
const ALL_KEY = '__all'

const EMPTY_CUSTOMIZATION = { readOnly: false, locked: false, lockReason: '' }

function validateCustomization(values) {
  return values.locked && !values.lockReason.trim() ? { lockReason: 'Nhập lý do khóa để lưu vào nhật ký.' } : {}
}

function validateNewRole(values, { roles }) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Nhập tên vai trò.'
  else if (roles.some((r) => r.name.toLowerCase() === values.name.trim().toLowerCase())) errors.name = 'Tên vai trò đã tồn tại.'
  return errors
}

// Server trả permissions dạng mảng; PermissionMatrix cần dạng { [actionKey]: true }
const toPermissionMap = (list) => Object.fromEntries(list.map((key) => [key, true]))

export default function RolesPage() {
  const showToast = useToast()
  const dispatch = useDispatch()
  const serverRoles = useSelector(selectRoles)
  const rolesLoading = useSelector(selectRolesLoading)
  const rolesError = useSelector(selectRolesError)
  const catalog = useSelector(selectPermissionCatalog)
  const catalogLoading = useSelector(selectPermissionCatalogLoading)
  const catalogError = useSelector(selectPermissionCatalogError)
  const currentUser = useSelector(selectCurrentUser)
  const canEdit = usePermission(PERMS.ADMIN_ROLES)
  // Vai trò tự tạo (CUSTOM_*) chưa có API, chỉ lưu tạm trên trình duyệt
  const [customRoles, setCustomRoles] = useState([])
  const roles = useMemo(
    () => [...serverRoles.map((r) => ({ ...r, permissions: toPermissionMap(r.permissions) })), ...customRoles],
    [serverRoles, customRoles],
  )
  const [selectedKey, setSelectedKey] = useState('KE_TOAN')

  useEffect(() => {
    dispatch(fetchRoles())
    dispatch(fetchPermissionCatalog())
  }, [dispatch])
  const [scope, setScope] = useState('')
  const [permissionFilter, setPermissionFilter] = useState('')
  const [moduleTab, setModuleTab] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Tùy chỉnh đã lưu theo vai trò: { [roleKey]: { readOnly, locked, lockReason } }
  const [customizations, setCustomizations] = useState({ KE_TOAN: { readOnly: true, locked: false, lockReason: 'Chờ rà soát ngân sách quý IV trước khi mở lại quyền gửi yêu cầu.' } })

  const selected = roles.find((r) => r.key === selectedKey)
  const customizeForm = useForm({ defaultValues: customizations[selectedKey] ?? EMPTY_CUSTOMIZATION, resolver: validationResolver(validateCustomization) })
  const locked = useWatch({ control: customizeForm.control, name: 'locked' })
  const roleForm = useForm({ defaultValues: { name: '', scope: ROLE_SCOPES[0] }, resolver: validationResolver(validateNewRole), context: { roles } })

  // ----- Ma trận theo tab module -----
  const actionIndex = useMemo(() => indexCatalog(catalog), [catalog])
  const modules =
    permissionFilter === 'sensitive'
      ? catalog.map((m) => ({ ...m, actions: m.actions.filter((a) => a.sensitive) })).filter((m) => m.actions.length > 0)
      : catalog
  const activeModule = modules.find((m) => m.key === moduleTab) ?? modules[0]
  const moduleActions = activeModule?.actions ?? []
  // Hàng ma trận: thêm ô "Cả module" = có đủ mọi quyền của module đang xem
  const visibleRoles = roles
    .filter((r) => !scope || r.scope === scope)
    .map((r) => ({
      ...r,
      permissions: { ...r.permissions, [ALL_KEY]: moduleActions.length > 0 && moduleActions.every((a) => r.permissions[a.key]) },
    }))
  const matrixActions = moduleActions.length > 1 ? [...moduleActions, { key: ALL_KEY, label: 'Cả module' }] : moduleActions

  const getLockedReason = (role, actionKey) =>
    actionKey === ALL_KEY ? null : adminLockReason(role.key, actionIndex[actionKey], Boolean(role.permissions[actionKey]))

  const selectRole = (key) => {
    setSelectedKey(key)
    customizeForm.reset(customizations[key] ?? EMPTY_CUSTOMIZATION)
  }

  const togglePermission = async (roleKey, actionKey) => {
    const role = roles.find((r) => r.key === roleKey)
    if (customizations[roleKey]?.locked) {
      showToast(`Vai trò ${role.name} đang bị khóa, mở khóa trước khi đổi quyền`, 'warning')
      return
    }

    // Một ô hoặc cả module. Với ADMIN, bỏ qua các quyền bị khóa (nhạy cảm / bắt buộc giữ).
    const bulk = actionKey === ALL_KEY
    const granting = bulk ? !moduleActions.every((a) => role.permissions[a.key]) : !role.permissions[actionKey]
    const targets = (bulk ? moduleActions : [actionIndex[actionKey]]).filter(
      (a) => !adminLockReason(roleKey, a, Boolean(role.permissions[a.key])),
    )
    if (targets.length === 0) return
    const nextMap = { ...role.permissions }
    targets.forEach((a) => {
      nextMap[a.key] = granting
    })
    const label = bulk ? `toàn bộ module ${activeModule.label}` : `quyền "${activeModule.label} · ${targets[0].label}"`

    if (roleKey.startsWith('CUSTOM_')) {
      setCustomRoles((prev) => prev.map((r) => (r.key === roleKey ? { ...r, permissions: nextMap } : r)))
      showToast(`${granting ? 'Cấp' : 'Bỏ'} ${label} cho ${role.name}`, 'info')
      return
    }

    // Vai trò hệ thống: lưu lên server (PUT /roles/:key/permissions), server kiểm tra lại quy tắc
    const permissions = Object.keys(nextMap).filter((key) => key !== ALL_KEY && nextMap[key])
    try {
      await dispatch(updateRolePermissions({ key: roleKey, permissions })).unwrap()
      showToast(`Đã ${granting ? 'cấp' : 'bỏ'} ${label} cho ${role.name}`, 'success')
      // Sửa vai trò của chính mình: tải lại quyền để sidebar / nút đổi theo ngay
      if (roleKey === currentUser?.roleCode) dispatch(refreshSession())
    } catch (error) {
      showToast(error?.message || 'Cập nhật quyền thất bại', 'error', TOAST_OPTIONS.fromError(error))
    }
  }

  const saveCustomization = (values) => {
    setCustomizations((prev) => ({ ...prev, [selectedKey]: values }))
    customizeForm.reset(values)
    showToast(`Đã lưu tùy chỉnh quyền cho ${selected.name}, thay đổi được ghi nhật ký`, 'success')
  }

  const createRole = roleForm.handleSubmit(({ name, scope: roleScope }) => {
    const key = `CUSTOM_${roles.length + 1}`
    setCustomRoles((prev) => [...prev, { key, name: name.trim(), scope: roleScope, permissions: { [PERMS.DASHBOARD_MENU]: true } }])
    setDrawerOpen(false)
    roleForm.reset()
    selectRole(key)
    showToast(`Đã tạo vai trò ${name.trim()} với menu Tổng quan mặc định`, 'success')
  })

  return (
    <>
      <PageHeader
        eyebrow="21 / PHÂN QUYỀN"
        title="Vai trò và ma trận phân quyền"
        description="Quản lý quyền xem, tạo, sửa, gửi, duyệt và thực hiện theo vai trò, phạm vi và luồng chi của An Việt Finance."
        actions={
          <>
            <Button variant="outlined" startIcon={<Download size={16} />} onClick={() => showToast('Đang xuất cấu hình phân quyền...', 'info')}>
              Xuất cấu hình
            </Button>
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setDrawerOpen(true)}>
              Tạo vai trò mới
            </Button>
          </>
        }
        tags={<StatusBadge label={`${serverRoles.length} vai trò hệ thống`} tone="primary" />}
        toolbar={
          <>
            <FilterSelect value={scope} options={SCOPE_FILTER} onChange={setScope} />
            <FilterSelect value={permissionFilter} options={PERMISSION_FILTER} onChange={setPermissionFilter} />
            <FilterSelect value={selectedKey} options={roles.map((r) => ({ value: r.key, label: `Chọn vai trò: ${r.name}` }))} onChange={selectRole} />
          </>
        }
      />
      <AdminTabs />

      <Stack spacing={3}>
        <SectionCard
          title="Giới thiệu ma trận phân quyền"
          subtitle="Mỗi vai trò chỉ hành động đúng cấp. Nhân viên gửi yêu cầu → Trưởng phòng duyệt phòng → Kế toán thẩm định → Lãnh đạo duyệt cuối → Kế toán thực chi."
        >
          <AppAlert tone="info" title="Quy tắc bảo vệ quyền nhạy cảm" sx={{ mb: 2 }}>
            Không tự duyệt hồ sơ mình tạo. Admin chỉ quản trị cấu hình, không mặc định quyền duyệt hoặc thực hiện chi. Thu do kế toán kiểm tra và xác nhận thực thu độc lập.
          </AppAlert>
          <ProcessFlow variant="cards" steps={SPEND_FLOW} />
        </SectionCard>

        <SectionCard
          title="Ma trận phân quyền"
          subtitle="Chọn module, bấm vào ô để cấp / bỏ quyền cho vai trò · Xem menu = thấy mục trên sidebar và mở được trang · Muốn khác biệt cho riêng một người: dùng nút chìa khóa ở tab Người dùng"
        >
          {(rolesError || catalogError) && (
            <AppAlert tone="danger" title="Không tải được ma trận phân quyền" sx={{ mb: 2 }}>
              {(rolesError || catalogError).message}{' '}
              <Button
                size="small"
                onClick={() => {
                  dispatch(fetchRoles())
                  dispatch(fetchPermissionCatalog())
                }}
              >
                Thử lại
              </Button>
            </AppAlert>
          )}
          {(rolesLoading && serverRoles.length === 0) || (catalogLoading && catalog.length === 0) ? (
            <EmptyState variant="loading" compact />
          ) : (
            <>
              <CustomTab
                value={activeModule?.key ?? false}
                onChange={setModuleTab}
                tabs={modules.map((m) => ({ value: m.key, label: m.label }))}
                sx={{ mb: 2 }}
              />
              <PermissionMatrix
                actions={matrixActions}
                roles={visibleRoles}
                onToggle={canEdit ? togglePermission : undefined}
                getLockedReason={getLockedReason}
              />
            </>
          )}
        </SectionCard>

        <SectionCard title="Chọn vai trò" subtitle="Xem nhanh cấu hình mặc định cho từng vai trò">
          <Stack spacing={1}>
            {roles.map((role) => {
              const active = role.key === selectedKey
              return (
                <ButtonBase
                  key={role.key}
                  onClick={() => selectRole(role.key)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.25,
                    borderRadius: `${radius.md}px`,
                    bgcolor: active ? colors.primarySoft : colors.surfaceMuted,
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: active ? colors.primary : colors.borderStrong }} />
                    <Typography sx={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>{role.name}</Typography>
                    {customizations[role.key]?.locked && <StatusBadge label="Đang khóa" tone="danger" size="small" />}
                    {customizations[role.key]?.readOnly && <StatusBadge label="Read-only" tone="neutral" size="small" />}
                  </Stack>
                  <Typography variant="caption" sx={{ color: active ? colors.primary : undefined }}>{active ? 'Đang chọn' : role.scope}</Typography>
                </ButtonBase>
              )
            })}
          </Stack>
        </SectionCard>

        <SectionCard title={`Tùy chỉnh quyền · ${selected?.name ?? ''}`} subtitle="Chọn quyền read-only hoặc khóa có lý do">
          <CustomForm methods={customizeForm} onSubmit={saveCustomization}>
            <Stack spacing={1.5}>
              <CustomCheckbox name="readOnly" label="Read-only: chỉ xem, không tạo hoặc sửa" />
              <CustomCheckbox name="locked" label="Khóa có lý do: tạm ngưng quyền nhưng giữ lịch sử" />
              <CustomInput name="lockReason" label="Lý do khóa" required={locked} multiline minRows={2} placeholder="Chờ rà soát ngân sách quý IV trước khi mở lại quyền gửi yêu cầu." />
            </Stack>
            <FormFooter note={customizeForm.formState.isDirty ? 'Có thay đổi chưa lưu.' : 'Mọi thay đổi quyền được ghi vào nhật ký.'}>
              <Button variant="outlined" onClick={() => customizeForm.reset()}>Hủy</Button>
              <Button variant="contained" type="submit">Lưu thay đổi</Button>
            </FormFooter>
          </CustomForm>
        </SectionCard>
      </Stack>

      <FormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Tạo vai trò mới"
        subtitle="Vai trò mới chỉ có quyền xem; cấp thêm quyền trong ma trận sau khi tạo."
        actions={
          <>
            <Button variant="outlined" onClick={() => setDrawerOpen(false)}>Hủy</Button>
            <Button variant="contained" onClick={createRole}>Tạo vai trò</Button>
          </>
        }
      >
        <FormProvider {...roleForm}>
          <CustomInput name="name" label="Tên vai trò" required placeholder="Kiểm soát nội bộ" />
          <CustomSelect name="scope" label="Phạm vi" required options={ROLE_SCOPES} />
        </FormProvider>
        <AppAlert tone="info" title="Không cấp ngầm quyền nhạy cảm">
          Quyền duyệt, thực chi và ngân sách phải được cấp riêng và được ghi nhật ký.
        </AppAlert>
      </FormDrawer>
    </>
  )
}
