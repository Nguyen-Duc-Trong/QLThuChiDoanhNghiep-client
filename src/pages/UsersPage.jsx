import { useCallback, useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { Plus, Trash2 } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  AppAlert,
  ConfirmDialog,
  CustomInput,
  CustomSelect,
  DataTable,
  EmptyState,
  FilterBar,
  FilterSelect,
  FormDrawer,
  PageHeader,
  SearchInput,
  SectionCard,
  StatusBadge,
  TablePaginationBar,
  TOAST_OPTIONS,
  TwoLineText,
  UserAvatar,
  useToast,
} from '../components'
import {
  createUser,
  deleteUsers,
  fetchUserById,
  fetchUsers,
  selectUsers,
  selectUsersError,
  selectUsersLoading,
  selectUsersQuery,
  selectUsersTotal,
  setUsersQuery,
  updateUser,
} from '../store/slices/usersSlice'
import { selectCurrentUser } from '../store/slices/sessionSlice'
import { ROLES } from '../constants/navigation'
import validationResolver from '../utils/validationResolver'
import AdminTabs from './admin/AdminTabs'

// Màn 20 · Admin quản lý người dùng (gọi API /users).
const EMPTY_USER = { id: '', username: '', email: '', password: '', status: 'active', role: 'NHAN_VIEN' }

const ROLE_OPTIONS = Object.entries(ROLES).map(([value, { label }]) => ({ value, label }))
const ROLE_FILTER = [{ value: '', label: 'Tất cả vai trò' }, ...ROLE_OPTIONS]

// Trạng thái phía server (UserStatus) -> mã hiển thị của StatusBadge
const STATUS_BADGE = { active: 'HOAT_DONG', inactive: 'KHOA' }
const STATUS_OPTIONS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Khóa' },
]
const STATUS_FILTER = [{ value: '', label: 'Tất cả trạng thái' }, ...STATUS_OPTIONS]

function validateUser(user) {
  const errors = {}
  if (!user.username.trim()) errors.username = 'Nhập tên người dùng.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email.trim())) errors.email = 'Email không hợp lệ.'
  // Thêm mới: bắt buộc mật khẩu. Sửa: bỏ trống = giữ mật khẩu cũ.
  if (!user.id && !user.password) errors.password = 'Nhập mật khẩu.'
  else if (user.password && user.password.length < 6) errors.password = 'Mật khẩu tối thiểu 6 ký tự.'
  return errors
}

