import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import AddCardIcon from '@mui/icons-material/AddCard'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import FormHelperText from '@mui/material/FormHelperText'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import DatePicker from "react-datepicker2"
import moment from "jalali-moment"

import { PatternFormat } from 'react-number-format';

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
import ConvertText from "../../../services/convertPersianToEnglish";

/**
 * AddBankAccountCompo component that displays the AddBankAccount Component of the website.
 * @returns The rendered AddBankAccount component.
 */
const AddBankAccountCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();
    const [isGregorian, setIsGregorian] = useState(locale == "fa" ? false : true);

    const [hasBirthDate, setHasBirthDate] = useState(userInfo?.birthDate ? true : false);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState(false);
    const [helpText, setHelpText] = useState('مالکیت کارت باید به نام خودتان باشد.');
    const [showAdd, setShowAdd] = useState(false);
    const [openBottomAddCardDrawer, setOpenBottomAddCardDrawer] = useState(false);
    const handleShowAddCardDialog = () => {
        if ((!siteInfo?.offlineFirstStepUserVerifyEnabled && !siteInfo?.onlineFirstStepUserVerifyEnabled) || (['FirstLevelVerified', 'PendingSecondLevel', 'SecondLevelRejected', 'SecondLevelVerified'].includes(userInfo?.verificationStatus))) {
            if (window.innerWidth >= 1024) {
                setShowAdd(true);
                setOpenBottomAddCardDrawer(false);
            } else {
                setShowAdd(false);
                setOpenBottomAddCardDrawer(true);
            }
        } else {
            handleShowAuthentication();
        }
    }

    /**
     * Set the data for showing the selected bank account with the given ID.
     * @param {{string}} id - The ID of the bank account to edit.
     * @returns None
    */
    // const [editCard, setEditCard] = useState({ cardNumber: '', iban: '', id: '' });
    // const [showEdit, setShowEdit] = useState(false);
    // const [openBottomEditCardDrawer, setOpenBottomEditCardDrawer] = useState(false);
    // const editBA = (data) => () => {
    //     setEditCard({ ...editCard, cardNumber: data.number, iban: data.iban, id: data._id });
    //     if (window.innerWidth >= 1024) {
    //         setShowEdit(true);
    //         setOpenBottomEditCardDrawer(false);
    //     } else {
    //         setShowEdit(false);
    //         setOpenBottomEditCardDrawer(true);
    //     }
    // }

    const validationSchema = Yup.object().shape({
        cardNumber: Yup.string()
            .required('این فیلد الزامی است')
            .transform(value => value.replace(/\s+/g, ''))
            .min(16, 'شماره کارت بانکی 16 رقم می باشد')
            .max(16, 'شماره کارت بانکی 16 رقم می باشد'),
        offlineFirstStepUserVerifyEnabled: Yup.boolean(),
        iban: Yup.string().when('offlineFirstStepUserVerifyEnabled', {
            is: true,
            then: schema => schema
                .required('این فیلد الزامی است')
                .transform(value => value.replace(/\s+/g, ''))
                .min(24, 'شماره شبا بانکی 24 رقم می باشد')
                .max(24, 'شماره شبا بانکی 24 رقم می باشد')
                .matches(/^([0-9]{2})0\d{2}0\d{18}$/, 'شماره شبا نامعتبر است'),
            otherwise: schema => schema.optional(),
        }),
        onlineFirstStepUserVerifyEnabled: Yup.boolean(),
        birthDate: Yup.string().when('onlineFirstStepUserVerifyEnabled', {
            is: true,
            then: schema => schema.required('این فیلد الزامی است'),
            otherwise: schema => schema.optional(),
        })
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            offlineFirstStepUserVerifyEnabled: (siteInfo?.offlineFirstStepUserVerifyEnabled) || (!siteInfo?.offlineFirstStepUserVerifyEnabled && !siteInfo?.onlineFirstStepUserVerifyEnabled),
            onlineFirstStepUserVerifyEnabled: siteInfo?.onlineFirstStepUserVerifyEnabled,
            birthDate: userInfo?.birthDate || ''
        }
    });

    const clearForm = () => {
        setValue('cardNumber', '');
        setValue('iban', '');
    }

    /**
   * Updates user birth date with the selected date from the datepicker.
   * @param {Event} event - The event object containing the selected date.
   * @returns None
   */
    const [birthDate, setBirthDate] = useState(userInfo?.birthDate ? moment(userInfo?.birthDate).format("jYYYY/jMM/jDD") : '');
    const birthDatepicker = (event) => {
        setAddCard({ ...addCard, date: event.locale(locale).format("YYYY-MM-DD") });
        if (locale == 'fa') {
            setBirthDate(event.locale(locale).format("jYYYY-jMM-jDD"));
        } else {
            setBirthDate(event.locale(locale).format("YYYY-MM-DD"));
        }
    }

    /**
   * Handles the event of adding a bank account.
   * @param {{Event}} event - The event object.
   * @returns None
  */
    const [addCard, setAddCard] = useState({ cardNumber: '', date: userInfo?.birthDate || '', iban: '' });
    const addBankAccount = () => {
        setLoading(true);
        if (siteInfo?.onlineFirstStepUserVerifyEnabled) {
            ApiCall('/user/card/online', 'POST', locale, { birthDate: addCard.date, cardNumber: addCard.cardNumber }, '', 'user', router).then(async (result) => {
                setLoading(false);
                dispatch({
                    type: 'setRefreshData', value: parseInt(Math.floor(Math.random() * 100) + 1)
                });
                setShowAdd(false);
                setOpenBottomAddCardDrawer(false);
                clearForm();
                dispatch({
                    type: 'setSnackbarProps', value: {
                        open: true, content: langText('Global.Success'),
                        type: 'success', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                    }
                });
            }).catch((error) => {
                setLoading(false);
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
        } else {
            let iban = addCard.iban ? addCard.iban.includes('ir') || addCard.iban.includes('IR') ? addCard.iban.replace(/ir/g, '').replace(/IR/g, '') : addCard.iban : '';
            ApiCall('/user/card/offline', 'POST', locale, { iban: `IR${iban}`, cardNumber: addCard.cardNumber }, '', 'user', router).then(async (result) => {
                setLoading(false);
                dispatch({
                    type: 'setRefreshData', value: parseInt(Math.floor(Math.random() * 100) + 1)
                });
                setShowAdd(false);
                setOpenBottomAddCardDrawer(false);
                clearForm();
                dispatch({
                    type: 'setSnackbarProps', value: {
                        open: true, content: 'کارت بانکی شما پس از تائید مدیریت فعال می شود',
                        type: 'success', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                    }
                });
            }).catch((error) => {
                setLoading(false);
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
    }

    const handleShowAuthentication = () => {
        if (window.innerWidth >= 1024) {
            dispatch({
                type: 'setShowAuthenticate', value: true
            });
            dispatch({
                type: 'setOpenBottomAuthenticate', value: false
            });
        } else {
            dispatch({
                type: 'setShowAuthenticate', value: false
            });
            dispatch({
                type: 'setOpenBottomAuthenticate', value: true
            });
        }

    }

    return (
        <>
            <Button variant="contained" color="primary" size="medium" className="custom-btn text-black rounded-lg"
                startIcon={<AddCardIcon />} onClick={handleShowAddCardDialog}>
                <span className="mx-2">افزودن کارت</span>
            </Button>

            {/* Add Bank Account */}
            <>
                <Dialog onClose={() => { setShowAdd(false); setBirthDate('') }} open={showAdd} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن کارت بانکی
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowAdd(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off" onSubmit={handleSubmit(addBankAccount)}>
                        {(siteInfo?.onlineFirstStepUserVerifyEnabled) && (
                            <FormControl className="w-full">
                                <Controller
                                    name="birthDate"
                                    control={control}
                                    render={({ field }) => (
                                        <>
                                            <DatePicker
                                                name="datePicker"
                                                timePicker={false}
                                                isGregorian={isGregorian}
                                                className="form-input hidden"
                                                onChange={(date) => {
                                                    field.onChange(date);
                                                    birthDatepicker(date);
                                                }}
                                            />
                                            <TextField
                                                type="text"
                                                label="تاریخ تولد"
                                                variant="outlined"
                                                error={!!errors.birthDate}
                                                helperText={errors.birthDate ? errors.birthDate.message : ''}
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-center' : 'text-black text-center', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    inputProps: {
                                                        className: 'ltr'
                                                    },
                                                    readOnly: true
                                                }}
                                                value={birthDate}
                                                onClick={() => document.querySelector('input[name="datePicker"]').click()}
                                            />
                                        </>
                                    )}
                                />
                            </FormControl>
                        )}
                        <FormControl className="w-full">
                            <Controller
                                name="cardNumber"
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <PatternFormat
                                            {...field}
                                            format="#### #### #### ####"
                                            customInput={TextField}
                                            type="tel"
                                            color={'primary'}
                                            label="شماره کارت"
                                            variant="outlined"
                                            error={!!errors.cardNumber}
                                            helperText={errors.cardNumber ? errors.cardNumber.message : ''}
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-center' : 'text-black text-center', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    className: 'ltr',
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            value={addCard?.cardNumber}
                                            onValueChange={(event) => setAddCard({ ...addCard, cardNumber: event.value })}
                                            onPaste={(event) => {
                                                event.preventDefault();
                                                const pastedText = event.clipboardData.getData('Text');
                                                const converted = ConvertText(pastedText);
                                                setValue('cardNumber', converted);
                                                setAddCard({ ...addCard, cardNumber: converted })
                                            }}
                                        />
                                    </>
                                )}
                            />
                        </FormControl>
                        {(siteInfo?.offlineFirstStepUserVerifyEnabled) || (!siteInfo?.offlineFirstStepUserVerifyEnabled && !siteInfo?.onlineFirstStepUserVerifyEnabled) ?
                            <FormControl className="w-full">
                                <Controller
                                    name="iban"
                                    control={control}
                                    render={({ field }) => (
                                        <PatternFormat
                                            {...field}
                                            format="## #### #### #### #### #### ##"
                                            customInput={TextField}
                                            type="tel"
                                            color={'primary'}
                                            label="شماره شبا"
                                            variant="outlined"
                                            error={!!errors.iban}
                                            helperText={errors.iban ? errors.iban.message : ''}
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white pl-4' : 'text-black pl-4', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    className: 'ltr',
                                                    inputMode: 'decimal'
                                                },
                                                endAdornment: <span className="input-end-span">IR</span>
                                            }}
                                            value={addCard?.iban}
                                            onValueChange={(event) => setAddCard({ ...addCard, iban: event.value })}
                                            onPaste={(event) => {
                                                event.preventDefault();
                                                const pastedText = event.clipboardData.getData('Text');
                                                const converted = ConvertText(pastedText);
                                                setValue('iban', converted);
                                                setAddCard({ ...addCard, iban: converted })
                                            }}
                                        />
                                    )}
                                />
                            </FormControl> : ''}
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg" onClick={() => setShowAdd(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <span className="text-black font-semibold">افزودن</span>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomAddCardDrawer}
                    onClose={() => { setOpenBottomAddCardDrawer(false); setBirthDate('') }}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن کارت بانکی
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomAddCardDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off" onSubmit={handleSubmit(addBankAccount)}>
                        {(siteInfo?.onlineFirstStepUserVerifyEnabled) && (
                            <FormControl className="w-full">
                                <Controller
                                    name="birthDate"
                                    control={control}
                                    render={({ field }) => (
                                        <>
                                            <DatePicker
                                                name="datePicker"
                                                timePicker={false}
                                                isGregorian={isGregorian}
                                                className="form-input hidden"
                                                onChange={(date) => {
                                                    field.onChange(date);
                                                    birthDatepicker(date);
                                                }}
                                            />
                                            <TextField
                                                type="text"
                                                label="تاریخ تولد"
                                                variant="outlined"
                                                error={!!errors.birthDate}
                                                helperText={errors.birthDate ? errors.birthDate.message : ''}
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-center' : 'text-black text-center', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    inputProps: {
                                                        className: 'ltr'
                                                    },
                                                    readOnly: true
                                                }}
                                                value={birthDate}
                                                onClick={() => document.querySelector('input[name="datePicker"]').click()}
                                            />
                                        </>
                                    )}
                                />
                            </FormControl>
                        )}
                        <FormControl className="w-full">
                            <Controller
                                name="cardNumber"
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <PatternFormat
                                            {...field}
                                            format="#### #### #### ####"
                                            customInput={TextField}
                                            type="tel"
                                            color={'primary'}
                                            label="شماره کارت"
                                            variant="outlined"
                                            error={!!errors.cardNumber}
                                            helperText={errors.cardNumber ? errors.cardNumber.message : ''}
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-center' : 'text-black text-center', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: { className: 'ltr' }
                                            }}
                                            value={addCard?.cardNumber}
                                            onValueChange={(event) => setAddCard({ ...addCard, cardNumber: event.value })}
                                            onPaste={(event) => {
                                                event.preventDefault();
                                                const pastedText = event.clipboardData.getData('Text');
                                                const converted = ConvertText(pastedText);
                                                setValue('cardNumber', converted);
                                                setAddCard({ ...addCard, cardNumber: converted })
                                            }}
                                        />
                                    </>
                                )}
                            />
                        </FormControl>
                        {(siteInfo?.offlineFirstStepUserVerifyEnabled) || (!siteInfo?.offlineFirstStepUserVerifyEnabled && !siteInfo?.onlineFirstStepUserVerifyEnabled) ?
                            <FormControl className="w-full">
                                <Controller
                                    name="iban"
                                    control={control}
                                    render={({ field }) => (
                                        <PatternFormat
                                            {...field}
                                            format="## #### #### #### #### #### ##"
                                            customInput={TextField}
                                            type="tel"
                                            color={'primary'}
                                            label="شماره شبا"
                                            variant="outlined"
                                            error={!!errors.iban}
                                            helperText={errors.iban ? errors.iban.message : ''}
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white pl-4' : 'text-black pl-4', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    className: 'ltr',
                                                    inputMode: 'decimal'
                                                },
                                                endAdornment: <span className="input-end-span">IR</span>
                                            }}
                                            value={addCard?.iban}
                                            onValueChange={(event) => setAddCard({ ...addCard, iban: event.value })}
                                            onPaste={(event) => {
                                                event.preventDefault();
                                                const pastedText = event.clipboardData.getData('Text');
                                                const converted = ConvertText(pastedText);
                                                setValue('iban', converted);
                                                setAddCard({ ...addCard, iban: converted })
                                            }}
                                        />
                                    )}
                                />
                            </FormControl> : ''}
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg" onClick={() => setOpenBottomAddCardDrawer(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <span className="text-black font-semibold">افزودن</span>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>
        </>
    )
}

export default AddBankAccountCompo;