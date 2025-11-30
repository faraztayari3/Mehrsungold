import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
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
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import RefreshIcon from '@mui/icons-material/Refresh'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Pagination from '@mui/material/Pagination';
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import MUISelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import CancelIcon from '@mui/icons-material/CancelOutlined';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import moment from 'jalali-moment'
import DatePicker from "react-datepicker2"

import { NumericFormat, PatternFormat } from 'react-number-format';
import { useQRCode } from 'next-qrcode'

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
import ConvertText from "../../services/convertPersianToEnglish";
import FilterEmptyFields from "../../services/filterEmptyFields"
import FilterObjectFields from "../../services/filterObjectFields"
import LogActions from "../../services/logActions"
import CopyData from "../../services/copy"

// Components
import CustomSwitch from "../shared/CustomSwitch"
import ConfirmDialog from '../shared/ConfirmDialog';

/**
 * UserSinglePageCompo component that displays the UserSingle Page Component of the website.
 * @returns The rendered UserSingle Page component.
 */
const UserSinglePageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, siteInfo, adminInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { Image } = useQRCode();

    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);
    const [firstLoading, setFirstLoading] = useState(true);
    useEffect(() => {
        if (router.query?.id) {
            getUserInformation();
            getTransactions('OnlineDeposit', 1);
        }
    }, [router.query?.id]);

    /**
         * Retrieves User Info for the user.
         * @returns None
        */
    const [userInfo, setUserInfo] = useState(null);
    const [mobile, setMobile] = useState('');
    const [userLoading, setUserLoading] = useState(true);
    const [userAuthStatus, setUserAuthStatus] = useState('');
    const [userRoleStatus, setUserRoleStatus] = useState('User');
    const getUserInformation = () => {
        setUserLoading(true);
        ApiCall('/user', 'GET', locale, {}, `id=${router.query?.id}`, 'admin', router).then(async (result) => {
            setUserInfo(result.data[0] || null);
            setUserData(result.data[0] || null);
            setUserAuthStatus(result.data[0]?.verificationStatus);
            setMobile(result.data[0]?.mobileNumber || '');
            setUserRoleStatus(result.data[0]?.role || 'User');
            setUserLoading(false);
        }).catch((error) => {
            setUserLoading(false);
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
                nationalCode: userData?.nationalCode,
                birthDate: userData?.birthDate
            });
            body = { ...newData };
        } else {
            let newData = FilterEmptyFields(userData);
            const filteredData = FilterObjectFields(newData, [
                "mobileNumber",
                "password",
                "firstName",
                "lastName",
                "sex",
                "nationalCode",
                "birthDate",
                "verificationStatus",
                "isActive",
                "orderBookIsActive"
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

    /**
    * change Status for a User.
    * @returns None
   */
    const [changeStatusUserLoading, setChangeStatusUserLoading] = useState(false);
    const changeStatusUser = (userId, isActive) => (event) => {
        event.preventDefault();
        setChangeStatusUserLoading(true);
        event.target.disabled = true;
        ApiCall(`/user/${userId}`, 'PATCH', locale, { isActive }, '', 'admin', router).then(async (result) => {
            event.target.disabled = false;
            setChangeStatusUserLoading(false);
            getUserInformation();
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setChangeStatusUserLoading(false);
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

    const [openDialog, setOpenDialog] = useState(false);
    const [userId, setUserId] = useState('');
    const handleOpenDialog = (userId) => (event) => {
        setUserId(userId);
        setOpenDialog(true);
    }
    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    /**
        * Delete a User.
        * @returns None
    */
    const [deleteLoading, setDeleteLoading] = useState(false);
    const deleteUser = () => {
        setDeleteLoading(true);
        ApiCall(`/user/${userId}`, 'DELETE', locale, {}, '', 'admin', router).then(async (result) => {
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
            setDeleteLoading(false);
            setUserId('');
            router.push('/admin/panel/users', '/admin/panel/users', { locale });
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
        * Retrieves Transactions.
        * @returns None
       */
    const [pageItem, setPageItem] = useState(1);
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [transactionsLimit, settransactionsLimit] = useState(10);
    const [transactionsTotal, setTransactionsTotal] = useState(0);
    const getTrades = (page) => {
        setLoadingTransactions(true);
        ApiCall('/transaction', 'GET', locale, {}, `userId=${router.query?.id}&limit=${transactionsLimit}&skip=${(page * transactionsLimit) - transactionsLimit}`, 'admin', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setTransactions(result.data);
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }
    const getTransactions = (type, page) => {
        setLoadingTransactions(true);
        ApiCall('/balance-transaction', 'GET', locale, {}, `userId=${router.query?.id}&sortOrder=0&sortBy=createdAt&type=${type}&limit=${transactionsLimit}&skip=${(page * transactionsLimit) - transactionsLimit}`, 'admin', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setTransactions(result.data);
            setLoadingTransactions(false);
            setFirstLoading(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            setFirstLoading(false);
            console.log(error);
        });
    }
    const getOrderbooks = (page) => {
        setLoadingTransactions(true);
        ApiCall('/order-book', 'GET', locale, {}, `userId=${router.query?.id}&sortOrder=0&sortBy=createdAt&limit=${transactionsLimit}&skip=${(page * transactionsLimit) - transactionsLimit}`, 'admin', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setTransactions(result.data);
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }
    const getTomanLogs = (page) => {
        setLoadingTransactions(true);
        ApiCall(`/user/balance-log/${router.query?.id}`, 'GET', locale, {}, `limit=${transactionsLimit}&skip=${(page * transactionsLimit) - transactionsLimit}`, 'admin', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setTransactions(result.data);
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }

    /**
        * Retrieves Cards.
        * @returns None
       */
    const [cards, setCards] = useState([]);
    const getBankAccounts = (page) => {
        setLoadingTransactions(true);
        ApiCall('/user/card', 'GET', locale, {}, `userId=${router.query?.id}&limit=${transactionsLimit}&skip=${(page * transactionsLimit) - transactionsLimit}`, 'admin', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setCards(result.data);
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }

    const [transfers, setTransfers] = useState([]);
    const getTransfers = (page) => {
        setLoadingTransactions(true);
        ApiCall('/tradeable/transfer', 'GET', locale, {}, `senderUserId=${router.query?.id}&limit=${transactionsLimit}&skip=${(page * transactionsLimit) - transactionsLimit}`, 'admin', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setTransfers(result.data);
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }

    const [inviteds, setInviteds] = useState([]);
    const getUserInvites = (page) => {
        setLoadingTransactions(true);
        ApiCall('/user', 'GET', locale, {}, `roles=User&roles=VIPUser&sortOrder=0&sortBy=createdAt&referrerId=${router.query?.id}&limit=${transactionsLimit}&skip=${(page * transactionsLimit) - transactionsLimit}`, 'admin', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setInviteds(result.data);
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }

    /**
        * Retrieves Tradeables Balances.
        * @returns None
       */
    const [tradeablesInventories, setTradeablesInventories] = useState([]);
    const getTradeablesInventories = (page) => {
        setLoadingTransactions(true);
        ApiCall('/tradeable/user-inventory', 'GET', locale, {}, `userId=${router.query?.id}&limit=${transactionsLimit}&skip=${(page * transactionsLimit) - transactionsLimit}`, 'admin', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setTradeablesInventories(result.data);
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }

    const getGiftcardsOrders = (page) => {
        setLoadingTransactions(true);
        ApiCall('/gift-card', 'GET', locale, {}, `createdBy=${router.query?.id}&sortOrder=0&sortBy=createdAt&limit=${transactionsLimit}&skip=${(page * transactionsLimit) - transactionsLimit}`, 'admin', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setTransactions(result.data);
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }

    const openInNewTab = (index) => () => {
        const imgElement = document.querySelector(`div#qrcode${index} img`);
        const imgSrc = imgElement.src;

        const newWindow = window.open();
        newWindow.document.body.innerHTML = `<img src="${imgSrc}" alt="QR Code" />`;
    }

    const [tabValue, setTabValue] = useState(0);
    const handleChange = (newTabValue) => (event) => {
        setTabValue(newTabValue);
        setPageItem(1);
        if (newTabValue == 0) {
            getTransactions('OnlineDeposit', 1);
        } else if (newTabValue == 1) {
            getTransactions('OfflineDeposit', 1);
        } else if (newTabValue == 2) {
            getTransactions('Withdraw', 1);
        } else if (newTabValue == 3) {
            getTrades(1);
        } else if (newTabValue == 4) {
            getBankAccounts(1);
        } else if (newTabValue == 5) {
            getProductsRequests(1);
        } else if (newTabValue == 6) {
            getTradeablesInventories(1);
        } else if (newTabValue == 7) {
            getOrderbooks(1);
        } else if (newTabValue == 8) {
            getTransfers(1);
        } else if (newTabValue == 9) {
            getTransactions('IdDeposit', 1);
        } else if (newTabValue == 10) {
            getTomanLogs(1);
        } else if (newTabValue == 11) {
            getUserInvites(1);
        } else if (newTabValue == 12) {
            getGiftcardsOrders(1);
        }
    }

    const handlePageChange = (event, value) => {
        setPageItem(value);
        if (tabValue == 0) {
            getTransactions('OnlineDeposit', value);
        } else if (tabValue == 1) {
            getTransactions('OfflineDeposit', value);
        } else if (tabValue == 2) {
            getTransactions('Withdraw', value);
        } else if (tabValue == 3) {
            getTrades(value);
        } else if (tabValue == 4) {
            getBankAccounts(value);
        } else if (tabValue == 5) {
            getProductsRequests(value);
        } else if (tabValue == 6) {
            getTradeablesInventories(value);
        } else if (tabValue == 7) {
            getOrderbooks(value);
        } else if (tabValue == 8) {
            getTransfers(value);
        } else if (tabValue == 9) {
            getTransactions('IdDeposit', value);
        } else if (tabValue == 10) {
            getTomanLogs(value);
        } else if (tabValue == 11) {
            getUserInvites(value);
        } else if (tabValue == 12) {
            getGiftcardsOrders(value);
        }
    }

    /**
        * Retrieves Products Requests.
        * @returns None
       */
    const [requests, setRequests] = useState([]);
    const getProductsRequests = (page) => {
        setLoadingTransactions(true);
        ApiCall('/product-request', 'GET', locale, {}, `userId=${router.query?.id}&sortOrder=0&sortBy=createdAt&limit=${transactionsLimit}&skip=${(page * transactionsLimit) - transactionsLimit}`, 'admin', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setRequests(result.data);
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }

    const [showChangeAuthStatusDialog, setShowChangeAuthStatusDialog] = useState(false);
    const [openBottomChangeAuthStatusDrawer, setOpenBottomChangeAuthStatusDrawer] = useState(false);
    const handleShowChangeAuthStatusDialog = () => {
        if (window.innerWidth >= 1024) {
            setShowChangeAuthStatusDialog(true);
            setOpenBottomChangeAuthStatusDrawer(false);
        } else {
            setShowChangeAuthStatusDialog(false);
            setOpenBottomChangeAuthStatusDrawer(true);
        }
    }

    const [showChangeUserRoleStatusDialog, setShowChangeUserRoleStatusDialog] = useState(false);
    const [openBottomChangeUserRoleStatusDrawer, setOpenBottomChangeUserRoleStatusDrawer] = useState(false);
    const handleShowChangeUserRoleStatusDialog = () => {
        if (window.innerWidth >= 1024) {
            setShowChangeUserRoleStatusDialog(true);
            setOpenBottomChangeUserRoleStatusDrawer(false);
        } else {
            setShowChangeUserRoleStatusDialog(false);
            setOpenBottomChangeUserRoleStatusDrawer(true);
        }
    }

    const [showChangeTomanBalanceDialog, setShowChangeTomanBalanceDialog] = useState(false);
    const [openBottomChangeTomanBalanceDrawer, setOpenBottomChangeTomanBalanceDrawer] = useState(false);
    const handleShowChangeTomanBalanceDialog = () => {
        if (window.innerWidth >= 1024) {
            setShowChangeTomanBalanceDialog(true);
            setOpenBottomChangeTomanBalanceDrawer(false);
        } else {
            setShowChangeTomanBalanceDialog(false);
            setOpenBottomChangeTomanBalanceDrawer(true);
        }
    }

    /**
     * Change User Auth.
     * @returns None
    */
    const [changeAuthStatusLoading, setChangeAuthStatusLoading] = useState(false);
    const changeUserAuthStatus = (userId) => (event) => {
        event.preventDefault();
        setChangeAuthStatusLoading(true);
        event.target.disabled = true;
        ApiCall(`/user/${userId}`, 'PATCH', locale, { verificationStatus: userAuthStatus }, '', 'admin', router).then(async (result) => {
            event.target.disabled = false;
            setChangeAuthStatusLoading(false);
            getUserInformation();
            setShowChangeAuthStatusDialog(false);
            setOpenBottomChangeAuthStatusDrawer(false);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setChangeAuthStatusLoading(false);
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
     * Change User Role.
     * @returns None
    */
    const [changeRoleStatusLoading, setChangeRoleStatusLoading] = useState(false);
    const changeUserRoleStatus = (userId) => (event) => {
        event.preventDefault();
        setChangeRoleStatusLoading(true);
        event.target.disabled = true;
        ApiCall(`/user/${userId}/change-role`, 'PATCH', locale, { role: userRoleStatus }, '', 'admin', router).then(async (result) => {
            event.target.disabled = false;
            setChangeRoleStatusLoading(false);
            getUserInformation();
            setShowChangeUserRoleStatusDialog(false);
            setOpenBottomChangeUserRoleStatusDrawer(false);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setChangeRoleStatusLoading(false);
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

    const [showInquiryDialog, setShowInquiryDialog] = useState(false);
    const [openBottomInquiryDrawer, setOpenBottomInquiryDrawer] = useState(false);
    const handleInquiry = () => {
        if (window.innerWidth >= 1024) {
            setShowInquiryDialog(true);
            setOpenBottomInquiryDrawer(false);
        } else {
            setShowInquiryDialog(false);
            setOpenBottomInquiryDrawer(true);
        }
    }

    const [error, setError] = useState(false);
    const handleChangeMobile = (event) => {
        const inputNumber = ConvertText(event.value);
        if (inputNumber == '') {
            setMobile('');
        } else {
            setMobile(`${inputNumber.startsWith("0") ? inputNumber : `0${inputNumber}`}`);
        }

        if (inputNumber.length == 11) {
            setError(false);
        } else {
            setError(true);
        }
    }

    /**
     * Handles the send new mobile number event when the user submits the form.
     * @param {{Event}} event - The event object.
     * @returns None
     */
    const [inquiryLoading, setInquiryLoading] = useState(false);
    const sendMobile = (event) => {
        event.preventDefault();
        if (userInfo?.nationalCode) {
            if (mobile.length == 11) {
                setInquiryLoading(true);
                event.target.disabled = true;
                ApiCall('/user/mobile-number/inquiry', 'POST', locale, { userId: userInfo?._id, mobileNumber: mobile }, '', 'admin', router).then(async (result) => {
                    event.target.disabled = false;
                    setInquiryLoading(false);
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: 'شماره موبایل با کد ملی کاربر تطابق دارد',
                            type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                }).catch((error) => {
                    console.log(error);
                    setInquiryLoading(false);
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
        } else {
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: 'برای استعلام ابتدا کد ملی کاربر را در ویرایش اطلاعات وارد کنید',
                    type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }
    }

    /**
         * Retrieves Tradeables list.
         * @returns None
        */
    const [tradeables, setTradeables] = useState([]);
    const [loadingTradeables, setLoadingTradeables] = useState(true);
    const getTradeables = () => {
        setLoadingTradeables(true);
        ApiCall('/tradeable', 'GET', locale, {}, ``, 'admin', router).then(async (result) => {
            setTradeables(result.data);
            setLoadingTradeables(false);
        }).catch((error) => {
            setLoadingTradeables(false);
            console.log(error);
        });
    }

    /**
        * Retrieves Tradeable User Balance.
        * @returns None
       */
    const [loadingBalance, setLoadingBalance] = useState(false);
    const getTradeableInventory = (tradeable) => {
        setLoadingBalance(true);
        ApiCall('/tradeable/user-inventory', 'GET', locale, {}, `userId=${router.query?.id}`, 'admin', router).then(async (result) => {
            const userInventories = result.data || [];
            const inventory = userInventories?.filter(inventory => inventory.tradeable?._id === tradeable);
            const updatedBalance = inventory && inventory?.length > 0 ? inventory[0]?.balance : 0;
            setChargeData({ ...chargeData, tradeableId: tradeable, balance: updatedBalance });
            setValue('balance', updatedBalance);
            setLoadingBalance(false);
        }).catch((error) => {
            setLoadingBalance(false);
            console.log(error);
        });
    }

    const [showChargeWallet, setShowChargeWallet] = useState(false);
    const [openBottomChargeWalletDrawer, setOpenBottomChargeWalletDrawer] = useState(false);
    const handleChargeWallet = (event) => {
        event.preventDefault();
        getTradeables();
        if (window.innerWidth >= 1024) {
            setShowChargeWallet(true);
            setOpenBottomChargeWalletDrawer(false);
        } else {
            setShowChargeWallet(false);
            setOpenBottomChargeWalletDrawer(true);
        }
    }

    const [chargeData, setChargeData] = useState(
        {
            balance: '',
            tradeableId: ''
        }
    )
    const validationSchema = Yup.object().shape({
        balance: Yup.string().required('این فیلد الزامی است'),
        tradeableId: Yup.string().required('این فیلد الزامی است'),
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema)
    });

    const clearForm = () => {
        setValue('amount', '');
        setValue('tradeableId', '');
    }

    /**
     * Handles charge tradeable balance for the user.
     * @returns None
     */
    const [chargeLoading, setChargeLoading] = useState(false);
    const chargeUserTradeable = () => {
        setChargeLoading(true);
        ApiCall(`/tradeable/user-inventory/${router.query?.id}`, 'PATCH', locale, { ...chargeData }, '', 'admin', router).then(async (result) => {
            setChargeLoading(false);
            setShowChargeWallet(false);
            setOpenBottomChargeWalletDrawer(false);
            setChargeData();
            clearForm({
                balance: '',
                tradeableId: ''
            });
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            console.log(error);
            setChargeLoading(false);
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

    const [itemData, setItemData] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [openBottomRejectDrawer, setOpenBottomRejectDrawer] = useState(false);
    const handleShowReject = (data) => (event) => {
        event.stopPropagation();
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
     * Add or Minus Toman Balance.
     * @returns None
    */
    const [balanceData, setBalanceData] = useState({
        changeAmount: 0,
        description: ''
    });
    const [isLoss, setIsLoss] = useState('Add');
    const [changeAmount, setChangeAmount] = useState(0);
    const changeTomanBalance = () => {
        if (changeAmount > 0) {
            setLoading(true);
            let newData = FilterEmptyFields(balanceData);
            ApiCall(`/user/${router.query?.id}/balance`, 'PATCH', locale, { ...newData }, '', 'admin', router).then(async (result) => {
                setLoading(false);
                getUserInformation();
                setShowChangeTomanBalanceDialog(false);
                setOpenBottomChangeTomanBalanceDrawer(false);
                setBalanceData({
                    changeAmount: 0,
                    description: ''
                });
                setIsLoss('Add');
                setChangeAmount(0);
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
    }

    return (
        <div className="xl:max-w-[55rem] xl:mx-auto">
            {userLoading ?
                <div className="h-[400px] flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> :
                userInfo ?
                    <section>
                        <div className="flex items-center justify-between">
                            <h1 className="text-large-3 mb-6">اطلاعات کاربر <span>{userInfo?.firstName && userInfo?.lastName ? `${userInfo?.firstName || ''} ${userInfo?.lastName || ''}` : `(${userInfo?.mobileNumber || ''})`}</span></h1>
                            <IconButton
                                color={`${darkModeToggle ? 'white' : 'black'}`}
                                onClick={handleRefresh}>
                                <RefreshIcon />
                            </IconButton>
                        </div>
                        <div className="h-full custom-card flex flex-col lg:flex-row items-start justify-between gap-y-3 rounded-2xl p-5">
                            <div className="flex flex-col gap-y-4 w-full h-full">
                                <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                    <span>نام و نام خانوادگی:</span>
                                    <span>{`${userInfo?.firstName || ''} ${userInfo?.lastName || ''}`}</span>
                                </div>
                                <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                    <span>کدملی:</span>
                                    <PatternFormat displayType="text" value={userInfo?.nationalCode} format="### ### ## ##" dir="ltr" />
                                </div>
                                <div className="flex items-center justify-between gap-x-8">
                                    <span>شماره تلفن همراه:</span>
                                    <div className="flex items-center gap-x-1 dark:text-white">
                                        <PatternFormat displayType="text" value={userInfo?.mobileNumber} format="#### ### ## ##" dir="ltr" />
                                        {siteInfo?.onlineFirstStepUserVerifyEnabled ? <ButtonBase onClick={handleInquiry}>
                                            <Chip label="استعلام" variant="outlined" size="small" className="badge badge-primary px-4 !py-0" />
                                        </ButtonBase> : ''}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-x-8">
                                    <span>تاریخ تولد:</span>
                                    <span>{moment(moment(userInfo?.birthDate).format("YYYY-MM-DD"), 'YYYY-MM-DD')
                                        .locale('fa')
                                        .format('jYYYY/jMM/jDD')}</span>
                                </div>
                                <div className="flex items-center justify-between gap-x-8">
                                    <span>تعداد نفرات دعوت شده:</span>
                                    <span>{(userInfo?.referralCount || 0)} نفر</span>
                                </div>
                                <div className="flex items-center justify-between gap-x-8">
                                    <span>موجودی تومان:</span>
                                    <div className="flex items-center gap-x-1 dark:text-white">
                                        {(userInfo?.tomanBalance || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان
                                        {adminInfo?.role == 'SuperAdmin' ? <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={handleShowChangeTomanBalanceDialog}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                                                <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H11C11.41 1.25 11.75 1.59 11.75 2C11.75 2.41 11.41 2.75 11 2.75H9C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V13C21.25 12.59 21.59 12.25 22 12.25C22.41 12.25 22.75 12.59 22.75 13V15C22.75 20.43 20.43 22.75 15 22.75Z" fill="currentColor" />
                                                <path d="M8.50008 17.6901C7.89008 17.6901 7.33008 17.4701 6.92008 17.0701C6.43008 16.5801 6.22008 15.8701 6.33008 15.1201L6.76008 12.1101C6.84008 11.5301 7.22008 10.7801 7.63008 10.3701L15.5101 2.49006C17.5001 0.500059 19.5201 0.500059 21.5101 2.49006C22.6001 3.58006 23.0901 4.69006 22.9901 5.80006C22.9001 6.70006 22.4201 7.58006 21.5101 8.48006L13.6301 16.3601C13.2201 16.7701 12.4701 17.1501 11.8901 17.2301L8.88008 17.6601C8.75008 17.6901 8.62008 17.6901 8.50008 17.6901ZM16.5701 3.55006L8.69008 11.4301C8.50008 11.6201 8.28008 12.0601 8.24008 12.3201L7.81008 15.3301C7.77008 15.6201 7.83008 15.8601 7.98008 16.0101C8.13008 16.1601 8.37008 16.2201 8.66008 16.1801L11.6701 15.7501C11.9301 15.7101 12.3801 15.4901 12.5601 15.3001L20.4401 7.42006C21.0901 6.77006 21.4301 6.19006 21.4801 5.65006C21.5401 5.00006 21.2001 4.31006 20.4401 3.54006C18.8401 1.94006 17.7401 2.39006 16.5701 3.55006Z" fill="currentColor" />
                                                <path d="M19.8501 9.83003C19.7801 9.83003 19.7101 9.82003 19.6501 9.80003C17.0201 9.06003 14.9301 6.97003 14.1901 4.34003C14.0801 3.94003 14.3101 3.53003 14.7101 3.41003C15.1101 3.30003 15.5201 3.53003 15.6301 3.93003C16.2301 6.06003 17.9201 7.75003 20.0501 8.35003C20.4501 8.46003 20.6801 8.88003 20.5701 9.28003C20.4801 9.62003 20.1801 9.83003 19.8501 9.83003Z" fill="currentColor" />
                                            </svg>
                                        </IconButton> : ''}
                                    </div>

                                </div>
                                {(siteInfo?.offlineFirstStepUserVerifyEnabled || siteInfo?.onlineFirstStepUserVerifyEnabled) && siteInfo?.secondStepUserVerifyEnabled ? <div className="flex items-center justify-between gap-x-8">
                                    <span>مدارک احراز کامل:</span>
                                    {userInfo?.documentImages?.length > 0 ? userInfo?.documentImages?.map((item, index) => (
                                        <LinkRouter legacyBehavior href={`${process.env.NEXT_PUBLIC_BASEURL}${item.url}`} key={index}>
                                            <a target={'_blank'}>
                                                <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${item.url}`} alt={item.name} className="rounded" width={'40px'} height={'40px'} />
                                            </a>
                                        </LinkRouter>
                                    )) : <Chip label="ارسال نشده" variant="outlined" size="small" className="badge badge-error px-4" />}
                                </div> : ''}
                                <div className="flex items-center justify-between gap-x-7 whitespace-nowrap">
                                    <span>نوع حساب:</span>
                                    <div className="flex items-center gap-x-1 dark:text-white">
                                        {userInfo?.role == 'User' ? <Chip label="کاربر ساده" variant="outlined" size="small" className="w-full badge badge-info px-4" /> :
                                            <Chip label="کاربر ویژه" variant="outlined" size="small" className="w-full badge badge-success px-4" />}
                                        <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={handleShowChangeUserRoleStatusDialog}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                                                <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H11C11.41 1.25 11.75 1.59 11.75 2C11.75 2.41 11.41 2.75 11 2.75H9C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V13C21.25 12.59 21.59 12.25 22 12.25C22.41 12.25 22.75 12.59 22.75 13V15C22.75 20.43 20.43 22.75 15 22.75Z" fill="currentColor" />
                                                <path d="M8.50008 17.6901C7.89008 17.6901 7.33008 17.4701 6.92008 17.0701C6.43008 16.5801 6.22008 15.8701 6.33008 15.1201L6.76008 12.1101C6.84008 11.5301 7.22008 10.7801 7.63008 10.3701L15.5101 2.49006C17.5001 0.500059 19.5201 0.500059 21.5101 2.49006C22.6001 3.58006 23.0901 4.69006 22.9901 5.80006C22.9001 6.70006 22.4201 7.58006 21.5101 8.48006L13.6301 16.3601C13.2201 16.7701 12.4701 17.1501 11.8901 17.2301L8.88008 17.6601C8.75008 17.6901 8.62008 17.6901 8.50008 17.6901ZM16.5701 3.55006L8.69008 11.4301C8.50008 11.6201 8.28008 12.0601 8.24008 12.3201L7.81008 15.3301C7.77008 15.6201 7.83008 15.8601 7.98008 16.0101C8.13008 16.1601 8.37008 16.2201 8.66008 16.1801L11.6701 15.7501C11.9301 15.7101 12.3801 15.4901 12.5601 15.3001L20.4401 7.42006C21.0901 6.77006 21.4301 6.19006 21.4801 5.65006C21.5401 5.00006 21.2001 4.31006 20.4401 3.54006C18.8401 1.94006 17.7401 2.39006 16.5701 3.55006Z" fill="currentColor" />
                                                <path d="M19.8501 9.83003C19.7801 9.83003 19.7101 9.82003 19.6501 9.80003C17.0201 9.06003 14.9301 6.97003 14.1901 4.34003C14.0801 3.94003 14.3101 3.53003 14.7101 3.41003C15.1101 3.30003 15.5201 3.53003 15.6301 3.93003C16.2301 6.06003 17.9201 7.75003 20.0501 8.35003C20.4501 8.46003 20.6801 8.88003 20.5701 9.28003C20.4801 9.62003 20.1801 9.83003 19.8501 9.83003Z" fill="currentColor" />
                                            </svg>
                                        </IconButton>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-x-7 whitespace-nowrap">
                                    <span>وضعیت حساب:</span>
                                    <div className="flex items-center gap-x-1 text-white">
                                        {userInfo?.isActive ? <Chip label="فعال" variant="outlined" size="small" className="w-full badge badge-success px-4" /> :
                                            <Chip label="غیرفعال" variant="outlined" size="small" className="w-full badge badge-error px-4" />}
                                        {userInfo?.isActive ?
                                            <Tooltip title="غیرفعالسازی کاربر">
                                                <IconButton
                                                    color={`error`}
                                                    onClick={changeStatusUser(userInfo?._id, false)}>
                                                    <CancelIcon />
                                                </IconButton>
                                            </Tooltip> : <Tooltip title="فعالسازی کاربر">
                                                <IconButton
                                                    color={`success`}
                                                    onClick={changeStatusUser(userInfo?._id, true)}>
                                                    <CheckCircleIcon />
                                                </IconButton>
                                            </Tooltip>}
                                        <Tooltip title="حذف کاربر">
                                            <IconButton
                                                color={`error`}
                                                onClick={handleOpenDialog(userInfo?._id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <ConfirmDialog
                                            open={openDialog}
                                            onClose={handleCloseDialog}
                                            onConfirm={deleteUser}
                                            title="آیا مطمئن هستید؟"
                                            loading={deleteLoading}
                                            darkModeToggle={darkModeToggle}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-x-7 whitespace-nowrap">
                                    <span>وضعیت احراز:</span>
                                    <div className="flex items-center gap-x-1 text-white">
                                        {(siteInfo?.offlineFirstStepUserVerifyEnabled || siteInfo?.onlineFirstStepUserVerifyEnabled) ?
                                            <>
                                                {userInfo?.verificationStatus == 'NotVerified' ? <Chip label="احراز نشده" variant="outlined" size="small" className="badge badge-error px-4" /> : ''}
                                                {userInfo?.verificationStatus == 'FirstLevelVerified' && siteInfo?.secondStepUserVerifyEnabled ?
                                                    <Chip label="احراز پایه" variant="outlined" size="small" className="badge badge-success px-4" /> : ''}
                                                {userInfo?.verificationStatus == 'FirstLevelVerified' && !siteInfo?.secondStepUserVerifyEnabled ?
                                                    <Chip label="احراز شده" variant="outlined" size="small" className="badge badge-success px-4" /> : ''}
                                                {userInfo?.verificationStatus == 'SecondLevelRejected' || userInfo?.verificationStatus == 'FirstLevelRejected' ?
                                                    <Chip label="احراز رد شده" variant="outlined" size="small" className="badge badge-error px-4" /> : ''}
                                                {userInfo?.verificationStatus == 'PendingSecondLevel' || userInfo?.verificationStatus == 'PendingFirstLevel' ? <Chip label="در انتظار تائید" variant="outlined" size="small" className="badge badge-primary px-4" /> : ''}
                                                {userInfo?.verificationStatus == 'SecondLevelVerified' ? <Chip label="احراز کامل" variant="outlined" size="small" className="badge badge-success px-4" /> : ''}
                                                {(siteInfo?.offlineFirstStepUserVerifyEnabled || siteInfo?.onlineFirstStepUserVerifyEnabled) ? <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={handleShowChangeAuthStatusDialog}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                                                        <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H11C11.41 1.25 11.75 1.59 11.75 2C11.75 2.41 11.41 2.75 11 2.75H9C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V13C21.25 12.59 21.59 12.25 22 12.25C22.41 12.25 22.75 12.59 22.75 13V15C22.75 20.43 20.43 22.75 15 22.75Z" fill="currentColor" />
                                                        <path d="M8.50008 17.6901C7.89008 17.6901 7.33008 17.4701 6.92008 17.0701C6.43008 16.5801 6.22008 15.8701 6.33008 15.1201L6.76008 12.1101C6.84008 11.5301 7.22008 10.7801 7.63008 10.3701L15.5101 2.49006C17.5001 0.500059 19.5201 0.500059 21.5101 2.49006C22.6001 3.58006 23.0901 4.69006 22.9901 5.80006C22.9001 6.70006 22.4201 7.58006 21.5101 8.48006L13.6301 16.3601C13.2201 16.7701 12.4701 17.1501 11.8901 17.2301L8.88008 17.6601C8.75008 17.6901 8.62008 17.6901 8.50008 17.6901ZM16.5701 3.55006L8.69008 11.4301C8.50008 11.6201 8.28008 12.0601 8.24008 12.3201L7.81008 15.3301C7.77008 15.6201 7.83008 15.8601 7.98008 16.0101C8.13008 16.1601 8.37008 16.2201 8.66008 16.1801L11.6701 15.7501C11.9301 15.7101 12.3801 15.4901 12.5601 15.3001L20.4401 7.42006C21.0901 6.77006 21.4301 6.19006 21.4801 5.65006C21.5401 5.00006 21.2001 4.31006 20.4401 3.54006C18.8401 1.94006 17.7401 2.39006 16.5701 3.55006Z" fill="currentColor" />
                                                        <path d="M19.8501 9.83003C19.7801 9.83003 19.7101 9.82003 19.6501 9.80003C17.0201 9.06003 14.9301 6.97003 14.1901 4.34003C14.0801 3.94003 14.3101 3.53003 14.7101 3.41003C15.1101 3.30003 15.5201 3.53003 15.6301 3.93003C16.2301 6.06003 17.9201 7.75003 20.0501 8.35003C20.4501 8.46003 20.6801 8.88003 20.5701 9.28003C20.4801 9.62003 20.1801 9.83003 19.8501 9.83003Z" fill="currentColor" />
                                                    </svg>
                                                </IconButton> : ''}
                                            </> :
                                            <Chip label="احراز شده" variant="outlined" size="small" className="w-full badge badge-success" />}
                                    </div>
                                </div>
                                <div className="flex items-center justify-center md:justify-end gap-4">
                                    <Button variant="contained" color="primary" size="small" className="w-full md:w-fit custom-btn text-black rounded-lg" onClick={handleShowUserInfo}>
                                        <span>ویرایش اطلاعات</span>
                                    </Button>
                                    {adminInfo?.role == 'SuperAdmin' ? <Button variant="contained" color="success" size="small" className="w-full md:w-fit custom-btn text-black rounded-lg" onClick={handleChargeWallet}>
                                        <span>تغییر موجودی</span>
                                    </Button> : ''}
                                </div>
                            </div>
                        </div>
                    </section> :
                    <div className="h-[400px] flex justify-center items-center mt-16">کاربر مورد نظر یافت نشد!!!</div>}
            {userInfo ? <section className="my-10 text-center">
                {firstLoading ? '' : <Tabs variant="fullWidth" indicatorColor="primary" textColor="inherit" value={tabValue} className="w-full *:!overflow-x-auto *:!overflow-y-hidden custom-scroll history-tabs pb-1"
                    TabIndicatorProps={{ className: 'mb-1' }}>
                    <Tab label="واریز" className="whitespace-nowrap w-fit" classes={{ selected: 'text-primary' }} value={0} onClick={handleChange(0)} />
                    <Tab label="واریز دستی" className="whitespace-nowrap w-fit" classes={{ selected: 'text-primary' }} value={1} onClick={handleChange(1)} />
                    <Tab label="واریز شناسه دار" className="whitespace-nowrap w-fit" classes={{ selected: 'text-primary' }} value={9} onClick={handleChange(9)} />
                    <Tab label="تغییرات تومان" className="whitespace-nowrap w-fit" classes={{ selected: 'text-primary' }} value={10} onClick={handleChange(10)} />
                    <Tab label="برداشت" className="whitespace-nowrap w-fit" classes={{ selected: 'text-primary' }} value={2} onClick={handleChange(2)} />
                    <Tab label="نفرات دعوتی" className="whitespace-nowrap w-fit" classes={{ selected: 'text-primary' }} value={11} onClick={handleChange(11)} />
                    {(siteInfo?.paidModules && siteInfo?.paidModules?.includes('OrderBook')) ? [
                        <Tab key={1} label="معاملات آنی" className="whitespace-nowrap w-fit" classes={{ selected: 'text-primary' }} value={3} onClick={handleChange(3)} />,
                        <Tab key={2} label="معاملات پیشرفته" className="whitespace-nowrap w-fit" classes={{ selected: 'text-primary' }} value={7} onClick={handleChange(7)} />
                    ] : (
                        <Tab label="معاملات" className="whitespace-nowrap w-fit" classes={{ selected: 'text-primary' }} value={3} onClick={handleChange(3)} />
                    )}
                    <Tab label="کارت های بانکی" className="whitespace-nowrap w-fit" classes={{ selected: 'text-primary' }} value={4} onClick={handleChange(4)} />
                    <Tab label="سبد تحویل" className="whitespace-nowrap w-fit" classes={{ selected: 'text-primary' }} value={5} onClick={handleChange(5)} />
                    <Tab label="کیف پولها" className="whitespace-nowrap w-fit" classes={{ selected: 'text-primary' }} value={6} onClick={handleChange(6)} />
                    <Tab label="انتقال دارایی" className="whitespace-nowrap w-fit" classes={{ selected: 'text-primary' }} value={8} onClick={handleChange(8)} />
                    <Tab label="درخواست های گیفت کارت" className="whitespace-nowrap w-fit" classes={{ selected: 'text-primary' }} value={12} onClick={handleChange(12)} />
                </Tabs>}
                <div>
                    {loadingTransactions ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> :
                        <div className="grid grid-cols-12 gap-y-4 py-8">
                            <span className="col-span-12 text-end dark:text-white">تعداد کل: {loadingTransactions ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (transactionsTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                            {tabValue == 0 ?
                                transactions.length > 0 ? transactions.map((data, index) => {
                                    return (
                                        <Accordion key={index} className="custom-accordion disable col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className="font-medium text-black w-full !cursor-default *:!my-3"
                                                expandIcon={''}>
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div>
                                                            <span className="flex items-center gap-x-4">
                                                                {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M12.9 1.42c-.33 0-.66.059-.97.176a1 1 0 0 0-.003 0l-7.26 2.742c-1.4.53-2.33 1.88-2.33 3.377v4.81a6.144 6.144 0 0 0-.476 7.058 6.13 6.13 0 0 0 5.28 2.994c1.196 0 2.32-.344 3.27-.948a1 1 0 0 0 .17.034h6.694c2.437 0 4.438-2.003 4.438-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2-4.438-4.438-4.438h-1.643V4.16a2.728 2.728 0 0 0-1.18-2.251 2.738 2.738 0 0 0-1.553-.489zm-.094 2.006a.754.754 0 0 1 .51.125.73.73 0 0 1 .23.266.736.736 0 0 1 .086.341 1 1 0 0 0 0 .002v2.473H6.777c-.879 0-1.7.264-2.393.711.12-.516.48-.941.99-1.135l7.26-2.742a.721.721 0 0 1 .172-.04zM6.777 8.633h10.5a2.435 2.435 0 0 1 2.438 2.438v.318h-.847c-.771 0-1.5.312-2.023.846a2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904l.05-.084c.57-.93.895-2.024.895-3.176a6.172 6.172 0 0 0-3.502-5.564 6.159 6.159 0 0 0-5.467.063 2.434 2.434 0 0 1 2.43-2.268zm.477 3.6a4.177 4.177 0 0 1 3.42 1.947c.419.666.64 1.436.64 2.223 0 .783-.217 1.52-.6 2.14a1 1 0 0 0-.01.02 3.66 3.66 0 0 1-.802.954 1 1 0 0 0-.027.023 4.039 4.039 0 0 1-2.734 1.037 1 1 0 0 0-.002 0 4.137 4.137 0 0 1-3.563-2.019 1 1 0 0 0-.005-.014 4.07 4.07 0 0 1-.604-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .005-.003 4.17 4.17 0 0 1 2.721-.915zm11.61 1.156h1.816v1.748h-1.705c-.5 0-.945-.37-.98-.793a1 1 0 0 0-.003-.012.83.83 0 0 1 .254-.68 1 1 0 0 0 .018-.017.803.803 0 0 1 .6-.246zm-11.73.568a.75.75 0 0 0-.75.75v.907h-.94a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75h.94v.986a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75v-.986h.945a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75h-.945v-.907a.75.75 0 0 0-.75-.75z">

                                                                    </path>
                                                                </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M12.9 1.42c-.33 0-.658.059-.969.176a1 1 0 0 0-.002 0L4.667 4.338A3.615 3.615 0 0 0 2.34 7.715v4.81a6.144 6.144 0 0 0-.476 7.058 6.124 6.124 0 0 0 5.28 2.994 6.083 6.083 0 0 0 3.269-.948 1 1 0 0 0 .17.034h6.693c2.437 0 4.439-2.003 4.439-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2.002-4.437-4.44-4.437h-1.642V4.161c0-.443-.106-.88-.311-1.273a2.733 2.733 0 0 0-.87-.978 2.738 2.738 0 0 0-1.552-.49zm-.092 2.006a.738.738 0 0 1 .824.732 1 1 0 0 0 0 .002v2.473H6.777c-.88 0-1.7.263-2.393.711.12-.516.48-.941.99-1.135l7.263-2.742a.721.721 0 0 1 .172-.04zm-6.03 5.207h10.5a2.435 2.435 0 0 1 2.437 2.438v.318h-.845a2.84 2.84 0 0 0-2.025.846 2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904c.017-.028.036-.055.053-.084a6.07 6.07 0 0 0 .892-3.176A6.17 6.17 0 0 0 4.35 10.9a2.434 2.434 0 0 1 2.43-2.267zm.478 3.6a4.168 4.168 0 0 1 1.693.41c.709.34 1.308.872 1.727 1.537.419.666.64 1.436.64 2.223 0 .783-.219 1.52-.601 2.14a1 1 0 0 0-.012.02c-.214.367-.49.693-.8.954a1 1 0 0 0-.028.023 4.034 4.034 0 0 1-2.732 1.037 1 1 0 0 0-.002 0 4.144 4.144 0 0 1-3.563-2.019 1 1 0 0 0-.008-.014 4.069 4.069 0 0 1-.602-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .004-.003 4.177 4.177 0 0 1 2.723-.915zm11.61 1.156h1.816v1.748h-1.707c-.5 0-.945-.37-.98-.793a1 1 0 0 0 0-.012.828.828 0 0 1 .251-.68 1 1 0 0 0 .018-.017.807.807 0 0 1 .601-.246zm-13.42 2.266a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.748h3.383a.75.75 0 0 0 .75-.748.75.75 0 0 0-.75-.75z"></path>
                                                                </svg>}
                                                                {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ? 'واریز' : 'برداشت'} تومان</span>
                                                            {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ?
                                                                <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}+
                                                                    </span> تومان</span> : <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}-
                                                                    </span> تومان</span>}
                                                        </div>
                                                        <div className="flex flex-col items-end text-start">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            <span className="block mt-2">
                                                                <span>وضعیت: </span>
                                                                {data.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">موفق</span> : ''}
                                                                {data.status == 'Pending' ? <span className="text-primary">در انتظار تائید</span> : ''}
                                                                {data.status == 'Rejected' ? <span className="text-sell">رد شده</span> : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionSummary>
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">هنوز تراکنشی انجام نشده است.</span>
                                </div> : ''}
                            {tabValue == 1 ?
                                transactions.length > 0 ? transactions.map((data, index) => {
                                    return (
                                        <Accordion key={index} className="custom-accordion col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className="font-medium text-black w-full *:!my-3"
                                                expandIcon={''}>
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div>
                                                            <span className="flex items-center gap-x-4">
                                                                {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M12.9 1.42c-.33 0-.66.059-.97.176a1 1 0 0 0-.003 0l-7.26 2.742c-1.4.53-2.33 1.88-2.33 3.377v4.81a6.144 6.144 0 0 0-.476 7.058 6.13 6.13 0 0 0 5.28 2.994c1.196 0 2.32-.344 3.27-.948a1 1 0 0 0 .17.034h6.694c2.437 0 4.438-2.003 4.438-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2-4.438-4.438-4.438h-1.643V4.16a2.728 2.728 0 0 0-1.18-2.251 2.738 2.738 0 0 0-1.553-.489zm-.094 2.006a.754.754 0 0 1 .51.125.73.73 0 0 1 .23.266.736.736 0 0 1 .086.341 1 1 0 0 0 0 .002v2.473H6.777c-.879 0-1.7.264-2.393.711.12-.516.48-.941.99-1.135l7.26-2.742a.721.721 0 0 1 .172-.04zM6.777 8.633h10.5a2.435 2.435 0 0 1 2.438 2.438v.318h-.847c-.771 0-1.5.312-2.023.846a2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904l.05-.084c.57-.93.895-2.024.895-3.176a6.172 6.172 0 0 0-3.502-5.564 6.159 6.159 0 0 0-5.467.063 2.434 2.434 0 0 1 2.43-2.268zm.477 3.6a4.177 4.177 0 0 1 3.42 1.947c.419.666.64 1.436.64 2.223 0 .783-.217 1.52-.6 2.14a1 1 0 0 0-.01.02 3.66 3.66 0 0 1-.802.954 1 1 0 0 0-.027.023 4.039 4.039 0 0 1-2.734 1.037 1 1 0 0 0-.002 0 4.137 4.137 0 0 1-3.563-2.019 1 1 0 0 0-.005-.014 4.07 4.07 0 0 1-.604-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .005-.003 4.17 4.17 0 0 1 2.721-.915zm11.61 1.156h1.816v1.748h-1.705c-.5 0-.945-.37-.98-.793a1 1 0 0 0-.003-.012.83.83 0 0 1 .254-.68 1 1 0 0 0 .018-.017.803.803 0 0 1 .6-.246zm-11.73.568a.75.75 0 0 0-.75.75v.907h-.94a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75h.94v.986a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75v-.986h.945a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75h-.945v-.907a.75.75 0 0 0-.75-.75z">

                                                                    </path>
                                                                </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M12.9 1.42c-.33 0-.658.059-.969.176a1 1 0 0 0-.002 0L4.667 4.338A3.615 3.615 0 0 0 2.34 7.715v4.81a6.144 6.144 0 0 0-.476 7.058 6.124 6.124 0 0 0 5.28 2.994 6.083 6.083 0 0 0 3.269-.948 1 1 0 0 0 .17.034h6.693c2.437 0 4.439-2.003 4.439-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2.002-4.437-4.44-4.437h-1.642V4.161c0-.443-.106-.88-.311-1.273a2.733 2.733 0 0 0-.87-.978 2.738 2.738 0 0 0-1.552-.49zm-.092 2.006a.738.738 0 0 1 .824.732 1 1 0 0 0 0 .002v2.473H6.777c-.88 0-1.7.263-2.393.711.12-.516.48-.941.99-1.135l7.263-2.742a.721.721 0 0 1 .172-.04zm-6.03 5.207h10.5a2.435 2.435 0 0 1 2.437 2.438v.318h-.845a2.84 2.84 0 0 0-2.025.846 2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904c.017-.028.036-.055.053-.084a6.07 6.07 0 0 0 .892-3.176A6.17 6.17 0 0 0 4.35 10.9a2.434 2.434 0 0 1 2.43-2.267zm.478 3.6a4.168 4.168 0 0 1 1.693.41c.709.34 1.308.872 1.727 1.537.419.666.64 1.436.64 2.223 0 .783-.219 1.52-.601 2.14a1 1 0 0 0-.012.02c-.214.367-.49.693-.8.954a1 1 0 0 0-.028.023 4.034 4.034 0 0 1-2.732 1.037 1 1 0 0 0-.002 0 4.144 4.144 0 0 1-3.563-2.019 1 1 0 0 0-.008-.014 4.069 4.069 0 0 1-.602-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .004-.003 4.177 4.177 0 0 1 2.723-.915zm11.61 1.156h1.816v1.748h-1.707c-.5 0-.945-.37-.98-.793a1 1 0 0 0 0-.012.828.828 0 0 1 .251-.68 1 1 0 0 0 .018-.017.807.807 0 0 1 .601-.246zm-13.42 2.266a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.748h3.383a.75.75 0 0 0 .75-.748.75.75 0 0 0-.75-.75z"></path>
                                                                </svg>}
                                                                {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ? 'واریز' : 'برداشت'} تومان</span>
                                                            {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ?
                                                                <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}+
                                                                    </span> تومان</span> : <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}-
                                                                    </span> تومان</span>}
                                                        </div>
                                                        <div className="flex flex-col items-end text-start">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            <span className="block mt-2">
                                                                <span>وضعیت: </span>
                                                                {data.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">موفق</span> : ''}
                                                                {data.status == 'Pending' ? <span className="text-primary">در انتظار تائید</span> : ''}
                                                                {data.status == 'Rejected' ? <span className="text-sell cursor-pointer hover:underline" onClick={handleShowReject(data)}>رد شده</span> : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionSummary>
                                            <AccordionDetails className="custom-accordion-text !px-2 !pb-4">
                                                <div className="w-full flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span>واریز از: </span>
                                                        <div className="flex items-center gap-x-2">
                                                            <div className="flex items-center justify-center bg-white w-7 h-7 rounded-[50%]">
                                                                <img src={CheckCardNumber(data.card?.number || '').image} alt={CheckCardNumber(data.card?.number || '').name} width="48" height="48" decoding="async" data-nimg="1" loading="lazy" className="w-5 h-5 object-contain" />
                                                            </div>
                                                            <PatternFormat displayType='text' value={data.card?.number} format="####-####-####-####" dir="ltr" />
                                                        </div>
                                                    </div>
                                                    <span className="flex flex-col">
                                                        <span>کد پیگیری: </span>
                                                        <span>{data.accountNumber || data.trackingCode}</span></span>
                                                </div>
                                            </AccordionDetails>
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">هنوز تراکنشی انجام نشده است.</span>
                                </div> : ''}
                            {tabValue == 9 ?
                                transactions.length > 0 ? transactions.map((data, index) => {
                                    return (
                                        <Accordion key={index} className="custom-accordion col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className="font-medium text-black w-full *:!my-3"
                                                expandIcon={''}>
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div>
                                                            <span className="flex items-center gap-x-4">
                                                                <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M12.9 1.42c-.33 0-.66.059-.97.176a1 1 0 0 0-.003 0l-7.26 2.742c-1.4.53-2.33 1.88-2.33 3.377v4.81a6.144 6.144 0 0 0-.476 7.058 6.13 6.13 0 0 0 5.28 2.994c1.196 0 2.32-.344 3.27-.948a1 1 0 0 0 .17.034h6.694c2.437 0 4.438-2.003 4.438-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2-4.438-4.438-4.438h-1.643V4.16a2.728 2.728 0 0 0-1.18-2.251 2.738 2.738 0 0 0-1.553-.489zm-.094 2.006a.754.754 0 0 1 .51.125.73.73 0 0 1 .23.266.736.736 0 0 1 .086.341 1 1 0 0 0 0 .002v2.473H6.777c-.879 0-1.7.264-2.393.711.12-.516.48-.941.99-1.135l7.26-2.742a.721.721 0 0 1 .172-.04zM6.777 8.633h10.5a2.435 2.435 0 0 1 2.438 2.438v.318h-.847c-.771 0-1.5.312-2.023.846a2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904l.05-.084c.57-.93.895-2.024.895-3.176a6.172 6.172 0 0 0-3.502-5.564 6.159 6.159 0 0 0-5.467.063 2.434 2.434 0 0 1 2.43-2.268zm.477 3.6a4.177 4.177 0 0 1 3.42 1.947c.419.666.64 1.436.64 2.223 0 .783-.217 1.52-.6 2.14a1 1 0 0 0-.01.02 3.66 3.66 0 0 1-.802.954 1 1 0 0 0-.027.023 4.039 4.039 0 0 1-2.734 1.037 1 1 0 0 0-.002 0 4.137 4.137 0 0 1-3.563-2.019 1 1 0 0 0-.005-.014 4.07 4.07 0 0 1-.604-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .005-.003 4.17 4.17 0 0 1 2.721-.915zm11.61 1.156h1.816v1.748h-1.705c-.5 0-.945-.37-.98-.793a1 1 0 0 0-.003-.012.83.83 0 0 1 .254-.68 1 1 0 0 0 .018-.017.803.803 0 0 1 .6-.246zm-11.73.568a.75.75 0 0 0-.75.75v.907h-.94a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75h.94v.986a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75v-.986h.945a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75h-.945v-.907a.75.75 0 0 0-.75-.75z">

                                                                    </path>
                                                                </svg>
                                                                واریز تومان با شناسه</span>
                                                            <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                <span className="ltr">
                                                                    {(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}+
                                                                </span> تومان</span>
                                                        </div>
                                                        <div className="flex flex-col items-end text-start">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            <span className="block mt-2">
                                                                <span>وضعیت: </span>
                                                                {data.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">موفق</span> : ''}
                                                                {data.status == 'Pending' ? <span className="text-primary">در انتظار تائید</span> : ''}
                                                                {data.status == 'Rejected' ? <span className="text-sell">رد شده</span> : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-center">
                                                        <IconButton color={darkModeToggle ? 'white' : 'black'} className="p-1 xl:-mx-8 -rotate-90">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                <path d="M13.26 15.53L9.74 12L13.26 8.46997" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                        </IconButton>
                                                    </div>
                                                </div>
                                            </AccordionSummary>
                                            <AccordionDetails className="custom-accordion-text !px-2 !pb-4">
                                                <span className="flex flex-col">
                                                    <span>کد پیگیری: </span>
                                                    <span>{data.status == 'Accepted' ? (data.trackingCode) : '----'}</span></span>
                                            </AccordionDetails>
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">هنوز تراکنشی انجام نشده است.</span>
                                </div> : ''}
                            {tabValue == 2 ?
                                transactions.length > 0 ? transactions.map((data, index) => {
                                    return (
                                        <Accordion key={index} className="custom-accordion col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className="font-medium text-black w-full"
                                                expandIcon={''}
                                                // aria-controls="panel1a-content"
                                                id="panel1a-header">
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div className="flex flex-col">
                                                            <span className="flex items-center gap-x-4">
                                                                {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M12.9 1.42c-.33 0-.66.059-.97.176a1 1 0 0 0-.003 0l-7.26 2.742c-1.4.53-2.33 1.88-2.33 3.377v4.81a6.144 6.144 0 0 0-.476 7.058 6.13 6.13 0 0 0 5.28 2.994c1.196 0 2.32-.344 3.27-.948a1 1 0 0 0 .17.034h6.694c2.437 0 4.438-2.003 4.438-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2-4.438-4.438-4.438h-1.643V4.16a2.728 2.728 0 0 0-1.18-2.251 2.738 2.738 0 0 0-1.553-.489zm-.094 2.006a.754.754 0 0 1 .51.125.73.73 0 0 1 .23.266.736.736 0 0 1 .086.341 1 1 0 0 0 0 .002v2.473H6.777c-.879 0-1.7.264-2.393.711.12-.516.48-.941.99-1.135l7.26-2.742a.721.721 0 0 1 .172-.04zM6.777 8.633h10.5a2.435 2.435 0 0 1 2.438 2.438v.318h-.847c-.771 0-1.5.312-2.023.846a2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904l.05-.084c.57-.93.895-2.024.895-3.176a6.172 6.172 0 0 0-3.502-5.564 6.159 6.159 0 0 0-5.467.063 2.434 2.434 0 0 1 2.43-2.268zm.477 3.6a4.177 4.177 0 0 1 3.42 1.947c.419.666.64 1.436.64 2.223 0 .783-.217 1.52-.6 2.14a1 1 0 0 0-.01.02 3.66 3.66 0 0 1-.802.954 1 1 0 0 0-.027.023 4.039 4.039 0 0 1-2.734 1.037 1 1 0 0 0-.002 0 4.137 4.137 0 0 1-3.563-2.019 1 1 0 0 0-.005-.014 4.07 4.07 0 0 1-.604-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .005-.003 4.17 4.17 0 0 1 2.721-.915zm11.61 1.156h1.816v1.748h-1.705c-.5 0-.945-.37-.98-.793a1 1 0 0 0-.003-.012.83.83 0 0 1 .254-.68 1 1 0 0 0 .018-.017.803.803 0 0 1 .6-.246zm-11.73.568a.75.75 0 0 0-.75.75v.907h-.94a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75h.94v.986a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75v-.986h.945a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75h-.945v-.907a.75.75 0 0 0-.75-.75z">

                                                                    </path>
                                                                </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M12.9 1.42c-.33 0-.658.059-.969.176a1 1 0 0 0-.002 0L4.667 4.338A3.615 3.615 0 0 0 2.34 7.715v4.81a6.144 6.144 0 0 0-.476 7.058 6.124 6.124 0 0 0 5.28 2.994 6.083 6.083 0 0 0 3.269-.948 1 1 0 0 0 .17.034h6.693c2.437 0 4.439-2.003 4.439-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2.002-4.437-4.44-4.437h-1.642V4.161c0-.443-.106-.88-.311-1.273a2.733 2.733 0 0 0-.87-.978 2.738 2.738 0 0 0-1.552-.49zm-.092 2.006a.738.738 0 0 1 .824.732 1 1 0 0 0 0 .002v2.473H6.777c-.88 0-1.7.263-2.393.711.12-.516.48-.941.99-1.135l7.263-2.742a.721.721 0 0 1 .172-.04zm-6.03 5.207h10.5a2.435 2.435 0 0 1 2.437 2.438v.318h-.845a2.84 2.84 0 0 0-2.025.846 2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904c.017-.028.036-.055.053-.084a6.07 6.07 0 0 0 .892-3.176A6.17 6.17 0 0 0 4.35 10.9a2.434 2.434 0 0 1 2.43-2.267zm.478 3.6a4.168 4.168 0 0 1 1.693.41c.709.34 1.308.872 1.727 1.537.419.666.64 1.436.64 2.223 0 .783-.219 1.52-.601 2.14a1 1 0 0 0-.012.02c-.214.367-.49.693-.8.954a1 1 0 0 0-.028.023 4.034 4.034 0 0 1-2.732 1.037 1 1 0 0 0-.002 0 4.144 4.144 0 0 1-3.563-2.019 1 1 0 0 0-.008-.014 4.069 4.069 0 0 1-.602-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .004-.003 4.177 4.177 0 0 1 2.723-.915zm11.61 1.156h1.816v1.748h-1.707c-.5 0-.945-.37-.98-.793a1 1 0 0 0 0-.012.828.828 0 0 1 .251-.68 1 1 0 0 0 .018-.017.807.807 0 0 1 .601-.246zm-13.42 2.266a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.748h3.383a.75.75 0 0 0 .75-.748.75.75 0 0 0-.75-.75z"></path>
                                                                </svg>}
                                                                {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ? 'واریز' : 'برداشت'} تومان</span>
                                                            {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ?
                                                                <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}+
                                                                    </span> تومان</span> : <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}-
                                                                    </span> تومان</span>}
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            <span className="block mt-2">
                                                                <span>وضعیت: </span>
                                                                {data.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">تائید شده</span> : ''}
                                                                {data.status == 'Pending' ? <span className="text-primary">در انتظار تائید</span> : ''}
                                                                {data.status == 'Rejected' ? <span className="text-sell cursor-pointer hover:underline" onClick={handleShowReject(data)}>رد شده</span> : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-center">
                                                        <IconButton color={darkModeToggle ? 'white' : 'black'} className="p-1 xl:-mx-8 -rotate-90">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                <path d="M13.26 15.53L9.74 12L13.26 8.46997" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                        </IconButton>
                                                    </div>
                                                </div>
                                            </AccordionSummary>
                                            <AccordionDetails className="custom-accordion-text !px-2 !pb-4">
                                                <div className="w-full flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span>واریز به: </span>
                                                        <div className="flex items-center gap-x-2">
                                                            <div className="flex items-center justify-center bg-white w-7 h-7 rounded-[50%]">
                                                                <img src={CheckCardNumber(data.card?.number || '').image} alt={CheckCardNumber(data.card?.number || '').name} width="48" height="48" decoding="async" data-nimg="1" loading="lazy" className="w-5 h-5 object-contain" />
                                                            </div>
                                                            <PatternFormat displayType='text' value={data.card?.number} format="####-####-####-####" dir="ltr" />
                                                        </div>
                                                    </div>
                                                    <span className="flex flex-col">
                                                        <span>کد پیگیری: </span>
                                                        {data.status == 'Accepted' ? <span>{data.trackingCode || data.transId}</span> : '------'}</span>
                                                </div>
                                            </AccordionDetails>
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">هنوز تراکنشی انجام نشده است.</span>
                                </div> : ''}
                            {tabValue == 3 ?
                                transactions.length > 0 ? transactions.map((data, index) => {
                                    return (
                                        <Accordion key={index} className={`custom-accordion ${data.wallgoldPrice ? '' : 'disable'} col-span-12 !rounded-2xl !px-6 !py-2`} sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className={`font-medium text-black w-full ${data.wallgoldPrice ? '' : '!cursor-default *:!my-3'}`}
                                                expandIcon={''}>
                                                <div className="w-full flex flex-col">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div className="flex flex-col">
                                                            <span className="flex items-center gap-x-4">
                                                                {data.type == 'Buy' || data.type == 'PayLaterBuy' ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path>
                                                                </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M8.238 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.61-4.801L6.24 4.529a.75.75 0 1 0 1.307.73l1.344-2.4a.75.75 0 0 0-.652-1.114zm6.492 1.484c-3.145 0-5.745 2.421-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.064 6.062 6.064 3.145 0 5.742-2.421 6.031-5.492 3.068-.293 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.063-6.062zm0 2.002a4.044 4.044 0 0 1 4.064 4.061c0 2.105-1.593 3.764-3.637 3.982a6.051 6.051 0 0 0-1.316-2.502 3.242 3.242 0 0 0-.273-.315 3.263 3.263 0 0 0-.338-.292 6.044 6.044 0 0 0-2.48-1.287c.212-2.05 1.87-3.647 3.98-3.647zm-5.453 5.463c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.749.749 0 0 0-.746.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.308-.73l-1.342 2.4a.75.75 0 0 0 .653 1.114 6.504 6.504 0 0 0 6.494-6.494.75.75 0 0 0-.752-.748z"></path>
                                                                </svg>}
                                                                {data.type == 'PayLaterBuy' ? 'خرید قرضی' : data.type == 'Buy' ? 'خرید' : 'فروش'} {data.tradeable ? <span>{data.tradeable?.nameFa}</span> : ''}</span>
                                                            {data.type == 'Buy' || data.type == 'PayLaterBuy' ?
                                                                <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}+
                                                                    </span> گرم</span> : <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}-
                                                                    </span> گرم</span>}
                                                            <span className="text-sm mt-2 px-4">{(data.total || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                                        </div>
                                                        <div className="flex flex-col items-end text-start">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            <span className="block text-sm mt-2">
                                                                <span>{data.isFixedPrice ? 'قیمت ثابت: ' : 'قیمت: '}</span>
                                                                <span className="mt-2">
                                                                    {data.tradeablePrice ? `${(data.tradeablePrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` : '------'}
                                                                </span>
                                                            </span>
                                                            <span className="block mt-2">
                                                                <span>وضعیت: </span>
                                                                {data.status == 'Accepted' ? data.paid ? <span className="text-secondary-green dark:text-buy">پرداخت شده</span> :
                                                                    <span className="text-secondary-green dark:text-buy">تائید شده</span> : ''}
                                                                {data.status == 'Pending' ? data.type == 'PayLaterBuy' && !data.paid ? <span className="text-primary">در انتظار پرداخت</span> :
                                                                    <span className="text-primary">در انتظار تائید</span> : ''}
                                                                {data.status == 'Rejected' ? <span className="text-sell cursor-pointer hover:underline" onClick={handleShowReject(data)}>رد شده</span> : ''}

                                                                {data.status == 'PendingFixedPrice' ? <span className="text-primary">در انتظار تائید</span> : ''}
                                                                {data.status == 'Cancelled' ? <span className="text-sell">لغو شده</span> : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {data.wallgoldPrice ? <div className="flex items-center justify-center">
                                                        <IconButton color={darkModeToggle ? 'white' : 'black'} className="p-1 xl:-mx-8 -rotate-90">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                <path d="M13.26 15.53L9.74 12L13.26 8.46997" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                        </IconButton>
                                                    </div> : ''}
                                                </div>
                                            </AccordionSummary>
                                            {data.wallgoldPrice ? <AccordionDetails className="custom-accordion-text !px-4 !py-4">
                                                <div className="w-full grid grid-cols-12 gap-4">
                                                    <div className="col-span-6 flex flex-col items-start">
                                                        <span>قیمت معامله در وال گلد: </span>
                                                        {(data.wallgoldPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان
                                                    </div>
                                                    <div className="col-span-6 flex flex-col items-start">
                                                        <span>شناسه معامله در وال گلد: </span>
                                                        {data.wallgoldOrderId ? <div className="flex items-center">
                                                            <span>{data.wallgoldOrderId}</span>
                                                            <IconButton onClick={CopyData(data?.wallgoldOrderId)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                                    <path d="M9.24984 18.9582H5.74984C2.4915 18.9582 1.0415 17.5082 1.0415 14.2498V10.7498C1.0415 7.4915 2.4915 6.0415 5.74984 6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V14.2498C13.9582 17.5082 12.5082 18.9582 9.24984 18.9582ZM5.74984 7.2915C3.1665 7.2915 2.2915 8.1665 2.2915 10.7498V14.2498C2.2915 16.8332 3.1665 17.7082 5.74984 17.7082H9.24984C11.8332 17.7082 12.7082 16.8332 12.7082 14.2498V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H5.74984Z" fill="#F1C40F" />
                                                                    <path d="M14.2498 13.9582H13.3332C12.9915 13.9582 12.7082 13.6748 12.7082 13.3332V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H6.6665C6.32484 7.2915 6.0415 7.00817 6.0415 6.6665V5.74984C6.0415 2.4915 7.4915 1.0415 10.7498 1.0415H14.2498C17.5082 1.0415 18.9582 2.4915 18.9582 5.74984V9.24984C18.9582 12.5082 17.5082 13.9582 14.2498 13.9582ZM13.9582 12.7082H14.2498C16.8332 12.7082 17.7082 11.8332 17.7082 9.24984V5.74984C17.7082 3.1665 16.8332 2.2915 14.2498 2.2915H10.7498C8.1665 2.2915 7.2915 3.1665 7.2915 5.74984V6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V12.7082Z" fill="#F1C40F" />
                                                                </svg>
                                                            </IconButton>
                                                        </div> : '------'}
                                                    </div>
                                                </div>
                                            </AccordionDetails> : ''}
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">هنوز معامله ای انجام نشده است.</span>
                                </div> : ''}

                            {tabValue == 4 ?
                                cards.length > 0 ? cards.map((data, index) => {
                                    return (
                                        <Accordion key={index} className="custom-accordion disable col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className="font-medium text-black w-full !cursor-default *:!my-3"
                                                expandIcon={''}>
                                                <div className="w-full flex flex-col gap-y-4">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div className="flex flex-col gap-y-2">
                                                            <div className="flex items-center gap-x-2">
                                                                <div className="flex items-center justify-center bg-white w-9 h-9 rounded-[50%]">
                                                                    <img src={CheckCardNumber(data.number).image} alt={CheckCardNumber(data.number).name} width="48" height="48" decoding="async" data-nimg="1" loading="lazy" className="w-7 h-7 object-contain" />
                                                                </div>
                                                                <span>{CheckCardNumber(data.number).name}</span>
                                                            </div>
                                                            <div className="flex flex-col items-start">
                                                                <span className="block text-large-0 text-secondary-green dark:text-buy">
                                                                    <PatternFormat displayType='text' value={data.number} format="####-####-####-####" dir="ltr" />
                                                                </span>
                                                                <span className="block text-large-0 text-sell">
                                                                    {data.iban ? <PatternFormat displayType='text' value={(data.iban)?.replace('ir', '').replace('IR', '')} format="IR## #### #### #### #### #### ##"
                                                                    /> :
                                                                        <Chip label="فاقد شماره شبا" variant="outlined" size="small" className="w-full badge badge-error" />}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            <span className="block">
                                                                <span>وضعیت: </span>
                                                                {data.status == 'Active' || data.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">تائید شده</span> : ''}
                                                                {data.status == 'Pending' ? <span className="text-primary">در انتظار تائید</span> : ''}
                                                                {data.status == 'Deactive' ? <span className="text-sell">رد شده</span> : ''}
                                                                {data.status == 'Deleted' ? <span className="text-sell">حذف شده</span> : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionSummary>
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">هنوز کارت بانکی ثبت نشده است.</span>
                                </div> : ''}
                            {tabValue == 5 ?
                                requests.length > 0 ? requests.map((data, index) => {
                                    return (
                                        <Accordion key={index} className={`custom-accordion ${(data.branchTime && Object.keys(data.branchTime).length > 0) || data.purity ? '' : 'disable'} col-span-12 !rounded-2xl !px-6 !py-2`} sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className={`font-medium text-black w-full ${(data.branchTime && Object.keys(data.branchTime).length > 0) || data.purity ? '' : '!cursor-default *:!my-3'}`}
                                                expandIcon={''}>
                                                <div className="w-full flex flex-col">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div className="flex flex-col gap-y-2">
                                                            <span className="flex items-center gap-x-4">
                                                                <ShoppingCartIcon />
                                                                <span className="flex items-center gap-x-4">
                                                                    {data.product?.name}
                                                                </span>
                                                            </span>
                                                            <span>
                                                                {((data.amount || data.amountOrCount || 0) + (data.product?.isQuantitative ? 0 : (data.differenceAmount || 0))).toLocaleString('en-US', { maximumFractionDigits: 3 })}&nbsp;
                                                                {data.product?.isQuantitative ? 'عدد' : 'گرم'}
                                                                {data.product?.price ? <span>&nbsp;({(
                                                                    ((data.product?.price || 0) +
                                                                        (data.product?.wageType === 'Fixed'
                                                                            ? data.product?.wage
                                                                            : data.product?.wageType === 'Percent'
                                                                                ? (data.product?.price || 0) * (data.product?.wage / 100)
                                                                                : 0) * (data.amount || data.amountOrCount || 0))
                                                                ).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان)</span> :
                                                                    data.product?.isQuantitative ?
                                                                        <span>&nbsp;({(data.weight || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم) &nbsp;(اجرت: {(data.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} {data.product?.wageType == 'Fixed' ? 'تومان' : 'درصد'})</span> : ''}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col gap-y-2 items-end">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            <span className="block">
                                                                {data.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">موفق</span> : ''}
                                                                {data.status == 'Pending' ? <span className="text-primary">در انتظار تائید</span> : ''}
                                                                {data.status == 'Rejected' ? <span className="text-sell cursor-pointer hover:underline" onClick={handleShowReject(data)}>ناموفق</span> : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {(data.branchTime && Object.keys(data.branchTime).length > 0) || data.purity ? <div className="flex items-center justify-center">
                                                        <IconButton color={darkModeToggle ? 'white' : 'black'} className="p-1 xl:-mx-8 -rotate-90">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                <path d="M13.26 15.53L9.74 12L13.26 8.46997" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                        </IconButton>
                                                    </div> : ''}
                                                </div>
                                            </AccordionSummary>
                                            {(data.branchTime && Object.keys(data.branchTime).length > 0) || data.purity ? <AccordionDetails className="custom-accordion-text !px-2 !pb-4">
                                                <div className="flex flex-col gap-y-4 w-full text-sm text-black dark:text-alert-warning-foreground mt-4">
                                                    {!data?.product?.price &&
                                                        !data?.product?.isQuantitative ? <>
                                                        <span className="text-black dark:text-white">شماره انگ: {data?.purity || '------'}</span>
                                                        <span className="text-black dark:text-white">نام آزمایشگاه: {data?.labName || '------'}</span>
                                                        <Divider component="div" className="dark:bg-primary dark:bg-opacity-50" />
                                                    </> : ''}
                                                    {data.branchTime && Object.keys(data.branchTime).length > 0 ?
                                                        <>
                                                            <span>
                                                                {data.branchTime?.branch?.nameFa} <br /> آدرس: <span className="whitespace-break-spaces">{data.branchTime?.branch?.address}</span> <br />
                                                                شماره تماس شعبه: <PatternFormat displayType="text" value={data.branchTime?.branch?.phone} format="#### ### ## ##" dir="ltr" />
                                                            </span>
                                                            <span className="whitespace-break-spaces">
                                                                زمان مراجعه: {moment(data.branchTime?.startTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')} الی {moment(data.branchTime?.endTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')}
                                                            </span>
                                                        </> : ''}
                                                </div>
                                            </AccordionDetails> : ''}
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">سبد تحویل فیزیکی خالی می باشد.</span>
                                </div> : ''}
                            {tabValue == 6 ?
                                tradeablesInventories.length > 0 ? tradeablesInventories.map((data, index) => {
                                    return (
                                        <Accordion key={index} className="custom-accordion disable col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className="font-medium text-black w-full !cursor-default *:!my-3"
                                                expandIcon={''}>
                                                <div className="w-full flex flex-col gap-y-4">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div className="flex flex-col items-start gap-y-2">
                                                            <span className="flex items-center gap-x-4">
                                                                <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} alt={data.tradeable?.name}
                                                                    className="w-10 h-10 rounded-[50%]" />
                                                                <span>{data.tradeable?.nameFa}</span>
                                                            </span>
                                                            {data.blocked ? <Chip label="بلوکه شده" variant="outlined" size="small" className="w-fit badge badge-error" /> :
                                                                <Chip label="در دسترس" variant="outlined" size="small" className="w-fit badge badge-success" />}
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span>{(data?.balance || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionSummary>
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">کیف پولها خالی می باشد.</span>
                                </div> : ''}
                            {(siteInfo?.paidModules && siteInfo?.paidModules?.includes('OrderBook')) ? tabValue == 7 ?
                                transactions.length > 0 ? transactions.map((data, index) => {
                                    return (
                                        <Accordion key={index} className="custom-accordion col-span-12 !rounded-2xl !py-2" sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className="font-medium text-black w-full *:!my-3"
                                                expandIcon={''}>
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div>
                                                            <span className="flex items-center gap-x-4">
                                                                {data.type == 'Buy' ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path>
                                                                </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M8.238 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.61-4.801L6.24 4.529a.75.75 0 1 0 1.307.73l1.344-2.4a.75.75 0 0 0-.652-1.114zm6.492 1.484c-3.145 0-5.745 2.421-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.064 6.062 6.064 3.145 0 5.742-2.421 6.031-5.492 3.068-.293 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.063-6.062zm0 2.002a4.044 4.044 0 0 1 4.064 4.061c0 2.105-1.593 3.764-3.637 3.982a6.051 6.051 0 0 0-1.316-2.502 3.242 3.242 0 0 0-.273-.315 3.263 3.263 0 0 0-.338-.292 6.044 6.044 0 0 0-2.48-1.287c.212-2.05 1.87-3.647 3.98-3.647zm-5.453 5.463c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.749.749 0 0 0-.746.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.308-.73l-1.342 2.4a.75.75 0 0 0 .653 1.114 6.504 6.504 0 0 0 6.494-6.494.75.75 0 0 0-.752-.748z"></path>
                                                                </svg>}
                                                                {data.type == 'Buy' ? 'خرید' : 'فروش'} {data.tradeable ? <span>{data.tradeable?.nameFa}</span> : ''}</span>
                                                            {data.status == 'Finished' ? (data.wage > 0 && data.totalPrice > 0) ? data.type == 'Buy' ?
                                                                <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}+
                                                                    </span> گرم</span> : <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}-
                                                                    </span> گرم</span> : <span className="block text-lg mt-2">
                                                                <span className="ltr">
                                                                    {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}
                                                                </span> گرم</span> : data.type == 'Buy' ?
                                                                <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}+
                                                                    </span> گرم</span> : <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}-
                                                                    </span> گرم</span>}
                                                        </div>
                                                        <div className="flex items-center gap-x-2">
                                                            <div className="flex flex-col items-end text-start">
                                                                <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                    .locale('fa')
                                                                    .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                                <span className="block mt-2">
                                                                    <span>وضعیت: </span>
                                                                    {data.status == 'Queued' ? <span className="text-primary">در صف انتظار</span> : ''}
                                                                    {data.status == 'Processing' ? <span className="text-blue-500">جدید</span> : ''}
                                                                    {data.status == 'InProgress' ? <span className="text-blue-500">در حال پردازش</span> : ''}
                                                                    {data.status == 'Finished' ? (data.wage > 0 && data.totalPrice > 0) ?
                                                                        <span className="text-secondary-green dark:text-buy">تکمیل شده</span> :
                                                                        <span className="text-sell">انجام نشده</span> : ''}
                                                                    {data.status == 'Canceled' ? <span className="text-sell">لغو شده</span> : ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionSummary>
                                            <AccordionDetails className="custom-accordion-text !px-4 !pb-4">
                                                <div className="w-full grid grid-cols-12 gap-4">
                                                    <div className="col-span-6 md:col-span-3 flex flex-col items-start md:items-center">
                                                        <span>مبلغ معامله: </span>
                                                        {data.totalPrice > 0 ? `${(data.totalPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` : '------'}
                                                    </div>
                                                    <div className="col-span-6 md:col-span-3 flex flex-col items-start md:items-center">
                                                        <span>قیمت معامله: </span>
                                                        {data.avgPrice > 0 ? `${(data.avgPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` : '------'}
                                                    </div>

                                                    <div className="col-span-6 md:col-span-3 flex flex-col items-start md:items-center">
                                                        <span>پیشرفت: </span>
                                                        {parseInt(((data.amount - data.remainingAmount || 0) * 100) / data.amount) != 0 ?
                                                            `${parseInt(((data.amount - data.remainingAmount || 0) * 100) / data.amount)}%` : 0}
                                                    </div>
                                                    <div className="col-span-6 md:col-span-3 flex flex-col items-start md:items-center">
                                                        <span>کارمزد معامله: </span>
                                                        {data.wage > 0 ? data.type == 'Buy' ?
                                                            `${(data.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 5 })} گرم`
                                                            : `${(data.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان`
                                                            : '------'}
                                                    </div>
                                                </div>
                                            </AccordionDetails>
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">هنوز معامله ای انجام نشده است.</span>
                                </div> : '' : ''}
                            {tabValue == 8 ?
                                transfers.length > 0 ? transfers.map((data, index) => {
                                    return (
                                        <Accordion key={index} className="custom-accordion disable col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className="font-medium text-black w-full !cursor-default *:!my-3"
                                                expandIcon={''}>
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div>
                                                            <span className="flex items-center gap-x-4">
                                                                {data.senderUser?._id != userInfo?._id ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path>
                                                                </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M8.238 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.61-4.801L6.24 4.529a.75.75 0 1 0 1.307.73l1.344-2.4a.75.75 0 0 0-.652-1.114zm6.492 1.484c-3.145 0-5.745 2.421-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.064 6.062 6.064 3.145 0 5.742-2.421 6.031-5.492 3.068-.293 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.063-6.062zm0 2.002a4.044 4.044 0 0 1 4.064 4.061c0 2.105-1.593 3.764-3.637 3.982a6.051 6.051 0 0 0-1.316-2.502 3.242 3.242 0 0 0-.273-.315 3.263 3.263 0 0 0-.338-.292 6.044 6.044 0 0 0-2.48-1.287c.212-2.05 1.87-3.647 3.98-3.647zm-5.453 5.463c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.749.749 0 0 0-.746.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.308-.73l-1.342 2.4a.75.75 0 0 0 .653 1.114 6.504 6.504 0 0 0 6.494-6.494.75.75 0 0 0-.752-.748z"></path>
                                                                </svg>}
                                                                {data.senderUser?._id == userInfo?._id ? 'انتقال' : 'دریافت'} {data.tradeable ? <span>{data.tradeable?.nameFa}</span> : ''}</span>
                                                            {data.senderUser?._id != userInfo?._id ?
                                                                <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}+
                                                                    </span> گرم</span> : <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}-
                                                                    </span> گرم</span>}
                                                        </div>
                                                        <div className="flex flex-col items-end text-start">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            <span className="block mt-2">
                                                                <span>وضعیت: </span>
                                                                {data.status == 'Accepted' ? data.paid ? <span className="text-secondary-green dark:text-buy">پرداخت شده</span> :
                                                                    <span className="text-secondary-green dark:text-buy">تائید شده</span> : ''}
                                                                {data.status == 'Pending' ? data.type == 'PayLaterBuy' && !data.paid ? <span className="text-primary cursor-pointer hover:underline" onClick={handleOpenDialog(data._id)}>در انتظار پرداخت</span> :
                                                                    <span className="text-primary">در انتظار تائید</span> : ''}
                                                                {data.status == 'Rejected' ? <span className="text-sell cursor-pointer hover:underline" onClick={handleShowReject(data)}>رد شده</span> : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-center">
                                                        <IconButton color={darkModeToggle ? 'white' : 'black'} className="p-1 xl:-mx-8 -rotate-90">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                <path d="M13.26 15.53L9.74 12L13.26 8.46997" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                        </IconButton>
                                                    </div>
                                                </div>
                                            </AccordionSummary>
                                            <AccordionDetails className="custom-accordion-text !px-4 !pb-4">
                                                <span className="dark:text-white">{data.senderUser?._id == userInfo?._id ? 'به حساب کاربر' : 'از حساب کاربر'} : {data.senderUser?._id == userInfo?._id ? <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data.receiverUser?._id}`}>
                                                    <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                                        <span>({data.receiverUser?.mobileNumber}) {data.receiverUser?.firstName} {data.receiverUser?.lastName}</span>
                                                    </a>
                                                </LinkRouter> : <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data.senderUser?._id}`}>
                                                    <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                                        <span>({data.senderUser?.mobileNumber}) {data.senderUser?.firstName} {data.senderUser?.lastName}</span>
                                                    </a>
                                                </LinkRouter>}</span>
                                            </AccordionDetails>
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">تاکنون انتقالی انجام نشده است.</span>
                                </div>
                                : ''}
                            {tabValue == 10 ?
                                transactions.length > 0 ? transactions.map((data, index) => {
                                    return (
                                        <Accordion key={index} className="custom-accordion col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className="font-medium text-black w-full *:!my-3"
                                                expandIcon={''}>
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div>
                                                            <span className="flex items-center gap-x-4 whitespace-nowrap">
                                                                <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M12.9 1.42c-.33 0-.66.059-.97.176a1 1 0 0 0-.003 0l-7.26 2.742c-1.4.53-2.33 1.88-2.33 3.377v4.81a6.144 6.144 0 0 0-.476 7.058 6.13 6.13 0 0 0 5.28 2.994c1.196 0 2.32-.344 3.27-.948a1 1 0 0 0 .17.034h6.694c2.437 0 4.438-2.003 4.438-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2-4.438-4.438-4.438h-1.643V4.16a2.728 2.728 0 0 0-1.18-2.251 2.738 2.738 0 0 0-1.553-.489zm-.094 2.006a.754.754 0 0 1 .51.125.73.73 0 0 1 .23.266.736.736 0 0 1 .086.341 1 1 0 0 0 0 .002v2.473H6.777c-.879 0-1.7.264-2.393.711.12-.516.48-.941.99-1.135l7.26-2.742a.721.721 0 0 1 .172-.04zM6.777 8.633h10.5a2.435 2.435 0 0 1 2.438 2.438v.318h-.847c-.771 0-1.5.312-2.023.846a2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904l.05-.084c.57-.93.895-2.024.895-3.176a6.172 6.172 0 0 0-3.502-5.564 6.159 6.159 0 0 0-5.467.063 2.434 2.434 0 0 1 2.43-2.268zm.477 3.6a4.177 4.177 0 0 1 3.42 1.947c.419.666.64 1.436.64 2.223 0 .783-.217 1.52-.6 2.14a1 1 0 0 0-.01.02 3.66 3.66 0 0 1-.802.954 1 1 0 0 0-.027.023 4.039 4.039 0 0 1-2.734 1.037 1 1 0 0 0-.002 0 4.137 4.137 0 0 1-3.563-2.019 1 1 0 0 0-.005-.014 4.07 4.07 0 0 1-.604-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .005-.003 4.17 4.17 0 0 1 2.721-.915zm11.61 1.156h1.816v1.748h-1.705c-.5 0-.945-.37-.98-.793a1 1 0 0 0-.003-.012.83.83 0 0 1 .254-.68 1 1 0 0 0 .018-.017.803.803 0 0 1 .6-.246zm-11.73.568a.75.75 0 0 0-.75.75v.907h-.94a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75h.94v.986a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75v-.986h.945a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75h-.945v-.907a.75.75 0 0 0-.75-.75z">

                                                                    </path>
                                                                </svg>
                                                                {LogActions(data.action)}</span>
                                                            {data.change == 0 ? <span className="block text-lg text-black dark:text-white mt-2">
                                                                <span className="ltr">
                                                                    {(data.change || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                                </span> تومان</span> : data.change > 0 ?
                                                                <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                    <span className="ltr">
                                                                        {(data.change || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}+
                                                                    </span> تومان</span> : <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {(Number(data.change?.toString()?.replace('-', '') || 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })}-
                                                                    </span> تومان</span>}
                                                        </div>
                                                        <div className="flex flex-col items-end text-start">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            <span className="block text-end mt-2">
                                                                <span>موجودی: </span>
                                                                <span dir="ltr">{(data.balance || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> تومان
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-center">
                                                        <IconButton color={darkModeToggle ? 'white' : 'black'} className="p-1 xl:-mx-8 -rotate-90">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                <path d="M13.26 15.53L9.74 12L13.26 8.46997" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                        </IconButton>
                                                    </div>
                                                </div>
                                            </AccordionSummary>
                                            <AccordionDetails className="custom-accordion-text !px-2 !pb-4">
                                                <div className="flex flex-col">
                                                    <span>توضیحات: </span>
                                                    {data.action == 'ReferralReward' ?
                                                        <p className="whitespace-pre-line m-0">پاداش دعوت {data.description} نفر</p> :
                                                        <p className="whitespace-pre-line m-0">{data.description ? (data.description) : '----'}</p>}</div>
                                            </AccordionDetails>
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">هنوز تراکنشی انجام نشده است.</span>
                                </div> : ''}
                            {tabValue == 11 ?
                                inviteds.length > 0 ? inviteds.map((data, index) => {
                                    return (
                                        <Accordion key={index} className="custom-accordion disable col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className="font-medium text-black w-full !cursor-default *:!my-3"
                                                expandIcon={''}>
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div className="flex flex-col items-start">
                                                            <span className="flex items-center gap-x-4">
                                                                <svg width="24" height="24" viewBox="0 0 24 24" className="svg-icon text-black dark:text-white">
                                                                    <path d="M12 12.75C8.83 12.75 6.25 10.17 6.25 7C6.25 3.83 8.83 1.25 12 1.25C15.17 1.25 17.75 3.83 17.75 7C17.75 10.17 15.17 12.75 12 12.75ZM12 2.75C9.66 2.75 7.75 4.66 7.75 7C7.75 9.34 9.66 11.25 12 11.25C14.34 11.25 16.25 9.34 16.25 7C16.25 4.66 14.34 2.75 12 2.75Z" fill="currentColor" />
                                                                    <path d="M20.5901 22.75C20.1801 22.75 19.8401 22.41 19.8401 22C19.8401 18.55 16.3202 15.75 12.0002 15.75C7.68015 15.75 4.16016 18.55 4.16016 22C4.16016 22.41 3.82016 22.75 3.41016 22.75C3.00016 22.75 2.66016 22.41 2.66016 22C2.66016 17.73 6.85015 14.25 12.0002 14.25C17.1502 14.25 21.3401 17.73 21.3401 22C21.3401 22.41 21.0001 22.75 20.5901 22.75Z" fill="currentColor" />
                                                                </svg>
                                                                <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data._id}`}>
                                                                    <a target="_blank" className="no-underline text-blue-400 hover:underline text-start">
                                                                        <span>({data.mobileNumber}) {data.firstName} {data.lastName}</span>
                                                                    </a>
                                                                </LinkRouter></span>
                                                            <span className="block mt-2">
                                                                <span>وضعیت احراز: </span>
                                                                {(siteInfo?.offlineFirstStepUserVerifyEnabled || siteInfo?.onlineFirstStepUserVerifyEnabled) ?
                                                                    <>
                                                                        {data.verificationStatus == 'NotVerified' ? <span className="text-sell">احراز نشده</span> : ''}
                                                                        {data.verificationStatus == 'FirstLevelVerified' && siteInfo?.secondStepUserVerifyEnabled ?
                                                                            <span className="text-secondary-green dark:text-buy">احراز پایه</span> : ''}
                                                                        {data.verificationStatus == 'FirstLevelVerified' && !siteInfo?.secondStepUserVerifyEnabled ?
                                                                            <span className="text-secondary-green dark:text-buy">احراز شده</span> : ''}
                                                                        {data.verificationStatus == 'SecondLevelRejected' || data.verificationStatus == 'FirstLevelRejected' ?
                                                                            <span className="text-sell">احراز رد شده</span> : ''}
                                                                        {data.verificationStatus == 'PendingSecondLevel' || data.verificationStatus == 'PendingFirstLevel' ?
                                                                            <span className="text-blue-500">در انتظار تائید</span> : ''}
                                                                        {data.verificationStatus == 'SecondLevelVerified' ?
                                                                            <span className="text-secondary-green dark:text-buy">احراز کامل</span> : ''}
                                                                    </> :
                                                                    <span className="text-secondary-green dark:text-buy">احراز شده</span>}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col items-end text-start">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            <span className="block mt-2">
                                                                <span>وضعیت حساب: </span>
                                                                {data.isActive ? <span className="text-secondary-green dark:text-buy">فعال</span> :
                                                                    <span className="text-sell cursor-pointer">غیرفعال</span>}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionSummary>
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">هنوز دعوتی انجام نشده است.</span>
                                </div> : ''}
                            {tabValue == 12 ?
                                <>
                                    {transactions.length > 0 ? transactions.map((data, index) => {
                                        return (
                                            <Accordion key={index} className="custom-accordion col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                                <AccordionSummary
                                                    className="font-medium text-black w-full *:!my-3 !px-0"
                                                    expandIcon={''}>
                                                    <div className="w-full">
                                                        <div className="flex items-center justify-between gap-x-2">
                                                            <div className="flex flex-col">
                                                                <span className="flex items-center gap-x-4">
                                                                    {data.tradeable ?
                                                                        <img
                                                                            crossOrigin="anonymous"
                                                                            src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`}
                                                                            alt={data.tradeable?.name}
                                                                            className="w-8 h-8 rounded-[50%]"
                                                                        />
                                                                        : ''}
                                                                    <span>گیفت کارت {data.tradeable?.nameFa} {data.weight || 0} گرمی</span>
                                                                </span>
                                                                <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {data.buyWithToman ? `${(data.totalCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}-` :
                                                                            `${(data.weight || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })}-`}

                                                                    </span> &nbsp;
                                                                    {data.buyWithToman ? 'تومان' : 'گرم'}</span>
                                                            </div>
                                                            <div className="flex flex-col items-end text-end">
                                                                <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                    .locale('fa')
                                                                    .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                                <span className="flex items-center gap-x-2 mt-2">
                                                                    <span>وضعیت: </span>
                                                                    {data.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">تائید شده</span> : ''}
                                                                    {data.status == 'Pending' ? <span className="text-primary">در انتظار تائید</span> : ''}
                                                                    {data.status == 'Rejected' ? <span className="text-sell cursor-pointer hover:underline" onClick={handleShowReject(data)}>رد شده</span> : ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-center">
                                                            <IconButton color={darkModeToggle ? 'white' : 'black'} className="p-1 xl:-mx-8 -rotate-90">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                    <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                    <path d="M13.26 15.53L9.74 12L13.26 8.46997" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                </svg>
                                                            </IconButton>
                                                        </div>
                                                    </div>
                                                </AccordionSummary>
                                                <AccordionDetails className="custom-accordion-text !px-2 !pb-4">
                                                    <div className="w-full flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span>کد گیفت کارت: </span>
                                                            {data.status == 'Accepted' ? <div className="flex items-center gap-x-2">
                                                                <span>{data.code}</span>
                                                                <IconButton onClick={CopyData(data.code)}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                                        <path d="M9.24984 18.9582H5.74984C2.4915 18.9582 1.0415 17.5082 1.0415 14.2498V10.7498C1.0415 7.4915 2.4915 6.0415 5.74984 6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V14.2498C13.9582 17.5082 12.5082 18.9582 9.24984 18.9582ZM5.74984 7.2915C3.1665 7.2915 2.2915 8.1665 2.2915 10.7498V14.2498C2.2915 16.8332 3.1665 17.7082 5.74984 17.7082H9.24984C11.8332 17.7082 12.7082 16.8332 12.7082 14.2498V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H5.74984Z" fill="#F1C40F" />
                                                                        <path d="M14.2498 13.9582H13.3332C12.9915 13.9582 12.7082 13.6748 12.7082 13.3332V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H6.6665C6.32484 7.2915 6.0415 7.00817 6.0415 6.6665V5.74984C6.0415 2.4915 7.4915 1.0415 10.7498 1.0415H14.2498C17.5082 1.0415 18.9582 2.4915 18.9582 5.74984V9.24984C18.9582 12.5082 17.5082 13.9582 14.2498 13.9582ZM13.9582 12.7082H14.2498C16.8332 12.7082 17.7082 11.8332 17.7082 9.24984V5.74984C17.7082 3.1665 16.8332 2.2915 14.2498 2.2915H10.7498C8.1665 2.2915 7.2915 3.1665 7.2915 5.74984V6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V12.7082Z" fill="#F1C40F" />
                                                                    </svg>
                                                                </IconButton>
                                                            </div> : '------'}
                                                        </div>
                                                        <span className="flex flex-col">
                                                            <span>بارکد: </span>
                                                            {data.code && data.status == 'Accepted' ? <div id={`qrcode${index}`} className="qrcode-container w-10 h-10 cursor-pointer" onClick={openInNewTab(index)}>
                                                                <Image
                                                                    text={data.code}
                                                                    options={{
                                                                        level: 'M',
                                                                        margin: 3,
                                                                        scale: 4,
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        color: {
                                                                            dark: '#000000',
                                                                            light: '#ffffff',
                                                                        },
                                                                    }}
                                                                />
                                                            </div> : '------'}
                                                        </span>
                                                    </div>
                                                    <div className="w-full flex items-center justify-between mt-4">
                                                        <div className="flex flex-col">
                                                            <span>استفاده شده:</span>
                                                            {data.used ? <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data.usedBy?._id}`}>
                                                                <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                                                    <span>({data.usedBy?.mobileNumber}) {data.usedBy?.firstName} {data.usedBy?.lastName}</span>
                                                                </a>
                                                            </LinkRouter> :
                                                                <Chip label="خیر" variant="outlined" size="small" className="w-fit px-8 mt-1 badge badge-error" />}
                                                        </div>
                                                        {data.createdBy?.role == 'User' || data.createdBy?.role == 'VIPUser' ? <span className="flex flex-col">
                                                            <span>هزینه آماده سازی:</span>
                                                            <span>{(data.preparationCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                                        </span> : ''}
                                                    </div>
                                                    {data.address ?
                                                        <div className="w-full flex flex-col gap-y-4 mt-4">
                                                            <div className="w-full flex items-center justify-between">
                                                                <div className="flex flex-col gap-y-1 dark:text-white">
                                                                    <span>هزینه ارسال:</span>
                                                                    <span>{(data.shippingCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                                                </div>
                                                                <div className="flex flex-col gap-y-1 dark:text-white">
                                                                    <span>کد پستی:</span>
                                                                    <span>{data.postalCode}</span>
                                                                </div>
                                                            </div>
                                                            <div className="w-full dark:text-white">
                                                                <span>آدرس: {data.address}</span>
                                                            </div>
                                                        </div> : (data.branchTime && Object.keys(data.branchTime).length > 0) ? <div className="w-full flex flex-col gap-y-4 mt-4">
                                                            <span>
                                                                {data.branchTime?.branch?.nameFa} <br /> آدرس: <span className="whitespace-break-spaces">{data.branchTime?.branch?.address}</span> <br />
                                                                شماره تماس شعبه: <PatternFormat displayType="text" value={data.branchTime?.branch?.phone} format="#### ### ## ##" dir="ltr" />
                                                            </span>
                                                            <span className="whitespace-break-spaces">
                                                                زمان مراجعه: {moment(data.branchTime?.startTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')} الی {moment(data.branchTime?.endTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')}
                                                            </span>
                                                        </div> : ''}
                                                </AccordionDetails>
                                            </Accordion>
                                        )
                                    }) : <div className="col-span-12 py-16">
                                        <span className="block text-center text-large-1 text-primary-gray">درخواستی ثبت نشده است.</span>
                                    </div>}
                                </> : ''}
                            {Math.ceil(transactionsTotal / transactionsLimit) > 1 ?
                                <div className="col-span-12 text-center mt-4">
                                    <Pagination siblingCount={0} count={Math.ceil(transactionsTotal / transactionsLimit)} variant="outlined" color="primary" className="justify-center"
                                        page={pageItem} onChange={handlePageChange} />
                                </div>
                                : ''}
                        </div>}

                </div>
            </section> : ''}

            {/* EditUser */}
            <>
                <Dialog onClose={() => setShowEditUser(false)} open={showEditUser} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش کاربر
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
                                    label="نام کاربر"
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
                                    label="نام خانوادگی کاربر"
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
                                    format="### ### ## ##"
                                    customInput={TextField}
                                    type="tel"
                                    color="primary"
                                    label="کدملی کاربر"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={userData?.nationalCode}
                                    onValueChange={handleChangeEditData('nationalCode', 'nationalCodeFormat')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <PatternFormat
                                    format="#### ### ## ##"
                                    customInput={TextField}
                                    type="tel"
                                    color="primary"
                                    label="شماره تلفن همراه"
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
                                <DatePicker name="datePicker" timePicker={false} isGregorian={isGregorian} className="form-input hidden" onChange={birthDatepicker} />
                                <TextField
                                    type="text"
                                    color={'primary'}
                                    label="تاریخ تولد کاربر"
                                    variant="outlined"
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
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <TextField
                                    type={showPassword ? "text" : "password"}
                                    label="رمز عبور کاربر"
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
                        {(siteInfo?.paidModules && siteInfo?.paidModules?.includes('OrderBook')) ? <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between text-end m-0"
                                    control={<CustomSwitch
                                        checked={userData?.orderBookIsActive}
                                        onChange={handleChangeEditData('orderBookIsActive', 'checkbox')}
                                    />}
                                    label={`فعالسازی معاملات پیشرفته ؟`} />
                            </FormGroup>
                        </div> : ''}
                    </form>
                    <div className="text-end">
                        <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                            onClick={editUser}>
                            <text className="text-black font-semibold">ویرایش کاربر</text>
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
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش کاربر
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
                                    label="نام کاربر"
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
                                    label="نام خانوادگی کاربر"
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
                                    format="### ### ## ##"
                                    customInput={TextField}
                                    type="tel"
                                    color="primary"
                                    label="کدملی کاربر"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={userData?.nationalCode}
                                    onValueChange={handleChangeEditData('nationalCode', 'nationalCodeFormat')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <PatternFormat
                                    format="#### ### ## ##"
                                    customInput={TextField}
                                    type="tel"
                                    color="primary"
                                    label="شماره تلفن همراه"
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
                                <DatePicker name="datePicker" timePicker={false} isGregorian={isGregorian} className="form-input hidden" onChange={birthDatepicker} />
                                <TextField
                                    type="text"
                                    color={'primary'}
                                    label="تاریخ تولد کاربر"
                                    variant="outlined"
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
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type={showPassword ? "text" : "password"}
                                    label="رمز عبور کاربر"
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
                        {(siteInfo?.paidModules && siteInfo?.paidModules?.includes('OrderBook')) ? <div className="col-span-12 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between text-end m-0"
                                    control={<CustomSwitch
                                        checked={userData?.orderBookIsActive}
                                        onChange={handleChangeEditData('orderBookIsActive', 'checkbox')}
                                    />}
                                    label={`فعالسازی معاملات پیشرفته ؟`} />
                            </FormGroup>
                        </div> : ''}
                    </form>
                    <div className="text-end">
                        <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                            onClick={editUser}>
                            <text className="text-black font-semibold">ویرایش کاربر</text>
                        </LoadingButton>
                    </div>
                </SwipeableDrawer>
            </>

            {/* ChangeAuthStatus */}
            <>
                <Dialog onClose={() => setShowChangeAuthStatusDialog(false)} open={showChangeAuthStatusDialog} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'}>تغییر وضعیت احراز هویت</Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
                        <div className="col-span-12">
                            <MUISelect
                                type="text"
                                variant="filled"
                                color="black"
                                label="انتخاب وضعیت"
                                className="form-select w-full"
                                value={userAuthStatus}
                                onChange={(event) => setUserAuthStatus(event.target.value)}
                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                <MenuItem value="NotVerified" >احراز نشده</MenuItem>
                                {siteInfo?.secondStepUserVerifyEnabled ? <MenuItem value="FirstLevelVerified" >احراز پایه</MenuItem> : <MenuItem value="FirstLevelVerified" >احراز شده</MenuItem>}
                                {siteInfo?.secondStepUserVerifyEnabled ? <MenuItem value="SecondLevelVerified" >احراز کامل</MenuItem> : ''}
                            </MUISelect>
                        </div>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setShowChangeAuthStatusDialog(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={changeAuthStatusLoading}
                                onClick={changeUserAuthStatus(router.query?.id)}>
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
                    open={openBottomChangeAuthStatusDrawer}
                    onClose={() => setOpenBottomChangeAuthStatusDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'}>تغییر وضعیت احراز هویت</Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
                        <div className="col-span-12">
                            <MUISelect
                                type="text"
                                variant="filled"
                                color="black"
                                label="انتخاب وضعیت"
                                className="form-select w-full"
                                value={userAuthStatus}
                                onChange={(event) => setUserAuthStatus(event.target.value)}
                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                <MenuItem value="NotVerified" >احراز نشده</MenuItem>
                                {siteInfo?.secondStepUserVerifyEnabled ? <MenuItem value="FirstLevelVerified" >احراز پایه</MenuItem> : <MenuItem value="FirstLevelVerified" >احراز شده</MenuItem>}
                                {siteInfo?.secondStepUserVerifyEnabled ? <MenuItem value="SecondLevelVerified" >احراز کامل</MenuItem> : ''}
                            </MUISelect>
                        </div>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setOpenBottomChangeAuthStatusDrawer(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={changeAuthStatusLoading}
                                onClick={changeUserAuthStatus(router.query?.id)}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* Inquiry */}
            <>
                <Dialog onClose={() => setShowInquiryDialog(false)} open={showInquiryDialog} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'}><span>استعلام شماره موبایل</span></Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
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
                                        inputMode: 'decimal'
                                    }
                                }} />
                            {error && <FormHelperText className="text-red-500 mx-4">شماره موبایل نامعتبر می باشد</FormHelperText>}
                        </FormControl>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setShowInquiryDialog(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={inquiryLoading}
                                onClick={sendMobile}>
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
                    open={openBottomInquiryDrawer}
                    onClose={() => setOpenBottomInquiryDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'}><span>استعلام شماره موبایل</span></Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
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
                                        inputMode: 'decimal'
                                    }
                                }} />
                            {error && <FormHelperText className="text-red-500 mx-4">شماره موبایل نامعتبر می باشد</FormHelperText>}
                        </FormControl>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setOpenBottomInquiryDrawer(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={inquiryLoading}
                                onClick={sendMobile}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* ChargeWallet */}
            <>
                <Dialog onClose={() => setShowChargeWallet(false)} open={showChargeWallet} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'}>تغییر موجودی</Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off" onSubmit={handleSubmit(chargeUserTradeable)}>
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="tradeableId"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <InputLabel id="demo-simple-select-label" error={!!errors.tradeableId}
                                            sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                        {loadingTradeables ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} className="absolute top-[33%] rtl:left-[10px] ltr:right-[10px] z-10 translate-y-1/2" /> : ''}
                                        <MUISelect
                                            {...field}
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            onChange={(event) => { field.onChange(event); getTradeableInventory(event.target.value) }}
                                            input={<OutlinedInput
                                                id="select-multiple-chip"
                                                label="انتخاب واحد قابل معامله"
                                                className="dark:bg-dark *:dark:text-white"
                                                sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                            />}
                                            error={!!errors.tradeableId}
                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                            {tradeables?.map((data, index) => (
                                                <MenuItem key={index} value={data._id}>{data.nameFa}</MenuItem>
                                            ))}
                                        </MUISelect>
                                        {errors.tradeableId && <FormHelperText className="text-red-500 !mx-4">{errors.tradeableId.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="balance"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="موجودی"
                                            variant="outlined"
                                            disabled={loadingBalance}
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                },
                                                endAdornment: loadingBalance ?
                                                    <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} />
                                                    : ''
                                            }}
                                            error={!!errors.balance}
                                            helperText={errors.balance ? errors.balance.message : ''}
                                            value={chargeData?.balance}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                setChargeData({ ...chargeData, balance: Number(event.target.value?.replace(/,/g, '')) });
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setShowChargeWallet(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={chargeLoading}>
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
                    open={openBottomChargeWalletDrawer}
                    onClose={() => setOpenBottomChargeWalletDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'}>تغییر موجودی</Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off" onSubmit={handleSubmit(chargeUserTradeable)}>
                        <div className="col-span-12">
                            <Controller
                                name="tradeableId"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <InputLabel id="demo-simple-select-label" error={!!errors.tradeableId}
                                            sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                        {loadingTradeables ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} className="absolute top-[32%] rtl:left-[8px] ltr:right-[8px] rtl:md:left-[10px] ltr:md:right-[10px] z-10 translate-y-1/2" /> : ''}
                                        <MUISelect
                                            {...field}
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            onChange={(event) => { field.onChange(event); setChargeData({ ...chargeData, tradeableId: event.target.value }); getTradeableInventory(event.target.value) }}
                                            input={<OutlinedInput
                                                id="select-multiple-chip"
                                                label="انتخاب واحد قابل معامله"
                                                className="dark:bg-dark *:dark:text-white"
                                                sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                            />}
                                            error={!!errors.tradeableId}
                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                            {tradeables?.map((data, index) => (
                                                <MenuItem key={index} value={data._id}>{data.nameFa}</MenuItem>
                                            ))}
                                        </MUISelect>
                                        {errors.tradeableId && <FormHelperText className="text-red-500 !mx-4">{errors.tradeableId.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="balance"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="موجودی"
                                            variant="outlined"
                                            disabled={loadingBalance}
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                },
                                                endAdornment: loadingBalance ?
                                                    <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} />
                                                    : ''
                                            }}
                                            error={!!errors.balance}
                                            helperText={errors.balance ? errors.balance.message : ''}
                                            value={chargeData?.balance}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                setChargeData({ ...chargeData, balance: Number(event.target.value?.replace(/,/g, '')) });
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setOpenBottomChargeWalletDrawer(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={chargeLoading}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* Reject Description */}
            <>
                <Dialog onClose={() => setShowReject(false)} open={showReject} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <Typography component={'h2'}>علت رد شدن درخواست کاربر</Typography>
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
                                value={itemData?.confirmDescription || itemData?.rejectReason} />
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
                    <Typography component={'h2'}>علت رد شدن درخواست کاربر</Typography>
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
                                value={itemData?.confirmDescription || itemData?.rejectReason} />
                        </FormControl>
                        <Button type="button" variant="contained" size="medium" fullWidth className="rounded-lg" disableElevation
                            onClick={() => setOpenBottomRejectDrawer(false)}>
                            <text className="text-black font-semibold">بستن</text>
                        </Button >
                    </div>
                </SwipeableDrawer>
            </>

            {/* Change User Role Status */}
            <>
                <Dialog onClose={() => setShowChangeUserRoleStatusDialog(false)} open={showChangeUserRoleStatusDialog} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'}>تغییر نوع حساب کاربر</Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
                        <div className="col-span-12">
                            <MUISelect
                                type="text"
                                variant="filled"
                                color="black"
                                label="انتخاب نوع حساب"
                                className="form-select w-full"
                                value={userRoleStatus}
                                onChange={(event) => setUserRoleStatus(event.target.value)}
                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                <MenuItem value="User" >کاربر ساده</MenuItem>
                                <MenuItem value="VIPUser" >کاربر ویژه</MenuItem>
                            </MUISelect>
                        </div>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setShowChangeUserRoleStatusDialog(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={changeRoleStatusLoading}
                                onClick={changeUserRoleStatus(router.query?.id)}>
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
                    open={openBottomChangeUserRoleStatusDrawer}
                    onClose={() => setOpenBottomChangeUserRoleStatusDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'}>تغییر نوع حساب کاربر</Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
                        <div className="col-span-12">
                            <MUISelect
                                type="text"
                                variant="filled"
                                color="black"
                                label="انتخاب نوع حساب"
                                className="form-select w-full"
                                value={userRoleStatus}
                                onChange={(event) => setUserRoleStatus(event.target.value)}
                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                <MenuItem value="User" >کاربر ساده</MenuItem>
                                <MenuItem value="VIPUser" >کاربر ویژه</MenuItem>
                            </MUISelect>
                        </div>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setOpenBottomChangeUserRoleStatusDrawer(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={changeRoleStatusLoading}
                                onClick={changeUserRoleStatus(router.query?.id)}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* Change Toman Balance */}
            <>
                <Dialog onClose={() => { setShowChangeTomanBalanceDialog(false); setBalanceData({ ...balanceData, description: '', changeAmount: 0 }); setChangeAmount(0); setIsLoss('Add'); }} open={showChangeTomanBalanceDialog} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'}>تغییر موجودی تومانی</Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
                        <div className="col-span-12 w-full flex items-center">
                            <FormControl className="w-full">
                                <InputLabel id="demo-simple-select-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب نوع تغییر</InputLabel>
                                <MUISelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={isLoss}
                                    onChange={(event) => {
                                        setIsLoss(event.target.value);
                                        if (event.target.value == 'Add') {
                                            setBalanceData({ ...balanceData, changeAmount: Number(Math.abs(balanceData?.changeAmount || 0)) });
                                        } else {
                                            setBalanceData({ ...balanceData, changeAmount: balanceData?.changeAmount == 0 ? 0 : -(balanceData?.changeAmount || 0) });
                                        }
                                    }}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب نوع تغییر"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                    />}
                                    MenuProps={{ classes: { paper: 'w-full lg:w-[30%] 3xl:w-[24%] dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                    <MenuItem value="Add">افزوده شود</MenuItem>
                                    <MenuItem value="Remove">کسر شود</MenuItem>
                                </MUISelect>
                            </FormControl>
                        </div>
                        <FormControl className="w-full col-span-12">
                            <NumericFormat
                                thousandSeparator
                                decimalScale={0}
                                customInput={TextField}
                                type="tel"
                                label="مقدار (به تومان)"
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
                                value={changeAmount}
                                onValueChange={(event) => {
                                    setChangeAmount(event.value);
                                    if (isLoss == 'Add') {
                                        setBalanceData({ ...balanceData, changeAmount: Number(Math.abs(event.value || 0)) });
                                    } else {
                                        setBalanceData({ ...balanceData, changeAmount: event.value == 0 ? 0 : -(event.value || 0) });
                                    }
                                }}
                            />
                        </FormControl>
                        <FormControl className="w-full col-span-12">
                            <TextField
                                type="text"
                                label="توضیحات تغییر موجودی"
                                multiline
                                rows={4}
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                value={balanceData?.description}
                                onChange={(event) => setBalanceData({ ...balanceData, description: event.target.value })} />
                        </FormControl>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => { setShowChangeTomanBalanceDialog(false); setBalanceData({ ...balanceData, description: '', changeAmount: 0 }); setChangeAmount(0); setIsLoss('Add'); }}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation disabled={!(changeAmount > 0)} loading={loading}
                                onClick={changeTomanBalance}>
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
                    open={openBottomChangeTomanBalanceDrawer}
                    onClose={() => { setOpenBottomChangeTomanBalanceDrawer(false); setBalanceData({ ...balanceData, description: '', changeAmount: 0 }); setChangeAmount(0); setIsLoss('Add'); }}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'}>تغییر نوع حساب کاربر</Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
                        <div className="col-span-12 w-full flex items-center">
                            <FormControl className="w-full">
                                <InputLabel id="demo-simple-select-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب نوع تغییر</InputLabel>
                                <MUISelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={isLoss}
                                    onChange={(event) => {
                                        setIsLoss(event.target.value);
                                        if (event.target.value == 'Add') {
                                            setBalanceData({ ...balanceData, changeAmount: Number(Math.abs(balanceData?.changeAmount || 0)) });
                                        } else {
                                            setBalanceData({ ...balanceData, changeAmount: balanceData?.changeAmount == 0 ? 0 : -(balanceData?.changeAmount || 0) });
                                        }
                                    }}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب نوع تغییر"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                    />}
                                    MenuProps={{ classes: { paper: 'w-full lg:w-[30%] 3xl:w-[24%] dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                    <MenuItem value="Add">افزوده شود</MenuItem>
                                    <MenuItem value="Remove">کسر شود</MenuItem>
                                </MUISelect>
                            </FormControl>
                        </div>
                        <FormControl className="w-full col-span-12">
                            <NumericFormat
                                thousandSeparator
                                decimalScale={0}
                                customInput={TextField}
                                type="tel"
                                label="مقدار (به تومان)"
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
                                value={changeAmount}
                                onValueChange={(event) => {
                                    setChangeAmount(event.value);
                                    if (isLoss == 'Add') {
                                        setBalanceData({ ...balanceData, changeAmount: Number(Math.abs(event.value || 0)) });
                                    } else {
                                        setBalanceData({ ...balanceData, changeAmount: event.value == 0 ? 0 : -(event.value || 0) });
                                    }
                                }}
                            />
                        </FormControl>
                        <FormControl className="w-full col-span-12">
                            <TextField
                                type="text"
                                label="توضیحات تغییر موجودی"
                                multiline
                                rows={4}
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                value={balanceData?.description}
                                onChange={(event) => setBalanceData({ ...balanceData, description: event.target.value })} />
                        </FormControl>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => { setOpenBottomChangeTomanBalanceDrawer(false); setBalanceData({ ...balanceData, description: '', changeAmount: 0 }); setChangeAmount(0); setIsLoss('Add'); }}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation disabled={!(changeAmount > 0)} loading={loading}
                                onClick={changeTomanBalance}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >
                        </div>
                    </form>
                </SwipeableDrawer>
            </>
        </div>
    )
}

export default UserSinglePageCompo;