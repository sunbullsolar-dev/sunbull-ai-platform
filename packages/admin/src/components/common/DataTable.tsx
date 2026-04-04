import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  Box,
  Typography,
} from '@mui/material'
import { useState } from 'react'

export interface Column<T> {
  id: keyof T
  label: string
  align?: 'left' | 'right' | 'center'
  width?: string | number
  render?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  selectable?: boolean
  onSelectionChange?: (selected: T[]) => void
  emptyMessage?: string
}

export default function DataTable<T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  selectable = false,
  onSelectionChange,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [orderBy, setOrderBy] = useState<keyof T | null>(null)
  const [selected, setSelected] = useState<(string | number)[]>([])

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleRequestSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data.map((n) => n.id)
      setSelected(newSelected)
      onSelectionChange?.(data)
    } else {
      setSelected([])
      onSelectionChange?.([])
    }
  }

  const handleSelectClick = (_event: React.MouseEvent<unknown>, id: string | number) => {
    const selectedIndex = selected.indexOf(id)
    let newSelected: (string | number)[] = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1))
    }

    setSelected(newSelected)
    const selectedRows = data.filter((row) => newSelected.includes(row.id))
    onSelectionChange?.(selectedRows)
  }

  const isSelected = (id: string | number) => selected.indexOf(id) !== -1

  const displayData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#111111', border: '1px solid #262626' }}>
        <Typography sx={{ color: '#9CA3AF' }}>{emptyMessage}</Typography>
      </Paper>
    )
  }

  return (
    <Box>
      <TableContainer
        component={Paper}
        sx={{ backgroundColor: '#111111', border: '1px solid #262626' }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#181818' }}>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || 'left'}
                  width={column.width}
                  sx={{ fontWeight: 600, color: '#D4D4D4' }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                      sx={{
                        '&.Mui-active': {
                          color: '#F59E0B',
                        },
                        '&.Mui-active .MuiTableSortLabel-icon': {
                          color: '#F59E0B',
                        },
                      }}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayData.map((row) => {
              const isItemSelected = isSelected(row.id)
              return (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  selected={isItemSelected}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': {
                      backgroundColor: '#1F2937',
                    },
                    backgroundColor: isItemSelected ? '#1F2937' : 'transparent',
                  }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleSelectClick(e, row.id)}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.id)}
                      align={column.align || 'left'}
                      sx={{ color: '#D4D4D4', borderBottomColor: '#262626' }}
                    >
                      {column.render
                        ? column.render((row as any)[column.id], row)
                        : (row as any)[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          backgroundColor: '#111111',
          borderTop: '1px solid #262626',
          '& .MuiTablePagination-root': {
            color: '#D4D4D4',
          },
          '& .MuiIconButton-root': {
            color: '#D4D4D4',
          },
        }}
      />
    </Box>
  )
}
