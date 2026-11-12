import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Lock, Pause, Pencil, Play, Plus, Trash2 } from 'lucide-react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useSelector } from 'react-redux'
import {
  AppAlert,
  ConfirmDialog,
  CustomInput,
  CustomSegmented,
  CustomSelect,
  DataTable,
  EmptyState,
  FilterBar,
  FilterSelect,
  FormDrawer,
  FormTextField,
  PageHeader,
  SearchInput,
  SectionCard,
  StatCard,
  StatGrid,
  StatusBadge,
  TablePaginationBar,
  useToast,
} from '../../components'
import { CATEGORY_LIST, CATEGORY_MODULES } from '../../mocks/admin'
import { selectCurrentUser } from '../../store/slices/sessionSlice'
import { colors } from '../../theme/tokens'
import { formatDate } from '../../utils/format'
import validationResolver from '../../utils/validationResolver'
import AdminTabs from './AdminTabs'

// Màn 26 · Quản lý danh mục, 27 · Thêm, 28 · Chỉnh sửa, 29 · Xóa danh mục.
const PAGE_SIZE = 8
const CODE_MAX = 20
const NAME_MAX = 100

const MODULE_LABEL = Object.fromEntries(CATEGORY_MODULES.map((m) => [m.value, m.label]))
const MODULE_TONE = { THU: 'info', CHI: 'primary' }
const STATUS_OPTIONS = [
  { value: 'DANG_SU_DUNG', label: 'Đang sử dụng' },
  { value: 'NGUNG_SU_DUNG', label: 'Ngừng sử dụng' },
]
const MODULE_FILTER = [{ value: '', label: 'Tất cả module' }, ...CATEGORY_MODULES]
const STATUS_FILTER = [{ value: '', label: 'Tất cả trạng thái' }, ...STATUS_OPTIONS]

