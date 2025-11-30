import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import FormHelperText from '@mui/material/FormHelperText'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MUISelect from '@mui/material/Select'

import { NumericFormat } from 'react-number-format';
import VerificationInput from "react-verification-input";

// Validation
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../../context/AppContext";

// Service
import ApiCall from "../../../services/api_call"

import ConfirmDialog from '../../shared/ConfirmDialog';

/**
 * GiftcardCharge component that displays the GiftcardCharge Component of the website.
 * @returns The rendered GiftcardCharge component.
 */
const GiftcardCharge = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, siteInfo, priceInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();
    const [code, setCode] = useState('');

    const validationSchema = Yup.object().shape({
        code: Yup.string().required('این فیلد الزامی است').min(10, 'کد فعالسازی 10 کاراکتر می باشد.').max(10, 'کد فعالسازی 10 کاراکتر می باشد.')
    });

    const { control, setValue, clearErrors, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema)
    });

    const clearForm = () => {
        setValue('code', '');
    }

    const [showTransferCodeSection, setShowTransferCodeSection] = useState(false);
    const [showTransferDialog, setShowTransferDialog] = useState(false);
    const [openBottomTransferDrawer, setOpenBottomTransferDrawer] = useState(false);
    const handleShowTransfer = () => {
        if (window.innerWidth >= 1024) {
            setShowTransferDialog(true);
            setOpenBottomTransferDrawer(false);
        } else {
            setShowTransferDialog(false);
            setOpenBottomTransferDrawer(true);
        }
    }
    const handleCloseTranferDialogs = () => {
        setShowTransferDialog(false);
        setOpenBottomTransferDrawer(false);
        setCode('');
        clearForm();
        clearErrors();
    }

    /**
   * Handles the event of charging Wallet with giftcard code.
   * @param {{Event}} event - The event object.
   * @returns None
  */
    const [transferLoading, setTransferLoading] = useState(false);
    const chargeWallet = () => {
        setTransferLoading(true);
        ApiCall(`/gift-card/${code}/apply`, 'PATCH', locale, {}, '', 'user', router).then(async (result) => {
            setTransferLoading(false);
            handleCloseTranferDialogs();
            handleCloseDialog();
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setTransferLoading(false);
            handleCloseDialog();
            console.log(error);
            let list = '';
            error.message && typeof error.message == 'object' ? error.message.map(item => {
                list += `${item}<br />`
            }) : list = error.message;
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: list,
                    type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        });
    }

    const [openDialog, setOpenDialog] = useState(false);
    const handleOpenDialog = () => {
        setOpenDialog(true);
    }
    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    return (
        <>
            <Button variant="contained" color="primary" size="medium" disableElevation={props.disableElevation} className={`custom-btn text-black rounded-lg ${props.className ? props.className : ''}`} onClick={handleShowTransfer}>
                <span className="mx-3">ثبت کد گیفت‌کارت</span>
            </Button>

            {/* Transfer */}
            <>
                <Dialog onClose={() => handleCloseTranferDialogs()} open={showTransferDialog} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}
                    disableEscapeKeyDown={showTransferCodeSection}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'}><span>شارژ کیف پول</span></Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off" onSubmit={handleSubmit(handleOpenDialog)}>
                        <FormControl className="w-full">
                            <Controller
                                name="code"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="text"
                                        label="کد فعالسازی کارت هدیه"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        error={!!errors.code}
                                        helperText={errors.code ? errors.code.message : ''}
                                        onChange={(event) => {
                                            field.onChange(event);
                                            setCode(event.target.value);
                                        }}
                                    />
                                )}
                            />
                        </FormControl>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => handleCloseTranferDialogs()}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <Button type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation>
                                <text className="text-black font-semibold">تائید</text>
                            </Button >
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    disableEscapeKeyDown={showTransferCodeSection}
                    anchor={'bottom'}
                    open={openBottomTransferDrawer}
                    onClose={() => handleCloseTranferDialogs()}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'}><span>شارژ کیف پول</span></Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off" onSubmit={handleSubmit(handleOpenDialog)}>
                        <FormControl className="w-full">
                            <Controller
                                name="code"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="text"
                                        label="کد فعالسازی کارت هدیه"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        error={!!errors.code}
                                        helperText={errors.code ? errors.code.message : ''}
                                        onChange={(event) => {
                                            field.onChange(event);
                                            setCode(event.target.value);
                                        }}
                                    />
                                )}
                            />
                        </FormControl>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => handleCloseTranferDialogs()}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <Button type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation>
                                <text className="text-black font-semibold">تائید</text>
                            </Button >
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            <ConfirmDialog
                open={openDialog}
                onClose={handleCloseDialog}
                onConfirm={chargeWallet}
                title="آیا مطمئن هستید؟"
                loading={transferLoading}
                darkModeToggle={darkModeToggle}
            />
        </>
    )
}

export default GiftcardCharge;