import { useState } from 'react'
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Download, Plus, Trash2 } from 'lucide-react'
import {
  AppAlert,
  ConfirmDialog,
  CustomInput,
  CustomMoneyInput,
  CustomSelect,
  DataTable,
  DescriptionList,
  FormFooter,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  useToast,
} from '../../components'
import {
  ALLOCATION_DEPARTMENTS,
  ALLOCATION_HISTORY,
  ALLOCATION_LIMIT,
  ALLOCATION_ROWS,
  ALLOCATION_THRESHOLD,
} from '../../mocks/budgets'
import { tones } from '../../theme/tokens'
import { formatMoney } from '../../utils/format'
import validationResolver from '../../utils/validationResolver'

// Màn 18 · Thiết lập và phân bổ ngân sách (kế toán soạn, lãnh đạo duyệt thay đổi hạn mức).
const TODAY_LABEL = '22/10/2026'
const BLOCK_OVER_LIMIT = true

const HISTORY_COLUMNS = [
  { key: 'date', header: 'Thời gian', width: 110 },
  { key: 'actor', header: 'Người' },
  { key: 'status', header: 'Trạng thái', width: 110, render: (h) => <StatusBadge status={h.status} /> },
]

function validate({ rows }) {
  const errors = {}
  const seen = new Set()
  rows.forEach((row, index) => {
    if (!row.department) errors[`rows.${index}.department`] = 'Chọn phòng ban.'
    else if (seen.has(row.department)) errors[`rows.${index}.department`] = 'Phòng ban bị trùng.'
    seen.add(row.department)
    if (!row.allocated) errors[`rows.${index}.allocated`] = 'Nhập số phân bổ.'
    else if (row.allocated < row.committed) errors[`rows.${index}.allocated`] = `Không thấp hơn cam kết ${formatMoney(row.committed)}.`
  })
  return errors
}

// Lỗi theo đường dẫn "rows.0.allocated" → object lồng nhau mà react-hook-form đọc được.
function nestedResolver(values, context, options) {
  const result = validationResolver(validate)(values, context, options)
  const errors = {}
  Object.entries(result.errors).forEach(([path, error]) => {
    const [, index, field] = path.split('.')
    errors.rows ??= []
    errors.rows[index] = { ...errors.rows[index], [field]: error }
  })
  return { values: result.values, errors }
}

const rowStatus = (row) => {
  if (!row.allocated) return 'NHAP'
  const usage = (row.spent + row.committed) / row.allocated
  return usage >= ALLOCATION_THRESHOLD ? 'CANH_BAO' : 'TRONG_HAN_MUC'
}

function PolicyTile({ tone, label, value, caption }) {
  const color = tones[tone]
  return (
    <Box sx={{ bgcolor: color.bg, borderRadius: 2, px: 2.5, py: 2.25 }}>
      <Typography variant="body2" sx={{ color: color.fg }}>{label}</Typography>
      <Typography sx={{ fontSize: { xs: 24, lg: 30 }, fontWeight: 600, color: color.fg, my: 1 }}>{value}</Typography>
      <Typography variant="caption" component="p" sx={{ color: color.fg }}>{caption}</Typography>
    </Box>
  )
}

