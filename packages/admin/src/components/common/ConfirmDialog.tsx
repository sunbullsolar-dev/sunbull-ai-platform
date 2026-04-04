import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  dangerous?: boolean
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  dangerous = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        sx: {
          backgroundColor: '#111111',
          border: '1px solid #262626',
        },
      }}
    >
      <DialogTitle sx={{ color: '#D4D4D4', fontWeight: 600 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: '#9CA3AF' }}>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onCancel} sx={{ color: '#9CA3AF' }}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={dangerous ? 'error' : 'primary'}
          autoFocus
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
