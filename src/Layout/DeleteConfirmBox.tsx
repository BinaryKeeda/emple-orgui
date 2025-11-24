// DeleteConfirmDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

interface DeleteConfirmProps {
  open: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmBox({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  onCancel,
  onConfirm
}: DeleteConfirmProps) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>{message}</DialogContent>

      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button color='error' variant='contained' onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
