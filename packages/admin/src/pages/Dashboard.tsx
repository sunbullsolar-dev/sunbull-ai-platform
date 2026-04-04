import { Box, Grid, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import StatCard from '../components/common/StatCard'
import StatusBadge from '../components/common/StatusBadge'

// Mock data
const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
]

const funnelData = [
  { name: 'Leads', value: 450 },
  { name: 'Qualified', value: 320 },
  { name: 'Proposal Sent', value: 180 },
  { name: 'Deals Closed', value: 95 },
]

const topInstallers = [
  { id: 1, company: 'SolarTech Solutions', completedJobs: 28, nps: 92, state: 'CA' },
  { id: 2, company: 'Green Energy Pro', completedJobs: 24, nps: 88, state: 'TX' },
  { id: 3, company: 'Sustainable Power', completedJobs: 21, nps: 85, state: 'FL' },
  { id: 4, company: 'EcoInstall Inc', completedJobs: 19, nps: 82, state: 'NY' },
  { id: 5, company: 'Sun Power Installers', completedJobs: 17, nps: 79, state: 'AZ' },
]

const recentActivity = [
  { id: 1, lead: 'John Smith', action: 'New lead added', time: '2 hours ago', status: 'new' },
  { id: 2, lead: 'Sarah Johnson', action: 'Proposal sent', time: '4 hours ago', status: 'proposal_sent' },
  { id: 3, lead: 'Michael Brown', action: 'Deal closed', time: '6 hours ago', status: 'converted' },
  { id: 4, lead: 'Emily Davis', action: 'Proposal approved', time: '8 hours ago', status: 'qualified' },
  { id: 5, lead: 'James Wilson', action: 'Lead contacted', time: '10 hours ago', status: 'contacted' },
]

export default function Dashboard() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Dashboard
        </Typography>

        {/* Stat Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard label="Total Leads (This Month)" value={145} trend={12} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard label="Active Proposals" value={32} trend={5} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard label="Deals Closed (This Month)" value={18} trend={8} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard label="Revenue (This Month)" value="$487K" trend={15} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard label="Conversion Rate" value="12.4%" trend={2.3} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard label="Avg Proposal Time" value="4.2 days" trend={-0.5} />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Revenue Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#181818', border: '1px solid #262626' }} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B' }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Lead Funnel
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis type="number" stroke="#6B7280" />
                  <YAxis dataKey="name" type="category" stroke="#6B7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#181818', border: '1px solid #262626' }} />
                  <Bar dataKey="value" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* Top Installers */}
        <Card sx={{ p: 3, mb: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Top Installers
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#181818' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#D4D4D4' }}>Company</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#D4D4D4' }}>
                    Completed Jobs
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#D4D4D4' }}>
                    NPS Score
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#D4D4D4' }}>
                    State
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topInstallers.map((installer) => (
                  <TableRow key={installer.id} sx={{ '&:hover': { backgroundColor: '#1F2937' } }}>
                    <TableCell sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}>
                      {installer.company}
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}>
                      {installer.completedJobs}
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}>
                      <StatusBadge status="active" />
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}>
                      {installer.state}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Recent Activity */}
        <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Recent Activity
          </Typography>
          <Box>
            {recentActivity.map((activity) => (
              <Box
                key={activity.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.5,
                  borderBottom: '1px solid #262626',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: '#D4D4D4', fontWeight: 500 }}>
                    {activity.lead}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    {activity.action}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <StatusBadge status={activity.status} />
                  <Typography variant="caption" sx={{ color: '#6B7280', minWidth: '80px', textAlign: 'right' }}>
                    {activity.time}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>
    </Box>
  )
}
