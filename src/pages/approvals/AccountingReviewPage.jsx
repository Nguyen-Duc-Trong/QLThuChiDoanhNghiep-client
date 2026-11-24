import { useNavigate } from 'react-router'
import { useForm, useWatch } from 'react-hook-form'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import {
  AppAlert,
  ApprovalDecision,
  ApprovalTimeline,
  BudgetCard,
  CustomChecklist,
  CustomForm,
  CustomInput,
  DecisionDialog,
  DescriptionList,
  PageHeader,
  SectionCard,
  SummaryBar,
} from '../../components'
import { buildExpenseTimeline } from '../../utils/approvalSteps'
import { formatDate, formatDateTime, formatMoney } from '../../utils/format'
import useDecision from './useDecision'

// Màn 12 · Thẩm định kế toán: sau trưởng phòng, trước lãnh đạo. Checklist được lưu cùng quyết định.
function buildChecklist(request) {
  const line = request.budgetLine
  const after = line ? line.availableAmount - (request.amount ?? 0) : null
  return [
    { key: 'documents', label: 'Chứng từ hợp lệ', description: `Hợp đồng, báo giá, hóa đơn khớp số tiền ${formatMoney(request.amount)}.` },
    { key: 'period', label: 'Đúng kỳ và khoản mục', description: line ? `${line.periodName} · ${line.label}` : 'Hồ sơ chưa có khoản mục ngân sách.' },
    {
      key: 'budget',
      label: 'Ngân sách còn đủ',
      description: line ? `Khả dụng ${formatMoney(line.availableAmount)}, sau duyệt còn ${formatMoney(after)}.` : '—',
    },
    {
      key: 'beneficiary',
      label: 'Người thụ hưởng đã xác minh',
      description:
        request.paymentMethod === 'TIEN_MAT'
          ? `${request.beneficiaryName ?? '—'} · chi tiền mặt`
          : `${request.beneficiaryName ?? '—'} · ${request.beneficiaryBankName ?? '—'} ${request.beneficiaryAccountNumber ?? ''} · Tên TK ${request.beneficiaryAccountName ?? '—'}`,
    },
    { key: 'duplicate', label: 'Không trùng hồ sơ / giao dịch', description: 'Không có yêu cầu khác trùng hóa đơn và người thụ hưởng.' },
  ]
}

