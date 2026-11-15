import { useSelector } from 'react-redux'
import { hasAnyPermission } from '../constants/permissions'
import { selectPermissions } from '../store/slices/sessionSlice'

/**
 * Có ít nhất một trong các quyền không (quyền hiệu lực của người đang đăng nhập: vai trò + quyền riêng).
 * const canCreate = usePermission(PERMS.INCOME_CREATE)
 */
export default function usePermission(...permissions) {
  const owned = useSelector(selectPermissions)
  return hasAnyPermission(owned, permissions.flat())
}
