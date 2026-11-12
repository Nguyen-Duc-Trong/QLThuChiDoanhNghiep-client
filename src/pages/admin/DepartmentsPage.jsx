import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Download, Plus } from 'lucide-react'
import {
  AppAlert,
  ApprovalTimeline,
  CustomForm,
  CustomInput,
  CustomSelect,
  DataTable,
  DescriptionList,
  FormGrid,
  FormTextField,
  PageHeader,
  SectionCard,
  StatusBadge,
  TwoLineText,
  useToast,
} from '../../components'
import { DELEGATION, DEPARTMENT_LIST, NOTIFICATION_CHANNELS, STAFF, SYSTEM_CONFIG } from '../../mocks/admin'
import validationResolver from '../../utils/validationResolver'
import AdminTabs from './AdminTabs'

// Màn 22 · Phòng ban và cấu hình hệ thống (admin hệ thống).
const NOW_LABEL = '22/10/2026, 09:30'
const STAFF_OPTIONS = STAFF.map((s) => ({ value: s, label: s }))
const departmentStatus = (d) => (d.approver ? 'HOAN_THIEN' : 'THIEU_NGUOI_DUYET')

const FLOW_STEPS = [
  { title: 'Nhân viên gửi yêu cầu', description: 'Không tự duyệt hồ sơ mình tạo', status: 'done' },
  { title: 'Trưởng phòng phê duyệt', description: 'Kiểm tra mục đích, ngân sách và chứng từ', status: 'done' },
  { title: 'Kế toán thẩm định', description: 'Đối chiếu chứng từ, tài khoản và hạn mức ngân sách', status: 'done' },
  { title: 'Lãnh đạo duyệt cuối', description: 'Có thể ủy quyền cho người thay thế trong phạm vi đã cấu hình', status: 'current' },
  { title: 'Kế toán thực hiện chi', description: 'Chỉ sau đủ ba phê duyệt và kiểm tra ngân sách', status: 'pending' },
]

function validateDepartment(values, { departments }) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Nhập tên phòng ban.'
  if (!/^[A-Z]{2,4}-\d{4}$/.test(values.id)) errors.id = 'Mã dạng XX-2026 (2–4 chữ in hoa).'
  else if (departments.some((d) => d.id === values.id && d.id !== values.originalId)) errors.id = 'Mã phòng ban đã tồn tại.'
  if (!values.head) errors.head = 'Chọn trưởng phòng.'
  if (values.approver && values.approver === values.head) errors.approver = 'Người phụ trách duyệt phải khác trưởng phòng.'
  return errors
}

function validateConfig(values) {
  const errors = {}
  if (!values.docCode.includes('XXXX')) errors.docCode = 'Mẫu mã phải có phần số thứ tự XXXX.'
  const threshold = Number(values.budgetThreshold)
  if (!Number.isInteger(threshold) || threshold < 50 || threshold > 100) errors.budgetThreshold = 'Ngưỡng từ 50 đến 100%.'
  return errors
}

