import Box from '@mui/material/Box'
import DataTable from './DataTable'
import TwoLineText from '../common/TwoLineText'
import { tones } from '../../theme/tokens'

function PermissionCell({ allowed, onToggle }) {
  const color = allowed ? tones.success : tones.neutral
  return (
    <Box
      component={onToggle ? 'button' : 'span'}
      type={onToggle ? 'button' : undefined}
      onClick={onToggle}
      sx={{
        display: 'block',
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
        cursor: onToggle ? 'pointer' : 'default',
      }}
    >
      {allowed ? 'Có' : 'Không'}
    </Box>
  )
}

/**
 * Ma trận quyền theo vai trò.
 * actions: [{ key, label }]
 * roles: [{ key, name, scope, permissions: { [actionKey]: boolean } }]
 * onToggle(roleKey, actionKey): truyền vào để cho phép bấm đổi quyền.
 */
export default function PermissionMatrix({ actions, roles, onToggle }) {
  const columns = [
    { key: 'role', header: 'Vai trò', width: 140, render: (r) => <TwoLineText primary={r.name} secondary={`Phạm vi: ${r.scope}`} /> },
    ...actions.map((action) => ({
      key: action.key,
      header: action.label,
      render: (r) => (
        <PermissionCell
          allowed={Boolean(r.permissions[action.key])}
          onToggle={onToggle ? () => onToggle(r.key, action.key) : undefined}
        />
      ),
    })),
  ]

  return <DataTable columns={columns} rows={roles} rowKey="key" minWidth={140 + actions.length * 64} />
}
