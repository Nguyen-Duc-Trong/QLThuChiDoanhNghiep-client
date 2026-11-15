import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { Lock } from 'lucide-react'
import DataTable from './DataTable'
import TwoLineText from '../common/TwoLineText'
import { tones } from '../../theme/tokens'

function PermissionCell({ allowed, onToggle, lockedReason }) {
  const color = allowed ? tones.success : tones.neutral
  const clickable = Boolean(onToggle) && !lockedReason
  const cell = (
    <Box
      component={clickable ? 'button' : 'span'}
      type={clickable ? 'button' : undefined}
      onClick={clickable ? onToggle : undefined}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        width: '100%',
        minWidth: 44,
        border: 'none',
        font: 'inherit',
        fontSize: 11,
        fontWeight: 500,
        textAlign: 'left',
        px: 1,
        py: 0.5,
        borderRadius: 1,
        color: color.fg,
        bgcolor: color.bg,
        cursor: clickable ? 'pointer' : 'default',
        opacity: lockedReason ? 0.75 : 1,
      }}
    >
      {allowed ? 'Có' : 'Không'}
      {lockedReason && <Lock size={10} aria-hidden />}
    </Box>
  )
  return lockedReason ? (
    <Tooltip title={lockedReason} arrow>
      <span style={{ display: 'block' }}>{cell}</span>
    </Tooltip>
  ) : (
    cell
  )
}

/**
 * Ma trận quyền theo vai trò.
 * actions: [{ key, label }]
 * roles: [{ key, name, scope, permissions: { [actionKey]: boolean } }]
 * onToggle(roleKey, actionKey): truyền vào để cho phép bấm đổi quyền.
 * getLockedReason(role, actionKey): trả về chuỗi lý do nếu ô bị khóa (không bấm được, hiện tooltip), ngược lại falsy.
 */
export default function PermissionMatrix({ actions, roles, onToggle, getLockedReason }) {
  const columns = [
    { key: 'role', header: 'Vai trò', width: 140, render: (r) => <TwoLineText primary={r.name} secondary={`Phạm vi: ${r.scope}`} /> },
    ...actions.map((action) => ({
      key: action.key,
      header: action.label,
      render: (r) => (
        <PermissionCell
          allowed={Boolean(r.permissions[action.key])}
          onToggle={onToggle ? () => onToggle(r.key, action.key) : undefined}
          lockedReason={getLockedReason?.(r, action.key) || null}
        />
      ),
    })),
  ]

  return <DataTable columns={columns} rows={roles} rowKey="key" minWidth={140 + actions.length * 72} />
}
