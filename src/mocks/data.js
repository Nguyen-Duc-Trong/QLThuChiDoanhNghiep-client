// Dữ liệu mẫu theo thiết kế Figma — thay bằng gọi API khi nối backend (server/ NestJS).

export const DEMO_USERS = {
  NHAN_VIEN: { name: 'Nguyễn Mai Anh', email: 'maianh@anviet.vn', department: 'Marketing' },
  TRUONG_PHONG: { name: 'Trần Minh Đức', email: 'minhduc@anviet.vn', department: 'Marketing' },
  KE_TOAN: { name: 'Lê Thu Hà', email: 'thuha@anviet.vn', department: 'Kế toán' },
  LANH_DAO: { name: 'Phạm Quốc Huy', email: 'quochuy@anviet.vn', department: 'Ban Giám đốc' },
  ADMIN: { name: 'Lê Thu Hà', email: 'thuha@anviet.vn', department: 'Kế toán' },
}

export const MARKETING_BUDGET = {
  scope: 'Marketing · Truyền thông · Quý IV/2026',
  total: 500_000_000,
  spent: 240_000_000,
  committed: 80_000_000,
}

export const EXPENSE_CATEGORIES = ['Truyền thông', 'Công tác phí', 'Mua sắm thiết bị', 'Dịch vụ thuê ngoài', 'Sự kiện']
export const PROJECTS = ['AV Brand · AV-2026-04', 'Ra mắt sản phẩm · AV-2026-07', 'Không thuộc dự án']
export const BUDGET_PERIODS = ['Quý IV/2026', 'Quý I/2027']
export const BUDGET_LINES = ['Marketing / Truyền thông', 'Marketing / Sự kiện', 'Marketing / Nghiên cứu thị trường']
export const PAYMENT_METHODS = ['Chuyển khoản ngân hàng', 'Tiền mặt']
export const BANKS = ['Vietcombank · CN Tân Định', 'Techcombank · CN Hội sở', 'BIDV · CN Sở Giao dịch 1']

export const EXPENSES = [
  {
    id: 'CHI-1024',
    title: 'Chiến dịch thương hiệu quý IV',
    amount: 48_000_000,
    status: 'CHO_LANH_DAO',
    paymentStatus: 'Chưa đủ điều kiện',
    dueDate: '2026-10-25',
    createdAt: '2026-10-20T09:15:00',
    createdBy: 'Nguyễn Mai Anh',
    department: 'Marketing',
    project: 'AV Brand',
    version: 1,
    category: 'Truyền thông',
    method: 'Chuyển khoản',
    period: 'Quý IV/2026',
    budgetLine: 'Truyền thông',
    beneficiary: 'Công ty TNHH Sao Việt',
    bank: 'Vietcombank',
    accountNumber: '0071008855123',
    accountName: 'CONG TY TNHH SAO VIET',
    purpose: 'Triển khai chiến dịch thương hiệu quý IV trên các kênh số theo hợp đồng AV-MKT-10. Thanh toán trọn gói sau nghiệm thu.',
    attachments: [
      { name: 'Hợp đồng AV-MKT-10.pdf', meta: '1,2 MB · Nguyễn Mai Anh · 20/10/2026' },
      { name: 'Báo giá chiến dịch quý IV.pdf', meta: '486 KB · Nguyễn Mai Anh · 20/10/2026' },
    ],
    accountantVerified: true,
    approvalStep: 3, // số bước đã hoàn tất (0..5)
    approvals: [
      { title: 'Nhân viên gửi yêu cầu', actor: 'Nguyễn Mai Anh', at: '20/10/2026, 09:15' },
      { title: 'Trưởng phòng phê duyệt', actor: 'Trần Minh Đức', at: '20/10/2026, 14:30' },
      { title: 'Kế toán thẩm định', actor: 'Lê Thu Hà', at: '21/10/2026, 10:20' },
      { title: 'Lãnh đạo duyệt cuối', actor: 'Phạm Quốc Huy' },
      { title: 'Kế toán thực hiện chi', note: 'Chỉ sau đủ ba phê duyệt' },
    ],
    history: [
      { id: 3, time: '21/10/2026 10:20', actor: 'Lê Thu Hà', action: 'Duyệt kế toán · Chứng từ và tài khoản hợp lệ.' },
      { id: 2, time: '20/10/2026 14:30', actor: 'Trần Minh Đức', action: 'Duyệt cấp phòng · Đúng kế hoạch quý IV.' },
      { id: 1, time: '20/10/2026 09:15', actor: 'Nguyễn Mai Anh', action: 'Gửi hồ sơ v1 · 48.000.000 VND.' },
    ],
  },
  { id: 'CHI-1021', title: 'Thiết kế ấn phẩm sự kiện', amount: 18_000_000, status: 'CAN_BO_SUNG', dueDate: '2026-10-26', createdAt: '2026-10-19T10:02:00', approvalStep: 2 },
  { id: 'CHI-1019', title: 'Công tác phí Đà Nẵng', amount: 8_500_000, status: 'NHAP', dueDate: '2026-10-28', createdAt: '2026-10-18T15:40:00', approvalStep: 0 },
  { id: 'CHI-1016', title: 'Dịch vụ nghiên cứu thị trường', amount: 24_000_000, status: 'DA_THANH_TOAN', dueDate: '2026-10-18', createdAt: '2026-10-10T08:30:00', approvalStep: 5 },
  { id: 'CHI-1014', title: 'Tài trợ hội thảo đối tác', amount: 12_000_000, status: 'TU_CHOI', dueDate: '2026-10-17', createdAt: '2026-10-08T11:05:00', approvalStep: 1 },
  { id: 'CHI-1011', title: 'In ấn tài liệu bán hàng', amount: 6_200_000, status: 'DA_THANH_TOAN', dueDate: '2026-10-12', createdAt: '2026-10-05T09:00:00', approvalStep: 5 },
  { id: 'CHI-1008', title: 'Quảng cáo mạng xã hội tháng 10', amount: 30_000_000, status: 'DA_THANH_TOAN', dueDate: '2026-10-05', createdAt: '2026-09-28T14:20:00', approvalStep: 5 },
  { id: 'CHI-1005', title: 'Thuê địa điểm workshop', amount: 15_800_000, status: 'DA_THANH_TOAN', dueDate: '2026-10-02', createdAt: '2026-09-25T16:45:00', approvalStep: 5 },
]

