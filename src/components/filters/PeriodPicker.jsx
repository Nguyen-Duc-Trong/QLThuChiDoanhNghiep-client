import { CalendarDays } from 'lucide-react'
import FilterSelect from './FilterSelect'

function buildMonthOptions(year) {
  return Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0')
    return { value: `${year}-${month}`, label: `Tháng ${month}/${year}` }
  })
}

/**
 * Bộ lọc kỳ báo cáo: "Tháng 10/2026". value dạng "YYYY-MM".
 * options: truyền vào nếu cần kỳ khác (quý, năm); mặc định là 12 tháng của năm trong value.
 */
export default function PeriodPicker({ value, onChange, options }) {
  const year = value?.slice(0, 4) ?? new Date().getFullYear()
  return (
    <FilterSelect
      value={value}
      options={options ?? buildMonthOptions(year)}
      onChange={onChange}
      icon={CalendarDays}
      showChevron={false}
    />
  )
}
