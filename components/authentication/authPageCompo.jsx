import { useState, useEffect } from 'react'
import LinkRouter from 'next/link';
import { useRouter } from 'next/router';
import { setCookie } from "nookies";

import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import FormHelperText from '@mui/material/FormHelperText'
import TextField from '@mui/material/TextField'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'

import { PatternFormat } from 'react-number-format';
import VerificationInput from "react-verification-input";

// const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"));

// Translations
import { useTranslations } from 'next-intl';

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call";
import ConvertText from "../../services/convertPersianToEnglish";

const AuthPageCompo = () => {

    const { state, dispatch } = useAppContext();
    const { siteInfo, darkModeToggle } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [codesection, setCodeSection] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorCode, setErrorCode] = useState(false);
    const [helpText, setHelpText] = useState('مالکیت شماره باید به نام خودتان باشد.');
    const [invitationCode, setInvitationCode] = useState(router.query.ref ? router.query.ref : '');

    const [errorPassword, setErrorPassword] = useState(false);
    const [helpTextPassword, setHelpTextPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [openBottomPrivacyDrawer, setOpenBottomPrivacyDrawer] = useState(false);

    useEffect(() => {
        const handlePageBackButton = (event) => {
            if (router.query.mobileNumber && codesection) {
                setCodeSection(false);
                event.preventDefault();
            }
        }

        window.addEventListener('popstate', handlePageBackButton);
        return () => {
            window.removeEventListener('popstate', handlePageBackButton);
        }
    }, [router.asPath, codesection]);

    useEffect(() => {
        if (!codesection) return;

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
    }, [codesection]);

    const handleBackmobileNumber = (event) => {
        event.preventDefault();
        setCodeSection(false);
    }

    const handleShowPrivacy = (event) => {
        if (window.innerWidth >= 1024) {
            setShowPrivacy(true);
            setOpenBottomPrivacyDrawer(false);
        } else {
            setShowPrivacy(false);
            setOpenBottomPrivacyDrawer(true);
        }
    }

    /**
   * Handles the invite section event.
   * @param {{Event}} event - The event object.
   * @returns None
  */
    const [expanded, setExpanded] = useState(router.query.ref ? true : false);
    const inviteSec = (event) => {
        event.preventDefault();
        if (!router.query.ref) {
            if (expanded) {
                setInvitationCode('');
            }
        }
        setExpanded(!expanded);
    }

    useEffect(() => {
        if (router.query.ref) {
            setInvitationCode(router.query.ref);
            setExpanded(true);
        } else {
            setInvitationCode('');
            setExpanded(false);
        }
    }, [router.query.ref]);

    const handleChange = (event) => {
        const converted = ConvertText(event.value);
        const mobileNumber = converted.startsWith('0') ? converted : `0${converted}`;
        setSignin({ ...signin, mobileNumber });

        if (mobileNumber.length === 11) {
            setError(false);
            setHelpText('مالکیت شماره باید به نام خودتان باشد.');
        } else {
            setError(true);
            setHelpText('شماره وارد شده صحیح نمی باشد.');
        }
    }

    /**
     * Function to handle Resend Code.
     * @param {Event} event - The event object.
     * @returns None
    */
    const resendCode = (event) => {
        event.preventDefault();
        // setLoading(true);
        event.target.disabled = true;
        ApiCall('/auth/register', 'POST', locale, { mobileNumber: signin.mobileNumber }, '', 'user', router).then(async (result) => {
            event.target.disabled = false;
            setLoading(false);
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
    /**
     * Function to handle Send Verification Code.
     * @param {Event} event - The event object.
     * @returns None
    */
    const handleSendCode = (event) => {
        event.preventDefault();
        setLoginWithPassword(false);
        ApiCall('/auth/login/otp', 'POST', locale, { mobileNumber: signin.mobileNumber }, '', 'user', router).then(async (result) => {
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
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
     * Function to handle user sign in.
     * @param {Event} event - The event object.
     * @returns None
    */
    const [signin, setSignin] = useState({ mobileNumber: router.query.mobileNumber ? router.query.mobileNumber : '', password: '', code: '', referralCode: '' });
    const [loginWithPassword, setLoginWithPassword] = useState(false);
    const [isFirstLoginDone, setIsFirstLoginDone] = useState(false);
    const signinUser = (event) => {
        event.preventDefault();
        if (signin.mobileNumber?.length == 11) {
            setLoading(true);
            event.target.disabled = true;
            ApiCall('/auth/register', 'POST', locale, { mobileNumber: signin.mobileNumber }, '', 'user', router).then(async (result) => {
                event.target.disabled = false;
                setLoading(false);
                setCodeSection(true);
                // router.push(`/auth?mobileNumber=${signin.mobileNumber}`, `/auth?mobileNumber=${signin.mobileNumber}`, { locale });
                setLoginWithPassword(result.canLoginWithPassword);
                setIsFirstLoginDone(result.isFirstLoginDone);
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
            setLoading(true);
            setDisabled(true);
            let body = invitationCode && !isFirstLoginDone ? { code: Number(value), mobileNumber: signin.mobileNumber, referralCode: invitationCode } :
                { code: Number(value), mobileNumber: signin.mobileNumber }
            ApiCall('/auth/login/otp-verify', 'POST', locale, body, '', 'user', router).then(async (result) => {
                dispatch({
                    type: 'setSnackbarProps', value: {
                        open: true, content: langText('Global.Welcome'),
                        type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                    }
                });
                // setLoading(false);
                setCookie(null, 'userToken', result.access_token, { path: '/' });

                dispatch({ type: 'setLoginStatus', value: true });
                // dispatch({
                //     type: 'setUserPic',
                //     value: result.trader.docs.find(item => item.name === 'userPic') ? { name: 'userPic', url: result.trader.docs.find(item => item.name === 'userPic').url, avatar: result.trader.docs.find(item => item.name === 'userPic').avatar }
                //         : null
                // });

                router.push('/panel', '/panel', { locale });
            }).catch((error) => {
                setCodeInputs('');
                setLoading(false);
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
     * Verifies the user by making an API call to the server with the provided code and email/mobileNumber.
     * @param {{Event}} event - The event object triggered by the user action.
     * @returns None
     */
    const verifyUser = (event) => {
        event.preventDefault();
        if (signin.password.length >= 8) {
            setErrorCode(false);
            setLoading(true);
            event.target.disabled = true;
            let body;
            let url;
            if (loginWithPassword) {
                body = { password: signin.password, mobileNumber: signin.mobileNumber }
                url = '/auth/login/password'
            } else {
                body = invitationCode && !isFirstLoginDone ? { code: Number(code), mobileNumber: signin.mobileNumber, referralCode: invitationCode } : { code: Number(code), mobileNumber: signin.mobileNumber }
                url = '/auth/login/otp-verify'
            }
            ApiCall(url, 'POST', locale, body, '', 'user', router).then(async (result) => {
                dispatch({
                    type: 'setSnackbarProps', value: {
                        open: true, content: langText('Global.Welcome'),
                        type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                    }
                });
                // setLoading(false);
                setCookie(null, 'userToken', result.access_token, { path: '/' });

                dispatch({ type: 'setLoginStatus', value: true });
                // dispatch({
                //     type: 'setUserPic',
                //     value: result.trader.docs.find(item => item.name === 'userPic') ? { name: 'userPic', url: result.trader.docs.find(item => item.name === 'userPic').url, avatar: result.trader.docs.find(item => item.name === 'userPic').avatar }
                //         : null
                // });

                router.push('/panel', '/panel', { locale });
            }).catch((error) => {
                setCodeInputs('');
                setLoading(false);
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
            setErrorCode(true);
        }
    }

    // /**
    //  * Handles setting reCAPTCHA token.
    //  * @param {{string}} captchaCode - The code generated by the reCAPTCHA component.
    //  * @returns None
    //  */
    // const onSigninReCAPTCHAChange = async (captchaCode) => {
    //     if (!captchaCode) {
    //         return;
    //     }

    //     setSignin({ ...signin, recaptcha: captchaCode });
    // }

    return (
        <div className="custom-box">
            {codesection ?
                <form className="flex flex-col gap-y-4" noValidate onSubmit={verifyUser}>
                    <h1 className="text-large-2 mb-2">ورود</h1>
                    <div className="flex items-center justify-end gap-x-4 border-b-4 border-indigo-500">
                        <PatternFormat displayType="text" value={signin.mobileNumber} format="#### ### ## ##" dir="ltr" />
                        <KeyboardDoubleArrowLeftIcon className="mb-1 cursor-pointer" onClick={handleBackmobileNumber} />
                    </div>
                    <div className="border border-black border-opacity-10 dark:border-primary-gray border-solid my-4"></div>
                    {loginWithPassword ?
                        <>
                            <FormControl className="w-full">
                                <TextField
                                    type={showPassword ? "text" : "password"}
                                    color={errorPassword ? 'error' : 'primary'}
                                    label="رمز عبور"
                                    variant="outlined"
                                    InputLabelProps={{
                                        className: 'dark:bg-dark px-1',
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { input: darkModeToggle ? 'text-white text-end' : 'text-black text-end', focused: 'border-none' },
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
                                    autoFocus={true}
                                    onChange={(event) => setSignin({ ...signin, password: event.target.value })} />
                                <FormHelperText className={`text-small-3 ${errorPassword ? 'text-primary-red' : 'text-secondary-gray'} `}>{helpTextPassword}</FormHelperText>
                            </FormControl>
                            <div>
                                <span className="text-small-2 text-primary hover:underline cursor-pointer" onClick={handleSendCode}>ورود با رمز یکبار مصرف</span>
                            </div>
                        </>
                        :
                        <>
                            <span>کد ارسال شده به شماره موبایل خود را وارد نمائید:</span>
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
                                            character: errorCode ? "form-verification-input outline outline-primary-red" : "form-verification-input",
                                            characterInactive: "bg-white dark:bg-transparent",
                                            characterSelected: "outline outline-primary",
                                            container: "w-full"
                                        }}
                                        value={codeInputs}
                                        onChange={(value) => { setCodeInputs(value); setErrorCode(false) }}
                                        placeholder=""
                                        autoFocus
                                        onComplete={onCodeComplete}
                                    />
                                </div>
                                {errorCode ? <FormHelperText className={`text-small-3 text-primary-red`}>کد وارد شده صحیح نمی باشد</FormHelperText> : null}
                            </FormControl>

                            {isFirstLoginDone ? '' : <FormControl className="w-full">
                                <label htmlFor="refferal" className="text-gold cursor-pointer" onClick={inviteSec}>کد معرف
                                    <IconButton
                                        color={darkModeToggle ? 'white' : 'black'}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="23" viewBox="0 0 22 23" fill="none"
                                            className={`w-4 h-4 transition ${invitationCode ? 'rotate-180' : ''}`}>
                                            <path d="M21.9662 10.62C21.5431 5.25538 17.2446 0.956924 11.88 0.533847C11.5923 0.516924 11.2877 0.5 11 0.5C4.92462 0.5 0 5.42462 0 11.5C0 17.5754 4.92462 22.5 11 22.5C17.0754 22.5 22 17.5754 22 11.5C22 11.2123 21.9831 10.9077 21.9662 10.62ZM12.4892 12.9892L11 15.7308L9.51077 12.9892L6.76923 11.5L9.51077 10.0108L11 7.26923L12.4892 10.0108L15.2308 11.5L12.4892 12.9892Z" fill="#F8CA67" />
                                        </svg>
                                    </IconButton>
                                </label>
                                <TextField
                                    className={`${expanded ? '' : 'hidden'}`}
                                    type="text"
                                    color="primary"
                                    placeholder="کد معرف"
                                    variant="outlined"
                                    InputLabelProps={{
                                        className: 'dark:bg-dark px-1',
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { input: darkModeToggle ? 'text-white text-end' : 'text-black text-end', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: { className: 'ltr' }
                                    }}
                                    value={invitationCode}
                                    onChange={(event) => setInvitationCode(event.target.value)} />
                            </FormControl>}
                        </>
                    }

                    <span className="text-small-2 text-primary hover:underline cursor-pointer my-4" onClick={handleBackmobileNumber}>شماره تلفن اشتباه می باشد؟</span>
                    <LoadingButton type="submit" variant="contained" size="medium" fullWidth className="rounded-l" disableElevation loading={loading}>
                        <text className="text-black font-semibold">تائید</text>
                    </LoadingButton >
                </form> :
                <form className="flex flex-col gap-y-4" noValidate onSubmit={signinUser}>
                    <h1 className="text-large-2 mb-2">ورود | ثبت نام</h1>
                    <FormControl className="w-full">
                        <PatternFormat
                            format="#### ### ## ##"
                            customInput={TextField}
                            value={signin.mobileNumber}
                            onValueChange={handleChange}
                            onPaste={(event) => {
                                event.preventDefault();
                                const pastedText = event.clipboardData.getData('Text');
                                const converted = ConvertText(pastedText);
                                const mobileNumber = converted.startsWith('0') ? converted : `0${converted}`;
                                setSignin({ ...signin, mobileNumber });
                            }}
                            type="tel"
                            color={error ? 'error' : 'primary'}
                            label="شماره تلفن همراه"
                            variant="outlined"
                            InputLabelProps={{
                                className: 'dark:bg-dark px-1',
                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                            }}
                            InputProps={{
                                classes: { input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                inputProps: {
                                    className: 'ltr',
                                    inputMode: 'decimal',
                                    pattern: '[0-9]*'
                                }
                            }} />
                        <FormHelperText className={`text-small-3 ${error ? 'text-primary-red' : 'text-secondary-gray'} `}>{helpText}</FormHelperText>
                    </FormControl>
                    {siteInfo?.termsAndConditions ? <span className="text-xs mx-2 mb-4">با ورود یا ثبت نام،
                        &nbsp;<span className="text-primary cursor-pointer hover:underline" onClick={handleShowPrivacy}>شرایط و قوانین</span>&nbsp;
                        را می‌پذیرم.</span> : ''}
                    <LoadingButton type="submit" variant="contained" size="medium" fullWidth className="rounded-lg" disableElevation loading={loading}>
                        <text className="text-black font-semibold">ادامه</text>
                    </LoadingButton >
                </form>}

            <Dialog onClose={() => setShowPrivacy(false)} open={showPrivacy} maxWidth={'sm'} fullWidth PaperProps={{ className: 'modals paper !p-8' }}>
                <div className="flex flex-col items-center gap-y-6">
                    <span className="w-full flex justify-between items-center gap-x-1 bg-white dark:text-white text-lg font-bold -mt-12 -mx-8 px-4 dark:bg-dark-alt sticky -top-8 z-10 py-4 ">
                        شرایط و قوانین
                        <IconButton color={darkModeToggle ? 'white' : 'black'}
                            className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                            onClick={() => setShowPrivacy(false)}>
                            <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                        </IconButton>
                    </span>
                    <div className="flex flex-col items-center gap-y-3 text-justify">
                        <p className="whitespace-pre-line">{siteInfo?.termsAndConditions}</p>
                    </div>
                    <Button type="submit" variant="contained" size="medium" fullWidth className="rounded-lg w-full lg:w-1/5 mx-auto" disableElevation
                        onClick={() => setShowPrivacy(false)}>
                        <text className="text-black font-semibold">بستن</text>
                    </Button>
                </div>
            </Dialog>
            <SwipeableDrawer
                disableBackdropTransition={true}
                disableDiscovery={true}
                disableSwipeToOpen={true}
                anchor={'bottom'}
                open={openBottomPrivacyDrawer}
                onClose={() => setOpenBottomPrivacyDrawer(false)}
                PaperProps={{ className: 'drawers', sx: { maxHeight: '85%' } }}
                ModalProps={{
                    keepMounted: false
                }}>
                <div className="flex flex-col items-center gap-y-6">
                    <span className="w-full flex justify-between items-center gap-x-1 bg-white dark:text-white text-lg font-bold mt-[-4rem] -mx-8 px-4 dark:bg-dark-alt sticky -top-8 z-10 py-6 ">
                        شرایط و قوانین
                        <IconButton color={darkModeToggle ? 'white' : 'black'}
                            className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                            onClick={() => setOpenBottomPrivacyDrawer(false)}>
                            <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                        </IconButton>
                    </span>
                    <div className="flex flex-col items-center gap-y-3 text-justify">
                        <p className="whitespace-pre-line">{siteInfo?.termsAndConditions}</p>
                    </div>
                    <Button type="submit" variant="contained" size="medium" fullWidth className="rounded-lg w-full lg:w-1/5 mx-auto" disableElevation
                        onClick={() => setOpenBottomPrivacyDrawer(false)}>
                        <text className="text-black font-semibold">بستن</text>
                    </Button>
                </div>
            </SwipeableDrawer>
        </div>
    )
}

export default AuthPageCompo;