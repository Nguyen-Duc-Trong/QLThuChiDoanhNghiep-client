// Map mã trạng thái nghiệp vụ -> nhãn hiển thị + tông màu của StatusBadge.
// Thêm trạng thái mới ở đây thay vì truyền màu ở từng màn hình.
export const STATUS = {
  // Yêu cầu chi
  NHAP: { label: 'Nháp', tone: 'neutral' },
  DA_GUI: { label: 'Đã gửi', tone: 'info' },
  CHO_TRUONG_PHONG: { label: 'Chờ trưởng phòng', tone: 'warning' },
  CHO_KE_TOAN: { label: 'Chờ kế toán', tone: 'warning' },
  CHO_LANH_DAO: { label: 'Chờ lãnh đạo', tone: 'warning' },
  CAN_BO_SUNG: { label: 'Cần bổ sung', tone: 'warning' },
  DANG_CHO_XU_LY: { label: 'Đang chờ xử lý', tone: 'primary' },
  DA_DUYET: { label: 'Đã duyệt', tone: 'success' },
  CHO_CHI: { label: 'Chờ chi', tone: 'info' },
  CHI_MOT_PHAN: { label: 'Chi một phần', tone: 'warning' },
  DA_THANH_TOAN: { label: 'Đã thanh toán', tone: 'success' },
  TU_CHOI: { label: 'Từ chối', tone: 'danger' },
  HUY: { label: 'Hủy', tone: 'neutral' },
  THAT_BAI: { label: 'Thất bại', tone: 'danger' },

  // Khoản thu
  CHO_THU: { label: 'Chờ thu', tone: 'info' },
  THU_MOT_PHAN: { label: 'Thu 1 phần', tone: 'warning' },
  DA_THU: { label: 'Đã thu', tone: 'success' },
  QUA_HAN: { label: 'Quá hạn', tone: 'danger' },
  CHO_KIEM_TRA: { label: 'Chờ kế toán kiểm tra', tone: 'warning' },

  // Ngân sách
  TRONG_HAN_MUC: { label: 'Trong hạn mức', tone: 'success' },
  GAN_VUOT: { label: 'Gần vượt', tone: 'warning' },
  VUOT_HAN_MUC: { label: 'Vượt hạn mức', tone: 'danger' },

  // Người dùng / hệ thống
  HOAT_DONG: { label: 'Hoạt động', tone: 'success' },
  KHOA: { label: 'Khóa', tone: 'warning' },
  THANH_CONG: { label: 'Thành công', tone: 'success' },
  LOI: { label: 'Lỗi', tone: 'danger' },
  CANH_BAO: { label: 'Cảnh báo', tone: 'warning' },
  HOAN_TAT: { label: 'Hoàn tất', tone: 'success' },

  // Phê duyệt / thanh toán
  DA_DUYET_CUOI: { label: 'Đã duyệt cuối', tone: 'primary' },
  DANG_CHINH_SUA: { label: 'Đang chỉnh sửa', tone: 'primary' },
  CHO_DOI_SOAT: { label: 'Chờ đối soát', tone: 'warning' },
  DA_DOI_SOAT: { label: 'Đã đối soát', tone: 'success' },
  CON_KHA_DUNG: { label: 'Còn khả dụng', tone: 'success' },
  HET_HAN_MUC: { label: 'Hết hạn mức', tone: 'danger' },
  HIEU_LUC: { label: 'Hiệu lực', tone: 'success' },
  CHO_DUYET: { label: 'Chờ duyệt', tone: 'warning' },
  HOAN_THIEN: { label: 'Hoàn thiện', tone: 'success' },
  THIEU_NGUOI_DUYET: { label: 'Thiếu người duyệt', tone: 'warning' },

  // Danh mục
  DANG_SU_DUNG: { label: 'Đang sử dụng', tone: 'success' },
  NGUNG_SU_DUNG: { label: 'Ngừng sử dụng', tone: 'neutral' },
}
