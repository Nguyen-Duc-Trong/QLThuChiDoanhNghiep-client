import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CalendarDays, Download } from 'lucide-react'
import {
  CounterTile,
  CustomTab,
  DataTable,
  EmptyState,
  FilterBar,
  FilterChip,
  FilterSelect,
  NotificationItem,
  PageHeader,
  SectionCard,
  StateDiff,
  StatusBadge,
  TwoLineText,
  useToast,
} from '../components'
import { ACTIVITY_LOG, NOTIFICATIONS } from '../mocks/admin'
import { selectCurrentUser } from '../store/slices/sessionSlice'
import { tones } from '../theme/tokens'

// Màn 23 · Nhật ký hoạt động (bất biến) và trung tâm thông báo, hiển thị theo quyền.
const toOptions = (all, values) => [{ value: '', label: all }, ...[...new Set(values)].map((v) => ({ value: v, label: v }))]
const PERIOD_OPTIONS = [
  { value: '2026-10', label: 'Tháng 10/2026' },
  { value: '2026-09', label: 'Tháng 9/2026' },
]
// Mốc "7 ngày gần nhất" tính từ ngày dữ liệu mẫu 22/10/2026.
const RECENT_FROM = '2026-10-16'
const toIsoDate = (time) => time.slice(0, 10).split('/').reverse().join('-')

const COUNTER_FILTERS = {
  unread: (n) => !n.read,
  due: (n) => n.kind === 'due' && !n.read,
  action: (n) => n.kind === 'action' && !n.read,
}

