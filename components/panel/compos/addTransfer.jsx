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
 * AddTransfer component that displays the AddTransfer Component of the website.
 * @returns The rendered AddTransfer component.
 */
const AddTransfer = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, siteInfo, priceInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [addTransferData, setAddTransferData] = useState(
        {
            tradeableId: '',
            amount: '',
            destUserCode: ''
        }
    )
    const [tradeableTransferDecimal, setTradeableTransferDecimal] = useState(priceInfo?.length > 0 ? (priceInfo[0]?.tradeable?.transferMaxDecimals ?? 3) : 3);
    useEffect(() => {
        if (priceInfo?.length > 0) {
            setTradeableTransferDecimal(priceInfo?.length > 0 ? (priceInfo[0]?.tradeable?.transferDecimal || 3) : 3);
        }
    }, [priceInfo]);

    const [showTransferCodeSection, setShowTransferCodeSection] = useState(false);
    useEffect(() => {
        if (!showTransferCodeSection) return;

        if ('OTPCredential' in window) {
            const ac = new AbortController();

            const input = document.querySelector('input[autocomplete="one-time-code"]');
            const form = input?.closest('form');

            if (form) {
                form.addEventListener('submit', () => ac.abort(), { once: true });
            }

            navigator.credentials.get({
                otp: { transport: ['sms'] },
                signal: ac.signal
            }).then(otp => {
                if (otp && otp?.code) {
                    // Fill input and call handler
                    setCodeInputs(otp?.code);
                    onCodeComplete(otp?.code); // auto-submit
                }
            }).catch(err => {
                console.error('WebOTP error:', err);
            });
        }
    }, [showTransferCodeSection]);

    const validationSchema = Yup.object().shape({
        tradeableId: Yup.mixed()
            .test(
                'is-not-empty',
                'این فیلد الزامی است',
                value => value && typeof value === 'object' && Object.keys(value).length > 0
            ),
        amount: Yup.string().required('این فیلد الزامی است'),
        destUserCode: Yup.string().required('این فیلد الزامی است').min(8, 'کد کاربر مقصد باید ۸ کاراکتر باشد').max(8, 'کد کاربر مقصد باید ۸ کاراکتر باشد')
            .test(
                'is-not-referral-code',
                'کد کاربری متعلق به خودتان را نمی توانید وارد نمائید',
                function (value) {
                    return value !== userInfo?.referralCode;
                }
            ),
    });

    const { control, setValue, clearErrors, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema)
    });

    const clearForm = () => {
        setValue('tradeableId', '');
        setValue('amount', '');
        setValue('destUserCode', '');
    }

    const handleChangeAddData = (event, input, type) => {
        let value;
        switch (type) {
            case "checkbox":
                value = event.target.checked;
                break;
            case "numberFormat":
                value = Number(event.target.value.replace(/,/g, ''));
                break;
            default:
                value = event.target.value;
                break;
        }
        setAddTransferData((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

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

    const [destUserCode, setDestUserCode] = useState('');
    const [showTransferFactorDialog, setShowTransferFactorDialog] = useState(false);
    const [openBottomTransferFactorDrawer, setOpenBottomTransferFactorDrawer] = useState(false);
    const handleShowTransferFactor = () => {
        getTransfers();
        if (window.innerWidth >= 1024) {
            setShowTransferFactorDialog(true);
            setOpenBottomTransferFactorDrawer(false);
        } else {
            setShowTransferFactorDialog(false);
            setOpenBottomTransferFactorDrawer(true);
        }
    }

    const [transferFactorData, setTransferFactorData] = useState(null);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const getTransfers = () => {
        setLoadingTransactions(true);
        ApiCall('/tradeable/transfer', 'GET', locale, {}, `limit=1`, 'user', router).then(async (result) => {
            setTransferFactorData(result.data[0] || null);
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }

    const handleCloseTranferDialogs = () => {
        setShowTransferDialog(false);
        setOpenBottomTransferDrawer(false);
        clearForm();
        setTransferId('');
        setTradeableTransferDecimal(null);
        setShowTransferCodeSection(false);
        clearErrors();
    }

    /**
   * Handles the event of send Transfer Verify Code.
   * @param {{Event}} event - The event object.
   * @returns None
  */
    const [transferLoading, setTransferLoading] = useState(false);
    const [transferId, setTransferId] = useState('');
    const sendTransferCode = () => {
        setTransferLoading(true);
        ApiCall('/tradeable/transfer', 'POST', locale, addTransferData, '', 'user', router).then(async (result) => {
            setTransferLoading(false);
            setTransferId(result._id);
            setShowTransferCodeSection(true);
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

    /**
     * Handles the completion of entering verification code.
     * @param {{string}} value - The code input value.
     * @returns None
    */
    const [disabled, setDisabled] = useState(false);
    const [code, setCode] = useState('');
    const [codeInputs, setCodeInputs] = useState('');
    const onCodeComplete = (value) => {
        setCode(value);
        if (value.length == 6) {
            setTransferLoading(true);
            setDisabled(true);
            ApiCall(`/tradeable/transfer/${transferId}/confirm`, 'PATCH', locale, { code: Number(value) }, '', 'user', router).then(async (result) => {
                setTransferLoading(false);
                dispatch({
                    type: 'setRefreshInventory', value: parseInt(Math.floor(Math.random() * 100) + 1)
                });
                setDestUserCode(addTransferData?.destUserCode);
                handleCloseTranferDialogs();
                handleShowTransferFactor();
            }).catch((error) => {
                setCodeInputs('');
                setTransferLoading(false);
                setDisabled(false);
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
    }
    /**
     * Make Transfer by making an API call to the server with the provided code and mobileNumber.
     * @param {{Event}} event - The event object triggered by the user action.
     * @returns None
     */
    const saveTransfer = (event) => {
        event.preventDefault();
        if (Number(code)?.length == 6) {
            setTransferLoading(true);
            setDisabled(true);
            ApiCall(`/tradeable/transfer/${transferId}/confirm`, 'PATCH', locale, { code: Number(code) }, '', 'user', router).then(async (result) => {
                setTransferLoading(false);
                dispatch({
                    type: 'setRefreshInventory', value: parseInt(Math.floor(Math.random() * 100) + 1)
                });
                setDestUserCode(addTransferData?.destUserCode);
                handleCloseTranferDialogs();
                handleShowTransferFactor();
                setCode('');
            }).catch((error) => {
                setCodeInputs('');
                setTransferLoading(false);
                setDisabled(false);
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
    }

    const [openDialog, setOpenDialog] = useState(false);
    const handleOpenDialog = (event) => {
        setOpenDialog(true);
    }
    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    return (
        <>
            <Button variant="contained" color="primary" size="medium" disableElevation={props.disableElevation} className={`custom-btn text-black rounded-lg ${props.className ? props.className : ''}`} onClick={handleShowTransfer}>
                <span className="mx-3">انتقال دارایی</span>
            </Button>

            {/* Transfer */}
            <>
                <Dialog onClose={() => handleCloseTranferDialogs()} open={showTransferDialog} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}
                    disableEscapeKeyDown={showTransferCodeSection}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'}><span>انتقال دارایی</span></Typography>
                    </div>
                    {showTransferCodeSection ?
                        <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
                            <label>کد تائید ارسال شده به شماره موبایل خود را وارد نمائید:</label>
                            <FormControl className="w-full">
                                <div className="custom-verification-input" dir="ltr">
                                    <VerificationInput
                                        inputProps={{
                                            type: 'tel',
                                            inputMode: 'decimal',
                                            pattern: '[0-9]*',
                                            autoComplete: 'one-time-code'
                                        }}
                                        classNames={{
                                            character: "form-verification-input",
                                            characterInactive: "bg-white dark:bg-transparent",
                                            characterSelected: "outline outline-primary",
                                            container: "w-full"
                                        }}
                                        value={codeInputs}
                                        onChange={(value) => setCodeInputs(value)}
                                        placeholder=""
                                        autoFocus
                                        onComplete={onCodeComplete}
                                    />
                                </div>
                            </FormControl>
                            <div className="flex items-center justify-end gap-x-2 mt-2">
                                <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                    onClick={() => handleCloseTranferDialogs()}>
                                    <span className="mx-2">انصراف</span>
                                </Button>
                                <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={transferLoading}
                                    onClick={saveTransfer}>
                                    <text className="text-black font-semibold">تائید</text>
                                </LoadingButton >

                            </div>
                        </form> : <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off" onSubmit={handleSubmit(handleOpenDialog)}>
                            <FormControl className="w-full">
                                <Controller
                                    name="tradeableId"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl className="w-full">
                                            <InputLabel id="demo-simple-select-label" error={!!errors.tradeableId}
                                                sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                            <MUISelect
                                                {...field}
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    setTradeableTransferDecimal(event.target?.value?.tradeable?.transferMaxDecimals ?? 3);
                                                    setAddTransferData((prevState) => ({
                                                        ...prevState,
                                                        tradeableId: event.target?.value?.tradeable?._id,
                                                    }));
                                                }}
                                                input={<OutlinedInput
                                                    id="select-multiple-chip"
                                                    label="انتخاب واحد قابل معامله"
                                                    className="dark:bg-dark *:dark:text-white"
                                                    sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                                />}
                                                error={!!errors.tradeableId}
                                                renderValue={(selected) => (
                                                    <div className="flex items-center gap-x-4 -mt-2 -mb-3">
                                                        <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${selected.tradeable?.image}`} alt={selected.tradeable?.name}
                                                            className="w-10 h-10 rounded-[50%]" />
                                                        <span>{selected.tradeable?.nameFa}</span>
                                                    </div>
                                                )}
                                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                                {priceInfo?.map((data, index) => (
                                                    <MenuItem key={index} value={data}>
                                                        <div className="flex items-center gap-x-4">
                                                            <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} alt={data.tradeable?.name}
                                                                className="w-10 h-10 rounded-[50%]" />
                                                            <span>{data.tradeable?.nameFa}</span>
                                                        </div>
                                                    </MenuItem>
                                                ))}
                                            </MUISelect>
                                            {errors.tradeableId && <FormHelperText className="text-red-500 !mx-4">{errors.tradeableId.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </FormControl>
                            <FormControl className="w-full">
                                <Controller
                                    name="amount"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={tradeableTransferDecimal}
                                            customInput={TextField}
                                            type="tel"
                                            label="مقدار انتقال"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.amount}
                                            helperText={errors.amount ? errors.amount.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'amount', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                            <FormControl className="w-full">
                                <Controller
                                    name="destUserCode"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="کد کاربر مقصد"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.destUserCode}
                                            helperText={errors.destUserCode ? errors.destUserCode.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'destUserCode', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                            <FormHelperText className="text-black text-xs dark:text-alert-warning-foreground">نکته: منظور از کد کاربر مقصد همان کد دعوت (کد کاربری) می باشد.</FormHelperText>
                            <div className="flex items-center justify-end gap-x-2 mt-2">
                                <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                    onClick={() => handleCloseTranferDialogs()}>
                                    <span className="mx-2">انصراف</span>
                                </Button>
                                <Button type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation>
                                    <text className="text-black font-semibold">ارسال کد</text>
                                </Button >
                            </div>
                        </form>}
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
                        <Typography component={'h2'}><span>انتقال دارایی</span></Typography>
                    </div>
                    {showTransferCodeSection ?
                        <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
                            <label>کد تائید ارسال شده به شماره موبایل خود را وارد نمائید:</label>
                            <FormControl className="w-full">
                                <div className="custom-verification-input" dir="ltr">
                                    <VerificationInput
                                        inputProps={{
                                            type: 'tel',
                                            inputMode: 'decimal',
                                            pattern: '[0-9]*',
                                            autoComplete: 'one-time-code'
                                        }}
                                        classNames={{
                                            character: "form-verification-input",
                                            characterInactive: "bg-white dark:bg-transparent",
                                            characterSelected: "outline outline-primary",
                                            container: "w-full"
                                        }}
                                        value={codeInputs}
                                        onChange={(value) => setCodeInputs(value)}
                                        placeholder=""
                                        autoFocus
                                        onComplete={onCodeComplete}
                                    />
                                </div>
                            </FormControl>
                            <div className="flex items-center justify-end gap-x-2 mt-2">
                                <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                    onClick={() => handleCloseTranferDialogs()}>
                                    <span className="mx-2">انصراف</span>
                                </Button>
                                <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={transferLoading}
                                    onClick={saveTransfer}>
                                    <text className="text-black font-semibold">تائید</text>
                                </LoadingButton >

                            </div>
                        </form> : <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off" onSubmit={handleSubmit(handleOpenDialog)}>
                            <FormControl className="w-full">
                                <Controller
                                    name="tradeableId"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl className="w-full">
                                            <InputLabel id="demo-simple-select-label" error={!!errors.tradeableId}
                                                sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                            <MUISelect
                                                {...field}
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    setTradeableTransferDecimal(event.target?.value?.tradeable?.transferMaxDecimals ?? 3);
                                                    setAddTransferData((prevState) => ({
                                                        ...prevState,
                                                        tradeableId: event.target?.value?.tradeable?._id,
                                                    }));
                                                }}
                                                input={<OutlinedInput
                                                    id="select-multiple-chip"
                                                    label="انتخاب واحد قابل معامله"
                                                    className="dark:bg-dark *:dark:text-white"
                                                    sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                                />}
                                                error={!!errors.tradeableId}
                                                renderValue={(selected) => (
                                                    <div className="flex items-center gap-x-4 -mt-2 -mb-3">
                                                        <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${selected.tradeable?.image}`} alt={selected.tradeable?.name}
                                                            className="w-10 h-10 rounded-[50%]" />
                                                        <span>{selected.tradeable?.nameFa}</span>
                                                    </div>
                                                )}
                                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                                {priceInfo?.map((data, index) => (
                                                    <MenuItem key={index} value={data}>
                                                        <div className="flex items-center gap-x-4">
                                                            <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} alt={data.tradeable?.name}
                                                                className="w-10 h-10 rounded-[50%]" />
                                                            <span>{data.tradeable?.nameFa}</span>
                                                        </div>
                                                    </MenuItem>
                                                ))}
                                            </MUISelect>
                                            {errors.tradeableId && <FormHelperText className="text-red-500 !mx-4">{errors.tradeableId.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </FormControl>
                            <FormControl className="w-full">
                                <Controller
                                    name="amount"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={tradeableTransferDecimal}
                                            customInput={TextField}
                                            type="tel"
                                            label="مقدار انتقال"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.amount}
                                            helperText={errors.amount ? errors.amount.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'amount', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                            <FormControl className="w-full">
                                <Controller
                                    name="destUserCode"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="کد کاربر مقصد"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.destUserCode}
                                            helperText={errors.destUserCode ? errors.destUserCode.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'destUserCode', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                            <FormHelperText className="text-black text-xs dark:text-alert-warning-foreground">نکته: منظور از کد کاربر مقصد همان کد دعوت (کد کاربری) می باشد.</FormHelperText>
                            <div className="flex items-center justify-end gap-x-2 mt-2">
                                <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                    onClick={() => handleCloseTranferDialogs()}>
                                    <span className="mx-2">انصراف</span>
                                </Button>
                                <Button type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation>
                                    <text className="text-black font-semibold">ارسال کد</text>
                                </Button >
                            </div>
                        </form>}
                </SwipeableDrawer>
            </>

            {/* Transfer Factor */}
            <>
                <Dialog onClose={() => setShowTransferFactorDialog(false)} open={showTransferFactorDialog} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals white p-0' }}>
                    <div className="flex flex-col gap-y-2 h-full overflow-y-auto overflow-x-hidden p-4">
                        <Typography component={'div'} className="flex flex-col items-center gap-y-2">
                            <img src="/assets/img/general/confirmPayment.png" alt="confirmPayment" className="w-[75px] h-[75px] mx-auto" />
                            <span className="text-black text-base font-normal leading-snug dark:text-white">انتقال {transferFactorData?.tradeable?.nameFa}</span>
                        </Typography>
                        <div className="w-[112%] relative flex items-center rtl:-mr-6 ltr:-ml-6">
                            <div className="w-5 h-5 bg-black bg-opacity-60 rounded-full"></div>
                            <div className="w-full mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="342" height="2" viewBox="0 0 342 2" fill="none" className="w-full h-full text-[#EDEDED] dark:text-white dark:text-opacity-70">
                                    <path d="M0 1L342 1.00003" stroke="currentColor" strokeWidth="2" stroke-dasharray="7 7" />
                                </svg>
                            </div>
                            <div className="w-5 h-5 bg-black bg-opacity-60 rounded-full"></div>
                        </div>
                        <div className="flex flex-col gap-y-4">
                            <div className="flex items-center justify-between gap-x-4">
                                <span className="text-light-primary-gray text-base font-normal leading-snug">حساب مبدا</span>
                                <span className="text-primary-black text-sm font-normal leading-normal">({transferFactorData?.senderUser?.mobileNumber}) {transferFactorData?.senderUser?.firstName} {transferFactorData?.senderUser?.lastName}</span>
                            </div>
                            <div className="flex items-center justify-between gap-x-4">
                                <span className="text-light-primary-gray text-base font-normal leading-snug">حساب مقصد</span>
                                <span className="text-primary-black text-sm font-normal leading-normal">({transferFactorData?.receiverUser?.mobileNumber}) {transferFactorData?.receiverUser?.firstName} {transferFactorData?.receiverUser?.lastName}</span>
                            </div>
                            <div className="flex items-center justify-between gap-x-4">
                                <span className="text-light-primary-gray text-base font-normal leading-snug">کد کاربری مقصد</span>
                                <span className="text-primary-black text-sm font-normal leading-normal">{destUserCode}</span>
                            </div>
                            <div className="w-[112%] relative flex items-center rtl:-mr-6 ltr:-ml-6">
                                <div className="w-5 h-5 bg-black bg-opacity-60 rounded-full"></div>
                                <div className="w-full mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="342" height="2" viewBox="0 0 342 2" fill="none" className="w-full h-full text-[#EDEDED] dark:text-white dark:text-opacity-70">
                                        <path d="M0 1L342 1.00003" stroke="currentColor" strokeWidth="2" stroke-dasharray="7 7" />
                                    </svg>
                                </div>
                                <div className="w-5 h-5 bg-black bg-opacity-60 rounded-full"></div>
                            </div>
                            <div className="flex items-center justify-between gap-x-4 -mt-4">
                                <span className="text-primary-black text-sm font-bold leading-snug">میزان انتقال</span>
                                <span className="text-primary-black text-sm font-bold leading-normal">{(transferFactorData?.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                onClick={() => setShowTransferFactorDialog(false)}>
                                <text className="text-black font-semibold">بستن</text>
                            </Button >
                        </div>
                    </div>
                </Dialog>
                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomTransferFactorDrawer}
                    onClose={() => setOpenBottomTransferFactorDrawer()}
                    PaperProps={{ className: 'drawers mx-5 px-0' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                    </div>
                    <div className="flex flex-col gap-y-2 h-full overflow-y-auto overflow-x-hidden p-4">
                        <Typography component={'div'} className="flex flex-col items-center gap-y-2">
                            <img src="/assets/img/general/confirmPayment.png" alt="confirmPayment" className="w-[75px] h-[75px] mx-auto" />
                            <span className="text-black text-base font-normal leading-snug dark:text-white">انتقال {transferFactorData?.tradeable?.nameFa}</span>
                        </Typography>
                        <div className="w-[112%] relative flex items-center rtl:-mr-6 ltr:-ml-6">
                            <div className="w-5 h-5 bg-black bg-opacity-60 rounded-full"></div>
                            <div className="w-full mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="342" height="2" viewBox="0 0 342 2" fill="none" className="w-full h-full text-[#EDEDED] dark:text-white dark:text-opacity-70">
                                    <path d="M0 1L342 1.00003" stroke="currentColor" strokeWidth="2" stroke-dasharray="7 7" />
                                </svg>
                            </div>
                            <div className="w-5 h-5 bg-black bg-opacity-60 rounded-full"></div>
                        </div>
                        <div className="flex flex-col gap-y-4">
                            <div className="flex items-center justify-between gap-x-4">
                                <span className="text-light-primary-gray text-base font-normal leading-snug">حساب مبدا</span>
                                <span className="text-primary-black text-sm font-normal leading-normal">({transferFactorData?.senderUser?.mobileNumber}) {transferFactorData?.senderUser?.firstName} {transferFactorData?.senderUser?.lastName}</span>
                            </div>
                            <div className="flex items-center justify-between gap-x-4">
                                <span className="text-light-primary-gray text-base font-normal leading-snug">حساب مقصد</span>
                                <span className="text-primary-black text-sm font-normal leading-normal">({transferFactorData?.receiverUser?.mobileNumber}) {transferFactorData?.receiverUser?.firstName} {transferFactorData?.receiverUser?.lastName}</span>
                            </div>
                            <div className="flex items-center justify-between gap-x-4">
                                <span className="text-light-primary-gray text-base font-normal leading-snug">کد کاربری مقصد</span>
                                <span className="text-primary-black text-sm font-normal leading-normal">{destUserCode}</span>
                            </div>
                            <div className="w-[112%] relative flex items-center rtl:-mr-6 ltr:-ml-6">
                                <div className="w-5 h-5 bg-black bg-opacity-60 rounded-full"></div>
                                <div className="w-full mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="342" height="2" viewBox="0 0 342 2" fill="none" className="w-full h-full text-[#EDEDED] dark:text-white dark:text-opacity-70">
                                        <path d="M0 1L342 1.00003" stroke="currentColor" strokeWidth="2" stroke-dasharray="7 7" />
                                    </svg>
                                </div>
                                <div className="w-5 h-5 bg-black bg-opacity-60 rounded-full"></div>
                            </div>
                            <div className="flex items-center justify-between gap-x-4 -mt-4">
                                <span className="text-primary-black text-sm font-bold leading-snug">میزان انتقال</span>
                                <span className="text-primary-black text-sm font-bold leading-normal">{(transferFactorData?.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                onClick={() => setOpenBottomTransferFactorDrawer(false)}>
                                <text className="text-black font-semibold">بستن</text>
                            </Button >
                        </div>
                    </div>
                </SwipeableDrawer>
            </>

            <ConfirmDialog
                open={openDialog}
                onClose={handleCloseDialog}
                onConfirm={sendTransferCode}
                title="آیا مطمئن هستید؟"
                loading={transferLoading}
                darkModeToggle={darkModeToggle}
            />
        </>
    )
}

export default AddTransfer;