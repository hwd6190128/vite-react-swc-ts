import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';
import { DialogProps, DialogType } from '../../types/dialog';

interface CustomDialogProps<T> extends DialogProps<T> {
  title: string;
  children: React.ReactNode;
}

function CustomDialog<T>({
  dialogType,
  isOpen,
  data,
  isLoading,
  onSubmit,
  onClose,
  title,
  children,
}: CustomDialogProps<T>) {
  const handleClose = () => {
    onClose?.();
  };

  const handleSubmit = () => {
    onSubmit?.(data as T);
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby={`${dialogType}-dialog-title`}>
      <DialogTitle id={`${dialogType}-dialog-title`}>{title}</DialogTitle>
      <DialogContent>
        {children}
        {isLoading && <CircularProgress size={20} style={{ marginLeft: 10 }} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" disabled={isLoading}>
          取消
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={isLoading}>
          確定
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CustomDialog; 