// Quản trị hệ thống (màn 21, 22) và nhật ký – thông báo (màn 23).

// Danh mục quyền và ma trận vai trò lấy từ server: GET /permissions/catalog, GET /roles.

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
