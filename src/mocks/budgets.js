// Ngân sách theo kỳ, phòng ban, khoản mục (màn 17, 18, 19).

export const BUDGET_PERIOD_OPTIONS = [
  { value: 'Q4-2026', label: 'Quý IV/2026' },
  { value: 'Q3-2026', label: 'Quý III/2026' },
]

// Màn 17 · Ngân sách theo phòng ban / khoản mục.
export const DEPARTMENT_BUDGETS = [
  { id: 'marketing', department: 'Marketing', line: 'Truyền thông', total: 500_000_000, spent: 240_000_000, committed: 80_000_000, transactions: 12, approvedWaiting: 3 },
  { id: 'van-hanh', department: 'Vận hành', line: 'Thiết bị văn phòng', total: 150_000_000, spent: 120_000_000, committed: 10_000_000, transactions: 7, approvedWaiting: 1 },
  { id: 'nhan-su', department: 'Nhân sự', line: 'Đào tạo nội bộ', total: 80_000_000, spent: 75_000_000, committed: 5_000_000, transactions: 4, approvedWaiting: 1 },
]

// Thực tế so kế hoạch theo tháng (triệu VND).
export const PLAN_VS_ACTUAL = {
  actual: [36, 50, 44, 70, 61, 84],
  plan: [27, 34, 38, 47, 54, 64],
}

export const RELATED_REQUESTS = [
  { id: 'CHI-1024', amount: 48_000_000, department: 'Marketing', line: 'Truyền thông', step: 'Chờ lãnh đạo duyệt' },
  { id: 'CHI-1027', amount: 36_000_000, department: 'Marketing', line: 'Truyền thông', step: 'Chờ kế toán thẩm định' },
  { id: 'CHI-1028', amount: 22_000_000, department: 'Vận hành', line: 'Thiết bị văn phòng', step: 'Chờ trưởng phòng duyệt' },
]

// Màn 18 · Phân bổ đang soạn cho Quý IV/2026 (spent dùng để tính ngưỡng cảnh báo).
export const ALLOCATION_LIMIT = 500_000_000
export const ALLOCATION_THRESHOLD = 0.9
export const ALLOCATION_DEPARTMENTS = ['Marketing', 'Vận hành', 'Nhân sự', 'Kinh doanh', 'Công nghệ']
export const ALLOCATION_ROWS = [
  { department: 'Marketing', allocated: 180_000_000, committed: 40_000_000, spent: 100_000_000 },
  { department: 'Vận hành', allocated: 150_000_000, committed: 30_000_000, spent: 100_000_000 },
  { department: 'Nhân sự', allocated: 180_000_000, committed: 50_000_000, spent: 115_000_000 },
]
export const ALLOCATION_HISTORY = [
  { id: 3, date: '22/10/2026', actor: 'Lê Thu Hà', status: 'NHAP' },
  { id: 2, date: '21/10/2026', actor: 'Phạm Quốc Huy', status: 'TU_CHOI' },
  { id: 1, date: '20/10/2026', actor: 'Trần Minh Đức', status: 'HIEU_LUC' },
]

// Màn 19 · Chi tiết ngân sách phòng Marketing theo khoản mục.
export const MARKETING_LINES = [
  { id: 'truyen-thong', name: 'Truyền thông', ref: 'Quý IV/2026', plan: 500_000_000, spent: 240_000_000, committed: 80_000_000 },
  { id: 'mxh', name: 'Nội dung mạng xã hội', ref: 'CHI-1026', plan: 120_000_000, spent: 80_000_000, committed: 32_000_000 },
  { id: 'video', name: 'Sản xuất video', ref: 'CHI-1025', plan: 150_000_000, spent: 90_000_000, committed: 54_000_000 },
  { id: 'thiet-ke', name: 'Công cụ thiết kế', ref: 'CHI-1023', plan: 30_000_000, spent: 20_000_000, committed: 8_000_000 },
  { id: 'thuong-hieu', name: 'Chiến dịch thương hiệu', ref: 'CHI-1024', plan: 200_000_000, spent: 50_000_000, committed: 48_000_000 },
]

export const MARKETING_REQUESTS = [
  { id: 'CHI-1024', title: 'Chiến dịch thương hiệu quý IV', requester: 'Nguyễn Mai Anh', date: '20/10/2026', amount: 48_000_000, status: 'CHO_LANH_DAO' },
  { id: 'CHI-1025', title: 'Sản xuất video sản phẩm', requester: 'Vũ Minh Tuấn', date: '21/10/2026', amount: 54_000_000, status: 'DA_DUYET' },
  { id: 'CHI-1023', title: 'Công cụ thiết kế', requester: 'Đỗ Ngọc Linh', date: '21/10/2026', amount: 8_000_000, status: 'DA_DUYET' },
]

export const MARKETING_BUDGET_LOG = [
  '22/10/2026 · Cập nhật khả dụng sau khi kế toán đối chiếu hồ sơ CHI-1024.',
  '21/10/2026 · Cập nhật cam kết chưa chi sau khi trưởng phòng duyệt CHI-1025.',
  '20/10/2026 · Cập nhật khả dụng sau khi kế toán đối chiếu hồ sơ CHI-1023.',
]

/** Trạng thái hạn mức của một dòng ngân sách: hết, gần vượt (≥ ngưỡng), còn khả dụng. */
export function budgetStatus({ total, spent, committed }, threshold = 0.85) {
  const used = spent + committed
  if (used >= total) return 'HET_HAN_MUC'
  if (used / total >= threshold) return 'GAN_VUOT'
  return 'CON_KHA_DUNG'
}