export default function BudgetAllocationPage() {
  const showToast = useToast()
  const [history, setHistory] = useState(ALLOCATION_HISTORY)
  const [submitOpen, setSubmitOpen] = useState(false)
  const methods = useForm({ defaultValues: { rows: ALLOCATION_ROWS }, resolver: nestedResolver })
  const { fields, append, remove } = useFieldArray({ control: methods.control, name: 'rows' })
  const rows = useWatch({ control: methods.control, name: 'rows' })
  const reasonForm = useForm({ defaultValues: { reason: '' } })

  const allocated = rows.reduce((total, r) => total + (r.allocated ?? 0), 0)
  const committed = rows.reduce((total, r) => total + r.committed, 0)
  const available = allocated - committed
  const overBy = allocated - ALLOCATION_LIMIT
  const overLimit = overBy > 0
  const overPercent = Math.round((overBy / ALLOCATION_LIMIT) * 100)
  const usedDepartments = rows.map((r) => r.department)
  const pendingCount = history.filter((h) => h.status === 'CHO_DUYET').length

  const addHistory = (status) => setHistory((prev) => [{ id: Date.now(), date: TODAY_LABEL, actor: 'Lê Thu Hà', status }, ...prev])

  const saveDraft = methods.handleSubmit((values) => {
    if (overLimit && BLOCK_OVER_LIMIT) {
      showToast(`Không thể lưu nháp: tổng phân bổ vượt hạn mức ${formatMoney(overBy)}`, 'error')
      return
    }
    methods.reset(values)
    addHistory('NHAP')
    showToast('Đã lưu nháp phân bổ Quý IV/2026', 'info')
  })

  const submitAdjustment = reasonForm.handleSubmit(({ reason }) => {
    setSubmitOpen(false)
    reasonForm.reset()
    methods.reset(methods.getValues())
    addHistory('CHO_DUYET')
    showToast(overLimit ? `Đã gửi lãnh đạo duyệt điều chỉnh hạn mức: ${reason}` : 'Đã gửi duyệt phân bổ Quý IV/2026', 'success')
  })

  const columns = [
    {
      key: 'department',
      header: 'Phòng ban',
      render: (r) =>
        r.isTotal ? (
          <Typography sx={{ fontWeight: 600 }}>Tổng</Typography>
        ) : r.committed > 0 ? (
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{rows[r.index]?.department}</Typography>
        ) : (
          <CustomSelect
            name={`rows.${r.index}.department`}
            size="small"
            placeholder="Chọn phòng ban"
            options={ALLOCATION_DEPARTMENTS.map((d) => ({ value: d, label: d, disabled: d !== rows[r.index]?.department && usedDepartments.includes(d) }))}
          />
        ),
    },
    {
      key: 'allocated',
      header: 'Đã phân bổ',
      align: 'right',
      width: 200,
      render: (r) =>
        r.isTotal ? (
          <Typography sx={{ fontWeight: 600, color: overLimit ? tones.warning.fg : undefined }}>{formatMoney(allocated, { unit: false })}</Typography>
        ) : (
          <CustomMoneyInput name={`rows.${r.index}.allocated`} size="small" slotProps={{ htmlInput: { style: { textAlign: 'right' } } }} />
        ),
    },
    {
      key: 'committed',
      header: 'Cam kết',
      align: 'right',
      width: 140,
      render: (r) => <Typography sx={{ fontSize: 14, fontWeight: r.isTotal ? 600 : 400 }}>{formatMoney(r.isTotal ? committed : r.committed, { unit: false })}</Typography>,
    },
    {
      key: 'available',
      header: 'Khả dụng',
      align: 'right',
      width: 140,
      render: (r) => {
        const value = r.isTotal ? available : (rows[r.index]?.allocated ?? 0) - r.committed
        return <Typography sx={{ fontSize: 14, fontWeight: r.isTotal ? 600 : 400 }}>{formatMoney(value, { unit: false })}</Typography>
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: 140,
      render: (r) => (r.isTotal ? <StatusBadge status={overLimit ? 'VUOT_HAN_MUC' : 'TRONG_HAN_MUC'} /> : <StatusBadge status={rowStatus(rows[r.index] ?? r)} />),
    },
    {
      key: 'remove',
      header: '',
      width: 48,
      render: (r) =>
        !r.isTotal &&
        r.committed === 0 && (
          <IconButton size="small" aria-label="Xóa dòng phân bổ" onClick={() => remove(r.index)}>
            <Trash2 size={16} />
          </IconButton>
        ),
    },
  ]

  const tableRows = [...fields.map((field, index) => ({ ...field, index })), { id: 'total', isTotal: true }]

  return (
    <>
      <PageHeader
        eyebrow="18 / NGÂN SÁCH"
        title="Thiết lập và phân bổ ngân sách"
        description="Quản lý phân bổ theo phòng ban, khoản mục và ngưỡng cảnh báo. Kế toán kiểm soát trong hạn mức, lãnh đạo duyệt thay đổi."
        actions={
          <>
            <Button variant="outlined" startIcon={<Download size={16} />} onClick={() => showToast('Đang xuất báo cáo phân bổ...', 'info')}>
              Xuất báo cáo
            </Button>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              disabled={fields.length >= ALLOCATION_DEPARTMENTS.length}
              onClick={() => append({ department: '', allocated: null, committed: 0, spent: 0 })}
            >
              Tạo phân bổ mới
            </Button>
          </>
        }
        tags={
          <>
            <StatusBadge label="Năm 2026 · Kỳ 4" tone="primary" />
            {overLimit && <StatusBadge label={`Tổng phân bổ vượt ${overPercent}%`} tone="warning" />}
          </>
        }
        toolbar={pendingCount > 0 && <StatusBadge label={`${pendingCount} thay đổi đang chờ duyệt`} tone="success" />}
      />

      <SectionCard sx={{ mb: 3 }}>
        <DescriptionList
          columns={4}
          items={[
            { label: 'Năm / Kỳ', value: '2026 / Quý IV' },
            { label: 'Tổng hạn mức', value: formatMoney(ALLOCATION_LIMIT) },
            { label: 'Phòng ban', value: rows.map((r) => r.department).filter(Boolean).join(' · ') },
            { label: 'Người chịu trách nhiệm', value: 'Lê Thu Hà / Kế toán' },
          ]}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, mt: 2.5 }}>
          <StatCard label="Tổng hạn mức" value={formatMoney(ALLOCATION_LIMIT, { unit: false })} caption="VND · Đã duyệt cuối" sx={{ border: 'none', bgcolor: 'background.default' }} />
          <StatCard
            label="Đã phân bổ"
            value={formatMoney(allocated, { unit: false })}
            tone={overLimit ? 'warning' : 'default'}
            caption={overLimit ? `VND · Vượt ${overPercent}% so với hạn mức` : 'VND · Trong hạn mức'}
            sx={{ border: 'none', bgcolor: 'background.default' }}
          />
          <StatCard
            label="Chưa phân bổ"
            value={formatMoney(Math.max(0, -overBy), { unit: false })}
            caption={overLimit ? 'VND · Cần điều chỉnh để gửi duyệt' : 'VND · Có thể phân bổ thêm'}
            sx={{ border: 'none', bgcolor: 'background.default' }}
          />
          <StatCard label="Khả dụng" value={formatMoney(available, { unit: false })} caption="VND · Không trừ hai lần cam kết đã trả" sx={{ border: 'none', bgcolor: 'background.default' }} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mt: 2 }}>
          <PolicyTile tone="warning" label="Ngưỡng cảnh báo" value={`${ALLOCATION_THRESHOLD * 100}%`} caption={`Tự động cảnh báo khi đã dùng ${ALLOCATION_THRESHOLD * 100}% phần phân bổ`} />
          <PolicyTile tone="success" label="Chặn vượt hạn mức" value={BLOCK_OVER_LIMIT ? 'Bật' : 'Tắt'} caption="Không cho lưu nháp nếu tổng phân bổ vượt hạn mức" />
          <PolicyTile tone="info" label="Ngoại lệ" value="Duyệt lãnh đạo" caption="Nếu vượt hạn mức, chỉ gửi duyệt thay đổi hạn mức" />
        </Box>
      </SectionCard>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 420px' }, gap: 3, alignItems: 'start' }}>
        <SectionCard
          title="Bảng phân bổ theo phòng ban"
          subtitle={overLimit ? 'Tổng phân bổ đang vượt hạn mức. Cần điều chỉnh trước khi gửi duyệt.' : 'Tổng phân bổ nằm trong hạn mức.'}
        >
          <FormProvider {...methods}>
            <DataTable columns={columns} rows={tableRows} minWidth={720} />
          </FormProvider>
          {overLimit && (
            <AppAlert tone="danger" title={`Tổng phân bổ vượt ${formatMoney(overBy)}`} sx={{ mt: 2.5 }}>
              Giảm phân bổ của phòng ban, hoặc gửi lãnh đạo duyệt điều chỉnh hạn mức kèm lý do.
            </AppAlert>
          )}
        </SectionCard>

        <Stack spacing={3}>
          <SectionCard title="Lịch sử điều chỉnh" subtitle="Trạng thái và người thực hiện gần nhất">
            <DataTable columns={HISTORY_COLUMNS} rows={history.slice(0, 5)} minWidth={320} />
          </SectionCard>
          <AppAlert tone="info" title="Quyền ngân sách">
            Kế toán quản lý phân bổ trong hạn mức. Lãnh đạo duyệt thay đổi hạn mức. Admin hệ thống không mặc nhiên có quyền ngân sách.
          </AppAlert>
          <FormFooter note={methods.formState.isDirty ? 'Có thay đổi chưa lưu.' : ''} sx={{ mt: 0 }}>
            <Button variant="outlined" onClick={saveDraft} disabled={overLimit && BLOCK_OVER_LIMIT}>
              Lưu nháp
            </Button>
            <Button variant="contained" onClick={methods.handleSubmit(() => setSubmitOpen(true))}>
              Gửi duyệt điều chỉnh
            </Button>
          </FormFooter>
        </Stack>
      </Box>

      <ConfirmDialog
        open={submitOpen}
        title={overLimit ? 'Gửi duyệt điều chỉnh hạn mức' : 'Gửi duyệt phân bổ'}
        description={
          overLimit
            ? `Tổng phân bổ ${formatMoney(allocated)} vượt hạn mức ${formatMoney(overBy)}. Lãnh đạo sẽ duyệt thay đổi hạn mức trước khi phân bổ có hiệu lực.`
            : `Tổng phân bổ ${formatMoney(allocated)} cho ${rows.length} phòng ban sẽ được gửi lãnh đạo duyệt.`
        }
        confirmLabel="Gửi duyệt"
        onClose={() => setSubmitOpen(false)}
        onConfirm={submitAdjustment}
      >
        <FormProvider {...reasonForm}>
          <CustomInput
            name="reason"
            label="Lý do điều chỉnh"
            required
            multiline
            minRows={2}
            rules={{ validate: (v) => Boolean(v.trim()) || 'Nhập lý do điều chỉnh.' }}
            placeholder="Bổ sung ngân sách đào tạo nhân sự quý IV"
          />
        </FormProvider>
      </ConfirmDialog>
    </>
  )
}
