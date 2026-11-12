import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import EmptyState from '../common/EmptyState'
import { radius } from '../../theme/tokens'

/**
 * Bảng dữ liệu dùng chung.
 * columns: [{ key, header, align?, width?, render?(row) }]
 * - render không truyền thì hiển thị row[key].
 * loading / emptyState: hiển thị thay cho các dòng khi đang tải hoặc không có dữ liệu.
 */
export default function DataTable({
  columns,
  rows = [],
  rowKey = 'id',
  onRowClick,
  loading = false,
  emptyState = <EmptyState variant="empty" compact />,
  minWidth = 640,
  sx,
}) {
  const getKey = typeof rowKey === 'function' ? rowKey : (row) => row[rowKey]

  return (
    <TableContainer sx={{ overflowX: 'auto', ...sx }}>
      <Table sx={{ minWidth }}>
        <TableHead>
          <TableRow
            sx={{
              '& th:first-of-type': { borderTopLeftRadius: radius.md, borderBottomLeftRadius: radius.md },
              '& th:last-of-type': { borderTopRightRadius: radius.md, borderBottomRightRadius: radius.md },
            }}
          >
            {columns.map((col) => (
              <TableCell key={col.key} align={col.align} sx={{ width: col.width }}>
                {col.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading || rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} sx={{ borderBottom: 'none' }}>
                {loading ? <EmptyState variant="loading" compact /> : emptyState}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={getKey(row)}
                hover={Boolean(onRowClick)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{ cursor: onRowClick ? 'pointer' : undefined }}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} align={col.align}>
                    {col.render ? col.render(row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
