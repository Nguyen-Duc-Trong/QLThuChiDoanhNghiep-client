import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Link from '@mui/material/Link'
import { Building2, ChartNoAxesColumnIncreasing, ShieldCheck } from 'lucide-react'
import { colors, layout } from '../../theme/tokens'

function Brand({ name, tagline }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', px: 0.5 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 2,
          bgcolor: colors.primary,
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <ChartNoAxesColumnIncreasing size={18} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2 }}>{name}</Typography>
        <Typography sx={{ fontSize: 10, letterSpacing: '0.04em', color: colors.textSecondary }}>{tagline}</Typography>
      </Box>
    </Stack>
  )
}

function InfoBox({ icon, title, description, iconColor, stacked = false }) {
  const Icon = icon
  return (
    <Box sx={{ bgcolor: colors.surfaceMuted, borderRadius: 2, p: 1.5 }}>
      <Stack direction={stacked ? 'column' : 'row'} spacing={1} sx={{ alignItems: 'flex-start' }}>
        <Box sx={{ color: iconColor, display: 'flex', mt: '2px' }}>
          <Icon size={16} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{title}</Typography>
          {description && (
            <Typography sx={{ fontSize: 11, color: colors.textSecondary, mt: 0.25 }}>{description}</Typography>
          )}
        </Box>
      </Stack>
    </Box>
  )
}

/**
 * Thanh điều hướng bên trái.
 * navItems: [{ key, label, icon }]  (icon là component lucide-react)
 */
export default function Sidebar({
  brand = { name: 'An Việt', tagline: 'QUẢN TRỊ TÀI CHÍNH' },
  organization,
  navTitle = 'KHÔNG GIAN LÀM VIỆC',
  navItems = [],
  activeKey,
  onNavigate,
  scope,
  footer = { helpLabel: 'Trung tâm trợ giúp', copyright: 'An Việt Finance · 2026', onHelpClick: undefined },
}) {
  return (
    <Box
      component="nav"
      aria-label="Điều hướng chính"
      sx={{
        width: layout.sidebarWidth,
        flexShrink: 0,
        height: '100%',
        bgcolor: colors.surface,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        px: 2.25,
        py: 3.5,
        overflowY: 'auto',
      }}
    >
      <Brand {...brand} />

      {organization && (
        <InfoBox icon={Building2} title={organization.name} description={organization.description} iconColor={colors.textSecondary} />
      )}

      <Box>
        <Typography sx={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.04em', color: colors.textSecondary, px: 1.5, mb: 1 }}>
          {navTitle}
        </Typography>
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {navItems.map(({ key, label, icon: Icon }) => {
            const active = key === activeKey
            return (
              <ListItemButton
                key={key}
                selected={active}
                onClick={() => onNavigate?.(key)}
                sx={{
                  borderRadius: 2,
                  minHeight: 42,
                  px: 1.5,
                  color: active ? colors.primary : colors.textSecondary,
                  '&.Mui-selected': { bgcolor: colors.primarySoft },
                  '&.Mui-selected:hover': { bgcolor: colors.primarySoft },
                }}
              >
                {Icon && (
                  <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
                    <Icon size={17} />
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={label}
                  slotProps={{ primary: { sx: { fontSize: 13, fontWeight: active ? 600 : 400 } } }}
                />
              </ListItemButton>
            )
          })}
        </List>
      </Box>

      {scope && (
        <InfoBox icon={ShieldCheck} title={scope.title} description={scope.description} iconColor={colors.primary} stacked />
      )}

      {footer && (
        <Box sx={{ mt: 'auto', px: 0.5 }}>
          <Link
            component="button"
            underline="hover"
            onClick={footer.onHelpClick}
            sx={{ fontSize: 12, color: colors.textSecondary }}
          >
            {footer.helpLabel}
          </Link>
          <Typography sx={{ fontSize: 10, color: colors.textMuted, mt: 0.5 }}>{footer.copyright}</Typography>
        </Box>
      )}
    </Box>
  )
}
