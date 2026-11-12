// Quản trị hệ thống (màn 21, 22) và nhật ký – thông báo (màn 23).

export const PERMISSION_ACTIONS = [
  { key: 'view', label: 'Xem' },
  { key: 'create', label: 'Tạo' },
  { key: 'edit', label: 'Sửa' },
  { key: 'submit', label: 'Gửi' },
  { key: 'deptApprove', label: 'Duyệt phòng' },
  { key: 'accApprove', label: 'Duyệt kế toán' },
  { key: 'finalApprove', label: 'Duyệt cuối' },
  { key: 'pay', label: 'Thực chi' },
  { key: 'confirmIncome', label: 'Xác nhận thu' },
  { key: 'budget', label: 'Ngân sách' },
  { key: 'users', label: 'Người dùng' },
  { key: 'config', label: 'Cấu hình' },
  { key: 'audit', label: 'Nhật ký' },
]

// Quyền nhạy cảm: Admin hệ thống không được cấp (chỉ quản trị cấu hình).
export const SENSITIVE_ACTIONS = ['deptApprove', 'accApprove', 'finalApprove', 'pay', 'confirmIncome', 'budget']

const allow = (...keys) => Object.fromEntries(keys.map((k) => [k, true]))

export const ROLE_DEFINITIONS = [
  { key: 'KE_TOAN', name: 'Kế toán', scope: 'Toàn công ty', permissions: allow('view', 'create', 'edit', 'accApprove', 'pay', 'confirmIncome', 'budget') },
  { key: 'NHAN_VIEN', name: 'Nhân viên', scope: 'Cá nhân', permissions: allow('view', 'create', 'submit') },
  { key: 'TRUONG_PHONG', name: 'Trưởng phòng', scope: 'Phòng ban', permissions: allow('view', 'create', 'edit', 'submit', 'deptApprove') },
  { key: 'LANH_DAO', name: 'Lãnh đạo', scope: 'Toàn công ty', permissions: allow('view', 'finalApprove', 'budget') },
  { key: 'ADMIN', name: 'Admin', scope: 'Cấu hình hệ thống', permissions: allow('view', 'create', 'edit', 'users', 'config', 'audit') },
]

export const ROLE_SCOPES = ['Cá nhân', 'Phòng ban', 'Toàn công ty', 'Cấu hình hệ thống']

export const SPEND_FLOW = [
  { title: 'Nhân viên gửi yêu cầu', description: 'Tạo hồ sơ và gửi cho trưởng phòng' },
  { title: 'Trưởng phòng duyệt phòng', description: 'Phê duyệt theo kế hoạch và ngân sách' },
  { title: 'Kế toán thẩm định', description: 'Kiểm tra chứng từ, tài khoản và ngân sách' },
  { title: 'Lãnh đạo duyệt cuối', description: 'Quyết định cuối cùng trước khi chi' },
  { title: 'Kế toán thực chi', description: 'Thực hiện thanh toán sau đủ ba phê duyệt' },
]

// Màn 22 · Phòng ban.
export const STAFF = ['Lê Thu Hà', 'Trần Minh Đức', 'Nguyễn Thị Lan', 'Đỗ Hữu Tâm', 'Phạm Văn Nam', 'Nguyễn Văn Quang', 'Lê Hữu Khang', 'Phạm Quốc Huy', 'Nguyễn Minh Anh']

export const DEPARTMENT_LIST = [
  { id: 'KT-2026', name: 'Phòng Kế toán', description: 'Quản lý thu, chi và đối soát', head: 'Lê Thu Hà', approver: 'Nguyễn Minh Anh', updatedAt: '18/10/2026, 14:20' },
  { id: 'MKT-2026', name: 'Phòng Marketing', description: 'Chiến dịch thương hiệu và truyền thông', head: 'Trần Minh Đức', approver: 'Phạm Quốc Huy', updatedAt: '20/10/2026, 10:05' },
  { id: 'NS-2026', name: 'Phòng Nhân sự', description: 'Tuyển dụng, lương thưởng và đào tạo', head: 'Nguyễn Thị Lan', approver: '', updatedAt: '22/10/2026, 09:15' },
  { id: 'VH-2026', name: 'Phòng Vận hành', description: 'Hỗ trợ khách hàng và vận hành dự án', head: 'Đỗ Hữu Tâm', approver: 'Lê Thu Hà', updatedAt: '15/10/2026, 16:40' },
  { id: 'IT-2026', name: 'Phòng IT', description: 'Phát triển sản phẩm và bảo mật hệ thống', head: 'Phạm Văn Nam', approver: 'Trần Minh Đức', updatedAt: '12/10/2026, 08:30' },
  { id: 'KD-2026', name: 'Phòng Kinh doanh', description: 'Phát triển khách hàng và quản lý hợp đồng', head: 'Nguyễn Văn Quang', approver: 'Phạm Quốc Huy', updatedAt: '10/10/2026, 11:10' },
  { id: 'SX-2026', name: 'Phòng Sản xuất', description: 'Quản lý nhà cung cấp và sản xuất', head: 'Lê Hữu Khang', approver: 'Nguyễn Minh Anh', updatedAt: '08/10/2026, 15:00' },
  { id: 'TC-2026', name: 'Phòng Tài chính', description: 'Quản lý ngân sách và báo cáo tài chính', head: 'Phạm Quốc Huy', approver: 'Trần Minh Đức', updatedAt: '05/10/2026, 09:45' },
]

