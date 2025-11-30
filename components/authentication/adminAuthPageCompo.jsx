import { useState } from 'react'
import { useRouter } from 'next/router';
import { setCookie } from "nookies";

import LoadingButton from '@mui/lab/LoadingButton'
import FormControl from '@mui/material/FormControl'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import FormHelperText from '@mui/material/FormHelperText'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'

import { PatternFormat } from 'react-number-format';

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
    const { darkModeToggle } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [codesection, setCodeSection] = useState(router.query.mobileNumber ? true : false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorCode, setErrorCode] = useState(false);
    const [helpText, setHelpText] = useState('');

    const [errorPassword, setErrorPassword] = useState(false);
    const [helpTextPassword, setHelpTextPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);

    const handleChange = (event) => {
        const converted = ConvertText(event.value);
        const mobileNumber = converted.startsWith('0') ? converted : `0${converted}`;
        setSignin({ ...signin, mobileNumber });

        if (mobileNumber.length == 11) {
            setError(false);
            setHelpText('');
        } else {
            setError(true);
            setHelpText('شماره وارد شده صحیح نمی باشد.');
        }
    }

    /**
     * Function to handle user sign in.
     * @param {Event} event - The event object.
     * @returns None
    */
    const [signin, setSignin] = useState({ mobileNumber: '', password: '' });
    const signinUser = (event) => {
        event.preventDefault();
        if (signin.mobileNumber?.length == 11) {
            setLoading(true);
            event.target.disabled = true;
            ApiCall('/auth/admin/login/password', 'POST', locale, { mobileNumber: signin.mobileNumber, password: signin.password }, '', 'admin', router).then(async (result) => {
                dispatch({
                    type: 'setSnackbarProps', value: {
                        open: true, content: langText('Global.Welcome'),
                        type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                    }
                });
                // event.target.disabled = false;
                // setLoading(false);
                setCookie(null, 'adminToken', result.access_token, { path: '/' });
                router.push(`/admin/panel`, `/admin/panel`, { locale });
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

    return (
        <div className="custom-box">
            <form className="flex flex-col gap-y-4" noValidate onSubmit={signinUser}>
                <h1 className="text-large-2 mb-2">ورودبه پنل مدیریت</h1>
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
                        onChange={(event) => setSignin({ ...signin, password: event.target.value })} />
                </FormControl>
                <LoadingButton type="submit" variant="contained" size="medium" fullWidth className="rounded-lg" disableElevation loading={loading}>
                    <text className="text-black font-semibold">ورود</text>
                </LoadingButton >
            </form>
        </div>
    )
}

export default AuthPageCompo;