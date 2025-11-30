import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import LoadingButton from '@mui/lab/LoadingButton'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Pagination from '@mui/material/Pagination';
import Chip from '@mui/material/Chip';
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography';
import CancelIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline'
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'jalali-moment'
import DatePicker from "react-datepicker2"

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
import ConvertText from "../../services/convertPersianToEnglish";

// Components
import ConfirmDialog from '../shared/ConfirmDialog';

/**
 * UsersPageCompo component that displays the Users Page Component of the website.
 * @returns The rendered Users Page component.
 */
const UsersPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, priceInfo, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const USERS_TABLE_HEAD = [
        {
            label: 'کاربر',
            classes: ""
        },
        {
            label: 'کدملی',
            classes: ""
        },
        {
            label: 'موجودی تومان',
            classes: ""
        },
        {
            label: 'ثبت نام',
            classes: ""
        },
        {
            label: 'نوع حساب',
            classes: ""
        },
        {
            label: 'وضعیت احراز',
            classes: ""
        },
        {
            label: 'وضعیت حساب',
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
    const PENDING_USERS_TABLE_HEAD = [
        {
            label: 'کاربر',
            classes: ""
        },
        {
            label: 'کدملی',
            classes: ""
        },
        {
            label: 'تاریخ تولد',
            classes: ""
        },
        {
            label: 'مدارک',
            classes: ""
        },
        {
            label: 'ثبت نام',
            classes: ""
        },
        {
            label: 'نوع حساب',
            classes: ""
        },
        {
            label: 'وضعیت احراز',
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

    const [pageItem, setPageItem] = useState(1);
    // Sorting state: sortBy matches backend field name, sortOrder: 0 or 1 (backend expects numeric)
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState(0);
    const [firstLoading, setFirstLoading] = useState(true);
    useEffect(() => {
        getUsers(1, '');
    }, []);

    /**
        * Retrieves Users.
        * @returns None
       */
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [usersLimit, setUsersLimit] = useState(10);
    const [usersTotal, setUsersTotal] = useState(0);
    const getUsers = (page, status, search) => {
        setLoadingUsers(true);
        ApiCall('/user', 'GET', locale, {}, `${search ? `search=${search}&` : ''}${status ? `verificationStatus=PendingFirstLevel&verificationStatus=PendingSecondLevel&` : ''}roles=User&roles=VIPUser&sortOrder=${sortOrder}&sortBy=${sortBy}&limit=${usersLimit}&skip=${(page * usersLimit) - usersLimit}`, 'admin', router).then(async (result) => {
            setUsersTotal(result.count);
            setUsers(result.data);
            setLoadingUsers(false);
            setFirstLoading(false);
        }).catch((error) => {
            setLoadingUsers(false);
            setFirstLoading(false);
            console.log(error);
        });
    }

    // Toggle sort on 'tomanBalance' column
    const toggleSortByToman = () => {
        // if already sorting by tomanBalance flip order, otherwise start with descending (1)
        if (sortBy === 'tomanBalance') {
            setSortOrder(prev => 1 - prev);
        } else {
            setSortBy('tomanBalance');
            // default to descending so highest balances appear first
            setSortOrder(1);
        }
        // reload users from first page with new sort
        setPageItem(1);
        // give state a tick, then call getUsers using updated state in next tick
        setTimeout(() => {
            if (tabValue == 0) {
                getUsers(1, '');
            } else {
                getUsers(1, 'pendings');
            }
        }, 0);
    }

    const [tabValue, setTabValue] = useState(0);
    const handleChange = (event, newTabValue) => {
        setTabValue(newTabValue);
        setPageItem(1);
        if (newTabValue == 0) {
            getUsers(1, '');
        } else if (newTabValue == 1) {
            getUsers(1, 'pendings');
        }
    }

    const handlePageChange = (event, value) => {
        setPageItem(value);
        if (tabValue == 0) {
            getUsers(value, '');
        } else if (tabValue == 1) {
            getUsers(value, 'pendings');
        }
    }

    const [showAddUser, setShowAddUser] = useState(false);
    const [openBottomAddUserDrawer, setOpenBottomAddUserDrawer] = useState(false);
    const handleShowAddUser = () => {
        if (window.innerWidth >= 1024) {
            setShowAddUser(true);
            setOpenBottomAddUserDrawer(false);
        } else {
            setShowAddUser(false);
            setOpenBottomAddUserDrawer(true);
        }
    }

    /**
  * save user birth date with the selected date from the datepicker.
  * @param {Event} event - The event object containing the selected date.
  * @returns None
  */
    const [birthDate, setBirthDate] = useState('');
    const birthDatepicker = (event) => {
        setAddUser({ ...addUser, birthDate: event.locale(locale).format("YYYY-MM-DD") });
        if (locale == 'fa') {
            setBirthDate(event.locale(locale).format("jYYYY-jMM-jDD"));
        } else {
            setBirthDate(event.locale(locale).format("YYYY-MM-DD"));
        }
    }

    const [showPassword, setShowPassword] = useState(false);
    const [isGregorian, setIsGregorian] = useState(locale == "fa" ? false : true);
    const [addUser, setAddUser] = useState({
        mobileNumber: '',
        password: '',
        firstName: '',
        lastName: '',
        sex: 'Male',
        nationalCode: '',
        birthDate: ''
    });

    const validationSchema = Yup.object({
        mobileNumber: Yup.string()
            .required('این فیلد الزامی است')
            .transform(value => value.replace(/\s+/g, ''))
            .test('starts-with-09', 'شماره موبایل نامعتبر می باشد', value => value && value.startsWith('09'))
            .matches(
                /^(\+?98[\-\s]?|0)9[0-39]\d[\-\s]?\d{3}[\-\s]?\d{4}$/,
                'شماره موبایل نامعتبر می باشد'
            )
            .matches(/^\d{11}$/, 'شماره موبایل باید 11 رقم باشد'),
        password: Yup.string()
            .required('این فیلد الزامی است')
            .min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد')
            .matches(/[a-z]/, 'رمز عبور باید حداقل یک حرف کوچک انگلیسی باشد')
            .matches(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ انگلیسی باشد')
            .matches(/[0-9]/, 'رمز عبور باید حداقل یک عدد باشد'),
        firstName: Yup.string().required('این فیلد الزامی است'),
        lastName: Yup.string().required('این فیلد الزامی است'),
        nationalCode: Yup.string().required('این فیلد الزامی است')
            .transform(value => value.replace(/\s+/g, ''))
            .matches(/^\d{10}$/, 'کد ملی باید 10 رقم باشد'),
        birthDate: Yup.string().required('این فیلد الزامی است')
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const clearForm = () => {
        setValue('mobileNumber', '');
        setValue('password', '');
        setValue('firstName', '');
        setValue('lastName', '');
        setValue('nationalCode', '');
        setValue('birthDate', '');
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
        setAddUser((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
    * Save new User.
    * @returns None
   */
    const [loading, setLoading] = useState(false);
    const saveUser = () => {
        setLoading(true);
        ApiCall('/user', 'POST', locale, { ...addUser }, '', 'admin', router).then(async (result) => {
            setLoading(false);
            getUsers(pageItem, '');
            setShowAddUser(false);
            setOpenBottomAddUserDrawer(false);
            setAddUser({
                mobileNumber: '',
                password: '',
                firstName: '',
                lastName: '',
                sex: 'Male',
                nationalCode: '',
                birthDate: ''
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
            getUsers(pageItem, '');
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

    const [rejectDesc, setRejectDesc] = useState('');
    const [userId, setUserId] = useState('');
    const [userAuthStep, setUserAuthStep] = useState('');
    const [showReject, setShowReject] = useState(false);
    const [openBottomRejectDrawer, setOpenBottomRejectDrawer] = useState(false);
    const handleShowReject = (userId, type) => () => {
        setUserId(userId);
        setUserAuthStep(type);
        if (window.innerWidth >= 1024) {
            setShowReject(true);
            setOpenBottomRejectDrawer(false);
        } else {
            setShowReject(false);
            setOpenBottomRejectDrawer(true);
        }
    }
    /**
     * Rejcet or Accept User Auth.
     * @returns None
    */
    const changeUserAuthStatus = (userId, status) => (event) => {
        event.preventDefault();
        if ((status == 'SecondLevelVerified' || status == 'FirstLevelVerified') || rejectDesc) {
            setLoading(true);
            event.target.disabled = true;
            let body = status == 'SecondLevelVerified' || status == 'FirstLevelVerified' ? { userId, status } : { userId, status, verifyDescription: rejectDesc }
            ApiCall(status == 'SecondLevelVerified' || status == 'SecondLevelRejected' ? `/user/second-step-verify/confirm` : `/user/offline-first-step-verify/confirm`, 'PATCH', locale, body, '', 'admin', router).then(async (result) => {
                event.target.disabled = false;
                setLoading(false);
                getUsers(pageItem, 'pendings');
                setShowReject(false);
                setOpenBottomRejectDrawer(false);
                setRejectDesc('');
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
    }

    /**
     * Search for a user based on the input value and filter the displayed users accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchUsers, setSearchUsers] = useState('');
    var typingTimerUsers;
    const doneTypingIntervalUsers = 300;
    const searchUsersItems = (event) => {
        clearTimeout(typingTimerUsers);

        typingTimerUsers = setTimeout(() => {
            if (event.target.value == '') {
                setSearchUsers('');
                setPageItem(1);
                getUsers(1, tabValue == 0 ? '' : 'pendings', '');
            } else {
                setSearchUsers(event.target.value);
                setPageItem(1);
                getUsers(1, tabValue == 0 ? '' : 'pendings', event.target.value);
            }
        }, doneTypingIntervalUsers);

    }
    const searchUsersItemsHandler = () => {
        clearTimeout(typingTimerUsers)
    }

    const [openDialog, setOpenDialog] = useState(false);
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
            setDeleteLoading(false);
            getUsers(pageItem, '');
            setUserId('');
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

    return (
        <div className=" flex flex-col gap-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-large-2">کاربران</h1>
                <div className="flex items-center gap-x-4">
                    <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                        onClick={handleShowAddUser}>
                        <text className="text-black font-semibold">افزودن کاربر</text>
                    </Button >
                </div>
            </div>
            {firstLoading ? '' : (siteInfo?.offlineFirstStepUserVerifyEnabled || siteInfo?.secondStepUserVerifyEnabled) ?
                <Tabs variant="fullWidth" indicatorColor="primary" textColor="inherit" value={tabValue} className="w-full lg:w-fit"
                    onChange={handleChange}
                >
                    <Tab label="همه" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} />
                    <Tab label="در انتظار تائید" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} />
                </Tabs> : ''}
            <section className="overflow-x-auto overflow-y-hidden">
                {firstLoading ? '' : <div className="flex items-center justify-between gap-x-4 mt-2">
                    <form autoComplete="off">
                        <FormControl className="w-full md:w-auto">
                            <TextField
                                size="small"
                                type="text"
                                label="جستجو کاربر"
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                onChange={(event) => setSearchUsers(event.target.value)}
                                onKeyDown={searchUsersItemsHandler}
                                onKeyUp={searchUsersItems} />
                        </FormControl>
                    </form>
                    <span className="dark:text-white">تعداد کل: {loadingUsers ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (usersTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>}
                {loadingUsers ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : users.length > 0 ?
                    <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                        <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                            <TableHead className="dark:bg-dark">
                                <TableRow>
                                    {tabValue == 0 ? USERS_TABLE_HEAD.map((data, index) => (
                                        <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
                                            {index === 2 ? (
                                                <div onClick={toggleSortByToman} role="button" className="flex items-center gap-x-2 cursor-pointer select-none">
                                                    <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                    <div className="flex items-center">
                                                        {sortBy === 'tomanBalance' ? (
                                                            sortOrder == 1 ? <ArrowDownwardIcon fontSize="small" className="text-primary" /> : <ArrowUpwardIcon fontSize="small" className="text-primary" />
                                                        ) : <ArrowDownwardIcon fontSize="small" className="opacity-30" />}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                            )}
                                        </TableCell>
                                    )) : ''}
                                    {tabValue == 1 ? PENDING_USERS_TABLE_HEAD.map((data, index) => (
                                        <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
                                            <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                        </TableCell>
                                    )) : ''}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tabValue == 0 ? users.map((data, index) => (
                                    <TableRow
                                        key={index}
                                        sx={{ '&:last-child td': { border: 0 } }}
                                        className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                        <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                            <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data._id}`}>
                                                <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                                    <span>({data.mobileNumber}) {data.firstName} {data.lastName}</span>
                                                </a>
                                            </LinkRouter>
                                        </TableCell>
                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                            {data.nationalCode ? data.nationalCode : '----'}
                                        </TableCell>
                                        <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                            {(data.tomanBalance || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان
                                        </TableCell>
                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                .locale('fa')
                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                        </TableCell>
                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                            {data?.role == 'User' ? <Chip label="کاربر ساده" variant="outlined" size="small" className="w-full badge badge-info px-4" /> :
                                                <Chip label="کاربر ویژه" variant="outlined" size="small" className="w-full badge badge-success px-4" />}
                                        </TableCell>
                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                            {(siteInfo?.offlineFirstStepUserVerifyEnabled || siteInfo?.onlineFirstStepUserVerifyEnabled) ?
                                                <>
                                                    {data.verificationStatus == 'NotVerified' ? <Chip label="احراز نشده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}
                                                    {data.verificationStatus == 'FirstLevelVerified' && siteInfo?.secondStepUserVerifyEnabled ?
                                                        <Chip label="احراز پایه" variant="outlined" size="small" className="w-full badge badge-success" /> : ''}
                                                    {data.verificationStatus == 'FirstLevelVerified' && !siteInfo?.secondStepUserVerifyEnabled ?
                                                        <Chip label="احراز شده" variant="outlined" size="small" className="w-full badge badge-success" /> : ''}
                                                    {data.verificationStatus == 'SecondLevelRejected' || data.verificationStatus == 'FirstLevelRejected' ?
                                                        <Chip label="احراز رد شده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}
                                                    {data.verificationStatus == 'PendingSecondLevel' || data.verificationStatus == 'PendingFirstLevel' ? <Chip label="در انتظار تائید" variant="outlined" size="small" className="w-full badge badge-primary" /> : ''}
                                                    {data.verificationStatus == 'SecondLevelVerified' ? <Chip label="احراز کامل" variant="outlined" size="small" className="w-full badge badge-success" /> : ''}
                                                </> :
                                                <Chip label="احراز شده" variant="outlined" size="small" className="w-full badge badge-success" />}
                                        </TableCell>
                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                            {data.isActive ? <Chip label="فعال" variant="outlined" size="small" className="w-full badge badge-success" /> :
                                                <Chip label="غیرفعال" variant="outlined" size="small" className="w-full badge badge-error" />}
                                        </TableCell>
                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                            <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data._id}`}>
                                                <Button href={`/admin/panel/usersinglepage?id=${data._id}`} target="_blank" variant="text" size="medium" color="primary" className="rounded-lg" disableElevation>
                                                    <text className=" font-semibold">جزئیات بیشتر</text>
                                                </Button>
                                            </LinkRouter>
                                        </TableCell>
                                        <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                            <div className="flex items-center justify-end gap-x-2">
                                                {data.isActive ?
                                                    <Tooltip title="غیرفعالسازی کاربر">
                                                        <IconButton
                                                            color={`error`}
                                                            onClick={changeStatusUser(data._id, false)}>
                                                            <CancelIcon />
                                                        </IconButton>
                                                    </Tooltip> : <Tooltip title="فعالسازی کاربر">
                                                        <IconButton
                                                            color={`success`}
                                                            onClick={changeStatusUser(data._id, true)}>
                                                            <CheckCircleIcon />
                                                        </IconButton>
                                                    </Tooltip>}
                                                <Tooltip title="حذف کاربر">
                                                    <IconButton
                                                        color={`error`}
                                                        onClick={handleOpenDialog(data._id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : ''}
                                {tabValue == 1 ? users.map((data, index) => (
                                    <TableRow
                                        key={index}
                                        sx={{ '&:last-child td': { border: 0 } }}
                                        className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                        <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                            <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data._id}`}>
                                                <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                                    <span>({data.mobileNumber}) {data.firstName} {data.lastName}</span>
                                                </a>
                                            </LinkRouter>
                                        </TableCell>
                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                            {data.nationalCode ? data.nationalCode : '----'}
                                        </TableCell>
                                        <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                            <span>{moment(moment(data.birthDate).format("YYYY-MM-DD"), 'YYYY-MM-DD')
                                                .locale('fa')
                                                .format('jYYYY/jMM/jDD')}</span>
                                        </TableCell>
                                        <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                            {data.documentImages?.length > 0 ? data.documentImages?.map((item, index) => (
                                                <LinkRouter legacyBehavior href={`${process.env.NEXT_PUBLIC_BASEURL}${item.url}`} key={index}>
                                                    <a target={'_blank'}>
                                                        <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${item.url}`} alt={data.name} className="rounded" width={'40px'} height={'40px'} />
                                                    </a>
                                                </LinkRouter>
                                            )) : '------'}
                                        </TableCell>
                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                .locale('fa')
                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                        </TableCell>
                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                            {data?.role == 'User' ? <Chip label="کاربر ساده" variant="outlined" size="small" className="w-full badge badge-info px-4" /> :
                                                <Chip label="کاربر ویژه" variant="outlined" size="small" className="w-full badge badge-success px-4" />}
                                        </TableCell>
                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                            {data.verificationStatus == 'NotVerified' ? <Chip label="احراز نشده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}
                                            {data.verificationStatus == 'FirstLevelVerified' ?
                                                <Chip label="احراز پایه" variant="outlined" size="small" className="w-full badge badge-success" /> : ''}
                                            {data.verificationStatus == 'SecondLevelRejected' || data.verificationStatus == 'FirstLevelRejected' ?
                                                <Chip label="احراز رد شده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}
                                            {data.verificationStatus == 'PendingSecondLevel' || data.verificationStatus == 'PendingFirstLevel' ? <Chip label="در انتظار تائید" variant="outlined" size="small" className="w-full badge badge-primary" /> : ''}
                                            {data.verificationStatus == 'SecondLevelVerified' ? <Chip label="احراز کامل" variant="outlined" size="small" className="w-full badge badge-success" /> : ''}
                                        </TableCell>
                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                            <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data._id}`}>
                                                <Button href={`/admin/panel/usersinglepage?id=${data._id}`} target="_blank" variant="text" size="medium" color="primary" className="rounded-lg" disableElevation>
                                                    <text className=" font-semibold">جزئیات بیشتر</text>
                                                </Button>
                                            </LinkRouter>
                                        </TableCell>
                                        <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                            <>
                                                <IconButton
                                                    color={`success`}
                                                    onClick={changeUserAuthStatus(data._id, data.verificationStatus == 'PendingSecondLevel' ? 'SecondLevelVerified' : 'FirstLevelVerified')}>
                                                    <CheckCircleIcon />
                                                </IconButton>
                                                <IconButton
                                                    color={`error`}
                                                    onClick={handleShowReject(data._id, data.verificationStatus)}>
                                                    <CancelIcon />
                                                </IconButton>
                                            </>
                                        </TableCell>
                                    </TableRow>
                                )) : ''}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    : <div className="py-16">
                        <span className="block text-center text-large-1 text-primary-gray">کاربری یافت نشد</span>
                    </div>}

            </section>
            {Math.ceil(usersTotal / usersLimit) > 1 ?
                <div className="text-center mt-4">
                    <Pagination siblingCount={0} count={Math.ceil(usersTotal / usersLimit)} variant="outlined" color="primary" className="justify-center"
                        page={pageItem} onChange={handlePageChange} />
                </div>
                : ''}
            <ConfirmDialog
                open={openDialog}
                onClose={handleCloseDialog}
                onConfirm={deleteUser}
                title="آیا مطمئن هستید؟"
                loading={deleteLoading}
                darkModeToggle={darkModeToggle}
            />
            {/* AddUser */}
            <>
                <Dialog onClose={() => setShowAddUser(false)} open={showAddUser} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن کاربر
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowAddUser(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form
                        key={1}
                        className="grid grid-cols-12 gap-x-4 gap-y-8 py-8"
                        noValidate
                        autoComplete="off"
                        onSubmit={handleSubmit(saveUser)}
                    >
                        <Controller
                            name="firstName"
                            control={control}
                            render={({ field }) => (
                                <FormControl className="w-full col-span-12 md:col-span-6">
                                    <TextField
                                        {...field}
                                        type="text"
                                        label="نام کاربر"
                                        variant="outlined"
                                        error={!!errors.firstName}
                                        helperText={errors.firstName ? errors.firstName.message : ''}
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        onChange={(event) => {
                                            field.onChange(event);
                                            handleChangeAddData(event, 'firstName', 'text');
                                        }} />
                                </FormControl>
                            )}
                        />
                        <Controller
                            name="lastName"
                            control={control}
                            render={({ field }) => (
                                <FormControl className="w-full col-span-12 md:col-span-6">
                                    <TextField
                                        {...field}
                                        type="text"
                                        label="نام خانوادگی کاربر"
                                        variant="outlined"
                                        error={!!errors.lastName}
                                        helperText={errors.lastName ? errors.lastName.message : ''}
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        onChange={(event) => {
                                            field.onChange(event);
                                            handleChangeAddData(event, 'lastName', 'text');
                                        }} />
                                </FormControl>
                            )}
                        />
                        <Controller
                            name="nationalCode"
                            control={control}
                            render={({ field }) => (
                                <FormControl className="w-full col-span-12 md:col-span-6">
                                    <PatternFormat
                                        {...field}
                                        format="### ### ## ##"
                                        customInput={TextField}
                                        type="tel"
                                        label="کدملی کاربر"
                                        variant="outlined"
                                        error={!!errors.nationalCode}
                                        helperText={errors.nationalCode ? errors.nationalCode.message : ''}
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
                                        onValueChange={(values) => {
                                            field.onChange(values.value);
                                            handleChangeAddData(values, 'nationalCode', 'nationalCodeFormat');
                                        }}
                                        onPaste={(event) => {
                                            event.preventDefault();
                                            const pastedText = event.clipboardData.getData('Text');
                                            const converted = ConvertText(pastedText);
                                            setValue('nationalCode', converted);
                                            setAddUser((prevState) => ({
                                                ...prevState,
                                                nationalCode: converted,
                                            }));
                                        }} />
                                </FormControl>
                            )}
                        />
                        <Controller
                            name="mobileNumber"
                            control={control}
                            render={({ field }) => (
                                <FormControl className="w-full col-span-12 md:col-span-6">
                                    <PatternFormat
                                        {...field}
                                        format="#### ### ## ##"
                                        customInput={TextField}
                                        type="tel"
                                        label="شماره تلفن همراه"
                                        variant="outlined"
                                        error={!!errors.mobileNumber}
                                        helperText={errors.mobileNumber ? errors.mobileNumber.message : ''}
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
                                        value={addUser?.mobileNumber}
                                        onValueChange={(event) => {
                                            handleChangeAddData(event, 'mobileNumber', 'mobileNumberFormat');
                                        }}
                                        onPaste={(event) => {
                                            event.preventDefault();
                                            const pastedText = event.clipboardData.getData('Text');
                                            const converted = ConvertText(pastedText);
                                            const mobileNumber = converted.startsWith('0') ? converted : `0${converted}`;
                                            setValue('mobileNumber', mobileNumber);
                                            setAddUser((prevState) => ({
                                                ...prevState,
                                                mobileNumber: mobileNumber,
                                            }));
                                        }} />
                                </FormControl>
                            )}
                        />
                        <Controller
                            name="birthDate"
                            control={control}
                            render={({ field }) => (
                                <FormControl className="w-full col-span-12 md:col-span-6">
                                    <DatePicker name="datePicker" timePicker={false} isGregorian={isGregorian} className="form-input hidden" onChange={(date) => {
                                        field.onChange(date);
                                        birthDatepicker(date);
                                    }} />
                                    <TextField
                                        type="text"
                                        color={'primary'}
                                        label="تاریخ تولد کاربر"
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
                                        onClick={() => document.querySelector('input[name="datePicker"]').click()} />
                                </FormControl>
                            )}
                        />
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <FormControl className="w-full col-span-12 md:col-span-6">
                                    <TextField
                                        {...field}
                                        type={showPassword ? "text" : "password"}
                                        label="رمز عبور کاربر"
                                        variant="outlined"
                                        error={!!errors.password}
                                        helperText={errors.password ? errors.password.message : ''}
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            endAdornment: (
                                                <IconButton
                                                    color={`${darkModeToggle ? 'white' : 'black'}`}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            )
                                        }}
                                        onChange={(event) => {
                                            field.onChange(event);
                                            handleChangeAddData(event, 'password', 'text');
                                        }} />
                                </FormControl>
                            )}
                        />
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن کاربر</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomAddUserDrawer}
                    onClose={() => setOpenBottomAddUserDrawer(false)}
                    PaperProps={{ className: 'drawers', sx: { height: '80%' } }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن کاربر
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomAddUserDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form
                        key={1}
                        className="grid grid-cols-12 gap-x-4 gap-y-8 py-8"
                        noValidate
                        autoComplete="off"
                        onSubmit={handleSubmit(saveUser)}
                    >
                        <Controller
                            name="firstName"
                            control={control}
                            render={({ field }) => (
                                <FormControl className="w-full col-span-12 md:col-span-6">
                                    <TextField
                                        {...field}
                                        type="text"
                                        label="نام کاربر"
                                        variant="outlined"
                                        error={!!errors.firstName}
                                        helperText={errors.firstName ? errors.firstName.message : ''}
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        onChange={(event) => {
                                            field.onChange(event);
                                            handleChangeAddData(event, 'firstName', 'text');
                                        }} />
                                </FormControl>
                            )}
                        />
                        <Controller
                            name="lastName"
                            control={control}
                            render={({ field }) => (
                                <FormControl className="w-full col-span-12 md:col-span-6">
                                    <TextField
                                        {...field}
                                        type="text"
                                        label="نام خانوادگی کاربر"
                                        variant="outlined"
                                        error={!!errors.lastName}
                                        helperText={errors.lastName ? errors.lastName.message : ''}
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        onChange={(event) => {
                                            field.onChange(event);
                                            handleChangeAddData(event, 'lastName', 'text');
                                        }} />
                                </FormControl>
                            )}
                        />
                        <Controller
                            name="nationalCode"
                            control={control}
                            render={({ field }) => (
                                <FormControl className="w-full col-span-12 md:col-span-6">
                                    <PatternFormat
                                        {...field}
                                        format="### ### ## ##"
                                        customInput={TextField}
                                        type="tel"
                                        label="کدملی کاربر"
                                        variant="outlined"
                                        error={!!errors.nationalCode}
                                        helperText={errors.nationalCode ? errors.nationalCode.message : ''}
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
                                        onValueChange={(values) => {
                                            field.onChange(values.value);
                                            handleChangeAddData(values, 'nationalCode', 'nationalCodeFormat');
                                        }}
                                        onPaste={(event) => {
                                            event.preventDefault();
                                            const pastedText = event.clipboardData.getData('Text');
                                            const converted = ConvertText(pastedText);
                                            setValue('nationalCode', converted);
                                            setAddUser((prevState) => ({
                                                ...prevState,
                                                nationalCode: converted,
                                            }));
                                        }} />
                                </FormControl>
                            )}
                        />
                        <Controller
                            name="mobileNumber"
                            control={control}
                            render={({ field }) => (
                                <FormControl className="w-full col-span-12 md:col-span-6">
                                    <PatternFormat
                                        {...field}
                                        format="#### ### ## ##"
                                        customInput={TextField}
                                        type="tel"
                                        label="شماره تلفن همراه"
                                        variant="outlined"
                                        error={!!errors.mobileNumber}
                                        helperText={errors.mobileNumber ? errors.mobileNumber.message : ''}
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
                                        value={addUser?.mobileNumber}
                                        onValueChange={(event) => {
                                            handleChangeAddData(event, 'mobileNumber', 'mobileNumberFormat');
                                        }}
                                        onPaste={(event) => {
                                            event.preventDefault();
                                            const pastedText = event.clipboardData.getData('Text');
                                            const converted = ConvertText(pastedText);
                                            const mobileNumber = converted.startsWith('0') ? converted : `0${converted}`;
                                            setValue('mobileNumber', mobileNumber);
                                            setAddUser((prevState) => ({
                                                ...prevState,
                                                mobileNumber: mobileNumber,
                                            }));
                                        }} />
                                </FormControl>
                            )}
                        />
                        <Controller
                            name="birthDate"
                            control={control}
                            render={({ field }) => (
                                <FormControl className="w-full col-span-12 md:col-span-6">
                                    <DatePicker name="datePicker" timePicker={false} isGregorian={isGregorian} className="form-input hidden" onChange={(date) => {
                                        field.onChange(date);
                                        birthDatepicker(date);
                                    }} />
                                    <TextField
                                        type="text"
                                        color={'primary'}
                                        label="تاریخ تولد کاربر"
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
                                        onClick={() => document.querySelector('input[name="datePicker"]').click()} />
                                </FormControl>
                            )}
                        />
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <FormControl className="w-full col-span-12 md:col-span-6">
                                    <TextField
                                        {...field}
                                        type={showPassword ? "text" : "password"}
                                        label="رمز عبور کاربر"
                                        variant="outlined"
                                        error={!!errors.password}
                                        helperText={errors.password ? errors.password.message : ''}
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            endAdornment: (
                                                <IconButton
                                                    color={`${darkModeToggle ? 'white' : 'black'}`}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            )
                                        }}
                                        onChange={(event) => {
                                            field.onChange(event);
                                            handleChangeAddData(event, 'password', 'text');
                                        }} />
                                </FormControl>
                            )}
                        />
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن کاربر</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* Reject User */}
            <>
                <Dialog onClose={() => setShowReject(false)} open={showReject} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-4">
                        <FormControl>
                            <TextField
                                type="text"
                                label="توضیحات رد احراز هویت"
                                multiline
                                maxRows={8}
                                rows={4}
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                onChange={(event) => setRejectDesc(event.target.value)} />
                        </FormControl>
                        <div className="flex items-center justify-end gap-x-2">
                            <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={changeUserAuthStatus(userId, userAuthStep == 'PendingSecondLevel' ? 'SecondLevelRejected' : 'FirstLevelRejected')}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >
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
                    <div className="flex flex-col gap-y-4">
                        <FormControl>
                            <TextField
                                type="text"
                                label="توضیحات رد احراز هویت"
                                multiline
                                maxRows={8}
                                rows={4}
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                onChange={(event) => setRejectDesc(event.target.value)} />
                        </FormControl>
                        <div className="flex">
                            <LoadingButton type="button" variant="contained" size="medium" fullWidth className="rounded-lg" disableElevation loading={loading}
                                onClick={changeUserAuthStatus(userId, userAuthStep == 'PendingSecondLevel' ? 'SecondLevelRejected' : 'FirstLevelRejected')}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >
                        </div>
                    </div>
                </SwipeableDrawer>
            </>
        </div>
    )
}

export default UsersPageCompo;