export const DELEGATION = {
  substitute: 'Trần Minh Đức',
  scope: 'Phòng Marketing, dưới 50 triệu VND',
  period: '01/11/2026 → 30/11/2026',
  audit: 'Tất cả thay đổi cấu hình được lưu theo người thực hiện',
}

export const SYSTEM_CONFIG = {
  docCode: 'CHI-YYYYMM-XXXX',
  currency: 'VND',
  budgetThreshold: 80,
  notification: 'Email và ứng dụng khi thiếu người duyệt',
}

export const NOTIFICATION_CHANNELS = ['Email và ứng dụng khi thiếu người duyệt', 'Chỉ trong ứng dụng', 'Email, ứng dụng và SMS']

// Màn 23 · Nhật ký hoạt động (bất biến) và thông báo.
export const ACTIVITY_LOG = [
  {
    id: 8,
    time: '22/10/2026 10:45',
    actor: 'Lê Thu Hà',
    actorRole: 'Kế toán',
    module: 'Yêu cầu chi',
    target: 'CHI-1024',
    action: 'Duyệt kế toán',
    detail: 'Chứng từ và tài khoản hợp lệ',
    status: 'DA_DUYET',
    diff: {
      before: { caption: 'TRƯỚC · 21/10/2026 14:30', rows: ['Trạng thái: Chờ kế toán', 'Số tiền: 48.000.000 VND', 'Kế toán duyệt: Chưa có'] },
      after: { caption: 'SAU · 22/10/2026 10:45', rows: ['Trạng thái: Chờ lãnh đạo', 'Số tiền: 48.000.000 VND', 'Kế toán duyệt: Lê Thu Hà'] },
    },
  },
  {
    id: 7,
    time: '22/10/2026 09:30',
    actor: 'Lê Thu Hà',
    actorRole: 'Kế toán',
    module: 'Thanh toán',
    target: 'GD-2210-01',
    action: 'Thực hiện chi',
    detail: 'CHI-1018 · 90.000.000 VND · Thuê VP tháng 11',
    status: 'THANH_CONG',
    diff: {
      before: { caption: 'TRƯỚC · 22/10/2026 09:28', rows: ['Thanh toán: Chờ chi', 'Đã chi: 0 VND'] },
      after: { caption: 'SAU · 22/10/2026 09:30', rows: ['Thanh toán: Đã thanh toán', 'Đã chi: 90.000.000 VND'] },
    },
  },
  { id: 6, time: '22/10/2026 08:55', actor: 'Hệ thống', actorRole: 'Auto', module: 'Thanh toán', target: 'GD-2210-03', action: 'Giao dịch thất bại', detail: 'Sai mã ngân hàng · CHI-1012', status: 'LOI', tone: 'danger' },
  {
    id: 5,
    time: '21/10/2026 14:30',
    actor: 'Trần Minh Đức',
    actorRole: 'Trưởng phòng',
    module: 'Yêu cầu chi',
    target: 'CHI-1024',
    action: 'Duyệt cấp phòng',
    detail: 'Đúng kế hoạch quý IV',
    status: 'DA_DUYET',
    diff: {
      before: { caption: 'TRƯỚC · 20/10/2026 09:15', rows: ['Trạng thái: Chờ trưởng phòng', 'Trưởng phòng duyệt: Chưa có'] },
      after: { caption: 'SAU · 21/10/2026 14:30', rows: ['Trạng thái: Chờ kế toán', 'Trưởng phòng duyệt: Trần Minh Đức'] },
    },
  },
  { id: 4, time: '21/10/2026 10:20', actor: 'Lê Thu Hà', actorRole: 'Kế toán', module: 'Yêu cầu chi', target: 'CHI-1024', action: 'Thẩm định kế toán', detail: 'Kiểm tra chứng từ và tài khoản thụ hưởng', status: 'HOAN_TAT' },
  { id: 3, time: '21/10/2026 09:00', actor: 'Hệ thống', actorRole: 'Auto', module: 'Ngân sách', target: 'Quý IV · Marketing', action: 'Cảnh báo vượt 80% ngân sách', detail: 'Đã sử dụng 400/500 triệu VND', status: 'CANH_BAO', tone: 'warning' },
  { id: 2, time: '20/10/2026 16:15', actor: 'Lê Thu Hà', actorRole: 'Kế toán', module: 'Quản lý thu', target: 'THU-1008', action: 'Ghi nhận thu một phần', detail: 'Nam Sơn · 80.000.000 VND còn lại', status: 'THU_MOT_PHAN' },
  {
    id: 1,
    time: '20/10/2026 09:15',
    actor: 'Nguyễn Mai Anh',
    actorRole: 'Nhân viên',
    module: 'Yêu cầu chi',
    target: 'CHI-1024',
    action: 'Gửi hồ sơ v1',
    detail: '48.000.000 VND · Chiến dịch thương hiệu quý IV',
    status: 'DA_GUI',
    diff: {
      before: { caption: 'TRƯỚC · 20/10/2026 09:14', rows: ['Trạng thái: Nháp', 'Số tiền: 48.000.000 VND', 'Người phê duyệt: Chưa có'] },
      after: { caption: 'SAU · 20/10/2026 09:15', rows: ['Trạng thái: Chờ trưởng phòng', 'Số tiền: 48.000.000 VND', 'Người phê duyệt: Trần Minh Đức'] },
    },
  },
]

