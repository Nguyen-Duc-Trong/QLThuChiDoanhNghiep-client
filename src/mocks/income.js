// Khoản thu (màn 05, 06, 07).

export const INCOME_SOURCES = ['Hoàn tạm ứng', 'Dịch vụ tư vấn', 'Bán hàng', 'Thanh lý tài sản', 'Khác']
export const INCOME_PAYERS = ['Nguyễn Mai Anh · NV-014', 'Đỗ Ngọc Linh · NV-021', 'Công ty CP Nam Sơn', 'Công ty Minh Long', 'Công ty Hòa Phát']
export const RECEIVING_ACCOUNTS = ['Quỹ tiền mặt · VND', 'Vietcombank · 0071001028', 'ACB · 8812']
export const BANK_REFERENCES = ['VCB-2210-5532', 'VCB-2210-5533', 'ACB-2210-0187']

export const INCOMES = [
  {
    id: 'THU-1008',
    title: 'HĐ dịch vụ NS-2026-08',
    customer: 'Công ty CP Nam Sơn',
    department: 'Kinh doanh',
    expected: 200_000_000,
    received: 120_000_000,
    dueDate: '2026-10-30',
    account: 'VCB · 1028',
    status: 'THU_MOT_PHAN',
  },
  { id: 'THU-1009', title: 'Hoàn tạm ứng sự kiện', customer: 'Nguyễn Mai Anh', department: 'Marketing', expected: 6_000_000, received: 0, dueDate: '2026-10-24', account: 'Quỹ tiền mặt', status: 'CHO_KIEM_TRA' },
  { id: 'THU-1007', title: 'Phí bảo trì quý IV', customer: 'Công ty Minh Long', department: 'Kinh doanh', expected: 64_000_000, received: 0, dueDate: '2026-10-28', account: 'VCB · 1028', status: 'CHO_THU' },
  { id: 'THU-1005', title: 'Dịch vụ tư vấn tháng 9', customer: 'Công ty Hòa Phát', department: 'Kinh doanh', expected: 30_000_000, received: 0, dueDate: '2026-10-20', account: 'VCB · 1028', status: 'QUA_HAN' },
  { id: 'THU-1003', title: 'Thanh lý thiết bị', customer: 'Công ty Tân Thành', department: 'Vận hành', expected: 45_000_000, received: 45_000_000, dueDate: '2026-10-18', account: 'ACB · 8812', status: 'DA_THU' },
  { id: 'THU-1010', title: 'Đề nghị hoàn ứng', customer: 'Đỗ Ngọc Linh', department: 'Marketing', expected: 3_500_000, received: 0, dueDate: '2026-10-26', account: 'Quỹ tiền mặt', status: 'CAN_BO_SUNG' },
  { id: 'THU-1006', title: 'Phí đào tạo đối tác', customer: 'Công ty Bình Minh', department: 'Kinh doanh', expected: 26_000_000, received: 0, dueDate: '2026-10-15', account: 'VCB · 1028', status: 'QUA_HAN' },
  { id: 'THU-1004', title: 'Bán hàng lô 10', customer: 'Công ty Hải Âu', department: 'Kinh doanh', expected: 88_000_000, received: 88_000_000, dueDate: '2026-10-12', account: 'VCB · 1028', status: 'DA_THU' },
  { id: 'THU-1002', title: 'Hoàn tạm ứng công tác', customer: 'Đỗ Huy Hoàng', department: 'Vận hành', expected: 4_200_000, received: 4_200_000, dueDate: '2026-10-08', account: 'Quỹ tiền mặt', status: 'DA_THU' },
  { id: 'THU-1001', title: 'Phí tư vấn tháng 8', customer: 'Công ty Minh Long', department: 'Kinh doanh', expected: 52_000_000, received: 20_000_000, dueDate: '2026-10-05', account: 'VCB · 1028', status: 'THU_MOT_PHAN' },
]

export const INCOME_DETAIL = {
  id: 'THU-1008',
  title: 'Dịch vụ Nam Sơn',
  contract: 'NS-2026-08',
  customer: 'Công ty CP Nam Sơn',
  department: 'Kinh doanh',
  source: 'Dịch vụ tư vấn',
  requester: 'Hoàng Hải Yến',
  account: 'Vietcombank · 0071001028',
  expectedDate: '2026-10-15',
  dueDate: '2026-10-30',
  total: 200_000_000,
  receipts: [
    { id: 'VCB-1510-8821', date: '2026-10-15', amount: 80_000_000, confirmedBy: 'Lê Thu Hà', matched: true },
    { id: 'VCB-2010-1940', date: '2026-10-20', amount: 40_000_000, confirmedBy: 'Lê Thu Hà', matched: true },
  ],
  attachments: [
    { name: 'Hợp đồng AV-MKT-10.pdf', meta: '1,2 MB · Nguyễn Mai Anh · 20/10/2026' },
    { name: 'Báo giá chiến dịch quý IV.pdf', meta: '486 KB · Nguyễn Mai Anh · 20/10/2026' },
  ],
  history: [
    { at: '20/10, 16:10', text: 'Lê Thu Hà xác nhận 40.000.000 VND, đính kèm sao kê.' },
    { at: '15/10, 10:24', text: 'Lê Thu Hà xác nhận 80.000.000 VND.' },
    { at: '14/10, 14:00', text: 'Kế toán kiểm tra hồ sơ → Chờ thu.' },
    { at: '13/10, 09:00', text: 'Hoàng Hải Yến gửi đề nghị v1.', muted: true },
  ],
}
