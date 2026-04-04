import { TextField, InputAdornment, debounce } from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import { useCallback, useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
}: SearchBarProps) {
  const [value, setValue] = useState('')

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearch(query)
    }, debounceMs),
    [onSearch, debounceMs]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    debouncedSearch(newValue)
  }

  return (
    <TextField
      placeholder={placeholder}
      variant="outlined"
      size="small"
      value={value}
      onChange={handleChange}
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: '#6B7280' }} />
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#181818',
          '& fieldset': {
            borderColor: '#404040',
          },
          '&:hover fieldset': {
            borderColor: '#505050',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#F59E0B',
          },
        },
        '& .MuiOutlinedInput-input': {
          color: '#D4D4D4',
        },
      }}
    />
  )
}
