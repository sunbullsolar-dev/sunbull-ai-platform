import {
  AppBar,
  Box,
  Toolbar,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { useState } from 'react'

export default function TopBar() {
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null)
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null)

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#111111',
        borderBottom: '1px solid #262626',
        boxShadow: 'none',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: '#111111',
          px: 3,
        }}
      >
        <TextField
          placeholder="Search leads, deals, installers..."
          variant="outlined"
          size="small"
          sx={{
            width: '300px',
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#181818',
              '& fieldset': {
                borderColor: '#404040',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#6B7280', mr: 1 }} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={(e) => setNotificationAnchor(e.currentTarget)}
            sx={{ color: '#D4D4D4' }}
          >
            <Badge badgeContent={3} color="warning">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={() => setNotificationAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem sx={{ backgroundColor: '#111111', color: '#D4D4D4' }}>
              New lead assigned
            </MenuItem>
            <MenuItem sx={{ backgroundColor: '#111111', color: '#D4D4D4' }}>
              Proposal approved
            </MenuItem>
            <MenuItem sx={{ backgroundColor: '#111111', color: '#D4D4D4' }}>
              Deal stage updated
            </MenuItem>
          </Menu>

          <IconButton
            onClick={(e) => setUserAnchor(e.currentTarget)}
            sx={{ ml: 1 }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                backgroundColor: '#F59E0B',
                color: '#000',
                fontWeight: 'bold',
              }}
            >
              AD
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={userAnchor}
            open={Boolean(userAnchor)}
            onClose={() => setUserAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem sx={{ backgroundColor: '#111111', color: '#D4D4D4' }}>
              <Avatar sx={{ width: 24, height: 24, mr: 2, backgroundColor: '#F59E0B' }}>
                AD
              </Avatar>
              Admin User
            </MenuItem>
            <MenuItem sx={{ backgroundColor: '#111111', color: '#D4D4D4' }}>
              <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
              Profile Settings
            </MenuItem>
            <MenuItem sx={{ backgroundColor: '#111111', color: '#D4D4D4' }}>
              <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