export default function DepartmentsPage() {
  const showToast = useToast()
  const [departments, setDepartments] = useState(DEPARTMENT_LIST)
  const [selectedId, setSelectedId] = useState('NS-2026')
  const [pendingConfigs, setPendingConfigs] = useState(0)

  const selected = departments.find((d) => d.id === selectedId)
  const toFormValues = (d) => ({ ...d, originalId: d.id, approver: d.approver ?? '' })
  const departmentForm = useForm({ defaultValues: toFormValues(selected), resolver: validationResolver(validateDepartment), context: { departments } })
  const configForm = useForm({ defaultValues: SYSTEM_CONFIG, resolver: validationResolver(validateConfig) })

  const missingApprover = departments.filter((d) => !d.approver)
  const dirtyCount = Number(departmentForm.formState.isDirty) + Number(configForm.formState.isDirty) + pendingConfigs

  const selectDepartment = (department) => {
    setSelectedId(department.id)
    departmentForm.reset(toFormValues(department))
  }

  const addDepartment = () => {
    // Mã tạm dạng PBA-2026, PBB-2026...; admin đổi lại trước khi lưu.
    const draft = { id: `PB${String.fromCharCode(65 + (departments.length % 26))}-2026`, name: 'Phòng ban mới', description: 'Chưa có mô tả', head: '', approver: '', updatedAt: NOW_LABEL }
    setDepartments((prev) => [...prev, draft])
    selectDepartment(draft)
    setPendingConfigs((n) => n + 1)
  }

  const saveDepartment = ({ originalId, ...values }) => {
    const next = { ...values, updatedAt: NOW_LABEL }
    setDepartments((prev) => prev.map((d) => (d.id === originalId ? next : d)))
    setSelectedId(next.id)
    departmentForm.reset(toFormValues(next))
    setPendingConfigs((n) => Math.max(0, n - 1))
    showToast(next.approver ? `Đã lưu cấu hình ${next.name}` : `Đã lưu ${next.name}; phòng vẫn thiếu người phụ trách duyệt`, next.approver ? 'success' : 'warning')
  }

  const saveConfig = (values) => {
    configForm.reset(values)
    if (missingApprover.length > 0) {
      showToast(`Đã lưu cấu hình. Cảnh báo: ${missingApprover.map((d) => d.name).join(', ')} chưa có người duyệt`, 'warning')
    } else {
      showToast('Đã lưu cấu hình hệ thống, thay đổi được ghi nhật ký', 'success')
    }
  }

  const columns = [
    { key: 'name', header: 'Phòng ban', render: (d) => <TwoLineText primary={d.name} secondary={d.description} /> },
    { key: 'head', header: 'Trưởng phòng', width: 180, render: (d) => d.head || '—' },
    { key: 'approver', header: 'Người phụ trách', width: 180, render: (d) => d.approver || '—' },
    { key: 'status', header: 'Trạng thái', width: 150, render: (d) => <StatusBadge status={departmentStatus(d)} /> },
  ]

  return (
    <>
      <PageHeader
        eyebrow="22 / CẤU HÌNH HỆ THỐNG"
        title="Phòng ban và cấu hình hệ thống"
        description="Quản lý danh sách phòng ban, cấu hình luồng chi 3 cấp và các tham số kiểm soát hệ thống."
        actions={
          <>
            <Button variant="outlined" startIcon={<Download size={16} />} onClick={() => showToast('Đang xuất cấu hình hệ thống...', 'info')}>
              Xuất cấu hình
            </Button>
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={addDepartment}>
              Thêm phòng ban
            </Button>
          </>
        }
        tags={
          <>
            <StatusBadge label={`${departments.length} phòng ban`} tone="primary" />
            {dirtyCount > 0 && <StatusBadge label={`${dirtyCount} cấu hình chờ lưu`} tone="success" />}
          </>
        }
        toolbar={missingApprover.length > 0 && <StatusBadge label={`${missingApprover.length} phòng thiếu người duyệt`} tone="warning" />}
      />
      <AdminTabs />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 420px' }, gap: 3, alignItems: 'start' }}>
        <Stack spacing={3}>
          <SectionCard title="Danh sách phòng ban" subtitle="Trưởng phòng, người phụ trách và trạng thái cấu hình hiện tại · Bấm để chỉnh sửa">
            <DataTable columns={columns} rows={departments} onRowClick={selectDepartment} minWidth={680} />
          </SectionCard>

          <SectionCard title="Chỉnh sửa phòng ban" subtitle={`Phòng ban đang được chọn: ${selected.name}`}>
            <CustomForm methods={departmentForm} onSubmit={saveDepartment}>
              <FormGrid columns={3}>
                <CustomInput name="name" label="Tên phòng ban" required />
                <CustomSelect name="head" label="Trưởng phòng" required placeholder="Chọn trưởng phòng" options={STAFF_OPTIONS} />
                <CustomSelect name="approver" label="Người phụ trách" placeholder="Chưa có" options={[{ value: '', label: 'Chưa có' }, ...STAFF_OPTIONS]} />
                <CustomInput name="id" label="Mã phòng ban" required />
                <FormTextField
                  label="Trạng thái cấu hình"
                  value={selected.approver ? 'Hoàn thiện' : 'Chờ bổ sung người phụ trách'}
                  disabled
                />
                <FormTextField label="Cập nhật gần nhất" value={selected.updatedAt} disabled />
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <CustomInput name="description" label="Mô tả" />
                </Box>
              </FormGrid>
              <Button type="submit" variant="contained" sx={{ mt: 2.5 }}>Lưu cấu hình phòng ban</Button>
            </CustomForm>
          </SectionCard>
        </Stack>

        <Stack spacing={3}>
          <SectionCard title="Luồng chi 3 cấp" subtitle="Trưởng phòng → Kế toán → Lãnh đạo rồi Kế toán thực chi">
            <ApprovalTimeline steps={FLOW_STEPS} />
          </SectionCard>

          <SectionCard title="Người thay thế và audit" subtitle="Ủy quyền phải có thời hạn, phạm vi và ghi nhật ký">
            <DescriptionList
              items={[
                { label: 'Người thay thế', value: DELEGATION.substitute },
                { label: 'Phạm vi ủy quyền', value: DELEGATION.scope },
                { label: 'Thời hạn ủy quyền', value: DELEGATION.period },
                { label: 'Nhật ký audit', value: DELEGATION.audit },
              ]}
            />
            <AppAlert tone="success" title="Ủy quyền chỉ áp dụng cho phê duyệt, không áp dụng cho thực chi" sx={{ mt: 2.5 }}>
              Mỗi thay đổi cấu hình sẽ tạo một bản ghi mới trong nhật ký hệ thống.
            </AppAlert>
          </SectionCard>

          <SectionCard title="Cấu hình hệ thống" subtitle="Mã chứng từ, tiền tệ, thông báo và cảnh báo ngân sách">
            <CustomForm methods={configForm} onSubmit={saveConfig}>
              <FormGrid>
                <CustomInput name="docCode" label="Mã chứng từ" required />
                <CustomSelect name="currency" label="Tiền tệ mặc định" options={['VND']} />
                <CustomInput
                  name="budgetThreshold"
                  label="Ngưỡng cảnh báo ngân sách (%)"
                  required
                  type="number"
                  helperText="% ngân sách đã cam kết"
                  slotProps={{ htmlInput: { min: 50, max: 100 } }}
                />
                <CustomSelect name="notification" label="Thông báo" options={NOTIFICATION_CHANNELS} />
              </FormGrid>
              <AppAlert tone="info" title="Kiểm tra cấu hình thiếu người duyệt" sx={{ mt: 2.5 }}>
                Trước khi lưu, hệ thống sẽ kiểm tra phòng ban nào chưa có đủ người duyệt theo quy trình đã cấu hình.
              </AppAlert>
              <Button type="submit" variant="contained" sx={{ mt: 2.5 }}>Lưu thay đổi cấu hình</Button>
            </CustomForm>
          </SectionCard>
        </Stack>
      </Box>
    </>
  )
}
