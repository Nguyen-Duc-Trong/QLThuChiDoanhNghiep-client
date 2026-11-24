import { formatDate, formatMoney } from './format'

// Bước mặc định của luồng chi: 3 cấp duyệt rồi kế toán thực hiện chi.
export const DEFAULT_APPROVAL_STEPS = [
  { title: 'Nhân viên gửi yêu cầu' },
  { title: 'Trưởng phòng phê duyệt' },
  { title: 'Kế toán thẩm định' },
  { title: 'Lãnh đạo duyệt cuối' },
  { title: 'Kế toán thực hiện chi', note: 'Chỉ sau đủ ba phê duyệt' },
]

/**
 * Dữ liệu cho ApprovalTimeline.
 * steps: [{ title, actor?, at?, note? }] · doneCount: số bước đã xong · rejected: bước hiện tại bị từ chối.
 * currentBadge: nhãn dưới bước đang xử lý (mặc định "Đang chờ xử lý").
 */
export function buildApprovalSteps(steps, doneCount, { rejected = false, draft = false, currentBadge = 'Đang chờ xử lý' } = {}) {
  return steps.map((step, index) => {
    let status = 'pending'
    if (index < doneCount) status = 'done'
    else if (index === doneCount) status = rejected ? 'rejected' : draft ? 'pending' : 'current'

    const description =
      status === 'done'
        ? [step.actor, step.at].filter(Boolean).join(' · ') || 'Đã hoàn tất'
        : status === 'current'
          ? [step.actor, step.waiting ?? 'Chờ đến lượt'].filter(Boolean).join(' · ')
          : [step.actor, step.note ?? (step.actor ? 'Chờ đến lượt' : undefined)].filter(Boolean).join(' · ')
    const badge = status === 'current' ? { label: currentBadge } : status === 'rejected' ? { label: 'Từ chối', tone: 'danger' } : undefined
    return { title: step.title, description, status, badge }
  })
}

// ---------------------------------------------------------------------------
// Dữ liệu thật từ GET /expenses/:id (approvals, versions, workflow)
// ---------------------------------------------------------------------------

const STEP_ORDER = ['DEPT', 'ACCOUNTING', 'FINAL']
const STEP_TITLE = { DEPT: 'Trưởng phòng phê duyệt', ACCOUNTING: 'Kế toán thẩm định', FINAL: 'Lãnh đạo duyệt cuối' }
const STEP_OF_STATUS = { CHO_TRUONG_PHONG: 'DEPT', CHO_KE_TOAN: 'ACCOUNTING', CHO_LANH_DAO: 'FINAL' }

