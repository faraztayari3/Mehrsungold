import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import RefreshIcon from '@mui/icons-material/Refresh'
import MUISelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import { PatternFormat } from 'react-number-format';

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call"
import FilterEmptyFields from "../../services/filterEmptyFields"
import FilterObjectFields from "../../services/filterObjectFields"
import ConvertText from "../../services/convertPersianToEnglish"

/**
 * AdminSinglePageCompo component that displays the AdminSingle Page Component of the website.
 * @returns The rendered AdminSingle Page component.
 */
const AdminSinglePageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, adminInfo, userLoading } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (router.query?.id && adminInfo?.role == 'SuperAdmin') {
            getUserInformation();
        }
    }, [adminInfo, router.query?.id]);

    /**
         * Retrieves User Info for the user.
         * @returns None
        */
    const [userInfo, setUserInfo] = useState(null);
    const [userInfoLoading, setUserInfoLoading] = useState(true);
    const getUserInformation = () => {
        setUserInfoLoading(true);
        ApiCall('/user', 'GET', locale, {}, `id=${router.query?.id}`, 'admin', router).then(async (result) => {
            setUserInfo(result.data[0] || null);
            setUserData(result.data[0] || null);
            setUserInfoLoading(false);
        }).catch((error) => {
            setUserInfoLoading(false);
            console.log(error);
        });
    }

    const [userData, setUserData] = useState({});
    const [showEditUser, setShowEditUser] = useState(false);
    const [openBottomEditUserDrawer, setOpenBottomEditUserDrawer] = useState(false);
    const handleShowUserInfo = () => {
        if (window.innerWidth >= 1024) {
            setShowEditUser(true);
            setOpenBottomEditUserDrawer(false);
        } else {
            setShowEditUser(false);
            setOpenBottomEditUserDrawer(true);
        }
    }

    /**
  * updates user birth date with the selected date from the datepicker.
  * @param {Event} event - The event object containing the selected date.
  * @returns None
  */
    const [birthDate, setBirthDate] = useState('');
    const birthDatepicker = (event) => {
        setUserData({ ...userData, birthDate: event.locale(locale).format("YYYY-MM-DD") });
        if (locale == 'fa') {
            setBirthDate(event.locale(locale).format("jYYYY-jMM-jDD"));
        } else {
            setBirthDate(event.locale(locale).format("YYYY-MM-DD"));
        }
    }

    const [showPassword, setShowPassword] = useState(false);
    const [isGregorian, setIsGregorian] = useState(locale == "fa" ? false : true);

    /**
         * Handles the change event for saving levels data.
         * @param {string} input - The name of the input field being changed.
         * @param {string} type - The type of the input field.
         * @param {Event} event - The change event object.
         * @returns None
         */
    const handleChangeEditData = (input, type) => (event) => {
        let value;
        switch (type) {
            case "checkbox":
                value = event.target.checked;
                break;
            case "numberFormat":
                value = Number(event.target.value.replace(/,/g, ''));
                break;
            case "mobileNumberFormat":
                if (event.value == '') {
                    value = '';
                } else {
                    const inputNumber = ConvertText(event.value);
                    value = `${inputNumber.startsWith("0") ? inputNumber : `0${inputNumber}`}`;
                }
                break;
            case "nationalCodeFormat":
                value = event.value;
                break;
            default:
                value = event.target.value;
                break;
        }
        setUserData((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
    * Update a User.
    * @returns None
   */
    const editUser = (event) => {
        event.preventDefault();
        setLoading(true);
        event.target.disabled = true;
        let body;
        if (location.origin.includes("https://gold.viraasr.com")) {
            let newData = FilterEmptyFields({
                firstName: userData?.firstName,
                lastName: userData?.lastName,
                email: userData?.email
            });
            body = { ...newData };
        } else {
            let newData = FilterEmptyFields(userData);
            const filteredData = FilterObjectFields(newData, [
                "mobileNumber",
                "email",
                "password",
                "firstName",
                "lastName",
            ]);
            body = { ...filteredData };
        }

        ApiCall(`/user/${userData._id}`, 'PATCH', locale, body, '', 'admin', router).then(async (result) => {
            event.target.disabled = false;
            setLoading(false);
            getUserInformation();
            setShowEditUser(false);
            setOpenBottomEditUserDrawer(false);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setLoading(false);
            console.log(error);
            event.target.disabled = false;
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

    const handleRefresh = (event) => {
        getUserInformation();
    }

    const ADMINS_ROLES = [
        // {
        //     label: 'SuperAdmin',
        //     value: "SuperAdmin"
        // },
        {
            label: 'Admin',
            value: "Admin"
        }
    ]

    const [showChangeRoleDialog, setShowChangeRoleDialog] = useState(false);
    const [openBottomChangeRoleDrawer, setOpenBottomChangeRoleDrawer] = useState(false);
    const handleShowChangeRoleDialog = () => {
        if (window.innerWidth >= 1024) {
            setShowChangeRoleDialog(true);
            setOpenBottomChangeRoleDrawer(false);
        } else {
            setShowChangeRoleDialog(false);
            setOpenBottomChangeRoleDrawer(true);
        }
    }

    /**
    * Update a Admin Role.
    * @returns None
   */
    const editAdminRole = (event) => {
        event.preventDefault();
        setLoading(true);
        event.target.disabled = true;
        ApiCall(`/user/change-role`, 'PATCH', locale, { id: router.query?.id, role: userData?.role }, '', 'admin', router).then(async (result) => {
            event.target.disabled = false;
            setLoading(false);
            getUserInformation();
            setShowChangeRoleDialog(false);
            setOpenBottomChangeRoleDrawer(false);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setLoading(false);
            console.log(error);
            event.target.disabled = false;
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

    return (
        <div className="xl:max-w-[40rem] xl:mx-auto">
            {userLoading ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : adminInfo?.role == 'SuperAdmin' ?
                <>
                    {userInfoLoading ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : <section>
                        <div className="flex items-center justify-between">
                            <h1 className="text-large-3 mb-6">اطلاعات ادمین <span>{userInfo?.firstName && userInfo?.lastName ? `${userInfo?.firstName || ''} ${userInfo?.lastName || ''}` : `(${userInfo?.mobileNumber || ''})`}</span></h1>
                            <IconButton
                                color={`${darkModeToggle ? 'white' : 'black'}`}
                                onClick={handleRefresh}>
                                <RefreshIcon />
                            </IconButton>
                        </div>
                        <div className="h-full custom-card flex flex-col lg:flex-row items-start justify-between gap-y-3 rounded-2xl p-5">
                            <div className="flex flex-col gap-y-4 w-full h-full">
                                <div className="flex items-center justify-between gap-x-8 text-black dark:text-white">
                                    <span>نام و نام خانوادگی:</span>
                                    <span>{`${userInfo?.firstName || ''} ${userInfo?.lastName || ''}`}</span>
                                </div>
                                <div className="flex items-center justify-between gap-x-8 text-black dark:text-white">
                                    <span>شماره تلفن همراه:</span>
                                    <PatternFormat displayType="text" value={userInfo?.mobileNumber} format="#### ### ## ##" dir="ltr" />
                                </div>
                                <div className="flex items-center justify-between gap-x-8 text-black dark:text-white">
                                    <span>ایمیل:</span>
                                    <span>{userInfo?.email}</span>
                                </div>
                                <div className="flex items-center justify-between gap-x-8 text-black dark:text-white">
                                    <span>نوع حساب</span>
                                    <div className="flex items-center gap-x-1">
                                        <Chip label={userInfo?.role} variant="outlined" size="small" className="badge badge-primary" />
                                        {/* {userInfo?.role != 'SuperAdmin' ? <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={() => handleShowChangeRoleDialog()}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                                                <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H11C11.41 1.25 11.75 1.59 11.75 2C11.75 2.41 11.41 2.75 11 2.75H9C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V13C21.25 12.59 21.59 12.25 22 12.25C22.41 12.25 22.75 12.59 22.75 13V15C22.75 20.43 20.43 22.75 15 22.75Z" fill="currentColor" />
                                                <path d="M8.50008 17.6901C7.89008 17.6901 7.33008 17.4701 6.92008 17.0701C6.43008 16.5801 6.22008 15.8701 6.33008 15.1201L6.76008 12.1101C6.84008 11.5301 7.22008 10.7801 7.63008 10.3701L15.5101 2.49006C17.5001 0.500059 19.5201 0.500059 21.5101 2.49006C22.6001 3.58006 23.0901 4.69006 22.9901 5.80006C22.9001 6.70006 22.4201 7.58006 21.5101 8.48006L13.6301 16.3601C13.2201 16.7701 12.4701 17.1501 11.8901 17.2301L8.88008 17.6601C8.75008 17.6901 8.62008 17.6901 8.50008 17.6901ZM16.5701 3.55006L8.69008 11.4301C8.50008 11.6201 8.28008 12.0601 8.24008 12.3201L7.81008 15.3301C7.77008 15.6201 7.83008 15.8601 7.98008 16.0101C8.13008 16.1601 8.37008 16.2201 8.66008 16.1801L11.6701 15.7501C11.9301 15.7101 12.3801 15.4901 12.5601 15.3001L20.4401 7.42006C21.0901 6.77006 21.4301 6.19006 21.4801 5.65006C21.5401 5.00006 21.2001 4.31006 20.4401 3.54006C18.8401 1.94006 17.7401 2.39006 16.5701 3.55006Z" fill="currentColor" />
                                                <path d="M19.8501 9.83003C19.7801 9.83003 19.7101 9.82003 19.6501 9.80003C17.0201 9.06003 14.9301 6.97003 14.1901 4.34003C14.0801 3.94003 14.3101 3.53003 14.7101 3.41003C15.1101 3.30003 15.5201 3.53003 15.6301 3.93003C16.2301 6.06003 17.9201 7.75003 20.0501 8.35003C20.4501 8.46003 20.6801 8.88003 20.5701 9.28003C20.4801 9.62003 20.1801 9.83003 19.8501 9.83003Z" fill="currentColor" />
                                            </svg>
                                        </IconButton> : ''} */}
                                    </div>
                                </div>
                                <div className="flex items-center justify-end">
                                    <Button variant="contained" color="primary" size="small" className="custom-btn text-black rounded-lg" onClick={handleShowUserInfo}>
                                        <span>ویرایش اطلاعات</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>}

                    {/* EditUser */}
                    <>
                        <Dialog onClose={() => setShowEditUser(false)} open={showEditUser} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                            <div className="flex flex-col gap-y-6">
                                <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش ادمین
                                    <IconButton
                                        color={darkModeToggle ? 'white' : 'black'}
                                        className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                        onClick={() => setShowEditUser(false)}>
                                        <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                                    </IconButton>
                                </Typography>
                                <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                            </div>
                            <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate autoComplete="off">
                                <div className="col-span-12 md:col-span-6">
                                    <FormControl className="w-full">
                                        <TextField
                                            type="text"
                                            label="نام ادمین"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            value={userData?.firstName}
                                            onChange={handleChangeEditData('firstName', 'text')} />
                                    </FormControl>
                                </div>
                                <div className="col-span-12 md:col-span-6">
                                    <FormControl className="w-full">
                                        <TextField
                                            type="text"
                                            label="نام خانوادگی ادمین"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            value={userData?.lastName}
                                            onChange={handleChangeEditData('lastName', 'text')} />
                                    </FormControl>
                                </div>
                                <div className="col-span-12 md:col-span-6">
                                    <FormControl className="w-full">
                                        <PatternFormat
                                            format="#### ### ## ##"
                                            customInput={TextField}
                                            type="tel"
                                            label="شماره موبایل ادمین"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal',
                                                    pattern: '[0-9]*'
                                                }
                                            }}
                                            value={userData?.mobileNumber}
                                            onValueChange={handleChangeEditData('mobileNumber', 'mobileNumberFormat')}
                                            onPaste={(event) => {
                                                event.preventDefault();
                                                const pastedText = event.clipboardData.getData('Text');
                                                const converted = ConvertText(pastedText);
                                                const mobileNumber = converted.startsWith('0') ? converted : `0${converted}`;
                                                setUserData((prevState) => ({
                                                    ...prevState,
                                                    mobileNumber: mobileNumber,
                                                }));
                                            }} />
                                    </FormControl>
                                </div>
                                <div className="col-span-12 md:col-span-6">
                                    <FormControl className="w-full">
                                        <TextField
                                            type="email"
                                            label="ایمیل ادمین"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            value={userData?.email}
                                            onChange={handleChangeEditData('email', 'text')} />
                                    </FormControl>
                                </div>
                                {/* <div className="col-span-12 md:col-span-6">
                            <MUISelect
                                type="text"
                                variant="filled"
                                color="black"
                                label="جنسیت ادمین"
                                className="form-select w-full"
                                defaultValue={userData?.sex}
                                onChange={handleChangeEditData('sex', 'text')}
                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                <MenuItem value="Male" >مرد</MenuItem>
                                <MenuItem value="Female" >زن</MenuItem>
                            </MUISelect>
                        </div> */}
                                <div className="col-span-12">
                                    <FormControl className="w-full">
                                        <TextField
                                            type={showPassword ? "text" : "password"}
                                            label="رمز عبور ادمین"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                endAdornment: <IconButton
                                                    color={`${darkModeToggle ? 'white' : 'black'}`}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            }}
                                            value={userData?.password}
                                            onChange={handleChangeEditData('password', 'text')} />
                                    </FormControl>
                                </div>
                            </form>
                            <div className="text-end">
                                <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                    onClick={editUser}>
                                    <text className="text-black font-semibold">ویرایش ادمین</text>
                                </LoadingButton>
                            </div>
                        </Dialog>

                        <SwipeableDrawer
                            disableBackdropTransition={true}
                            disableDiscovery={true}
                            disableSwipeToOpen={true}
                            anchor={'bottom'}
                            open={openBottomEditUserDrawer}
                            onClose={() => setOpenBottomEditUserDrawer(false)}
                            PaperProps={{ className: 'drawers', sx: { height: '80%' } }}
                            ModalProps={{
                                keepMounted: false
                            }}>
                            <div className="flex flex-col gap-y-6">
                                <div className="block"><div className="puller"></div></div>
                                <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش ادمین
                                    <IconButton
                                        color={darkModeToggle ? 'white' : 'black'}
                                        className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                        onClick={() => setOpenBottomEditUserDrawer(false)}>
                                        <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                                    </IconButton>
                                </Typography>
                                <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                            </div>
                            <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate autoComplete="off">
                                <div className="col-span-12">
                                    <FormControl className="w-full">
                                        <TextField
                                            type="text"
                                            label="نام ادمین"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            value={userData?.firstName}
                                            onChange={handleChangeEditData('firstName', 'text')} />
                                    </FormControl>
                                </div>
                                <div className="col-span-12">
                                    <FormControl className="w-full">
                                        <TextField
                                            type="text"
                                            label="نام خانوادگی ادمین"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            value={userData?.lastName}
                                            onChange={handleChangeEditData('lastName', 'text')} />
                                    </FormControl>
                                </div>
                                <div className="col-span-12">
                                    <FormControl className="w-full">
                                        <PatternFormat
                                            format="#### ### ## ##"
                                            customInput={TextField}
                                            type="tel"
                                            label="شماره موبایل ادمین"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal',
                                                    pattern: '[0-9]*'
                                                }
                                            }}
                                            value={userData?.mobileNumber}
                                            onValueChange={handleChangeEditData('mobileNumber', 'mobileNumberFormat')}
                                            onPaste={(event) => {
                                                event.preventDefault();
                                                const pastedText = event.clipboardData.getData('Text');
                                                const converted = ConvertText(pastedText);
                                                const mobileNumber = converted.startsWith('0') ? converted : `0${converted}`;
                                                setUserData((prevState) => ({
                                                    ...prevState,
                                                    mobileNumber: mobileNumber,
                                                }));
                                            }} />
                                    </FormControl>
                                </div>
                                <div className="col-span-12">
                                    <FormControl className="w-full">
                                        <TextField
                                            type="email"
                                            label="ایمیل ادمین"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            value={userData?.email}
                                            onChange={handleChangeEditData('email', 'text')} />
                                    </FormControl>
                                </div>
                                {/* <div className="col-span-12">
                            <MUISelect
                                type="text"
                                variant="filled"
                                color="black"
                                label="جنسیت ادمین"
                                className="form-select w-full"
                                defaultValue={userData?.sex}
                                onChange={handleChangeEditData('sex', 'text')}
                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                <MenuItem value="Male" >مرد</MenuItem>
                                <MenuItem value="Female" >زن</MenuItem>
                            </MUISelect>
                        </div> */}
                                <div className="col-span-12">
                                    <FormControl className="w-full">
                                        <TextField
                                            type={showPassword ? "text" : "password"}
                                            label="رمز عبور ادمین"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                endAdornment: <IconButton
                                                    color={`${darkModeToggle ? 'white' : 'black'}`}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            }}
                                            value={userData?.password}
                                            onChange={handleChangeEditData('password', 'text')} />
                                    </FormControl>
                                </div>
                            </form>
                            <div className="text-end">
                                <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                    onClick={editUser}>
                                    <text className="text-black font-semibold">ویرایش ادمین</text>
                                </LoadingButton>
                            </div>
                        </SwipeableDrawer>
                    </>

                    {/* ChangeRole */}
                    <>
                        <Dialog onClose={() => setShowChangeRoleDialog(false)} open={showChangeRoleDialog} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                            <div className="flex flex-col gap-y-6">
                                <Typography component={'h2'}>ویرایش سطح دسترسی ادمین</Typography>
                            </div>
                            <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
                                <MUISelect
                                    type="text"
                                    variant="filled"
                                    color="black"
                                    label="نوع ادمین"
                                    className="form-select w-full"
                                    value={userData?.role}
                                    onChange={handleChangeEditData('role', 'text')}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                    {ADMINS_ROLES.map((data, index) => (
                                        <MenuItem value={data.value} key={index}>{data.label}</MenuItem>
                                    ))}
                                </MUISelect>
                                <div className="flex items-center justify-end gap-x-2 mt-2">
                                    <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                        onClick={() => setShowChangeRoleDialog(false)}>
                                        <span className="mx-2">انصراف</span>
                                    </Button>
                                    <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                        onClick={editAdminRole}>
                                        <text className="text-black font-semibold">تائید</text>
                                    </LoadingButton >
                                </div>
                            </form>
                        </Dialog>

                        <SwipeableDrawer
                            disableBackdropTransition={true}
                            disableDiscovery={true}
                            disableSwipeToOpen={true}
                            anchor={'bottom'}
                            open={openBottomChangeRoleDrawer}
                            onClose={() => setOpenBottomChangeRoleDrawer(false)}
                            PaperProps={{ className: 'drawers' }}
                            ModalProps={{
                                keepMounted: false
                            }}>
                            <div className="flex flex-col gap-y-6">
                                <div className="block"><div className="puller"></div></div>
                                <Typography component={'h2'}>ویرایش سطح دسترسی ادمین</Typography>
                            </div>
                            <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
                                <MUISelect
                                    type="text"
                                    variant="filled"
                                    color="black"
                                    label="نوع ادمین"
                                    className="form-select w-full"
                                    value={userData?.role}
                                    onChange={handleChangeEditData('role', 'text')}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                    {ADMINS_ROLES.map((data, index) => (
                                        <MenuItem value={data.value} key={index}>{data.label}</MenuItem>
                                    ))}
                                </MUISelect>
                                <div className="flex items-center justify-end gap-x-2 mt-2">
                                    <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                        onClick={() => setOpenBottomChangeRoleDrawer(false)}>
                                        <span className="mx-2">انصراف</span>
                                    </Button>
                                    <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                        onClick={editAdminRole}>
                                        <text className="text-black font-semibold">تائید</text>
                                    </LoadingButton >
                                </div>
                            </form>
                        </SwipeableDrawer>
                    </>
                </> : <div className="py-16">
                    <span className="block text-center text-large-1 text-primary-gray">سطح دسترسی شما باید SuperAdmin باشد.</span>
                </div>}
        </div>
    )
}

export default AdminSinglePageCompo;