export const NOTIFICATIONS = [
  {
    id: 1,
    tone: 'primary',
    kind: 'unread',
    category: 'Chờ lãnh đạo duyệt',
    time: '08:00 hôm nay',
    title: 'CHI-1024 · 48.000.000 VND cần Phạm Quốc Huy duyệt',
    description: 'Chiến dịch thương hiệu quý IV · Marketing · Nguyễn Mai Anh',
    actionLabel: 'Xem hồ sơ',
    path: '/expenses/CHI-1024',
  },
  {
    id: 2,
    tone: 'danger',
    kind: 'action',
    category: 'Thu / Chi lỗi',
    time: '08:55 hôm nay',
    title: 'GD-2210-03 thất bại · CHI-1012',
    description: 'Sai mã ngân hàng. Kiểm tra lại trước khi thực hiện lần hai để tránh chi kép.',
    actionLabel: 'Xử lý ngay',
    path: '/payments',
  },
  {
    id: 3,
    tone: 'warning',
    kind: 'due',
    category: 'Khoản thu quá hạn',
    time: 'Hôm qua',
    title: 'THU-1005 · Hòa Phát · Quá hạn 2 ngày',
    description: 'Còn 30.000.000 VND chưa thu. Liên hệ đối tác để xác nhận tiến độ thanh toán.',
    actionLabel: 'Xem khoản thu',
    path: '/income/THU-1005',
  },
  {
    id: 4,
    tone: 'warning',
    kind: 'due',
    category: 'Cần bổ sung',
    time: '21/10/2026',
    title: 'CHI-1027 · Thiếu hóa đơn VAT đính kèm',
    description: '36.000.000 VND · Kinh doanh · Đã duyệt cấp phòng nhưng kế toán yêu cầu bổ sung.',
    actionLabel: 'Mở hồ sơ',
    path: '/approvals/CHI-1027',
  },
  {
    id: 5,
    tone: 'warning',
    kind: 'due',
    category: 'Cảnh báo ngân sách',
    time: '21/10/2026',
    title: 'Marketing Quý IV đã dùng 80% ngân sách',
    description: '400/500 triệu VND đã chi và cam kết. Còn 100 triệu khả dụng trước khi kết thúc quý.',
    actionLabel: 'Xem ngân sách',
    path: '/budgets/marketing',
  },
  { id: 6, tone: 'success', kind: 'read', read: true, category: 'Duyệt cấp phòng', time: 'Đã đọc', title: 'CHI-1024 đã được Trần Minh Đức duyệt cấp phòng · 20/10/2026, 14:30' },
  { id: 7, tone: 'success', kind: 'read', read: true, category: 'Thẩm định kế toán', time: 'Đã đọc', title: 'CHI-1024 đã qua kế toán thẩm định · Lê Thu Hà · 21/10/2026, 10:20' },
]

