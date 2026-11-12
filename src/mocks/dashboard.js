// Số liệu cho các màn Tổng quan theo vai trò (02, 03, 04).

export const MONTHS = ['T5', 'T6', 'T7', 'T8', 'T9', 'T10']

// Đơn vị: triệu VND.
export const DEPARTMENT_SPENDING = {
  spent: [36, 50, 44, 70, 61, 84],
  committed: [27, 34, 38, 47, 54, 64],
}

export const CASH_FLOW = {
  income: [1020, 1410, 1240, 1980, 1720, 1860],
  expense: [760, 960, 1070, 1340, 1520, 1420],
}

// Dự báo số dư cuối kỳ 22/10 → 30/11 (triệu VND).
export const BALANCE_FORECAST = {
  labels: ['22/10', '26/10', '31/10', '04/11', '08/11', '11/11', '15/11', '19/11', '23/11', '27/11', '30/11'],
  values: [2680, 2760, 2900, 2990, 2930, 2960, 3080, 3190, 3170, 3240, 3250],
  closing: 3240,
}

export const DEPARTMENT_QUEUE = [
  { id: 'CHI-1026', title: 'Nội dung mạng xã hội', requester: 'Đỗ Ngọc Linh', submittedAt: '2026-10-22', amount: 32_000_000, dueDate: '2026-10-24' },
  { id: 'CHI-1025', title: 'Sản xuất video sản phẩm', requester: 'Vũ Minh Tuấn', submittedAt: '2026-10-21', amount: 54_000_000, dueDate: '2026-10-25' },
  { id: 'CHI-1023', title: 'Công cụ thiết kế', requester: 'Đỗ Ngọc Linh', submittedAt: '2026-10-21', amount: 8_000_000, dueDate: '2026-10-27' },
  { id: 'CHI-1030', title: 'Quà tặng khách hàng sự kiện', requester: 'Nguyễn Mai Anh', submittedAt: '2026-10-20', amount: 20_000_000, dueDate: '2026-10-29' },
  { id: 'CHI-1031', title: 'Thuê nhiếp ảnh sự kiện', requester: 'Vũ Minh Tuấn', submittedAt: '2026-10-19', amount: 12_000_000, dueDate: '2026-10-30' },
]

export const DUE_PAYMENTS = [
  { id: 'CHI-1012', title: 'Sản xuất gian hàng triển lãm', remaining: 60_000_000, dueDate: '2026-10-23', status: 'CHI_MOT_PHAN' },
  { id: 'CHI-1018', title: 'Thuê văn phòng tháng 11', remaining: 90_000_000, dueDate: '2026-10-25', status: 'CHO_CHI' },
]

export const ACCOUNTING_QUEUE_PREVIEW = [
  { id: 'CHI-1027', amount: 36_000_000, department: 'Kinh doanh' },
  { id: 'CHI-1028', amount: 22_000_000, department: 'Vận hành' },
]

export const RECEIVABLES_TO_WATCH = [
  { id: 'THU-1008', customer: 'Nam Sơn', note: 'Còn 80.000.000 VND · Thu một phần' },
  { id: 'THU-1005', customer: 'Hòa Phát', note: '30.000.000 VND · Quá hạn 2 ngày' },
]

export const FINAL_APPROVAL_QUEUE = [
  { id: 'CHI-1024', title: 'Chiến dịch thương hiệu', requester: 'Nguyễn Mai Anh', dueDate: '2026-10-25', department: 'Marketing', amount: 48_000_000, budget: 'TRONG_HAN_MUC' },
  { id: 'CHI-1020', title: 'Nâng cấp máy chủ', requester: 'Bùi Văn Long', dueDate: '2026-10-27', department: 'Công nghệ', amount: 140_000_000, budget: 'GAN_VUOT' },
]
