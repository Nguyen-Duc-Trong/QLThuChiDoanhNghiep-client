import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  AppAlert,
  ArrowLink,
  DataTable,
  EmptyState,
  FilterBar,
  FilterSelect,
  PageHeader,
  SearchInput,
  SectionCard,
  StatusBadge,
  TwoLineText,
} from '../../components'
import { formatDate, formatMoney } from '../../utils/format'

// Hàng chờ của kế toán (thẩm định) và lãnh đạo (duyệt cuối); bấm một hồ sơ để mở màn 12 / 13.
export default function ApprovalQueuePage({ eyebrow, title, description, rows, notice, showBudget = false }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')

  const departmentOptions = [{ value: '', label: 'Tất cả phòng ban' }, ...[...new Set(rows.map((r) => r.department))].map((d) => ({ value: d, label: d }))]

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return rows.filter(
      (r) => (!department || r.department === department) && (!keyword || `${r.id} ${r.title} ${r.requester}`.toLowerCase().includes(keyword)),
    )
  }, [rows, search, department])

  const columns = [
    { key: 'id', header: 'Yêu cầu / Người tạo', render: (r) => <TwoLineText primary={`${r.id} · ${r.title}`} secondary={`Cần chi ${formatDate(r.dueDate)} · ${r.requester}`} /> },
    { key: 'department', header: 'Phòng ban', width: 140 },
    { key: 'amount', header: 'Số tiền', align: 'right', width: 160, render: (r) => formatMoney(r.amount) },
    ...(showBudget ? [{ key: 'budget', header: 'Ngân sách', width: 140, render: (r) => <StatusBadge status={r.budget} /> }] : []),
    { key: 'action', header: 'Thao tác', width: 110, render: (r) => <ArrowLink onClick={() => navigate(`/approvals/${r.id}`)}>Xem xét</ArrowLink> },
  ]

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <FilterBar search={<SearchInput value={search} onChange={setSearch} placeholder="Tìm mã, nội dung hoặc người tạo" width="100%" sx={{ flex: 1 }} />}>
        <FilterSelect value={department} options={departmentOptions} onChange={setDepartment} />
      </FilterBar>

      <SectionCard title={`Hàng chờ (${filtered.length})`} sx={{ mb: 3 }}>
        <DataTable
          columns={columns}
          rows={filtered}
          onRowClick={(r) => navigate(`/approvals/${r.id}`)}
          emptyState={<EmptyState compact variant={search || department ? 'no-results' : 'empty'} title="Không có hồ sơ chờ" />}
        />
      </SectionCard>

      {notice && (
        <AppAlert tone="info" title={notice.title}>
          {notice.message}
        </AppAlert>
      )}
    </>
  )
}
