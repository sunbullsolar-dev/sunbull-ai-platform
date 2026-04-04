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
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import DataTable, { Column } from '../components/common/DataTable'
import StatusBadge from '../components/common/StatusBadge'

// Mock data
const mockLeads = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '555-0101',
    address: '123 Oak St, Los Angeles, CA',
    state: 'CA',
    source: 'Website',
    status: 'qualified',
    score: 85,
    createdAt: '2024-03-15',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '555-0102',
    address: '456 Maple Ave, Houston, TX',
    state: 'TX',
    source: 'Google Ads',
    status: 'proposal_sent',
    score: 75,
    createdAt: '2024-03-14',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'mbrown@email.com',
    phone: '555-0103',
    address: '789 Pine Rd, Phoenix, AZ',
    state: 'AZ',
    source: 'Referral',
    status: 'converted',
    score: 92,
    createdAt: '2024-03-13',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@email.com',
    phone: '555-0104',
    address: '321 Elm St, Philadelphia, PA',
    state: 'PA',
    source: 'Website',
    status: 'new',
    score: 45,
    createdAt: '2024-03-12',
  },
  {
    id: '5',
    name: 'James Wilson',
    email: 'jwilson@email.com',
    phone: '555-0105',
    address: '654 Birch Ln, San Antonio, TX',
    state: 'TX',
    source: 'Phone',
    status: 'contacted',
    score: 62,
    createdAt: '2024-03-11',
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    phone: '555-0106',
    address: '987 Cedar Ct, San Diego, CA',
    state: 'CA',
    source: 'Social Media',
    status: 'qualified',
    score: 88,
    createdAt: '2024-03-10',
  },
]

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  address: string
  state: string
  source: string
  status: string
  score: number
  createdAt: string
}

const columns: Column<Lead>[] = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'email', label: 'Email', width: 200 },
  { id: 'phone', label: 'Phone', width: 130 },
  { id: 'state', label: 'State', width: 80, align: 'center' },
  { id: 'source', label: 'Source', width: 120 },
  {
    id: 'status',
    label: 'Status',
    width: 120,
    render: (value) => <StatusBadge status={value} />,
  },
  {
    id: 'score',
    label: 'Score',
    width: 80,
    align: 'center',
    render: (value) => (
      <Typography
        sx={{
          color: value >= 80 ? '#10B981' : value >= 60 ? '#F59E0B' : '#EF4444',
          fontWeight: 600,
        }}
      >
        {value}
      </Typography>
    ),
  },
]

export default function Leads() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ status: '', source: '', search: '' })
  const [leads, setLeads] = useState<Lead[]>(mockLeads)

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const filteredLeads = leads.filter((lead) => {
    if (filters.status && lead.status !== filters.status) return false
    if (filters.source && lead.source !== filters.source) return false
    if (
      filters.search &&
      !lead.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !lead.email.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false
    return true
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Leads
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />}>
          Add Lead
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              placeholder="Search by name or email"
              fullWidth
              size="small"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Status"
              fullWidth
              size="small"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="contacted">Contacted</MenuItem>
              <MenuItem value="qualified">Qualified</MenuItem>
              <MenuItem value="proposal_sent">Proposal Sent</MenuItem>
              <MenuItem value="converted">Converted</MenuItem>
              <MenuItem value="lost">Lost</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Source"
              fullWidth
              size="small"
              value={filters.source}
              onChange={(e) => handleFilterChange('source', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            >
              <MenuItem value="">All Sources</MenuItem>
              <MenuItem value="Website">Website</MenuItem>
              <MenuItem value="Google Ads">Google Ads</MenuItem>
              <MenuItem value="Referral">Referral</MenuItem>
              <MenuItem value="Phone">Phone</MenuItem>
              <MenuItem value="Social Media">Social Media</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="outlined" sx={{ height: 40 }}>
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredLeads}
        onRowClick={(lead) => navigate(`/leads/${lead.id}`)}
        selectable
        emptyMessage="No leads found"
      />
    </Box>
  )
}
