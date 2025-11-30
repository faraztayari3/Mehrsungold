import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import RefreshIcon from '@mui/icons-material/Refresh'
import CreditScoreIcon from '@mui/icons-material/CreditScore'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import FormHelperText from '@mui/material/FormHelperText'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Slider from '@mui/material/Slider'
import Collapse from '@mui/material/Collapse'
import CircularProgress from '@mui/material/CircularProgress'
import moment from "jalali-moment"

import { PatternFormat } from 'react-number-format';
import VerificationInput from "react-verification-input";

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call"
import ConvertText from "../../services/convertPersianToEnglish";
import CopyData from "../../services/copy"

//Components
import AddTransfer from "./compos/addTransfer"

/**
 * ProfileIndexPageCompo component that displays the Panel Index Page Component of the website.
 * @returns The rendered Panel Index Page component.
 */
const ProfileIndexPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();
    const [isGregorian, setIsGregorian] = useState(locale == "fa" ? false : true);
    const [hasPassword, setHasPassword] = useState(userInfo?.hasPassword);

    const [mobileCodeSection, setMobileCodeSection] = useState(false);
    useEffect(() => {
        if (!mobileCodeSection) return;

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
    }, [mobileCodeSection]);

    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const [errorPassword, setErrorPassword] = useState(false);
    const [helpTextPassword, setHelpTextPassword] = useState('');
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [openBottomPasswordDrawer, setOpenBottomPasswordDrawer] = useState(false);
    const handleShowPasswordDialog = () => {
        if (window.innerWidth >= 1024) {
            setShowPasswordDialog(true);
            setOpenBottomPasswordDrawer(false);
        } else {
            setShowPasswordDialog(false);
            setOpenBottomPasswordDrawer(true);
        }
    }

    /**
     * Handles the update password event when the user submits the form.
     * @param {{Event}} event - The event object.
     * @returns None
     */
    const [passLoading, setPassLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const updatePassword = (event) => {
        event.preventDefault();
        if (location.origin.includes("https://gold.viraasr.com")) {
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: 'این قابلیت به دلیل دمو بودن اسکریپت غیرفعال می باشد',
                    type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        } else {
            if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/.test(password)) {
                if (rePassword == password) {
                    setPassLoading(true);
                    event.target.disabled = true;
                    ApiCall('/auth/change-password', 'POST', locale, { newPassword: password }, '', 'user', router).then(async (result) => {
                        event.target.disabled = false;
                        setPassLoading(false);
                        setShowPasswordDialog(false);
                        setOpenBottomPasswordDrawer(false);
                        setPassword('');
                        setRePassword('');
                        setHasPassword(true);
                        dispatch({
                            type: 'setSnackbarProps', value: {
                                open: true, content: langText('Global.Success'),
                                type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                            }
                        });
                    }).catch((error) => {
                        console.log(error);
                        setPassLoading(false);
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
                } else {
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: langText('Global.PasswordNotCorrect'),
                            type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                }
            } else {
                dispatch({
                    type: 'setSnackbarProps', value: {
                        open: true, content: langText('Global.PasswordVerify'),
                        type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                    }
                });
            }
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

    const [showChangeMobileDialog, setShowChangeMobileDialog] = useState(false);
    const [openBottomChangeMobileDrawer, setOpenBottomChangeMobileDrawer] = useState(false);
    const handleShowChangeMobileDialog = () => {
        if (window.innerWidth >= 1024) {
            setShowChangeMobileDialog(true);
            setOpenBottomChangeMobileDrawer(false);
        } else {
            setShowChangeMobileDialog(false);
            setOpenBottomChangeMobileDrawer(true);
        }
    }

    const [error, setError] = useState(false);
    const [errorCode, setErrorCode] = useState(false);
    const [helpText, setHelpText] = useState('مالکیت شماره باید به نام خودتان باشد.');
    const handleChangeMobile = (event) => {
        const inputNumber = ConvertText(event.value);
        if (inputNumber == '') {
            setMobile('');
        } else {
            setMobile(`${inputNumber.startsWith("0") ? inputNumber : `0${inputNumber}`}`);
        }

        if (inputNumber.length == 10 || inputNumber.length == 11) {
            setError(false);
            setHelpText('مالکیت شماره باید به نام خودتان باشد.');
        } else {
            setError(true);
            setHelpText('شماره وارد شده صحیح نمی باشد.');
        }
    }

    /**
     * Handles the send new mobile number event when the user submits the form.
     * @param {{Event}} event - The event object.
     * @returns None
     */
    const [mobile, setMobile] = useState('');
    const [changeMobileLoading, setChangeMobileLoading] = useState(false);
    const sendMobile = (event) => {
        event.preventDefault();
        if (location.origin.includes("https://gold.viraasr.com")) {
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: 'این قابلیت به دلیل دمو بودن اسکریپت غیرفعال می باشد',
                    type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        } else {
            if (mobile.length > 0) {
                setChangeMobileLoading(true);
                event.target.disabled = true;
                ApiCall('/user/mobile-number/change-request', 'POST', locale, { newMobileNumber: mobile }, '', 'user', router).then(async (result) => {
                    event.target.disabled = false;
                    setChangeMobileLoading(false);
                    setMobileCodeSection(true);
                }).catch((error) => {
                    console.log(error);
                    setChangeMobileLoading(false);
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
        }
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
            setErrorCode(false);
            setChangeMobileLoading(true);
            setDisabled(true);
            ApiCall('/user/mobile-number/verify-otp', 'POST', locale, { code: value }, '', 'user', router).then(async (result) => {
                setChangeMobileLoading(false);
                getUserInformation();
                setShowChangeMobileDialog(false);
                setOpenBottomChangeMobileDrawer(false);
                setMobileCodeSection(false);
            }).catch((error) => {
                setCodeInputs('');
                setChangeMobileLoading(false);
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
        } else {
            setErrorCode(true);
        }
    }
    /**
     * Verifies the user new mobile number by making an API call to the server with the provided code.
     * @param {{Event}} event - The event object triggered by the user action.
     * @returns None
     */
    const verifyMobile = (event) => {
        event.preventDefault();
        setChangeMobileLoading(true);
        event.target.disabled = true;
        ApiCall('/user/mobile-number/verify-otp', 'POST', locale, { code }, '', 'user', router).then(async (result) => {
            setChangeMobileLoading(false);
            getUserInformation();
            setShowChangeMobileDialog(false);
            setOpenBottomChangeMobileDrawer(false);
            setMobileCodeSection(false);
        }).catch((error) => {
            setCodeInputs('');
            setChangeMobileLoading(false);
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

    /**
         * Retrieves User Info for the user.
         * @returns None
        */
    const getUserInformation = () => {
        dispatch({
            type: 'setUserLoading', value: true
        });
        ApiCall('/user/me', 'GET', locale, {}, '', 'user', router).then(async (result) => {
            dispatch({
                type: 'setUserInfo', value: result
            });
            dispatch({
                type: 'setUserLoading', value: false
            });
        }).catch((error) => {
            dispatch({
                type: 'setUserLoading', value: false
            });
            console.log(error);
        });
    }

    const handleRefresh = (event) => {
        getUserInformation();
    }

    const marks = [
        {
            value: (userInfo?.totalTransactions || 0),
            label: (userInfo?.totalTransactions || 0).toLocaleString(undefined, { maximumFractionDigits: 0 }),
        },
        {
            value: (userInfo?.level?.minRequiredTradesAmount || 0),
            label: `${(userInfo?.level?.minRequiredTradesAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        }
    ]

    const referralMarks = [
        {
            value: (userInfo?.referralCount || 0),
            label: (userInfo?.referralCount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 }),
        },
        {
            value: (userInfo?.level?.minRequiredReferralCount || 0),
            label: `${(userInfo?.level?.minRequiredReferralCount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        }
    ]

    useEffect(() => {
        getLevels(1);
    }, []);

    /**
         * Retrieves Levels list.
         * @returns None
        */
    const [levels, setLevels] = useState([]);
    const [loadingLevels, setLoadingLevels] = useState(true);
    const [levelsLimit, setLevelsLimit] = useState(50);
    const [levelsTotal, setLevelsTotal] = useState(0);
    const [pageItem, setPageItem] = useState(1);
    const [lastLevel, setLastLevel] = useState(false);
    const [openLevel, setOpenLevel] = useState(0);
    const [nextLevel, setNextLevel] = useState(null);
    const getLevels = (page) => {
        setLoadingLevels(true);
        ApiCall('/level', 'GET', locale, {}, `sortOrder=1&sortBy=number&limit=${levelsLimit}&skip=${(page * levelsLimit) - levelsLimit}`, 'user', router).then(async (result) => {
            setLevelsTotal(result.count);
            const currentLevelNumber = userInfo?.level?.number;
            if (result.data[result.data?.length - 1]?.number == userInfo?.level?.number) {
                setLastLevel(true);
                setNextLevel(null);
            } else {
                setLastLevel(false);
                const nextLevel = result.data.find((level) => level.number === currentLevelNumber + 1);
                setNextLevel(nextLevel || null);
            }
            setLevels(result.data);
            setLoadingLevels(false);
        }).catch((error) => {
            setLoadingLevels(false);
            console.log(error);
        });
    }

    return (
        <div>
            <section className="xl:max-w-[50rem] xl:mx-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-large-3 mb-6">پروفایل کاربری</h1>
                    <IconButton
                        color={`${darkModeToggle ? 'white' : 'black'}`}
                        onClick={handleRefresh}>
                        <RefreshIcon />
                    </IconButton>
                </div>

                <div className="h-full custom-card flex flex-col lg:flex-row items-start justify-between gap-y-6 rounded-2xl p-5">
                    <div className="flex flex-col gap-y-4 w-full h-full">
                        <div className="flex items-center justify-between gap-x-8 dark:text-white">
                            <span>نام و نام خانوادگی:</span>
                            <span>{`${userInfo?.firstName || ''} ${userInfo?.lastName || ''}`}</span>
                        </div>
                        <div className="flex items-center justify-between gap-x-8 dark:text-white">
                            <span>کدملی:</span>
                            <PatternFormat displayType="text" value={userInfo?.nationalCode} format="### ### ## ##" dir="ltr" />
                        </div>
                        <div className="flex items-center justify-between gap-x-8 dark:text-white">
                            <span>تاریخ تولد:</span>
                            <span>{userInfo?.birthDate ? moment(userInfo?.birthDate).format("jYYYY/jMM/jDD") : ''}</span>
                        </div>
                        <div className="flex items-center justify-between gap-x-4 whitespace-nowrap">
                            <span>شماره تلفن همراه:</span>
                            <div className="flex items-center gap-x-1 dark:text-white">
                                <PatternFormat displayType="text" value={userInfo?.mobileNumber} format="#### ### ## ##" dir="ltr" />
                                <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={() => handleShowChangeMobileDialog()}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                                        <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H11C11.41 1.25 11.75 1.59 11.75 2C11.75 2.41 11.41 2.75 11 2.75H9C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V13C21.25 12.59 21.59 12.25 22 12.25C22.41 12.25 22.75 12.59 22.75 13V15C22.75 20.43 20.43 22.75 15 22.75Z" fill="currentColor" />
                                        <path d="M8.50008 17.6901C7.89008 17.6901 7.33008 17.4701 6.92008 17.0701C6.43008 16.5801 6.22008 15.8701 6.33008 15.1201L6.76008 12.1101C6.84008 11.5301 7.22008 10.7801 7.63008 10.3701L15.5101 2.49006C17.5001 0.500059 19.5201 0.500059 21.5101 2.49006C22.6001 3.58006 23.0901 4.69006 22.9901 5.80006C22.9001 6.70006 22.4201 7.58006 21.5101 8.48006L13.6301 16.3601C13.2201 16.7701 12.4701 17.1501 11.8901 17.2301L8.88008 17.6601C8.75008 17.6901 8.62008 17.6901 8.50008 17.6901ZM16.5701 3.55006L8.69008 11.4301C8.50008 11.6201 8.28008 12.0601 8.24008 12.3201L7.81008 15.3301C7.77008 15.6201 7.83008 15.8601 7.98008 16.0101C8.13008 16.1601 8.37008 16.2201 8.66008 16.1801L11.6701 15.7501C11.9301 15.7101 12.3801 15.4901 12.5601 15.3001L20.4401 7.42006C21.0901 6.77006 21.4301 6.19006 21.4801 5.65006C21.5401 5.00006 21.2001 4.31006 20.4401 3.54006C18.8401 1.94006 17.7401 2.39006 16.5701 3.55006Z" fill="currentColor" />
                                        <path d="M19.8501 9.83003C19.7801 9.83003 19.7101 9.82003 19.6501 9.80003C17.0201 9.06003 14.9301 6.97003 14.1901 4.34003C14.0801 3.94003 14.3101 3.53003 14.7101 3.41003C15.1101 3.30003 15.5201 3.53003 15.6301 3.93003C16.2301 6.06003 17.9201 7.75003 20.0501 8.35003C20.4501 8.46003 20.6801 8.88003 20.5701 9.28003C20.4801 9.62003 20.1801 9.83003 19.8501 9.83003Z" fill="currentColor" />
                                    </svg>
                                </IconButton>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-x-7 whitespace-nowrap">
                            <span>وضعیت احراز:</span>
                            {(siteInfo?.offlineFirstStepUserVerifyEnabled || siteInfo?.onlineFirstStepUserVerifyEnabled) ?
                                <>
                                    {userInfo?.verificationStatus == 'NotVerified' ? <Button variant="contained" color="primary" size="medium" className="custom-btn text-black rounded-lg w-fit"
                                        startIcon={<CreditScoreIcon />} onClick={() => handleShowAuthentication()}>
                                        <span className="mx-2">تائید حساب</span>
                                    </Button> : ''}
                                    {userInfo?.verificationStatus == 'FirstLevelVerified' && siteInfo?.secondStepUserVerifyEnabled ?
                                        <LinkRouter legacyBehavior href={'/panel/authentication'}>
                                            <a className="w-fit">
                                                <Chip label="احراز پایه" variant="outlined" size="small" className="w-full badge badge-success px-4" />
                                            </a>
                                        </LinkRouter> : ''}
                                    {userInfo?.verificationStatus == 'FirstLevelVerified' && !siteInfo?.secondStepUserVerifyEnabled ?
                                        <Chip label="احراز شده" variant="outlined" size="small" className="w-fit badge badge-success px-4" /> : ''}
                                    {userInfo?.verificationStatus == 'SecondLevelRejected' || userInfo?.verificationStatus == 'FirstLevelRejected' ?
                                        <LinkRouter legacyBehavior href={'/panel/authentication'}>
                                            <a className="w-fit">
                                                <Chip label="احراز رد شده" variant="outlined" size="small" className="w-full badge badge-error px-4" />
                                            </a>
                                        </LinkRouter> : ''}
                                    {userInfo?.verificationStatus == 'PendingSecondLevel' || userInfo?.verificationStatus == 'PendingFirstLevel' ? <Chip label="در حال بررسی" variant="outlined" size="small" className="w-fit badge badge-primary px-4" /> : ''}
                                    {userInfo?.verificationStatus == 'SecondLevelVerified' ? <Chip label="احراز کامل" variant="outlined" size="small" className="w-fit badge badge-success px-4" /> : ''}
                                </> :
                                <Chip label="تائید شده" variant="outlined" size="small" className="w-fit badge badge-success px-4" />}
                        </div>
                        {userInfo?.role == 'VIPUser' ? <div className="flex items-center justify-between gap-x-4 whitespace-nowrap">
                            <span>نوع حساب:</span>
                            <div className="flex items-center gap-x-1 dark:text-white">
                                {userInfo?.role == 'User' ? <Chip label="کاربر ساده" variant="outlined" size="small" className="w-full badge badge-info px-4" /> :
                                    <Chip label="کاربر ویژه" variant="outlined" size="small" className="w-full badge badge-success px-4" />}
                            </div>
                        </div> : ''}
                        <div className="flex items-center justify-between gap-x-14 whitespace-nowrap">
                            <span>کلمه‌ی عبور:</span>
                            <Button variant="contained" color="primary" size="small" className="custom-btn text-black rounded-lg w-full md:w-1/5 lg:w-1/4 rtl:mr-1" onClick={handleShowPasswordDialog}>
                                {hasPassword ? <span className="mx-3 py-1">ویرایش کلمه عبور</span> : <span className="mx-3 py-0.5">تعیین کلمه عبور</span>}
                            </Button>
                        </div>
                        {siteInfo?.tradeableTransferIsActive ? <div className="flex items-center justify-between gap-x-14 whitespace-nowrap">
                            <span>انتقال دارایی</span>
                            <AddTransfer className="w-full md:w-1/5 lg:w-1/4" disableElevation={false} />
                        </div> : ''}
                    </div>

                </div>
            </section >
            <section className="xl:max-w-[50rem] xl:mx-auto my-8">
                <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-12">
                        <div className="bg-[#EBB402] rounded-xl flex flex-col items-center gap-y-4 p-4">
                            <div className="w-full flex flex-row items-center justify-between gap-x-2 gap-y-4 whitespace-nowrap">
                                <span className="text-black text-base font-medium leading-loose">کد دعوت شما (کد کاربری)</span>
                                <Button
                                    variant="text"
                                    color="black"
                                    onClick={CopyData(userInfo?.referralCode || '')}>
                                    <span className="text-white text-2xl font-medium leading-10">{userInfo?.referralCode || ''}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z" stroke="white" stroke-width="1.5" />
                                        <path d="M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531" stroke="white" stroke-width="1.5" />
                                    </svg>
                                </Button>
                            </div>
                            <div className="w-11/12 flex flex-col items-center gap-y-4">
                                <div className="w-full flex items-center justify-between gap-x-2 whitespace-nowrap rounded-lg bg-white border border-white py-2 px-5 dark:border-opacity-20">
                                    {/* <span className="text-base text-black font-normal hidden md:block 2xl:hidden">لینک مستقیم</span> */}
                                    <span className="text-black text-base font-normal text-center whitespace-break-spaces">{location.origin}/auth?ref={userInfo?.referralCode || ''}</span>
                                    <IconButton
                                        onClick={CopyData(`${location.origin}/auth?ref=${userInfo?.referralCode || ''}`)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-black">
                                            <path d="M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z" stroke="currentColor" />
                                            <path d="M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531" stroke="currentColor" />
                                        </svg>
                                    </IconButton>
                                </div>
                                <div className="w-full md:w-[80%] md:mx-auto flex items-center justify-center md:gap-x-8">
                                    <div className="text-black text-base font-light leading-loose">
                                        <span>تعداد دعوت:</span>
                                        <span className="text-black text-base font-medium leading-loose mx-2">{userInfo?.referralCount || 0} نفر</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-y-2">
                        {loadingLevels ? <div className="h-full flex flex-col justify-between gap-y-10 custom-card rounded-2xl !py-4"></div> : nextLevel?.minRequiredTradesAmount > 0 ? <div className="h-full flex flex-col justify-between gap-y-10 custom-card rounded-2xl !py-4">
                            <div className="flex flex-col items-center gap-y-4">
                                <span className="text-sm dark:text-white">
                                    حجم معاملات شما: <span>{(userInfo?.totalTransactions || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} تومان</span>
                                </span>
                                {lastLevel ? '' : <span className="text-sm dark:text-white">
                                    تا سطح بعدی باید <span className="text-black font-bold dark:text-white">
                                        {((nextLevel?.minRequiredTradesAmount || 0) - (userInfo?.totalTransactions || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })} تومان</span> معامله کنید
                                </span>}
                            </div>
                            {lastLevel ? <div className="custom-slider w-[90%] mx-auto order-3 px-2">
                                <Slider
                                    size='medium'
                                    valueLabelFormat={() => {
                                        return <span className="fa-number">{(userInfo?.totalTransactions || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} تومان</span>
                                    }}
                                    value={(userInfo?.totalTransactions || 0)}
                                    color="primary"
                                    valueLabelDisplay="on"
                                    step={1}
                                    min={0}
                                    max={userInfo?.totalTransactions}
                                    className="gold m-0"
                                />
                            </div> : <div className="custom-slider w-[90%] mx-auto order-3 px-2">
                                <Slider
                                    size='medium'
                                    valueLabelFormat={() => {
                                        return <span className="fa-number">{(userInfo?.totalTransactions || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} تومان</span>
                                    }}
                                    value={((userInfo?.totalTransactions || 0) / (nextLevel?.minRequiredTradesAmount || 1) * 100)}
                                    color="primary"
                                    valueLabelDisplay="on"
                                    marks={marks}
                                    step={1}
                                    min={0}
                                    max={100}
                                    className="gold m-0"
                                />
                            </div>}
                        </div> : <div className="h-full flex flex-col justify-between gap-y-10 custom-card rounded-2xl !py-4">
                            <div className="flex flex-col items-center gap-y-4">
                                <span className="text-sm dark:text-white">
                                    تعداد دعوت های شما: <span>{(userInfo?.referralCount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} نفر</span>
                                </span>
                                {lastLevel ? '' : <span className="text-sm dark:text-white">
                                    تا سطح بعدی باید <span className="text-black font-bold dark:text-white">
                                        {((nextLevel?.minRequiredReferralCount || 0) - (userInfo?.referralCount || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })} نفر</span> را دعوت کنید
                                </span>}
                            </div>
                            {lastLevel ? <div className="custom-slider w-[90%] mx-auto order-3 px-2">
                                <Slider
                                    size='medium'
                                    valueLabelFormat={() => {
                                        return <span className="fa-number">{(userInfo?.referralCount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} نفر</span>
                                    }}
                                    value={(userInfo?.referralCount || 0)}
                                    color="primary"
                                    valueLabelDisplay="on"
                                    step={2}
                                    min={0}
                                    max={userInfo?.referralCount}
                                    className="gold m-0"
                                />
                            </div> : <div className="custom-slider w-[90%] mx-auto order-3 px-2">
                                <Slider
                                    size='medium'
                                    valueLabelFormat={() => {
                                        return <span className="fa-number">{(userInfo?.referralCount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} نفر</span>
                                    }}
                                    value={((userInfo?.referralCount || 0) / (nextLevel?.minRequiredReferralCount || 1) * 100)}
                                    color="primary"
                                    valueLabelDisplay="on"
                                    marks={referralMarks}
                                    step={1}
                                    min={0}
                                    max={100}
                                    className="gold m-0"
                                />
                            </div>}
                        </div>}
                    </div>
                    <div className="col-span-12 lg:col-span-4">
                        <div className="h-full xl:h-[90%] 2xl:h-[92%] bg-[#EBB402] rounded-xl flex flex-col items-center justify-between gap-y-4 p-2">
                            <div className="flex flex-col items-center gap-y-2">
                                <span className="text-black text-base font-light leading-loose mt-4">سطح کاربری شما</span>
                                <div className="fa-number">
                                    <span className="text-white text-3xl font-black">سطح </span>
                                    <span className="text-white text-5xl font-black">{userInfo?.level?.number}</span>
                                    <span className="text-white text-3xl font-black"> </span>
                                </div>
                            </div>
                            <Button
                                variant="filled"
                                color={darkModeToggle ? 'white' : 'black'}
                                className="btn-main-gold !bg-white rounded w-full whitespace-nowrap invisible">
                                <span className="text-center text-[#595959] text-xs font-medium leading-loose">شرایط و توضیحات</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <section id="levels" className="xl:max-w-[50rem] xl:mx-auto my-8">
                <h1 className="text-large-2 mb-6">سطوح کاربری</h1>
                {loadingLevels ? <div className="flex justify-center items-center my-4"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> :
                    levels.length > 0 ? <div className="grid grid-cols-12 gap-2 pb-2">
                        {levels.map((data, index) => {
                            return (
                                <div className={`col-span-12`} key={index}>
                                    <input type="radio" className="hidden peer" id={data._id} name="card" checked={userInfo?.level?.number == data.number} />
                                    <label htmlFor={data.number} className="custom-card rounded-2xl p-2 flex flex-col justify-between gap-2 transition border-light-secondary-foreground dark:border-dark border-solid peer-checked:border-primary peer-checked:border-solid">
                                        <div className="flex items-center justify-between gap-x-2 cursor-pointer" onClick={() => setOpenLevel(index)}>
                                            <span>{data.name}</span>
                                            <div className="flex items-center justify-center  h-8 bg-primary rounded-lg px-4">
                                                <span>{data.number}</span>
                                            </div>
                                        </div>
                                        <Collapse in={openLevel == index}>
                                            <div className="flex items-center justify-between gap-x-2 text-sm my-1">
                                                <span>حجم معامله برای ارتقا</span>
                                                <span>{(data.minRequiredTradesAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} <span className="text-xs">تومان</span></span>
                                            </div>
                                            <div className="flex items-center justify-between gap-x-2 text-sm my-1">
                                                <span>تعداد دعوت برای ارتقا</span>
                                                <span>{(data.minRequiredReferralCount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} <span className="text-xs">نفر</span></span>
                                            </div>
                                            <div className="flex items-center justify-between gap-x-2 text-sm my-1">
                                                <span>حداکثر مقدار خرید</span>
                                                <span>{(data.dailyMaxBuyAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} <span className="text-xs">تومان</span></span>
                                            </div>
                                            <div className="flex items-center justify-between gap-x-2 text-sm my-1">
                                                <span>حداکثر مقدار فروش</span>
                                                <span>{(data.dailyMaxSellAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} <span className="text-xs">تومان</span></span>
                                            </div>
                                            {data.description ? <div className="bg-primary-green bg-opacity-20 rounded-lg p-2 flex items-center justify-between gap-x-2 text-sm my-2">
                                                <span>{data.description}</span>
                                            </div> : ''}
                                        </Collapse>
                                    </label>
                                </div>
                            )
                        })}
                    </div> : ''}
            </section>

            {/* Password */}
            <>
                <Dialog onClose={() => setShowPasswordDialog(false)} open={showPasswordDialog} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2"> {hasPassword ? <span>ویرایش کلمه عبور</span> : <span>تعیین کلمه عبور</span>}
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowPasswordDialog(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6">
                        <FormControl className="w-full">
                            <TextField
                                type={showPassword ? "text" : "password"}
                                color={errorPassword ? 'error' : 'primary'}
                                label="رمز عبور"
                                variant="outlined"
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-end' : 'text-black text-end', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    inputProps: {
                                        className: 'ltr'
                                    },
                                    endAdornment: <IconButton
                                        color={`${darkModeToggle ? 'white' : 'black'}`}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                }}
                                onChange={(event) => setPassword(event.target.value)} />

                            <FormHelperText className={`text-small-3 ${errorPassword ? 'text-primary-red' : 'text-secondary-gray'} `}>{helpTextPassword}</FormHelperText>
                        </FormControl>
                        <FormControl className="w-full">
                            <TextField
                                type={showRePassword ? "text" : "password"}
                                color={errorPassword ? 'error' : 'primary'}
                                label="تکرار رمز عبور"
                                variant="outlined"
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-end' : 'text-black text-end', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    inputProps: {
                                        className: 'ltr'
                                    },
                                    endAdornment: <IconButton
                                        color={`${darkModeToggle ? 'white' : 'black'}`}
                                        onClick={() => setShowRePassword(!showRePassword)}
                                    >
                                        {showRePassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                }}
                                onChange={(event) => setRePassword(event.target.value)} />
                        </FormControl>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setShowPasswordDialog(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={passLoading}
                                onClick={updatePassword}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomPasswordDrawer}
                    onClose={() => setOpenBottomPasswordDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2"> {hasPassword ? <span>ویرایش کلمه عبور</span> : <span>تعیین کلمه عبور</span>}
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomPasswordDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6">
                        <FormControl className="w-full">
                            <TextField
                                type={showPassword ? "text" : "password"}
                                color={errorPassword ? 'error' : 'primary'}
                                label="رمز عبور"
                                variant="outlined"
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-end' : 'text-black text-end', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    inputProps: {
                                        className: 'ltr'
                                    },
                                    endAdornment: <IconButton
                                        color={`${darkModeToggle ? 'white' : 'black'}`}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                }}
                                onChange={(event) => setPassword(event.target.value)} />

                            <FormHelperText className={`text-small-3 ${errorPassword ? 'text-primary-red' : 'text-secondary-gray'} `}>{helpTextPassword}</FormHelperText>
                        </FormControl>
                        <FormControl className="w-full">
                            <TextField
                                type={showRePassword ? "text" : "password"}
                                color={errorPassword ? 'error' : 'primary'}
                                label="تکرار رمز عبور"
                                variant="outlined"
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-end' : 'text-black text-end', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    inputProps: {
                                        className: 'ltr'
                                    },
                                    endAdornment: <IconButton
                                        color={`${darkModeToggle ? 'white' : 'black'}`}
                                        onClick={() => setShowRePassword(!showRePassword)}
                                    >
                                        {showRePassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                }}
                                onChange={(event) => setRePassword(event.target.value)} />
                        </FormControl>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setOpenBottomPasswordDrawer(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={passLoading}
                                onClick={updatePassword}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* ChangeMobile */}
            <>
                <Dialog onClose={() => setShowChangeMobileDialog(false)} open={showChangeMobileDialog} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'}>{mobileCodeSection ? <span>کد ارسال شده به شماره موبایل {mobile} را وارد نمائید:</span> : <span>ویرایش شماره موبایل</span>}
                        </Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
                        {mobileCodeSection ? <FormControl className="w-full">
                            <div className="custom-verification-input" dir="ltr">
                                <VerificationInput
                                    inputProps={{
                                        type: 'tel',
                                        inputMode: 'decimal',
                                        pattern: '[0-9]*',
                                        autoComplete: 'one-time-code'
                                    }}
                                    classNames={{
                                        character: errorCode ? "form-verification-input outline outline-primary-red" : "form-verification-input dark:!bg-dark",
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
                                {errorCode ? <FormHelperText className={`text-small-3 text-primary-red`}>کد وارد شده صحیح نمی باشد</FormHelperText> : null}
                            </div>
                        </FormControl> :
                            <FormControl className="w-full">
                                <PatternFormat
                                    format="#### ### ## ##"
                                    customInput={TextField}
                                    value={mobile}
                                    onValueChange={handleChangeMobile}
                                    onPaste={(event) => {
                                        event.preventDefault();
                                        const pastedText = event.clipboardData.getData('Text');
                                        const converted = ConvertText(pastedText);
                                        const mobileNumber = converted.startsWith('0') ? converted : `0${converted}`;
                                        setMobile(mobileNumber);
                                    }}
                                    type="tel"
                                    color={error ? 'error' : 'primary'}
                                    label="شماره تلفن همراه"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-center text-white' : 'text-center text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            className: 'ltr',
                                            inputMode: 'decimal',
                                            pattern: '[0-9]*'
                                        }
                                    }} />
                                <FormHelperText className={`text-small-3 ${error ? 'text-primary-red' : 'text-secondary-gray'} `}>{helpText}</FormHelperText>
                            </FormControl>}
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setShowChangeMobileDialog(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            {mobileCodeSection ? <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={changeMobileLoading}
                                onClick={verifyMobile}>
                                <text className="text-black font-semibold">تائید</text>
                            </LoadingButton > : <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={changeMobileLoading}
                                onClick={sendMobile}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >}
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomChangeMobileDrawer}
                    onClose={() => setOpenBottomChangeMobileDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'}>{mobileCodeSection ? <span>کد ارسال شده به شماره موبایل {mobile} را وارد نمائید:</span> : <span>ویرایش شماره موبایل</span>}
                        </Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
                        {mobileCodeSection ? <FormControl className="w-full">
                            <div className="custom-verification-input" dir="ltr">
                                <VerificationInput
                                    inputProps={{
                                        type: 'tel',
                                        inputMode: 'decimal',
                                        pattern: '[0-9]*',
                                        autoComplete: 'one-time-code'
                                    }}
                                    classNames={{
                                        character: errorCode ? "form-verification-input outline outline-primary-red" : "form-verification-input dark:!bg-dark",
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
                                {errorCode ? <FormHelperText className={`text-small-3 text-primary-red`}>کد وارد شده صحیح نمی باشد</FormHelperText> : null}
                            </div>
                        </FormControl> :
                            <FormControl className="w-full">
                                <PatternFormat
                                    format="#### ### ## ##"
                                    customInput={TextField}
                                    value={mobile}
                                    onValueChange={handleChangeMobile}
                                    onPaste={(event) => {
                                        event.preventDefault();
                                        const pastedText = event.clipboardData.getData('Text');
                                        const converted = ConvertText(pastedText);
                                        const mobileNumber = converted.startsWith('0') ? converted : `0${converted}`;
                                        setMobile(mobileNumber);
                                    }}
                                    type="tel"
                                    color={error ? 'error' : 'primary'}
                                    label="شماره تلفن همراه"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-center text-white' : 'text-center text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            className: 'ltr',
                                            inputMode: 'decimal',
                                            pattern: '[0-9]*'
                                        }
                                    }} />
                                <FormHelperText className={`text-small-3 ${error ? 'text-primary-red' : 'text-secondary-gray'} `}>{helpText}</FormHelperText>
                            </FormControl>}
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setOpenBottomChangeMobileDrawer(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            {mobileCodeSection ? <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={changeMobileLoading}
                                onClick={verifyMobile}>
                                <text className="text-black font-semibold">تائید</text>
                            </LoadingButton > : <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={changeMobileLoading}
                                onClick={sendMobile}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >}
                        </div>
                    </form>
                </SwipeableDrawer>
            </>
        </div>
    )
}

export default ProfileIndexPageCompo;