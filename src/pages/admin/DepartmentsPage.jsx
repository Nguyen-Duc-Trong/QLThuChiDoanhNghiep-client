import { useCallback, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Plus, Trash2, UserCheck, Undo2 } from 'lucide-react'
import {
  AppAlert,
  ApprovalTimeline,
  ConfirmDialog,
  CustomForm,
  CustomInput,
  CustomMoneyInput,
  CustomSelect,
  DataTable,
  EmptyState,
  FormDrawer,
  FormGrid,
  FormTextField,
  PageHeader,
  SectionCard,
  StatusBadge,
  TOAST_OPTIONS,
  TwoLineText,
  useToast,
} from '../../components'
import { ROLES } from '../../constants/navigation'
import {
  createDelegation,
  createDepartment,
  deleteDepartment,
  fetchDelegations,
  fetchDepartments,
  fetchSettings,
  fetchStaffOptions,
  revokeDelegation,
  selectDelegations,
  selectDepartments,
  selectDepartmentsError,
  selectDepartmentsLoading,
  selectSettings,
  selectStaffOptions,
  updateDepartment,
  updateSettings,
} from '../../store/slices/departmentsSlice'
import { colors } from '../../theme/tokens'
import { formatDate, formatDateTime, formatMoney } from '../../utils/format'
import validationResolver from '../../utils/validationResolver'
import AdminTabs from './AdminTabs'

// Màn 22 · Phòng ban, ủy quyền phê duyệt và cấu hình hệ thống (gọi API /departments, /delegations, /settings).
const NEW = 'NEW'
const CODE_MAX = 30

const FLOW_STEPS = [
  { title: 'Nhân viên gửi yêu cầu', description: 'Không tự duyệt hồ sơ mình tạo', status: 'done' },
  { title: 'Trưởng phòng phê duyệt', description: 'Trưởng phòng tạo hồ sơ thì người phụ trách duyệt thay', status: 'done' },
  { title: 'Kế toán thẩm định', description: 'Đối chiếu chứng từ, tài khoản và hạn mức ngân sách', status: 'done' },
  { title: 'Lãnh đạo duyệt cuối', description: 'Có thể ủy quyền cho người thay thế trong phạm vi đã cấu hình', status: 'current' },
  { title: 'Kế toán thực hiện chi', description: 'Chỉ sau đủ ba phê duyệt và kiểm tra ngân sách', status: 'pending' },
]

const EMPTY_DEPARTMENT = { code: '', name: '', description: '', headId: '', approverId: '' }
const today = () => new Date().toLocaleDateString('sv-SE')
const emptyDelegation = () => ({ fromUserId: '', toUserId: '', departmentId: '', maxAmount: null, startDate: today(), endDate: '', note: '' })

const toDepartmentForm = (d) =>
  d ? { code: d.code, name: d.name, description: d.description ?? '', headId: d.headId ?? '', approverId: d.approverId ?? '' } : EMPTY_DEPARTMENT

function validateDepartment(values) {
  const errors = {}
  const code = values.code.trim()
  if (!values.name.trim()) errors.name = 'Nhập tên phòng ban.'
  if (!code) errors.code = 'Nhập mã phòng ban.'
  else if (code.length > CODE_MAX) errors.code = `Mã tối đa ${CODE_MAX} ký tự.`
  else if (!/^[A-Za-z0-9_-]+$/.test(code)) errors.code = 'Mã chỉ gồm chữ, số, dấu gạch ngang hoặc gạch dưới.'
  if (!values.headId) errors.headId = 'Chọn trưởng phòng.'
  return errors
}

function validateDelegation(values) {
  const errors = {}
  if (!values.fromUserId) errors.fromUserId = 'Chọn người ủy quyền.'
  if (!values.toUserId) errors.toUserId = 'Chọn người được ủy quyền.'
  else if (values.toUserId === values.fromUserId) errors.toUserId = 'Phải khác người ủy quyền.'
  if (!values.startDate) errors.startDate = 'Chọn ngày bắt đầu.'
  if (!values.endDate) errors.endDate = 'Chọn ngày kết thúc.'
  else if (values.startDate && values.endDate < values.startDate) errors.endDate = 'Phải sau hoặc bằng ngày bắt đầu.'
  else if (values.endDate < today()) errors.endDate = 'Không được ở quá khứ.'
  return errors
}

function validateConfig(values) {
  const errors = {}
  const threshold = Number(values.budgetWarningThreshold)
  if (!Number.isInteger(threshold) || threshold < 50 || threshold > 100) errors.budgetWarningThreshold = 'Ngưỡng từ 50 đến 100%.'
  return errors
}

