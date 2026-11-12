import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Download, Plus } from 'lucide-react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import {
  AppAlert,
  ApprovalDecision,
  ApprovalRecord,
  ApprovalTimeline,
  AttachmentItem,
  ChecklistCard,
  ConfirmDialog,
  CounterTile,
  CustomAsyncAutoComplete,
  CustomFileUpload,
  CustomForm,
  CustomInput,
  CustomMoneyInput,
  CustomSelect,
  CustomTab,
  DataTable,
  DescriptionList,
  EmptyState,
  FilterBar,
  FilterChip,
  FilterSelect,
  FormDrawer,
  FormFooter,
  FormGrid,
  FormTextField,
  NotificationItem,
  PageHeader,
  PermissionMatrix,
  ProcessFlow,
  SearchInput,
  SectionCard,
  StateDiff,
  StatusBadge,
  SummaryBar,
  TablePaginationBar,
  TwoLineText,
  UserAvatar,
  useToast,
} from '../components'
import SpendingBarChart from '../components/data/SpendingBarChart'
import { STATUS } from '../constants/status'
import { BENEFICIARIES, searchBeneficiaries, searchUsers } from '../mocks/lookups'

// Trang trình diễn toàn bộ component dùng chung với dữ liệu mẫu từ thiết kế Figma.

const APPROVAL_STEPS = [
  { title: 'Nhân viên gửi yêu cầu', description: 'Nguyễn Mai Anh · 20/10/2026, 09:15', status: 'done' },
  { title: 'Trưởng phòng phê duyệt', description: 'Trần Minh Đức · 20/10/2026, 14:30', status: 'done' },
  { title: 'Kế toán thẩm định', description: 'Lê Thu Hà · 21/10/2026, 10:20', status: 'done' },
  { title: 'Lãnh đạo duyệt cuối', description: 'Phạm Quốc Huy · Chờ đến lượt', status: 'current', badge: { label: 'Đang chờ xử lý' } },
  { title: 'Kế toán thực hiện chi', description: 'Chỉ sau đủ ba phê duyệt', status: 'pending' },
]

const USERS = [
  { id: 1, name: 'Lê Thu Hà', email: 'thuha@anviet.vn', department: 'Kế toán', role: 'Kế toán', status: 'HOAT_DONG', lastLogin: '22/10/2026 09:12' },
  { id: 2, name: 'Nguyễn Mai Anh', email: 'maianh@anviet.vn', department: 'Marketing', role: 'Nhân viên', status: 'HOAT_DONG', lastLogin: '21/10/2026 16:40' },
  { id: 3, name: 'Nguyễn Thị Lan', email: 'lannt@anviet.vn', department: 'Kế toán', role: 'Kế toán', status: 'KHOA', lastLogin: '18/10/2026 09:20' },
]

const PERMISSION_ACTIONS = [
  { key: 'view', label: 'Xem' },
  { key: 'create', label: 'Tạo' },
  { key: 'submit', label: 'Gửi' },
  { key: 'deptApprove', label: 'Duyệt phòng' },
  { key: 'accApprove', label: 'Duyệt kế toán' },
  { key: 'finalApprove', label: 'Duyệt cuối' },
  { key: 'pay', label: 'Thực chi' },
]

const INITIAL_ROLES = [
  { key: 'NV', name: 'Nhân viên', scope: 'Cá nhân', permissions: { view: true, create: true, submit: true } },
  { key: 'TP', name: 'Trưởng phòng', scope: 'Phòng ban', permissions: { view: true, create: true, submit: true, deptApprove: true } },
  { key: 'KT', name: 'Kế toán', scope: 'Toàn công ty', permissions: { view: true, create: true, accApprove: true, pay: true } },
  { key: 'LD', name: 'Lãnh đạo', scope: 'Toàn công ty', permissions: { view: true, finalApprove: true } },
]

const EXPENSE_FORM = {
  category: 'Truyền thông',
  beneficiary: 'NTH-01',
  watchers: [],
  amount: 48_000_000,
  dueDate: '2026-10-29',
  note: '',
  documents: [{ name: 'Hợp đồng AV-MKT-10.pdf', size: 1_258_291 }],
  vatInvoices: [],
}

const USER_FORM = { name: 'Nguyễn Mai Anh', email: 'maianh@anviet.vn', department: 'Marketing', role: 'Nhân viên' }

const TABS = [
  { value: 'profile', label: 'Hồ sơ' },
  { value: 'history', label: 'Lịch sử xử lý', count: 3 },
  { value: 'versions', label: 'Phiên bản', count: 1 },
]

