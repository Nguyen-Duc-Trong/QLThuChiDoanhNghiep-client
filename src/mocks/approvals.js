// Hồ sơ trong luồng phê duyệt và thực hiện chi (màn 11–16).

const CONTRACT_FILES = [
  { name: 'Hợp đồng AV-MKT-10.pdf', meta: '1,2 MB · Nguyễn Mai Anh · 20/10/2026' },
  { name: 'Báo giá chiến dịch quý IV.pdf', meta: '486 KB · Nguyễn Mai Anh · 20/10/2026' },
]

// Màn 11 · Hàng chờ cấp phòng (trưởng phòng Marketing).
export const DEPARTMENT_QUEUE = [
  {
    id: 'CHI-1026',
    title: 'Nội dung mạng xã hội',
    requester: 'Đỗ Ngọc Linh',
    amount: 32_000_000,
    dueDate: '2026-10-24',
    submittedAt: '22/10',
    purpose: 'Sản xuất và đăng tải 16 nội dung truyền thông sản phẩm mới trong tháng 11, thuộc dự án AV Brand.',
    budgetLine: 'Truyền thông / Quý IV/2026',
    beneficiary: 'Công ty TNHH Truyền thông Mây',
    attachments: CONTRACT_FILES,
    history: '22/10/2026, 08:40 · Đỗ Ngọc Linh gửi phiên bản v1. Chưa có quyết định cấp phòng.',
  },
  {
    id: 'CHI-1025',
    title: 'Sản xuất video',
    requester: 'Vũ Minh Tuấn',
    amount: 54_000_000,
    dueDate: '2026-10-25',
    submittedAt: '21/10',
    purpose: 'Sản xuất 3 video giới thiệu sản phẩm cho chiến dịch ra mắt quý IV.',
    budgetLine: 'Truyền thông / Quý IV/2026',
    beneficiary: 'Công ty CP Phim Ánh Dương',
    attachments: [{ name: 'Báo giá sản xuất video.pdf', meta: '620 KB · Vũ Minh Tuấn · 21/10/2026' }],
    history: '21/10/2026, 15:20 · Vũ Minh Tuấn gửi phiên bản v1. Chưa có quyết định cấp phòng.',
  },
  {
    id: 'CHI-1023',
    title: 'Công cụ thiết kế',
    requester: 'Đỗ Ngọc Linh',
    amount: 8_000_000,
    dueDate: '2026-10-27',
    submittedAt: '21/10',
    purpose: 'Gia hạn bản quyền công cụ thiết kế cho nhóm nội dung trong 12 tháng.',
    budgetLine: 'Truyền thông / Quý IV/2026',
    beneficiary: 'Công ty TNHH Phần mềm Sáng Tạo',
    attachments: [{ name: 'Báo giá bản quyền.pdf', meta: '210 KB · Đỗ Ngọc Linh · 21/10/2026' }],
    history: '21/10/2026, 10:05 · Đỗ Ngọc Linh gửi phiên bản v1. Chưa có quyết định cấp phòng.',
  },
  {
    id: 'CHI-1022',
    title: 'Quà tặng đối tác',
    requester: 'Vũ Minh Tuấn',
    amount: 20_000_000,
    dueDate: '2026-10-29',
    submittedAt: '20/10',
    purpose: 'Quà tặng đối tác chiến lược nhân dịp hội nghị khách hàng cuối năm.',
    budgetLine: 'Sự kiện / Quý IV/2026',
    beneficiary: 'Công ty TNHH Quà Việt',
    attachments: [{ name: 'Danh sách quà tặng.xlsx', meta: '48 KB · Vũ Minh Tuấn · 20/10/2026' }],
    history: '20/10/2026, 16:30 · Vũ Minh Tuấn gửi phiên bản v1. Chưa có quyết định cấp phòng.',
  },
  {
    id: 'CHI-1017',
    title: 'In catalogue',
    requester: 'Nguyễn Mai Anh',
    amount: 12_000_000,
    dueDate: '2026-10-30',
    submittedAt: '19/10',
    purpose: 'In 2.000 cuốn catalogue sản phẩm phục vụ hội chợ tháng 11.',
    budgetLine: 'Truyền thông / Quý IV/2026',
    beneficiary: 'Công ty TNHH In ấn Hưng Phát',
    attachments: [{ name: 'Báo giá in ấn.pdf', meta: '180 KB · Nguyễn Mai Anh · 19/10/2026' }],
    history: '19/10/2026, 09:10 · Nguyễn Mai Anh gửi phiên bản v1. Chưa có quyết định cấp phòng.',
  },
]

