import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  Grid,
  TextField,
  MenuItem,
  Typography,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import DataTable, { Column } from '../components/common/DataTable'
import StatusBadge from '../components/common/StatusBadge'

const mockProposals = [
  {
    id: '1',
    leadName: 'John Smith',
    systemSize: 6.5,
    cost: 18500,
    savings: 1250,
    status: 'sent',
    sentDate: '2024-03-15',
    expiryDate: '2024-04-14',
  },
  {
    id: '2',
    leadName: 'Sarah Johnson',
    systemSize: 8.2,
    cost: 22400,
    savings: 1580,
    status: 'accepted',
    sentDate: '2024-03-14',
    expiryDate: '2024-04-13',
  },
  {
    id: '3',
    leadName: 'Lisa Anderson',
    systemSize: 5.8,
    cost: 16800,
    savings: 1120,
    status: 'sent',
    sentDate: '2024-03-12',
    expiryDate: '2024-04-11',
  },
]

interface Proposal {
  id: string
  leadName: string
  systemSize: number
  cost: number
  savings: number
  status: string
  sentDate: string
  expiryDate: string
}

const columns: Column<Proposal>[] = [
  { id: 'leadName', label: 'Lead Name', sortable: true },
  {
    id: 'systemSize',
    label: 'System Size',
    width: 120,
    render: (value) => `${value} kW`,
  },
  {
    id: 'cost',
    label: 'Cost',
    width: 120,
    align: 'right',
    render: (value) => `$${value.toLocaleString()}`,
  },
  {
    id: 'savings',
    label: 'Annual Savings',
    width: 140,
    align: 'right',
    render: (value) => `$${value.toLocaleString()}`,
  },
  { id: 'sentDate', label: 'Sent Date', width: 120 },
  { id: 'expiryDate', label: 'Expires', width: 120 },
  {
    id: 'status',
    label: 'Status',
    width: 120,
    render: (value) => <StatusBadge status={value === 'sent' ? 'proposal_sent' : 'converted'} />,
  },
]

export default function Proposals() {
  const [filters, setFilters] = useState({ status: '', search: '' })
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals)

  const filteredProposals = proposals.filter((proposal) => {
    if (filters.status && proposal.status !== filters.status) return false
    if (
      filters.search &&
      !proposal.leadName.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false
    return true
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Proposals
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />}>
          Generate Proposal
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
              label="Status"
              fullWidth
              size="small"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="sent">Sent</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredProposals}
        selectable
        emptyMessage="No proposals found"
      />
    </Box>
  )
}
