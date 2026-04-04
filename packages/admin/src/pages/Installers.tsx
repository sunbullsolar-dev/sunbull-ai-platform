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

const mockInstallers = [
  {
    id: '1',
    company: 'SolarTech Solutions',
    contact: 'John Davis',
    state: 'CA',
    status: 'active',
    nps: 92,
    permitRate: 98,
    avgInstallDays: 8,
    capacity: 15,
  },
  {
    id: '2',
    company: 'Green Energy Pro',
    contact: 'Sarah Lee',
    state: 'TX',
    status: 'active',
    nps: 88,
    permitRate: 95,
    avgInstallDays: 9,
    capacity: 12,
  },
  {
    id: '3',
    company: 'Sustainable Power',
    contact: 'Michael Chen',
    state: 'FL',
    status: 'active',
    nps: 85,
    permitRate: 92,
    avgInstallDays: 10,
    capacity: 10,
  },
  {
    id: '4',
    company: 'EcoInstall Inc',
    contact: 'Emily Brown',
    state: 'NY',
    status: 'suspended',
    nps: 72,
    permitRate: 88,
    avgInstallDays: 12,
    capacity: 0,
  },
]

interface Installer {
  id: string
  company: string
  contact: string
  state: string
  status: string
  nps: number
  permitRate: number
  avgInstallDays: number
  capacity: number
}

const columns: Column<Installer>[] = [
  { id: 'company', label: 'Company', sortable: true },
  { id: 'contact', label: 'Contact', width: 150 },
  { id: 'state', label: 'State', width: 80, align: 'center' },
  {
    id: 'status',
    label: 'Status',
    width: 120,
    render: (value) => <StatusBadge status={value} />,
  },
  {
    id: 'nps',
    label: 'NPS Score',
    width: 100,
    align: 'right',
    render: (value) => (
      <Typography sx={{ color: '#10B981', fontWeight: 600 }}>
        {value}
      </Typography>
    ),
  },
  {
    id: 'permitRate',
    label: 'Permit Rate',
    width: 120,
    align: 'right',
    render: (value) => `${value}%`,
  },
  {
    id: 'avgInstallDays',
    label: 'Avg Install Days',
    width: 140,
    align: 'right',
  },
  {
    id: 'capacity',
    label: 'Capacity',
    width: 100,
    align: 'right',
  },
]

export default function Installers() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ state: '', status: '', search: '' })
  const [installers, setInstallers] = useState<Installer[]>(mockInstallers)

  const filteredInstallers = installers.filter((installer) => {
    if (filters.state && installer.state !== filters.state) return false
    if (filters.status && installer.status !== filters.status) return false
    if (
      filters.search &&
      !installer.company.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false
    return true
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Installers
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />}>
          Add Installer
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              placeholder="Search by company"
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
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="State"
              fullWidth
              size="small"
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            >
              <MenuItem value="">All States</MenuItem>
              <MenuItem value="CA">California</MenuItem>
              <MenuItem value="TX">Texas</MenuItem>
              <MenuItem value="FL">Florida</MenuItem>
              <MenuItem value="NY">New York</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredInstallers}
        onRowClick={(installer) => navigate(`/installers/${installer.id}`)}
        selectable
        emptyMessage="No installers found"
      />
    </Box>
  )
}
