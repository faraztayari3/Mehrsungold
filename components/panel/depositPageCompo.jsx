import { useState, useEffect, useRef } from 'react'
import LinkRouter from "next/link"
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import LoadingButton from '@mui/lab/LoadingButton'
import CircularProgress from '@mui/material/CircularProgress'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Collapse from '@mui/material/Collapse'

import { PatternFormat, NumericFormat } from 'react-number-format';

import heic2any from 'heic2any';
import imageCompression from 'browser-image-compression';

// Validation
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call"
import CheckCardNumber from "../../services/checkCardNumber"
import FilterEmptyFields from "../../services/filterEmptyFields"

//Components
import AddBankAccount from "./compos/addBankAccount"
import CopyData from "../../services/copy"

/**
 * DepositPageCompo component that displays the Deposit Page Component of the website.
 * @returns The rendered Deposit Page component.
 */
const DepositPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, refreshData, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();
    const [tabValue, setTabValue] = useState(router.query.type == 'online' ? 0 : 1);

    const validationOnlineSchema = Yup.object({
        amount: Yup.string().required('این فیلد الزامی است')
    });
    const validationOfflineSchema = Yup.object({
        amount: Yup.string().required('این فیلد الزامی است'),
        trackingCode: Yup.string().required('این فیلد الزامی است')
    });

    const { control, setValue, handleSubmit, formState: { errors }, clearErrors } = useForm({
        resolver: yupResolver(tabValue == 0 ? validationOnlineSchema : validationOfflineSchema),
        defaultValues: { amount: router.query?.amount || '' }
    });

    const clearForm = () => {
        setValue('amount', '');
        setValue('trackingCode', '');
    }

    const [loading, setLoading] = useState(false);
    const [openAlert, setOpenAlert] = useState(true);

    useEffect(() => {
        setTabValue(router.query.type == 'online' ? 0 : router.query.type == 'offline' ? 1 : 2);
        if (router.query.type == 'id-deposit') {
            getIDDepositData();
        }
    }, [router.query.type]);

    const handleChange = (event, newTabValue) => {
        setTabValue(newTabValue);
        setAmount('');
        clearForm();
        clearErrors();
        if (newTabValue == 0) {
            router.push(`/panel/deposit?type=online`, `/panel/deposit?type=online`, { locale });
        } else if (newTabValue == 1) {
            router.push(`/panel/deposit?type=offline`, `/panel/deposit?type=offline`, { locale });
        } else {
            router.push(`/panel/deposit?type=id-deposit`, `/panel/deposit?type=id-deposit`, { locale });
        }
    }

    useEffect(() => {
        getBankAccounts();
    }, [refreshData]);

    /**
        * Retrieves BankAccounts.
        * @returns None
       */
    const [userCard, setUserCard] = useState();
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loadingBankAccounts, setLoadingBankAccounts] = useState(true);
    const [bankAccountsLimit, setBankAccountsLimit] = useState(10);
    const [bankAccountsTotal, setBankAccountsTotal] = useState(0);
    const getBankAccounts = () => {
        setLoadingBankAccounts(true);
        ApiCall('/user/card', 'GET', locale, {}, `status=Active&limit=${bankAccountsLimit}&skip=${(1 * bankAccountsLimit) - bankAccountsLimit}`, 'user', router).then(async (result) => {
            if (router.query.amount) {
                setAmount(parseInt(router.query.amount));
                userDepositOnline(parseInt(router.query.amount));
            }
            setBankAccountsTotal(result.count);
            setUserCard(result.data[0]?._id || '');
            setBankAccounts(result.data);
            setLoadingBankAccounts(false);
        }).catch((error) => {
            setLoadingBankAccounts(false);
            console.log(error);
        });
    }

    const [amount, setAmount] = useState(router.query?.amount || '');
    const handleAmount = (amountValue) => () => {
        setAmount(amountValue);
        setValue('amount', amountValue);
        clearErrors();
    }

    /**
         * User Online Deposit Request.
         * @returns None
        */
    const [errorDeposit, setErrorDeposit] = useState(false);
    const [errorDepositCreditCard, setErrorDepositCreditCard] = useState(false);
    const [gateways, setGateways] = useState([
        { name: 'وندار', value: 'vandar', url: '/balance-transaction/vandar/online-deposit', active: siteInfo?.vandarGatewayIsActive || false },
        { name: 'پی استار', value: 'paystar', url: '/balance-transaction/paystar/online-deposit', active: siteInfo?.paystarGatewayIsActive || false },
        { name: 'سامان', value: 'saman', url: '/balance-transaction/saman/online-deposit', active: siteInfo?.samanGatewayIsActive || false }
    ]);
    const [gatewayName, setGatewayName] = useState(gateways[0]);
    const [activeGateways, setActiveGateways] = useState(false);
    useEffect(() => {
        const activeGatewaysList = gateways?.filter(gateway => gateway.active);

        if (activeGatewaysList?.length >= 2) {
            setGatewayName(activeGatewaysList[0]);
            setActiveGateways(true);
        } else if (activeGatewaysList?.length === 1) {
            setGatewayName(activeGatewaysList[0]);
            setActiveGateways(false);
        } else {
            setActiveGateways(false);
        }
    }, [gateways]);
    const userDepositOnline = (newAmount) => {
        if ((!siteInfo?.offlineFirstStepUserVerifyEnabled && !siteInfo?.onlineFirstStepUserVerifyEnabled) || (['FirstLevelVerified', 'SecondLevelVerified'].includes(userInfo?.verificationStatus))) {
            // if (true) {
            if ((amount || newAmount) >= (siteInfo?.minDepositAmount || 0)) {
                let body;
                let url = gatewayName?.url;
                if (['vandar', 'saman'].includes(gatewayName?.value)) {
                    body = { amount: parseInt(amount || newAmount) }
                } else if (gatewayName?.value == 'paystar') {
                    if (!userCard) {
                        setErrorDepositCreditCard(true);
                        return false;
                    }
                    body = { amount: parseInt(amount || newAmount), cardId: userCard }
                }
                setLoading(true);
                ApiCall(url, 'POST', locale, body, '', 'user', router).then(async (result) => {
                    setLoading(false);
                    clearForm();
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: langText('Global.Success'),
                            type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                    setTimeout(() => {
                        window.open(result.redirectUrl, '_blank');
                    }, 200);
                    setAmount('');
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
                setErrorDeposit(true);
            }
        } else {
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
    }

    const [offlineDepositData, setOfflineDepositData] = useState({
        amount: '',
        trackingCode: '',
        image: ''
    });

    /**
     * Handles the change event for saving offline deposit data.
     * @param {string} input - The name of the input field being changed.
     * @param {string} type - The type of the input field.
     * @param {Event} event - The change event object.
     * @returns None
     */
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
        setOfflineDepositData((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
         * User Offline Deposit Request.
         * @returns None
        */
    const userDepositOffline = () => {
        if ((!siteInfo?.offlineFirstStepUserVerifyEnabled && !siteInfo?.onlineFirstStepUserVerifyEnabled) || (['FirstLevelVerified', 'SecondLevelVerified'].includes(userInfo?.verificationStatus))) {
            if (offlineDepositData?.amount >= (siteInfo?.minDepositAmount || 0)) {
                if (!userCard) {
                    setErrorDepositCreditCard(true);
                    return false;
                }
                setLoading(true);
                let body = FilterEmptyFields(offlineDepositData);
                ApiCall('/balance-transaction/offline-deposit', 'POST', locale, { ...body, cardId: userCard }, '', 'user', router).then(async (result) => {
                    setLoading(false);
                    setOfflineDepositData({
                        amount: '',
                        cardId: '',
                        trackingCode: '',
                        image: ''
                    });
                    clearForm();
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: langText('Global.Success'),
                            type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
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
                setErrorDeposit(true);
            }
        } else {
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
    }

    const [isDisabled, setIsDisabled] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const openItemImageFile = (event) => {
        if (!isDisabled) {
            document.querySelector(`input#recievePic`).click();
        }
    }

    /**
 * Converts HEIC image to JPEG if needed.
 * @param {File} file
 * @returns {Promise<File>}
 */
    async function convertHeicIfNeeded(file) {
        if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
            try {
                setImageLoading(true);
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
     * Uploads an Item Image asynchronously (with HEIC support and compression).
     * @param {{File}} file - The Image file to upload.
     * @returns None
     * @throws Any error that occurs during the upload process.
     */
    const uploadItemImage = async (event) => {
        try {
            const originalFile = event.target.files?.[0];
            if (!originalFile) return;

            setImageLoading(true);
            setIsDisabled(true);

            const file = await convertHeicIfNeeded(originalFile);

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
                    setImageLoading(false);
                    setIsDisabled(false);
                    setOfflineDepositData({ ...offlineDepositData, image: result.fileUrl });
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
                    setImageLoading(false);
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
            setImageLoading(false);
            setIsDisabled(false);
            console.error('Upload failed:', error);
        }
    }

    /**
        * Retrieves ID Deposit.
        * @returns None
       */
    const [IDDepositData, setIDDepositData] = useState();
    const [loadingIDDepositData, setLoadingIDDepositData] = useState(true);
    const [haserrorIDDeposit, setHasErrorIDDeposit] = useState(false);
    const getIDDepositData = () => {
        setLoadingIDDepositData(true);
        ApiCall('/user/vandar-id-deposit', 'GET', locale, {}, ``, 'user', router).then(async (result) => {
            setIDDepositData(result);
            setHasErrorIDDeposit(false);
            setLoadingIDDepositData(false);
        }).catch((error) => {
            setLoadingIDDepositData(false);
            setHasErrorIDDeposit(true);
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

    return (
        <div className="xl:max-w-[40rem] mx-auto">
            <form className="flex flex-col gap-y-4" noValidate autoComplete="off" onSubmit={tabValue == 0 ? handleSubmit(userDepositOnline) : handleSubmit(userDepositOffline)}>
                <Tabs variant="fullWidth" indicatorColor="primary" textColor="inherit" className="rounded-t-2xl -mt-1 lg:w-fit"
                    value={tabValue}
                    onChange={handleChange}>
                    <Tab label="واریز از درگاه" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} />
                    <Tab label="واریز دستی" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} />
                    {siteInfo?.idDepositIsActive ? <Tab label="واریز شناسه دار" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} /> : ''}
                </Tabs>
                {tabValue == 2 && siteInfo?.idDepositIsActive ? '' : tabValue == 0 ?
                    siteInfo?.balanceTransPageDesc1 ? <Collapse in={openAlert}>
                        <Alert
                            severity="info"
                            variant="filled"
                            color="info"
                            className="custom-alert info"
                            onClose={() => setOpenAlert(false)}
                        >
                            {tabValue == 0 ?
                                <p className="whitespace-pre-line my-0">
                                    {siteInfo?.balanceTransPageDesc1}
                                </p>
                                : ''}
                        </Alert>
                    </Collapse>
                        : tabValue == 1 ?
                            siteInfo?.balanceTransPageDesc2 ? <Collapse in={openAlert}>
                                <Alert
                                    severity="info"
                                    variant="filled"
                                    color="info"
                                    className="custom-alert info"
                                    onClose={() => setOpenAlert(false)}
                                >
                                    {tabValue == 1 ?
                                        <>
                                            <p className="whitespace-pre-line my-0">
                                                {siteInfo?.balanceTransPageDesc2}
                                            </p>
                                            {tabValue == 1 && (siteInfo?.cardOwnerName && siteInfo?.appOwnerCardNumber && siteInfo?.appOwnerIban) ? <li className="flex flex-col items-start gap-y-2 rounded-lg px-2 py-2 dark:bg-dark-alt">
                                                <div className="flex items-center gap-x-2">
                                                    <span>به نام: </span>
                                                    <span className="dark:text-white text-base font-normal">{siteInfo?.cardOwnerName}</span>
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span>شماره کارت مقصد: </span>
                                                    <div className="flex items-center gap-x-2">
                                                        <div className="w-4 h-4 rounded-[50%] flex items-center justify-center dark:bg-white p-2">
                                                            <img alt={CheckCardNumber(siteInfo?.appOwnerCardNumber).name} title={CheckCardNumber(siteInfo?.appOwnerCardNumber).name} src={CheckCardNumber(siteInfo?.appOwnerCardNumber).image}
                                                                width="48" height="48" decoding="async" data-nimg="1" loading="lazy" className="w-6 h-6 object-contain" />
                                                        </div>
                                                        <PatternFormat displayType='text' value={siteInfo?.appOwnerCardNumber} format="####-####-####-####" dir="ltr"
                                                            className="dark:text-white text-base font-semibold" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span>شماره شبا مقصد: </span>
                                                    <PatternFormat displayType='text' value={(siteInfo?.appOwnerIban)?.replace('ir', '').replace('IR', '')}
                                                        format="IR## #### #### #### #### #### ##" className="dark:text-white text-base font-normal" />
                                                </div>
                                            </li> : ''}
                                        </> : ''}

                                </Alert>
                            </Collapse>
                                : <Collapse in={openAlert}>
                                    <Alert
                                        severity="info"
                                        variant="filled"
                                        color="info"
                                        className="custom-alert info"
                                        onClose={() => setOpenAlert(false)}
                                    >
                                        <span>لطفا قبل از ثبت واریز به این موارد توجه فرمایید:</span>
                                        <ul className="flex flex-col gap-y-4 list-none p-0 text-justify">
                                            <li>حداقل مقدار واریز {(siteInfo?.minDepositAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان می‌باشد.</li>
                                            <li> واریز باید از شماره‌ کارت خودتان باشد که در سامانه ثبت شده است.</li>
                                            {tabValue == 1 && (siteInfo?.cardOwnerName && siteInfo?.appOwnerCardNumber && siteInfo?.appOwnerIban) ? <li className="flex flex-col items-start gap-y-2 rounded-lg px-2 py-2 dark:bg-dark-alt">
                                                <div className="flex items-center gap-x-2">
                                                    <span>به نام: </span>
                                                    <span className="dark:text-white text-base font-normal">{siteInfo?.cardOwnerName}</span>
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span>شماره کارت مقصد: </span>
                                                    <div className="flex items-center gap-x-2">
                                                        <div className="w-4 h-4 rounded-[50%] flex items-center justify-center dark:bg-white p-2">
                                                            <img alt={CheckCardNumber(siteInfo?.appOwnerCardNumber).name} title={CheckCardNumber(siteInfo?.appOwnerCardNumber).name} src={CheckCardNumber(siteInfo?.appOwnerCardNumber).image}
                                                                width="48" height="48" decoding="async" data-nimg="1" loading="lazy" className="w-6 h-6 object-contain" />
                                                        </div>
                                                        <PatternFormat displayType='text' value={siteInfo?.appOwnerCardNumber} format="####-####-####-####" dir="ltr"
                                                            className="dark:text-white text-base font-semibold" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span>شماره شبا مقصد: </span>
                                                    <PatternFormat displayType='text' value={(siteInfo?.appOwnerIban)?.replace('ir', '').replace('IR', '')}
                                                        format="IR## #### #### #### #### #### ##" className="dark:text-white text-base font-normal" />
                                                </div>
                                            </li> : ''}
                                        </ul>
                                    </Alert>
                                </Collapse>
                            : <Collapse in={openAlert}>
                                <Alert
                                    severity="info"
                                    variant="filled"
                                    color="info"
                                    className="custom-alert info"
                                    onClose={() => setOpenAlert(false)}
                                >
                                    <span>لطفا قبل از ثبت واریز به این موارد توجه فرمایید:</span>
                                    <ul className="flex flex-col gap-y-4 list-none p-0 text-justify">
                                        <li>حداقل مقدار واریز {(siteInfo?.minDepositAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان می‌باشد.</li>
                                        <li> واریز باید از شماره‌ کارت خودتان باشد که در سامانه ثبت شده است.</li>
                                        {tabValue == 1 && (siteInfo?.cardOwnerName && siteInfo?.appOwnerCardNumber && siteInfo?.appOwnerIban) ? <li className="flex flex-col items-start gap-y-2 rounded-lg px-2 py-2 dark:bg-dark-alt">
                                            <div className="flex items-center gap-x-2">
                                                <span>به نام: </span>
                                                <span className="dark:text-white text-base font-normal">{siteInfo?.cardOwnerName}</span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span>شماره کارت مقصد: </span>
                                                <div className="flex items-center gap-x-2">
                                                    <div className="w-4 h-4 rounded-[50%] flex items-center justify-center dark:bg-white p-2">
                                                        <img alt={CheckCardNumber(siteInfo?.appOwnerCardNumber).name} title={CheckCardNumber(siteInfo?.appOwnerCardNumber).name} src={CheckCardNumber(siteInfo?.appOwnerCardNumber).image}
                                                            width="48" height="48" decoding="async" data-nimg="1" loading="lazy" className="w-6 h-6 object-contain" />
                                                    </div>
                                                    <PatternFormat displayType='text' value={siteInfo?.appOwnerCardNumber} format="####-####-####-####" dir="ltr"
                                                        className="dark:text-white text-base font-semibold" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span>شماره شبا مقصد: </span>
                                                <PatternFormat displayType='text' value={(siteInfo?.appOwnerIban)?.replace('ir', '').replace('IR', '')}
                                                    format="IR## #### #### #### #### #### ##" className="dark:text-white text-base font-normal" />
                                            </div>
                                        </li> : ''}
                                    </ul>
                                </Alert>
                            </Collapse>
                    : <Collapse in={openAlert}>
                        <Alert
                            severity="info"
                            variant="filled"
                            color="info"
                            className="custom-alert info"
                            onClose={() => setOpenAlert(false)}
                        >
                            <span>لطفا قبل از ثبت واریز به این موارد توجه فرمایید:</span>
                            <ul className="flex flex-col gap-y-4 list-none p-0 text-justify">
                                <li>حداقل مقدار واریز {(siteInfo?.minDepositAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان می‌باشد.</li>
                                <li> واریز باید از شماره‌ کارت خودتان باشد که در سامانه ثبت شده است.</li>
                                {tabValue == 1 && (siteInfo?.cardOwnerName && siteInfo?.appOwnerCardNumber && siteInfo?.appOwnerIban) ? <li className="flex flex-col items-start gap-y-2 rounded-lg px-2 py-2 dark:bg-dark-alt">
                                    <div className="flex items-center gap-x-2">
                                        <span>به نام: </span>
                                        <span className="dark:text-white text-base font-normal">{siteInfo?.cardOwnerName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span>شماره کارت مقصد: </span>
                                        <div className="flex items-center gap-x-2">
                                            <div className="w-4 h-4 rounded-[50%] flex items-center justify-center dark:bg-white p-2">
                                                <img alt={CheckCardNumber(siteInfo?.appOwnerCardNumber).name} title={CheckCardNumber(siteInfo?.appOwnerCardNumber).name} src={CheckCardNumber(siteInfo?.appOwnerCardNumber).image}
                                                    width="48" height="48" decoding="async" data-nimg="1" loading="lazy" className="w-6 h-6 object-contain" />
                                            </div>
                                            <PatternFormat displayType='text' value={siteInfo?.appOwnerCardNumber} format="####-####-####-####" dir="ltr"
                                                className="dark:text-white text-base font-semibold" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span>شماره شبا مقصد: </span>
                                        <PatternFormat displayType='text' value={(siteInfo?.appOwnerIban)?.replace('ir', '').replace('IR', '')}
                                            format="IR## #### #### #### #### #### ##" className="dark:text-white text-base font-normal" />
                                    </div>
                                </li> : ''}
                            </ul>
                        </Alert>
                    </Collapse>}
                {tabValue == 2 && siteInfo?.idDepositIsActive ?
                    <div className="flex flex-col gap-y-6 mt-10">
                        {loadingIDDepositData ?
                            <div className="w-full h-[20svh] flex items-center justify-center">
                                <CircularProgress color={darkModeToggle ? 'white' : 'black'} />
                            </div> :
                            haserrorIDDeposit ? <div className="w-full flex flex-col items-center gap-y-4 text-sm">
                                <img src="/assets/img/general/rejectPayment.png" alt="rejectPayment" className="w-10 h-10" />
                                <span>خطا در گرفتن شناسه واریز ، لطفا با پشتیبانی تماس بگیرید.</span>
                            </div> :
                                <>
                                    <div className="flex flex-col items-start gap-y-4">
                                        <span className="text-primary-gray text-sm font-medium leading-tight dark:text-dark-secondary-alt">نام صاحب حساب</span>
                                        <span className="text-primary-black text-base font-semibold leading-tight dark:text-white">
                                            {siteInfo?.idDepositAccountOwnerName}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-start gap-y-4">
                                        <span className="text-primary-gray text-sm font-medium leading-tight dark:text-dark-secondary-alt">شماره حساب</span>
                                        <div className="text-primary-black text-base font-semibold leading-tight dark:text-white flex items-center gap-x-2">
                                            <span>{IDDepositData?.accountNumber}</span>
                                            <IconButton onClick={CopyData(IDDepositData?.accountNumber)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                    <path d="M9.24984 18.9582H5.74984C2.4915 18.9582 1.0415 17.5082 1.0415 14.2498V10.7498C1.0415 7.4915 2.4915 6.0415 5.74984 6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V14.2498C13.9582 17.5082 12.5082 18.9582 9.24984 18.9582ZM5.74984 7.2915C3.1665 7.2915 2.2915 8.1665 2.2915 10.7498V14.2498C2.2915 16.8332 3.1665 17.7082 5.74984 17.7082H9.24984C11.8332 17.7082 12.7082 16.8332 12.7082 14.2498V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H5.74984Z" fill="#F1C40F" />
                                                    <path d="M14.2498 13.9582H13.3332C12.9915 13.9582 12.7082 13.6748 12.7082 13.3332V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H6.6665C6.32484 7.2915 6.0415 7.00817 6.0415 6.6665V5.74984C6.0415 2.4915 7.4915 1.0415 10.7498 1.0415H14.2498C17.5082 1.0415 18.9582 2.4915 18.9582 5.74984V9.24984C18.9582 12.5082 17.5082 13.9582 14.2498 13.9582ZM13.9582 12.7082H14.2498C16.8332 12.7082 17.7082 11.8332 17.7082 9.24984V5.74984C17.7082 3.1665 16.8332 2.2915 14.2498 2.2915H10.7498C8.1665 2.2915 7.2915 3.1665 7.2915 5.74984V6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V12.7082Z" fill="#F1C40F" />
                                                </svg>
                                            </IconButton>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start gap-y-4">
                                        <span className="text-primary-gray text-sm font-medium leading-tight dark:text-dark-secondary-alt">شماره شبا</span>
                                        <div className="text-primary-black text-base font-semibold leading-tight dark:text-white flex items-center gap-x-2">
                                            <span>{IDDepositData?.iban}</span>
                                            <IconButton onClick={CopyData(IDDepositData?.iban)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                    <path d="M9.24984 18.9582H5.74984C2.4915 18.9582 1.0415 17.5082 1.0415 14.2498V10.7498C1.0415 7.4915 2.4915 6.0415 5.74984 6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V14.2498C13.9582 17.5082 12.5082 18.9582 9.24984 18.9582ZM5.74984 7.2915C3.1665 7.2915 2.2915 8.1665 2.2915 10.7498V14.2498C2.2915 16.8332 3.1665 17.7082 5.74984 17.7082H9.24984C11.8332 17.7082 12.7082 16.8332 12.7082 14.2498V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H5.74984Z" fill="#F1C40F" />
                                                    <path d="M14.2498 13.9582H13.3332C12.9915 13.9582 12.7082 13.6748 12.7082 13.3332V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H6.6665C6.32484 7.2915 6.0415 7.00817 6.0415 6.6665V5.74984C6.0415 2.4915 7.4915 1.0415 10.7498 1.0415H14.2498C17.5082 1.0415 18.9582 2.4915 18.9582 5.74984V9.24984C18.9582 12.5082 17.5082 13.9582 14.2498 13.9582ZM13.9582 12.7082H14.2498C16.8332 12.7082 17.7082 11.8332 17.7082 9.24984V5.74984C17.7082 3.1665 16.8332 2.2915 14.2498 2.2915H10.7498C8.1665 2.2915 7.2915 3.1665 7.2915 5.74984V6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V12.7082Z" fill="#F1C40F" />
                                                </svg>
                                            </IconButton>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start gap-y-4">
                                        <span className="text-primary-gray text-sm font-medium leading-tight dark:text-dark-secondary-alt">شناسه واریزی</span>
                                        <div className="text-primary-black text-base font-semibold leading-tight dark:text-white flex items-center gap-x-2">
                                            <span>{IDDepositData?.code}</span>
                                            <IconButton onClick={CopyData(IDDepositData?.code)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                    <path d="M9.24984 18.9582H5.74984C2.4915 18.9582 1.0415 17.5082 1.0415 14.2498V10.7498C1.0415 7.4915 2.4915 6.0415 5.74984 6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V14.2498C13.9582 17.5082 12.5082 18.9582 9.24984 18.9582ZM5.74984 7.2915C3.1665 7.2915 2.2915 8.1665 2.2915 10.7498V14.2498C2.2915 16.8332 3.1665 17.7082 5.74984 17.7082H9.24984C11.8332 17.7082 12.7082 16.8332 12.7082 14.2498V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H5.74984Z" fill="#F1C40F" />
                                                    <path d="M14.2498 13.9582H13.3332C12.9915 13.9582 12.7082 13.6748 12.7082 13.3332V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H6.6665C6.32484 7.2915 6.0415 7.00817 6.0415 6.6665V5.74984C6.0415 2.4915 7.4915 1.0415 10.7498 1.0415H14.2498C17.5082 1.0415 18.9582 2.4915 18.9582 5.74984V9.24984C18.9582 12.5082 17.5082 13.9582 14.2498 13.9582ZM13.9582 12.7082H14.2498C16.8332 12.7082 17.7082 11.8332 17.7082 9.24984V5.74984C17.7082 3.1665 16.8332 2.2915 14.2498 2.2915H10.7498C8.1665 2.2915 7.2915 3.1665 7.2915 5.74984V6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V12.7082Z" fill="#F1C40F" />
                                                </svg>
                                            </IconButton>
                                        </div>
                                    </div>
                                </>}
                    </div> : tabValue == 0 ? <div key={0} className="custom-card flex flex-col gap-y-4 rounded-2xl py-8 px-3">
                        <FormControl className="w-full">
                            <Controller
                                name="amount"
                                control={control}
                                render={({ field }) => (
                                    <NumericFormat
                                        {...field}
                                        thousandSeparator
                                        decimalScale={0}
                                        allowNegative={false}
                                        customInput={TextField}
                                        type="tel"
                                        label="مبلغ را وارد کنید"
                                        variant="outlined"
                                        error={!!errors.amount}
                                        helperText={errors.amount ? errors.amount.message : ''}
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            inputProps: {
                                                className: 'ltr pl-4', maxLength: 15,
                                                inputMode: 'decimal'
                                            },
                                            endAdornment: <span className="input-end-span">تومان</span>,
                                        }}
                                        value={amount}
                                        onValueChange={(event) => { setAmount(event.value); setErrorDeposit(false); }} />
                                )}
                            />
                        </FormControl>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <Button variant="outlined" color='primary' className="rounded-lg w-full font-bold dark:bg-dark" size="medium" disableElevation
                                    startIcon={<AddIcon className="mb-1" />} onClick={handleAmount(500000)}>
                                    <span className="block mx-2">500,000 تومان</span>
                                </Button>
                            </div>
                            <div className="col-span-6">
                                <Button variant="outlined" color='primary' className="rounded-lg w-full font-bold dark:bg-dark" size="medium" disableElevation
                                    startIcon={<AddIcon className="mb-1" />} onClick={handleAmount(1000000)}>
                                    <span className="block mx-2">1,000,000 تومان</span>
                                </Button>
                            </div>
                            <div className="col-span-6">
                                <Button variant="outlined" color='primary' className="rounded-lg w-full font-bold dark:bg-dark" size="medium" disableElevation
                                    startIcon={<AddIcon className="mb-1" />} onClick={handleAmount(2000000)}>
                                    <span className="block mx-2">2,000,000 تومان</span>
                                </Button>
                            </div>
                            <div className="col-span-6">
                                <Button variant="outlined" color='primary' className="rounded-lg w-full font-bold dark:bg-dark" size="medium" disableElevation
                                    startIcon={<AddIcon className="mb-1" />} onClick={handleAmount(5000000)}>
                                    <span className="block mx-2">5,000,000 تومان</span>
                                </Button>
                            </div>
                        </div>
                        {activeGateways ?
                            <>
                                <div className="col-span-12">
                                    <span>انتخاب درگاه پرداخت</span>
                                </div>
                                {gateways.length > 0 ? <div className="lg:grid grid-cols-12 gap-2 flex flex-nowrap overflow-x-auto overflow-y-hidden pb-2 -mb-4">
                                    {gateways.map((data, index) => {
                                        if (data.active) {
                                            return (
                                                <div className={`${gateways?.length == 1 ? 'min-w-full' : 'min-w-[45%]'} col-span-3`} key={index}>
                                                    <input type="radio" className="hidden peer" id={data.value} name="gateway" checked={data.value == gatewayName?.value}
                                                        onChange={(event) => setGatewayName(data)} />
                                                    <label htmlFor={data.value} className="custom-card rounded-2xl p-2 flex flex-col items-center gap-y-2 transition cursor-pointer border-light-gray dark:border-dark-secondary border-solid peer-checked:bg-primary peer-checked:bg-opacity-10 peer-checked:border-primary peer-checked:border-solid">
                                                        <img src={`/assets/img/general/${data.value}.png`} alt={data.value} className="w-6 h-6" />
                                                        <span>{data.name}</span>
                                                    </label>
                                                </div>
                                            )
                                        }
                                    })}
                                </div> : ''}
                            </> : ''}
                    </div> :
                        <>
                            <div key={1} className="custom-card flex flex-col gap-y-4 rounded-2xl py-8 px-3">
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-12 md:col-span-6">
                                        <FormControl className="w-full">
                                            <Controller
                                                name="amount"
                                                control={control}
                                                render={({ field }) => (
                                                    <NumericFormat
                                                        {...field}
                                                        thousandSeparator
                                                        decimalScale={0}
                                                        allowNegative={false}
                                                        customInput={TextField}
                                                        type="tel"
                                                        label="مبلغ واریز شده را وارد کنید"
                                                        variant="outlined"
                                                        error={!!errors.amount}
                                                        helperText={errors.amount ? errors.amount.message : ''}
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                            inputProps: {
                                                                className: 'ltr pl-4', maxLength: 15,
                                                                inputMode: 'decimal'
                                                            },
                                                            endAdornment: <span className="input-end-span">تومان</span>,
                                                        }}
                                                        value={offlineDepositData?.amount}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            handleChangeAddData(event, 'amount', 'numberFormat');
                                                        }} />
                                                )}
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                        <FormControl className="w-full">
                                            <Controller
                                                name="trackingCode"
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        type="text"
                                                        label="کد رهگیری را وارد کنید"
                                                        variant="outlined"
                                                        error={!!errors.trackingCode}
                                                        helperText={errors.trackingCode ? errors.trackingCode.message : ''}
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        value={offlineDepositData?.trackingCode}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            handleChangeAddData(event, 'trackingCode', 'text');
                                                        }} />
                                                )}
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="col-span-12">
                                        <input type="file" id="recievePic" className="hidden" onChange={uploadItemImage} />
                                        <div className="flex flex-col items-center gap-y-4 border border-dashed border-opacity-70 border-primary rounded-lg cursor-pointer p-6"
                                            onClick={openItemImageFile}>
                                            {imageLoading ? <div className="py-14"><CircularProgress /></div> : offlineDepositData?.image ?
                                                <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${offlineDepositData?.image}`} alt={'recievePic'}
                                                    className="w-1/2 h-40" /> : <img src="/assets/img/svg/placeholder_receipt.svg" alt={'placeholder_receipt'}
                                                        className="w-1/2 h-40" />}
                                            <Button type="button" variant="contained" size="medium" className="rounded-lg px-10" disableElevation>
                                                <text className="text-black font-semibold">انتخاب تصویر رسید</text>
                                            </Button >
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Alert
                                severity="info"
                                variant="filled"
                                color="info"
                                className="custom-alert auth info items-center overflow-y-hidden"
                            >
                                واریز دستی فقط از حساب های فعال خود قابل انجام می باشد.
                            </Alert>
                        </>}
                {tabValue == 2 && siteInfo?.idDepositIsActive ? '' : loadingBankAccounts ? <div className="flex justify-center items-center my-4"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> :
                    <>
                        {bankAccounts.length > 0 ? <div className="lg:grid grid-cols-12 gap-2 flex flex-nowrap overflow-x-auto overflow-y-hidden pb-2">
                            {bankAccounts.map((data, index) => {
                                return (
                                    <div className={`${bankAccounts?.length == 1 ? 'min-w-full' : 'min-w-[95%]'} col-span-12`} key={index}>
                                        <input type="radio" className="hidden peer" id={data._id} name="card" defaultChecked={index == 0} onChange={(event) => { setErrorDepositCreditCard(false); setUserCard(event.target.id) }} />
                                        <label htmlFor={data._id} className="custom-card rounded-2xl p-2 flex flex-col lg:flex-row lg:items-center justify-between gap-x-2 transition cursor-pointer border-light-secondary-foreground dark:border-dark border-solid peer-checked:border-primary peer-checked:border-solid">
                                            <div className="flex items-center gap-x-2 whitespace-nowrap">
                                                <img alt={CheckCardNumber(data.number).name} title={CheckCardNumber(data.number).name} src={CheckCardNumber(data.number).image} width="48" height="48" decoding="async" data-nimg="1" loading="lazy" className="w-14 h-14 object-contain" />
                                                <span>{CheckCardNumber(data.number).name}</span>
                                            </div>
                                            <div className="w-full flex flex-col items-center lg:items-end gap-y-2 mt-4">
                                                <PatternFormat displayType='text' value={data.number} format="####-####-####-####" dir="ltr" className="text-xl font-semibold" />
                                                {data.iban ? <PatternFormat displayType='text' value={(data.iban)?.replace('ir', '').replace('IR', '')} format="IR## #### #### #### #### #### ##" className="text-base font-normal" /> : 'فاقد شماره شبا'}
                                            </div>
                                        </label>
                                    </div>
                                )
                            })}
                        </div> : ''}
                        {bankAccounts.length == 0 ? <Alert
                            severity="warning"
                            variant="filled"
                            color="warning"
                            className="custom-alert warning"
                            action={
                                <AddBankAccount />
                            }
                            sx={{ mb: 2 }}
                        >
                            کارتی در سامانه تعریف نشده است.
                        </Alert> : ''}

                        {errorDepositCreditCard ? <Alert
                            severity="error"
                            variant="filled"
                            color="error"
                            className="custom-alert error"
                            sx={{ mb: 2 }}
                        >
                            کارت بانکی خود را جهت واریز انتخاب نمائید.
                        </Alert> : ''}

                        {errorDeposit ? <Alert
                            severity="error"
                            variant="filled"
                            color="error"
                            className="custom-alert error"
                            sx={{ mb: 2 }}
                        >
                            <div className="flex flex-col gap-y-3">
                                <b className="block">حداقل مقدار واریز {(siteInfo?.minDepositAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان می‌باشد.</b>
                            </div>
                        </Alert> : ''}
                    </>}
                {tabValue == 2 && siteInfo?.idDepositIsActive ? '' : <div className="lg:max-w-32 lg:mx-auto whitespace-nowrap">
                    {tabValue == 0 ? <LoadingButton type="submit" variant="contained" size="medium" fullWidth className="rounded-lg px-10" disableElevation loading={loading}>
                        <text className="text-black font-semibold">واریز</text>
                    </LoadingButton > : <LoadingButton type="submit" variant="contained" size="medium" fullWidth className="rounded-lg px-10" disableElevation loading={loading}>
                        <text className="text-black font-semibold">ثبت واریز</text>
                    </LoadingButton >}
                </div>}
            </form>
        </div>
    )
}

export default DepositPageCompo;