export function findExpense(id) {
  return EXPENSES.find((e) => e.id === id)
}

export const SYSTEM_USERS = [
  { id: 1, name: 'Lê Thu Hà', email: 'thuha@anviet.vn', department: 'Kế toán', role: 'Kế toán', status: 'HOAT_DONG', lastLogin: '22/10/2026 09:12' },
  { id: 2, name: 'Nguyễn Mai Anh', email: 'maianh@anviet.vn', department: 'Marketing', role: 'Nhân viên', status: 'HOAT_DONG', lastLogin: '21/10/2026 16:40' },
  { id: 3, name: 'Trần Minh Đức', email: 'minhduc@anviet.vn', department: 'Marketing', role: 'Trưởng phòng', status: 'HOAT_DONG', lastLogin: '20/10/2026 14:30' },
  { id: 4, name: 'Phạm Quốc Huy', email: 'quochuy@anviet.vn', department: 'Ban Giám đốc', role: 'Lãnh đạo', status: 'HOAT_DONG', lastLogin: '19/10/2026 18:05' },
  { id: 5, name: 'Nguyễn Thị Lan', email: 'lannt@anviet.vn', department: 'Kế toán', role: 'Kế toán', status: 'KHOA', lastLogin: '18/10/2026 09:20' },
  { id: 6, name: 'Đỗ Huy Hoàng', email: 'huyhoang@anviet.vn', department: 'Vận hành', role: 'Nhân viên', status: 'HOAT_DONG', lastLogin: '17/10/2026 11:15' },
  { id: 7, name: 'Đỗ Ngọc Linh', email: 'ngoclinh@anviet.vn', department: 'Marketing', role: 'Nhân viên', status: 'HOAT_DONG', lastLogin: '22/10/2026 08:02' },
  { id: 8, name: 'Vũ Minh Tuấn', email: 'minhtuan@anviet.vn', department: 'Marketing', role: 'Nhân viên', status: 'KHOA', lastLogin: '12/10/2026 10:47' },
]

export const DEPARTMENTS = ['Marketing', 'Kế toán', 'Vận hành', 'Ban Giám đốc']
export const ROLE_LABELS = ['Nhân viên', 'Trưởng phòng', 'Kế toán', 'Lãnh đạo', 'Admin']
