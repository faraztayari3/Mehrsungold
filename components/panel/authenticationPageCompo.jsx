import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Check from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import VideoLabelIcon from '@mui/icons-material/VideoLabel';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import DatePicker from "react-datepicker2"
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import validator from "validator"
import moment from "jalali-moment"

import { PatternFormat } from 'react-number-format';

import heic2any from 'heic2any';
import imageCompression from 'browser-image-compression';

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call"
import ConvertText from "../../services/convertPersianToEnglish"

/**
 * AuthenticationIndexPageCompo component that displays the Authentication Page Component of the website.
 * @returns The rendered Authentication Page component.
 */
const AuthenticationIndexPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    // [ NotVerified, FirstLevelVerified, PendingSecondLevel, SecondLevelRejected, SecondLevelVerified ]
    const [authSteps, setAuthSteps] = useState([]);
    const [documentImages, setDocumentImages] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(userInfo?.verificationStatus);
    const [birthDate, setBirthDate] = useState(userInfo?.birthDate);
    useEffect(() => {
        getUserInformation();
        if ((siteInfo?.offlineFirstStepUserVerifyEnabled || siteInfo?.onlineFirstStepUserVerifyEnabled) && siteInfo?.secondStepUserVerifyEnabled) {
            setAuthSteps(['احراز هویت', 'احراز هویت پایه', 'احراز هویت کامل']);
        } else if ((siteInfo?.offlineFirstStepUserVerifyEnabled || siteInfo?.onlineFirstStepUserVerifyEnabled)) {
            setAuthSteps(['درباره احراز هویت', 'احراز هویت']);
        } else {
            setAuthSteps([]);
        }
    }, []);

    /**
     * Retrieves User Info for the user.
     * @returns None
    */
    const getUserInformation = () => {
        ApiCall('/user/me', 'GET', locale, {}, '', 'user', router).then(async (result) => {
            dispatch({
                type: 'setUserInfo', value: result
            });
            switch (result?.verificationStatus) {
                case 'NotVerified':
                    setActiveStep(0);
                    break;
                case 'FirstLevelRejected':
                    setActiveStep(1);
                    break;
                case 'PendingFirstLevel':
                    setActiveStep(1);
                    break;
                case 'FirstLevelVerified':
                    if (result?.verificationStatus == 'FirstLevelVerified' && siteInfo?.secondStepUserVerifyEnabled) {
                        setActiveStep(2);
                    } else {
                        setActiveStep(1);
                    }
                    break;
                case 'PendingSecondLevel':
                    setActiveStep(2);
                    break;
                case 'SecondLevelRejected':
                    setActiveStep(2);
                    break;
                case 'SecondLevelVerified':
                    setActiveStep(2);
                    break;

                default:
                    setActiveStep(0);
                    break;
            }
            if (result?.birthDate) {
                setBirthDate(moment(result?.birthDate).format("jYYYY/jMM/jDD"));
            }
            setDocumentImages(result?.documentImages || []);
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

    const QontoStepIcon = (props) => {
        const { active, completed, className } = props;

        return (
            <QontoStepIconRoot ownerState={{ active }} className={className}>
                {completed ? (
                    <Check className="QontoStepIcon-completedIcon" />
                ) : (
                    <div className="QontoStepIcon-circle" />
                )}
            </QontoStepIconRoot>
        )
    }

    QontoStepIcon.propTypes = {
        /**
         * Whether this step is active.
         * @default false
         */
        active: PropTypes.bool,
        className: PropTypes.string,
        /**
         * Mark the step as completed. Is passed to child components.
         * @default false
         */
        completed: PropTypes.bool
    }
    const ColorlibStepIcon = (props) => {
        const { active, completed, className } = props;

        const icons = {
            1: <SettingsIcon />,
            2: <GroupAddIcon />,
            3: <VideoLabelIcon />
        }

        return (
            <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
                {icons[String(props.icon)]}
            </ColorlibStepIconRoot>
        )
    }
    ColorlibStepIcon.propTypes = {
        /**
         * Whether this step is active.
         * @default false
         */
        active: PropTypes.bool,
        className: PropTypes.string,
        /**
         * Mark the step as completed. Is passed to child components.
         * @default false
         */
        completed: PropTypes.bool,
        /**
         * The label displayed in the step icon.
         */
        icon: PropTypes.node
    }

    const QontoStepIconRoot = styled('div')(({ theme, ownerState }) => ({
        color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#001d3d',
        display: 'flex',
        height: 22,
        alignItems: 'center',
        ...(ownerState.active && {
            color: '#784af4',
        }),
        '& .QontoStepIcon-completedIcon': {
            color: '#784af4',
            zIndex: 1,
            fontSize: 18,
        },
        '& .QontoStepIcon-circle': {
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
        }
    }));

    const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
        [`&.${stepConnectorClasses.alternativeLabel}`]: {
            top: 22,
        },
        [`&.${stepConnectorClasses.active}`]: {
            [`& .${stepConnectorClasses.line}`]: {
                backgroundColor:
                    ((verificationStatus == 'FirstLevelRejected' && activeStep == 1) || (verificationStatus == 'SecondLevelRejected' && activeStep == 2)) ? '#d32f2f' : '#ffc300',
            },
        },
        [`&.${stepConnectorClasses.completed}`]: {
            [`& .${stepConnectorClasses.line}`]: {
                backgroundColor:
                    '#ffc300',
            },
        },
        [`& .${stepConnectorClasses.line}`]: {
            height: 3,
            border: 0,
            backgroundColor:
                theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#001d3d',
            borderRadius: 1,
        }
    }));
    const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#001d3d',
        zIndex: 1,
        color: '#fff',
        width: 50,
        height: 50,
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        ...(ownerState.active && {
            backgroundColor:
                ((verificationStatus == 'FirstLevelRejected' && activeStep == 1) || (verificationStatus == 'SecondLevelRejected' && activeStep == 2)) ? '#d32f2f' : '#ffc300',
            boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
        }),
        ...(ownerState.completed && {
            backgroundColor:
                '#ffc300',
        })
    }));

    const [openReject, setOpenReject] = useState(true);
    const [itemData, setItemData] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [openBottomRejectDrawer, setOpenBottomRejectDrawer] = useState(false);
    const handleShowReject = (data) => () => {
        setItemData(data);
        if (window.innerWidth >= 1024) {
            setShowReject(true);
            setOpenBottomRejectDrawer(false);
        } else {
            setShowReject(false);
            setOpenBottomRejectDrawer(true);
        }
    }

    /**
     * Handles the update password event when the user submits the form.
     * @param {{Event}} event - The event object.
     * @returns None
     */
    const [authLoading, setAuthLoading] = useState(false);
    const submitUserAuthData = (step) => (event) => {
        event.preventDefault();
        if (step == 'step1') {
            if (!validator.isEmpty(userData.firstName || '') && !validator.isEmpty(userData.lastName || '') && validator.isLength(userData.nationalCode || '', { min: 10 }) && (userData.birthDate)) {
                setAuthLoading(true);
                event.target.disabled = true;
                let body = {
                    nationalCode: userData?.nationalCode,
                    firstName: userData?.firstName,
                    lastName: userData?.lastName,
                    birthDate: userData?.birthDate
                }
                ApiCall(siteInfo?.onlineFirstStepUserVerifyEnabled ? '/user/online-first-step-verify' : '/user/offline-first-step-verify/request', 'POST', locale, body, '', 'user', router).then(async (result) => {
                    event.target.disabled = false;
                    setAuthLoading(false);
                    setShowConfirm(true);
                    if (siteInfo?.onlineFirstStepUserVerifyEnabled) {
                        setVerificationStatus('FirstLevelVerified');
                    }
                    getUserInformation();
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: langText('Global.Success'),
                            type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                }).catch((error) => {
                    console.log(error);
                    setAuthLoading(false);
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
                let list = '';
                if (validator.isEmpty(userData.firstName || '')) {
                    list += `نام  نمی تواند خالی باشد<br />`
                    setErrorName(true);
                }
                if (validator.isEmpty(userData.lastName || '')) {
                    list += `نام خانوادگی نمی تواند خالی باشد<br />`
                    setErrorFamily(true);
                }
                if (!validator.isLength(userData.nationalCode || '', { min: 10 })) {
                    list += `کد ملی نمی تواند کمتر از 10 رقم باشد<br />`
                    setErrorNaCode(true);
                }
                if (!(userData.birthDate)) {
                    list += `تاریخ تولد را وارد نمائید<br />`
                    setErrorBirthdate(true);
                }

                dispatch({
                    type: 'setSnackbarProps', value: {
                        open: true, content: list,
                        type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                    }
                });
            }
        } else {
            if (['NotVerified', 'PendingFirstLevel', 'FirstLevelRejected'].includes(verificationStatus)) {
                dispatch({
                    type: 'setSnackbarProps', value: {
                        open: true, content: 'ابتدا احراز پایه نمائید',
                        type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                    }
                });
                setActiveStep(1);
            } else {
                if (documentImages?.length > 0 && documentImages?.every(image => image.url)) {
                    setAuthLoading(true);
                    event.target.disabled = true;
                    ApiCall('/user/second-step-verify/request', 'POST', locale, { documentImages }, '', 'user', router).then(async (result) => {
                        event.target.disabled = false;
                        getUserInformation();
                        setAuthLoading(false);
                        setShowConfirm(true);
                        dispatch({
                            type: 'setSnackbarProps', value: {
                                open: true, content: langText('Global.Success'),
                                type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                            }
                        });
                    }).catch((error) => {
                        console.log(error);
                        setAuthLoading(false);
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
                            open: true, content: 'لطفا تمامی مدارک را آپلود نمائید',
                            type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                }
            }
        }
    }

    const [activeStep, setActiveStep] = useState(0);

    const [userData, setUserData] = useState(userInfo);
    const [isGregorian, setIsGregorian] = useState(locale == "fa" ? false : true);

    /**
     * updates user birth date with the selected date from the datepicker.
     * @param {Event} event - The event object containing the selected date.
     * @returns None
     */
    const birthDatepicker = (event) => {
        setUserData({ ...userData, birthDate: event.locale(locale).format("YYYY-MM-DD") });
        if (locale == 'fa') {
            setBirthDate(event.locale(locale).format("jYYYY-jMM-jDD"));
        } else {
            setBirthDate(event.locale(locale).format("YYYY-MM-DD"));
        }
    }

    /**
         * Handles the change event for saving levels data.
         * @param {string} input - The name of the input field being changed.
         * @param {string} type - The type of the input field.
         * @param {Event} event - The change event object.
         * @returns None
         */
    const handleChangeEditData = (input, type) => (event) => {
        if (['NotVerified', 'FirstLevelRejected'].includes(verificationStatus)) {
            let value;
            setErrorName(false);
            setErrorFamily(false);
            setErrorNaCode(false);
            setErrorBirthdate(false);
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
                    if (event.value == '') {
                        value = '';
                    } else {
                        value = ConvertText(event.value);
                    }
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
    }
    const [errorName, setErrorName] = useState(false);
    const [errorFamily, setErrorFamily] = useState(false);
    const [errorNaCode, setErrorNaCode] = useState(false);
    const [errorBirthdate, setErrorBirthdate] = useState(false);
    const handleSteps = (step, shouldReturn) => (event) => {
        if (shouldReturn) {
            setActiveStep(step);
            setErrorName(false);
            setErrorFamily(false);
            setErrorNaCode(false);
            setErrorBirthdate(false);
        } else {
            if (step == 2) {
                if (!validator.isEmpty(userData.firstName || '') && !validator.isEmpty(userData.lastName || '') && validator.isLength(userData.nationalCode || '', { min: 10 }) && (userData.birthDate)) {
                    setActiveStep(step);
                } else {
                    let list = '';
                    if (validator.isEmpty(userData.firstName || '')) {
                        list += `نام  نمی تواند خالی باشد<br />`
                        setErrorName(true);
                    }
                    if (validator.isEmpty(userData.lastName || '')) {
                        list += `نام خانوادگی نمی تواند خالی باشد<br />`
                        setErrorFamily(true);
                    }
                    if (!validator.isLength(userData.nationalCode || '', { min: 10 })) {
                        list += `کد ملی نمی تواند کمتر از 10 رقم باشد<br />`
                        setErrorNaCode(true);
                    }
                    if (!(userData.birthDate)) {
                        list += `تاریخ تولد را وارد نمائید<br />`
                        setErrorBirthdate(true);
                    }

                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: list,
                            type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                }
            } else {
                setActiveStep(step);
                setErrorName(false);
                setErrorFamily(false);
                setErrorNaCode(false);
                setErrorBirthdate(false);
            }
        }
    }

    const [isDisabled, setIsDisabled] = useState(false);
    const [imageLoadings, setImageLoadings] = useState([]);
    const openItemImageFile = (index) => (event) => {
        if (!isDisabled) {
            document.querySelector(`input#authPic${index}`).click();
        }
    }

    /**
     * Converts HEIC image to JPEG if needed.
     * @param {File} file
     * @returns {Promise<File>}
     */
    async function convertHeicIfNeeded(file, index) {
        if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
            try {
                setImageLoadings(prev => {
                    const updated = [...prev];
                    updated[index] = true;
                    return updated;
                });
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.9,
                });

                const convertedFile = new File(
                    [convertedBlob],
                    file.name.replace(/\.heic$/i, '.jpg'),
                    { type: 'image/jpeg' }
                );

                return convertedFile;
            } catch (error) {
                console.error('HEIC conversion failed', error);
                throw error;
            }
        }
        return file;
    }

    /**
     * Uploads an Item Image asynchronously after converting HEIC and compressing it.
     * @param {number} index - Index of the image in the document list.
     * @returns None
     * @throws Any error that occurs during the upload process.
     */
    const uploadItemImage = (index) => async (event) => {
        try {
            const originalFile = event.target.files?.[0];
            if (!originalFile) return;

            setImageLoadings(prev => {
                const updated = [...prev];
                updated[index] = true;
                return updated;
            });
            setIsDisabled(true);

            const file = await convertHeicIfNeeded(originalFile, index);

            let finalFile = file;

            if (file.type.startsWith('image/') && file.size / 1024 / 1024 > 5) {
                const options = {
                    maxSizeMB: 5,
                    maxWidthOrHeight: 3000,
                    useWebWorker: true,
                    initialQuality: 0.9,
                };

                let compressedFile = await imageCompression(file, options);

                while (compressedFile.size / 1024 / 1024 > 5 && options.initialQuality > 0.5) {
                    options.initialQuality -= 0.05;
                    compressedFile = await imageCompression(file, options);
                }

                finalFile = new File([compressedFile], file.name, {
                    type: file.type || 'image/jpeg',
                });
            }

            const formData = new FormData();
            formData.append("file", finalFile);

            ApiCall('/upload', 'POST', locale, formData, '', 'user', router, true)
                .then((result) => {
                    setImageLoadings(prev => {
                        const updated = [...prev];
                        updated[index] = false;
                        return updated;
                    });
                    setIsDisabled(false);
                    setDocumentImages(prevImages => {
                        const updatedImages = [...prevImages];
                        updatedImages[index] = {
                            ...updatedImages[index],
                            name: siteInfo?.secondStepUserVerifyDocs[index]?.name,
                            url: result.fileUrl
                        };
                        return updatedImages;
                    });
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true,
                            content: langText('Global.Success'),
                            type: 'success',
                            duration: 1000,
                            refresh: Math.floor(Math.random() * 100) + 1
                        }
                    });
                })
                .catch((error) => {
                    setImageLoadings(prev => {
                        const updated = [...prev];
                        updated[index] = false;
                        return updated;
                    });
                    setIsDisabled(false);
                    let list = '';
                    if (error.message && typeof error.message === 'object') {
                        error.message.forEach(item => {
                            list += `${item}<br />`;
                        });
                    } else {
                        list = error.message;
                    }
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true,
                            content: list,
                            type: 'error',
                            duration: 3000,
                            refresh: Math.floor(Math.random() * 100) + 1
                        }
                    });
                });

        } catch (error) {
            setImageLoadings(prev => {
                const updated = [...prev];
                updated[index] = false;
                return updated;
            });
            setIsDisabled(false);
            console.error('Upload failed:', error);
        }
    }

    return (
        <div>
            <section className="xl:max-w-[40rem] xl:mx-auto">
                {/* <div className="flex items-center justify-between">
                    <h1 className="text-large-3 mb-6">احراز هویت</h1>
                </div> */}

                {userInfo?.verificationStatus != 'SecondLevelVerified' && (siteInfo?.offlineFirstStepUserVerifyEnabled || siteInfo?.onlineFirstStepUserVerifyEnabled) ? <Stack sx={{ width: '100%' }} spacing={4}>
                    <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
                        {authSteps.map((label, index) => (
                            <Step key={label}>
                                <StepLabel StepIconComponent={ColorlibStepIcon} onClick={() => setActiveStep(index)}>
                                    <span className={`${((verificationStatus == 'FirstLevelRejected' && activeStep == 1) || (verificationStatus == 'SecondLevelRejected' && activeStep == 2)) && index == 2 ? 'text-primary-red' : ''}`}>{label}</span>
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Stack> : ''}
            </section>
            <section className="xl:max-w-[60rem] xl:mx-auto my-8">
                {userInfo?.verificationStatus != 'SecondLevelVerified' && (siteInfo?.offlineFirstStepUserVerifyEnabled || siteInfo?.onlineFirstStepUserVerifyEnabled) ?
                    <div className="h-full custom-card flex flex-col lg:flex-row items-start justify-between gap-y-6 rounded-2xl p-5">
                        {activeStep == 0 ? <div className={`${activeStep == 0 ? 'block' : 'hidden'} w-full h-full`}>
                            <form className="grid grid-cols-12 justify-end justify-items-end gap-x-4 gap-y-8 py-8" autoComplete="off">
                                <LoadingButton variant="contained" color="primary" size="medium" className="custom-btn col-span-12 w-fit text-black rounded-lg" disableElevation
                                    onClick={handleSteps(1)}>
                                    <span>ادامه</span>
                                </LoadingButton>
                            </form>
                        </div> : ''}
                        {activeStep == 1 ? <div className={`${activeStep == 1 ? 'block' : 'hidden'} w-full h-full`}>
                            <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate autoComplete="off">
                                {verificationStatus == 'FirstLevelRejected' ?
                                    <div className="col-span-12 w-full xl:w-2/3 xl:mx-auto">
                                        <Alert
                                            variant="gradient"
                                            className="rounded-lg border-x-4 border-r-primary-red bg-primary-red bg-opacity-30 bg-none font-medium text-primary-red"
                                            open={openReject}
                                            icon={<svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="white"
                                                className="h-6 w-6"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>}
                                            action={
                                                <Button type="button" variant="contained" size="medium" color="error" className="rounded-lg w-full lg:w-fit py-1" disableElevation
                                                    onClick={handleShowReject(userInfo)}>
                                                    <text className="text-white font-semibold whitespace-nowrap">علت رد شدن</text>
                                                </Button>
                                            }
                                        >
                                            <div className="text-sm lg:text-base font-bold whitespace-nowrap overflow-x-hidden">
                                                احراز هویت شما رد شده است.
                                            </div>
                                        </Alert>
                                    </div> : ''}
                                <div className="col-span-12 md:col-span-6">
                                    <FormControl className="w-full">
                                        <TextField
                                            error={errorName}
                                            type="text"
                                            label="نام کاربر"
                                            variant="outlined"
                                            color={errorName ? 'error' : 'primary'}
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
                                            error={errorFamily}
                                            type="text"
                                            label="نام خانوادگی کاربر"
                                            variant="outlined"
                                            color={errorFamily ? 'error' : 'primary'}
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
                                            error={errorNaCode}
                                            format="### ### ## ##"
                                            customInput={TextField}
                                            type="tel"
                                            label="کدملی کاربر"
                                            variant="outlined"
                                            color={errorNaCode ? 'error' : 'primary'}
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-center text-white' : 'text-center text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px', textAlign: 'right' },
                                                inputProps: {
                                                    className: 'ltr',
                                                    inputMode: 'decimal',
                                                    pattern: '[0-9]*'
                                                },
                                                dir: 'rtl'
                                            }}
                                            value={userData?.nationalCode}
                                            onValueChange={handleChangeEditData('nationalCode', 'nationalCodeFormat')}
                                            onPaste={(event) => {
                                                event.preventDefault();
                                                const pastedText = event.clipboardData.getData('Text');
                                                const converted = ConvertText(pastedText);
                                                setUserData((prevState) => ({
                                                    ...prevState,
                                                    nationalCode: converted,
                                                }));
                                            }} />
                                    </FormControl>
                                </div>
                                <div className="col-span-12 md:col-span-6">
                                    <FormControl className="w-full">
                                        <DatePicker name="datePicker" timePicker={false} isGregorian={isGregorian} className="form-input hidden" onChange={birthDatepicker} />
                                        <TextField
                                            error={errorBirthdate}
                                            type="text"
                                            label="تاریخ تولد کاربر"
                                            variant="outlined"
                                            color={errorBirthdate ? 'error' : 'primary'}
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
                                            onClick={() => document.querySelector('input[name="datePicker"]').click()} />
                                    </FormControl>
                                </div>
                                <div className="col-span-12 flex gap-x-4 pb-8 justify-between lg:mt-8 lg:p-0 whitespace-nowrap">
                                    <Button vvariant="text" color={darkModeToggle ? 'white' : 'black'} size="medium" className="custom-btn text-black dark:text-white rounded-lg" disableElevation
                                        onClick={handleSteps(0)}>
                                        <span>بازگشت</span>
                                    </Button>
                                    <div className="flex items-center gap-x-4">
                                        {['PendingFirstLevel'].includes(verificationStatus) ?
                                            <Button variant="contained" color="primary" size="medium" className="custom-btn text-black rounded-lg pointer-events-none" disableElevation>
                                                <span>در حال بررسی</span>
                                            </Button>
                                            :
                                            verificationStatus == 'NotVerified' ? <LoadingButton variant="contained" color="primary" size="medium" className="custom-btn text-black rounded-lg" disableElevation loading={authLoading}
                                                onClick={submitUserAuthData('step1')}>
                                                <span>احراز پایه</span>
                                            </LoadingButton> : verificationStatus?.verificationStatus == 'FirstLevelVerified' && siteInfo?.secondStepUserVerifyEnabled ?
                                                <LoadingButton variant="contained" color="error" size="medium" fullWidth className="custom-btn w-1/2 *:text-white rounded-lg" disableElevation
                                                    onClick={handleSteps(2)}>
                                                    <span>احراز کامل</span>
                                                </LoadingButton> : <Button variant="contained" color="success" size="medium" fullWidth className="custom-btn text-white rounded-lg pointer-events-none" disableElevation>
                                                    <span>احراز شده</span>
                                                </Button>}
                                    </div>
                                </div>
                            </form>
                        </div> : ''}
                        {activeStep == 2 ? <div className={`${activeStep == 2 ? 'block' : 'hidden'} w-full h-full`}>
                            <form className="grid grid-cols-12 gap-x-4 gap-y-8 pt-4 pb-8" noValidate autoComplete="off">
                                {verificationStatus == 'SecondLevelRejected' ?
                                    <div className="col-span-12 w-full xl:w-2/3 xl:mx-auto">
                                        <Alert
                                            variant="gradient"
                                            className="rounded-lg border-x-4 border-r-primary-red bg-primary-red bg-opacity-30 bg-none font-medium text-primary-red"
                                            open={openReject}
                                            icon={<svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="white"
                                                className="h-6 w-6"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>}
                                            action={
                                                <Button type="button" variant="contained" size="medium" color="error" className="rounded-lg w-full lg:w-fit py-1" disableElevation
                                                    onClick={handleShowReject(userInfo)}>
                                                    <text className="text-white font-semibold whitespace-nowrap">علت رد شدن</text>
                                                </Button>
                                            }
                                        >
                                            <div className="text-sm lg:text-base font-bold whitespace-nowrap overflow-x-hidden">
                                                احراز هویت شما رد شده است.
                                            </div>
                                        </Alert>
                                    </div> : ''}
                                {siteInfo?.secondStepUserVerifyDocs?.map((data, index) => (
                                    <div key={index} className={`${siteInfo?.secondStepUserVerifyDocs?.length > 1 ? 'col-span-12 lg:col-span-6' : 'col-span-12'} flex flex-col gap-y-4`}>
                                        <p className="whitespace-pre-line m-0">{data.description}</p>
                                        <span>{data.name}</span>
                                        <div className="col-span-12">
                                            <input type="file" id={`authPic${index}`} className="hidden" onChange={uploadItemImage(index)} />
                                            <div className="flex flex-col items-center gap-y-4 border border-dashed border-opacity-70 border-primary rounded-lg cursor-pointer p-6"
                                                onClick={openItemImageFile(index)}>
                                                {imageLoadings[index] ?
                                                    <div className="py-14"><CircularProgress /></div> : documentImages[index]?.url ?
                                                        <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${documentImages[index]?.url}`} alt={index}
                                                            className="w-full lg:w-1/2 h-40 rounded-lg" /> : <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.defaultImage}`} alt={index}
                                                                className="w-full lg:w-1/2 h-40 rounded-lg" />}
                                                <Button type="button" variant="contained" size="medium" className="rounded-lg px-10" disableElevation>
                                                    <text className="text-black font-semibold">{data.name}</text>
                                                </Button >
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="col-span-12 flex gap-x-4 pb-8 justify-between lg:mt-8 lg:p-0 whitespace-nowrap">
                                    <Button vvariant="text" color={darkModeToggle ? 'white' : 'black'} size="medium" className="custom-btn text-black dark:text-white rounded-lg" disableElevation
                                        onClick={handleSteps(1)}>
                                        <span>بازگشت</span>
                                    </Button>
                                    {verificationStatus?.verificationStatus == 'SecondLevelVerified' && siteInfo?.secondStepUserVerifyEnabled ?
                                        <Button variant="contained" color="success" size="medium" fullWidth className="custom-btn text-white rounded-lg pointer-events-none" disableElevation>
                                            <span>احراز کامل</span>
                                        </Button> : <LoadingButton variant="contained" color="primary" size="medium" className="custom-btn text-black rounded-lg" disableElevation loading={authLoading}
                                            onClick={submitUserAuthData('step2')}>
                                            <span>احراز کامل</span>
                                        </LoadingButton>}

                                </div>
                            </form>
                        </div> : ''}
                    </div> : (userInfo?.verificationStatus == 'PendingSecondLevel' || userInfo?.verificationStatus == 'PendingFirstLevel') ? <div className="h-full custom-card flex flex-col items-center gap-y-6 rounded-2xl p-5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="59" height="59" viewBox="0 0 59 59" fill="none" className="modal-icon">
                            <path d="M53.0017 26.4025L49.6583 22.5183C49.0192 21.7808 48.5029 20.4042 48.5029 19.4208V15.2417C48.5029 12.6358 46.3642 10.4971 43.7583 10.4971H39.5792C38.6204 10.4971 37.2192 9.98083 36.4817 9.34167L32.5975 5.99833C30.9012 4.54792 28.1233 4.54792 26.4025 5.99833L22.5429 9.36625C21.8054 9.98083 20.4042 10.4971 19.4454 10.4971H15.1925C12.5867 10.4971 10.4479 12.6358 10.4479 15.2417V19.4454C10.4479 20.4042 9.93166 21.7808 9.31708 22.5183L5.99833 26.4271C4.5725 28.1233 4.5725 30.8767 5.99833 32.5729L9.31708 36.4817C9.93166 37.2192 10.4479 38.5958 10.4479 39.5546V43.7583C10.4479 46.3642 12.5867 48.5029 15.1925 48.5029H19.4454C20.4042 48.5029 21.8054 49.0192 22.5429 49.6583L26.4271 53.0017C28.1233 54.4521 30.9012 54.4521 32.6221 53.0017L36.5062 49.6583C37.2437 49.0192 38.6204 48.5029 39.6037 48.5029H43.7829C46.3887 48.5029 48.5275 46.3642 48.5275 43.7583V39.5792C48.5275 38.6204 49.0437 37.2192 49.6829 36.4817L53.0262 32.5975C54.4521 30.9013 54.4521 28.0987 53.0017 26.4025ZM39.7267 24.8537L27.8529 36.7275C27.5087 37.0717 27.0417 37.2683 26.55 37.2683C26.0583 37.2683 25.5912 37.0717 25.2471 36.7275L19.2979 30.7783C18.585 30.0654 18.585 28.8854 19.2979 28.1725C20.0108 27.4596 21.1908 27.4596 21.9037 28.1725L26.55 32.8188L37.1208 22.2479C37.8337 21.535 39.0137 21.535 39.7267 22.2479C40.4396 22.9608 40.4396 24.1408 39.7267 24.8537Z" fill="#26D192" />
                        </svg>
                        <div className="flex flex-col items-center gap-y-6">
                            <div className="flex flex-col items-center gap-y-4">
                                <span className="text-center dark:text-white text-xl font-extrabold">حساب شما در حال بررسی می باشد</span>
                                <span className=" text-center text-dark-gray dark:text-white text-xs font-normal">احراز هویت شما در حال بررسی می باشد. تیم پشتیبانی در اسرع وقت اطلاعات ارسالی شما را بررسی خواهند کرد</span>
                            </div>
                        </div>
                        <LinkRouter legacyBehavior href={'/panel'}>
                            <Button href={'/panel'} variant="contained" size="medium" className="rounded-lg w-full lg:w-fit" disableElevation>
                                <text className="text-black font-semibold whitespace-nowrap">بازگشت به داشبورد</text>
                            </Button>
                        </LinkRouter>
                    </div> : <div className="h-full custom-card flex flex-col items-center gap-y-6 rounded-2xl p-5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="59" height="59" viewBox="0 0 59 59" fill="none" className="modal-icon">
                            <path d="M53.0017 26.4025L49.6583 22.5183C49.0192 21.7808 48.5029 20.4042 48.5029 19.4208V15.2417C48.5029 12.6358 46.3642 10.4971 43.7583 10.4971H39.5792C38.6204 10.4971 37.2192 9.98083 36.4817 9.34167L32.5975 5.99833C30.9012 4.54792 28.1233 4.54792 26.4025 5.99833L22.5429 9.36625C21.8054 9.98083 20.4042 10.4971 19.4454 10.4971H15.1925C12.5867 10.4971 10.4479 12.6358 10.4479 15.2417V19.4454C10.4479 20.4042 9.93166 21.7808 9.31708 22.5183L5.99833 26.4271C4.5725 28.1233 4.5725 30.8767 5.99833 32.5729L9.31708 36.4817C9.93166 37.2192 10.4479 38.5958 10.4479 39.5546V43.7583C10.4479 46.3642 12.5867 48.5029 15.1925 48.5029H19.4454C20.4042 48.5029 21.8054 49.0192 22.5429 49.6583L26.4271 53.0017C28.1233 54.4521 30.9012 54.4521 32.6221 53.0017L36.5062 49.6583C37.2437 49.0192 38.6204 48.5029 39.6037 48.5029H43.7829C46.3887 48.5029 48.5275 46.3642 48.5275 43.7583V39.5792C48.5275 38.6204 49.0437 37.2192 49.6829 36.4817L53.0262 32.5975C54.4521 30.9013 54.4521 28.0987 53.0017 26.4025ZM39.7267 24.8537L27.8529 36.7275C27.5087 37.0717 27.0417 37.2683 26.55 37.2683C26.0583 37.2683 25.5912 37.0717 25.2471 36.7275L19.2979 30.7783C18.585 30.0654 18.585 28.8854 19.2979 28.1725C20.0108 27.4596 21.1908 27.4596 21.9037 28.1725L26.55 32.8188L37.1208 22.2479C37.8337 21.535 39.0137 21.535 39.7267 22.2479C40.4396 22.9608 40.4396 24.1408 39.7267 24.8537Z" fill="#26D192" />
                        </svg>
                        <div className="flex flex-col items-center gap-y-6">
                            <div className="flex flex-col items-center gap-y-4">
                                <span className="text-center dark:text-white text-xl font-extrabold">احراز حساب شما کامل می باشد</span>
                                <span className=" text-center text-dark-gray dark:text-white text-xs font-normal">هم اکنون می توانید از تمامی امکانات {siteInfo?.title || 'صرافی'} استفاده نمائید...</span>
                            </div>
                        </div>
                        <LinkRouter legacyBehavior href={'/panel'}>
                            <Button href={'/panel'} variant="contained" size="medium" className="rounded-lg w-full lg:w-fit" disableElevation>
                                <text className="text-black font-semibold whitespace-nowrap">بازگشت به داشبورد</text>
                            </Button>
                        </LinkRouter>
                    </div>}
            </section>

            {/* Confirm */}
            <Dialog onClose={() => setShowConfirm(false)} open={showConfirm} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals text-center !block' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="59" height="59" viewBox="0 0 59 59" fill="none" className="w-16 h-16">
                    <path d="M53.0017 26.4025L49.6583 22.5183C49.0192 21.7808 48.5029 20.4042 48.5029 19.4208V15.2417C48.5029 12.6358 46.3642 10.4971 43.7583 10.4971H39.5792C38.6204 10.4971 37.2192 9.98083 36.4817 9.34167L32.5975 5.99833C30.9012 4.54792 28.1233 4.54792 26.4025 5.99833L22.5429 9.36625C21.8054 9.98083 20.4042 10.4971 19.4454 10.4971H15.1925C12.5867 10.4971 10.4479 12.6358 10.4479 15.2417V19.4454C10.4479 20.4042 9.93166 21.7808 9.31708 22.5183L5.99833 26.4271C4.5725 28.1233 4.5725 30.8767 5.99833 32.5729L9.31708 36.4817C9.93166 37.2192 10.4479 38.5958 10.4479 39.5546V43.7583C10.4479 46.3642 12.5867 48.5029 15.1925 48.5029H19.4454C20.4042 48.5029 21.8054 49.0192 22.5429 49.6583L26.4271 53.0017C28.1233 54.4521 30.9012 54.4521 32.6221 53.0017L36.5062 49.6583C37.2437 49.0192 38.6204 48.5029 39.6037 48.5029H43.7829C46.3887 48.5029 48.5275 46.3642 48.5275 43.7583V39.5792C48.5275 38.6204 49.0437 37.2192 49.6829 36.4817L53.0262 32.5975C54.4521 30.9013 54.4521 28.0987 53.0017 26.4025ZM39.7267 24.8537L27.8529 36.7275C27.5087 37.0717 27.0417 37.2683 26.55 37.2683C26.0583 37.2683 25.5912 37.0717 25.2471 36.7275L19.2979 30.7783C18.585 30.0654 18.585 28.8854 19.2979 28.1725C20.0108 27.4596 21.1908 27.4596 21.9037 28.1725L26.55 32.8188L37.1208 22.2479C37.8337 21.535 39.0137 21.535 39.7267 22.2479C40.4396 22.9608 40.4396 24.1408 39.7267 24.8537Z" fill="#26D192" />
                </svg>
                {activeStep == 1 ?
                    <div className="flex flex-col items-center gap-y-6">
                        {siteInfo?.onlineFirstStepUserVerifyEnabled ?
                            <div className="flex flex-col items-center gap-y-4">
                                {siteInfo?.secondStepUserVerifyEnabled ? <span className="text-center dark:text-white text-xl font-extrabold">سطح کاربری شما با موفقیت به سطح  پایه ارتقا یافت</span> :
                                    <span className="text-center dark:text-white text-xl font-extrabold">حساب کاربری شما با موفقیت تائید شد</span>}
                                {siteInfo?.secondStepUserVerifyEnabled ? <span className=" text-center text-dark-gray dark:text-white text-xs font-normal">جهت استفاده از تمامی امکانات لطفا احراز هویت را کامل کنید</span> :
                                    <span className=" text-center text-dark-gray dark:text-white text-xs font-normal">هم اکنون می توانید از تمامی امکانات استفاده کنید</span>}
                            </div>
                            :
                            <div className="flex flex-col items-center gap-y-4">
                                <span className="text-center dark:text-white text-xl font-extrabold">درخواست احراز شما ثبت شد</span>
                                <span className=" text-center text-dark-gray dark:text-white text-xs font-normal">حداکثر تا ۱۵ دقیقه دیگر توسط کارشناسان ما بررسی و با تایید ، سطح شما ارتقا پیدا می کند</span>
                            </div>}
                        <div className="w-full flex gap-x-4">
                            <Button type="button" variant="contained" size="medium" color="success" fullWidth className="rounded-lg" disableElevation
                                onClick={() => {
                                    setShowConfirm(false);
                                    router.push('/panel', '/panel', { locale });
                                }}>
                                <text className="text-white font-semibold">تائید</text>
                            </Button >
                            {siteInfo?.secondStepUserVerifyEnabled ? <Button type="button" variant="contained" size="medium" fullWidth className="rounded-lg" disableElevation
                                onClick={() => {
                                    setShowConfirm(false);
                                    setActiveStep(2);
                                }}>
                                <text className="text-black font-semibold">احراز کامل</text>
                            </Button > : ''}
                        </div>
                    </div>
                    : <div className="flex flex-col items-center gap-y-6">
                        <div className="flex flex-col items-center gap-y-4">
                            <span className="text-center dark:text-white text-xl font-extrabold">درخواست احراز کامل ثبت شد</span>
                            <span className=" text-center text-dark-gray dark:text-white text-xs font-normal">حداکثر تا ۱۵ دقیقه دیگر توسط کارشناسان ما بررسی و با تایید ، سطح شما ارتقا پیدا می کند</span>
                        </div>
                        <div className="w-full flex gap-x-4">
                            <Button type="button" variant="contained" size="medium" fullWidth className="rounded-lg" disableElevation
                                onClick={() => {
                                    setShowConfirm(false);
                                    router.push('/panel', '/panel', { locale });
                                }}>
                                <text className="text-black font-semibold">تائید</text>
                            </Button >
                        </div>
                    </div>}
            </Dialog>

            {/* Reject Description */}
            <>
                <Dialog onClose={() => setShowReject(false)} open={showReject} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <Typography component={'h2'}>علت رد شدن احراز هویت</Typography>
                    <div className="flex flex-col gap-y-4 mt-6">
                        <FormControl>
                            <TextField
                                type="text"
                                multiline
                                rows={8}
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl cursor-default' : 'text-black rtl cursor-default', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                value={itemData?.verifyDescription} />
                        </FormControl>
                        <div className="flex items-center justify-end gap-x-2">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                onClick={() => setShowReject(false)}>
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
                    open={openBottomRejectDrawer}
                    onClose={() => setOpenBottomRejectDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <Typography component={'h2'}>علت رد شدن احراز هویت</Typography>
                    <div className="flex flex-col gap-y-4 mt-6">
                        <FormControl>
                            <TextField
                                type="text"
                                multiline
                                rows={8}
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl cursor-default' : 'text-black rtl cursor-default', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                value={itemData?.verifyDescription} />
                        </FormControl>
                        <Button type="button" variant="contained" size="medium" fullWidth className="rounded-lg" disableElevation
                            onClick={() => setOpenBottomRejectDrawer(false)}>
                            <text className="text-black font-semibold">بستن</text>
                        </Button >
                    </div>
                </SwipeableDrawer>
            </>

        </div>
    )
}

export default AuthenticationIndexPageCompo;