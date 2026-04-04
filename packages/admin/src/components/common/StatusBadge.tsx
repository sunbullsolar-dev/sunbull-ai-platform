import { Chip, ChipProps } from '@mui/material'

interface StatusBadgeProps extends Omit<ChipProps, 'label' | 'color'> {
  status: string
  variant?: 'filled' | 'outlined'
}

const statusConfig: Record<string, { color: any; label: string }> = {
  // Leads
  'new': { color: 'info', label: 'New' },
  'contacted': { color: 'info', label: 'Contacted' },
  'qualified': { color: 'warning', label: 'Qualified' },
  'proposal_sent': { color: 'warning', label: 'Proposal Sent' },
  'lost': { color: 'error', label: 'Lost' },
  'converted': { color: 'success', label: 'Converted' },
  
  // Deals
  'new_deal': { color: 'info', label: 'New' },
  'proposal_sent_deal': { color: 'info', label: 'Proposal Sent' },
  'payment_selected': { color: 'warning', label: 'Payment Selected' },
  'contract_signed': { color: 'warning', label: 'Contract Signed' },
  'permit': { color: 'warning', label: 'Permit' },
  'installing': { color: 'warning', label: 'Installing' },
  'inspection': { color: 'warning', label: 'Inspection' },
  'pto': { color: 'warning', label: 'PTO' },
  'live': { color: 'success', label: 'Live' },
  'cancelled': { color: 'error', label: 'Cancelled' },
  
  // Installers
  'active': { color: 'success', label: 'Active' },
  'inactive': { color: 'error', label: 'Inactive' },
  'suspended': { color: 'error', label: 'Suspended' },
  'pending': { color: 'warning', label: 'Pending' },
  
  // Tenants
  'trial': { color: 'info', label: 'Trial' },
  'active_tenant': { color: 'success', label: 'Active' },
  'cancelled_tenant': { color: 'error', label: 'Cancelled' },
  'paused': { color: 'warning', label: 'Paused' },
}

export default function StatusBadge({ status, variant = 'outlined', ...props }: StatusBadgeProps) {
  const config = statusConfig[status] || { color: 'default', label: status }

  return (
    <Chip
      label={config.label}
      color={config.color}
      variant={variant}
      size="small"
      {...props}
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
        height: 24,
        ...props.sx,
      }}
    />
  )
}
