import { Box } from '@mui/material'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#080808' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflowY: 'auto',
            backgroundColor: '#080808',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
