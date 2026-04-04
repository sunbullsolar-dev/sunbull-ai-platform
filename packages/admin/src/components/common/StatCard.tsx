import { Card, Box, Typography, Chip } from '@mui/material'
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material'

interface StatCardProps {
  label: string
  value: string | number
  trend?: number
  unit?: string
  color?: 'primary' | 'success' | 'error' | 'info' | 'warning'
}

export default function StatCard({ label, value, trend, unit, color = 'primary' }: StatCardProps) {
  const isPositive = trend ? trend >= 0 : false
  const trendColor = isPositive ? 'success' : 'error'

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: '12px',
        backgroundColor: '#111111',
        border: '1px solid #262626',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: '#1F2937',
          borderColor: '#404040',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 1, fontWeight: 500 }}>
            {label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#D4D4D4',
              }}
            >
              {value}
            </Typography>
            {unit && (
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                {unit}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {trend !== undefined && (
        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip
            icon={isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
            label={`${isPositive ? '+' : ''}${trend}%`}
            size="small"
            color={trendColor}
            variant="outlined"
            sx={{
              borderRadius: '6px',
              height: 'auto',
              '& .MuiChip-label': {
                fontSize: '0.75rem',
                fontWeight: 600,
                px: 0.5,
              },
            }}
          />
          <Typography variant="caption" sx={{ color: '#6B7280' }}>
            vs last month
          </Typography>
        </Box>
      )}
    </Card>
  )
}
