import { useState } from 'react'
import { useNavigate } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  ApprovalDecision,
  ApprovalRecord,
  ApprovalTimeline,
  AttachmentItem,
  BudgetCard,
  DecisionDialog,
  DescriptionList,
  PageHeader,
  SectionCard,
  StatCard,
  StatGrid,
  useToast,
} from '../../components'
import { COMPANY_BALANCE, FINAL_QUEUE } from '../../mocks/approvals'
import { MARKETING_BUDGET } from '../../mocks/data'
import { buildApprovalSteps } from '../../utils/approvalSteps'
import { formatDate, formatMoney, toMillions } from '../../utils/format'

// Màn 13 · Phê duyệt cuối (lãnh đạo): hồ sơ đã qua trưởng phòng và kế toán.
const AVAILABLE = MARKETING_BUDGET.total - MARKETING_BUDGET.spent - MARKETING_BUDGET.committed

const DECISION_TOAST = {
  approve: (id) => [`Đã duyệt cuối ${id}, hồ sơ chuyển kế toán thực hiện chi`, 'success'],
  changes: (id) => [`Đã gửi yêu cầu bổ sung ${id}, hồ sơ gửi lại sẽ bắt đầu từ trưởng phòng`, 'warning'],
  reject: (id) => [`Đã từ chối ${id}`, 'error'],
}

export default function FinalApprovalPage({ request }) {
  const navigate = useNavigate()
  const showToast = useToast()
  const [decision, setDecision] = useState(null)
  const after = AVAILABLE - request.amount
  const withinBudget = after >= 0
  const position = FINAL_QUEUE.findIndex((r) => r.id === request.id) + 1

  const steps = buildApprovalSteps(
    [
      { title: 'Nhân viên gửi yêu cầu', actor: request.requester, at: '20/10/2026, 09:15' },
      { title: 'Trưởng phòng phê duyệt', actor: request.deptApproval.actor, at: request.deptApproval.at },
      { title: 'Kế toán thẩm định', actor: request.accountingApproval.actor, at: request.accountingApproval.at },
      { title: 'Lãnh đạo duyệt cuối', actor: request.finalApproval.actor },
      { title: 'Kế toán thực hiện chi', note: 'Chỉ sau đủ ba phê duyệt' },
    ],
    3,
  )

  const confirmDecision = ({ type }) => {
    setDecision(null)
    showToast(...DECISION_TOAST[type](request.id))
    navigate('/approvals')
  }

  return (
    <>
      <PageHeader
        eyebrow="13 / LÃNH ĐẠO"
        title={`Phê duyệt cuối · ${request.id}`}
        description={`${request.title} · Phiên bản v${request.version} · ${position || 1} trong ${FINAL_QUEUE.length} hồ sơ chờ quyết định.`}
        actions={<Button variant="outlined" onClick={() => navigate('/approvals')}>Quay lại hàng chờ</Button>}
      />

      <StatGrid>
        <StatCard label="Đề nghị phê duyệt" value={formatMoney(request.amount, { unit: false })} caption="VND · Thanh toán một đợt" />
        <StatCard
          label="Khả dụng trước / sau dự kiến"
          value={`${toMillions(AVAILABLE)} / ${toMillions(after)} triệu`}
          tone={withinBudget ? 'default' : 'danger'}
          caption={`VND · Khoản mục ${request.budgetLine}`}
        />
        <StatCard label="Số dư tiền doanh nghiệp" value={formatMoney(COMPANY_BALANCE, { unit: false })} caption="VND · Chưa trừ yêu cầu này" />
        <StatCard
          label="Đánh giá rủi ro"
          value={withinBudget ? 'Thấp' : 'Cao'}
          tone={withinBudget ? 'success' : 'danger'}
          caption={withinBudget ? 'Đủ hồ sơ · Trong ngân sách' : 'Vượt ngân sách khả dụng'}
        />
      </StatGrid>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 3, alignItems: 'start' }}>
        <Stack spacing={3}>
          <SectionCard title="Tóm tắt yêu cầu">
            <DescriptionList
              columns={4}
              items={[
                { label: 'Người tạo / Phòng ban', value: `${request.requester} / ${request.department}` },
                { label: 'Số tiền đề nghị', value: formatMoney(request.amount) },
                { label: 'Ngày cần chi', value: formatDate(request.dueDate) },
                { label: 'Người thụ hưởng', value: request.beneficiary },
              ]}
            />
            <Typography sx={{ mt: 2.5 }}>{request.purpose}</Typography>
          </SectionCard>

          <SectionCard title="Xác nhận hai cấp đã hoàn tất">
            <Stack spacing={2.5}>
              <ApprovalRecord label="Đã duyệt cấp phòng" actor={`${request.deptApproval.actor} · ${request.deptApproval.at}`} note={request.deptApproval.note} />
              <ApprovalRecord
                label="Đã duyệt kế toán"
                actor={`${request.accountingApproval.actor} · ${request.accountingApproval.at}`}
                note={request.accountingApproval.note}
              />
            </Stack>
          </SectionCard>

          <SectionCard title="Chứng từ ra quyết định">
            <Stack spacing={1.25} sx={{ mb: 2.5 }}>
              {request.attachments.map((file) => (
                <AttachmentItem key={file.name} name={file.name} meta={file.meta} onDownload={() => showToast(`Đang tải ${file.name}`, 'info')} />
              ))}
            </Stack>
            <DescriptionList
              columns={1}
              items={[{ label: 'Ngân hàng thụ hưởng', value: `${request.bank} · ${request.accountNumber} · ${request.accountName}` }]}
            />
          </SectionCard>

          <ApprovalDecision
            title="Quyết định của lãnh đạo"
            notice={{
              title: 'Phê duyệt không phải là thanh toán',
              message: `Sau khi bạn duyệt, hồ sơ tạo cam kết chưa chi ${formatMoney(request.amount)} và chuyển kế toán thực hiện. Chỉ giao dịch thành công mới tăng chi thực tế.`,
            }}
            approveLabel="Phê duyệt cuối"
            onReject={() => setDecision('reject')}
            onRequestChanges={() => setDecision('changes')}
            onApprove={() => setDecision('approve')}
          />
        </Stack>

        <Stack spacing={3}>
          <SectionCard title="Tiến trình">
            <ApprovalTimeline steps={steps} />
          </SectionCard>
          <BudgetCard
            title="Ngân sách & hạn mức"
            {...MARKETING_BUDGET}
            alert={
              withinBudget
                ? {
                    tone: 'success',
                    title: 'Trong hạn mức',
                    message: `Yêu cầu ${formatMoney(request.amount)}. Còn ${formatMoney(after)} nếu được duyệt; không trừ cam kết lần thứ hai.`,
                  }
                : { tone: 'danger', title: 'Vượt hạn mức', message: `Khả dụng chỉ còn ${formatMoney(AVAILABLE)}.` }
            }
          />
        </Stack>
      </Box>

      <DecisionDialog
        type={decision}
        subject={`${request.id} · ${request.title} · ${formatMoney(request.amount)}`}
        approveLabel="Phê duyệt cuối"
        onClose={() => setDecision(null)}
        onConfirm={confirmDecision}
      />
    </>
  )
}
