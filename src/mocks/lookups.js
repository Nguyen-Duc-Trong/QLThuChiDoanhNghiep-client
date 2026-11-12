// Danh mục tra cứu giả lập cho các ô AsyncAutoComplete khi chưa có API.
import { SYSTEM_USERS } from './data'

export const BENEFICIARIES = [
  { id: 'NTH-01', name: 'Công ty TNHH Sao Việt', taxCode: '0312345678' },
  { id: 'NTH-02', name: 'Công ty CP Truyền thông Ánh Dương', taxCode: '0109876543' },
  { id: 'NTH-03', name: 'Công ty TNHH In ấn Hưng Phát', taxCode: '0301122334' },
  { id: 'NTH-04', name: 'Công ty CP Sự kiện Kim Cương', taxCode: '0315566778' },
  { id: 'NTH-05', name: 'Công ty TNHH Nghiên cứu thị trường Việt', taxCode: '0108899001' },
]

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Giả lập API tìm kiếm có độ trễ để thấy trạng thái đang tải.
function createSearch(items, fields) {
  return async ({ search = '', limit = 20 }) => {
    await wait(400)
    const keyword = search.trim().toLowerCase()
    return items.filter((item) => !keyword || fields.some((f) => String(item[f]).toLowerCase().includes(keyword))).slice(0, limit)
  }
}

export const searchBeneficiaries = createSearch(BENEFICIARIES, ['name', 'taxCode'])
export const searchUsers = createSearch(SYSTEM_USERS, ['name', 'email'])
