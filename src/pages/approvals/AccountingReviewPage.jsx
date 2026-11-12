import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm, useWatch } from 'react-hook-form'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import {
  AppAlert,
  ApprovalDecision,
  AttachmentItem,
  BudgetCard,
  CustomChecklist,
  CustomForm,
  CustomInput,
  DecisionDialog,
  DescriptionList,
  PageHeader,
  SectionCard,
  StatusBadge,
  SummaryBar,
  useToast,
} from '../../components'
import { ACCOUNTING_QUEUE, REVIEW_CHECKLIST } from '../../mocks/approvals'
import { MARKETING_BUDGET } from '../../mocks/data'
import { formatDate, formatMoney } from '../../utils/format'

// Màn 12 · Thẩm định kế toán: sau trưởng phòng, trước lãnh đạo.
const AVAILABLE = MARKETING_BUDGET.total - MARKETING_BUDGET.spent - MARKETING_BUDGET.committed

const DECISION_TOAST = {
  approve: (id) => [`Đã duyệt kế toán ${id}, hồ sơ chuyển lãnh đạo duyệt cuối`, 'success'],
  changes: (id) => [`Đã gửi yêu cầu bổ sung ${id}, hồ sơ gửi lại sẽ quay về trưởng phòng`, 'warning'],
  reject: (id) => [`Đã từ chối ${id}`, 'error'],
}

export default function AccountingReviewPage({ request }) {
  const navigate = useNavigate()
  const showToast = useToast()
  const [decision, setDecision] = useState(null)
  const methods = useForm({
    defaultValues: {
      checks: Object.fromEntries(REVIEW_CHECKLIST.map((item) => [item.key, true])),
      conclusion: 'Hồ sơ hợp lệ; tài khoản thụ hưởng đã đối chiếu. Đề nghị chuyển lãnh đạo phê duyệt cuối.',
    },
  })
  const checks = useWatch({ control: methods.control, name: 'checks' })
  const doneCount = REVIEW_CHECKLIST.filter((item) => checks[item.key]).length
  const allPassed = doneCount === REVIEW_CHECKLIST.length

  const confirmDecision = ({ type }) => {
    setDecision(null)
    showToast(...DECISION_TOAST[type](request.id))
    navigate('/approvals')
  }

  return (
    <>
      <PageHeader
        eyebrow="12 / KẾ TOÁN"
        title="Thẩm định kế toán"
        description={`Ảnh chụp bước 3 · ${request.id} phiên bản v${request.version} · Sau trưởng phòng, trước lãnh đạo.`}
        actions={<Button variant="outlined" onClick={() => navigate('/approvals')}>Quay lại hàng chờ ({ACCOUNTING_QUEUE.length})</Button>}
      />

      <AppAlert tone="success" title="Trưởng phòng đã phê duyệt" sx={{ mb: 3 }}>
        {request.deptApproval.actor} · {request.deptApproval.at} · {request.deptApproval.note} Quyết định áp dụng cho hồ sơ v{request.version},{' '}
        {formatMoney(request.amount)}.
      </AppAlert>

      <SummaryBar
        items={[
          { label: 'Người tạo / Phòng ban', value: `${request.requester} / ${request.department}` },
          { label: 'Số tiền đề nghị', value: formatMoney(request.amount) },
          { label: 'Ngày cần chi', value: formatDate(request.dueDate) },
          { label: 'Người thụ hưởng', value: request.beneficiary },
        ]}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 3, alignItems: 'start' }}>
        <CustomForm methods={methods} onSubmit={() => setDecision('approve')}>
          <Stack spacing={3}>
            <SectionCard
              title="Checklist thẩm định"
              subtitle={`Hoàn thành ${doneCount}/${REVIEW_CHECKLIST.length} mục · Đánh dấu không thay thế kiểm tra thực tế`}
            >
              <CustomChecklist name="checks" items={REVIEW_CHECKLIST} />
            </SectionCard>

            <SectionCard title={`Bộ chứng từ v${request.version}`}>
              <Stack spacing={1.25} sx={{ mb: 2.5 }}>
                {request.attachments.map((file) => (
                  <AttachmentItem key={file.name} name={file.name} meta={file.meta} onDownload={() => showToast(`Đang tải ${file.name}`, 'info')} />
                ))}
              </Stack>
              <DescriptionList
                items={[
                  { label: 'Hóa đơn', value: request.invoice },
                  { label: 'Mã số thuế đối tác', value: request.taxCode },
                ]}
              />
            </SectionCard>

            <ApprovalDecision
              title="Kết luận thẩm định"
              description={<CustomInput name="conclusion" multiline minRows={2} aria-label="Kết luận thẩm định" />}
              note={allPassed ? 'Mọi quyết định được lưu vào lịch sử bất biến.' : 'Cần hoàn tất checklist trước khi phê duyệt.'}
              onReject={() => setDecision('reject')}
              onRequestChanges={() => setDecision('changes')}
              onApprove={methods.handleSubmit(() => setDecision('approve'))}
              approveDisabled={!allPassed}
            />
          </Stack>
        </CustomForm>

        <Stack spacing={3}>
          <BudgetCard
            title="Ngân sách"
            {...MARKETING_BUDGET}
            alert={{
              tone: 'success',
              title: 'Trong hạn mức',
              message: `Yêu cầu ${formatMoney(request.amount)}. Còn ${formatMoney(AVAILABLE - request.amount)} nếu được duyệt; không trừ cam kết lần thứ hai.`,
            }}
          />
          <SectionCard title="Thụ hưởng">
            <DescriptionList
              columns={1}
              items={[
                { label: 'Đơn vị', value: request.beneficiary },
                { label: 'Ngân hàng / Chi nhánh', value: `${request.bank} / ${request.branch}` },
                { label: 'Số tài khoản', value: request.accountNumber },
              ]}
            />
            <StatusBadge label="Đã xác minh" tone="success" sx={{ mt: 2 }} />
          </SectionCard>
          <AppAlert tone="warning" title="Chưa đủ điều kiện thanh toán">
            Duyệt kế toán chỉ chuyển hồ sơ sang lãnh đạo. Không tạo giao dịch chi tại bước thẩm định này.
          </AppAlert>
        </Stack>
      </Box>

      <DecisionDialog
        type={decision}
        subject={`${request.id} · ${request.title} · ${formatMoney(request.amount)}`}
        approveLabel="Duyệt kế toán"
        onClose={() => setDecision(null)}
        onConfirm={confirmDecision}
      />
    </>
  )
}
