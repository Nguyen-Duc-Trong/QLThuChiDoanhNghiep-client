import usePermission from '../../hooks/usePermission'

/**
 * Chỉ hiện children khi có ít nhất một quyền trong `permission` (chuỗi hoặc mảng).
 * <Can permission={PERMS.INCOME_CREATE}><Button>Tạo khoản thu</Button></Can>
 * Ẩn nút chỉ là giao diện; server vẫn tự kiểm tra quyền ở từng API.
 */
export default function Can({ permission, fallback = null, children }) {
  return usePermission(permission) ? children : fallback
}