export const DEPARTMENT_AVAILABLE = 180_000_000

// Hồ sơ CHI-1024 dùng cho thẩm định kế toán (12), duyệt cuối (13), thực hiện chi (15).
export const CHI_1024 = {
  id: 'CHI-1024',
  title: 'Chiến dịch thương hiệu quý IV',
  requester: 'Nguyễn Mai Anh',
  department: 'Marketing',
  amount: 48_000_000,
  dueDate: '2026-10-25',
  version: 1,
  project: 'AV Brand',
  purpose:
    'Triển khai chiến dịch thương hiệu quý IV theo hợp đồng AV-MKT-10. Thuộc kế hoạch truyền thông đã phân bổ, thụ hưởng Công ty TNHH Sao Việt.',
  category: 'Truyền thông',
  method: 'Chuyển khoản',
  period: 'Quý IV/2026',
  budgetLine: 'Truyền thông',
  beneficiary: 'Công ty TNHH Sao Việt',
  bank: 'Vietcombank',
  branch: 'Tân Định',
  accountNumber: '0071008855123',
  accountName: 'CONG TY TNHH SAO VIET',
  invoice: '000126 · 19/10/2026',
  taxCode: '0312345678',
  attachments: CONTRACT_FILES,
  deptApproval: { actor: 'Trần Minh Đức', at: '20/10/2026, 14:30', note: 'Đúng kế hoạch quý IV, mục tiêu và phạm vi phù hợp.' },
  accountingApproval: { actor: 'Lê Thu Hà', at: '21/10/2026, 10:20', note: '5/5 mục kiểm tra hoàn tất. Tài khoản và chứng từ hợp lệ, không trùng.' },
  finalApproval: { actor: 'Phạm Quốc Huy', at: '22/10/2026, 08:40' },
}

export const REVIEW_CHECKLIST = [
  { key: 'documents', label: 'Chứng từ hợp lệ', description: 'Hợp đồng, báo giá và hóa đơn khớp 48.000.000 VND.' },
  { key: 'period', label: 'Đúng kỳ và khoản mục', description: 'Quý IV/2026 · Marketing / Truyền thông.' },
  { key: 'budget', label: 'Ngân sách còn đủ', description: 'Khả dụng 180.000.000 VND, không tính trùng cam kết.' },
  { key: 'beneficiary', label: 'Người thụ hưởng đã xác minh', description: 'Sao Việt · VCB 0071008855123 · Tên tài khoản trùng hợp đồng.' },
  { key: 'duplicate', label: 'Không trùng hồ sơ / giao dịch', description: 'Chưa phát hiện yêu cầu trùng số hóa đơn và nhà cung cấp.' },
]

// Hàng chờ của kế toán (thẩm định) và lãnh đạo (duyệt cuối).
export const ACCOUNTING_QUEUE = [
  { id: 'CHI-1024', title: 'Chiến dịch thương hiệu quý IV', requester: 'Nguyễn Mai Anh', department: 'Marketing', amount: 48_000_000, dueDate: '2026-10-25' },
  { id: 'CHI-1027', title: 'Hội nghị khách hàng miền Nam', requester: 'Phan Văn Khánh', department: 'Kinh doanh', amount: 36_000_000, dueDate: '2026-10-26' },
  { id: 'CHI-1028', title: 'Bảo trì xe giao hàng', requester: 'Đỗ Huy Hoàng', department: 'Vận hành', amount: 22_000_000, dueDate: '2026-10-28' },
]