function GallerySection({ title, children }) {
  return (
    <Box sx={{ mb: 5 }}>
      <Typography variant="overline" component="h2" color="primary" sx={{ display: 'block', mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  )
}

function TwoColumns({ children }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 372px' }, gap: 3, alignItems: 'start' }}>
      {children}
    </Box>
  )
}

export default function ComponentGallery() {
  const showToast = useToast()
  // mode onChange: trình diễn lỗi ngay khi nhập, không chờ bấm gửi.
  const expenseForm = useForm({ defaultValues: EXPENSE_FORM, mode: 'onChange' })
  const rejectForm = useForm({ defaultValues: { reason: '' } })
  const userForm = useForm({ defaultValues: USER_FORM })
  const rejectReason = useWatch({ control: rejectForm.control, name: 'reason' })
  const [tab, setTab] = useState('profile')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [roles, setRoles] = useState(INITIAL_ROLES)

  const togglePermission = (roleKey, actionKey) =>
    setRoles((prev) =>
      prev.map((r) => (r.key === roleKey ? { ...r, permissions: { ...r.permissions, [actionKey]: !r.permissions[actionKey] } } : r)),
    )

  const userColumns = [
    {
      key: 'name',
      header: 'Người dùng',
      render: (u) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <UserAvatar name={u.name} />
          <TwoLineText primary={u.name} secondary={u.email} />
        </Stack>
      ),
    },
    { key: 'department', header: 'Phòng ban' },
    { key: 'role', header: 'Vai trò' },
    { key: 'status', header: 'Trạng thái', render: (u) => <StatusBadge status={u.status} /> },
    { key: 'lastLogin', header: 'Đăng nhập gần nhất' },
    {
      key: 'action',
      header: 'Hành động',
      render: (u) =>
        u.status === 'KHOA' ? (
          <Button size="small" variant="soft" color="primary">Mở khóa</Button>
        ) : (
          <Button size="small" variant="soft" color="warning">Khóa</Button>
        ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="THƯ VIỆN UI"
        title="Component dùng chung"
        description="Toàn bộ component được dựng bằng MUI theo thiết kế Figma An Việt."
        actions={
          <>
            <Button variant="outlined" startIcon={<Download size={16} />}>Xuất danh sách</Button>
            <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setDrawerOpen(true)}>
              Mời người dùng
            </Button>
          </>
        }
      />

      <GallerySection title="Badge trạng thái & nút">
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mb: 2 }}>
          {Object.keys(STATUS).map((code) => (
            <StatusBadge key={code} status={code} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          <Button variant="contained">Primary</Button>
          <Button variant="outlined">Secondary</Button>
          <Button variant="soft" color="error">Từ chối</Button>
          <Button variant="soft" color="primary">Soft primary</Button>
          <Button variant="contained" disabled>Gửi phê duyệt</Button>
        </Stack>
      </GallerySection>

      <GallerySection title="Alert">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          <AppAlert tone="info" title="Không tự duyệt">Nếu người tạo đồng thời là người duyệt, hồ sơ chuyển cho người thay thế.</AppAlert>
          <AppAlert tone="success" title="Trong hạn mức">Yêu cầu 48.000.000 VND. Còn 132.000.000 VND nếu được duyệt.</AppAlert>
          <AppAlert tone="warning" title="2 hồ sơ đến hạn trong 48 giờ">Xem xét đúng bước để kế toán có đủ thời gian thẩm định.</AppAlert>
          <AppAlert tone="danger" title="Khóa tài khoản phải xác nhận">Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa lại.</AppAlert>
        </Box>
      </GallerySection>

      <GallerySection title="Form tạo yêu cầu chi">
        <TwoColumns>
          <CustomForm methods={expenseForm} onSubmit={() => showToast('Yêu cầu CHI-1029 đã được gửi cho trưởng phòng', 'success')}>
            <SectionCard title="Thông tin đề nghị" subtitle="Dấu * là trường bắt buộc · Tiền tệ VND">
              <FormGrid>
                <FormTextField label="Mã yêu cầu" value="Tự sinh · CHI-1029 khi lưu" disabled />
                <CustomSelect
                  name="category"
                  label="Loại chi"
                  required
                  options={['Truyền thông', 'Công tác phí', 'Mua sắm', 'Dịch vụ thuê ngoài']}
                />
                <CustomMoneyInput
                  name="amount"
                  label="Số tiền đề nghị (VND)"
                  required
                  rules={{ required: 'Vui lòng nhập số tiền.' }}
                  helperText="Số nguyên lớn hơn 0."
                />
                <CustomInput name="dueDate" label="Ngày cần chi" required type="date" rules={{ required: 'Chọn ngày cần chi.' }} />
                <CustomAsyncAutoComplete
                  name="beneficiary"
                  label="Người thụ hưởng"
                  required
                  rules={{ required: 'Chọn người thụ hưởng.' }}
                  fetchOptions={searchBeneficiaries}
                  fetchById={(id) => Promise.resolve(BENEFICIARIES.find((b) => b.id === id))}
                  optionLabel="name"
                  useCombinedLabel
                  combinedLabelField="taxCode"
                  optionSubLabel
                  returnObject={false}
                  placeholder="Tìm theo tên hoặc mã số thuế"
                />
                <CustomAsyncAutoComplete
                  name="watchers"
                  label="Người theo dõi"
                  isMulti
                  limitTags={2}
                  fetchOptions={searchUsers}
                  optionLabel="name"
                  optionSubLabel="email"
                  placeholder="Tìm theo họ tên hoặc email"
                />
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <CustomInput
                    name="note"
                    label="Ghi chú"
                    multiline
                    minRows={3}
                    placeholder="Thanh toán theo hợp đồng AV-MKT-10, nghiệm thu theo từng đợt."
                  />
                </Box>
              </FormGrid>
            </SectionCard>
            <SectionCard title="Hóa đơn & tệp đính kèm" sx={{ mt: 3 }}>
              <Stack spacing={2.5}>
                <CustomFileUpload name="documents" label="Chứng từ bắt buộc" required showButton={false} />
                <CustomFileUpload
                  name="vatInvoices"
                  label="Hóa đơn VAT"
                  placeholder="Chọn tệp hóa đơn"
                  error="Thiếu hóa đơn VAT. Bổ sung tệp hoặc ghi lý do chưa có để được thẩm định."
                />
              </Stack>
            </SectionCard>
            <FormFooter note="Chưa thể gửi: cần xử lý mục được đánh dấu.">
              <Button variant="outlined" onClick={() => showToast('Đã lưu nháp lúc 09:22', 'info')}>Lưu nháp</Button>
              <Button variant="contained" type="submit" disabled>Gửi phê duyệt</Button>
            </FormFooter>
          </CustomForm>
          <Stack spacing={3}>
            <SectionCard title="Luồng xử lý bắt buộc">
              <ProcessFlow steps={['Bạn', 'Trưởng phòng', 'Kế toán', 'Lãnh đạo', 'Kế toán thực hiện chi']} />
            </SectionCard>
            <ChecklistCard
              items={[
                { label: 'Ngân sách còn đủ', ok: true },
                { label: 'Tài khoản thụ hưởng đúng định dạng', ok: true },
                { label: 'Chứng từ hóa đơn chưa hoàn tất', ok: false },
              ]}
            />
          </Stack>
        </TwoColumns>
      </GallerySection>

      <GallerySection title="Chi tiết hồ sơ & phê duyệt">
        <SummaryBar
          items={[
            { label: 'Người tạo / Phòng ban', value: 'Nguyễn Mai Anh / Marketing' },
            { label: 'Số tiền đề nghị', value: '48.000.000 VND' },
            { label: 'Ngày cần chi', value: '25/10/2026' },
            { label: 'Người thụ hưởng', value: 'Công ty TNHH Sao Việt' },
          ]}
        />
        <TwoColumns>
          <Stack spacing={3}>
            <CustomTab value={tab} onChange={setTab} tabs={TABS} />
            <SectionCard title="Mục đích & người thụ hưởng">
              <DescriptionList
                items={[
                  { label: 'Loại chi / Phương thức', value: 'Truyền thông / Chuyển khoản' },
                  { label: 'Ngân hàng / Số tài khoản', value: 'Vietcombank / 0071008855123' },
                  { label: 'Kỳ / Khoản mục ngân sách', value: 'Quý IV/2026 / Truyền thông' },
                  { label: 'Tên tài khoản', value: 'CONG TY TNHH SAO VIET' },
                ]}
              />
            </SectionCard>
            <SectionCard title="Chứng từ đính kèm">
              <Stack spacing={1.25}>
                <AttachmentItem name="Hợp đồng AV-MKT-10.pdf" meta="1,2 MB · Nguyễn Mai Anh · 20/10/2026" onDownload={() => {}} />
                <AttachmentItem name="Báo giá chiến dịch quý IV.pdf" meta="486 KB · Nguyễn Mai Anh · 20/10/2026" onDownload={() => {}} />
              </Stack>
            </SectionCard>
            <SectionCard title="Xác nhận hai cấp đã hoàn tất">
              <Stack spacing={2.5}>
                <ApprovalRecord label="Đã duyệt cấp phòng" actor="Trần Minh Đức · 20/10/2026, 14:30" note="Đúng kế hoạch quý IV, mục tiêu và phạm vi phù hợp." />
                <ApprovalRecord label="Đã duyệt kế toán" actor="Lê Thu Hà · 21/10/2026, 10:20" note="5/5 mục kiểm tra hoàn tất." />
              </Stack>
            </SectionCard>
            <ApprovalDecision
              title="Quyết định của lãnh đạo"
              approveLabel="Phê duyệt cuối"
              notice={{
                title: 'Phê duyệt không phải là thanh toán',
                message: 'Sau khi bạn duyệt, hồ sơ tạo cam kết chưa chi 48.000.000 VND và chuyển kế toán thực hiện.',
              }}
              onReject={() => setRejectOpen(true)}
              onRequestChanges={() => showToast('Đã gửi yêu cầu bổ sung', 'warning')}
              onApprove={() => showToast('Yêu cầu CHI-1024 đã được phê duyệt', 'success')}
            />
          </Stack>
          <SectionCard title="Tiến trình phê duyệt" subtitle="3 cấp duyệt, sau đó kế toán thanh toán">
            <ApprovalTimeline steps={APPROVAL_STEPS} />
          </SectionCard>
        </TwoColumns>
      </GallerySection>

      <GallerySection title="Bảng dữ liệu, bộ lọc & phân trang">
        <FilterBar search={<SearchInput value={search} onChange={setSearch} placeholder="Tìm theo họ tên, email hoặc mã nhân viên" width={300} />}>
          <FilterSelect
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { value: '', label: 'Tất cả vai trò' },
              { value: 'NV', label: 'Nhân viên' },
              { value: 'KT', label: 'Kế toán' },
            ]}
          />
          <FilterChip label="7 ngày gần nhất" selected />
          <FilterChip label="Module: Tất cả" />
        </FilterBar>
        <SectionCard title="Danh sách người dùng" action={<Typography variant="caption">24 người dùng · 2 tài khoản đang khóa</Typography>}>
          <DataTable columns={userColumns} rows={USERS} />
          <TablePaginationBar page={page} pageSize={5} total={24} onPageChange={setPage} itemLabel="người dùng" />
        </SectionCard>
      </GallerySection>

      <GallerySection title="Ma trận phân quyền (bấm để đổi)">
        <SectionCard title="Ma trận phân quyền" subtitle="Quyền theo vai trò và phạm vi làm việc">
          <PermissionMatrix actions={PERMISSION_ACTIONS} roles={roles} onToggle={togglePermission} />
        </SectionCard>
        <Box sx={{ mt: 3 }}>
          <ProcessFlow
            variant="cards"
            steps={[
              { title: 'Nhân viên gửi yêu cầu', description: 'Tạo hồ sơ và gửi cho trưởng phòng' },
              { title: 'Trưởng phòng duyệt phòng', description: 'Phê duyệt theo kế hoạch và ngân sách' },
              { title: 'Kế toán thẩm định', description: 'Kiểm tra chứng từ, tài khoản và ngân sách' },
              { title: 'Lãnh đạo duyệt cuối', description: 'Quyết định cuối cùng trước khi chi' },
              { title: 'Kế toán thực chi', description: 'Thực hiện thanh toán sau đủ ba phê duyệt' },
            ]}
          />
        </Box>
      </GallerySection>

      <GallerySection title="Biểu đồ">
        <SectionCard title="Chi tiêu phòng Marketing" subtitle="Đã chi và cam kết chưa chi · Đơn vị: triệu VND">
          <SpendingBarChart
            categories={['T5', 'T6', 'T7', 'T8', 'T9', 'T10']}
            series={[
              { label: 'Đã chi', data: [42, 60, 52, 80, 70, 95] },
              { label: 'Cam kết chưa chi', data: [32, 40, 46, 56, 64, 75] },
            ]}
            note="Cập nhật 22/10/2026"
          />
        </SectionCard>
      </GallerySection>

      <GallerySection title="Thông báo & nhật ký">
        <TwoColumns>
          <SectionCard title="Xem trước trạng thái bất biến" action={<StatusBadge label="CHI-1024" tone="primary" />}>
            <StateDiff
              before={{ caption: 'TRƯỚC · 20/10/2026 09:14', rows: ['Trạng thái: Nháp', 'Số tiền: 48.000.000 VND', 'Người phê duyệt: Chưa có'] }}
              after={{ caption: 'SAU · 21/10/2026 10:20', rows: ['Trạng thái: Chờ lãnh đạo', 'Số tiền: 48.000.000 VND', 'Kế toán duyệt: Lê Thu Hà'] }}
            />
          </SectionCard>
          <Stack spacing={1.5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
              <CounterTile value={5} label="Chưa đọc" tone="primary" />
              <CounterTile value={3} label="Đến hạn" tone="warning" />
              <CounterTile value={2} label="Cần xử lý" tone="danger" />
            </Box>
            <NotificationItem
              tone="primary"
              category="Chờ lãnh đạo duyệt"
              time="08:00 hôm nay"
              title="CHI-1024 · 48.000.000 VND cần Phạm Quốc Huy duyệt"
              description="Chiến dịch thương hiệu quý IV · Marketing · Nguyễn Mai Anh"
              actionLabel="Xem hồ sơ"
            />
            <NotificationItem
              tone="danger"
              category="Thu / Chi lỗi"
              time="08:55 hôm nay"
              title="GD-2210-03 thất bại · CHI-1012"
              description="Sai mã ngân hàng. Kiểm tra lại trước khi thực hiện lần hai để tránh chi kép."
              actionLabel="Xử lý ngay"
            />
            <NotificationItem read category="Duyệt cấp phòng" description="CHI-1024 đã được Trần Minh Đức duyệt cấp phòng · 20/10/2026, 14:30" />
          </Stack>
        </TwoColumns>
      </GallerySection>

      <GallerySection title="Trạng thái rỗng / lỗi / đang tải">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {['loading', 'empty', 'no-results', 'no-permission', 'network-error'].map((variant) => (
            <SectionCard key={variant} padding={1}>
              <EmptyState
                variant={variant}
                compact
                action={variant === 'network-error' ? <Button variant="outlined" size="small">Thử lại</Button> : undefined}
              />
            </SectionCard>
          ))}
        </Box>
      </GallerySection>

      <ConfirmDialog
        open={rejectOpen}
        title="Từ chối yêu cầu"
        description="Lý do sẽ được lưu vào lịch sử xử lý và gửi tới người tạo."
        tone="danger"
        confirmLabel="Từ chối"
        confirmDisabled={!rejectReason.trim()}
        onClose={() => setRejectOpen(false)}
        onConfirm={rejectForm.handleSubmit(() => {
          setRejectOpen(false)
          rejectForm.reset()
          showToast('Đã từ chối yêu cầu CHI-1024', 'error')
        })}
      >
        <FormProvider {...rejectForm}>
          <CustomInput name="reason" label="Lý do từ chối" required multiline minRows={2} placeholder="Không đúng kế hoạch quý IV" />
        </FormProvider>
      </ConfirmDialog>

      <FormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Thêm / sửa người dùng"
        subtitle="Quản trị viên hệ thống có thể mời, chỉnh sửa hoặc khóa tài khoản."
        actions={
          <>
            <Button variant="outlined" onClick={() => setDrawerOpen(false)}>Hủy</Button>
            <Button
              variant="contained"
              onClick={userForm.handleSubmit(() => {
                setDrawerOpen(false)
                showToast('Đã lưu thay đổi người dùng', 'success')
              })}
            >
              Lưu thay đổi
            </Button>
          </>
        }
      >
        <FormProvider {...userForm}>
          <CustomInput name="name" label="Họ và tên" />
          <CustomInput name="email" label="Email" error="Email đã tồn tại trong hệ thống." />
          <CustomSelect name="department" label="Phòng ban" options={['Marketing', 'Kế toán', 'Vận hành', 'Ban Giám đốc']} />
          <CustomSelect name="role" label="Vai trò" options={['Nhân viên', 'Trưởng phòng', 'Kế toán', 'Lãnh đạo', 'Admin']} />
          <AppAlert tone="info" title="Quyền quản trị không cấp ngầm quyền tài chính">
            Admin hệ thống chỉ quản lý người dùng, không mặc định có quyền duyệt hoặc chi tiền.
          </AppAlert>
        </FormProvider>
      </FormDrawer>
    </>
  )
}
