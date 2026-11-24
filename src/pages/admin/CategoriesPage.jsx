import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Lock, Pause, Pencil, Play, Plus, Trash2 } from 'lucide-react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
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
  TOAST_OPTIONS,
  useToast,
} from '../../components'
import { CATEGORY_MODULES } from '../../constants/categories'
import categoriesApi from '../../services/categoriesApi'
import {
  createCategory,
  deleteCategories,
  fetchCategories,
  fetchCategoryStats,
  selectCategories,
  selectCategoriesError,
  selectCategoriesLoading,
  selectCategoriesQuery,
  selectCategoriesTotal,
  selectCategoryStats,
  setCategoriesQuery,
  updateCategory,
} from '../../store/slices/categoriesSlice'
import { colors } from '../../theme/tokens'
import { formatDate } from '../../utils/format'
import validationResolver from '../../utils/validationResolver'
import AdminTabs from './AdminTabs'

// Màn 26 · Quản lý danh mục, 27 · Thêm, 28 · Chỉnh sửa, 29 · Xóa danh mục (gọi API /categories).
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

const EMPTY_CATEGORY = { type: 'CHI', code: '', name: '', description: '', status: 'DANG_SU_DUNG' }

/**
 * Gợi ý mã kế tiếp trong module: đã có CHI-008 → CHI-009.
 * Lấy các mã cùng tiền tố từ server (tối đa 100) rồi tìm số lớn nhất.
 */
async function suggestCode(type) {
  const prefix = CATEGORY_MODULES.find((m) => m.value === type)?.prefix ?? type
  try {
    const res = await categoriesApi.list({ page: 1, limit: 100, type, search: `${prefix}-` })
    const max = (res.data ?? [])
      .filter((c) => c.code.startsWith(`${prefix}-`))
      .reduce((acc, c) => Math.max(acc, Number(c.code.slice(prefix.length + 1)) || 0), 0)
    return `${prefix}-${String(max + 1).padStart(3, '0')}`
  } catch {
    return `${prefix}-001`
  }
}

// Kiểm tra cơ bản ở client; trùng mã / tên do server kiểm tra (409) vì danh sách được phân trang.
function validateCategory(values) {
  const errors = {}
  const code = values.code.trim()
  const name = values.name.trim()
  if (!values.type) errors.type = 'Chọn module áp dụng.'
  if (!code) errors.code = 'Nhập mã danh mục.'
  else if (code.length > CODE_MAX) errors.code = `Mã tối đa ${CODE_MAX} ký tự.`
  else if (!/^[A-Za-z0-9_-]+$/.test(code)) errors.code = 'Mã chỉ gồm chữ, số, dấu gạch ngang hoặc gạch dưới.'
  if (!name) errors.name = 'Nhập tên danh mục.'
  else if (name.length > NAME_MAX) errors.name = `Tên tối đa ${NAME_MAX} ký tự.`
  if (!values.status) errors.status = 'Chọn trạng thái.'
  return errors
}

const lockAdornment = { input: { endAdornment: <Lock size={16} color={colors.textMuted} /> } }

