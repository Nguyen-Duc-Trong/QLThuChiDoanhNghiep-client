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