// Màn 26–29 · Danh mục thu / chi dùng chung toàn doanh nghiệp.
export const CATEGORY_MODULES = [
  { value: 'THU', label: 'Thu', prefix: 'THU' },
  { value: 'CHI', label: 'Chi', prefix: 'CHI' },
]

// updatedAt dạng ISO để sắp xếp; usage = số giao dịch đang dùng danh mục (> 0 thì không được xóa).
export const CATEGORY_LIST = [
  { id: 'THU-001', code: 'THU-001', name: 'Doanh thu bán hàng', module: 'THU', status: 'DANG_SU_DUNG', usage: 128, description: 'Doanh thu từ bán sản phẩm và hàng hóa.', updatedAt: '2026-10-22', updatedBy: 'Lê Thu Hà' },
  { id: 'THU-002', code: 'THU-002', name: 'Doanh thu dịch vụ', module: 'THU', status: 'DANG_SU_DUNG', usage: 46, description: 'Doanh thu từ dịch vụ tư vấn và triển khai.', updatedAt: '2026-10-22', updatedBy: 'Lê Thu Hà' },
  { id: 'CHI-001', code: 'CHI-001', name: 'Marketing', module: 'CHI', status: 'DANG_SU_DUNG', usage: 32, description: 'Chi phí quảng cáo, truyền thông và các chiến dịch thương hiệu.', updatedAt: '2026-10-21', updatedBy: 'Lê Thu Hà' },
  { id: 'CHI-002', code: 'CHI-002', name: 'Nhân sự', module: 'CHI', status: 'DANG_SU_DUNG', usage: 84, description: 'Tuyển dụng, phúc lợi và hoạt động nhân sự.', updatedAt: '2026-10-20', updatedBy: 'Lê Thu Hà' },
  { id: 'CHI-003', code: 'CHI-003', name: 'Vận hành', module: 'CHI', status: 'DANG_SU_DUNG', usage: 57, description: 'Chi phí văn phòng, tiện ích và vận hành hằng ngày.', updatedAt: '2026-10-20', updatedBy: 'Lê Thu Hà' },
  { id: 'CHI-004', code: 'CHI-004', name: 'Công tác', module: 'CHI', status: 'DANG_SU_DUNG', usage: 12, description: 'Đi lại, lưu trú và phụ cấp công tác.', updatedAt: '2026-10-19', updatedBy: 'Lê Thu Hà' },
  { id: 'CHI-007', code: 'CHI-007', name: 'Đào tạo nội bộ', module: 'CHI', status: 'DANG_SU_DUNG', usage: 0, description: 'Khóa học, hội thảo và tài liệu đào tạo cho nhân viên.', updatedAt: '2026-10-18', updatedBy: 'Lê Thu Hà' },
  { id: 'CHI-008', code: 'CHI-008', name: 'Sự kiện', module: 'CHI', status: 'NGUNG_SU_DUNG', usage: 0, description: 'Tổ chức sự kiện nội bộ và sự kiện khách hàng.', updatedAt: '2026-10-17', updatedBy: 'Lê Thu Hà' },
  { id: 'THU-003', code: 'THU-003', name: 'Hoàn tạm ứng', module: 'THU', status: 'DANG_SU_DUNG', usage: 21, description: 'Nhân viên hoàn lại khoản tạm ứng chưa sử dụng hết.', updatedAt: '2026-10-15', updatedBy: 'Lê Thu Hà' },
  { id: 'THU-004', code: 'THU-004', name: 'Thanh lý tài sản', module: 'THU', status: 'NGUNG_SU_DUNG', usage: 3, description: 'Tiền thu từ thanh lý tài sản, thiết bị cũ.', updatedAt: '2026-10-12', updatedBy: 'Lê Thu Hà' },
  { id: 'CHI-005', code: 'CHI-005', name: 'Mua sắm thiết bị', module: 'CHI', status: 'DANG_SU_DUNG', usage: 19, description: 'Mua máy tính, thiết bị văn phòng và linh kiện.', updatedAt: '2026-10-10', updatedBy: 'Lê Thu Hà' },
  { id: 'CHI-006', code: 'CHI-006', name: 'Dịch vụ thuê ngoài', module: 'CHI', status: 'DANG_SU_DUNG', usage: 9, description: 'Thuê dịch vụ, chuyên gia và đối tác bên ngoài.', updatedAt: '2026-10-08', updatedBy: 'Lê Thu Hà' },
]