export default function CategoriesPage() {
  const dispatch = useDispatch()
  const showToast = useToast()
  const categories = useSelector(selectCategories)
  const total = useSelector(selectCategoriesTotal)
  const query = useSelector(selectCategoriesQuery)
  const loading = useSelector(selectCategoriesLoading)
  const loadError = useSelector(selectCategoriesError)
  const stats = useSelector(selectCategoryStats)

  const [search, setSearch] = useState(query.search)
  const [editing, setEditing] = useState(null) // danh mục đang thêm/sửa, null = đóng drawer
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const methods = useForm({ defaultValues: EMPTY_CATEGORY, resolver: validationResolver(validateCategory) })
  const watchedType = useWatch({ control: methods.control, name: 'type' })

  const isEdit = Boolean(editing?.id)
  const editingUsage = editing?.usage ?? 0
  const hasFilter = Boolean(query.search || query.type || query.status)

  const showError = useCallback(
    (error, fallback) => showToast(error?.message || fallback, 'error', TOAST_OPTIONS.fromError(error)),
    [showToast],
  )

  const reload = useCallback(() => dispatch(fetchCategories(query)), [dispatch, query])
  const reloadStats = useCallback(() => dispatch(fetchCategoryStats()), [dispatch])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    reloadStats()
  }, [reloadStats])

  // Chờ người dùng gõ xong 300ms mới gọi API tìm kiếm
  useEffect(() => {
    if (search === query.search) return undefined
    const timer = setTimeout(() => dispatch(setCategoriesQuery({ search })), 300)
    return () => clearTimeout(timer)
  }, [search, query.search, dispatch])

  // Khi thêm mới: đổi module thì gợi ý lại mã kế tiếp của module đó.
  useEffect(() => {
    if (!editing || editing.id || !watchedType) return undefined
    let cancelled = false
    suggestCode(watchedType).then((code) => {
      if (!cancelled) methods.setValue('code', code, { shouldValidate: methods.formState.isSubmitted })
    })
    return () => {
      cancelled = true
    }
  }, [watchedType, editing, methods])

  const afterChange = () => {
    reload()
    reloadStats()
  }

  const openDrawer = (category) => {
    const values = category
      ? { id: category.id, type: category.type, code: category.code, name: category.name, description: category.description ?? '', status: category.status }
      : EMPTY_CATEGORY
    methods.reset(values)
    setEditing(category ?? {})
  }

  // Lỗi 409 của server → gắn vào đúng ô (mã hay tên)
  const applyConflict = (error) => {
    const message = error?.message || 'Dữ liệu đã tồn tại'
    methods.setError(/^Mã/i.test(message) ? 'code' : 'name', { message })
  }

  const saveCategory = async (values) => {
    const body = { name: values.name.trim(), description: values.description?.trim() ?? '', status: values.status }
    setSaving(true)
    try {
      if (isEdit) {
        const saved = await dispatch(updateCategory({ id: editing.id, ...body })).unwrap()
        showToast(`Đã lưu thay đổi cho danh mục ${saved?.code ?? editing.code}`, 'success')
      } else {
        const saved = await dispatch(createCategory({ ...body, type: values.type, code: values.code.trim() })).unwrap()
        showToast(`Đã thêm danh mục ${saved?.code ?? values.code} · ${body.name}`, 'success')
        if (query.page !== 1) dispatch(setCategoriesQuery({ page: 1 }))
      }
      setEditing(null)
      afterChange()
    } catch (error) {
      if (error?.response?.status === 409) applyConflict(error)
      else showError(error, 'Lưu danh mục thất bại')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (category) => {
    const status = category.status === 'DANG_SU_DUNG' ? 'NGUNG_SU_DUNG' : 'DANG_SU_DUNG'
    try {
      await dispatch(updateCategory({ id: category.id, status })).unwrap()
      showToast(status === 'NGUNG_SU_DUNG' ? `Đã ngừng sử dụng danh mục ${category.name}` : `Đã dùng lại danh mục ${category.name}`, 'success')
      afterChange()
    } catch (error) {
      showError(error, 'Cập nhật trạng thái thất bại')
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      const result = await dispatch(deleteCategories([deleteTarget.id])).unwrap()
      if (result?.notFoundIds?.length) showToast(`Danh mục ${deleteTarget.code} không còn tồn tại`, 'warning')
      else showToast(`Đã xóa danh mục ${deleteTarget.code} · ${deleteTarget.name}`, 'success')
      // Xóa dòng cuối cùng của trang cuối thì lùi về trang trước
      if (categories.length === 1 && query.page > 1) dispatch(setCategoriesQuery({ page: query.page - 1 }))
      else reload()
      reloadStats()
    } catch (error) {
      showError(error, 'Xóa danh mục thất bại')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  // Bấm nút trong dòng không mở drawer chỉnh sửa của dòng.
  const rowAction = (handler) => (event) => {
    event.stopPropagation()
    handler()
  }

  const columns = [
    { key: 'code', header: 'Mã danh mục', width: 120 },
    { key: 'name', header: 'Tên danh mục', render: (c) => <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{c.name}</Typography> },
    {
      key: 'type',
      header: 'Module',
      width: 90,
      render: (c) => <StatusBadge label={c.typeLabel ?? MODULE_LABEL[c.type]} tone={MODULE_TONE[c.type]} size="small" />,
    },
    { key: 'status', header: 'Trạng thái', width: 140, render: (c) => <StatusBadge status={c.status} label={c.statusLabel} size="small" /> },
    // Số yêu cầu chi + dòng ngân sách đang dùng danh mục (server đếm). > 0 thì chỉ ngừng dùng, không xóa
    { key: 'usage', header: 'Số giao dịch', width: 110, render: (c) => c.usage ?? 0 },
    {
      key: 'updatedAt',
      header: 'Cập nhật gần nhất',
      width: 170,
      render: (c) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(c.updatedAt)}
          {c.updatedByName && ` • ${c.updatedByName}`}
        </Typography>
      ),
    },
    {
      key: 'action',
      header: 'Thao tác',
      width: 190,
      render: (c) => (
        <Stack direction="row" spacing={0.5}>
          <Button size="small" variant="text" startIcon={<Pencil size={14} />} onClick={rowAction(() => openDrawer(c))}>
            Sửa
          </Button>
          {(c.usage ?? 0) === 0 ? (
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

      <FilterBar search={<SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tên hoặc mã danh mục" width={450} />}>
        <FilterSelect value={query.type} options={MODULE_FILTER} onChange={(type) => dispatch(setCategoriesQuery({ type }))} />
        <FilterSelect value={query.status} options={STATUS_FILTER} onChange={(status) => dispatch(setCategoriesQuery({ status }))} />
      </FilterBar>

      {loadError && (
        <AppAlert tone="danger" title="Không tải được danh sách danh mục" sx={{ mb: 2 }}>
          {loadError.message}{' '}
          <Button size="small" onClick={afterChange}>Thử lại</Button>
        </AppAlert>
      )}

      <SectionCard
        title="Danh sách danh mục"
        action={
          <Typography variant="caption">
            {stats.total} danh mục{stats.latestUpdate && ` • Cập nhật mới nhất: ${formatDate(stats.latestUpdate)}`}
          </Typography>
        }
      >
        <DataTable
          columns={columns}
          rows={categories}
          loading={loading && categories.length === 0}
          onRowClick={openDrawer}
          minWidth={960}
          emptyState={<EmptyState variant={hasFilter ? 'no-results' : 'empty'} compact />}
        />
        {total > 0 && (
          <TablePaginationBar
            page={query.page}
            pageSize={query.limit}
            total={total}
            onPageChange={(page) => dispatch(setCategoriesQuery({ page }))}
            itemLabel="danh mục"
          />
        )}
      </SectionCard>

      <AppAlert tone="info" sx={{ mt: 3 }}>
        Chỉ xóa danh mục chưa có giao dịch. Với danh mục đã sử dụng, chọn “Ngừng dùng” để giữ nguyên lịch sử và báo cáo.
      </AppAlert>

      <FormDrawer
        open={Boolean(editing)}
        onClose={() => !saving && setEditing(null)}
        title={isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
        subtitle={isEdit ? 'Cập nhật thông tin và phạm vi sử dụng danh mục.' : 'Tạo danh mục mới để phân loại giao dịch nhất quán.'}
        note="* Thông tin bắt buộc"
        actions={
          <>
            <Button variant="outlined" disabled={saving} onClick={() => setEditing(null)}>Hủy</Button>
            <Button variant="contained" loading={saving} onClick={methods.handleSubmit(saveCategory)}>
              {isEdit ? 'Lưu thay đổi' : 'Thêm danh mục'}
            </Button>
          </>
        }
      >
        <FormProvider {...methods}>
          {isEdit ? (
            // Server không cho đổi module sau khi tạo (giữ đúng dữ liệu các giao dịch đã gắn danh mục)
            <FormTextField
              label="Module áp dụng"
              required
              disabled
              value={MODULE_LABEL[editing.type] ?? ''}
              helperText="Không thể đổi module sau khi tạo danh mục."
              slotProps={lockAdornment}
            />
          ) : (
            <CustomSelect
              name="type"
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
                : `Mã duy nhất trong module ${MODULE_LABEL[watchedType] ?? ''}, tối đa ${CODE_MAX} ký tự. Tự chuyển thành chữ in hoa.`
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
              Danh mục sẽ xuất hiện trong biểu mẫu {(isEdit ? editing.type : watchedType) === 'THU' ? 'ghi nhận khoản thu' : 'tạo yêu cầu chi'}. Chỉ quản trị viên được thêm, sửa hoặc ngừng sử dụng.
            </AppAlert>
          )}

          {isEdit && (
            <Typography variant="caption" component="p">
              Cập nhật lần cuối: {formatDate(editing.updatedAt)}
              {editing.updatedByName && ` • ${editing.updatedByName}`}
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
        loading={deleting}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={confirmDelete}
      >
        <Box sx={{ bgcolor: colors.surfaceMuted, borderRadius: 2, px: 2, py: 1.5 }}>
          {[
            ['Mã danh mục', deleteTarget?.code],
            ['Module áp dụng', deleteTarget?.typeLabel ?? MODULE_LABEL[deleteTarget?.type]],
            ['Số giao dịch liên quan', `${deleteTarget?.usage ?? 0} giao dịch`],
          ].map(([label, value]) => (
            <Stack key={label} direction="row" sx={{ justifyContent: 'space-between', py: 0.5 }}>
              <Typography variant="body2" color="text.secondary">{label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
            </Stack>
          ))}
        </Box>
        <AppAlert tone="danger">
          Danh mục sẽ bị xóa khỏi module {deleteTarget?.typeLabel ?? MODULE_LABEL[deleteTarget?.type]} và không còn xuất hiện trong danh sách lựa chọn.
        </AppAlert>
      </ConfirmDialog>
    </>
  )
}
