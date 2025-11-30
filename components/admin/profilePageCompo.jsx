import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import FormHelperText from '@mui/material/FormHelperText'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'

import { PatternFormat } from 'react-number-format';

// Spinner

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call"

//Components

/**
 * ProfilePageCompo component that displays the Profile Index Page Component of the website.
 * @returns The rendered Profile Index Page component.
 */
const ProfilePageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [hasPassword, setHasPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getUserInformation();
    }, []);

    /**
         * Retrieves User Info for the user.
         * @returns None
        */
    const [userInfo, setUserInfo] = useState();
    const [userLoading, setUserLoading] = useState(false);
    const getUserInformation = () => {
        setUserLoading(true);
        ApiCall('/user/me', 'GET', locale, {}, '', 'admin', router).then(async (result) => {
            setUserInfo(result);
            setHasPassword(result.hasPassword);
            setUserLoading(false);
        }).catch((error) => {
            setUserLoading(false);
            console.log(error);
        });
    }

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
                    ApiCall('/auth/change-password', 'POST', locale, { newPassword: password }, '', 'admin', router).then(async (result) => {
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

    return (
        <div className="xl:max-w-[40rem] xl:mx-auto">
            {userLoading ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : <section>
                <h1 className="text-large-3 mb-6">پروفایل کاربری</h1>
                <div className="h-full custom-card flex flex-col lg:flex-row items-start justify-between gap-y-3 rounded-2xl p-5">
                    <PatternFormat displayType="text" value={userInfo?.mobileNumber} format="#### ### ## ##" dir="ltr" className="text-large-1" />
                    <div className="flex flex-col justify-between gap-y-2 w-full lg:w-fit h-full">
                        <div className="flex items-center justify-between gap-x-8">
                            <span>شماره تلفن همراه:</span>
                            <PatternFormat displayType="text" value={userInfo?.mobileNumber} format="#### ### ## ##" dir="ltr" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span>کلمه‌ی عبور:</span>
                            <Button variant="contained" color="primary" size="small" className="custom-btn text-black rounded-lg" onClick={handleShowPasswordDialog}>
                                {hasPassword ? <span>ویرایش کلمه عبور</span> : <span>تعیین کلمه عبور</span>}
                            </Button>
                        </div>
                    </div>

                </div>
            </section>}

            {/* Password */}
            <>
                <Dialog onClose={() => setShowPasswordDialog(false)} open={showPasswordDialog} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">تعیین کلمه عبور
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
                    <div className="block mb-6"><div className="puller"></div></div>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">تعیین کلمه عبور
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
                                onClick={() => setShowPasswordDialog(false)}>
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
        </div>
    )
}

export default ProfilePageCompo;