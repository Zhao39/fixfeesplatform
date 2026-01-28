import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import React from 'react';

const ConfirmDialog = (props) => {
  const { open, setOpen, title, content, textYes, textNo, onClickYes, onClickNo, sx={} } = props
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{ '& .MuiDialog-paper': { maxWidth: '480px' } }}
    >
      {
        (title) && (
          <DialogTitle id="alert-dialog-title">
            {title}
          </DialogTitle>
        )
      }

      {
        (content) && (
          <DialogContent>
            <DialogContentText id="alert-dialog-description" sx={{ ...sx, wordBreak: 'break-word', whiteSpace: 'break-spaces', fontSize: '0.95rem' }}>
              {content}
            </DialogContentText>
          </DialogContent>
        )
      }

      <DialogActions>
        {
          (textYes) && (
            <>
              <Button onClick={onClickYes}>{textYes}</Button>
            </>
          )
        }
        {
          (textNo) && (
            <>
              <Button color='secondary' onClick={onClickNo}>{textNo}</Button>
            </>
          )
        }
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
