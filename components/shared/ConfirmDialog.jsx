import React from 'react';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';

const ConfirmDialog = ({ open, onClose, onConfirm, title, confirmText = 'تایید', cancelText = 'انصراف', loading = false, darkModeToggle }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={'xs'}
            fullWidth
            PaperProps={{ className: 'modals !block' }}
        >
            <div className="flex flex-col gap-y-6">
                <Typography component={'h2'} className="flex items-center justify-between gap-x-2">{title}</Typography>
            </div>
            <form
                key={0}
                className="flex flex-col gap-y-4 mt-6"
                noValidate
                autoComplete="off"
            >
                <div className="flex items-center justify-end gap-x-2 mt-2">
                    <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg" onClick={onClose}>
                        <text className="mx-2">{cancelText}</text>
                    </Button>
                    <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading} onClick={onConfirm}>
                        <text className="text-black font-semibold">{confirmText}</text>
                    </LoadingButton>
                </div>
            </form>
        </Dialog>
    );
};

export default ConfirmDialog;