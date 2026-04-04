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
  Chip,
} from '@mui/material'
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material'
import StatusBadge from '../components/common/StatusBadge'

// Mock data
const mockLeadDetail = {
  id: '1',
  name: 'John Smith',
  email: 'john.smith@email.com',
  phone: '555-0101',
  address: '123 Oak St, Los Angeles, CA',
  state: 'CA',
  zipCode: '90001',
  source: 'Website',
  status: 'qualified',
  score: 85,
  createdAt: '2024-03-15',
  utility: 'Los Angeles Department of Water and Power (LADWP)',
  monthlyBill: 180,
  homeownershipStatus: 'Owner',
  roofType: 'Asphalt Shingle',
  systemSize: 6.5,
  estimatedSavings: 1250,
}

const communications = [
  { id: 1, date: '2024-03-15', type: 'Call', summary: 'Initial consultation', user: 'Sales Rep 1' },
  { id: 2, date: '2024-03-14', type: 'Email', summary: 'System requirements sent', user: 'Sales Rep 1' },
  { id: 3, date: '2024-03-13', type: 'Form Submission', summary: 'Qualification form completed', user: 'Lead Source' },
]

const proposals = [
  {
    id: 1,
    date: '2024-03-15',
    systemSize: '6.5 kW',
    estimatedCost: 18500,
    estimatedSavings: 1250,
    status: 'sent',
  },
]

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/leads')}
          sx={{ color: '#9CA3AF' }}
        >
          Back to Leads
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          {mockLeadDetail.name}
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
                  Email
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockLeadDetail.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Phone
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockLeadDetail.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Address
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockLeadDetail.address}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Zip Code
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockLeadDetail.zipCode}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Utility & Property Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Property Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Utility Company
                </Typography>
                <Typography sx={{ color: '#D4D4D4', fontSize: '0.875rem' }}>
                  {mockLeadDetail.utility}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Monthly Bill
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>${mockLeadDetail.monthlyBill}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Roof Type
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockLeadDetail.roofType}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Ownership Status
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>
                  {mockLeadDetail.homeownershipStatus}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Lead Status */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Lead Status
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Current Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusBadge status={mockLeadDetail.status} />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Lead Score
                </Typography>
                <Typography sx={{ color: '#10B981', fontWeight: 600, fontSize: '1.5rem' }}>
                  {mockLeadDetail.score}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Source
                </Typography>
                <Chip label={mockLeadDetail.source} size="small" sx={{ mt: 0.5 }} />
              </Box>
              <Divider sx={{ borderColor: '#262626', my: 1 }} />
              <TextField
                select
                label="Change Status"
                fullWidth
                size="small"
                defaultValue="qualified"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#181818',
                  },
                }}
              >
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="contacted">Contacted</MenuItem>
                <MenuItem value="qualified">Qualified</MenuItem>
                <MenuItem value="proposal_sent">Proposal Sent</MenuItem>
                <MenuItem value="converted">Converted</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
              </TextField>
            </Box>
          </Card>
        </Grid>

        {/* System Estimate */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              System Estimate
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Recommended System Size
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockLeadDetail.systemSize} kW</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Estimated Annual Savings
                </Typography>
                <Typography sx={{ color: '#10B981', fontWeight: 600 }}>
                  ${mockLeadDetail.estimatedSavings.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Proposals */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Proposals
            </Typography>
            {proposals.length > 0 ? (
              <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#181818' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#D4D4D4' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#D4D4D4' }}>System Size</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: '#D4D4D4' }}>
                        Cost
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: '#D4D4D4' }}>
                        Annual Savings
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#D4D4D4' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {proposals.map((proposal) => (
                      <TableRow key={proposal.id} sx={{ '&:hover': { backgroundColor: '#1F2937' } }}>
                        <TableCell sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}>
                          {proposal.date}
                        </TableCell>
                        <TableCell sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}>
                          {proposal.systemSize}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}>
                          ${proposal.estimatedCost.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}>
                          ${proposal.estimatedSavings.toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}>
                          <StatusBadge status="proposal_sent" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography sx={{ color: '#6B7280' }}>No proposals yet</Typography>
            )}
          </Card>
        </Grid>

        {/* Communication History */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Communication History
            </Typography>
            <Box>
              {communications.map((comm, idx) => (
                <Box
                  key={comm.id}
                  sx={{
                    py: 2,
                    borderBottom: idx !== communications.length - 1 ? '1px solid #262626' : 'none',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#D4D4D4', fontWeight: 500 }}>
                        {comm.summary}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>
                        {comm.type} • {comm.user}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      {comm.date}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