const delegationScope = (d) =>
  [d.departmentName ?? 'Mọi phòng ban phụ trách', d.maxAmount ? `tối đa ${formatMoney(d.maxAmount)}` : 'không giới hạn số tiền'].join(' · ')

export default function DepartmentsPage() {
  const dispatch = useDispatch()
  const showToast = useToast()
  const departments = useSelector(selectDepartments)
  const loading = useSelector(selectDepartmentsLoading)
  const loadError = useSelector(selectDepartmentsError)
  const staff = useSelector(selectStaffOptions)
  const delegations = useSelector(selectDelegations)
  const settings = useSelector(selectSettings)

  const [selectedId, setSelectedId] = useState(null)
  const [savingDepartment, setSavingDepartment] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [delegationOpen, setDelegationOpen] = useState(false)
  const [savingDelegation, setSavingDelegation] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState(null)
  const [revoking, setRevoking] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)

  const delegationForm = useForm({ defaultValues: emptyDelegation(), resolver: validationResolver(validateDelegation) })
  const configForm = useForm({ defaultValues: { currency: 'VND', budgetWarningThreshold: 80, notificationChannel: '' }, resolver: validationResolver(validateConfig) })

  const isNew = selectedId === NEW
  // Chưa chọn (lần đầu tải / vừa xóa / hủy thêm mới) → phòng đầu tiên
  const selected = isNew ? null : (departments.find((d) => d.id === selectedId) ?? departments[0] ?? null)
  // values: form tự nạp lại khi đổi phòng ban hoặc khi dữ liệu phòng đang chọn thay đổi sau khi lưu
  const departmentForm = useForm({ values: toDepartmentForm(selected), resolver: validationResolver(validateDepartment) })
  const missingApprover = departments.filter((d) => d.status === 'THIEU_NGUOI_DUYET')
  const activeDelegations = delegations.filter((d) => d.status === 'HIEU_LUC' || d.status === 'SAP_HIEU_LUC')

  const staffOptions = useMemo(
    () => staff.map((u) => ({ value: u.id, label: `${u.username} · ${ROLES[u.role]?.label ?? u.role}` })),
    [staff],
  )
  const departmentOptions = useMemo(
    () => [{ value: '', label: 'Mọi phòng ban người ủy quyền phụ trách' }, ...departments.map((d) => ({ value: d.id, label: d.name }))],
    [departments],
  )

  const showError = useCallback(
    (error, fallback) => showToast(error?.message || fallback, 'error', TOAST_OPTIONS.fromError(error)),
    [showToast],
  )

  const loadAll = useCallback(() => {
    dispatch(fetchDepartments())
    dispatch(fetchStaffOptions())
    dispatch(fetchDelegations())
    dispatch(fetchSettings())
  }, [dispatch])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useEffect(() => {
    if (!settings) return
    configForm.reset({
      currency: settings.currency,
      budgetWarningThreshold: settings.budgetWarningThreshold,
      notificationChannel: settings.notificationChannel,
    })
  }, [settings, configForm])

  const selectDepartment = (department) => setSelectedId(department.id)
  const startNewDepartment = () => setSelectedId(NEW)

  // 409 trùng mã / tên → gắn lỗi vào đúng ô
  const applyConflict = (error) => {
    const message = error?.message || 'Dữ liệu đã tồn tại'
    departmentForm.setError(/^Mã/i.test(message) ? 'code' : 'name', { message })
  }

  const saveDepartment = async (values) => {
    const body = {
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      description: values.description?.trim() ?? '',
      headId: values.headId,
      approverId: values.approverId,
    }
    setSavingDepartment(true)
    try {
      const saved = isNew
        ? await dispatch(createDepartment(body)).unwrap()
        : await dispatch(updateDepartment({ id: selected.id, ...body })).unwrap()
      setSelectedId(saved.id)
      const verb = isNew ? 'Đã thêm' : 'Đã lưu'
      if (saved.status === 'HOAN_THIEN') showToast(`${verb} ${saved.name}`, 'success')
      else showToast(`${verb} ${saved.name}; phòng vẫn thiếu ${saved.missing.join(', ').toLowerCase()}`, 'warning')
    } catch (error) {
      if (error?.response?.status === 409) applyConflict(error)
      else showError(error, 'Lưu phòng ban thất bại')
    } finally {
      setSavingDepartment(false)
    }
  }

  const confirmDeleteDepartment = async () => {
    setDeleting(true)
    try {
      await dispatch(deleteDepartment(selected.id)).unwrap()
      showToast(`Đã xóa ${selected.name}`, 'success')
      setSelectedId(null)
      dispatch(fetchDelegations()) // ủy quyền theo phòng bị xóa theo
    } catch (error) {
      showError(error, 'Xóa phòng ban thất bại')
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  const openDelegation = () => {
    delegationForm.reset({ ...emptyDelegation(), departmentId: selected?.id ?? '', fromUserId: selected?.headId ?? '' })
    setDelegationOpen(true)
  }

  const saveDelegation = async (values) => {
    setSavingDelegation(true)
    try {
      const saved = await dispatch(
        createDelegation({ ...values, maxAmount: values.maxAmount || null, note: values.note?.trim() ?? '' }),
      ).unwrap()
      showToast(`Đã ủy quyền ${saved.fromUserName} → ${saved.toUserName}`, 'success')
      setDelegationOpen(false)
    } catch (error) {
      showError(error, 'Tạo ủy quyền thất bại')
    } finally {
      setSavingDelegation(false)
    }
  }

  const confirmRevoke = async () => {
    setRevoking(true)
    try {
      await dispatch(revokeDelegation(revokeTarget.id)).unwrap()
      showToast(`Đã thu hồi ủy quyền của ${revokeTarget.fromUserName}`, 'success')
    } catch (error) {
      showError(error, 'Thu hồi ủy quyền thất bại')
    } finally {
      setRevoking(false)
      setRevokeTarget(null)
    }
  }

  const saveConfig = async (values) => {
    setSavingConfig(true)
    try {
      await dispatch(
        updateSettings({ ...values, budgetWarningThreshold: Number(values.budgetWarningThreshold) }),
      ).unwrap()
      if (missingApprover.length > 0) {
        showToast(`Đã lưu cấu hình. Cảnh báo: ${missingApprover.map((d) => d.name).join(', ')} chưa đủ người duyệt`, 'warning')
      } else {
        showToast('Đã lưu cấu hình hệ thống', 'success')
      }
    } catch (error) {
      showError(error, 'Lưu cấu hình thất bại')
    } finally {
      setSavingConfig(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Phòng ban', render: (d) => <TwoLineText primary={d.name} secondary={d.description || d.code} /> },
    { key: 'head', header: 'Trưởng phòng', width: 170, render: (d) => d.headName || '—' },
    { key: 'approver', header: 'Người phụ trách', width: 170, render: (d) => d.approverName || '—' },
    { key: 'members', header: 'Nhân sự', width: 90, align: 'right', render: (d) => d.memberCount },
    { key: 'status', header: 'Trạng thái', width: 150, render: (d) => <StatusBadge status={d.status} size="small" /> },
  ]

  return (
    <>
      <PageHeader
        eyebrow="22 / CẤU HÌNH HỆ THỐNG"
        title="Phòng ban và cấu hình hệ thống"
        description="Quản lý danh sách phòng ban, người duyệt, ủy quyền phê duyệt và các tham số kiểm soát hệ thống."
        actions={
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={startNewDepartment}>
            Thêm phòng ban
          </Button>
        }
        tags={
          <>
            <StatusBadge label={`${departments.length} phòng ban`} tone="primary" />
            {activeDelegations.length > 0 && <StatusBadge label={`${activeDelegations.length} ủy quyền hiệu lực`} tone="info" />}
          </>
        }
        toolbar={missingApprover.length > 0 && <StatusBadge label={`${missingApprover.length} phòng thiếu người duyệt`} tone="warning" />}
      />
      <AdminTabs />

      {loadError && (
        <AppAlert tone="danger" title="Không tải được danh sách phòng ban" sx={{ mb: 2 }}>
          {loadError.message}{' '}
          <Button size="small" onClick={loadAll}>Thử lại</Button>
        </AppAlert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 420px' }, gap: 3, alignItems: 'start' }}>
        <Stack spacing={3}>
          <SectionCard title="Danh sách phòng ban" subtitle="Trưởng phòng, người phụ trách duyệt và trạng thái cấu hình · Bấm để chỉnh sửa">
            <DataTable
              columns={columns}
              rows={departments}
              loading={loading && departments.length === 0}
              onRowClick={selectDepartment}
              minWidth={720}
              emptyState={<EmptyState variant="empty" compact />}
            />
          </SectionCard>

          {(isNew || selected) && (
            <SectionCard
              title={isNew ? 'Thêm phòng ban' : 'Chỉnh sửa phòng ban'}
              subtitle={isNew ? 'Tạo phòng ban mới và gán người duyệt' : `Phòng ban đang được chọn: ${selected.name}`}
            >
              <CustomForm methods={departmentForm} onSubmit={saveDepartment}>
                <FormGrid columns={3}>
                  <CustomInput name="name" label="Tên phòng ban" required />
                  <CustomSelect name="headId" label="Trưởng phòng" required placeholder="Chọn trưởng phòng" options={staffOptions} />
                  <CustomSelect
                    name="approverId"
                    label="Người phụ trách duyệt"
                    placeholder="Chưa có"
                    options={[{ value: '', label: 'Chưa có' }, ...staffOptions]}
                    helperText="Duyệt thay khi chính trưởng phòng tạo hồ sơ"
                  />
                  <CustomInput
                    name="code"
                    label="Mã phòng ban"
                    required
                    slotProps={{ htmlInput: { maxLength: CODE_MAX, style: { textTransform: 'uppercase' } } }}
                    helperText="Chữ, số, - hoặc _. Tự chuyển in hoa."
                  />
                  <FormTextField
                    label="Trạng thái cấu hình"
                    value={isNew ? 'Chưa lưu' : selected.status === 'HOAN_THIEN' ? 'Hoàn thiện' : `Thiếu ${selected.missing.join(', ').toLowerCase()}`}
                    disabled
                  />
                  <FormTextField
                    label="Cập nhật gần nhất"
                    value={isNew ? '—' : `${formatDateTime(selected.updatedAt)} · ${selected.memberCount} nhân sự`}
                    disabled
                  />
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <CustomInput name="description" label="Mô tả" />
                  </Box>
                </FormGrid>
                <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                  <Button type="submit" variant="contained" loading={savingDepartment}>
                    {isNew ? 'Thêm phòng ban' : 'Lưu cấu hình phòng ban'}
                  </Button>
                  {isNew ? (
                    <Button variant="outlined" disabled={savingDepartment} onClick={() => setSelectedId(null)}>Hủy</Button>
                  ) : (
                    <Button variant="text" color="error" startIcon={<Trash2 size={16} />} onClick={() => setDeleteOpen(true)}>
                      Xóa phòng ban
                    </Button>
                  )}
                </Stack>
              </CustomForm>
            </SectionCard>
          )}
        </Stack>

        <Stack spacing={3}>
          <SectionCard title="Luồng chi 3 cấp" subtitle="Trưởng phòng → Kế toán → Lãnh đạo rồi Kế toán thực chi">
            <ApprovalTimeline steps={FLOW_STEPS} />
          </SectionCard>

          <SectionCard
            title="Ủy quyền phê duyệt"
            subtitle="Người thay thế duyệt trong thời hạn và phạm vi đã cấu hình"
            action={
              <Button size="small" startIcon={<UserCheck size={14} />} onClick={openDelegation}>
                Thêm ủy quyền
              </Button>
            }
          >
            {delegations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Chưa có ủy quyền nào.</Typography>
            ) : (
              <Stack spacing={1.5}>
                {delegations.slice(0, 6).map((d) => (
                  <Box key={d.id} sx={{ bgcolor: colors.surfaceMuted, borderRadius: 2, px: 2, py: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <TwoLineText primary={`${d.fromUserName} → ${d.toUserName}`} secondary={delegationScope(d)} />
                      <StatusBadge status={d.status} size="small" />
                    </Stack>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption">
                        {formatDate(d.startDate)} → {formatDate(d.endDate)}
                        {d.note && ` · ${d.note}`}
                      </Typography>
                      {(d.status === 'HIEU_LUC' || d.status === 'SAP_HIEU_LUC') && (
                        <Button size="small" variant="text" color="inherit" startIcon={<Undo2 size={14} />} sx={{ color: 'text.secondary' }} onClick={() => setRevokeTarget(d)}>
                          Thu hồi
                        </Button>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
            <AppAlert tone="success" title="Ủy quyền chỉ áp dụng cho phê duyệt, không áp dụng cho thực chi" sx={{ mt: 2.5 }}>
              Ủy quyền đã thu hồi hoặc hết hạn vẫn được giữ lại làm lịch sử.
            </AppAlert>
          </SectionCard>

          <SectionCard title="Cấu hình hệ thống" subtitle="Mã chứng từ, tiền tệ, thông báo và cảnh báo ngân sách">
            <CustomForm methods={configForm} onSubmit={saveConfig}>
              <FormGrid>
                <FormTextField
                  label="Mã chứng từ chi"
                  value={settings?.documentCodePatterns?.expense ?? 'CHI-YYYYMM-XXXX'}
                  disabled
                  helperText="Cố định theo hệ thống, đánh số lại mỗi tháng"
                />
                <CustomSelect name="currency" label="Tiền tệ mặc định" options={['VND']} />
                <CustomInput
                  name="budgetWarningThreshold"
                  label="Ngưỡng cảnh báo ngân sách (%)"
                  required
                  type="number"
                  helperText="% ngân sách đã chi và cam kết"
                  slotProps={{ htmlInput: { min: 50, max: 100 } }}
                />
                <CustomSelect name="notificationChannel" label="Kênh thông báo" options={settings?.notificationChannels ?? []} />
              </FormGrid>
              {missingApprover.length > 0 && (
                <AppAlert tone="warning" title="Có phòng ban chưa đủ người duyệt" sx={{ mt: 2.5 }}>
                  {missingApprover.map((d) => d.name).join(', ')}: yêu cầu chi của phòng có thể bị kẹt ở bước duyệt phòng.
                </AppAlert>
              )}
              {settings?.updatedAt && (
                <Typography variant="caption" component="p" sx={{ mt: 2 }}>
                  Cập nhật lần cuối: {formatDateTime(settings.updatedAt)}
                  {settings.updatedByName && ` • ${settings.updatedByName}`}
                </Typography>
              )}
              <Button type="submit" variant="contained" loading={savingConfig} sx={{ mt: 2.5 }}>Lưu thay đổi cấu hình</Button>
            </CustomForm>
          </SectionCard>
        </Stack>
      </Box>

      <FormDrawer
        open={delegationOpen}
        onClose={() => !savingDelegation && setDelegationOpen(false)}
        title="Thêm ủy quyền phê duyệt"
        subtitle="Người được ủy quyền duyệt thay trong thời hạn và phạm vi dưới đây."
        note="* Thông tin bắt buộc"
        actions={
          <>
            <Button variant="outlined" disabled={savingDelegation} onClick={() => setDelegationOpen(false)}>Hủy</Button>
            <Button variant="contained" loading={savingDelegation} onClick={delegationForm.handleSubmit(saveDelegation)}>
              Tạo ủy quyền
            </Button>
          </>
        }
      >
        <FormProvider {...delegationForm}>
          <CustomSelect name="fromUserId" label="Người ủy quyền" required placeholder="Chọn người ủy quyền" options={staffOptions} />
          <CustomSelect name="toUserId" label="Người được ủy quyền" required placeholder="Chọn người thay thế" options={staffOptions} />
          <CustomSelect name="departmentId" label="Phạm vi phòng ban" options={departmentOptions} />
          <CustomMoneyInput name="maxAmount" label="Hạn mức mỗi hồ sơ (VND)" helperText="Bỏ trống nếu không giới hạn số tiền" />
          <FormGrid>
            <CustomInput name="startDate" label="Từ ngày" required type="date" />
            <CustomInput name="endDate" label="Đến ngày" required type="date" />
          </FormGrid>
          <CustomInput name="note" label="Ghi chú" multiline minRows={2} placeholder="Ví dụ: nghỉ phép, công tác" />
        </FormProvider>
      </FormDrawer>

      <ConfirmDialog
        open={deleteOpen}
        icon={Trash2}
        tone="danger"
        title="Xóa phòng ban này?"
        description={`Bạn sắp xóa “${selected?.name}”. Chỉ xóa được phòng ban chưa có nhân sự, dự án, ngân sách hoặc yêu cầu chi.`}
        confirmLabel="Xóa phòng ban"
        loading={deleting}
        onClose={() => !deleting && setDeleteOpen(false)}
        onConfirm={confirmDeleteDepartment}
      />

      <ConfirmDialog
        open={Boolean(revokeTarget)}
        icon={Undo2}
        tone="danger"
        title="Thu hồi ủy quyền?"
        description={revokeTarget ? `${revokeTarget.toUserName} sẽ không còn duyệt thay ${revokeTarget.fromUserName} (${delegationScope(revokeTarget)}).` : ''}
        confirmLabel="Thu hồi"
        loading={revoking}
        onClose={() => !revoking && setRevokeTarget(null)}
        onConfirm={confirmRevoke}
      />
    </>
  )
}
