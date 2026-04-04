import {
  Box,
  Card,
  Grid,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material'
import { Save as SaveIcon } from '@mui/icons-material'

export default function Settings() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Platform Settings
      </Typography>

      {/* General Settings */}
      <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          General Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Platform Name"
              fullWidth
              defaultValue="Sunbull AI"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Support Email"
              fullWidth
              defaultValue="support@sunbull.ai"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Platform URL"
              fullWidth
              defaultValue="https://admin.sunbull.ai"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Company Address"
              fullWidth
              multiline
              rows={3}
              defaultValue="123 Solar Lane, San Francisco, CA 94102"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Feature Flags */}
      <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Feature Flags
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Enable Lead Scoring"
            sx={{
              '& .MuiFormControlLabel-label': {
                color: '#D4D4D4',
              },
            }}
          />
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Enable Automated Proposals"
            sx={{
              '& .MuiFormControlLabel-label': {
                color: '#D4D4D4',
              },
            }}
          />
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Enable Installer Matching"
            sx={{
              '& .MuiFormControlLabel-label': {
                color: '#D4D4D4',
              },
            }}
          />
          <FormControlLabel
            control={<Switch />}
            label="Enable API Access"
            sx={{
              '& .MuiFormControlLabel-label': {
                color: '#D4D4D4',
              },
            }}
          />
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Enable Email Notifications"
            sx={{
              '& .MuiFormControlLabel-label': {
                color: '#D4D4D4',
              },
            }}
          />
        </Box>
      </Card>

      {/* Email Configuration */}
      <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Email Configuration
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="SMTP Host"
              fullWidth
              defaultValue="smtp.sendgrid.net"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="SMTP Port"
              fullWidth
              defaultValue="587"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="SMTP Username"
              fullWidth
              defaultValue="apikey"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="From Email"
              fullWidth
              defaultValue="noreply@sunbull.ai"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Payment Configuration */}
      <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Payment Configuration
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Stripe API Key"
              fullWidth
              type="password"
              defaultValue="sk_live_xxxxxxxxx"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Processing Fee (%)"
              fullWidth
              defaultValue="2.5"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Platform Commission (%)"
              fullWidth
              defaultValue="15"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            />
          </Grid>
        </Grid>
      </Card>

      {/* API Configuration */}
      <Card sx={{ p: 3, backgroundColor: '#111111', border: '1px solid #262626' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          API Configuration
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1 }}>
              API Base URL
            </Typography>
            <TextField
              fullWidth
              defaultValue="https://api.sunbull.ai"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1 }}>
              API Key (Read-Only)
            </Typography>
            <TextField
              fullWidth
              value="api_key_xxxxxxxxxxxxxxxx"
              disabled
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#181818',
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="outlined" fullWidth>
              Regenerate API Key
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Save Settings */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" color="primary" startIcon={<SaveIcon />}>
          Save Settings
        </Button>
        <Button variant="outlined">
          Cancel
        </Button>
      </Box>
    </Box>
  )
}
