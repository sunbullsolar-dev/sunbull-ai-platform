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

const mockTenants = [
  {
    id: '1',
    company: 'EnergyHub Solar',
    plan: 'Enterprise',
    monthlyFee: 5000,
    leadVolume: 450,
    status: 'active_tenant',
  },
  {
    id: '2',
    company: 'GreenWave Solutions',
    plan: 'Professional',
    monthlyFee: 2500,
    leadVolume: 200,
    status: 'active_tenant',
  },
  {
    id: '3',
    company: 'Solar Innovations LLC',
    plan: 'Professional',
    monthlyFee: 2500,
    leadVolume: 180,
    status: 'active_tenant',
  },
  {
    id: '4',
    company: 'ClimateCore',
    plan: 'Startup',
    monthlyFee: 1000,
    leadVolume: 50,
    status: 'trial',
  },
]

interface Tenant {
  id: string
  company: string
  plan: string
  monthlyFee: number
  leadVolume: number
  status: string
}

const columns: Column<Tenant>[] = [
  { id: 'company', label: 'Company', sortable: true },
  { id: 'plan', label: 'Plan', width: 130 },
  {
    id: 'monthlyFee',
    label: 'Monthly Fee',
    width: 130,
    align: 'right',
    render: (value) => `$${value.toLocaleString()}`,
  },
  {
    id: 'leadVolume',
    label: 'Lead Volume',
    width: 130,
    align: 'right',
  },
  {
    id: 'status',
    label: 'Status',
    width: 120,
    render: (value) => <StatusBadge status={value} />,
  },
]

export default function Tenants() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ plan: '', status: '', search: '' })
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants)

  const filteredTenants = tenants.filter((tenant) => {
    if (filters.plan && tenant.plan !== filters.plan) return false
    if (filters.status && tenant.status !== filters.status) return false
    if (
      filters.search &&
      !tenant.company.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false
    return true
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          SaaS Tenants
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />}>
          Add Tenant
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
              label="Plan"
              fullWidth
              size="small"
              value={filters.plan}
              onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            >
              <MenuItem value="">All Plans</MenuItem>
              <MenuItem value="Startup">Startup</MenuItem>
              <MenuItem value="Professional">Professional</MenuItem>
              <MenuItem value="Enterprise">Enterprise</MenuItem>
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
              <MenuItem value="trial">Trial</MenuItem>
              <MenuItem value="active_tenant">Active</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
              <MenuItem value="cancelled_tenant">Cancelled</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredTenants}
        onRowClick={(tenant) => navigate(`/tenants/${tenant.id}`)}
        selectable
        emptyMessage="No tenants found"
      />
    </Box>
  )
}
