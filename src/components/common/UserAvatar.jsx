import Avatar from '@mui/material/Avatar'
import { colors } from '../../theme/tokens'
import { getInitials } from '../../utils/format'

/** Avatar tròn hiển thị chữ cái đầu của họ tên. */
export default function UserAvatar({ name, size = 32, sx }) {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        fontWeight: 600,
        color: colors.primary,
        bgcolor: colors.primarySoft,
        ...sx,
      }}
    >
      {getInitials(name)}
    </Avatar>
  )
}
