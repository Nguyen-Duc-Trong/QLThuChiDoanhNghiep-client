import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { BarChart } from '@mui/x-charts/BarChart'
import { colors } from '../../theme/tokens'

const CHART_COLORS = [colors.primary, '#5BAA97', '#E2A03F', '#8A90A0']

/**
 * Biểu đồ cột nhóm (Đã chi / Cam kết chưa chi theo tháng).
 * categories: ['T5', 'T6', ...]
 * series: [{ label, data: number[], color? }]
 * note: chữ phụ cạnh chú giải, ví dụ "Cập nhật 22/10/2026".
 */
export default function SpendingBarChart({ categories, series, height = 260, note, valueFormatter }) {
  const coloredSeries = series.map((s, i) => ({ ...s, color: s.color ?? CHART_COLORS[i % CHART_COLORS.length], valueFormatter }))

  return (
    <Box>
      <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
        {coloredSeries.map((s) => (
          <Stack key={s.label} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
            <Typography variant="body2" sx={{ color: s.color }}>{s.label}</Typography>
          </Stack>
        ))}
        {note && <Typography variant="body2" color="text.secondary">{note}</Typography>}
      </Stack>
      <BarChart
        height={height}
        hideLegend
        borderRadius={4}
        grid={{ horizontal: false }}
        xAxis={[{ scaleType: 'band', data: categories, categoryGapRatio: 0.55, barGapRatio: 0.1, disableLine: true, disableTicks: true }]}
        yAxis={[{ position: 'none' }]}
        series={coloredSeries}
        margin={{ left: 8, right: 8, top: 16, bottom: 8 }}
      />
    </Box>
  )
}
