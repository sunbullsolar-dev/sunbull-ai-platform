import { Box, TextField, Button } from '@mui/material'
import { useState } from 'react'

interface DateRangePickerProps {
  onDateChange: (start: string, end: string) => void
  label?: string
}

export default function DateRangePicker({ onDateChange, label = 'Date Range' }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleApply = () => {
    if (startDate && endDate) {
      onDateChange(startDate, endDate)
    }
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
      <TextField
        label="Start Date"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#181818',
          },
        }}
      />
      <TextField
        label="End Date"
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#181818',
          },
        }}
      />
      <Button variant="contained" color="primary" onClick={handleApply}>
        Apply
      </Button>
    </Box>
  )
}