export default function ActivityPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const user = useSelector(selectCurrentUser)
  const [tab, setTab] = useState('log')
  const [person, setPerson] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')
  const [action, setAction] = useState('')
  const [period, setPeriod] = useState('2026-10')
  const [recentOnly, setRecentOnly] = useState(true)
  const [selectedId, setSelectedId] = useState(ACTIVITY_LOG.find((e) => e.diff)?.id)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const [counterFilter, setCounterFilter] = useState(null)

  // Nhân viên chỉ thấy nhật ký của mình; trưởng phòng, kế toán, lãnh đạo, admin xem theo quyền (dữ liệu mẫu: toàn bộ).
  const visibleLog = user.roleCode === 'NHAN_VIEN' ? ACTIVITY_LOG.filter((e) => e.actor === user.name) : ACTIVITY_LOG

  const filteredLog = useMemo(
    () =>
      visibleLog.filter(
        (e) =>
          (!person || e.actor === person) &&
          (!moduleFilter || e.module === moduleFilter) &&
          (!action || e.action === action) &&
          (!recentOnly || toIsoDate(e.time) >= RECENT_FROM),
      ),
    [visibleLog, person, moduleFilter, action, recentOnly],
  )

  const selected = filteredLog.find((e) => e.id === selectedId && e.diff) ?? filteredLog.find((e) => e.diff)
  const unreadCount = notifications.filter(COUNTER_FILTERS.unread).length
  const shownNotifications = counterFilter ? notifications.filter(COUNTER_FILTERS[counterFilter]) : notifications

  const openNotification = (notification) => {
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
    navigate(notification.path)
  }

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setCounterFilter(null)
    showToast(`Đã đánh dấu ${unreadCount} thông báo là đã đọc`, 'success')
  }

  const toggleCounter = (key) => setCounterFilter((prev) => (prev === key ? null : key))

  const columns = [
    { key: 'time', header: 'Thời gian', width: 150 },
    { key: 'actor', header: 'Người thực hiện', width: 150, render: (e) => <TwoLineText primary={e.actor} secondary={e.actorRole} /> },
    { key: 'module', header: 'Module / Đối tượng', width: 150, render: (e) => <TwoLineText primary={e.module} secondary={e.target} /> },
    {
      key: 'action',
      header: 'Hành động / Lý do',
      render: (e) => (
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: e.tone ? tones[e.tone].fg : undefined }}>{e.action}</Typography>
          <Typography variant="caption" component="p">{e.detail}</Typography>
        </Box>
      ),
    },
    { key: 'status', header: 'Trạng thái', width: 120, render: (e) => <StatusBadge status={e.status} /> },
  ]

  const notificationList = (
    <Stack spacing={1.5}>
      {shownNotifications.length === 0 ? (
        <EmptyState compact title="Không có thông báo" description="Không có thông báo nào trong nhóm này." />
      ) : (
        shownNotifications.map((n) => (
          <NotificationItem
            key={n.id}
            tone={n.tone}
            category={n.category}
            time={n.read && !n.path ? 'Đã đọc' : n.time}
            title={n.title}
            description={n.read ? undefined : n.description}
            actionLabel={n.read ? undefined : n.actionLabel}
            onAction={n.path ? () => openNotification(n) : undefined}
            read={n.read}
          />
        ))
      )}
    </Stack>
  )

  return (
    <>
      <PageHeader
        eyebrow={`23 / ${user.role.toUpperCase()}`}
        title="Nhật ký & thông báo"
        description="Toàn bộ hoạt động hệ thống, trạng thái hồ sơ và cảnh báo theo quyền."
        actions={
          <>
            <Button variant="outlined" startIcon={<Download size={16} />} onClick={() => showToast(`Đang xuất ${filteredLog.length} bản ghi nhật ký...`, 'info')}>
              Xuất nhật ký
            </Button>
            <Button variant="contained" onClick={markAllRead} disabled={unreadCount === 0}>
              Đánh dấu tất cả đã đọc
            </Button>
          </>
        }
        tags={<StatusBadge label={`${user.roleCode === 'NHAN_VIEN' ? 'Dữ liệu của bạn' : 'Toàn công ty'} · ${user.role}`} tone="primary" />}
        toolbar={
          <>
            <FilterSelect value={person} options={toOptions('Tất cả người dùng', visibleLog.map((e) => e.actor))} onChange={setPerson} />
            <FilterSelect value={moduleFilter} options={toOptions('Tất cả module', visibleLog.map((e) => e.module))} onChange={setModuleFilter} />
            <FilterSelect value={period} options={PERIOD_OPTIONS} onChange={setPeriod} icon={CalendarDays} />
          </>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 380px' }, gap: 3, alignItems: 'start' }}>
        <Stack spacing={3}>
          <CustomTab
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'log', label: 'Nhật ký hoạt động' },
              { value: 'notifications', label: `Thông báo (${unreadCount} chưa đọc)` },
            ]}
          />

          {tab === 'log' ? (
            <>
              <FilterBar sx={{ mb: 0 }}>
                <FilterSelect value={action} options={toOptions('Hành động: Tất cả', visibleLog.map((e) => e.action))} onChange={setAction} />
                <FilterChip label="7 ngày gần nhất" selected={recentOnly} onClick={() => setRecentOnly((v) => !v)} />
              </FilterBar>

              <SectionCard padding={0} contentSx={{ px: 1 }}>
                <DataTable
                  columns={columns}
                  rows={filteredLog}
                  onRowClick={(e) => setSelectedId(e.id)}
                  minWidth={820}
                  emptyState={<EmptyState compact variant="no-results" />}
                />
              </SectionCard>

              {selected && (
                <SectionCard title="Xem trước trạng thái bất biến" action={<StatusBadge label={selected.target} tone="primary" />}>
                  <StateDiff before={selected.diff.before} after={selected.diff.after} />
                  <Typography variant="caption" component="p" sx={{ mt: 2 }}>
                    Dữ liệu lịch sử bất biến sau khi ghi nhận. Không ai có thể xóa hoặc sửa nhật ký.
                  </Typography>
                </SectionCard>
              )}
            </>
          ) : (
            notificationList
          )}
        </Stack>

        <Stack spacing={2}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
            <CounterTile value={unreadCount} label="Chưa đọc" tone="primary" onClick={() => toggleCounter('unread')} />
            <CounterTile value={notifications.filter(COUNTER_FILTERS.due).length} label="Đến hạn" tone="warning" onClick={() => toggleCounter('due')} />
            <CounterTile value={notifications.filter(COUNTER_FILTERS.action).length} label="Cần xử lý" tone="danger" onClick={() => toggleCounter('action')} />
          </Box>
          {counterFilter && (
            <FilterChip label={`Đang lọc: ${{ unread: 'Chưa đọc', due: 'Đến hạn', action: 'Cần xử lý' }[counterFilter]}`} selected onDelete={() => setCounterFilter(null)} />
          )}
          {tab === 'log' && notificationList}
        </Stack>
      </Box>
    </>
  )
}
