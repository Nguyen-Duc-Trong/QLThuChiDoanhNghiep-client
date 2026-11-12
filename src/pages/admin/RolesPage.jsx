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
  useToast,
} from '../../components'
import { PERMISSION_ACTIONS, ROLE_SCOPES, SENSITIVE_ACTIONS, SPEND_FLOW } from '../../mocks/admin'
import { fetchRoles, selectRoles, selectRolesError, selectRolesLoading, updateRolePermissions } from '../../store/slices/rolesSlice'
import { selectHasPermission } from '../../store/slices/sessionSlice'
import { colors, radius } from '../../theme/tokens'
import validationResolver from '../../utils/validationResolver'
import AdminTabs from './AdminTabs'

// Màn 21 · Vai trò và ma trận phân quyền (admin hệ thống).
const SCOPE_FILTER = [{ value: '', label: 'Mọi phạm vi' }, ...ROLE_SCOPES.map((s) => ({ value: s, label: s }))]
const PERMISSION_FILTER = [
  { value: '', label: 'Tất cả quyền' },
  { value: 'sensitive', label: 'Quyền nhạy cảm' },
]

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
  const canEdit = useSelector((state) => selectHasPermission(state, 'config'))
  // Vai trò tự tạo (CUSTOM_*) chưa có API, chỉ lưu tạm trên trình duyệt
  const [customRoles, setCustomRoles] = useState([])
  const roles = useMemo(
    () => [...serverRoles.map((r) => ({ ...r, permissions: toPermissionMap(r.permissions) })), ...customRoles],
    [serverRoles, customRoles],
  )
  const [selectedKey, setSelectedKey] = useState('KE_TOAN')

  useEffect(() => {
    dispatch(fetchRoles())
  }, [dispatch])
  const [scope, setScope] = useState('')
  const [permissionFilter, setPermissionFilter] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Tùy chỉnh đã lưu theo vai trò: { [roleKey]: { readOnly, locked, lockReason } }
  const [customizations, setCustomizations] = useState({ KE_TOAN: { readOnly: true, locked: false, lockReason: 'Chờ rà soát ngân sách quý IV trước khi mở lại quyền gửi yêu cầu.' } })

  const selected = roles.find((r) => r.key === selectedKey)
  const customizeForm = useForm({ defaultValues: customizations[selectedKey] ?? EMPTY_CUSTOMIZATION, resolver: validationResolver(validateCustomization) })
  const locked = useWatch({ control: customizeForm.control, name: 'locked' })
  const roleForm = useForm({ defaultValues: { name: '', scope: ROLE_SCOPES[0] }, resolver: validationResolver(validateNewRole), context: { roles } })

  const actions = permissionFilter === 'sensitive' ? PERMISSION_ACTIONS.filter((a) => SENSITIVE_ACTIONS.includes(a.key)) : PERMISSION_ACTIONS
  const visibleRoles = roles.filter((r) => !scope || r.scope === scope)

  const selectRole = (key) => {
    setSelectedKey(key)
    customizeForm.reset(customizations[key] ?? EMPTY_CUSTOMIZATION)
  }

  const togglePermission = async (roleKey, actionKey) => {
    const role = roles.find((r) => r.key === roleKey)
    const granting = !role.permissions[actionKey]
    if (roleKey === 'ADMIN' && granting && SENSITIVE_ACTIONS.includes(actionKey)) {
      showToast('Admin chỉ quản trị cấu hình, không được cấp quyền duyệt, thực chi hay ngân sách', 'error')
      return
    }
    if (customizations[roleKey]?.locked) {
      showToast(`Vai trò ${role.name} đang bị khóa, mở khóa trước khi đổi quyền`, 'warning')
      return
    }
    const actionLabel = PERMISSION_ACTIONS.find((a) => a.key === actionKey).label
    const nextMap = { ...role.permissions, [actionKey]: granting }

    if (roleKey.startsWith('CUSTOM_')) {
      setCustomRoles((prev) => prev.map((r) => (r.key === roleKey ? { ...r, permissions: nextMap } : r)))
      showToast(`${granting ? 'Cấp' : 'Bỏ'} quyền "${actionLabel}" cho ${role.name}`, 'info')
      return
    }

    // Vai trò hệ thống: lưu lên server (PUT /roles/:key/permissions), server kiểm tra lại quy tắc
    const permissions = Object.keys(nextMap).filter((key) => nextMap[key])
    try {
      await dispatch(updateRolePermissions({ key: roleKey, permissions })).unwrap()
      showToast(`Đã ${granting ? 'cấp' : 'bỏ'} quyền "${actionLabel}" cho ${role.name}`, 'success')
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
    setCustomRoles((prev) => [...prev, { key, name: name.trim(), scope: roleScope, permissions: { view: true } }])
    setDrawerOpen(false)
    roleForm.reset()
    selectRole(key)
    showToast(`Đã tạo vai trò ${name.trim()} với quyền xem mặc định`, 'success')
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

        <SectionCard title="Ma trận phân quyền" subtitle="Quyền theo vai trò và phạm vi làm việc · Bấm vào ô để cấp / bỏ quyền">
          {rolesError && (
            <AppAlert tone="danger" title="Không tải được ma trận phân quyền" sx={{ mb: 2 }}>
              {rolesError.message}{' '}
              <Button size="small" onClick={() => dispatch(fetchRoles())}>Thử lại</Button>
            </AppAlert>
          )}
          {rolesLoading && serverRoles.length === 0 ? (
            <EmptyState variant="loading" compact />
          ) : (
            <PermissionMatrix actions={actions} roles={visibleRoles} onToggle={canEdit ? togglePermission : undefined} />
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