export const FINAL_QUEUE = [
  { id: 'CHI-1024', title: 'Chiến dịch thương hiệu quý IV', requester: 'Nguyễn Mai Anh', department: 'Marketing', amount: 48_000_000, dueDate: '2026-10-25', budget: 'TRONG_HAN_MUC' },
  { id: 'CHI-1020', title: 'Nâng cấp máy chủ', requester: 'Bùi Văn Long', department: 'Công nghệ', amount: 140_000_000, dueDate: '2026-10-27', budget: 'GAN_VUOT' },
  { id: 'CHI-1019', title: 'Thuê kho bãi quý IV', requester: 'Đỗ Huy Hoàng', department: 'Vận hành', amount: 60_000_000, dueDate: '2026-10-30', budget: 'TRONG_HAN_MUC' },
  { id: 'CHI-1015', title: 'Tuyển dụng nhân sự kinh doanh', requester: 'Phan Văn Khánh', department: 'Kinh doanh', amount: 20_000_000, dueDate: '2026-11-02', budget: 'TRONG_HAN_MUC' },
]

export const COMPANY_BALANCE = 2_680_000_000

// Màn 14 · Yêu cầu bổ sung của lãnh đạo và bản v2 đang sửa.
export const CHANGE_REQUEST = {
  requestedBy: 'Phạm Quốc Huy',
  requestedAt: '22/10/2026, 11:15',
  reason: 'Thiếu biên bản nghiệm thu',
  fields: ['Đính kèm biên bản nghiệm thu', 'Cập nhật ngày nghiệm thu', 'Ghi rõ số tiền nghiệm thu'],
}

export const RESUBMIT_HISTORY = [
  { id: 5, time: '22/10/2026 11:40', actor: 'Nguyễn Mai Anh', action: 'Bản nháp v2 · Đang bổ sung biên bản nghiệm thu, chưa gửi lại.' },
  { id: 4, time: '22/10/2026 11:15', actor: 'Phạm Quốc Huy', action: 'Yêu cầu bổ sung · Thiếu biên bản nghiệm thu.' },
  { id: 3, time: '21/10/2026 10:20', actor: 'Lê Thu Hà', action: 'Duyệt kế toán · Chứng từ và tài khoản hợp lệ.' },
  { id: 2, time: '20/10/2026 14:30', actor: 'Trần Minh Đức', action: 'Duyệt cấp phòng · Đúng kế hoạch quý IV.' },
  { id: 1, time: '20/10/2026 09:15', actor: 'Nguyễn Mai Anh', action: 'Gửi hồ sơ v1 · 48.000.000 VND.' },
]

export const ACCEPTANCE_FILE = { name: 'Biên bản nghiệm thu v1.pdf', size: 327_680 }

// Màn 15–16 · Giao dịch thanh toán.
export const PAYMENT_SOURCES = ['Quỹ chính', 'Quỹ dự phòng']
export const PAYMENT_BANKS = ['Vietcombank', 'Techcombank', 'BIDV']

