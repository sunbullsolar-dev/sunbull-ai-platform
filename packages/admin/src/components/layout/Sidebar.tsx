import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Assessment as AssessmentIcon,
  ReceiptLong as ReceiptLongIcon,
} from '@mui/icons-material'

const DRAWER_WIDTH = 260
const DRAWER_WIDTH_COLLAPSED = 80

interface NavSection {
  title: string
  items: NavItem[]
}

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Leads', path: '/leads', icon: <PeopleIcon /> },
      { label: 'Proposals', path: '/proposals', icon: <DescriptionIcon /> },
      { label: 'Deals', path: '/deals', icon: <TrendingUpIcon /> },
      { label: 'Installers', path: '/installers', icon: <BuildIcon /> },
    ],
  },
  {
    title: 'Platform',
    items: [
      { label: 'Tenants', path: '/tenants', icon: <ReceiptLongIcon /> },
      { label: 'Analytics', path: '/analytics', icon: <AssessmentIcon /> },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
    ],
  },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#111111',
          borderRight: '1px solid #262626',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem 1rem',
          borderBottom: '1px solid #262626',
        }}
      >
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#000',
              }}
            >
              S
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
              Sunbull
            </Typography>
          </Box>
        )}
        <IconButton
          size="small"
          onClick={() => setCollapsed(!collapsed)}
          sx={{ color: '#D4D4D4' }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <Box sx={{ overflowY: 'auto', flexGrow: 1, py: 2 }}>
        {navSections.map((section, idx) => (
          <Box key={idx}>
            {!collapsed && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  px: 2,
                  py: 1,
                  fontWeight: 600,
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  letterSpacing: '0.5px',
                }}
              >
                {section.title}
              </Typography>
            )}
            <List sx={{ py: 0 }}>
              {section.items.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      backgroundColor: isActive(item.path) ? '#1F2937' : 'transparent',
                      borderLeft: isActive(item.path) ? '3px solid #F59E0B' : '3px solid transparent',
                      color: isActive(item.path) ? '#F59E0B' : '#9CA3AF',
                      px: 2,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: '#1F2937',
                        color: '#F59E0B',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 40,
                        color: 'inherit',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: isActive(item.path) ? 600 : 500,
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            {idx < navSections.length - 1 && !collapsed && (
              <Divider sx={{ my: 1, borderColor: '#262626' }} />
            )}
          </Box>
        ))}
      </Box>
    </Drawer>
  )
}
