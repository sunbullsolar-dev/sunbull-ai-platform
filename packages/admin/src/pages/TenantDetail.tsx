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
} from '@mui/material'
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material'
import StatusBadge from '../components/common/StatusBadge'

const mockTenantDetail = {
  id: '1',
  company: 'EnergyHub Solar',
  plan: 'Enterprise',
  monthlyFee: 5000,
  leadVolume: 450,
  status: 'active_tenant',
  domain: 'energyhub.sunbull.ai',
  contact: 'Jane Doe',
  email: 'jane@energyhub.com',
  phone: '555-0301',
  startDate: '2023-01-15',
  currency: 'USD',
  logoUrl: 'https://via.placeholder.com/100',
  primaryColor: '#3B82F6',
  secondaryColor: '#1F2937',
}

const usage = [
  { month: 'January', leads: 450, proposals: 180, deals: 45 },
  { month: 'February', leads: 420, proposals: 175, deals: 42 },
  { month: 'March', leads: 480, proposals: 195, deals: 48 },
]

export default function TenantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tenants')}
          sx={{ color: '#9CA3AF' }}
        >
          Back to Tenants
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          {mockTenantDetail.company}
        </Typography>
        <Button variant="outlined" startIcon={<EditIcon />}>
          Edit
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Account Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Account Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Contact
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockTenantDetail.contact}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Email
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockTenantDetail.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Phone
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockTenantDetail.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Start Date
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockTenantDetail.startDate}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Plan & Billing */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Plan & Billing
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Plan
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockTenantDetail.plan}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Monthly Fee
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>
                  ${mockTenantDetail.monthlyFee.toLocaleString()} {mockTenantDetail.currency}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusBadge status={mockTenantDetail.status} />
                </Box>
              </Box>
              <Divider sx={{ borderColor: '#262626', my: 1 }} />
              <TextField
                select
                label="Change Status"
                fullWidth
                size="small"
                defaultValue="active_tenant"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#181818',
                  },
                }}
              >
                <MenuItem value="trial">Trial</MenuItem>
                <MenuItem value="active_tenant">Active</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="cancelled_tenant">Cancelled</MenuItem>
              </TextField>
            </Box>
          </Card>
        </Grid>

        {/* Domain & Branding */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Domain & Branding
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Domain
                </Typography>
                <Typography sx={{ color: '#D4D4D4', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                  {mockTenantDetail.domain}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Primary Color
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      backgroundColor: mockTenantDetail.primaryColor,
                      borderRadius: '4px',
                      border: '1px solid #404040',
                    }}
                  />
                  <Typography sx={{ color: '#D4D4D4' }}>
                    {mockTenantDetail.primaryColor}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Secondary Color
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      backgroundColor: mockTenantDetail.secondaryColor,
                      borderRadius: '4px',
                      border: '1px solid #404040',
                    }}
                  />
                  <Typography sx={{ color: '#D4D4D4' }}>
                    {mockTenantDetail.secondaryColor}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Usage Stats */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Usage Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Total Leads
                </Typography>
                <Typography sx={{ color: '#D4D4D4', fontWeight: 600, fontSize: '1.25rem' }}>
                  {mockTenantDetail.leadVolume}
                </Typography>
              </Box>
              <Button variant="outlined" fullWidth>
                View Detailed Usage
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Usage History */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Usage History
            </Typography>
            <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#181818' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#D4D4D4' }}>Month</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#D4D4D4' }}>
                      Leads
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#D4D4D4' }}>
                      Proposals
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#D4D4D4' }}>
                      Deals
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usage.map((row, idx) => (
                    <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#1F2937' } }}>
                      <TableCell sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}>
                        {row.month}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}>
                        {row.leads}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}>
                        {row.proposals}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}>
                        {row.deals}
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
