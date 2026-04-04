import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Divider,
} from '@mui/material'
import { ViewList as ViewListIcon } from '@mui/icons-material'
import StatusBadge from '../components/common/StatusBadge'

const dealStages = [
  'new_deal',
  'proposal_sent_deal',
  'payment_selected',
  'contract_signed',
  'permit',
  'installing',
  'inspection',
  'pto',
  'live',
]

const stageLabels: Record<string, string> = {
  new_deal: 'New',
  proposal_sent_deal: 'Proposal Sent',
  payment_selected: 'Payment Selected',
  contract_signed: 'Contract Signed',
  permit: 'Permit',
  installing: 'Installing',
  inspection: 'Inspection',
  pto: 'PTO',
  live: 'Live',
}

const mockDeals = [
  { id: '1', leadName: 'John Smith', stage: 'contract_signed', systemSize: 6.5, totalPrice: 18500 },
  { id: '2', leadName: 'Sarah Johnson', stage: 'payment_selected', systemSize: 8.2, totalPrice: 22400 },
  { id: '3', leadName: 'Michael Brown', stage: 'live', systemSize: 7.1, totalPrice: 20100 },
  { id: '4', leadName: 'Emily Davis', stage: 'new_deal', systemSize: 5.8, totalPrice: 16800 },
  { id: '5', leadName: 'Lisa Anderson', stage: 'proposal_sent_deal', systemSize: 6.2, totalPrice: 17600 },
  { id: '6', leadName: 'James Wilson', stage: 'installing', systemSize: 8.5, totalPrice: 24000 },
]

interface Deal {
  id: string
  leadName: string
  stage: string
  systemSize: number
  totalPrice: number
}

export default function Deals() {
  const navigate = useNavigate()
  const [viewType, setViewType] = useState<'kanban' | 'list'>('kanban')
  const [filters, setFilters] = useState({ installer: '', search: '' })
  const [deals] = useState<Deal[]>(mockDeals)

  const dealsByStage = dealStages.reduce(
    (acc, stage) => {
      acc[stage] = deals.filter((d) => d.stage === stage)
      return acc
    },
    {} as Record<string, Deal[]>
  )

  const DealCard = ({ deal }: { deal: Deal }) => (
    <Paper
      onClick={() => navigate(`/deals/${deal.id}`)}
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: '#181818',
        border: '1px solid #262626',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: '#F59E0B',
          backgroundColor: '#1F2937',
        },
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#D4D4D4', mb: 0.5 }}>
        {deal.leadName}
      </Typography>
      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1 }}>
        {deal.systemSize} kW • ${deal.totalPrice.toLocaleString()}
      </Typography>
    </Paper>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Deal Pipeline
        </Typography>
        <Button
          variant={viewType === 'list' ? 'contained' : 'outlined'}
          startIcon={<ViewListIcon />}
          onClick={() => setViewType(viewType === 'kanban' ? 'list' : 'kanban')}
        >
          {viewType === 'kanban' ? 'List View' : 'Kanban View'}
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              placeholder="Search by lead name"
              fullWidth
              size="small"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label="Installer"
              fullWidth
              size="small"
              value={filters.installer}
              onChange={(e) => setFilters({ ...filters, installer: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            >
              <MenuItem value="">All Installers</MenuItem>
              <MenuItem value="installer1">SolarTech Solutions</MenuItem>
              <MenuItem value="installer2">Green Energy Pro</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Kanban View */}
      {viewType === 'kanban' && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 2,
          }}
        >
          {dealStages.map((stage) => (
            <Card
              key={stage}
              sx={{
                backgroundColor: '#111111',
                border: '1px solid #262626',
                p: 2,
                minHeight: '600px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {stageLabels[stage]}
                </Typography>
                <Typography
                  sx={{
                    ml: 'auto',
                    backgroundColor: '#1F2937',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '50%',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#F59E0B',
                  }}
                >
                  {dealsByStage[stage].length}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2, borderColor: '#262626' }} />
              <Box sx={{ flex: 1, overflowY: 'auto' }}>
                {dealsByStage[stage].map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* List View */}
      {viewType === 'list' && (
        <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
          <Box>
            {deals.map((deal, idx) => (
              <Box
                key={deal.id}
                onClick={() => navigate(`/deals/${deal.id}`)}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.5,
                  px: 2,
                  borderBottom: idx !== deals.length - 1 ? '1px solid #262626' : 'none',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#1F2937' },
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: '#D4D4D4', fontWeight: 500 }}>
                    {deal.leadName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    {deal.systemSize} kW • ${deal.totalPrice.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <StatusBadge status={deal.stage} />
                </Box>
              </Box>
            ))}
          </Box>
        </Card>
      )}
    </Box>
  )
}
