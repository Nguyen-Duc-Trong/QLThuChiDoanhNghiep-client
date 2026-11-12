import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

/**
 * Thanh tab dùng chung.
 * tabs: [{ value, label, count?, disabled? }] — có count thì hiển thị "Nhãn (count)".
 * <CustomTab value={tab} onChange={setTab} tabs={[{ value: 'profile', label: 'Hồ sơ' }, { value: 'history', label: 'Lịch sử', count: 3 }]} />
 */
export default function CustomTab({ value, onChange, tabs, variant = 'scrollable', sx }) {
  return (
    <Tabs value={value} onChange={(_, next) => onChange?.(next)} variant={variant} scrollButtons="auto" allowScrollButtonsMobile sx={sx}>
      {tabs.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={tab.count === undefined ? tab.label : `${tab.label} (${tab.count})`}
          disabled={tab.disabled}
        />
      ))}
    </Tabs>
  )
}