export default function UsersPage() {
  const dispatch = useDispatch()
  const showToast = useToast()
  const users = useSelector(selectUsers)
  const total = useSelector(selectUsersTotal)
  const query = useSelector(selectUsersQuery)
  const loading = useSelector(selectUsersLoading)
  const loadError = useSelector(selectUsersError)
  const currentUser = useSelector(selectCurrentUser)

  const [search, setSearch] = useState(query.search)
  const [selectedIds, setSelectedIds] = useState([])
  const [editing, setEditing] = useState(null) // { id? } đang thêm/sửa, null = đóng drawer
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lockTarget, setLockTarget] = useState(null)
  const [deleteTargets, setDeleteTargets] = useState(null) // mảng user cần xóa, null = đóng dialog
  const [deleting, setDeleting] = useState(false)
  const methods = useForm({ defaultValues: EMPTY_USER, resolver: validationResolver(validateUser) })

  const showError = useCallback(
    (error, fallback) => showToast(error?.message || fallback, 'error', TOAST_OPTIONS.fromError(error)),
    [showToast],
  )

  const reload = useCallback(() => dispatch(fetchUsers(query)), [dispatch, query])

  useEffect(() => {
    reload()
  }, [reload])

  // Chờ người dùng gõ xong 300ms mới gọi API tìm kiếm
  useEffect(() => {
    if (search === query.search) return undefined
    const timer = setTimeout(() => dispatch(setUsersQuery({ search })), 300)
    return () => clearTimeout(timer)
  }, [search, query.search, dispatch])

  // ----- Thêm / sửa -----
  const openCreate = () => {
    methods.reset(EMPTY_USER)
    setEditing({})
  }

  const openEdit = async (user) => {
    methods.reset({ ...EMPTY_USER, ...user, password: '' })
    setEditing({ id: user.id })
    setLoadingDetail(true)
    try {
      const detail = await dispatch(fetchUserById(user.id)).unwrap()
      methods.reset({ ...EMPTY_USER, ...detail, password: '' })
    } catch (error) {
      showError(error, 'Không tải được thông tin người dùng')
      setEditing(null)
    } finally {
      setLoadingDetail(false)
    }
  }

  const saveUser = async (values) => {
    const body = { username: values.username.trim(), email: values.email.trim(), role: values.role }
    if (values.password) body.password = values.password
    setSaving(true)
    try {
      if (values.id) {
        await dispatch(updateUser({ ...body, id: values.id, status: values.status })).unwrap()
        showToast(`Đã lưu thay đổi cho ${body.username}`, 'success')
      } else {
        await dispatch(createUser(body)).unwrap()
        showToast(`Đã thêm người dùng ${body.username}`, 'success')
      }
      setEditing(null)
      reload()
    } catch (error) {
      if (error?.response?.status === 409) methods.setError('email', { message: error.message })
      else showError(error, 'Lưu người dùng thất bại')
    } finally {
      setSaving(false)
    }
  }

  // ----- Khóa / mở khóa (cập nhật status) -----
  const confirmLockToggle = async () => {
    const nextStatus = lockTarget.status === 'inactive' ? 'active' : 'inactive'
    try {
      await dispatch(updateUser({ id: lockTarget.id, status: nextStatus })).unwrap()
      showToast(nextStatus === 'inactive' ? `Đã khóa tài khoản ${lockTarget.username}` : `Đã mở khóa tài khoản ${lockTarget.username}`, 'success')
      reload()
    } catch (error) {
      showError(error, 'Cập nhật trạng thái thất bại')
    } finally {
      setLockTarget(null)
    }
  }

  // ----- Xóa 1 hoặc nhiều -----
  const confirmDelete = async () => {
    const ids = deleteTargets.map((u) => u.id)
    setDeleting(true)
    try {
      const result = await dispatch(deleteUsers(ids)).unwrap()
      const deleted = result?.deletedIds?.length ?? ids.length
      const notFound = result?.notFoundIds?.length ?? 0
      showToast(
        notFound ? `Đã xóa ${deleted} người dùng, ${notFound} người dùng không còn tồn tại` : `Đã xóa ${deleted} người dùng`,
        notFound ? 'warning' : 'success',
      )
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)))
      // Xóa hết dòng của trang cuối thì lùi về trang trước
      if (deleted >= users.length && query.page > 1) dispatch(setUsersQuery({ page: query.page - 1 }))
      else reload()
    } catch (error) {
      showError(error, 'Xóa người dùng thất bại')
      if (error?.response?.status === 404) reload()
    } finally {
      setDeleting(false)
      setDeleteTargets(null)
    }
  }

  // ----- Chọn nhiều dòng (chỉ tính các dòng đang hiển thị trên trang) -----
  const pageIds = users.map((u) => u.id)
  const selectedOnPage = pageIds.filter((id) => selectedIds.includes(id))
  const allSelected = pageIds.length > 0 && selectedOnPage.length === pageIds.length
  const toggleAll = () =>
    setSelectedIds((prev) => (allSelected ? prev.filter((id) => !pageIds.includes(id)) : [...new Set([...prev, ...pageIds])]))
  const toggleOne = (id) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const hasFilter = Boolean(query.search || query.status || query.role)

  const columns = [
    {
      key: 'select',
      width: 48,
      header: (
        <Checkbox
          size="small"
          checked={allSelected}
          indeterminate={selectedOnPage.length > 0 && !allSelected}
          onChange={toggleAll}
          disabled={pageIds.length === 0}
          slotProps={{ input: { 'aria-label': 'Chọn tất cả người dùng trên trang' } }}
          sx={{ p: 0 }}
        />
      ),
      render: (u) => (
        <Checkbox
          size="small"
          checked={selectedIds.includes(u.id)}
          onClick={(event) => event.stopPropagation()}
          onChange={() => toggleOne(u.id)}
          slotProps={{ input: { 'aria-label': `Chọn ${u.username}` } }}
          sx={{ p: 0 }}
        />
      ),
    },
    {
      key: 'username',
      header: 'Người dùng',
      render: (u) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <UserAvatar name={u.username} />
          <TwoLineText primary={u.username} secondary={u.email} />
        </Stack>
      ),
    },
    { key: 'role', header: 'Vai trò', render: (u) => <StatusBadge label={ROLES[u.role]?.label ?? u.role} tone="primary" size="small" /> },
    { key: 'status', header: 'Trạng thái', render: (u) => <StatusBadge status={STATUS_BADGE[u.status] ?? 'KHOA'} /> },
    {
      key: 'action',
      header: 'Hành động',
      align: 'right',
      // Không cho tự khóa / tự xóa chính mình (server cũng chặn)
      render: (u) =>
        u.id === currentUser?.id ? (
          <Typography variant="caption">Tài khoản của bạn</Typography>
        ) : (
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button
            size="small"
            variant="soft"
            color={u.status === 'inactive' ? 'primary' : 'warning'}
            onClick={(event) => {
              event.stopPropagation()
              setLockTarget(u)
            }}
          >
            {u.status === 'inactive' ? 'Mở khóa' : 'Khóa'}
          </Button>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              color="error"
              aria-label={`Xóa ${u.username}`}
              onClick={(event) => {
                event.stopPropagation()
                setDeleteTargets([u])
              }}
            >
              <Trash2 size={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ]

  const isEditing = Boolean(editing?.id)

  return (
    <>
      <PageHeader
        eyebrow="20 / QUẢN TRỊ HỆ THỐNG"
        title="Admin quản lý người dùng"
        description="Quản lý tài khoản người dùng: thêm mới, cập nhật, khóa và xóa."
        actions={
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={openCreate}>
            Thêm người dùng
          </Button>
        }
      />
      <AdminTabs />

      <FilterBar search={<SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tên hoặc email" width={300} />}>
        <FilterSelect value={query.role} options={ROLE_FILTER} onChange={(role) => dispatch(setUsersQuery({ role }))} />
        <FilterSelect value={query.status} options={STATUS_FILTER} onChange={(status) => dispatch(setUsersQuery({ status }))} />
      </FilterBar>

      {loadError && (
        <AppAlert tone="danger" title="Không tải được danh sách người dùng" sx={{ mb: 2 }}>
          {loadError.message}{' '}
          <Button size="small" onClick={reload}>Thử lại</Button>
        </AppAlert>
      )}

      <SectionCard
        title="Danh sách người dùng"
        action={
          selectedOnPage.length > 0 ? (
            <Button
              size="small"
              variant="soft"
              color="error"
              startIcon={<Trash2 size={16} />}
              onClick={() => setDeleteTargets(users.filter((u) => selectedOnPage.includes(u.id)))}
            >
              Xóa {selectedOnPage.length} người dùng
            </Button>
          ) : (
            <Typography variant="caption">{total} người dùng</Typography>
          )
        }
      >
        <DataTable
          columns={columns}
          rows={users}
          loading={loading}
          onRowClick={openEdit}
          minWidth={640}
          emptyState={<EmptyState variant={hasFilter ? 'no-results' : 'empty'} compact />}
        />
        {total > 0 && (
          <TablePaginationBar
            page={query.page}
            pageSize={query.limit}
            total={total}
            onPageChange={(page) => dispatch(setUsersQuery({ page }))}
            itemLabel="người dùng"
          />
        )}
      </SectionCard>

      <FormDrawer
        open={Boolean(editing)}
        onClose={() => !saving && setEditing(null)}
        title={isEditing ? 'Sửa người dùng' : 'Thêm người dùng'}
        subtitle="Quản trị viên hệ thống có thể thêm, chỉnh sửa hoặc khóa tài khoản."
        actions={
          <>
            <Button variant="outlined" disabled={saving} onClick={() => setEditing(null)}>Hủy</Button>
            <Button variant="contained" loading={saving} disabled={loadingDetail} onClick={methods.handleSubmit(saveUser)}>
              {isEditing ? 'Lưu thay đổi' : 'Thêm người dùng'}
            </Button>
          </>
        }
      >
        {loadingDetail ? (
          <EmptyState variant="loading" compact />
        ) : (
          <FormProvider {...methods}>
            <CustomInput name="username" label="Tên người dùng" required />
            <CustomInput name="email" label="Email" required type="email" />
            <CustomInput
              name="password"
              label="Mật khẩu"
              type="password"
              required={!isEditing}
              autoComplete="new-password"
              helperText={isEditing ? 'Để trống nếu không đổi mật khẩu.' : 'Tối thiểu 6 ký tự.'}
            />
            <CustomSelect
              name="role"
              label="Vai trò"
              required
              options={ROLE_OPTIONS}
              disabled={isEditing && editing.id === currentUser?.id}
              helperText={isEditing && editing.id === currentUser?.id ? 'Không thể tự đổi vai trò của chính mình.' : 'Quyền theo vai trò được cấu hình ở tab Vai trò & phân quyền.'}
            />
            {isEditing && (
              <CustomSelect name="status" label="Trạng thái" options={STATUS_OPTIONS} disabled={editing.id === currentUser?.id} />
            )}
            <AppAlert tone="info" title="Quyền quản trị không cấp ngầm quyền tài chính">
              Admin hệ thống chỉ quản lý người dùng, không mặc định có quyền duyệt hoặc chi tiền.
            </AppAlert>
          </FormProvider>
        )}
      </FormDrawer>

      <ConfirmDialog
        open={Boolean(lockTarget)}
        tone={lockTarget?.status === 'inactive' ? 'primary' : 'danger'}
        title={lockTarget?.status === 'inactive' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
        description={
          lockTarget?.status === 'inactive'
            ? `${lockTarget?.username} sẽ đăng nhập lại được ngay sau khi mở khóa.`
            : `${lockTarget?.username} sẽ không thể đăng nhập cho đến khi được mở khóa lại.`
        }
        confirmLabel={lockTarget?.status === 'inactive' ? 'Mở khóa' : 'Khóa tài khoản'}
        onClose={() => setLockTarget(null)}
        onConfirm={confirmLockToggle}
      />

      <ConfirmDialog
        open={Boolean(deleteTargets)}
        tone="danger"
        icon={Trash2}
        title={deleteTargets?.length > 1 ? `Xóa ${deleteTargets.length} người dùng` : 'Xóa người dùng'}
        description={
          deleteTargets?.length > 1
            ? `${deleteTargets.length} tài khoản đã chọn sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác.`
            : `Tài khoản ${deleteTargets?.[0]?.username ?? ''} sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác.`
        }
        confirmLabel="Xóa"
        loading={deleting}
        onClose={() => setDeleteTargets(null)}
        onConfirm={confirmDelete}
      />
    </>
  )
}
