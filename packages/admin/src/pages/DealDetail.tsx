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

const mockDealDetail = {
  id: '1',
  leadId: '1',
  leadName: 'John Smith',
  stage: 'contract_signed',
  systemSize: 6.5,
  totalPrice: 18500,
  paymentOption: '20 Year Loan',
  lenderName: 'SunLight Finance',
  commissionAmount: 2775,
  installerId: 'inst1',
  installerName: 'SolarTech Solutions',
  createdAt: '2024-03-15',
  contractSignedDate: '2024-03-20',
  permitSubmittedDate: null,
}

const timeline = [
  { stage: 'New Deal', date: '2024-03-15', status: 'completed' },
  { stage: 'Proposal Sent', date: '2024-03-16', status: 'completed' },
  { stage: 'Payment Selected', date: '2024-03-18', status: 'completed' },
  { stage: 'Contract Signed', date: '2024-03-20', status: 'completed' },
  { stage: 'Permit', date: null, status: 'pending' },
  { stage: 'Installing', date: null, status: 'pending' },
  { stage: 'Inspection', date: null, status: 'pending' },
  { stage: 'PTO', date: null, status: 'pending' },
  { stage: 'Live', date: null, status: 'pending' },
]

export default function DealDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/deals')}
          sx={{ color: '#9CA3AF' }}
        >
          Back to Deals
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          {mockDealDetail.leadName}
        </Typography>
        <Button variant="outlined" startIcon={<EditIcon />}>
          Edit
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Deal Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Deal Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Current Stage
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusBadge status={mockDealDetail.stage} />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  System Size
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockDealDetail.systemSize} kW</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Total Price
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>
                  ${mockDealDetail.totalPrice.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Installer Commission
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>
                  ${mockDealDetail.commissionAmount.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Financial Details */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Payment & Finance
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Payment Option
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockDealDetail.paymentOption}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Lender
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockDealDetail.lenderName}</Typography>
              </Box>
              <Divider sx={{ borderColor: '#262626', my: 1 }} />
              <TextField
                select
                label="Change Stage"
                fullWidth
                size="small"
                defaultValue={mockDealDetail.stage}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#181818',
                  },
                }}
              >
                <MenuItem value="new_deal">New</MenuItem>
                <MenuItem value="proposal_sent_deal">Proposal Sent</MenuItem>
                <MenuItem value="payment_selected">Payment Selected</MenuItem>
                <MenuItem value="contract_signed">Contract Signed</MenuItem>
                <MenuItem value="permit">Permit</MenuItem>
                <MenuItem value="installing">Installing</MenuItem>
                <MenuItem value="inspection">Inspection</MenuItem>
                <MenuItem value="pto">PTO</MenuItem>
                <MenuItem value="live">Live</MenuItem>
              </TextField>
            </Box>
          </Card>
        </Grid>

        {/* Installer Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Installer
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Company
                </Typography>
                <Typography sx={{ color: '#D4D4D4' }}>{mockDealDetail.installerName}</Typography>
              </Box>
              <Button variant="outlined" fullWidth>
                View Installer Profile
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Documents */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Documents
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
                📄 Contract.pdf
              </Button>
              <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
                📋 Proposal.pdf
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Timeline */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Deal Timeline
            </Typography>
            <Box>
              {timeline.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    pb: 2,
                    position: 'relative',
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor:
                          item.status === 'completed' ? '#10B981' : '#404040',
                        border: '2px solid #111111',
                        zIndex: 1,
                      }}
                    />
                    {idx !== timeline.length - 1 && (
                      <Box
                        sx={{
                          width: 2,
                          height: 60,
                          backgroundColor:
                            item.status === 'completed' ? '#10B981' : '#262626',
                          mt: -1,
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ pt: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#D4D4D4' }}>
                      {item.stage}
                    </Typography>
                    {item.date && (
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>
                        {item.date}
                      </Typography>
                    )}
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
