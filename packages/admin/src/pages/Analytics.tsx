import {
  Box,
  Card,
  Grid,
  Typography,
} from '@mui/material'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts'

const revenueData = [
  { month: 'Jan', revenue: 45000, target: 50000 },
  { month: 'Feb', revenue: 52000, target: 55000 },
  { month: 'Mar', revenue: 48000, target: 52000 },
  { month: 'Apr', revenue: 61000, target: 60000 },
  { month: 'May', revenue: 55000, target: 58000 },
  { month: 'Jun', revenue: 67000, target: 62000 },
]

const sourceBreakdown = [
  { name: 'Website', value: 35, color: '#F59E0B' },
  { name: 'Google Ads', value: 28, color: '#10B981' },
  { name: 'Referral', value: 20, color: '#3B82F6' },
  { name: 'Social Media', value: 12, color: '#8B5CF6' },
  { name: 'Phone', value: 5, color: '#EF4444' },
]

const conversionFunnel = [
  { stage: 'Leads', count: 450 },
  { stage: 'Qualified', count: 320 },
  { stage: 'Proposals', count: 180 },
  { stage: 'Deals', count: 95 },
]

const installerPerformance = [
  { name: 'SolarTech', permitting: 98, installation: 8 },
  { name: 'GreenEnergy', permitting: 95, installation: 9 },
  { name: 'SustainablePower', permitting: 92, installation: 10 },
  { name: 'EcoInstall', permitting: 88, installation: 12 },
]

const npsDistribution = [
  { score: 0, count: 2 },
  { score: 1, count: 1 },
  { score: 2, count: 0 },
  { score: 3, count: 1 },
  { score: 4, count: 2 },
  { score: 5, count: 3 },
  { score: 6, count: 4 },
  { score: 7, count: 8 },
  { score: 8, count: 12 },
  { score: 9, count: 18 },
  { score: 10, count: 15 },
]

const mrrTrend = [
  { month: 'Jan', mrr: 35000 },
  { month: 'Feb', mrr: 38500 },
  { month: 'Mar', mrr: 42000 },
  { month: 'Apr', mrr: 45500 },
  { month: 'May', mrr: 49000 },
  { month: 'Jun', mrr: 52500 },
]

export default function Analytics() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Analytics & Reporting
      </Typography>

      <Grid container spacing={3}>
        {/* Revenue Trend */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Revenue Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#181818', border: '1px solid #262626' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B' }}
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#6B7280"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#6B7280' }}
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Lead Source Breakdown */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Lead Source Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#181818', border: '1px solid #262626' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Conversion Funnel */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Conversion Funnel
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis type="number" stroke="#6B7280" />
                <YAxis dataKey="stage" type="category" stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#181818', border: '1px solid #262626' }} />
                <Bar dataKey="count" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Installer Performance */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Installer Performance Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={installerPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis stroke="#6B7280" dataKey="name" />
                <YAxis stroke="#6B7280" yAxisId="left" />
                <YAxis stroke="#6B7280" yAxisId="right" orientation="right" />
                <Tooltip contentStyle={{ backgroundColor: '#181818', border: '1px solid #262626' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="permitting" fill="#10B981" name="Permit Rate %" />
                <Bar yAxisId="right" dataKey="installation" fill="#3B82F6" name="Avg Days" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* NPS Distribution */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              NPS Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={npsDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis stroke="#6B7280" dataKey="score" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#181818', border: '1px solid #262626' }} />
                <Bar dataKey="count" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* MRR Trend */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Monthly Recurring Revenue (MRR) Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mrrTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#181818', border: '1px solid #262626' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="mrr"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981' }}
                  name="MRR"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
