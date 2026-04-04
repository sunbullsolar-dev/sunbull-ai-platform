import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  Grid,
  Typography,
  Button,
  Divider,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
} from '@mui/material'
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import StatusBadge from '../components/common/StatusBadge'

const mockInstallerDetail = {
  id: '1',
  company: 'SolarTech Solutions',
  contact: 'John Davis',
  email: 'john@solartech.com',
  phone: '555-0201',
  state: 'CA',
  status: 'active',
  nps: 92,
  permitRate: 98,
  avgInstallDays: 8,
  capacity: 15,
  certifications: ['NABCEP', 'OSHA 30', 'Electrical License'],
}

const npsTrend = [
  { month: 'Jan', nps: 85 },
  { month: 'Feb', nps: 87 },
  { month: 'Mar', nps: 90 },
  { month: 'Apr', nps: 92 },
]

const jobHistory = [
  { id: 1, leadName: 'John Smith', systemSize: 6.5, completedDate: '2024-03-15', status: 'live' },
  { id: 2, leadName: 'Sarah Johnson', systemSize: 8.2, completedDate: '2024-03-10', status: 'live' },
  { id: 3, leadName: 'Michael Brown', systemSize: 7.1, completedDate: '2024-03-05', status: 'live' },
]

export default function InstallerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/installers')}
          sx={{ color: '#9CA3AF' }}
        >
          Back to Installers
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          {mockInstallerDetail.company}
        </Typography>
        <Button variant="outlined" startIcon={<EditIcon />}>
          Edit
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Contact Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Contact Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Contact Person
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockInstallerDetail.contact}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Email
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockInstallerDetail.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Phone
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockInstallerDetail.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  State
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockInstallerDetail.state}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Status & Performance */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Status & Performance
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusBadge status={mockInstallerDetail.status} />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  NPS Score
                </Typography>
                <Typography sx={{ color: '#10B981', fontWeight: 600, fontSize: '1.5rem' }}>
                  {mockInstallerDetail.nps}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 0.5 }}>
                  Permit Rate: {mockInstallerDetail.permitRate}%
                </Typography>
                <LinearProgress variant="determinate" value={mockInstallerDetail.permitRate} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Avg Install Days
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockInstallerDetail.avgInstallDays} days</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Certifications */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Certifications
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {mockInstallerDetail.certifications.map((cert) => (
                <Typography key={cert} sx={{ color: '#D4D4D4', fontSize: '0.9rem' }}>
                  ✓ {cert}
                </Typography>
              ))}
            </Box>
          </Card>
        </Grid>

        {/* Capacity */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Capacity Management
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Available Capacity
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>
                  {mockInstallerDetail.capacity} slots
                </Typography>
              </Box>
              <TextField
                select
                label="Status"
                fullWidth
                size="small"
                defaultValue="active"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#181818',
                  },
                }}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </TextField>
            </Box>
          </Card>
        </Grid>

        {/* NPS Trend */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              NPS Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={npsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#181818', border: '1px solid #262626' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="nps"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Job History */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Recent Jobs
            </Typography>
            <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#181818' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#D4D4D4' }}>Lead</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#D4D4D4' }}>System Size</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#D4D4D4' }}>Completed</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#D4D4D4' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobHistory.map((job) => (
                    <TableRow key={job.id} sx={{ '&:hover': { backgroundColor: '#1F2937' } }}>
                      <TableCell sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}>
                        {job.leadName}
                      </TableCell>
                      <TableCell sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}>
                        {job.systemSize} kW
                      </TableCell>
                      <TableCell sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}>
                        {job.completedDate}
                      </TableCell>
                      <TableCell sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}>
                        <StatusBadge status="live" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