const byLatest = (a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.code.localeCompare(b.code)
const todayIso = () => new Date().toISOString().slice(0, 10)

// Mã gợi ý kế tiếp trong module: CHI-008 đã có → CHI-009.
function nextCode(categories, module) {
  const prefix = CATEGORY_MODULES.find((m) => m.value === module)?.prefix ?? module
  const max = categories
    .filter((c) => c.code.startsWith(`${prefix}-`))
    .reduce((acc, c) => Math.max(acc, Number(c.code.slice(prefix.length + 1)) || 0), 0)
  return `${prefix}-${String(max + 1).padStart(3, '0')}`
}

// context: { categories } — danh sách hiện tại để kiểm tra trùng mã / tên trong cùng module.
function validateCategory(values, { categories }) {
  const errors = {}
  const code = values.code.trim()
  const name = values.name.trim()
  const others = categories.filter((c) => c.id !== values.id)

  if (!values.module) errors.module = 'Chọn module áp dụng.'
  if (!code) errors.code = 'Nhập mã danh mục.'
  else if (code.length > CODE_MAX) errors.code = `Mã tối đa ${CODE_MAX} ký tự.`
  else if (!/^[A-Za-z0-9_-]+$/.test(code)) errors.code = 'Mã chỉ gồm chữ, số, dấu gạch ngang hoặc gạch dưới.'
  else if (others.some((c) => c.module === values.module && c.code.toLowerCase() === code.toLowerCase())) {
    errors.code = `Mã đã tồn tại trong module ${MODULE_LABEL[values.module]}.`
  }
  if (!name) errors.name = 'Nhập tên danh mục.'
  else if (name.length > NAME_MAX) errors.name = `Tên tối đa ${NAME_MAX} ký tự.`
  else if (others.some((c) => c.module === values.module && c.name.toLowerCase() === name.toLowerCase())) {
    errors.name = 'Tên đã tồn tại trong cùng module.'
  }
  if (!values.status) errors.status = 'Chọn trạng thái.'
  return errors
}

const lockAdornment = { input: { endAdornment: <Lock size={16} color={colors.textMuted} /> } }

export default function CategoriesPage() {
  const showToast = useToast()
  const currentUser = useSelector(selectCurrentUser)
  const [categories, setCategories] = useState(CATEGORY_LIST)
  const [filters, setFilters] = useState({ search: '', module: '', status: '' })
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null) // danh mục đang thêm/sửa, null = đóng drawer
  const [deleteTarget, setDeleteTarget] = useState(null)
  const methods = useForm({ resolver: validationResolver(validateCategory), context: { categories } })
  const watchedModule = useWatch({ control: methods.control, name: 'module' })

  const isEdit = Boolean(editing?.id)
  const editingUsage = editing?.usage ?? 0

  // Khi thêm mới: đổi module thì gợi ý lại mã kế tiếp của module đó.
  useEffect(() => {
    if (editing && !editing.id && watchedModule) {
      methods.setValue('code', nextCode(categories, watchedModule), { shouldValidate: methods.formState.isSubmitted })
    }
  }, [watchedModule, editing, categories, methods])

  const setFilter = (key) => (value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const sorted = useMemo(() => [...categories].sort(byLatest), [categories])
  const filtered = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase()
    return sorted.filter(
      (c) =>
        (!filters.module || c.module === filters.module) &&
        (!filters.status || c.status === filters.status) &&
        (!keyword || c.name.toLowerCase().includes(keyword) || c.code.toLowerCase().includes(keyword)),
    )
  }, [sorted, filters])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const stats = {
    total: categories.length,
    income: categories.filter((c) => c.module === 'THU').length,
    expense: categories.filter((c) => c.module === 'CHI').length,
    active: categories.filter((c) => c.status === 'DANG_SU_DUNG').length,
  }
  const latestUpdate = sorted[0]?.updatedAt
  const hasFilter = Object.values(filters).some(Boolean)

  const openDrawer = (category) => {
    const values = category ?? { module: 'CHI', code: nextCode(categories, 'CHI'), name: '', description: '', status: 'DANG_SU_DUNG' }
    methods.reset(values)
    setEditing(values)
  }

  const stamp = { updatedAt: todayIso(), updatedBy: currentUser.name }

  const saveCategory = (values) => {
    const data = { ...values, code: values.code.trim(), name: values.name.trim(), description: values.description?.trim() ?? '', ...stamp }
    if (data.id) {
      setCategories((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)))
      showToast(`Đã lưu thay đổi cho danh mục ${data.code}`, 'success')
    } else {
      setCategories((prev) => [{ ...data, id: `${data.code}-${Date.now()}`, usage: 0 }, ...prev])
      setPage(1)
      showToast(`Đã thêm danh mục ${data.code} · ${data.name}`, 'success')
    }
    setEditing(null)
  }

  const toggleStatus = (category) => {
    const status = category.status === 'DANG_SU_DUNG' ? 'NGUNG_SU_DUNG' : 'DANG_SU_DUNG'
    setCategories((prev) => prev.map((c) => (c.id === category.id ? { ...c, status, ...stamp } : c)))
    showToast(status === 'NGUNG_SU_DUNG' ? `Đã ngừng sử dụng danh mục ${category.name}` : `Đã dùng lại danh mục ${category.name}`, 'success')
  }

  const confirmDelete = () => {
    setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id))
    showToast(`Đã xóa danh mục ${deleteTarget.code} · ${deleteTarget.name}`, 'success')
    setDeleteTarget(null)
  }

  // Bấm nút trong dòng không mở drawer chỉnh sửa của dòng.
  const rowAction = (handler) => (event) => {
    event.stopPropagation()
    handler()
  }

  const columns = [
    { key: 'code', header: 'Mã danh mục', width: 120 },
    { key: 'name', header: 'Tên danh mục', render: (c) => <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{c.name}</Typography> },
    { key: 'module', header: 'Module', width: 90, render: (c) => <StatusBadge label={MODULE_LABEL[c.module]} tone={MODULE_TONE[c.module]} size="small" /> },
    { key: 'status', header: 'Trạng thái', width: 140, render: (c) => <StatusBadge status={c.status} size="small" /> },
    { key: 'usage', header: 'Số giao dịch', width: 110 },
    { key: 'updatedAt', header: 'Cập nhật gần nhất', width: 150, render: (c) => <Typography variant="body2" color="text.secondary">{formatDate(c.updatedAt)}</Typography> },
    {
      key: 'action',
      header: 'Thao tác',
      width: 190,
      render: (c) => (
        <Stack direction="row" spacing={0.5}>
          <Button size="small" variant="text" startIcon={<Pencil size={14} />} onClick={rowAction(() => openDrawer(c))}>
            Sửa
          </Button>
          {c.usage === 0 ? (
            <Button size="small" variant="text" color="error" startIcon={<Trash2 size={14} />} onClick={rowAction(() => setDeleteTarget(c))}>
              Xóa
            </Button>
          ) : c.status === 'DANG_SU_DUNG' ? (
            <Button size="small" variant="text" color="inherit" startIcon={<Pause size={14} />} sx={{ color: 'text.secondary' }} onClick={rowAction(() => toggleStatus(c))}>
              Ngừng dùng
            </Button>
          ) : (
            <Button size="small" variant="text" color="success" startIcon={<Play size={14} />} onClick={rowAction(() => toggleStatus(c))}>
              Dùng lại
            </Button>
          )}
        </Stack>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="26 / QUẢN TRỊ HỆ THỐNG"
        title="Quản lý danh mục"
        description="Thiết lập danh mục dùng cho khoản thu, yêu cầu chi và báo cáo tài chính."
        actions={
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => openDrawer(null)}>
            Thêm danh mục
          </Button>
        }
      />
      <AdminTabs />

      <StatGrid>
        <StatCard label="Tổng danh mục" value={stats.total} caption="Dùng chung toàn doanh nghiệp" />
        <StatCard label="Danh mục thu" value={stats.income} caption="Phân loại nguồn thu" />
        <StatCard label="Danh mục chi" value={stats.expense} caption="Phân loại mục đích chi" />
        <StatCard label="Đang sử dụng" value={stats.active} tone="success" caption={`${stats.total - stats.active} danh mục ngừng sử dụng`} />
      </StatGrid>

      <FilterBar search={<SearchInput value={filters.search} onChange={setFilter('search')} placeholder="Tìm theo tên hoặc mã danh mục" width={450} />}>
        <FilterSelect value={filters.module} options={MODULE_FILTER} onChange={setFilter('module')} />
        <FilterSelect value={filters.status} options={STATUS_FILTER} onChange={setFilter('status')} />
      </FilterBar>

      <SectionCard
        title="Danh sách danh mục"
        action={
          <Typography variant="caption">
            {categories.length} danh mục{latestUpdate && ` • Cập nhật mới nhất: ${formatDate(latestUpdate)}`}
          </Typography>
        }
      >
        <DataTable
          columns={columns}
          rows={filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)}
          onRowClick={openDrawer}
          minWidth={960}
          emptyState={<EmptyState variant={hasFilter ? 'no-results' : 'empty'} compact />}
        />
        {filtered.length > 0 && (
          <TablePaginationBar page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} itemLabel="danh mục" />
        )}
      </SectionCard>

      <AppAlert tone="info" sx={{ mt: 3 }}>
        Chỉ xóa danh mục chưa có giao dịch. Với danh mục đã sử dụng, chọn “Ngừng dùng” để giữ nguyên lịch sử và báo cáo.
      </AppAlert>

      <FormDrawer
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
        subtitle={isEdit ? 'Cập nhật thông tin và phạm vi sử dụng danh mục.' : 'Tạo danh mục mới để phân loại giao dịch nhất quán.'}
        note="* Thông tin bắt buộc"
        actions={
          <>
            <Button variant="outlined" onClick={() => setEditing(null)}>Hủy</Button>
            <Button variant="contained" onClick={methods.handleSubmit(saveCategory)}>{isEdit ? 'Lưu thay đổi' : 'Thêm danh mục'}</Button>
          </>
        }
      >
        <FormProvider {...methods}>
          {isEdit && editingUsage > 0 ? (
            <FormTextField
              label="Module áp dụng"
              required
              disabled
              value={MODULE_LABEL[editing.module]}
              helperText="Không thể đổi module khi đã có giao dịch."
              slotProps={lockAdornment}
            />
          ) : (
            <CustomSelect
              name="module"
              label="Module áp dụng"
              required
              options={CATEGORY_MODULES}
              helperText="Danh mục chỉ hiển thị trong module được chọn."
            />
          )}
          <CustomInput
            name="code"
            label="Mã danh mục"
            required
            disabled={isEdit}
            slotProps={isEdit ? lockAdornment : { htmlInput: { maxLength: CODE_MAX } }}
            helperText={
              isEdit
                ? 'Mã được giữ cố định để bảo toàn dữ liệu liên quan.'
                : `Mã duy nhất trong module ${MODULE_LABEL[watchedModule] ?? ''}, tối đa ${CODE_MAX} ký tự.`
            }
          />
          <CustomInput
            name="name"
            label="Tên danh mục"
            required
            placeholder="Ví dụ: Phần mềm và công cụ"
            slotProps={{ htmlInput: { maxLength: NAME_MAX } }}
            helperText={`Tối đa ${NAME_MAX} ký tự. Không trùng tên trong cùng module.`}
          />
          <CustomInput name="description" label="Mô tả" multiline minRows={2} placeholder="Mô tả ngắn phạm vi sử dụng danh mục" />
          <CustomSegmented
            name="status"
            label="Trạng thái"
            required
            options={STATUS_OPTIONS}
            helperText="Chỉ danh mục đang sử dụng mới được chọn khi tạo giao dịch."
          />

          {isEdit && editingUsage > 0 ? (
            <AppAlert tone="warning" title={`Danh mục đã có ${editingUsage} giao dịch`}>
              Không thể xóa danh mục này. Bạn có thể ngừng sử dụng; các giao dịch cũ và báo cáo vẫn được giữ nguyên.
            </AppAlert>
          ) : (
            <AppAlert tone="info" title="Áp dụng ngay sau khi lưu">
              Danh mục sẽ xuất hiện trong biểu mẫu {watchedModule === 'THU' ? 'ghi nhận khoản thu' : 'tạo yêu cầu chi'}. Chỉ quản trị viên được thêm, sửa hoặc ngừng sử dụng.
            </AppAlert>
          )}

          {isEdit && (
            <Typography variant="caption" component="p">
              Cập nhật lần cuối: {formatDate(editing.updatedAt)} • {editing.updatedBy}
            </Typography>
          )}
        </FormProvider>
      </FormDrawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        icon={Trash2}
        tone="danger"
        title="Xóa danh mục này?"
        description={`Bạn sắp xóa “${deleteTarget?.name}”. Thao tác này không thể hoàn tác.`}
        confirmLabel="Xóa danh mục"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      >
        <Box sx={{ bgcolor: colors.surfaceMuted, borderRadius: 2, px: 2, py: 1.5 }}>
          {[
            ['Mã danh mục', deleteTarget?.code],
            ['Module áp dụng', MODULE_LABEL[deleteTarget?.module]],
            ['Số giao dịch liên quan', `${deleteTarget?.usage ?? 0} giao dịch`],
          ].map(([label, value]) => (
            <Stack key={label} direction="row" sx={{ justifyContent: 'space-between', py: 0.5 }}>
              <Typography variant="body2" color="text.secondary">{label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
            </Stack>
          ))}
        </Box>
        <AppAlert tone="danger">
          Danh mục sẽ bị xóa khỏi module {MODULE_LABEL[deleteTarget?.module]} và không còn xuất hiện trong danh sách lựa chọn.
        </AppAlert>
      </ConfirmDialog>
    </>
  )
}