export default function AccountingReviewPage({ request, queueSize }) {
  const navigate = useNavigate()
  const { decision, setDecision, confirm, deciding } = useDecision(request)
  const checklistItems = buildChecklist(request)
  const methods = useForm({
    defaultValues: { checks: Object.fromEntries(checklistItems.map((item) => [item.key, false])), conclusion: '' },
  })
  const checks = useWatch({ control: methods.control, name: 'checks' })
  const doneCount = checklistItems.filter((item) => checks[item.key]).length
  const allPassed = doneCount === checklistItems.length

  const line = request.budgetLine
  const after = line ? line.availableAmount - (request.amount ?? 0) : 0
  const deptRecord = request.approvals.find((r) => r.version === request.version && r.step === 'DEPT')

  const onConfirm = (value) =>
    confirm(value, { checklist: methods.getValues('checks'), note: methods.getValues('conclusion')?.trim() || undefined })

  return (
    <>
      <PageHeader
        eyebrow="12 / KẾ TOÁN"
        title="Thẩm định kế toán"
        description={`${request.code} phiên bản v${request.version} · Sau trưởng phòng, trước lãnh đạo.${request.workflow.actingForName ? ` Bạn duyệt thay ${request.workflow.actingForName}.` : ''}`}
        actions={<Button variant="outlined" onClick={() => navigate('/approvals')}>Quay lại hàng chờ ({queueSize})</Button>}
      />

      {deptRecord && (
        <AppAlert tone={deptRecord.decision === 'BO_QUA' ? 'warning' : 'success'} title={deptRecord.decision === 'BO_QUA' ? 'Đã bỏ qua bước trưởng phòng' : 'Trưởng phòng đã phê duyệt'} sx={{ mb: 3 }}>
          {deptRecord.decision === 'BO_QUA'
            ? deptRecord.note
            : `${deptRecord.actorName}${deptRecord.onBehalfOfName ? ` (thay ${deptRecord.onBehalfOfName})` : ''} · ${formatDateTime(deptRecord.createdAt)}${deptRecord.note ? ` · ${deptRecord.note}` : ''}. Quyết định áp dụng cho hồ sơ v${request.version}, ${formatMoney(request.amount)}.`}
        </AppAlert>
      )}

      <SummaryBar
        items={[
          { label: 'Người tạo / Phòng ban', value: `${request.requesterName ?? '—'} / ${request.departmentName ?? '—'}` },
          { label: 'Số tiền đề nghị', value: formatMoney(request.amount) },
          { label: 'Ngày cần chi', value: formatDate(request.dueDate) },
          { label: 'Người thụ hưởng', value: request.beneficiaryName ?? '—' },
        ]}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 3, alignItems: 'start' }}>
        <CustomForm methods={methods} onSubmit={() => setDecision('approve')}>
          <Stack spacing={3}>
            <SectionCard title="Nội dung đề nghị">
              <DescriptionList
                items={[
                  { label: 'Mục đích', value: request.purpose ?? '—' },
                  { label: 'Loại chi / Dự án', value: `${request.categoryName ?? '—'} / ${request.projectName ?? 'Không thuộc dự án'}` },
                  { label: 'Ghi chú', value: request.note || '—' },
                ]}
              />
            </SectionCard>

            <SectionCard
              title="Checklist thẩm định"
              subtitle={`Hoàn thành ${doneCount}/${checklistItems.length} mục · Đánh dấu không thay thế kiểm tra thực tế`}
            >
              <CustomChecklist name="checks" items={checklistItems} />
            </SectionCard>

            <ApprovalDecision
              title="Kết luận thẩm định"
              description={
                <CustomInput
                  name="conclusion"
                  multiline
                  minRows={2}
                  aria-label="Kết luận thẩm định"
                  placeholder="Hồ sơ hợp lệ; tài khoản thụ hưởng đã đối chiếu. Đề nghị chuyển lãnh đạo phê duyệt cuối."
                />
              }
              note={allPassed ? 'Kết luận và checklist được lưu cùng quyết định.' : 'Cần hoàn tất checklist trước khi phê duyệt.'}
              onReject={() => setDecision('reject')}
              onRequestChanges={() => setDecision('changes')}
              onApprove={methods.handleSubmit(() => setDecision('approve'))}
              approveDisabled={!allPassed}
              disabled={deciding}
            />
          </Stack>
        </CustomForm>

        <Stack spacing={3}>
          {line && (
            <BudgetCard
              title="Ngân sách"
              scope={`${line.label} · ${line.periodName}`}
              total={line.plannedAmount}
              spent={line.spentAmount}
              committed={line.committedAmount}
              alert={
                after >= 0
                  ? { tone: 'success', title: 'Trong hạn mức', message: `Yêu cầu ${formatMoney(request.amount)}. Còn ${formatMoney(after)} nếu được duyệt.` }
                  : { tone: 'danger', title: 'Vượt hạn mức', message: `Khả dụng chỉ còn ${formatMoney(line.availableAmount)}.` }
              }
            />
          )}
          <SectionCard title="Tiến trình">
            <ApprovalTimeline steps={buildExpenseTimeline(request)} />
          </SectionCard>
          <AppAlert tone="warning" title="Chưa đủ điều kiện thanh toán">
            Duyệt kế toán chỉ chuyển hồ sơ sang lãnh đạo. Không tạo giao dịch chi tại bước thẩm định này.
          </AppAlert>
        </Stack>
      </Box>

      <DecisionDialog
        type={decision}
        subject={`${request.code} · ${request.purpose ?? ''} · ${formatMoney(request.amount)}`}
        approveLabel="Duyệt kế toán"
        loading={deciding}
        onClose={() => !deciding && setDecision(null)}
        onConfirm={onConfirm}
      />
    </>
  )
}