export const TRANSACTIONS = [
  { id: 'GD-2210-01', expenseId: 'CHI-1012', round: '1/1', source: 'Vietcombank', beneficiary: 'Công ty TNHH Sao Việt', amount: 60_000_000, time: '22/10/2026 09:15', actor: 'Lê Thu Hà', bankRef: '0071008855123', status: 'THANH_CONG', reconcile: 'DA_DOI_SOAT' },
  { id: 'GD-2210-02', expenseId: 'CHI-1018', round: '1/1', source: 'Vietcombank', beneficiary: 'Công ty CP An Việt', amount: 90_000_000, time: '22/10/2026 10:30', actor: 'Lê Thu Hà', bankRef: '0071008855123', status: 'THANH_CONG', reconcile: 'DA_DOI_SOAT' },
  {
    id: 'GD-2210-03',
    expenseId: 'CHI-1024',
    round: '1/1',
    source: 'Vietcombank',
    beneficiary: 'Công ty TNHH Sao Việt',
    amount: 48_000_000,
    time: '22/10/2026 11:10',
    actor: 'Lê Thu Hà',
    bankRef: '0071008855123',
    status: 'LOI',
    reconcile: 'CHO_DOI_SOAT',
    error: 'Mã ngân hàng không khớp với hồ sơ đã duyệt.',
  },
  { id: 'GD-2210-04', expenseId: 'CHI-1027', round: '1/1', source: 'Vietcombank', beneficiary: 'Công ty TNHH Sao Việt', amount: 36_000_000, time: '22/10/2026 13:45', actor: 'Lê Thu Hà', bankRef: '0071008855123', status: 'CHO_DOI_SOAT', reconcile: 'CHO_DOI_SOAT' },
  { id: 'GD-2210-05', expenseId: 'CHI-1028', round: '1/1', source: 'Vietcombank', beneficiary: 'Công ty TNHH Sao Việt', amount: 22_000_000, time: '22/10/2026 14:20', actor: 'Lê Thu Hà', bankRef: '0071008855123', status: 'THANH_CONG', reconcile: 'DA_DOI_SOAT' },
  { id: 'GD-2210-06', expenseId: 'CHI-1031', round: '1/1', source: 'Vietcombank', beneficiary: 'Công ty TNHH Sao Việt', amount: 15_000_000, time: '22/10/2026 15:05', actor: 'Lê Thu Hà', bankRef: '0071008855123', status: 'THANH_CONG', reconcile: 'DA_DOI_SOAT' },
  { id: 'GD-2210-07', expenseId: 'CHI-1032', round: '1/1', source: 'Techcombank', beneficiary: 'Công ty TNHH Sao Việt', amount: 12_000_000, time: '22/10/2026 16:30', actor: 'Lê Thu Hà', bankRef: '0071008855123', status: 'CHO_DOI_SOAT', reconcile: 'CHO_DOI_SOAT' },
  { id: 'GD-2210-08', expenseId: 'CHI-1033', round: '1/1', source: 'Vietcombank', beneficiary: 'Công ty TNHH Sao Việt', amount: 8_000_000, time: '22/10/2026 17:10', actor: 'Lê Thu Hà', bankRef: '0071008855123', status: 'THANH_CONG', reconcile: 'DA_DOI_SOAT' },
  { id: 'GD-2210-09', expenseId: 'CHI-1034', round: '1/1', source: 'Vietcombank', beneficiary: 'Công ty TNHH Sao Việt', amount: 5_000_000, time: '22/10/2026 18:00', actor: 'Lê Thu Hà', bankRef: '0071008855123', status: 'THANH_CONG', reconcile: 'DA_DOI_SOAT' },
  { id: 'GD-2110-11', expenseId: 'CHI-1011', round: '1/1', source: 'Techcombank', beneficiary: 'Công ty TNHH In ấn Hưng Phát', amount: 6_200_000, time: '21/10/2026 16:40', actor: 'Lê Thu Hà', bankRef: '1903456789012', status: 'THANH_CONG', reconcile: 'DA_DOI_SOAT' },
  { id: 'GD-2110-10', expenseId: 'CHI-1016', round: '1/1', source: 'Vietcombank', beneficiary: 'Công ty TNHH Nghiên cứu thị trường Việt', amount: 24_000_000, time: '21/10/2026 11:25', actor: 'Lê Thu Hà', bankRef: '0071000123456', status: 'THANH_CONG', reconcile: 'DA_DOI_SOAT' },
  { id: 'GD-2110-09', expenseId: 'CHI-1013', round: '2/2', source: 'Vietcombank', beneficiary: 'Công ty CP Sự kiện Kim Cương', amount: 30_000_000, time: '21/10/2026 09:05', actor: 'Lê Thu Hà', bankRef: '0071000987654', status: 'LOI', reconcile: 'CHO_DOI_SOAT', error: 'Tài khoản thụ hưởng tạm khóa, ngân hàng hoàn tiền.' },
]
