import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import LoadingButton from '@mui/lab/LoadingButton'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Pagination from '@mui/material/Pagination';
import Alert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import MUISelect from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import MenuItem from '@mui/material/MenuItem'
import moment from 'jalali-moment'

import { NumericFormat, PatternFormat } from 'react-number-format';

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
import FilterEmptyFields from "../../services/filterEmptyFields"
import FilterObjectFields from "../../services/filterObjectFields"
import ConvertText from "../../services/convertPersianToEnglish";

// Components
import TabPanel from "../shared/TabPanel"
import CustomSwitch from "../shared/CustomSwitch"
import ConfirmDialog from '../shared/ConfirmDialog';

/**
 * SettingsPageCompo component that displays the Settings Page Component of the website.
 * @returns The rendered Settings Page component.
 */
const SettingsPageCompo = () => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [tabValue, setTabValue] = useState(0);
    const handleChange = (event, newValue) => {
        setTabValue(newValue);
        if (newValue == 0) {
            getSettings();
        } else {
            getLevels(1);
            getTradeables();
        }
    }

    // Settings
    const [refreshOnce, setRefreshOnce] = useState(false);
    useEffect(() => {
        getSettings();
    }, [refreshOnce]);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('این فیلد الزامی است'),
        number: Yup.string().required('این فیلد الزامی است').transform(value => value.replace(/\s+/g, '')),
        tradesBased: Yup.boolean().required(),
        minRequiredTradesAmount: Yup.string().when("tradesBased", {
            is: false,
            then: schema => schema.optional(),
            otherwise: schema => schema.required('این فیلد الزامی است'),
        }),
        referralBased: Yup.boolean().required(),
        minRequiredReferralCount: Yup.string().when("referralBased", {
            is: false,
            then: schema => schema.optional(),
            otherwise: schema => schema.required('این فیلد الزامی است'),
        }),
        dailyMinBuyAmount: Yup.string().required('این فیلد الزامی است'),
        dailyMaxBuyAmount: Yup.string().required('این فیلد الزامی است'),
        dailyMinSellAmount: Yup.string().required('این فیلد الزامی است'),
        dailyMaxSellAmount: Yup.string().required('این فیلد الزامی است'),
        tradeableWages: Yup.array().of(
            Yup.object().shape({
                buyWage: Yup.string()
                    .required('این فیلد الزامی است'),
                sellWage: Yup.string()
                    .required('این فیلد الزامی است')
            })
        )
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: { tradesBased: false, referralBased: false }
    });

    /**
         * Retrieves User Info for the user.
         * @returns None
        */
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [settings, setSettings] = useState({});
    const [referralBased, setReferralBased] = useState(false);
    const [tradesBased, setTradesBased] = useState(false);
    const [transferWithdraw, setTransferWithdraw] = useState(null);
    const [userLeveling, setUserLeveling] = useState(null);
    const getSettings = () => {
        setLoadingSettings(true);
        ApiCall('/settings', 'GET', locale, {}, '', 'admin', router).then(async (result) => {
            if (result.appOwnerIban) {
                result.appOwnerIban = "IR" + result.appOwnerIban.replace(/ir/gi, '');
            }

            if (result.autoTransferWithdraw == 'Deactive') {
                result = {
                    ...result,
                    autoTransferLimit: 1
                };
            }

            setSettings(result);

            setTransferWithdraw(result.autoTransferWithdraw ? {
                value: result.autoTransferWithdraw,
                label: result.autoTransferWithdraw == 'Deactive' ? 'غیرفعال' :
                    result.autoTransferWithdraw == 'Vandar' ? 'وندار' : 'پی استار'
            } : null);
            setUserLeveling(result.userLeveling ? {
                value: result.userLeveling,
                label: result.userLeveling == 'Deactive' ? 'غیرفعال' :
                    result.userLeveling == 'Referral' ? 'دعوت' : 'حجم معاملات'
            } : null);
            setTradesBased(result.userLeveling == 'Transaction' ? true : false);
            setReferralBased(result.userLeveling == 'Referral' ? true : false);

            setValue('tradesBased', result.userLeveling == 'Transaction' ? true : false);
            setValue('referralBased', result.userLeveling == 'Referral' ? true : false);

            setValue('minRequiredTradesAmount', 0);
            setValue('minRequiredReferralCount', 0);
            setLoadingSettings(false);
        }).catch((error) => {
            setLoadingSettings(false);
            console.log(error);
        });
    }

    const typeGateways = [
        {
            value: 'vandar',
            label: 'وندار',
            placeholder: 'ApiKey وندار',
            apiKey: 'vandarApiKey',
            checkbox: 'vandarGatewayIsActive',
            type: 'text'
        },
        {
            value: 'paystar',
            label: 'پی استار',
            placeholder: 'ApiKey پی استار',
            apiKey: 'paystarApiKey',
            checkbox: 'paystarGatewayIsActive',
            type: 'text'
        },
        {
            value: 'saman',
            label: 'سامان',
            placeholder: 'آیدی Terminal سامان',
            apiKey: 'samanTerminalId',
            checkbox: 'samanGatewayIsActive',
            type: 'number'
        }
    ]

    const transferWithdrawStatus = [
        { value: 'Deactive', label: 'غیرفعال' },
        { value: 'Vandar', label: 'وندار' },
        { value: 'Paystar', label: 'پی استار' }
    ]

    const userLevelingStatus = [
        { value: 'Deactive', label: 'غیرفعال' },
        { value: 'Referral', label: 'دعوت' },
        { value: 'Transaction', label: 'حجم معاملات' }
    ]

    /**
     * Handles the change event for saving settings inputs.
     * @param {string} input - The name of the input field being changed.
     * @param {string} type - The type of the input field.
     * @param {Event} event - The change event object.
     * @returns None
     */
    const handleChangeSetings = (input, type) => (event) => {
        let value;
        switch (type) {
            case "checkbox":
                value = event.target.checked;
                break;
            case "select":
                if (input == 'autoTransferWithdraw') {
                    setSettings((prevState) => ({
                        ...prevState,
                        ['autoTransferLimit']: 1,
                    }));
                }
                value = event.target.value?.value;
                break;
            case "numberFormat":
                value = Number(event.target.value.replace(/,/g, ''));
                break;
            case "cardFormat":
                value = event.value;
                break;
            case "shabaFormat":
                value = event.value ? `IR${event.value}` : '';
                break;
            default:
                value = event.target.value;
                break;
        }
        setSettings((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
     * Adds a new Banner Image to the `secondStepUserVerifyDocs` array and updates the state.
     * @param {Event} event - The event object triggered by the action.
     * @returns None
     */
    const addAuthDocument = (event) => {
        setSettings(prevSettingsData => ({
            ...prevSettingsData,
            secondStepUserVerifyDocs: [...(prevSettingsData.secondStepUserVerifyDocs || []), '']
        }));
    }
    /**
         * Removes the specified Banner Image from the secondStepUserVerifyDocs array.
         * @param {number} banner - The index of the Add banner to remove.
         * @returns {Function} - An event handler function that prevents the default event behavior and updates the secondStepUserVerifyDocs array.
         */
    const removeAddAuthDocument = (index) => (event) => {
        event.preventDefault();
        setSettings(prevSettingsData => ({
            ...prevSettingsData,
            secondStepUserVerifyDocs: prevSettingsData.secondStepUserVerifyDocs.filter((_, i) => i !== index)
        }));
    }

    /**
     * Save Settings.
     * @returns None
    */
    const [loading, setLoading] = useState(false);
    const saveSettings = (event) => {
        event.preventDefault();
        if (settings?.secondStepUserVerifyEnabled) {
            let errors = [];
            if (settings?.secondStepUserVerifyDocs?.length > 0) {
                if (settings.secondStepUserVerifyDocs) {
                    settings.secondStepUserVerifyDocs.forEach((doc, index) => {
                        if (!doc.name) errors.push(`عنوان مدرک برای مدرک ${index + 1} الزامی است.`);
                        if (!doc.defaultImage) errors.push(`تصویر پیشفرض برای مدرک ${index + 1} الزامی است.`);
                        if (!doc.description) errors.push(`توضیحات برای مدرک ${index + 1} الزامی است.`);
                    });
                }
            } else {
                errors.push('لطفا مدارک مورد نظر خود را وارد نمائید');
            }

            if (errors.length > 0) {
                dispatch({
                    type: 'setSnackbarProps', value: {
                        open: true, content: errors.join('<br/>'),
                        type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                    }
                });
                return;
            }
        }

        let newSettings = {
            ...settings
        };

        newSettings = FilterEmptyFields(newSettings);
        const filteredData = FilterObjectFields(newSettings, [
            "minDepositAmount",
            "minWithdrawAmount",
            "title",
            "lightIconImage",
            "lightLogoImage",
            "darkIconImage",
            "darkLogoImage",
            "frontAppBaseUrl",
            "userLevelingPeriod",
            "userLeveling",
            "secondStepUserVerifyDocs",
            "onlineFirstStepUserVerifyEnabled",
            "offlineFirstStepUserVerifyEnabled",
            "secondStepUserVerifyEnabled",
            "appOwnerIban",
            "appOwnerCardNumber",
            "cardOwnerName",
            "scalpingPreventionPeriodInHours",
            "referralCountForGettingReward",
            "referralReward",
            "productReqPageDesc1",
            "productReqPageDesc2",
            "balanceTransPageDesc1",
            "balanceTransPageDesc2",
            "balanceTransPageDesc3",
            "vandarGatewayIsActive",
            "vandarApiKey",
            "paystarGatewayIsActive",
            "paystarApiKey",
            "samanGatewayIsActive",
            "samanTerminalId",
            "kavehnegarApiKey",
            "kavehnegarAuthTemplate",
            "kavehnegarTransferTemplate",
            "jibitInquiryApiKey",
            "jibitInquirySecretKey",
            "autoTransferWithdraw",
            "autoTransferLimit",
            "paystarWalletId",
            "paystarWalletPassword",
            "paystarWalletRefreshToken",
            "paystarWalletSignKey",
            "vandarRefreshToken",
            "vandarAccessToken",
            "vandarBussinesName",
            "payLaterLimit",
            "payLaterDeadlineHours",
            "tradeableTransferIsActive",
            "idDepositIsActive",
            "manualTransactionConfirmation",
            "idDepositAccountOwnerName",
            "factorSignatureImage",
            "termsAndConditions",
            "giftCardIsActive",
            "stakeIsActive",
            "wallgoldBaseUrl",
            "wallgoldToken",
            "zarbahaUsername",
            "zarbahaPassword"
        ]);

        setLoading(true);
        event.target.disabled = true;
        ApiCall('/settings', 'PATCH', locale, { ...filteredData }, '', 'admin', router).then(async (result) => {
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

    const [isDisabled, setIsDisabled] = useState(false);
    const openItemImageFile = (type) => (event) => {
        if (!isDisabled) {
            document.querySelector(`input#${type}`).click();
        }
    }

    /**
   * Uploads an Item Image asynchronously.
   * @param {{File}} file - The Image file to upload.
   * @returns None
   * @throws Any error that occurs during the upload process.
  */
    const [imageLoading, setImageLoading] = useState(false);
    const uploadItemImage = (type) => (event) => {
        try {
            if (event.target.files && event.target.files[0]) {
                setImageLoading(true);
                setIsDisabled(true);
                let file = new FormData();
                file.append("file", event.target.files[0]);
                ApiCall('/upload', 'POST', locale, file, '', 'admin', router, true).then(async (result) => {
                    setImageLoading(false);
                    setIsDisabled(false);
                    if (type == 'lightIconImage') {
                        setSettings({ ...settings, lightIconImage: result.fileUrl });
                    } if (type == 'lightLogoImage') {
                        setSettings({ ...settings, lightLogoImage: result.fileUrl });
                    } if (type == 'darkIconImage') {
                        setSettings({ ...settings, darkIconImage: result.fileUrl });
                    } if (type == 'darkLogoImage') {
                        setSettings({ ...settings, darkLogoImage: result.fileUrl });
                    } if (type == 'factorSignatureImage') {
                        setSettings({ ...settings, factorSignatureImage: result.fileUrl });
                    }
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: langText('Global.Success'),
                            type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                }).catch((error) => {
                    setImageLoading(false);
                    setIsDisabled(false);
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

        } catch (error) {
            setImageLoading(false);
            setIsDisabled(false);
            console.log(error);
        }
    }

    const openAuthImageFile = (index) => (event) => {
        if (!isDisabled) {
            document.querySelector(`input#authPic${index}`).click();
        }
    }

    /**
   * Uploads an Auth Image asynchronously.
   * @param {{File}} file - The Image file to upload.
   * @returns None
   * @throws Any error that occurs during the upload process.
  */
    const uploadAuthImage = (index) => (event) => {
        try {
            if (event.target.files && event.target.files[0]) {
                setImageLoading(true);
                setIsDisabled(true);
                let file = new FormData();
                file.append("file", event.target.files[0]);
                ApiCall('/upload', 'POST', locale, file, '', 'admin', router, true).then(async (result) => {
                    setImageLoading(false);
                    setIsDisabled(false);
                    const updatedDocs = [...settings.secondStepUserVerifyDocs];
                    updatedDocs[index] = {
                        ...updatedDocs[index],
                        defaultImage: result.fileUrl
                    }

                    setSettings(prevSettings => ({
                        ...prevSettings,
                        secondStepUserVerifyDocs: updatedDocs
                    }));
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: langText('Global.Success'),
                            type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                }).catch((error) => {
                    setImageLoading(false);
                    setIsDisabled(false);
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

        } catch (error) {
            setImageLoading(false);
            setIsDisabled(false);
            console.log(error);
        }
    }

    const [showChangeOrderbookStatusDialog, setShowChangeOrderbookStatusDialog] = useState(false);
    const [openBottomChangeOrderbookStatusDrawer, setOpenBottomChangeOrderbookStatusDrawer] = useState(false);
    const handleShowChangeOrderbookStatusDialog = () => {
        if (window.innerWidth >= 1024) {
            setShowChangeOrderbookStatusDialog(true);
            setOpenBottomChangeOrderbookStatusDrawer(false);
        } else {
            setShowChangeOrderbookStatusDialog(false);
            setOpenBottomChangeOrderbookStatusDrawer(true);
        }
    }

    /**
 * Change Users Orderbook Status.
 * @returns None
*/
    const [orderbookStatus, setOrderbookStatus] = useState(false);
    const [changeOrderbookStatusLoading, setChangeOrderbookStatusLoading] = useState(false);
    const changeOrderbookStatus = (orderbookStatus) => (event) => {
        event.preventDefault();
        setChangeOrderbookStatusLoading(true);
        event.target.disabled = true;
        ApiCall(`/user/order-book-is-active`, 'PATCH', locale, { orderBookIsActive: orderbookStatus }, '', 'admin', router).then(async (result) => {
            event.target.disabled = false;
            setChangeOrderbookStatusLoading(false);
            setShowChangeOrderbookStatusDialog(false);
            setOpenBottomChangeOrderbookStatusDrawer(false);
            setOrderbookStatus(false);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setChangeOrderbookStatusLoading(false);
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

    // Levels
    const LEVELS_TABLE_HEAD = [
        {
            label: 'عنوان سطح',
            classes: ""
        },
        {
            label: 'شماره سطح',
            classes: ""
        },
        {
            label: 'تاریخ ثبت',
            classes: ""
        },
        {
            label: 'جزئیات',
            classes: ""
        },
        {
            label: '',
            classes: ""
        }
    ]

    /**
         * Retrieves Levels list.
         * @returns None
        */
    const [levels, setLevels] = useState([]);
    const [loadingLevels, setLoadingLevels] = useState(true);
    const [levelsLimit, setLevelsLimit] = useState(10);
    const [levelsTotal, setLevelsTotal] = useState(0);
    const [pageItem, setPageItem] = useState(1);
    const getLevels = (page, search) => {
        setLoadingLevels(true);
        ApiCall('/level', 'GET', locale, {}, `${search ? `search=${search}&` : ''}sortOrder=0&sortBy=createdAt&limit=${levelsLimit}&skip=${(page * levelsLimit) - levelsLimit}`, 'admin', router).then(async (result) => {
            setLevelsTotal(result.count);
            setLevels(result.data);
            setLoadingLevels(false);
        }).catch((error) => {
            setLoadingLevels(false);
            console.log(error);
        });
    }

    const handlePageChange = (event, value) => {
        setPageItem(value);
        getLevels(value);
    }

    /**
     * Search for a Levels based on the input value and filter the displayed Levels accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchLevels, setSearchLevels] = useState('');
    var typingTimerLevels;
    const doneTypingIntervalLevels = 300;
    const searchLevelsItems = (event) => {
        clearTimeout(typingTimerLevels);

        typingTimerLevels = setTimeout(() => {
            if (event.target.value == '') {
                setSearchLevels('');
                setPageItem(1);
                getLevels(1, '');
            } else {
                setSearchLevels(event.target.value);
                setPageItem(1);
                getLevels(1, event.target.value);
            }
        }, doneTypingIntervalLevels);

    }
    const searchLevelsItemsHandler = () => {
        clearTimeout(typingTimerLevels)
    }

    /**
         * Retrieves Tradeables list.
         * @returns None
        */
    const [tradeables, setTradeables] = useState([]);
    const [addLevelTradeables, setAddLevelTradeables] = useState([]);
    const [loadingTradeables, setLoadingTradeables] = useState(true);
    const [expand, setExpand] = useState(true);
    const getTradeables = () => {
        setLoadingTradeables(true);
        ApiCall('/tradeable', 'GET', locale, {}, ``, 'admin', router).then(async (result) => {
            setTradeables(result.data);

            const newTradeableWages = result.data?.length > 0 ? result.data?.map(tradeable => ({
                tradeable: tradeable._id,
                buyWage: 0,
                sellWage: 0,
                wageType: 'Percent'
            })) : [{
                tradeable: '',
                buyWage: 0,
                sellWage: 0,
                wageType: 'Percent'
            }];
            setAddLevelTradeables(newTradeableWages);

            setLoadingTradeables(false);
        }).catch((error) => {
            setLoadingTradeables(false);
            console.log(error);
        });
    }

    const [levelData, setLevelData] = useState(null);
    const [editLevelTradeables, setEditLevelTradeables] = useState([]);
    const [showAddLevel, setShowAddLevel] = useState(false);
    const [openBottomAddLevelDrawer, setOpenBottomAddLevelDrawer] = useState(false);
    const [showEditLevel, setShowEditLevel] = useState(false);
    const [openBottomEditLevelDrawer, setOpenBottomEditLevelDrawer] = useState(false);
    const [editReferralBased, setEditReferralBased] = useState(false);
    const [editTradesBased, setEditTradesBased] = useState(false);
    const handleShowLevel = (type, data) => () => {
        setLevelData(data || null);
        setEditTradesBased(data?.minRequiredTradesAmount > 0 ? true : false);
        setEditReferralBased(data?.minRequiredReferralCount > 0 ? true : false);
        const existingWages = data?.tradeableWages || [];

        const newTradeableWages = tradeables?.length > 0
            ? tradeables.map(tradeable => {
                const existingWage = existingWages.find(wage => wage.tradeable === tradeable._id);
                return {
                    tradeable: tradeable._id,
                    buyWage: existingWage ? existingWage?.buyWage : '',
                    sellWage: existingWage ? existingWage?.sellWage : '',
                    wageType: existingWage ? existingWage?.wageType : 'Percent'
                };
            })
            : [{
                tradeable: '',
                buyWage: '',
                sellWage: '',
                wageType: 'Percent'
            }];

        setEditLevelTradeables(newTradeableWages);
        if (window.innerWidth >= 1024) {
            if (type == 'add') {
                setShowAddLevel(true);
                setOpenBottomAddLevelDrawer(false);
            } else {
                setShowEditLevel(true);
                setOpenBottomEditLevelDrawer(false);
            }
        } else {
            if (type == 'add') {
                setShowAddLevel(false);
                setOpenBottomAddLevelDrawer(true);
            } else {
                setShowEditLevel(false);
                setOpenBottomEditLevelDrawer(true);
            }
        }
    }

    const [addLevel, setAddLevel] = useState({
        name: '',
        number: 0,
        minRequiredTradesAmount: 0,
        minRequiredReferralCount: 0,
        dailyMinBuyAmount: '',
        dailyMinSellAmount: '',
        dailyMaxBuyAmount: '',
        dailyMaxSellAmount: '',
        description: ''
    });

    const clearForm = () => {
        setValue('name', '');
        setValue('number', '');
        setValue('minRequiredTradesAmount', '');
        setValue('minRequiredReferralCount', '');
        setValue('dailyMinBuyAmount', '');
        setValue('dailyMaxBuyAmount', '');
        setValue('dailyMinSellAmount', '');
        setValue('dailyMaxSellAmount', '');
        addLevelTradeables.forEach((_, index) => {
            setValue(`tradeableWages[${index}].buyWage`, '');
            setValue(`tradeableWages[${index}].sellWage`, '');
        });
    }

    /**
         * Handles the change event for saving levels data.
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
        setAddLevel((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
         * Handles the change event for updating levels data.
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
            default:
                value = event.target.value;
                break;
        }
        setLevelData((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
    * Save new Level.
    * @returns None
   */
    const saveLevel = () => {
        setLoading(true);
        const { description, ...addLevelData } = addLevel;
        let body = description ? { ...addLevel } : { ...addLevelData };
        ApiCall('/level', 'POST', locale, { ...body, tradeableWages: addLevelTradeables }, '', 'admin', router).then(async (result) => {
            setLoading(false);
            getLevels(pageItem);
            setShowAddLevel(false);
            setOpenBottomAddLevelDrawer(false);
            setAddLevel({
                name: '',
                number: 0,
                minRequiredTradesAmount: 0,
                minRequiredReferralCount: 0,
                dailyMinBuyAmount: '',
                dailyMinSellAmount: '',
                dailyMaxBuyAmount: '',
                dailyMaxSellAmount: '',
                description: ''
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
    }

    /**
        * Update a Level.
        * @returns None
    */
    const editLevel = (levelId) => (event) => {
        event.preventDefault();
        setLoading(true);
        event.target.disabled = true;
        let newLevelData = FilterEmptyFields(levelData);
        const filteredData = FilterObjectFields(newLevelData, [
            "name",
            "description",
            "number",
            "minRequiredTradesAmount",
            "minRequiredReferralCount",
            "dailyMinBuyAmount",
            "dailyMinSellAmount",
            "dailyMaxBuyAmount",
            "dailyMaxSellAmount"
        ]);
        ApiCall(`/level/${levelId}`, 'PATCH', locale, { ...filteredData, tradeableWages: editLevelTradeables }, '', 'admin', router).then(async (result) => {
            event.target.disabled = false;
            setLoading(false);
            getLevels(pageItem);
            setShowEditLevel(false);
            setOpenBottomEditLevelDrawer(false);
            setLevelData(null);
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

    const [openDialog, setOpenDialog] = useState(false);
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const [levelId, setLevelId] = useState('');
    const handleOpenDialog = (levelId) => (event) => {
        if (levelId) {
            setLevelId(levelId);
            setOpenDialog(true);
        } else {
            setOpenUpdateDialog(true);
        }
    }
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOpenUpdateDialog(false);
    }

    /**
        * Delete a Level.
        * @returns None
    */
    const [deleteLoading, setDeleteLoading] = useState(false);
    const deleteLevel = () => {
        setDeleteLoading(true);
        ApiCall(`/level/${levelId}`, 'DELETE', locale, {}, '', 'admin', router).then(async (result) => {
            setDeleteLoading(false);
            getLevels(pageItem);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
            handleCloseDialog();
        }).catch((error) => {
            setDeleteLoading(false);
            console.log(error);
            handleCloseDialog();
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
        * Update Levels.
        * @returns None
    */
    const [updateLoading, setUpdateLoading] = useState(false);
    const handleUpdateLevels = () => {
        setUpdateLoading(true);
        ApiCall(`/level/update-user-levels`, 'GET', locale, {}, '', 'admin', router).then(async (result) => {
            setUpdateLoading(false);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: 'انجام فرایند در حال انجام می باشد. بر اساس تعداد کاربران کمی زمان بر خواهد بود.',
                    type: 'success', duration: 5000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
            handleCloseDialog();
        }).catch((error) => {
            setUpdateLoading(false);
            console.log(error);
            handleCloseDialog();
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
     * Update Vandar Access Token.
     * @returns None
    */
    const [updateToken, setUpdateToken] = useState(false);
    const updateWithdrawToken = (event) => {
        event.preventDefault();
        setUpdateToken(true);
        ApiCall(`/settings/vandar-tokens`, 'PATCH', locale, {}, '', 'admin', router).then(async (result) => {
            event.target.disabled = false;
            setUpdateToken(false);
            getSettings();
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
            handleCloseDialog();
        }).catch((error) => {
            setUpdateToken(false);
            console.log(error);
            event.target.disabled = false;
            handleCloseDialog();
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
        <div className="flex flex-col gap-y-8">
            <Tabs
                orientation="horizontal"
                value={tabValue}
                onChange={handleChange}
                sx={{ borderRight: 1, borderColor: 'divider' }}
            >
                <Tab label="تنظیمات عمومی" className="whitespace-nowrap dark:text-white" classes={{ selected: 'text-primary' }} />
                <Tab label="سطح بندی" className="whitespace-nowrap dark:text-white" classes={{ selected: 'text-primary' }} />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
                <div className=" flex flex-col gap-y-4">
                    <section className="flex items-center justify-between">
                        <h1 className="text-large-2">تنظیمات</h1>
                        <div className="flex items-center gap-x-4">
                            <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={saveSettings}>
                                <text className="text-black font-semibold">ذخیره تنظیمات</text>
                            </LoadingButton >
                        </div>
                    </section>

                    {loadingSettings ?
                        <div className="h-[20dvh] flex justify-center items-center"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> :
                        <form className="custom-card rounded-2xl grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate>
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="لینک فرانت اند"
                                        placeholder="https://sitename.com"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.frontAppBaseUrl}
                                        onChange={handleChangeSetings('frontAppBaseUrl', 'text')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="نام سایت"
                                        placeholder="نام سایت را وارد کنید"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.title}
                                        onChange={handleChangeSetings('title', 'text')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12">
                                <FormControl className="w-full">
                                    <input type="file" id="factorSignatureImage" className="hidden" onChange={uploadItemImage('factorSignatureImage')} />
                                    <TextField type="text" id="account" className="form-input cursor-default"
                                        disabled
                                        label="انتخاب تصویر مهر و امضا فروشنده (فاکتور تحویل)"
                                        InputLabelProps={{
                                            classes: { disabled: darkModeToggle ? '!text-white !text-opacity-70' : '!text-black !text-opacity-70' },
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            readOnly: true,
                                            endAdornment: <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={openItemImageFile('factorSignatureImage')}>
                                                {settings?.factorSignatureImage ?
                                                    <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${settings?.factorSignatureImage}`} alt={'factorSignatureImage'}
                                                        className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" className={darkModeToggle ? 'text-white' : 'text-black'}>
                                                        <path opacity="0.4" d="M16.19 2.5H7.82001C4.18001 2.5 2.01001 4.67 2.01001 8.31V16.68C2.01001 20.32 4.18001 22.49 7.82001 22.49H16.19C19.83 22.49 22 20.32 22 16.68V8.31C22 4.67 19.83 2.5 16.19 2.5Z" fill="currentColor" />
                                                        <path d="M12.2 17.8799C11.5 17.8799 10.79 17.6099 10.26 17.0799C9.74001 16.5599 9.45001 15.8699 9.45001 15.1399C9.45001 14.4099 9.74001 13.7099 10.26 13.1999L11.67 11.7899C11.96 11.4999 12.44 11.4999 12.73 11.7899C13.02 12.0799 13.02 12.5599 12.73 12.8499L11.32 14.2599C11.08 14.4999 10.95 14.8099 10.95 15.1399C10.95 15.4699 11.08 15.7899 11.32 16.0199C11.81 16.5099 12.6 16.5099 13.09 16.0199L15.31 13.7999C16.58 12.5299 16.58 10.4699 15.31 9.19994C14.04 7.92994 11.98 7.92994 10.71 9.19994L8.28998 11.6199C7.77998 12.1299 7.5 12.7999 7.5 13.5099C7.5 14.2199 7.77998 14.8999 8.28998 15.3999C8.57998 15.6899 8.57998 16.1699 8.28998 16.4599C7.99998 16.7499 7.51998 16.7499 7.22998 16.4599C6.43998 15.6699 6.01001 14.6199 6.01001 13.4999C6.01001 12.3799 6.43998 11.3299 7.22998 10.5399L9.65002 8.11992C11.5 6.26992 14.52 6.26992 16.37 8.11992C18.22 9.96992 18.22 12.9899 16.37 14.8399L14.15 17.0599C13.61 17.6099 12.91 17.8799 12.2 17.8799Z" fill="currentColor" />
                                                    </svg>}
                                            </IconButton>
                                        }}
                                        value={''} />
                                </FormControl>
                            </div>
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <NumericFormat
                                        thousandSeparator
                                        decimalScale={0}
                                        customInput={TextField}
                                        type="tel"
                                        label="حداقل مقدار واریز تومان (به تومان)"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.minDepositAmount}
                                        onChange={handleChangeSetings('minDepositAmount', 'numberFormat')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <NumericFormat
                                        thousandSeparator
                                        decimalScale={0}
                                        customInput={TextField}
                                        type="tel"
                                        label="حداقل مقدار برداشت تومان (به تومان)"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.minWithdrawAmount}
                                        onChange={handleChangeSetings('minWithdrawAmount', 'numberFormat')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <NumericFormat
                                        thousandSeparator
                                        decimalScale={0}
                                        customInput={TextField}
                                        type="tel"
                                        label="دوره بررسی سطح کاربران (به روز)"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.userLevelingPeriod}
                                        onChange={handleChangeSetings('userLevelingPeriod', 'numberFormat')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                <FormControl className="w-full">
                                    <InputLabel id="demo-simple-select-label"
                                        sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>نحوه تغییر سطح کاربران</InputLabel>
                                    <MUISelect
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        defaultValue={userLeveling}
                                        onChange={handleChangeSetings('userLeveling', 'select')}
                                        input={<OutlinedInput
                                            id="select-multiple-chip"
                                            label="نحوه تغییر سطح کاربران"
                                            className="dark:bg-dark *:dark:text-white"
                                            sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                        />}
                                        renderValue={(selected) => {
                                            return (
                                                <div className="flex flex-wrap gap-0.5">
                                                    <span>{selected?.label || selected}</span>
                                                </div>
                                            )
                                        }}
                                        MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                        {userLevelingStatus?.map((data, index) => (
                                            <MenuItem key={index} value={data}>{data.label}</MenuItem>
                                        ))}
                                    </MUISelect>
                                </FormControl>
                            </div>
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                            <div className={`col-span-12 ${(siteInfo?.paidModules && siteInfo?.paidModules?.includes('OrderBook')) ? 'xl:col-span-4' : 'md:col-span-6'}  w-full flex items-center`}>
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between text-end m-0"
                                        control={<CustomSwitch
                                            checked={settings.manualTransactionConfirmation}
                                            onChange={handleChangeSetings('manualTransactionConfirmation', 'checkbox')}
                                        />}
                                        label={`تائید دستی معاملات ؟`} />
                                </FormGroup>
                            </div>
                            {(siteInfo?.paidModules && siteInfo?.paidModules?.includes('OrderBook')) ?
                                <>
                                    <div className="hidden xl:flex items-center justify-center col-span-4">
                                        <div className="h-full w-px border-s border-e-0 border-y-0 border-solid border-light-gray dark:border-dark-secondary"></div>
                                    </div>
                                    <div className="col-span-12 xl:col-span-4">
                                        <Button type="button" variant="contained" size="medium" className="rounded-2xl h-14" fullWidth disableElevation
                                            onClick={handleShowChangeOrderbookStatusDialog}>
                                            <span className="text-black font-semibold">تغییر وضعیت فعالسازی معاملات پیشرفته</span>
                                        </Button>
                                    </div>
                                </>
                                : ''}
                            <div className={`col-span-12 ${(siteInfo?.paidModules && siteInfo?.paidModules?.includes('OrderBook')) ? '' : 'md:col-span-6'}`}>
                                <FormControl className="w-full">
                                    <NumericFormat
                                        thousandSeparator
                                        decimalScale={0}
                                        customInput={TextField}
                                        type="tel"
                                        label="بازه انتظار تائید معامله خرید واحدها (به ساعت)"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.scalpingPreventionPeriodInHours}
                                        onChange={handleChangeSetings('scalpingPreventionPeriodInHours', 'numberFormat')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="دامنه وال گلد"
                                        placeholder="https://api.wallgold.ir"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.wallgoldBaseUrl}
                                        onChange={handleChangeSetings('wallgoldBaseUrl', 'text')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="توکن وال گلد"
                                        placeholder="توکن وال گلد را وارد کنید"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.wallgoldToken}
                                        onChange={handleChangeSetings('wallgoldToken', 'text')} />
                                </FormControl>
                            </div>
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="نام کاربری زربها"
                                        placeholder="نام کاربری زربها را وارد کنید"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.zarbahaUsername}
                                        onChange={handleChangeSetings('zarbahaUsername', 'text')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="رمز عبور زربها"
                                        placeholder="رمز عبور زربها را وارد کنید"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.zarbahaPassword}
                                        onChange={handleChangeSetings('zarbahaPassword', 'text')} />
                                </FormControl>
                            </div>
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                            <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between text-end m-0"
                                        control={<CustomSwitch
                                            checked={settings.giftCardIsActive}
                                            onChange={handleChangeSetings('giftCardIsActive', 'checkbox')}
                                        />}
                                        label={`فعالسازی بخش گیفت کارت ؟`} />
                                </FormGroup>
                            </div>
                            <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between text-end m-0"
                                        control={<CustomSwitch
                                            checked={settings.stakeIsActive}
                                            onChange={handleChangeSetings('stakeIsActive', 'checkbox')}
                                        />}
                                        label={`فعالسازی بخش سپرده گذاری ؟`} />
                                </FormGroup>
                            </div>
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <NumericFormat
                                        thousandSeparator
                                        decimalScale={0}
                                        customInput={TextField}
                                        type="tel"
                                        label="تعداد دعوتی ها برای کسب جایزه"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.referralCountForGettingReward}
                                        onChange={handleChangeSetings('referralCountForGettingReward', 'numberFormat')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <NumericFormat
                                        thousandSeparator
                                        decimalScale={0}
                                        customInput={TextField}
                                        type="tel"
                                        label="مبلغ جایزه (به تومان)"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.referralReward}
                                        onChange={handleChangeSetings('referralReward', 'numberFormat')} />
                                </FormControl>
                            </div>
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                            <div className="col-span-12">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="کلید API کاوه نگار"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.kavehnegarApiKey}
                                        onChange={handleChangeSetings('kavehnegarApiKey', 'text')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 xl:col-span-6">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="الگو کد تائید ثبت نام کاوه نگار"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.kavehnegarAuthTemplate}
                                        onChange={handleChangeSetings('kavehnegarAuthTemplate', 'text')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 xl:col-span-6">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="الگو کد تائید انتقال دارایی کاوه نگار"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.kavehnegarTransferTemplate}
                                        onChange={handleChangeSetings('kavehnegarTransferTemplate', 'text')} />
                                </FormControl>
                            </div>
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                            <div className="col-span-12 xl:col-span-6">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="کلید API استعلام جیبیت"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.jibitInquiryApiKey}
                                        onChange={handleChangeSetings('jibitInquiryApiKey', 'text')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 xl:col-span-6">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="کلید خصوصی استعلام جیبیت"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.jibitInquirySecretKey}
                                        onChange={handleChangeSetings('jibitInquirySecretKey', 'text')} />
                                </FormControl>
                            </div>
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                            <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                <FormControl className="w-full">
                                    <InputLabel id="demo-simple-select-label"
                                        sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>وضعیت برداشت تومان کاربران به صورت خودکار</InputLabel>
                                    <MUISelect
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        defaultValue={transferWithdraw}
                                        onChange={handleChangeSetings('autoTransferWithdraw', 'select')}
                                        input={<OutlinedInput
                                            id="select-multiple-chip"
                                            label="وضعیت برداشت تومان کاربران به صورت خودکار"
                                            className="dark:bg-dark *:dark:text-white"
                                            sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                        />}
                                        renderValue={(selected) => {
                                            return (
                                                <div className="flex flex-wrap gap-0.5">
                                                    <span>{selected?.label || selected}</span>
                                                </div>
                                            )
                                        }}
                                        MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                        {transferWithdrawStatus?.map((data, index) => (
                                            <MenuItem key={index} value={data}>{data.label}</MenuItem>
                                        ))}
                                    </MUISelect>
                                </FormControl>
                            </div>
                            {settings?.autoTransferWithdraw && settings?.autoTransferWithdraw != 'Deactive' ?
                                <>
                                    <div className="col-span-12 md:col-span-6">
                                        <FormControl className="w-full">
                                            <NumericFormat
                                                thousandSeparator
                                                decimalScale={0}
                                                customInput={TextField}
                                                type="tel"
                                                label="حداکثر مبلغ جهت برداشت خودکار (به تومان)"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                value={settings.autoTransferLimit}
                                                onChange={handleChangeSetings('autoTransferLimit', 'numberFormat')} />
                                        </FormControl>
                                    </div>
                                    {settings?.autoTransferWithdraw == 'Vandar' ?
                                        <>
                                            <div className="col-span-12 xl:col-span-5">
                                                <FormControl className="w-full">
                                                    <TextField
                                                        type="text"
                                                        label="رفرش توکن وندار"
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        value={settings.vandarRefreshToken}
                                                        onChange={handleChangeSetings('vandarRefreshToken', 'text')} />
                                                </FormControl>
                                            </div>
                                            <div className="col-span-12 xl:col-span-5">
                                                <FormControl className="w-full">
                                                    <TextField
                                                        type="text"
                                                        label="اکسس توکن وندار"
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        value={settings.vandarAccessToken}
                                                        onChange={handleChangeSetings('vandarAccessToken', 'text')} />
                                                </FormControl>
                                            </div>
                                            <div className="col-span-12 md:col-span-3 xl:col-span-2">
                                                <Button type="button" variant="contained" size="medium" className="rounded-2xl h-14" fullWidth disableElevation
                                                    onClick={handleOpenDialog('')}>
                                                    <span className="text-black font-semibold">آپدیت توکن ها</span>
                                                </Button>
                                            </div>
                                            <div className="col-span-12 md:col-span-9 xl:col-span-12">
                                                <FormControl className="w-full">
                                                    <TextField
                                                        type="text"
                                                        label="نام بیزنس وندار"
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        value={settings.vandarBussinesName}
                                                        onChange={handleChangeSetings('vandarBussinesName', 'text')} />
                                                </FormControl>
                                            </div>
                                        </> : ''}
                                    {settings?.autoTransferWithdraw == 'Paystar' ?
                                        <>
                                            <div className="col-span-12 xl:col-span-6">
                                                <FormControl className="w-full">
                                                    <TextField
                                                        type="text"
                                                        label="شناسه کیف پول پی استار"
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        value={settings.paystarWalletId}
                                                        onChange={handleChangeSetings('paystarWalletId', 'text')} />
                                                </FormControl>
                                            </div>
                                            <div className="col-span-12 xl:col-span-6">
                                                <FormControl className="w-full">
                                                    <TextField
                                                        type="text"
                                                        label="رمز عبور کیف پول پی استار"
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        value={settings.paystarWalletPassword}
                                                        onChange={handleChangeSetings('paystarWalletPassword', 'text')} />
                                                </FormControl>
                                            </div>
                                            <div className="col-span-12 xl:col-span-6">
                                                <FormControl className="w-full">
                                                    <TextField
                                                        type="text"
                                                        label="رفرش توکن کیف پول پی استار"
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        value={settings.paystarWalletRefreshToken}
                                                        onChange={handleChangeSetings('paystarWalletRefreshToken', 'text')} />
                                                </FormControl>
                                            </div>
                                            <div className="col-span-12 xl:col-span-6">
                                                <FormControl className="w-full">
                                                    <TextField
                                                        type="text"
                                                        label="کلید امضا کیف پول پی استار"
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        value={settings.paystarWalletSignKey}
                                                        onChange={handleChangeSetings('paystarWalletSignKey', 'text')} />
                                                </FormControl>
                                            </div>
                                        </> : ''}
                                </> : ''}
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <NumericFormat
                                        thousandSeparator
                                        decimalScale={0}
                                        customInput={TextField}
                                        type="tel"
                                        label="حداکثر مبلغ خرید قرضی کاربران (به تومان)"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.payLaterLimit}
                                        onChange={handleChangeSetings('payLaterLimit', 'numberFormat')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <NumericFormat
                                        thousandSeparator
                                        decimalScale={0}
                                        customInput={TextField}
                                        type="tel"
                                        label="حداکثر زمان تسویه خرید قرضی (به ساعت)"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.payLaterDeadlineHours}
                                        onChange={handleChangeSetings('payLaterDeadlineHours', 'numberFormat')} />
                                </FormControl>
                            </div>
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                            <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between text-end m-0"
                                        control={<CustomSwitch
                                            checked={settings.idDepositIsActive}
                                            onChange={handleChangeSetings('idDepositIsActive', 'checkbox')}
                                        />}
                                        label={`فعالسازی واریز شناسه دار`} />
                                </FormGroup>
                            </div>
                            {settings.idDepositIsActive ? <>
                                <div className="col-span-12 xl:col-span-6">
                                    <FormControl className="w-full">
                                        <TextField
                                            type="text"
                                            label="نام صاحب حساب مقصد"
                                            placeholder="مثال برای وندار: تجارت الکترونیک ارسباران"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            value={settings.idDepositAccountOwnerName}
                                            onChange={handleChangeSetings('idDepositAccountOwnerName', 'text')} />
                                    </FormControl>
                                </div>
                                <div className="col-span-12 xl:col-span-6">
                                    <FormControl className="w-full">
                                        <TextField
                                            type="text"
                                            label="رفرش توکن وندار"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            value={settings.vandarRefreshToken}
                                            onChange={handleChangeSetings('vandarRefreshToken', 'text')} />
                                    </FormControl>
                                </div>
                                <div className="col-span-12 xl:col-span-6">
                                    <FormControl className="w-full">
                                        <TextField
                                            type="text"
                                            label="نام بیزنس وندار"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            value={settings.vandarBussinesName}
                                            onChange={handleChangeSetings('vandarBussinesName', 'text')} />
                                    </FormControl>
                                </div>
                            </> : ''}
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                            {typeGateways?.map((data, index) => (
                                <>
                                    <div key={index} className="col-span-12 md:col-span-6 w-full flex items-center">
                                        <FormGroup className="w-full ltr">
                                            <FormControlLabel
                                                className="justify-between text-end m-0"
                                                control={<CustomSwitch
                                                    checked={settings[data.checkbox]}
                                                    onChange={(event) => {
                                                        if (event.target.checked) {
                                                            setSettings({ ...settings, [data.checkbox]: event.target.checked });
                                                        } else {
                                                            setSettings({ ...settings, [data.checkbox]: event.target.checked, [data.apiKey]: '' });
                                                        }
                                                    }}
                                                />}
                                                label={`فعالسازی درگاه ${data.label}`} />
                                        </FormGroup>
                                    </div>
                                    {settings[data.checkbox] ? <div key={data.apiKey} className="col-span-12 md:col-span-6">
                                        <FormControl className="w-full">
                                            <TextField
                                                type={data.type}
                                                label={data.placeholder}
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                value={settings[data.apiKey]}
                                                onChange={handleChangeSetings(data.apiKey, data.type == 'text' ? 'text' : 'numberFormat')} />
                                        </FormControl>
                                    </div> : <div key={data.value} className="col-span-12 md:col-span-6 invisible">
                                        <FormControl className="w-full">
                                            <TextField
                                                type="text"
                                                label={data.placeholder}
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }} />
                                        </FormControl>
                                    </div>}
                                </>
                            ))}
                            <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between text-end m-0"
                                        control={<CustomSwitch
                                            checked={settings.tradeableTransferIsActive}
                                            onChange={handleChangeSetings('tradeableTransferIsActive', 'checkbox')}
                                        />}
                                        label="فعالسازی انتقال دارایی کاربر به کاربر واحد های قابل معامله" />
                                </FormGroup>
                            </div>
                            <div className="col-span-12"></div>
                            <div className="col-span-12 xl:col-span-4">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="صاحب حساب جهت واریز دستی"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.cardOwnerName}
                                        onChange={handleChangeSetings('cardOwnerName', 'text')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6 xl:col-span-4">
                                <FormControl className="w-full">
                                    <PatternFormat
                                        format="#### #### #### ####"
                                        customInput={TextField}
                                        type="tel"
                                        color="primary"
                                        label="شماره کارت جهت واریز دستی"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-center' : 'text-black text-center', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            inputProps: {
                                                className: 'ltr',
                                                inputMode: 'decimal'
                                            },

                                        }}
                                        value={settings.appOwnerCardNumber}
                                        onValueChange={handleChangeSetings('appOwnerCardNumber', 'cardFormat')}
                                        onPaste={(event) => {
                                            event.preventDefault();
                                            const pastedText = event.clipboardData.getData('Text');
                                            const converted = ConvertText(pastedText);
                                            setSettings((prevState) => ({
                                                ...prevState,
                                                appOwnerCardNumber: converted,
                                            }));
                                        }} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6 xl:col-span-4">
                                <FormControl className="w-full">
                                    <PatternFormat
                                        format="## #### #### #### #### #### ##"
                                        customInput={TextField}
                                        type="tel"
                                        id="shaba"
                                        label="شماره شبا جهت واریز دستی"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-center' : 'text-black text-center', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            inputProps: {
                                                className: 'ltr',
                                                inputMode: 'decimal'
                                            },
                                            endAdornment: <div className="w-6 h-6 px-1 pt-1 pb-0 flex items-center justify-center rounded-[50%] dark:bg-dark-alt dark:text-white mx-2">IR</div>

                                        }}
                                        value={settings.appOwnerIban?.replace('ir', '').replace('IR', '')}
                                        onValueChange={handleChangeSetings('appOwnerIban', 'shabaFormat')}
                                        onPaste={(event) => {
                                            event.preventDefault();
                                            const pastedText = event.clipboardData.getData('Text');
                                            const converted = ConvertText(pastedText);
                                            setSettings((prevState) => ({
                                                ...prevState,
                                                appOwnerIban: converted?.replace('ir', '').replace('IR', ''),
                                            }));
                                        }} />
                                </FormControl>
                            </div>
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                            <div className="col-span-12">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        multiline
                                        rows={4}
                                        label="توضیحات شرایط و قوانین"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.termsAndConditions}
                                        onChange={handleChangeSetings('termsAndConditions', 'text')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 lg:col-span-6">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        multiline
                                        rows={4}
                                        label="توضیحات در قسمت بالای صفحه محصولات"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.productReqPageDesc1}
                                        onChange={handleChangeSetings('productReqPageDesc1', 'text')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 lg:col-span-6">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        multiline
                                        rows={4}
                                        label="توضیحات واریز از درگاه"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.balanceTransPageDesc1}
                                        onChange={handleChangeSetings('balanceTransPageDesc1', 'text')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 lg:col-span-6">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        multiline
                                        rows={4}
                                        label="توضیحات واریز دستی"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.balanceTransPageDesc2}
                                        onChange={handleChangeSetings('balanceTransPageDesc2', 'text')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 lg:col-span-6">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        multiline
                                        rows={4}
                                        label="توضیحات برداشت"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={settings.balanceTransPageDesc3}
                                        onChange={handleChangeSetings('balanceTransPageDesc3', 'text')} />
                                </FormControl>
                            </div>
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <input type="file" id="lightIconImage" className="hidden" onChange={uploadItemImage('lightIconImage')} />
                                    <TextField type="text" id="account" className="form-input cursor-default"
                                        disabled
                                        label="انتخاب آیکون (تم لایت)"
                                        InputLabelProps={{
                                            classes: { disabled: darkModeToggle ? '!text-white !text-opacity-70' : '!text-black !text-opacity-70' },
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            readOnly: true,
                                            endAdornment: <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={openItemImageFile('lightIconImage')}>
                                                {settings?.lightIconImage ?
                                                    <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${settings?.lightIconImage}`} alt={'lightIconImage'}
                                                        className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" className={darkModeToggle ? 'text-white' : 'text-black'}>
                                                        <path opacity="0.4" d="M16.19 2.5H7.82001C4.18001 2.5 2.01001 4.67 2.01001 8.31V16.68C2.01001 20.32 4.18001 22.49 7.82001 22.49H16.19C19.83 22.49 22 20.32 22 16.68V8.31C22 4.67 19.83 2.5 16.19 2.5Z" fill="currentColor" />
                                                        <path d="M12.2 17.8799C11.5 17.8799 10.79 17.6099 10.26 17.0799C9.74001 16.5599 9.45001 15.8699 9.45001 15.1399C9.45001 14.4099 9.74001 13.7099 10.26 13.1999L11.67 11.7899C11.96 11.4999 12.44 11.4999 12.73 11.7899C13.02 12.0799 13.02 12.5599 12.73 12.8499L11.32 14.2599C11.08 14.4999 10.95 14.8099 10.95 15.1399C10.95 15.4699 11.08 15.7899 11.32 16.0199C11.81 16.5099 12.6 16.5099 13.09 16.0199L15.31 13.7999C16.58 12.5299 16.58 10.4699 15.31 9.19994C14.04 7.92994 11.98 7.92994 10.71 9.19994L8.28998 11.6199C7.77998 12.1299 7.5 12.7999 7.5 13.5099C7.5 14.2199 7.77998 14.8999 8.28998 15.3999C8.57998 15.6899 8.57998 16.1699 8.28998 16.4599C7.99998 16.7499 7.51998 16.7499 7.22998 16.4599C6.43998 15.6699 6.01001 14.6199 6.01001 13.4999C6.01001 12.3799 6.43998 11.3299 7.22998 10.5399L9.65002 8.11992C11.5 6.26992 14.52 6.26992 16.37 8.11992C18.22 9.96992 18.22 12.9899 16.37 14.8399L14.15 17.0599C13.61 17.6099 12.91 17.8799 12.2 17.8799Z" fill="currentColor" />
                                                    </svg>}
                                            </IconButton>
                                        }}
                                        value={''} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <input type="file" id="lightLogoImage" className="hidden" onChange={uploadItemImage('lightLogoImage')} />
                                    <TextField type="text" id="account" className="form-input cursor-default"
                                        disabled
                                        label="انتخاب لوگو (تم لایت)"
                                        InputLabelProps={{
                                            classes: { disabled: darkModeToggle ? '!text-white !text-opacity-70' : '!text-black !text-opacity-70' },
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            readOnly: true,
                                            endAdornment: <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={openItemImageFile('lightLogoImage')}>
                                                {settings?.lightLogoImage ?
                                                    <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${settings?.lightLogoImage}`} alt={'lightLogoImage'}
                                                        className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" className={darkModeToggle ? 'text-white' : 'text-black'}>
                                                        <path opacity="0.4" d="M16.19 2.5H7.82001C4.18001 2.5 2.01001 4.67 2.01001 8.31V16.68C2.01001 20.32 4.18001 22.49 7.82001 22.49H16.19C19.83 22.49 22 20.32 22 16.68V8.31C22 4.67 19.83 2.5 16.19 2.5Z" fill="currentColor" />
                                                        <path d="M12.2 17.8799C11.5 17.8799 10.79 17.6099 10.26 17.0799C9.74001 16.5599 9.45001 15.8699 9.45001 15.1399C9.45001 14.4099 9.74001 13.7099 10.26 13.1999L11.67 11.7899C11.96 11.4999 12.44 11.4999 12.73 11.7899C13.02 12.0799 13.02 12.5599 12.73 12.8499L11.32 14.2599C11.08 14.4999 10.95 14.8099 10.95 15.1399C10.95 15.4699 11.08 15.7899 11.32 16.0199C11.81 16.5099 12.6 16.5099 13.09 16.0199L15.31 13.7999C16.58 12.5299 16.58 10.4699 15.31 9.19994C14.04 7.92994 11.98 7.92994 10.71 9.19994L8.28998 11.6199C7.77998 12.1299 7.5 12.7999 7.5 13.5099C7.5 14.2199 7.77998 14.8999 8.28998 15.3999C8.57998 15.6899 8.57998 16.1699 8.28998 16.4599C7.99998 16.7499 7.51998 16.7499 7.22998 16.4599C6.43998 15.6699 6.01001 14.6199 6.01001 13.4999C6.01001 12.3799 6.43998 11.3299 7.22998 10.5399L9.65002 8.11992C11.5 6.26992 14.52 6.26992 16.37 8.11992C18.22 9.96992 18.22 12.9899 16.37 14.8399L14.15 17.0599C13.61 17.6099 12.91 17.8799 12.2 17.8799Z" fill="currentColor" />
                                                    </svg>}
                                            </IconButton>
                                        }}
                                        value={''} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <input type="file" id="darkIconImage" className="hidden" onChange={uploadItemImage('darkIconImage')} />
                                    <TextField type="text" id="account" className="form-input cursor-default"
                                        disabled
                                        label="انتخاب آیکون (تم دارک)"
                                        InputLabelProps={{
                                            classes: { disabled: darkModeToggle ? '!text-white !text-opacity-70' : '!text-black !text-opacity-70' },
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            readOnly: true,
                                            endAdornment: <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={openItemImageFile('darkIconImage')}>
                                                {settings?.darkIconImage ?
                                                    <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${settings?.darkIconImage}`} alt={'darkIconImage'}
                                                        className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" className={darkModeToggle ? 'text-white' : 'text-black'}>
                                                        <path opacity="0.4" d="M16.19 2.5H7.82001C4.18001 2.5 2.01001 4.67 2.01001 8.31V16.68C2.01001 20.32 4.18001 22.49 7.82001 22.49H16.19C19.83 22.49 22 20.32 22 16.68V8.31C22 4.67 19.83 2.5 16.19 2.5Z" fill="currentColor" />
                                                        <path d="M12.2 17.8799C11.5 17.8799 10.79 17.6099 10.26 17.0799C9.74001 16.5599 9.45001 15.8699 9.45001 15.1399C9.45001 14.4099 9.74001 13.7099 10.26 13.1999L11.67 11.7899C11.96 11.4999 12.44 11.4999 12.73 11.7899C13.02 12.0799 13.02 12.5599 12.73 12.8499L11.32 14.2599C11.08 14.4999 10.95 14.8099 10.95 15.1399C10.95 15.4699 11.08 15.7899 11.32 16.0199C11.81 16.5099 12.6 16.5099 13.09 16.0199L15.31 13.7999C16.58 12.5299 16.58 10.4699 15.31 9.19994C14.04 7.92994 11.98 7.92994 10.71 9.19994L8.28998 11.6199C7.77998 12.1299 7.5 12.7999 7.5 13.5099C7.5 14.2199 7.77998 14.8999 8.28998 15.3999C8.57998 15.6899 8.57998 16.1699 8.28998 16.4599C7.99998 16.7499 7.51998 16.7499 7.22998 16.4599C6.43998 15.6699 6.01001 14.6199 6.01001 13.4999C6.01001 12.3799 6.43998 11.3299 7.22998 10.5399L9.65002 8.11992C11.5 6.26992 14.52 6.26992 16.37 8.11992C18.22 9.96992 18.22 12.9899 16.37 14.8399L14.15 17.0599C13.61 17.6099 12.91 17.8799 12.2 17.8799Z" fill="currentColor" />
                                                    </svg>}
                                            </IconButton>
                                        }}
                                        value={''} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <input type="file" id="darkLogoImage" className="hidden" onChange={uploadItemImage('darkLogoImage')} />
                                    <TextField type="text" id="account" className="form-input cursor-default"
                                        disabled
                                        label="انتخاب لوگو (تم دارک)"
                                        InputLabelProps={{
                                            classes: { disabled: darkModeToggle ? '!text-white !text-opacity-70' : '!text-black !text-opacity-70' },
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            readOnly: true,
                                            endAdornment: <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={openItemImageFile('darkLogoImage')}>
                                                {settings?.darkLogoImage ?
                                                    <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${settings?.darkLogoImage}`} alt={'darkLogoImage'}
                                                        className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" className={darkModeToggle ? 'text-white' : 'text-black'}>
                                                        <path opacity="0.4" d="M16.19 2.5H7.82001C4.18001 2.5 2.01001 4.67 2.01001 8.31V16.68C2.01001 20.32 4.18001 22.49 7.82001 22.49H16.19C19.83 22.49 22 20.32 22 16.68V8.31C22 4.67 19.83 2.5 16.19 2.5Z" fill="currentColor" />
                                                        <path d="M12.2 17.8799C11.5 17.8799 10.79 17.6099 10.26 17.0799C9.74001 16.5599 9.45001 15.8699 9.45001 15.1399C9.45001 14.4099 9.74001 13.7099 10.26 13.1999L11.67 11.7899C11.96 11.4999 12.44 11.4999 12.73 11.7899C13.02 12.0799 13.02 12.5599 12.73 12.8499L11.32 14.2599C11.08 14.4999 10.95 14.8099 10.95 15.1399C10.95 15.4699 11.08 15.7899 11.32 16.0199C11.81 16.5099 12.6 16.5099 13.09 16.0199L15.31 13.7999C16.58 12.5299 16.58 10.4699 15.31 9.19994C14.04 7.92994 11.98 7.92994 10.71 9.19994L8.28998 11.6199C7.77998 12.1299 7.5 12.7999 7.5 13.5099C7.5 14.2199 7.77998 14.8999 8.28998 15.3999C8.57998 15.6899 8.57998 16.1699 8.28998 16.4599C7.99998 16.7499 7.51998 16.7499 7.22998 16.4599C6.43998 15.6699 6.01001 14.6199 6.01001 13.4999C6.01001 12.3799 6.43998 11.3299 7.22998 10.5399L9.65002 8.11992C11.5 6.26992 14.52 6.26992 16.37 8.11992C18.22 9.96992 18.22 12.9899 16.37 14.8399L14.15 17.0599C13.61 17.6099 12.91 17.8799 12.2 17.8799Z" fill="currentColor" />
                                                    </svg>}
                                            </IconButton>
                                        }}
                                        value={''} />
                                </FormControl>
                            </div>
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                            <div className="col-span-12 md:col-span-4 w-full flex items-center">
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between text-end m-0"
                                        control={<CustomSwitch
                                            checked={settings.offlineFirstStepUserVerifyEnabled || false}
                                            onChange={(event) => {
                                                setSettings((prevState) => ({
                                                    ...prevState,
                                                    offlineFirstStepUserVerifyEnabled: event.target.checked
                                                }));
                                                if (event.target.checked) {
                                                    console.log(88888, event.target.checked, settings.offlineFirstStepUserVerifyEnabled);
                                                    setSettings((prevState) => ({
                                                        ...prevState,
                                                        onlineFirstStepUserVerifyEnabled: false
                                                    }));
                                                } else if (!event.target.checked && !settings.onlineFirstStepUserVerifyEnabled) {
                                                    setSettings((prevState) => ({
                                                        ...prevState,
                                                        secondStepUserVerifyEnabled: false
                                                    }));
                                                }
                                            }}
                                        />}
                                        label="وضعیت احراز آفلاین" />
                                </FormGroup>
                            </div>
                            <div className="col-span-12 md:col-span-4 w-full flex items-center">
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between text-end m-0"
                                        control={<CustomSwitch
                                            checked={settings.onlineFirstStepUserVerifyEnabled || false}
                                            onChange={(event) => {
                                                setSettings((prevState) => ({
                                                    ...prevState,
                                                    onlineFirstStepUserVerifyEnabled: event.target.checked
                                                }));
                                                if (event.target.checked) {
                                                    setSettings((prevState) => ({
                                                        ...prevState,
                                                        offlineFirstStepUserVerifyEnabled: false
                                                    }));
                                                } else if (!event.target.checked && !settings.offlineFirstStepUserVerifyEnabled) {
                                                    setSettings((prevState) => ({
                                                        ...prevState,
                                                        secondStepUserVerifyEnabled: false
                                                    }));
                                                }
                                            }}
                                        />}
                                        label="وضعیت احراز آنلاین" />
                                </FormGroup>
                            </div>
                            {settings.offlineFirstStepUserVerifyEnabled || settings.onlineFirstStepUserVerifyEnabled ?
                                <>
                                    <div className="col-span-12 md:col-span-4 w-full flex items-center">
                                        <FormGroup className="w-full ltr">
                                            <FormControlLabel
                                                className="justify-between text-end m-0"
                                                control={<CustomSwitch
                                                    checked={settings.secondStepUserVerifyEnabled || false}
                                                    onChange={handleChangeSetings('secondStepUserVerifyEnabled', 'checkbox')}
                                                />}
                                                label="وضعیت احراز هویت کامل" />
                                        </FormGroup>
                                    </div>
                                    {(settings.offlineFirstStepUserVerifyEnabled || settings.onlineFirstStepUserVerifyEnabled) && settings.secondStepUserVerifyEnabled ?
                                        <>
                                            <div className="col-span-12 md:col-span-3">
                                                <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                                    onClick={addAuthDocument}>
                                                    <text className="text-black font-semibold">افزودن مدرک احراز هویت</text>
                                                </Button>
                                            </div>
                                            {settings.secondStepUserVerifyDocs?.map((data, index) => {
                                                return (
                                                    <div className="col-span-12 grid grid-cols-12 gap-x-4 gap-y-8" key={index}>
                                                        <div className="col-span-12 md:col-span-6">
                                                            <FormControl className="w-full">
                                                                <TextField
                                                                    type="text"
                                                                    label="عنوان مدرک"
                                                                    placeholder="مثال: تصویر جلو کارت ملی"
                                                                    variant="outlined"
                                                                    InputLabelProps={{
                                                                        classes: { disabled: darkModeToggle ? '!text-white !text-opacity-70' : '!text-black !text-opacity-70' },
                                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                                    }}
                                                                    InputProps={{
                                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                                    }}
                                                                    value={data.name}
                                                                    onChange={(event) => {
                                                                        const updatedDocs = [...settings.secondStepUserVerifyDocs];
                                                                        updatedDocs[index] = {
                                                                            ...updatedDocs[index],
                                                                            name: event.target.value
                                                                        }

                                                                        setSettings(prevSettings => ({
                                                                            ...prevSettings,
                                                                            secondStepUserVerifyDocs: updatedDocs
                                                                        }));
                                                                    }} />
                                                            </FormControl>
                                                        </div>
                                                        <div className="col-span-12 md:col-span-6">
                                                            <FormControl className="w-full">
                                                                <input type="file" id={`authPic${index}`} className="hidden" onChange={uploadAuthImage(index)} />
                                                                <TextField type="text" id="account" className="form-input cursor-default"
                                                                    disabled
                                                                    label="انتخاب تصویر پیشفرض مدرک"
                                                                    InputLabelProps={{
                                                                        classes: { disabled: darkModeToggle ? '!text-white !text-opacity-70' : '!text-black !text-opacity-70' },
                                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                                    }}
                                                                    InputProps={{
                                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                                        readOnly: true,
                                                                        endAdornment: <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={openAuthImageFile(index)}>
                                                                            {data?.defaultImage ?
                                                                                <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data?.defaultImage}`} alt={index}
                                                                                    className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" className={darkModeToggle ? 'text-white' : 'text-black'}>
                                                                                    <path opacity="0.4" d="M16.19 2.5H7.82001C4.18001 2.5 2.01001 4.67 2.01001 8.31V16.68C2.01001 20.32 4.18001 22.49 7.82001 22.49H16.19C19.83 22.49 22 20.32 22 16.68V8.31C22 4.67 19.83 2.5 16.19 2.5Z" fill="currentColor" />
                                                                                    <path d="M12.2 17.8799C11.5 17.8799 10.79 17.6099 10.26 17.0799C9.74001 16.5599 9.45001 15.8699 9.45001 15.1399C9.45001 14.4099 9.74001 13.7099 10.26 13.1999L11.67 11.7899C11.96 11.4999 12.44 11.4999 12.73 11.7899C13.02 12.0799 13.02 12.5599 12.73 12.8499L11.32 14.2599C11.08 14.4999 10.95 14.8099 10.95 15.1399C10.95 15.4699 11.08 15.7899 11.32 16.0199C11.81 16.5099 12.6 16.5099 13.09 16.0199L15.31 13.7999C16.58 12.5299 16.58 10.4699 15.31 9.19994C14.04 7.92994 11.98 7.92994 10.71 9.19994L8.28998 11.6199C7.77998 12.1299 7.5 12.7999 7.5 13.5099C7.5 14.2199 7.77998 14.8999 8.28998 15.3999C8.57998 15.6899 8.57998 16.1699 8.28998 16.4599C7.99998 16.7499 7.51998 16.7499 7.22998 16.4599C6.43998 15.6699 6.01001 14.6199 6.01001 13.4999C6.01001 12.3799 6.43998 11.3299 7.22998 10.5399L9.65002 8.11992C11.5 6.26992 14.52 6.26992 16.37 8.11992C18.22 9.96992 18.22 12.9899 16.37 14.8399L14.15 17.0599C13.61 17.6099 12.91 17.8799 12.2 17.8799Z" fill="currentColor" />
                                                                                </svg>}
                                                                        </IconButton>
                                                                    }}
                                                                    value={''} />
                                                            </FormControl>
                                                        </div>
                                                        <div className="col-span-12">
                                                            <FormControl className="w-full">
                                                                <TextField
                                                                    type="text"
                                                                    multiline
                                                                    rows={4}
                                                                    label="توضیحات مدرک"
                                                                    variant="outlined"
                                                                    InputLabelProps={{
                                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                                    }}
                                                                    InputProps={{
                                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                                    }}
                                                                    value={data.description}
                                                                    onChange={(event) => {
                                                                        const updatedDocs = [...settings.secondStepUserVerifyDocs];
                                                                        updatedDocs[index] = {
                                                                            ...updatedDocs[index],
                                                                            description: event.target.value
                                                                        }

                                                                        setSettings(prevSettings => ({
                                                                            ...prevSettings,
                                                                            secondStepUserVerifyDocs: updatedDocs
                                                                        }));
                                                                    }} />
                                                            </FormControl>
                                                        </div>
                                                        <div className="col-span-12 text-end">
                                                            <Button type="button" variant="contained" size="medium" color="error" className="rounded-lg w-full lg:w-fit" disableElevation
                                                                onClick={removeAddAuthDocument(index)}>
                                                                <text className="text-white font-semibold">حذف مدرک</text>
                                                            </Button>
                                                        </div>
                                                        <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                                                    </div>
                                                )
                                            })}
                                        </> :
                                        ''}
                                </>
                                : ''}
                        </form>}
                    <ConfirmDialog
                        open={openUpdateDialog}
                        onClose={handleCloseDialog}
                        onConfirm={updateWithdrawToken}
                        title="آیا مطمئن هستید؟"
                        loading={updateToken}
                        darkModeToggle={darkModeToggle}
                    />
                </div>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <div className=" flex flex-col gap-y-4">
                    <section className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-y-4">
                        <h1 className="text-large-2">سطح بندی کاربران</h1>
                        <div className="flex items-center gap-x-4 w-full md:w-fit">
                            <Button type="button" variant="contained" color="error" size="medium" className="rounded-lg w-1/2 md:w-fit" disableElevation
                                onClick={handleOpenDialog('')}>
                                <text className="text-white font-semibold">آپدیت سطوح کاربران</text>
                            </Button>
                            <Button type="button" variant="contained" size="medium" className="rounded-lg w-1/2 md:w-fit" disableElevation
                                onClick={handleShowLevel('add')}>
                                <text className="text-black font-semibold">افزودن سطح</text>
                            </Button >
                        </div>
                    </section>
                    <Alert
                        severity="error"
                        variant="filled"
                        color="error"
                        className="custom-alert auth error mt-4"
                    >
                        <div className="flex flex-col items-baseline md:items-center gap-y-2 md:flex-row md:justify-between w-full">
                            <p className="text-justify m-0">
                                برای اعمال تغییرات سطح بندی پس از انجام تمام تغییرات خود اعم از افزودن ، تغییر و حذف می بایست از طریق دکمه آپدیت سطوح کاربران نسبت به  بروزرسانی سطوح اقدام نمائید.
                            </p>
                        </div>

                    </Alert>
                    <section className="overflow-x-auto overflow-y-hidden">
                        <div className="flex items-center justify-between gap-x-4">
                            <form autoComplete="off">
                                <FormControl className="w-full md:w-auto">
                                    <TextField
                                        size="small"
                                        type="text"
                                        label="جستجو سطح"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                        }}
                                        onChange={(event) => setSearchLevels(event.target.value)}
                                        onKeyDown={searchLevelsItemsHandler}
                                        onKeyUp={searchLevelsItems} />
                                </FormControl>
                            </form>
                            <span className="dark:text-white">تعداد کل: {loadingLevels ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (levelsTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>

                        {loadingLevels ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : levels.length > 0 ?
                            <>
                                <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                        <TableHead className="dark:bg-dark">
                                            <TableRow>
                                                {LEVELS_TABLE_HEAD.map((data, index) => (
                                                    <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
                                                        <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {levels.map((data, index) => (
                                                <TableRow
                                                    key={index}
                                                    sx={{ '&:last-child td': { border: 0 } }}
                                                    className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                                    <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        <span>{data.name}</span>
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        {data.number}
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                        <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                            .locale('fa')
                                                            .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                        <Button variant="text" size="medium" color="primary" className="rounded-lg" disableElevation
                                                            onClick={handleShowLevel('edit', data)}>
                                                            <text className=" font-semibold">جزئیات بیشتر</text>
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                        <Tooltip title="حذف سطح">
                                                            <IconButton
                                                                color={`error`}
                                                                onClick={handleOpenDialog(data._id)}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <ConfirmDialog
                                    open={openDialog}
                                    onClose={handleCloseDialog}
                                    onConfirm={deleteLevel}
                                    title="آیا مطمئن هستید؟"
                                    loading={deleteLoading}
                                    darkModeToggle={darkModeToggle}
                                />
                                <ConfirmDialog
                                    open={openUpdateDialog}
                                    onClose={handleCloseDialog}
                                    onConfirm={handleUpdateLevels}
                                    title="انجام فرایند بر اساس تعداد کاربران کمی زمان بر خواهد بود. آیا مطمئن هستید؟"
                                    loading={updateLoading}
                                    darkModeToggle={darkModeToggle}
                                />
                            </>
                            : <div className="py-16">
                                <span className="block text-center text-large-1 text-primary-gray">سطحی یافت نشد</span>
                            </div>}

                    </section>
                    {Math.ceil(levelsTotal / levelsLimit) > 1 ?
                        <div className="text-center mt-4">
                            <Pagination siblingCount={0} count={Math.ceil(levelsTotal / levelsLimit)} variant="outlined" color="primary" className="justify-center"
                                page={pageItem} onChange={handlePageChange} />
                        </div>
                        : ''}
                </div>
            </TabPanel>

            {/* AddLevel */}
            <>
                <Dialog onClose={() => setShowAddLevel(false)} open={showAddLevel} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن سطح
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowAddLevel(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate autoComplete="off" onSubmit={handleSubmit(saveLevel)}>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="name"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="نام سطح"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.name}
                                            helperText={errors.name ? errors.name.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'name', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="number"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="شماره سطح"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.number}
                                            helperText={errors.number ? errors.number.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'number', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        {settings.userLeveling == 'Transaction' && (
                            <>
                                <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                    <FormGroup className="w-full ltr">
                                        <Controller
                                            name="tradesBased"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    className="justify-between text-end m-0"
                                                    control={<CustomSwitch
                                                        {...field}
                                                        checked={tradesBased}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            setTradesBased(event.target.checked);
                                                            if (event.target.checked) {
                                                                setAddLevel({ ...addLevel, minRequiredTradesAmount: addLevel?.minRequiredTradesAmount });
                                                            } else {
                                                                setAddLevel({ ...addLevel, minRequiredTradesAmount: 0 });
                                                            }
                                                        }}
                                                    />}
                                                    label="برحسب حجم معاملات"
                                                />
                                            )}
                                        />
                                    </FormGroup>
                                </div>
                                {tradesBased ? <div className="col-span-12 md:col-span-6">
                                    <FormControl className="w-full">
                                        <Controller
                                            name="minRequiredTradesAmount"
                                            control={control}
                                            render={({ field }) => (
                                                <NumericFormat
                                                    {...field}
                                                    thousandSeparator
                                                    allowNegative={false}
                                                    customInput={TextField}
                                                    type="tel"
                                                    label="حداقل حجم معامله برای ارتقا (به تومان)"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    }}
                                                    error={!!errors.minRequiredTradesAmount}
                                                    helperText={errors.minRequiredTradesAmount ? errors.minRequiredTradesAmount.message : ''}
                                                    value={addLevel?.minRequiredTradesAmount}
                                                    onChange={(event) => {
                                                        field.onChange(event);
                                                        handleChangeAddData(event, 'minRequiredTradesAmount', 'numberFormat');
                                                    }}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                </div>
                                    : <div className="col-span-12 md:col-span-6 invisible">
                                        <FormControl className="w-full">
                                            <NumericFormat
                                                thousandSeparator
                                                customInput={TextField}
                                                type="tel"
                                                label="حداقل حجم معامله برای ارتقا (به تومان)"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }} />
                                        </FormControl>
                                    </div>}
                            </>
                        )}
                        {settings.userLeveling == 'Referral' && (
                            <>
                                <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                    <FormGroup className="w-full ltr">
                                        <Controller
                                            name="referralBased"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    className="justify-between text-end m-0"
                                                    control={<CustomSwitch
                                                        {...field}
                                                        checked={referralBased}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            setReferralBased(event.target.checked);
                                                            if (event.target.checked) {
                                                                setAddLevel({ ...addLevel, minRequiredReferralCount: addLevel?.minRequiredReferralCount });
                                                            } else {
                                                                setAddLevel({ ...addLevel, minRequiredReferralCount: 0 });
                                                            }
                                                        }}
                                                    />}
                                                    label="برحسب تعداد دعوت"
                                                />
                                            )}
                                        />
                                    </FormGroup>
                                </div>
                                {referralBased ?
                                    <div className="col-span-12 md:col-span-6">
                                        <FormControl className="w-full">
                                            <Controller
                                                name="minRequiredReferralCount"
                                                control={control}
                                                render={({ field }) => (
                                                    <NumericFormat
                                                        {...field}
                                                        thousandSeparator
                                                        allowNegative={false}
                                                        customInput={TextField}
                                                        type="tel"
                                                        label="حداقل تعداد دعوت برای ارتقا"
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        error={!!errors.minRequiredReferralCount}
                                                        helperText={errors.minRequiredReferralCount ? errors.minRequiredReferralCount.message : ''}
                                                        value={addLevel?.minRequiredReferralCount}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            handleChangeAddData(event, 'minRequiredReferralCount', 'numberFormat');
                                                        }}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                    </div>
                                    : <div className="col-span-12 md:col-span-6 invisible">
                                        <FormControl className="w-full">
                                            <NumericFormat
                                                thousandSeparator
                                                customInput={TextField}
                                                type="tel"
                                                label="حداقل تعداد دعوت برای ارتقا"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }} />
                                        </FormControl>
                                    </div>}
                            </>
                        )}
                        <div className="col-span-12 flex items-center gap-x-4 cursor-pointer" onClick={() => setExpand(!expand)}>
                            <span className="whitespace-nowrap">واحدهای قابل معامله</span>
                            <Divider component="div" className="w-[78%] dark:bg-primary dark:bg-opacity-50" />
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`text-primary transition ${expand ? '' : 'rotate-180'}`}>
                                <path d="M12 16.8C11.3 16.8 10.6 16.53 10.07 16L3.55 9.48001C3.26 9.19001 3.26 8.71001 3.55 8.42001C3.84 8.13001 4.32 8.13001 4.61 8.42001L11.13 14.94C11.61 15.42 12.39 15.42 12.87 14.94L19.39 8.42001C19.68 8.13001 20.16 8.13001 20.45 8.42001C20.74 8.71001 20.74 9.19001 20.45 9.48001L13.93 16C13.4 16.53 12.7 16.8 12 16.8Z" fill="currentColor" />
                            </svg>
                        </div>
                        <Collapse in={expand} className="col-span-12 tradeables-collapse">
                            {tradeables?.map((data, index) => (
                                <React.Fragment key={index}>
                                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                                        <FormControl className="w-full">
                                            <TextField
                                                type="text"
                                                label="واحد قابل معامله"
                                                variant="outlined"
                                                className="pointer-events-none"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                value={data.nameFa}
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                                        <MUISelect
                                            type="text"
                                            variant="filled"
                                            color="black"
                                            label="نوع گپ قیمتی"
                                            className="form-select w-full"
                                            defaultValue={'Percent'}
                                            onChange={(event) => setAddLevelTradeables(prevState => {
                                                const updatedWages = [...prevState];
                                                updatedWages[index] = {
                                                    ...updatedWages[index],
                                                    wageType: event.target?.value
                                                }
                                                return updatedWages;
                                            })}
                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                            <MenuItem value="Fixed" >ثابت</MenuItem>
                                            <MenuItem value="Percent" >درصدی</MenuItem>
                                        </MUISelect>
                                    </div>
                                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                                        <FormControl className="w-full">
                                            <Controller
                                                name={`tradeableWages[${index}].buyWage`}
                                                control={control}
                                                render={({ field }) => (
                                                    <NumericFormat
                                                        {...field}
                                                        thousandSeparator
                                                        decimalScale={addLevelTradeables[index]?.wageType == 'Fixed' ? 0 : 3}
                                                        customInput={TextField}
                                                        type="tel"
                                                        label={addLevelTradeables[index]?.wageType == 'Fixed' ? "گپ قیمت خرید (به تومان)" : "گپ قیمت خرید (به درصد)"}
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        error={!!errors.tradeableWages?.[index]?.buyWage}
                                                        helperText={errors.tradeableWages?.[index]?.buyWage?.message || ''}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            const value = Number(event.target.value.replace(/,/g, ''));
                                                            setAddLevelTradeables(prevState => {
                                                                const updatedWages = [...prevState];
                                                                updatedWages[index] = {
                                                                    ...updatedWages[index],
                                                                    buyWage: value
                                                                }
                                                                return updatedWages;
                                                            });
                                                        }}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                                        <FormControl className="w-full">
                                            <Controller
                                                name={`tradeableWages[${index}].sellWage`}
                                                control={control}
                                                render={({ field }) => (
                                                    <NumericFormat
                                                        {...field}
                                                        thousandSeparator
                                                        decimalScale={addLevelTradeables[index]?.wageType == 'Fixed' ? 0 : 3}
                                                        customInput={TextField}
                                                        type="tel"
                                                        label={addLevelTradeables[index]?.wageType == 'Fixed' ? "گپ قیمت فروش (به تومان)" : "گپ قیمت فروش (به درصد)"}
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        error={!!errors.tradeableWages?.[index]?.sellWage}
                                                        helperText={errors.tradeableWages?.[index]?.sellWage?.message || ''}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            const value = Number(event.target.value.replace(/,/g, ''));
                                                            setAddLevelTradeables(prevState => {
                                                                const updatedWages = [...prevState];
                                                                updatedWages[index] = {
                                                                    ...updatedWages[index],
                                                                    sellWage: value
                                                                }
                                                                return updatedWages;
                                                            });
                                                        }}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                    </div>
                                </React.Fragment>
                            ))}
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                        </Collapse>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="dailyMinBuyAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداقل مقدار خرید روزانه (به تومان)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.dailyMinBuyAmount}
                                            helperText={errors.dailyMinBuyAmount ? errors.dailyMinBuyAmount.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'dailyMinBuyAmount', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="dailyMaxBuyAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداکثر مقدار خرید روزانه (به تومان)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.dailyMaxBuyAmount}
                                            helperText={errors.dailyMaxBuyAmount ? errors.dailyMaxBuyAmount.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'dailyMaxBuyAmount', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="dailyMinSellAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداقل مقدار فروش روزانه (به تومان)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.dailyMinSellAmount}
                                            helperText={errors.dailyMinSellAmount ? errors.dailyMinSellAmount.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'dailyMinSellAmount', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="dailyMaxSellAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداکثر مقدار فروش روزانه (به تومان)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.dailyMaxSellAmount}
                                            helperText={errors.dailyMaxSellAmount ? errors.dailyMaxSellAmount.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'dailyMaxSellAmount', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="توضیحات سطح"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    onChange={(event) => {
                                        handleChangeAddData(event, 'description', 'text');
                                    }}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 text-end">
                            <Button type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation>
                                <text className="text-black font-semibold">افزودن سطح</text>
                            </Button>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomAddLevelDrawer}
                    onClose={() => setOpenBottomAddLevelDrawer(false)}
                    PaperProps={{ className: 'drawers', sx: { height: '80%' } }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن سطح
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomAddLevelDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate autoComplete="off" onSubmit={handleSubmit(saveLevel)}>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="name"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="نام سطح"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.name}
                                            helperText={errors.name ? errors.name.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'name', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="number"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="شماره سطح"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.number}
                                            helperText={errors.number ? errors.number.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'number', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        {settings.userLeveling == 'Transaction' && (
                            <>
                                <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                    <FormGroup className="w-full ltr">
                                        <Controller
                                            name="tradesBased"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    className="justify-between text-end m-0"
                                                    control={<CustomSwitch
                                                        {...field}
                                                        checked={tradesBased}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            setTradesBased(event.target.checked);
                                                            if (event.target.checked) {
                                                                setAddLevel({ ...addLevel, minRequiredTradesAmount: addLevel?.minRequiredTradesAmount });
                                                            } else {
                                                                setAddLevel({ ...addLevel, minRequiredTradesAmount: 0 });
                                                            }
                                                        }}
                                                    />}
                                                    label="برحسب حجم معاملات"
                                                />
                                            )}
                                        />
                                    </FormGroup>
                                </div>
                                {tradesBased ? <div className="col-span-12 md:col-span-6">
                                    <FormControl className="w-full">
                                        <Controller
                                            name="minRequiredTradesAmount"
                                            control={control}
                                            render={({ field }) => (
                                                <NumericFormat
                                                    {...field}
                                                    thousandSeparator
                                                    allowNegative={false}
                                                    customInput={TextField}
                                                    type="tel"
                                                    label="حداقل حجم معامله برای ارتقا (به تومان)"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    }}
                                                    error={!!errors.minRequiredTradesAmount}
                                                    helperText={errors.minRequiredTradesAmount ? errors.minRequiredTradesAmount.message : ''}
                                                    value={addLevel?.minRequiredTradesAmount}
                                                    onChange={(event) => {
                                                        field.onChange(event);
                                                        handleChangeAddData(event, 'minRequiredTradesAmount', 'numberFormat');
                                                    }}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                </div>
                                    : <div className="col-span-12 md:col-span-6 invisible">
                                        <FormControl className="w-full">
                                            <NumericFormat
                                                thousandSeparator
                                                customInput={TextField}
                                                type="tel"
                                                label="حداقل حجم معامله برای ارتقا (به تومان)"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }} />
                                        </FormControl>
                                    </div>}
                            </>
                        )}
                        {settings.userLeveling == 'Referral' && (
                            <>
                                <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                    <FormGroup className="w-full ltr">
                                        <Controller
                                            name="referralBased"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    className="justify-between text-end m-0"
                                                    control={<CustomSwitch
                                                        {...field}
                                                        checked={referralBased}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            setReferralBased(event.target.checked);
                                                            if (event.target.checked) {
                                                                setAddLevel({ ...addLevel, minRequiredReferralCount: addLevel?.minRequiredReferralCount });
                                                            } else {
                                                                setAddLevel({ ...addLevel, minRequiredReferralCount: 0 });
                                                            }
                                                        }}
                                                    />}
                                                    label="برحسب تعداد دعوت"
                                                />
                                            )}
                                        />
                                    </FormGroup>
                                </div>
                                {referralBased ?
                                    <div className="col-span-12 md:col-span-6">
                                        <FormControl className="w-full">
                                            <Controller
                                                name="minRequiredReferralCount"
                                                control={control}
                                                render={({ field }) => (
                                                    <NumericFormat
                                                        {...field}
                                                        thousandSeparator
                                                        allowNegative={false}
                                                        customInput={TextField}
                                                        type="tel"
                                                        label="حداقل تعداد دعوت برای ارتقا"
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        error={!!errors.minRequiredReferralCount}
                                                        helperText={errors.minRequiredReferralCount ? errors.minRequiredReferralCount.message : ''}
                                                        value={addLevel?.minRequiredReferralCount}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            handleChangeAddData(event, 'minRequiredReferralCount', 'numberFormat');
                                                        }}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                    </div>
                                    : <div className="col-span-12 md:col-span-6 invisible">
                                        <FormControl className="w-full">
                                            <NumericFormat
                                                thousandSeparator
                                                customInput={TextField}
                                                type="tel"
                                                label="حداقل تعداد دعوت برای ارتقا"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }} />
                                        </FormControl>
                                    </div>}
                            </>
                        )}
                        <div className="col-span-12 flex items-center gap-x-4 cursor-pointer" onClick={() => setExpand(!expand)}>
                            <span className="whitespace-nowrap">واحدهای قابل معامله</span>
                            <Divider component="div" className="w-[55%] md:w-[74%] dark:bg-primary dark:bg-opacity-50" />
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`text-primary transition ${expand ? '' : 'rotate-180'}`}>
                                <path d="M12 16.8C11.3 16.8 10.6 16.53 10.07 16L3.55 9.48001C3.26 9.19001 3.26 8.71001 3.55 8.42001C3.84 8.13001 4.32 8.13001 4.61 8.42001L11.13 14.94C11.61 15.42 12.39 15.42 12.87 14.94L19.39 8.42001C19.68 8.13001 20.16 8.13001 20.45 8.42001C20.74 8.71001 20.74 9.19001 20.45 9.48001L13.93 16C13.4 16.53 12.7 16.8 12 16.8Z" fill="currentColor" />
                            </svg>
                        </div>
                        <Collapse in={expand} className="col-span-12 tradeables-collapse">
                            {tradeables?.map((data, index) => (
                                <React.Fragment key={index}>
                                    <div className="col-span-12 md:col-span-6">
                                        <FormControl className="w-full">
                                            <TextField
                                                type="text"
                                                label="واحد قابل معامله"
                                                variant="outlined"
                                                className="pointer-events-none"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                value={data.nameFa}
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                        <MUISelect
                                            type="text"
                                            variant="filled"
                                            color="black"
                                            label="نوع گپ قیمتی"
                                            className="form-select w-full"
                                            defaultValue={'Percent'}
                                            onChange={(event) => setAddLevelTradeables(prevState => {
                                                const updatedWages = [...prevState];
                                                updatedWages[index] = {
                                                    ...updatedWages[index],
                                                    wageType: event.target?.value
                                                }
                                                return updatedWages;
                                            })}
                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                            <MenuItem value="Fixed" >ثابت</MenuItem>
                                            <MenuItem value="Percent" >درصدی</MenuItem>
                                        </MUISelect>
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                        <FormControl className="w-full">
                                            <Controller
                                                name={`tradeableWages[${index}].buyWage`}
                                                control={control}
                                                render={({ field }) => (
                                                    <NumericFormat
                                                        {...field}
                                                        thousandSeparator
                                                        decimalScale={addLevelTradeables[index]?.wageType == 'Fixed' ? 0 : 3}
                                                        customInput={TextField}
                                                        type="tel"
                                                        label={addLevelTradeables[index]?.wageType == 'Fixed' ? "گپ قیمت خرید (به تومان)" : "گپ قیمت خرید (به درصد)"}
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        error={!!errors.tradeableWages?.[index]?.buyWage}
                                                        helperText={errors.tradeableWages?.[index]?.buyWage?.message || ''}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            const value = Number(event.target.value.replace(/,/g, ''));
                                                            setAddLevelTradeables(prevState => {
                                                                const updatedWages = [...prevState];
                                                                updatedWages[index] = {
                                                                    ...updatedWages[index],
                                                                    buyWage: value
                                                                }
                                                                return updatedWages;
                                                            });
                                                        }}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                        <FormControl className="w-full">
                                            <Controller
                                                name={`tradeableWages[${index}].sellWage`}
                                                control={control}
                                                render={({ field }) => (
                                                    <NumericFormat
                                                        {...field}
                                                        thousandSeparator
                                                        decimalScale={addLevelTradeables[index]?.wageType == 'Fixed' ? 0 : 3}
                                                        customInput={TextField}
                                                        type="tel"
                                                        label={addLevelTradeables[index]?.wageType == 'Fixed' ? "گپ قیمت فروش (به تومان)" : "گپ قیمت فروش (به درصد)"}
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        error={!!errors.tradeableWages?.[index]?.sellWage}
                                                        helperText={errors.tradeableWages?.[index]?.sellWage?.message || ''}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            const value = Number(event.target.value.replace(/,/g, ''));
                                                            setAddLevelTradeables(prevState => {
                                                                const updatedWages = [...prevState];
                                                                updatedWages[index] = {
                                                                    ...updatedWages[index],
                                                                    sellWage: value
                                                                }
                                                                return updatedWages;
                                                            });
                                                        }}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                    </div>
                                </React.Fragment>
                            ))}
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                        </Collapse>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="dailyMinBuyAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداقل مقدار خرید روزانه (به تومان)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.dailyMinBuyAmount}
                                            helperText={errors.dailyMinBuyAmount ? errors.dailyMinBuyAmount.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'dailyMinBuyAmount', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="dailyMaxBuyAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداکثر مقدار خرید روزانه (به تومان)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.dailyMaxBuyAmount}
                                            helperText={errors.dailyMaxBuyAmount ? errors.dailyMaxBuyAmount.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'dailyMaxBuyAmount', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="dailyMinSellAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداقل مقدار فروش روزانه (به تومان)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.dailyMinSellAmount}
                                            helperText={errors.dailyMinSellAmount ? errors.dailyMinSellAmount.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'dailyMinSellAmount', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="dailyMaxSellAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداکثر مقدار فروش روزانه (به تومان)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.dailyMaxSellAmount}
                                            helperText={errors.dailyMaxSellAmount ? errors.dailyMaxSellAmount.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'dailyMaxSellAmount', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="توضیحات سطح"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    onChange={(event) => {
                                        handleChangeAddData(event, 'description', 'text');
                                    }}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 text-end">
                            <Button type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation>
                                <text className="text-black font-semibold">افزودن سطح</text>
                            </Button>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* EditLevel */}
            <>
                <Dialog onClose={() => setShowEditLevel(false)} open={showEditLevel} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش سطح {levelData?.name}
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowEditLevel(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <section className="grid grid-cols-12 gap-x-4 gap-y-8 py-8">
                        {levelData?.number == 1 ? <Alert
                            severity="error"
                            variant="filled"
                            color="error"
                            className="col-span-12 custom-alert auth error"
                        >
                            <div className="flex flex-col items-baseline md:items-center gap-y-2 md:flex-row md:justify-between">
                                <p className="text-justify m-0">
                                    شماره سطح برای سطح یک عدد 1 می باشد و همچنین مقادیر فیلدهای حداقل در سطح اول برای جلوگیری از مشکل قابل تغییر نیستند و دارای مقدار صفر می باشند.
                                </p>
                            </div>

                        </Alert> : ''}
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="نام سطح"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={levelData?.name}
                                    onChange={handleChangeEditData('name', 'text')} />
                            </FormControl>
                        </div>
                        {levelData?.number != 1 ?
                            <>
                                <div className="col-span-12 md:col-span-6">
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            thousandSeparator
                                            decimalScale={0}
                                            customInput={TextField}
                                            type="tel"
                                            label="شماره سطح"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            value={levelData?.number}
                                            onChange={handleChangeEditData('number', 'numberFormat')} />
                                    </FormControl>
                                </div>
                                {settings.userLeveling == 'Transaction' ?
                                    <>
                                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between text-end m-0"
                                                    control={<CustomSwitch
                                                        checked={editTradesBased}
                                                        onChange={(event) => {
                                                            setEditTradesBased(event.target.checked);
                                                            if (event.target.checked) {
                                                                setLevelData({ ...levelData, minRequiredTradesAmount: levelData?.minRequiredTradesAmount });
                                                            } else {
                                                                setLevelData({ ...levelData, minRequiredTradesAmount: 0 });
                                                            }
                                                        }}
                                                    />}
                                                    label="برحسب حجم معاملات" />
                                            </FormGroup>
                                        </div>
                                        {editTradesBased ? <div className="col-span-12 md:col-span-6">
                                            <FormControl className="w-full">
                                                <NumericFormat
                                                    thousandSeparator
                                                    customInput={TextField}
                                                    type="tel"
                                                    label="حداقل حجم معامله برای ارتقا (به تومان)"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    }}
                                                    value={levelData?.minRequiredTradesAmount}
                                                    onChange={handleChangeEditData('minRequiredTradesAmount', 'numberFormat')} />
                                            </FormControl>
                                        </div> : <div className="col-span-12 md:col-span-6 invisible">
                                            <FormControl className="w-full">
                                                <NumericFormat
                                                    thousandSeparator
                                                    customInput={TextField}
                                                    type="tel"
                                                    label="حداقل حجم معامله برای ارتقا (به تومان)"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    }} />
                                            </FormControl>
                                        </div>}
                                    </> : ''}
                                {settings.userLeveling == 'Referral' ?
                                    <>
                                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between text-end m-0"
                                                    control={<CustomSwitch
                                                        checked={editReferralBased}
                                                        onChange={(event) => {
                                                            setEditReferralBased(event.target.checked);
                                                            if (event.target.checked) {
                                                                setLevelData({ ...levelData, minRequiredReferralCount: levelData?.minRequiredReferralCount });
                                                            } else {
                                                                setLevelData({ ...levelData, minRequiredReferralCount: 0 });
                                                            }
                                                        }}
                                                    />}
                                                    label="برحسب تعداد دعوت" />
                                            </FormGroup>
                                        </div>
                                        {editReferralBased ? <div className="col-span-12 md:col-span-6">
                                            <FormControl className="w-full">
                                                <NumericFormat
                                                    thousandSeparator
                                                    customInput={TextField}
                                                    type="tel"
                                                    label="حداقل تعداد دعوت برای ارتقا"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    }}
                                                    value={levelData?.minRequiredReferralCount}
                                                    onChange={handleChangeEditData('minRequiredReferralCount', 'numberFormat')} />
                                            </FormControl>
                                        </div> : <div className="col-span-12 md:col-span-6 invisible">
                                            <FormControl className="w-full">
                                                <NumericFormat
                                                    thousandSeparator
                                                    customInput={TextField}
                                                    type="tel"
                                                    label="حداقل تعداد دعوت برای ارتقا"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    }} />
                                            </FormControl>
                                        </div>}
                                    </> : ''}
                            </> : ''}
                        <div className="col-span-12 flex items-center gap-x-4 cursor-pointer" onClick={() => setExpand(!expand)}>
                            <span className="whitespace-nowrap">واحدهای قابل معامله</span>
                            <Divider component="div" className="w-[78%] dark:bg-primary dark:bg-opacity-50" />
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`text-primary transition ${expand ? '' : 'rotate-180'}`}>
                                <path d="M12 16.8C11.3 16.8 10.6 16.53 10.07 16L3.55 9.48001C3.26 9.19001 3.26 8.71001 3.55 8.42001C3.84 8.13001 4.32 8.13001 4.61 8.42001L11.13 14.94C11.61 15.42 12.39 15.42 12.87 14.94L19.39 8.42001C19.68 8.13001 20.16 8.13001 20.45 8.42001C20.74 8.71001 20.74 9.19001 20.45 9.48001L13.93 16C13.4 16.53 12.7 16.8 12 16.8Z" fill="currentColor" />
                            </svg>
                        </div>
                        <Collapse in={expand} className="col-span-12 tradeables-collapse">
                            {tradeables?.map((data, index) => (
                                <React.Fragment key={index}>
                                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                                        <FormControl className="w-full">
                                            <TextField
                                                type="text"
                                                label="واحد قابل معامله"
                                                variant="outlined"
                                                className="pointer-events-none"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                value={data.nameFa}
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                                        <MUISelect
                                            type="text"
                                            variant="filled"
                                            color="black"
                                            label="نوع گپ قیمتی"
                                            className="form-select w-full"
                                            value={editLevelTradeables[index]?.wageType}
                                            onChange={(event) => setEditLevelTradeables(prevState => {
                                                const updatedWages = [...prevState];
                                                updatedWages[index] = {
                                                    ...updatedWages[index],
                                                    wageType: event.target.value
                                                }
                                                return updatedWages;
                                            })}
                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                            <MenuItem value="Fixed" >ثابت</MenuItem>
                                            <MenuItem value="Percent" >درصدی</MenuItem>
                                        </MUISelect>
                                    </div>
                                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                                        <FormControl className="w-full">
                                            <NumericFormat
                                                thousandSeparator
                                                decimalScale={editLevelTradeables[index]?.wageType == 'Fixed' ? 0 : 3}
                                                customInput={TextField}
                                                type="tel"
                                                label={editLevelTradeables[index]?.wageType == 'Fixed' ? "گپ قیمت خرید (به تومان)" : "گپ قیمت خرید (به درصد)"}
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                value={editLevelTradeables[index]?.buyWage}
                                                onChange={(event) => {
                                                    const value = Number(event.target.value.replace(/,/g, ''));
                                                    setEditLevelTradeables(prevState => {
                                                        const updatedWages = [...prevState];
                                                        updatedWages[index] = {
                                                            ...updatedWages[index],
                                                            buyWage: event.target.value == '' ? '' : value
                                                        }
                                                        return updatedWages;
                                                    });
                                                }}
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                                        <FormControl className="w-full">
                                            <NumericFormat
                                                thousandSeparator
                                                decimalScale={editLevelTradeables[index]?.wageType == 'Fixed' ? 0 : 3}
                                                customInput={TextField}
                                                type="tel"
                                                label={editLevelTradeables[index]?.wageType == 'Fixed' ? "گپ قیمت فروش (به تومان)" : "گپ قیمت فروش (به درصد)"}
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                value={editLevelTradeables[index]?.sellWage}
                                                onChange={(event) => {
                                                    const value = Number(event.target.value.replace(/,/g, ''));
                                                    setEditLevelTradeables(prevState => {
                                                        const updatedWages = [...prevState];
                                                        updatedWages[index] = {
                                                            ...updatedWages[index],
                                                            sellWage: event.target.value == '' ? '' : value
                                                        }
                                                        return updatedWages;
                                                    });
                                                }}
                                            />
                                        </FormControl>
                                    </div>
                                </React.Fragment>
                            ))}
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                        </Collapse>
                        {levelData?.number != 1 ? <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    customInput={TextField}
                                    type="tel"
                                    label="حداقل مقدار خرید روزانه (به تومان)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={levelData?.dailyMinBuyAmount}
                                    onChange={handleChangeEditData('dailyMinBuyAmount', 'numberFormat')} />
                            </FormControl>
                        </div> : ''}
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    customInput={TextField}
                                    type="tel"
                                    label="حداکثر مقدار خرید روزانه (به تومان)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={levelData?.dailyMaxBuyAmount}
                                    onChange={handleChangeEditData('dailyMaxBuyAmount', 'numberFormat')} />
                            </FormControl>
                        </div>
                        {levelData?.number != 1 ? <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    customInput={TextField}
                                    type="tel"
                                    label="حداقل مقدار فروش روزانه (به تومان)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={levelData?.dailyMinSellAmount}
                                    onChange={handleChangeEditData('dailyMinSellAmount', 'numberFormat')} />
                            </FormControl>
                        </div> : ''}
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    customInput={TextField}
                                    type="tel"
                                    label="حداکثر مقدار فروش روزانه (به تومان)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={levelData?.dailyMaxSellAmount}
                                    onChange={handleChangeEditData('dailyMaxSellAmount', 'numberFormat')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="توضیحات سطح"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={levelData?.description}
                                    onChange={handleChangeEditData('description', 'text')} />
                            </FormControl>
                        </div>
                    </section>
                    <div className="text-end">
                        <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                            onClick={editLevel(levelData?._id)}>
                            <text className="text-black font-semibold">ویرایش سطح</text>
                        </LoadingButton>
                    </div>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomEditLevelDrawer}
                    onClose={() => setOpenBottomEditLevelDrawer(false)}
                    PaperProps={{ className: 'drawers', sx: { height: '80%' } }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش سطح {levelData?.name}
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomEditLevelDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <section className="grid grid-cols-12 gap-x-4 gap-y-8 py-8">
                        {levelData?.number == 1 ? <Alert
                            severity="error"
                            variant="filled"
                            color="error"
                            className="col-span-12 custom-alert auth error"
                        >
                            <div className="flex flex-col items-baseline md:items-center gap-y-2 md:flex-row md:justify-between w-full">
                                <p className="text-justify m-0">
                                    شماره سطح برای سطح یک عدد 1 می باشد و همچنین مقادیر فیلدهای حداقل در سطح اول برای جلوگیری از مشکل قابل تغییر نیستند و دارای مقدار صفر می باشند.
                                </p>
                            </div>

                        </Alert> : ''}
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="نام سطح"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={levelData?.name}
                                    onChange={handleChangeEditData('name', 'text')} />
                            </FormControl>
                        </div>
                        {levelData?.number != 1 ?
                            <>
                                <div className="col-span-12">
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            thousandSeparator
                                            decimalScale={0}
                                            customInput={TextField}
                                            type="tel"
                                            label="شماره سطح"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            value={levelData?.number}
                                            onChange={handleChangeEditData('number', 'numberFormat')} />
                                    </FormControl>
                                </div>
                                {settings.userLeveling == 'Transaction' ?
                                    <>
                                        <div className="col-span-12 w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between text-end m-0"
                                                    control={<CustomSwitch
                                                        checked={editTradesBased}
                                                        onChange={(event) => {
                                                            setEditTradesBased(event.target.checked);
                                                            if (event.target.checked) {
                                                                setLevelData({ ...levelData, minRequiredTradesAmount: levelData?.minRequiredTradesAmount });
                                                            } else {
                                                                setLevelData({ ...levelData, minRequiredTradesAmount: 0 });
                                                            }
                                                        }}
                                                    />}
                                                    label="برحسب حجم معاملات" />
                                            </FormGroup>
                                        </div>
                                        {editTradesBased ? <div className="col-span-12">
                                            <FormControl className="w-full">
                                                <NumericFormat
                                                    thousandSeparator
                                                    customInput={TextField}
                                                    type="tel"
                                                    label="حداقل حجم معامله برای ارتقا (به تومان)"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    }}
                                                    value={levelData?.minRequiredTradesAmount}
                                                    onChange={handleChangeEditData('minRequiredTradesAmount', 'numberFormat')} />
                                            </FormControl>
                                        </div> : <div className="col-span-12 invisible">
                                            <FormControl className="w-full">
                                                <NumericFormat
                                                    thousandSeparator
                                                    customInput={TextField}
                                                    type="tel"
                                                    label="حداقل حجم معامله برای ارتقا (به تومان)"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    }} />
                                            </FormControl>
                                        </div>}
                                    </> : ''}
                                {settings.userLeveling == 'Referral' ?
                                    <>
                                        <div className="col-span-12 w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between text-end m-0"
                                                    control={<CustomSwitch
                                                        checked={editReferralBased}
                                                        onChange={(event) => {
                                                            setEditReferralBased(event.target.checked);
                                                            if (event.target.checked) {
                                                                setLevelData({ ...levelData, minRequiredReferralCount: levelData?.minRequiredReferralCount });
                                                            } else {
                                                                setLevelData({ ...levelData, minRequiredReferralCount: 0 });
                                                            }
                                                        }}
                                                    />}
                                                    label="برحسب تعداد دعوت" />
                                            </FormGroup>
                                        </div>
                                        {editReferralBased ? <div className="col-span-12">
                                            <FormControl className="w-full">
                                                <NumericFormat
                                                    thousandSeparator
                                                    customInput={TextField}
                                                    type="tel"
                                                    label="حداقل تعداد دعوت برای ارتقا"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    }}
                                                    value={levelData?.minRequiredReferralCount}
                                                    onChange={handleChangeEditData('minRequiredReferralCount', 'numberFormat')} />
                                            </FormControl>
                                        </div> : <div className="col-span-12 invisible">
                                            <FormControl className="w-full">
                                                <NumericFormat
                                                    thousandSeparator
                                                    customInput={TextField}
                                                    type="tel"
                                                    label="حداقل تعداد دعوت برای ارتقا"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    }} />
                                            </FormControl>
                                        </div>}
                                    </> : ''}
                            </> : ''}
                        <div className="col-span-12 flex items-center gap-x-4 cursor-pointer" onClick={() => setExpand(!expand)}>
                            <span className="whitespace-nowrap">واحدهای قابل معامله</span>
                            <Divider component="div" className="w-[55%] md:w-[74%] dark:bg-primary dark:bg-opacity-50" />
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`text-primary transition ${expand ? '' : 'rotate-180'}`}>
                                <path d="M12 16.8C11.3 16.8 10.6 16.53 10.07 16L3.55 9.48001C3.26 9.19001 3.26 8.71001 3.55 8.42001C3.84 8.13001 4.32 8.13001 4.61 8.42001L11.13 14.94C11.61 15.42 12.39 15.42 12.87 14.94L19.39 8.42001C19.68 8.13001 20.16 8.13001 20.45 8.42001C20.74 8.71001 20.74 9.19001 20.45 9.48001L13.93 16C13.4 16.53 12.7 16.8 12 16.8Z" fill="currentColor" />
                            </svg>
                        </div>
                        <Collapse in={expand} className="col-span-12 tradeables-collapse">
                            {tradeables?.map((data, index) => (
                                <React.Fragment key={index}>
                                    <div className="col-span-12 md:col-span-6">
                                        <FormControl className="w-full">
                                            <TextField
                                                type="text"
                                                label="واحد قابل معامله"
                                                variant="outlined"
                                                className="pointer-events-none"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                value={data.nameFa}
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                        <MUISelect
                                            type="text"
                                            variant="filled"
                                            color="black"
                                            label="نوع گپ قیمتی"
                                            className="form-select w-full"
                                            value={editLevelTradeables[index]?.wageType}
                                            onChange={(event) => setEditLevelTradeables(prevState => {
                                                const updatedWages = [...prevState];
                                                updatedWages[index] = {
                                                    ...updatedWages[index],
                                                    wageType: event.target.value
                                                }
                                                return updatedWages;
                                            })}
                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                            <MenuItem value="Fixed" >ثابت</MenuItem>
                                            <MenuItem value="Percent" >درصدی</MenuItem>
                                        </MUISelect>
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                        <FormControl className="w-full">
                                            <NumericFormat
                                                thousandSeparator
                                                decimalScale={editLevelTradeables[index]?.wageType == 'Fixed' ? 0 : 3}
                                                customInput={TextField}
                                                type="tel"
                                                label={editLevelTradeables[index]?.wageType == 'Fixed' ? "گپ قیمت خرید (به تومان)" : "گپ قیمت خرید (به درصد)"}
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                value={editLevelTradeables[index]?.buyWage}
                                                onChange={(event) => {
                                                    const value = Number(event.target.value.replace(/,/g, ''));
                                                    setEditLevelTradeables(prevState => {
                                                        const updatedWages = [...prevState];
                                                        updatedWages[index] = {
                                                            ...updatedWages[index],
                                                            buyWage: event.target.value == '' ? '' : value
                                                        }
                                                        return updatedWages;
                                                    });
                                                }}
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                        <FormControl className="w-full">
                                            <NumericFormat
                                                thousandSeparator
                                                decimalScale={editLevelTradeables[index]?.wageType == 'Fixed' ? 0 : 3}
                                                customInput={TextField}
                                                type="tel"
                                                label={editLevelTradeables[index]?.wageType == 'Fixed' ? "گپ قیمت فروش (به تومان)" : "گپ قیمت فروش (به درصد)"}
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                value={editLevelTradeables[index]?.sellWage}
                                                onChange={(event) => {
                                                    const value = Number(event.target.value.replace(/,/g, ''));
                                                    setEditLevelTradeables(prevState => {
                                                        const updatedWages = [...prevState];
                                                        updatedWages[index] = {
                                                            ...updatedWages[index],
                                                            sellWage: event.target.value == '' ? '' : value
                                                        }
                                                        return updatedWages;
                                                    });
                                                }}
                                            />
                                        </FormControl>
                                    </div>
                                </React.Fragment>
                            ))}
                            <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                        </Collapse>
                        {levelData?.number != 1 ? <div className="col-span-12">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    customInput={TextField}
                                    type="tel"
                                    label="حداقل مقدار خرید روزانه (به تومان)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={levelData?.dailyMinBuyAmount}
                                    onChange={handleChangeEditData('dailyMinBuyAmount', 'numberFormat')} />
                            </FormControl>
                        </div> : ''}
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    customInput={TextField}
                                    type="tel"
                                    label="حداکثر مقدار خرید روزانه (به تومان)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={levelData?.dailyMaxBuyAmount}
                                    onChange={handleChangeEditData('dailyMaxBuyAmount', 'numberFormat')} />
                            </FormControl>
                        </div>
                        {levelData?.number != 1 ? <div className="col-span-12">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    customInput={TextField}
                                    type="tel"
                                    label="حداقل مقدار فروش روزانه (به تومان)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={levelData?.dailyMinSellAmount}
                                    onChange={handleChangeEditData('dailyMinSellAmount', 'numberFormat')} />
                            </FormControl>
                        </div> : ''}
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    customInput={TextField}
                                    type="tel"
                                    label="حداکثر مقدار فروش روزانه (به تومان)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={levelData?.dailyMaxSellAmount}
                                    onChange={handleChangeEditData('dailyMaxSellAmount', 'numberFormat')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="توضیحات سطح"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={levelData?.description}
                                    onChange={handleChangeEditData('description', 'text')} />
                            </FormControl>
                        </div>
                    </section>
                    <div className="text-end">
                        <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                            onClick={editLevel(levelData?._id)}>
                            <text className="text-black font-semibold">ویرایش سطح</text>
                        </LoadingButton>
                    </div>
                </SwipeableDrawer>
            </>

            {/* ChangeOrderbookStatus */}
            <>
                <Dialog onClose={() => setShowChangeOrderbookStatusDialog(false)} open={showChangeOrderbookStatusDialog} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'}>تغییر وضعیت معاملات پیشرفته برای همه کاربران</Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
                        <div className="col-span-12">
                            <MUISelect
                                type="text"
                                variant="filled"
                                color="black"
                                label="انتخاب وضعیت"
                                className="form-select w-full"
                                value={orderbookStatus}
                                onChange={(event) => setOrderbookStatus(event.target.value)}
                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                <MenuItem value={true} >فعالسازی</MenuItem>
                                <MenuItem value={false} >غیرفعالسازی</MenuItem>
                            </MUISelect>
                        </div>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setShowChangeOrderbookStatusDialog(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={changeOrderbookStatusLoading}
                                onClick={changeOrderbookStatus(orderbookStatus)}>
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
                    open={openBottomChangeOrderbookStatusDrawer}
                    onClose={() => setOpenBottomChangeOrderbookStatusDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'}>تغییر وضعیت معاملات پیشرفته برای همه کاربران</Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
                        <div className="col-span-12">
                            <MUISelect
                                type="text"
                                variant="filled"
                                color="black"
                                label="انتخاب وضعیت"
                                className="form-select w-full"
                                value={orderbookStatus}
                                onChange={(event) => setOrderbookStatus(event.target.value)}
                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                <MenuItem value={true} >فعالسازی</MenuItem>
                                <MenuItem value={false} >غیرفعالسازی</MenuItem>
                            </MUISelect>
                        </div>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setOpenBottomChangeOrderbookStatusDrawer(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={changeOrderbookStatusLoading}
                                onClick={changeOrderbookStatus(orderbookStatus)}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

        </div>
    )
}

export default SettingsPageCompo;