const formatAt = (value) => {
  if (!value) return ''
  const d = new Date(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const actorText = (record) => [record.actorName, record.onBehalfOfName && `thay ${record.onBehalfOfName}`].filter(Boolean).join(' ')

/**
 * Các bước cho ApprovalTimeline của một hồ sơ: gửi → 3 cấp duyệt → thực chi.
 * Chỉ xét quyết định của phiên bản hiện tại (gửi lại thì duyệt lại từ đầu).
 */
export function buildExpenseTimeline(expense) {
  const records = (expense.approvals ?? []).filter((r) => r.version === expense.version)
  const currentVersion = (expense.versions ?? []).find((v) => v.version === expense.version)
  const currentStep = STEP_OF_STATUS[expense.status]
  const draft = expense.status === 'NHAP'

  const steps = [
    draft
      ? { title: 'Nhân viên gửi yêu cầu', description: `${expense.requesterName ?? ''} · Chưa gửi`, status: 'current', badge: { label: 'Bản nháp' } }
      : {
          title: expense.version > 1 ? `Nhân viên gửi lại (v${expense.version})` : 'Nhân viên gửi yêu cầu',
          description: [expense.requesterName, formatAt(currentVersion?.submittedAt ?? expense.submittedAt)].filter(Boolean).join(' · '),
          status: 'done',
        },
  ]

  let stopped = draft
  for (const step of STEP_ORDER) {
    const record = records.find((r) => r.step === step)
    if (stopped) {
      steps.push({ title: STEP_TITLE[step], description: 'Chờ đến lượt', status: 'pending' })
    } else if (record?.decision === 'DUYET') {
      steps.push({ title: STEP_TITLE[step], description: [actorText(record), formatAt(record.createdAt)].join(' · '), status: 'done' })
    } else if (record?.decision === 'BO_QUA') {
      steps.push({ title: STEP_TITLE[step], description: 'Hệ thống bỏ qua: người tạo là trưởng phòng, không có người duyệt thay', status: 'done', badge: { label: 'Bỏ qua', tone: 'neutral' } })
    } else if (record?.decision === 'BO_SUNG' || record?.decision === 'TU_CHOI') {
      const changes = record.decision === 'BO_SUNG'
      steps.push({
        title: STEP_TITLE[step],
        description: [actorText(record), formatAt(record.createdAt), record.note].filter(Boolean).join(' · '),
        status: changes ? 'current' : 'rejected',
        badge: changes ? { label: 'Yêu cầu bổ sung', tone: 'warning' } : { label: 'Từ chối', tone: 'danger' },
      })
      stopped = true
    } else if (step === currentStep) {
      const who = expense.workflow?.approverNames?.join(', ')
      steps.push({
        title: STEP_TITLE[step],
        description: expense.workflow?.blockedReason ?? (who ? `${who} · Đang chờ xử lý` : 'Đang chờ xử lý'),
        status: 'current',
        badge: expense.workflow?.blockedReason ? { label: 'Thiếu người duyệt', tone: 'warning' } : { label: 'Đang chờ xử lý' },
      })
      stopped = true
    } else {
      steps.push({ title: STEP_TITLE[step], description: 'Chờ đến lượt', status: 'pending' })
      stopped = true
    }
  }

  const paid = expense.status === 'DA_THANH_TOAN'
  const approved = ['DA_DUYET', 'CHI_MOT_PHAN', 'DA_THANH_TOAN'].includes(expense.status)
  const payment = expense.payment
  steps.push({
    title: 'Kế toán thực hiện chi',
    description: paid
      ? payment
        ? [payment.executedByName, formatDate(payment.executedAt), `Lệnh ${payment.code}`].filter(Boolean).join(' · ')
        : 'Hoàn thành chi'
      : approved
        ? 'Chờ kế toán thực hiện chi'
        : 'Chỉ sau đủ ba phê duyệt',
    status: paid ? 'done' : approved ? 'current' : 'pending',
    badge: approved && !paid ? { label: expense.status === 'CHI_MOT_PHAN' ? 'Chi một phần' : 'Chờ chi' } : undefined,
  })
  return steps
}

/** Dòng lịch sử xử lý (mới nhất lên đầu): mỗi lần gửi + mỗi quyết định */
export function buildExpenseHistory(expense) {
  const rows = [
    ...(expense.versions ?? []).map((v) => ({
      id: `v${v.version}`,
      at: v.submittedAt,
      actor: v.submittedByName ?? expense.requesterName ?? '—',
      action: v.version > 1 ? `Gửi lại hồ sơ v${v.version}` : 'Gửi hồ sơ v1',
    })),
    ...(expense.approvals ?? []).map((r) => ({
      id: r.id,
      at: r.createdAt,
      actor: actorText(r) || '—',
      action: [`${r.stepLabel}: ${r.decisionLabel} (v${r.version})`, r.note, r.fields?.length ? `Cần sửa: ${r.fields.join(', ')}` : null]
        .filter(Boolean)
        .join(' · '),
    })),
    ...(expense.payment
      ? [
          {
            id: expense.payment.id,
            at: expense.payment.createdAt,
            actor: expense.payment.executedByName ?? '—',
            action: [
              `Hoàn thành chi ${expense.payment.code}: ${formatMoney(expense.payment.amount)}`,
              expense.payment.proofFileName ? `Ủy nhiệm chi: ${expense.payment.proofFileName}` : null,
              expense.payment.sourceAccount,
              expense.payment.bankName,
              expense.payment.bankRef ? `Mã GD ${expense.payment.bankRef}` : null,
            ]
              .filter(Boolean)
              .join(' · '),
          },
        ]
      : []),
  ]
  return rows
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .map((row) => ({ ...row, time: formatAt(row.at) }))
}

/** Yêu cầu bổ sung gần nhất (hồ sơ đang Cần bổ sung) */
export const latestChangeRequest = (expense) =>
  [...(expense?.approvals ?? [])].reverse().find((r) => r.decision === 'BO_SUNG') ?? null

export const SNAPSHOT_FIELDS = [
  { key: 'purpose', label: 'Nội dung / mục đích' },
  { key: 'amount', label: 'Số tiền', money: true },
  { key: 'categoryName', label: 'Loại chi' },
  { key: 'budgetLineLabel', label: 'Khoản mục ngân sách' },
  { key: 'projectName', label: 'Dự án' },
  { key: 'dueDate', label: 'Ngày cần chi', date: true },
  { key: 'beneficiaryName', label: 'Người thụ hưởng' },
  { key: 'paymentMethod', label: 'Phương thức' },
  { key: 'beneficiaryBankName', label: 'Ngân hàng' },
  { key: 'beneficiaryAccountNumber', label: 'Số tài khoản' },
  { key: 'note', label: 'Ghi chú' },
]

/** Các trường khác nhau giữa hai bản chụp: [{ key, label, before, after }] (giá trị thô, màn hình tự định dạng) */
export function diffSnapshots(before, after) {
  return SNAPSHOT_FIELDS.filter((f) => (before?.[f.key] ?? null) !== (after?.[f.key] ?? null)).map((f) => ({
    ...f,
    before: before?.[f.key] ?? null,
    after: after?.[f.key] ?? null,
  }))
}

/** Giá trị một trường của bản chụp phiên bản → chữ hiển thị */
export function snapshotText(field, value) {
  if (value === null || value === undefined || value === '') return '—'
  if (field.money) return formatMoney(value)
  if (field.date) return formatDate(value)
  return String(value)
}
