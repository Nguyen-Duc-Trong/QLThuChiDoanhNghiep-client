import { useNavigate } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  ApprovalDecision,
  ApprovalRecord,
  ApprovalTimeline,
  BudgetCard,
  DecisionDialog,
  DescriptionList,
  PageHeader,
  SectionCard,
  StatCard,
  StatGrid,
} from '../../components'
import { buildExpenseTimeline } from '../../utils/approvalSteps'
import { formatDate, formatDateTime, formatMoney, toMillions } from '../../utils/format'
import useDecision from './useDecision'

// Màn 13 · Phê duyệt cuối (lãnh đạo): hồ sơ đã qua trưởng phòng và kế toán.
const recordActor = (record) =>
  `${record.actorName}${record.onBehalfOfName ? ` (thay ${record.onBehalfOfName})` : ''} · ${formatDateTime(record.createdAt)}`

export default function FinalApprovalPage({ request, queue }) {
  const navigate = useNavigate()
  const { decision, setDecision, confirm, deciding } = useDecision(request)
  const line = request.budgetLine
  const available = line?.availableAmount ?? 0
  const after = available - (request.amount ?? 0)
  const withinBudget = Boolean(line) && after >= 0
  const position = queue.findIndex((r) => r.id === request.id) + 1
  const records = request.approvals.filter((r) => r.version === request.version)
  const deptRecord = records.find((r) => r.step === 'DEPT')
  const accountingRecord = records.find((r) => r.step === 'ACCOUNTING')
  const checklist = accountingRecord?.checklist ? Object.values(accountingRecord.checklist) : []

  return (
    <>
      <PageHeader
        eyebrow="13 / LÃNH ĐẠO"
        title={`Phê duyệt cuối · ${request.code}`}
        description={`${request.purpose ?? ''} · Phiên bản v${request.version} · ${position || 1} trong ${Math.max(queue.length, 1)} hồ sơ chờ quyết định.${request.workflow.actingForName ? ` Bạn duyệt thay ${request.workflow.actingForName}.` : ''}`}
        actions={<Button variant="outlined" onClick={() => navigate('/approvals')}>Quay lại hàng chờ</Button>}
      />

      <StatGrid>
        <StatCard label="Đề nghị phê duyệt" value={formatMoney(request.amount, { unit: false })} caption={`VND · ${request.paymentMethodLabel}`} />
        <StatCard
          label="Khả dụng trước / sau dự kiến"
          value={`${toMillions(available)} / ${toMillions(after)} triệu`}
          tone={withinBudget ? 'default' : 'danger'}
          caption={line ? `VND · ${line.label}` : 'Chưa có khoản mục'}
        />
        <StatCard
          label="Đã chi + cam kết của khoản mục"
          value={line ? `${toMillions(line.spentAmount + line.committedAmount)} / ${toMillions(line.plannedAmount)} triệu` : '—'}
          caption="VND · Chưa tính yêu cầu này"
        />
        <StatCard
          label="Đánh giá rủi ro"
          value={withinBudget ? 'Thấp' : 'Cao'}
          tone={withinBudget ? 'success' : 'danger'}
          caption={withinBudget ? 'Đủ hai cấp duyệt · Trong ngân sách' : 'Vượt ngân sách khả dụng, duyệt cuối sẽ bị chặn'}
        />
      </StatGrid>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 3, alignItems: 'start' }}>
        <Stack spacing={3}>
          <SectionCard title="Tóm tắt yêu cầu">
            <DescriptionList
              columns={4}
              items={[
                { label: 'Người tạo / Phòng ban', value: `${request.requesterName ?? '—'} / ${request.departmentName ?? '—'}` },
                { label: 'Số tiền đề nghị', value: formatMoney(request.amount) },
                { label: 'Ngày cần chi', value: formatDate(request.dueDate) },
                { label: 'Người thụ hưởng', value: request.beneficiaryName ?? '—' },
              ]}
            />
            <Typography sx={{ mt: 2.5 }}>{request.purpose}</Typography>
            <Box sx={{ mt: 2.5 }}>
              <DescriptionList
                columns={1}
                items={[
                  {
                    label: 'Thanh toán',
                    value:
                      request.paymentMethod === 'TIEN_MAT'
                        ? 'Tiền mặt'
                        : `${request.beneficiaryBankName ?? '—'} · ${request.beneficiaryAccountNumber ?? '—'} · ${request.beneficiaryAccountName ?? '—'}`,
                  },
                ]}
              />
            </Box>
          </SectionCard>

          <SectionCard title="Xác nhận hai cấp đã hoàn tất">
            <Stack spacing={2.5}>
              {deptRecord && (
                <ApprovalRecord
                  label={deptRecord.decision === 'BO_QUA' ? 'Bỏ qua bước trưởng phòng' : 'Đã duyệt cấp phòng'}
                  actor={recordActor(deptRecord)}
                  note={deptRecord.note}
                />
              )}
              {accountingRecord && (
                <ApprovalRecord
                  label="Đã duyệt kế toán"
                  actor={recordActor(accountingRecord)}
                  note={[accountingRecord.note, checklist.length ? `Checklist ${checklist.filter(Boolean).length}/${checklist.length} mục đạt` : null]
                    .filter(Boolean)
                    .join(' · ')}
                />
              )}
            </Stack>
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
            approveDisabled={!withinBudget}
            disabled={deciding}
          />
        </Stack>

        <Stack spacing={3}>
          <SectionCard title="Tiến trình">
            <ApprovalTimeline steps={buildExpenseTimeline(request)} />
          </SectionCard>
          {line && (
            <BudgetCard
              title="Ngân sách & hạn mức"
              scope={`${line.label} · ${line.periodName}`}
              total={line.plannedAmount}
              spent={line.spentAmount}
              committed={line.committedAmount}
              alert={
                withinBudget
                  ? { tone: 'success', title: 'Trong hạn mức', message: `Yêu cầu ${formatMoney(request.amount)}. Còn ${formatMoney(after)} nếu được duyệt.` }
                  : { tone: 'danger', title: 'Vượt hạn mức', message: `Khả dụng chỉ còn ${formatMoney(available)}.` }
              }
            />
          )}
        </Stack>
      </Box>

      <DecisionDialog
        type={decision}
        subject={`${request.code} · ${request.purpose ?? ''} · ${formatMoney(request.amount)}`}
        approveLabel="Phê duyệt cuối"
        loading={deciding}
        onClose={() => !deciding && setDecision(null)}
        onConfirm={(value) => confirm(value)}
      />
    </>
  )
}
