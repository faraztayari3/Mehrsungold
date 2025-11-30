import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import CancelIcon from '@mui/icons-material/CancelOutlined'
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Pagination from '@mui/material/Pagination';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MUISelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import dayjs from 'dayjs';
import { DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { faIR } from '@mui/x-date-pickers/locales';
import moment from 'jalali-moment'

import { NumericFormat } from 'react-number-format';
import Select from 'react-dropdown-select'

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

// Components
import CustomSwitch from "../shared/CustomSwitch"
import ConfirmDialog from '../shared/ConfirmDialog';

/**
 * TradeLimitsPageCompo component that displays the TradeLimits Page Component of the website.
 * @returns The rendered TradeLimits Page component.
 */
const TradeLimitsPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const LIMITS_TABLE_HEAD = [
        {
            label: 'کاربر',
            classes: ""
        },
        {
            label: 'واحد معامله',
            classes: ""
        },
        {
            label: 'مقدار',
            classes: ""
        },
        {
            label: 'بازه زمانی',
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

    useEffect(() => {
        getTradeables();
        getUsers();
    }, []);

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

    const [pageItem, setPageItem] = useState(1);
    useEffect(() => {
        getTradeLimits(1);
    }, []);

    /**
        * Retrieves tradeLimits.
        * @returns None
       */
    const [tradeLimits, setTradeLimits] = useState([]);
    const [loadingTradeLimits, setLoadingTradeLimits] = useState(true);
    const [tradeLimitsLimit, setTradeLimitsLimit] = useState(10);
    const [tradeLimitsTotal, setTradeLimitsTotal] = useState(0);
    const [totalUser, setTotalUser] = useState(true);
    const getTradeLimits = (page, search) => {
        setLoadingTradeLimits(true);
        ApiCall('/transaction/trade-limit', 'GET', locale, {}, `${search ? `search=${search}&` : ''}sortOrder=0&sortBy=createdAt&limit=${tradeLimitsLimit}&skip=${(page * tradeLimitsLimit) - tradeLimitsLimit}`, 'admin', router).then(async (result) => {
            setTradeLimitsTotal(result.count);
            setTradeLimits(result.data);
            setLoadingTradeLimits(false);
        }).catch((error) => {
            setLoadingTradeLimits(false);
            console.log(error);
        });
    }

    const handlePageChange = (event, value) => {
        setPageItem(value);
        getTradeLimits(value);
    }

    /**
     * Search for a TradeLimits based on the input value and filter the displayed TradeLimits accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchTradeLimits, setSearchTradeLimits] = useState('');
    var typingTimerTradeLimits;
    const doneTypingIntervalTradeLimits = 300;
    const searchTradeLimitsItems = (event) => {
        clearTimeout(typingTimerTradeLimits);

        typingTimerTradeLimits = setTimeout(() => {
            if (event.target.value == '') {
                setSearchTradeLimits('');
                setPageItem(1);
                getTradeLimits(1, '');
            } else {
                setSearchTradeLimits(event.target.value);
                setPageItem(1);
                getTradeLimits(1, event.target.value);
            }
        }, doneTypingIntervalTradeLimits);

    }
    const searchTradeLimitsItemsHandler = () => {
        clearTimeout(typingTimerTradeLimits)
    }

    const [showAddTradeLimit, setShowAddTradeLimit] = useState(false);
    const [openBottomAddTradeLimitDrawer, setOpenBottomAddTradeLimitDrawer] = useState(false);
    const handleShowAddTradeLimit = () => {
        if (window.innerWidth >= 1024) {
            setShowAddTradeLimit(true);
            setOpenBottomAddTradeLimitDrawer(false);
        } else {
            setShowAddTradeLimit(false);
            setOpenBottomAddTradeLimitDrawer(true);
        }
    }

    const [addTradeLimit, setAddTradeLimit] = useState({
        userId: '',
        startTime: '',
        endTime: '',
        limit: 0,
        tradeableId: ''
    });

    const validationSchema = Yup.object({
        totalUser: Yup.boolean(),
        userId: Yup.string().when("totalUser", {
            is: true,
            then: schema => schema.optional(),
            otherwise: schema => schema.required('کاربر را انتخاب نمائید'),
        }),
        limit: Yup.string().required('این فیلد الزامی است').transform(value => value?.replace(/,/g, '')),
        startTime: Yup.string().required('این فیلد الزامی است'),
        endTime: Yup.string().required('این فیلد الزامی است'),
        tradeableId: Yup.string().required('این فیلد الزامی است'),
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const clearForm = () => {
        setValue('userId', '');
        setValue('limit', '');
        setValue('startTime', '');
        setValue('endTime', '');
        setValue('tradeableId', '');
    }

    /**
         * Handles the change event for saving withdraw limits data.
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
                value = Number(event.target.value?.replace(/,/g, ''));
                break;
            default:
                value = event.target.value;
                break;
        }
        setAddTradeLimit((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
    * Save new TradeLimit.
    * @returns None
   */
    const saveTradeLimit = () => {
        setLoading(true);
        let correctedData = { ...addTradeLimit };
        if (correctedData.startTime && correctedData.endTime) {
            const startDate = new Date(correctedData.startTime);
            let endDate = new Date(correctedData.endTime);

            endDate.setUTCFullYear(startDate.getUTCFullYear());
            endDate.setUTCMonth(startDate.getUTCMonth());
            endDate.setUTCDate(startDate.getUTCDate());

            if (
                startDate.getUTCHours() > endDate.getUTCHours() ||
                (startDate.getUTCHours() === endDate.getUTCHours() && startDate.getUTCMinutes() >= endDate.getUTCMinutes())
            ) {
                endDate.setUTCDate(endDate.getUTCDate() + 1);
            }
            correctedData.endTime = endDate.toISOString();
        }

        const { userId, ...TradeLimitsData } = correctedData;
        let body = totalUser ? { ...TradeLimitsData } : { ...correctedData };

        ApiCall('/transaction/trade-limit', 'POST', locale, body, '', 'admin', router).then(async (result) => {
            setLoading(false);
            getTradeLimits(1);
            setShowAddTradeLimit(false);
            setOpenBottomAddTradeLimitDrawer(false);
            setAddTradeLimit({
                userId: '',
                startTime: '',
                endTime: '',
                limit: 0,
                tradeableId: ''
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

    const [openDialog, setOpenDialog] = useState(false);
    const [tradeLimitId, setTradeLimitId] = useState('');
    const handleOpenDialog = (tradeLimitId) => (event) => {
        setTradeLimitId(tradeLimitId);
        setOpenDialog(true);
    }
    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    /**
    * Delete a TradeLimit.
    * @returns None
   */
    const [deleteLoading, setDeleteLoading] = useState(false);
    const deleteTradeLimit = () => {
        setDeleteLoading(true);
        ApiCall(`/transaction/trade-limit/${tradeLimitId}`, 'DELETE', locale, {}, '', 'admin', router).then(async (result) => {
            setDeleteLoading(false);
            getTradeLimits(1);
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

    const [users, setUsers] = useState([]);
    const [usersSelectLoading, setUserselectLoading] = useState(true);
    const [pageUsers, setPageUsers] = useState(1);
    const [showMoreUsers, setShowMoreUsers] = useState(false);
    const [usersLimit, setUsersLimit] = useState(10);
    const getUsers = async (search, type) => {
        setTimeout(async () => {
            if (search) {
                setShowMoreUsers(false);
                ApiCall('/user', 'GET', locale, {}, `limit=${usersLimit}${search ? `&search=${search}` : ''}`, 'admin', router).then(async (result) => {
                    setUserselectLoading(false);
                    setUsers(result.data);
                }).catch((error) => {
                    setUserselectLoading(false);
                    setUsers([]);
                });
            } else {
                ApiCall('/user', 'GET', locale, {}, `limit=${usersLimit}&skip=${type ? 0 : (pageItem * usersLimit) - usersLimit}`, 'admin', router).then(async (result) => {
                    if (type) {
                        Math.ceil(result.count / usersLimit) == 1 ? setShowMoreUsers(false) : setShowMoreUsers(true);
                        setUsers(result.data);
                        setPageUsers(2);
                    } else {
                        pageUsers == Math.ceil(result.count / usersLimit) ? setShowMoreUsers(false) : setShowMoreUsers(true);
                        setUsers([...users, ...result.data]);
                        setPageUsers((prevPage) => prevPage + 1);
                    }
                    setUserselectLoading(false);
                }).catch((error) => {
                    setUserselectLoading(false);
                    setUsers([]);
                });
            }

        }, 1000);
    }

    const handleScrollUsers = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;

        // Check if the user has scrolled to the bottom
        if ((scrollHeight - scrollTop === clientHeight) && usersSelectLoading == false) {
            // Call the fetchData function to load more data
            if (showMoreUsers) {
                setUserselectLoading(true);
                getUsers('', false);
            }
        }
    }

    /**
     * Search for a coin based on the input value and filter the displayed coin pairs accordingly.
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
                getUsers('', true);
            } else {
                setPageUsers(1);
                setSearchUsers(event.target.value);
                getUsers(event.target.value, false);
            }
        }, doneTypingIntervalUsers);

    }
    const searchUsersItemsHandler = () => {
        clearTimeout(typingTimerUsers)
    }

    /**
     * Renders custom content for the users component.
     * @param {object} props - The props passed to the component.
     * @param {object} state - The state of the component.
     * @param {object} methods - The methods available to the component.
     * @returns {JSX.Element} - The JSX element to render.
     */
    const usersCustomContentRenderer = ({ props, state, methods }) => {
        if (state.values.length > 0) {
            return (
                <div className="flex items-center justify-start gap-2">
                    <img src={'/assets/img/general/userPic.png'} alt={state.values[0].mobileNumber} className="rounded-[50%]" width={25} height={25} />
                    <span>{state.values[0].firstName && state.values[0].lastName ? `${state.values[0].firstName} ${state.values[0].lastName}` : `${state.values[0].mobileNumber}`} </span>
                </div>
            )
        } else {
            return <span>انتخاب کاربر</span>
        }

    }
    /**
     * Custom renderer function for rendering a dropdown component with users options.
     * @param {object} options - The options object containing props, state, and methods.
     * @returns {JSX.Element} - The rendered dropdown component.
     */
    const usersCustomDropdownRenderer = ({ props, state, methods }) => {
        const regexp = new RegExp(methods.safeString(state.search), "i");

        return (
            <div onScroll={handleScrollUsers} style={{ height: '300px', overflow: 'auto' }}>
                <div className="select-user-dropdown">
                    <div className="px-4">
                        <input
                            type="text"
                            value={searchUsers}
                            onChange={(event) => setSearchUsers(event.target.value)}
                            onKeyDown={searchUsersItemsHandler}
                            onKeyUp={searchUsersItems}
                            placeholder="جستجو کاربر"
                            className="w-full form-input border rounded-lg p-3 my-3 mx-auto"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-y-4">
                    {props.options
                        .filter((item) => { let search = props.searchBy.split(','); return regexp.test(item[search[0]]) || regexp.test(item[search[1]]) || regexp.test(item[search[2]]) || regexp.test(item[search[3]]) })
                        .map(option => {
                            return (
                                <div key={option._id} onClick={() => methods.addItem(option)} className="flex items-center justify-start gap-2 px-4">
                                    <img src={'/assets/img/general/userPic.png'} alt={option.mobileNumber} className="rounded-[50%]" width={25} height={25} />
                                    <label style={{ cursor: "pointer" }}>{option.firstName && option.lastName ? `${option.firstName} ${option.lastName}` : `${option.mobileNumber}`}</label>
                                </div>
                            );
                        })}
                </div>
                {usersSelectLoading ? <div className="flex justify-center items-center mt-4"><CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} /></div> : null}
            </div>
        );
    }

    const [tradeLimitData, setTradeLimitData] = useState();
    const [showEditTradeLimit, setShowEditTradeLimit] = useState(false);
    const [openBottomEditTradeLimitDrawer, setOpenBottomEditTradeLimitDrawer] = useState(false);
    const [editTotalUser, setEditTotalUser] = useState(true);
    const handleShowEditTradeLimit = (data) => () => {
        if ((data.user && Object.keys(data.user).length > 0)) {
            setTradeLimitData({ ...data, tradeableId: data.tradeable?._id, userId: data.user?._id });
            setEditTotalUser(false);
        } else {
            setTradeLimitData({ ...data, tradeableId: data.tradeable?._id });
            setEditTotalUser(true);
        }
        if (window.innerWidth >= 1024) {
            setShowEditTradeLimit(true);
            setOpenBottomEditTradeLimitDrawer(false);
        } else {
            setShowEditTradeLimit(false);
            setOpenBottomEditTradeLimitDrawer(true);
        }
    }

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
        setTradeLimitData((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
         * Edit A Trade Limit.
         * @returns None
        */
    const editTradeLimit = (limitId) => (event) => {
        event.preventDefault();
        setLoading(true);
        let newData = { ...FilterEmptyFields(tradeLimitData) };

        if (newData.startTime && newData.endTime) {
            const startDate = new Date(newData.startTime);
            const endDate = new Date(newData.endTime);

            endDate.setUTCFullYear(startDate.getUTCFullYear());
            endDate.setUTCMonth(startDate.getUTCMonth());
            endDate.setUTCDate(startDate.getUTCDate());

            if (
                startDate.getUTCHours() > endDate.getUTCHours() ||
                (startDate.getUTCHours() === endDate.getUTCHours() && startDate.getUTCMinutes() >= endDate.getUTCMinutes())
            ) {
                endDate.setUTCDate(endDate.getUTCDate() + 1);
            }
            newData.endTime = endDate.toISOString();
        }

        const filteredData = FilterObjectFields(newData, [
            "startTime",
            "endTime",
            "tradeableId",
            "limit",
            "userId",
        ]);

        ApiCall(`/transaction/trade-limit/${limitId}`, 'PATCH', locale, { ...filteredData }, '', 'admin', router).then(async (result) => {
            event.target.disabled = false;
            setLoading(false);
            setShowEditTradeLimit(false);
            setOpenBottomEditTradeLimitDrawer(false);
            setTradeLimitData();
            getTradeLimits(1);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.SuccessRequest'),
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
        <div className=" flex flex-col gap-y-8">
            <section className="flex items-center justify-between">
                <h1 className="text-2xl md:text-large-2">ساعات محدودیت معاملات</h1>
                <div className="flex items-center gap-x-4">
                    <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation onClick={handleShowAddTradeLimit}>
                        <text className="text-black font-semibold">افزودن محدودیت</text>
                    </Button >
                </div>
            </section>
            <div className="flex items-center justify-between gap-x-4">
                <form autoComplete="off">
                    <FormControl className="w-full md:w-auto">
                        <TextField
                            size="small"
                            type="text"
                            label="جستجو محدودیت"
                            InputLabelProps={{
                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                            }}
                            InputProps={{
                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                            }}
                            onChange={(event) => setSearchTradeLimits(event.target.value)}
                            onKeyDown={searchTradeLimitsItemsHandler}
                            onKeyUp={searchTradeLimitsItems} />
                    </FormControl>
                </form>
                <span className="dark:text-white">تعداد کل: {loadingTradeLimits ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (tradeLimitsTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>

            {loadingTradeLimits ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div>
                :
                <section className="overflow-x-auto overflow-y-hidden">
                    {tradeLimits.length > 0 ?
                        <>
                            <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                                <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                    <TableHead className="dark:bg-dark">
                                        <TableRow>
                                            {LIMITS_TABLE_HEAD.map((data, index) => (
                                                <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-center pb-4`} key={index}>
                                                    <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tradeLimits.map((data, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{ '&:last-child td': { border: 0 } }}
                                                className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                                <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                    {data.user && Object.keys(data.user).length > 0 ?
                                                        <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data.user?._id}`}>
                                                            <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                                                <span>({data.user?.mobileNumber}) {data.user?.firstName} {data.user?.lastName}</span>
                                                            </a>
                                                        </LinkRouter> : <Chip label="تمام کاربران" variant="outlined" size="small" className="badge badge-primary px-4" />}
                                                </TableCell>
                                                <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                    {data.tradeable ? <div className="flex items-center gap-x-4">
                                                        <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} alt={data.tradeable?.name}
                                                            className="w-10 h-10 rounded-[50%]" />
                                                        <span>{data.tradeable?.nameFa}</span>
                                                    </div> : '----'}
                                                </TableCell>
                                                <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                    {(data.limit || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم
                                                </TableCell>
                                                <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                    <span>از {moment(moment(data.startTime).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                        .locale('fa')
                                                        .format('HH:mm')} تا {moment(moment(data.endTime).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                            .locale('fa')
                                                            .format('HH:mm')}</span>
                                                </TableCell>
                                                <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                    <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                        .locale('fa')
                                                        .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                </TableCell>
                                                <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                    <Button variant="text" size="medium" color="primary" className="rounded-lg" disableElevation
                                                        onClick={handleShowEditTradeLimit(data)}>
                                                        <text className=" font-semibold">ویرایش</text>
                                                    </Button >
                                                </TableCell>
                                                <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                    <Tooltip title="حذف محدودیت">
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
                                onConfirm={deleteTradeLimit}
                                title="آیا مطمئن هستید؟"
                                loading={deleteLoading}
                                darkModeToggle={darkModeToggle}
                            />
                        </>
                        : <div className="py-16">
                            <span className="block text-center text-large-1 text-primary-gray">محدودیتی یافت نشد</span>
                        </div>}
                </section>
            }

            {Math.ceil(tradeLimitsTotal / tradeLimitsLimit) > 1 ?
                <div className="text-center mt-4">
                    <Pagination siblingCount={0} count={Math.ceil(tradeLimitsTotal / tradeLimitsLimit)} variant="outlined" color="primary" className="justify-center"
                        page={pageItem} onChange={handlePageChange} />
                </div>
                : ''}

            {/* AddTradeLimit */}
            <>
                <Dialog onClose={() => setShowAddTradeLimit(false)} open={showAddTradeLimit} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن محدودیت
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowAddTradeLimit(false)}>
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
                        onSubmit={handleSubmit(saveTradeLimit)}
                    >
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <Controller
                                    name="totalUser"
                                    control={control}
                                    defaultValue={totalUser}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            className="justify-between text-end m-0"
                                            control={<CustomSwitch
                                                {...field}
                                                checked={field.value}
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    setTotalUser(event.target.checked);
                                                    setValue('userId', '');
                                                    if (event.target.checked) {
                                                        setAddTradeLimit({ ...addTradeLimit, userId: '' });
                                                    }
                                                }}
                                            />}
                                            label="تمام کاربران ؟" />
                                    )}
                                />
                            </FormGroup>
                        </div>
                        {totalUser ? (
                            <div className="col-span-12 md:col-span-6 invisible">
                                <Select
                                    options={[]}
                                    values={[]}
                                    dropdownGap={0}
                                    direction={'ltr'}
                                />
                            </div>
                        ) : (
                            <div className="col-span-12 md:col-span-6">
                                <Controller
                                    name="userId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={users}
                                            loading={usersSelectLoading}
                                            contentRenderer={usersCustomContentRenderer}
                                            dropdownRenderer={usersCustomDropdownRenderer}
                                            onChange={(values) => {
                                                field.onChange(values.length > 0 ? values[0]._id : '');
                                                setAddTradeLimit({ ...addTradeLimit, userId: values.length > 0 ? values[0]._id : '' });
                                            }}
                                            values={[]}
                                            dropdownGap={0}
                                            direction={'ltr'}
                                            searchBy={'username,mobileNumber'}
                                        />
                                    )}
                                />
                                {errors.userId && <FormHelperText className="text-red-500 !mx-4">{errors.userId.message}</FormHelperText>}
                            </div>
                        )}
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="limit"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="مقدار محدودیت (به گرم)"
                                            variant="outlined"
                                            error={!!errors.limit}
                                            helperText={errors.limit ? errors.limit.message : ''}
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
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'limit', 'numberFormat');
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="tradeableId"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <InputLabel id="demo-simple-select-label" error={!!errors.tradeableId}
                                            sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                        <MUISelect
                                            {...field}
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            onChange={(event) => { field.onChange(event); handleChangeAddData(event, 'tradeableId', 'text') }}
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
                        <div className="col-span-12 md:col-span-6">
                            <LocalizationProvider dateAdapter={AdapterDayjs} locale={faIR}>
                                <DemoItem label="ساعت شروع بازه">
                                    <Controller
                                        name="startTime"
                                        control={control}
                                        render={({ field }) => (
                                            <MobileTimePicker
                                                {...field}
                                                className="custom-timepicker w-full !outline-none !border-none"
                                                slotProps={{
                                                    textField: {
                                                        inputProps: {
                                                            className: errors.startTime ? 'border-red-500 cursor-pointer dark:text-white dark:bg-dark' : 'cursor-pointer dark:text-white dark:bg-dark',
                                                            sx: { border: darkModeToggle ? '1px solid rgb(255, 255, 255,0.2)' : '1px solid rgb(0, 0, 0,0.2)', borderRadius: '16px' },
                                                        },
                                                    }
                                                }}
                                                onChange={(time) => {
                                                    field.onChange(time?.toISOString());
                                                    setAddTradeLimit({ ...addTradeLimit, startTime: time?.toISOString() });
                                                }}
                                                localeText={{ ...faIR.components.MuiLocalizationProvider.defaultProps.localeText, cancelButtonLabel: 'انصراف', okButtonLabel: 'تائید' }}
                                            />
                                        )}
                                    />
                                    {errors.startTime && <FormHelperText className="text-red-500 !mt-1 !mx-4">{errors.startTime.message}</FormHelperText>}
                                </DemoItem>
                            </LocalizationProvider>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <LocalizationProvider dateAdapter={AdapterDayjs} locale={faIR}>
                                <DemoItem label="ساعت پایان بازه">
                                    <Controller
                                        name="endTime"
                                        control={control}
                                        render={({ field }) => (
                                            <MobileTimePicker
                                                {...field}
                                                className="custom-timepicker w-full !outline-none !border-none"
                                                slotProps={{
                                                    textField: {
                                                        inputProps: {
                                                            className: errors.endTime ? 'border-red-500 cursor-pointer dark:text-white dark:bg-dark' : 'cursor-pointer dark:text-white dark:bg-dark',
                                                            sx: { border: darkModeToggle ? '1px solid rgb(255, 255, 255,0.2)' : '1px solid rgb(0, 0, 0,0.2)', borderRadius: '16px' },
                                                        },
                                                    }
                                                }}
                                                onChange={(time) => {
                                                    field.onChange(time?.toISOString());
                                                    setAddTradeLimit({ ...addTradeLimit, endTime: time?.toISOString() });
                                                }}
                                                localeText={{ ...faIR.components.MuiLocalizationProvider.defaultProps.localeText, cancelButtonLabel: 'انصراف', okButtonLabel: 'تائید' }}
                                            />
                                        )}
                                    />
                                    {errors.endTime && <FormHelperText className="text-red-500 !mt-1 !mx-4">{errors.endTime.message}</FormHelperText>}
                                </DemoItem>
                            </LocalizationProvider>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن محدودیت</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomAddTradeLimitDrawer}
                    onClose={() => setOpenBottomAddTradeLimitDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن محدودیت
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomAddTradeLimitDrawer(false)}>
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
                        onSubmit={handleSubmit(saveTradeLimit)}
                    >
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <Controller
                                    name="totalUser"
                                    control={control}
                                    defaultValue={totalUser}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            className="justify-between text-end m-0"
                                            control={<CustomSwitch
                                                {...field}
                                                checked={field.value}
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    setTotalUser(event.target.checked);
                                                    setValue('userId', '');
                                                    if (event.target.checked) {
                                                        setAddTradeLimit({ ...addTradeLimit, userId: '' });
                                                    }
                                                }}
                                            />}
                                            label="تمام کاربران ؟" />
                                    )}
                                />
                            </FormGroup>
                        </div>
                        {totalUser ? (
                            <div className="col-span-12 md:col-span-6 invisible">
                                <Select
                                    options={[]}
                                    values={[]}
                                    dropdownGap={0}
                                    direction={'ltr'}
                                />
                            </div>
                        ) : (
                            <div className="col-span-12 md:col-span-6">
                                <Controller
                                    name="userId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={users}
                                            loading={usersSelectLoading}
                                            contentRenderer={usersCustomContentRenderer}
                                            dropdownRenderer={usersCustomDropdownRenderer}
                                            onChange={(values) => {
                                                field.onChange(values.length > 0 ? values[0]._id : '');
                                                setAddTradeLimit({ ...addTradeLimit, userId: values.length > 0 ? values[0]._id : '' });
                                            }}
                                            values={[]}
                                            dropdownGap={0}
                                            direction={'ltr'}
                                            searchBy={'username,mobileNumber'}
                                        />
                                    )}
                                />
                                {errors.userId && <FormHelperText className="text-red-500">{errors.userId.message}</FormHelperText>}
                            </div>
                        )}
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="limit"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <label htmlFor="limit" className="text-xl invisible">مقدار محدودیت (به گرم)</label>
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="مقدار محدودیت (به گرم)"
                                            variant="outlined"
                                            error={!!errors.limit}
                                            helperText={errors.limit ? errors.limit.message : ''}
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
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'limit', 'numberFormat');
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="tradeableId"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <InputLabel id="demo-simple-select-label" error={!!errors.tradeableId}
                                            sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                        <MUISelect
                                            {...field}
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            onChange={(event) => { field.onChange(event); handleChangeAddData(event, 'tradeableId', 'text') }}
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
                        <div className="col-span-12 md:col-span-6">
                            <LocalizationProvider dateAdapter={AdapterDayjs} locale={faIR}>
                                <DemoItem label="ساعت شروع بازه">
                                    <Controller
                                        name="startTime"
                                        control={control}
                                        render={({ field }) => (
                                            <MobileTimePicker
                                                {...field}
                                                className="custom-timepicker w-full !outline-none !border-none *:pl-0"
                                                slotProps={{
                                                    textField: {
                                                        inputProps: {
                                                            className: errors.startTime ? 'border-red-500 cursor-pointer dark:text-white dark:bg-dark' : 'cursor-pointer dark:text-white dark:bg-dark',
                                                            sx: { border: darkModeToggle ? '1px solid rgb(255, 255, 255,0.2)' : '1px solid rgb(0, 0, 0,0.2)', borderRadius: '16px' },
                                                        },
                                                    }
                                                }}
                                                onChange={(time) => {
                                                    field.onChange(time?.toISOString());
                                                    setAddTradeLimit({ ...addTradeLimit, startTime: time?.toISOString() });
                                                }}
                                                localeText={{ ...faIR.components.MuiLocalizationProvider.defaultProps.localeText, cancelButtonLabel: 'انصراف', okButtonLabel: 'تائید' }}
                                            />
                                        )}
                                    />
                                    {errors.startTime && <FormHelperText className="text-red-500 !mt-1 !mx-4">{errors.startTime.message}</FormHelperText>}
                                </DemoItem>
                            </LocalizationProvider>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <LocalizationProvider dateAdapter={AdapterDayjs} locale={faIR}>
                                <DemoItem label="ساعت پایان بازه">
                                    <Controller
                                        name="endTime"
                                        control={control}
                                        render={({ field }) => (
                                            <MobileTimePicker
                                                {...field}
                                                className="custom-timepicker w-full !outline-none !border-none *:pl-0"
                                                slotProps={{
                                                    textField: {
                                                        inputProps: {
                                                            className: errors.endTime ? 'border-red-500 cursor-pointer dark:text-white dark:bg-dark' : 'cursor-pointer dark:text-white dark:bg-dark',
                                                            sx: { border: darkModeToggle ? '1px solid rgb(255, 255, 255,0.2)' : '1px solid rgb(0, 0, 0,0.2)', borderRadius: '16px' },
                                                        },
                                                    }
                                                }}
                                                onChange={(time) => {
                                                    field.onChange(time?.toISOString());
                                                    setAddTradeLimit({ ...addTradeLimit, endTime: time?.toISOString() });
                                                }}
                                                localeText={{ ...faIR.components.MuiLocalizationProvider.defaultProps.localeText, cancelButtonLabel: 'انصراف', okButtonLabel: 'تائید' }}
                                            />
                                        )}
                                    />
                                    {errors.endTime && <FormHelperText className="text-red-500 !mt-1 !mx-4">{errors.endTime.message}</FormHelperText>}
                                </DemoItem>
                            </LocalizationProvider>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن محدودیت</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* EditTradeLimit */}
            <>
                <Dialog onClose={() => setShowEditTradeLimit(false)} open={showEditTradeLimit} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش محدودیت
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowEditTradeLimit(false)}>
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
                    >
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between text-end m-0"
                                    control={<CustomSwitch
                                        checked={editTotalUser}
                                        onChange={(event) => {
                                            setEditTotalUser(event.target.checked);
                                            if (event.target.checked) {
                                                setTradeLimitData({ ...tradeLimitData, userId: '' });
                                            }
                                        }}
                                    />}
                                    label="تمام کاربران ؟" />
                            </FormGroup>
                        </div>
                        {editTotalUser ? (
                            <div className="col-span-12 md:col-span-6 invisible">
                                <Select
                                    options={[]}
                                    values={[]}
                                    dropdownGap={0}
                                    direction={'ltr'}
                                />
                            </div>
                        ) : (
                            <div className="col-span-12 md:col-span-6">
                                <Select
                                    options={users}
                                    loading={usersSelectLoading}
                                    contentRenderer={usersCustomContentRenderer}
                                    dropdownRenderer={usersCustomDropdownRenderer}
                                    onChange={(values) => {
                                        setTradeLimitData(prev => ({ ...prev, userId: values.length > 0 ? values[0]._id : '' }));
                                    }}
                                    values={editTotalUser ? [] : [{ ...tradeLimitData?.user }]}
                                    dropdownGap={0}
                                    direction={'ltr'}
                                    searchBy={'username,mobileNumber'}
                                />
                            </div>
                        )}
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="مقدار محدودیت (به گرم)"
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
                                    value={tradeLimitData?.limit}
                                    onChange={handleChangeEditData('limit', 'numberFormat')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <InputLabel id="demo-simple-select-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                <MUISelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    defaultValue={tradeLimitData?.tradeable}
                                    onChange={(event) => setTradeLimitData((prevState) => ({
                                        ...prevState,
                                        'tradeableId': event.target?.value?._id,
                                    }))}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب واحد قابل معامله"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }} />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            <span>{selected?.nameFa}</span>
                                        </div>
                                    )}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                    {tradeables?.map((data, index) => (
                                        <MenuItem key={index} value={data}>{data.nameFa}</MenuItem>
                                    ))}
                                </MUISelect>
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <LocalizationProvider dateAdapter={AdapterDayjs} locale={faIR}>
                                <DemoItem label="ساعت شروع بازه">
                                    <MobileTimePicker
                                        className="custom-timepicker w-full !outline-none !border-none"
                                        slotProps={{
                                            textField: {
                                                inputProps: {
                                                    className: errors.startTime ? 'border-red-500 cursor-pointer dark:text-white dark:bg-dark' : 'cursor-pointer dark:text-white dark:bg-dark',
                                                    sx: { border: darkModeToggle ? '1px solid rgb(255, 255, 255,0.2)' : '1px solid rgb(0, 0, 0,0.2)', borderRadius: '16px' },
                                                },
                                            }
                                        }}
                                        value={tradeLimitData?.startTime ? dayjs(tradeLimitData.startTime) : null}
                                        onChange={(time) => {
                                            setTradeLimitData({ ...tradeLimitData, startTime: time?.toISOString() });
                                        }}
                                        localeText={{ ...faIR.components.MuiLocalizationProvider.defaultProps.localeText, cancelButtonLabel: 'انصراف', okButtonLabel: 'تائید' }}
                                    />
                                </DemoItem>
                            </LocalizationProvider>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <LocalizationProvider dateAdapter={AdapterDayjs} locale={faIR}>
                                <DemoItem label="ساعت پایان بازه">
                                    <MobileTimePicker
                                        className="custom-timepicker w-full !outline-none !border-none"
                                        slotProps={{
                                            textField: {
                                                inputProps: {
                                                    className: errors.endTime ? 'border-red-500 cursor-pointer dark:text-white dark:bg-dark' : 'cursor-pointer dark:text-white dark:bg-dark',
                                                    sx: { border: darkModeToggle ? '1px solid rgb(255, 255, 255,0.2)' : '1px solid rgb(0, 0, 0,0.2)', borderRadius: '16px' },
                                                },
                                            }
                                        }}
                                        value={tradeLimitData?.endTime ? dayjs(tradeLimitData.endTime) : null}
                                        onChange={(time) => {
                                            setTradeLimitData({ ...tradeLimitData, endTime: time?.toISOString() });
                                        }}
                                        localeText={{ ...faIR.components.MuiLocalizationProvider.defaultProps.localeText, cancelButtonLabel: 'انصراف', okButtonLabel: 'تائید' }}
                                    />
                                </DemoItem>
                            </LocalizationProvider>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={editTradeLimit(tradeLimitData?._id)}>
                                <text className="text-black font-semibold">ویرایش محدودیت</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomEditTradeLimitDrawer}
                    onClose={() => setOpenBottomEditTradeLimitDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش محدودیت
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomEditTradeLimitDrawer(false)}>
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
                    >
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between text-end m-0"
                                    control={<CustomSwitch
                                        checked={editTotalUser}
                                        onChange={(event) => {
                                            setEditTotalUser(event.target.checked);
                                            if (event.target.checked) {
                                                setTradeLimitData({ ...tradeLimitData, userId: '' });
                                            }
                                        }}
                                    />}
                                    label="تمام کاربران ؟" />
                            </FormGroup>
                        </div>
                        {editTotalUser ? (
                            <div className="col-span-12 md:col-span-6 invisible">
                                <Select
                                    options={[]}
                                    values={[]}
                                    dropdownGap={0}
                                    direction={'ltr'}
                                />
                            </div>
                        ) : (
                            <div className="col-span-12 md:col-span-6">
                                <Select
                                    options={users}
                                    loading={usersSelectLoading}
                                    contentRenderer={usersCustomContentRenderer}
                                    dropdownRenderer={usersCustomDropdownRenderer}
                                    onChange={(values) => {
                                        setTradeLimitData(prev => ({ ...prev, userId: values.length > 0 ? values[0]._id : '' }));
                                    }}
                                    values={editTotalUser ? [] : [{ ...tradeLimitData?.user }]}
                                    dropdownGap={0}
                                    direction={'ltr'}
                                    searchBy={'username,mobileNumber'}
                                />
                            </div>
                        )}
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="مقدار محدودیت (به گرم)"
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
                                    value={tradeLimitData?.limit}
                                    onChange={handleChangeEditData('limit', 'numberFormat')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <InputLabel id="demo-simple-select-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                <MUISelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    defaultValue={tradeLimitData?.tradeable}
                                    onChange={(event) => setTradeLimitData((prevState) => ({
                                        ...prevState,
                                        'tradeableId': event.target?.value?._id,
                                    }))}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب واحد قابل معامله"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }} />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            <span>{selected?.nameFa}</span>
                                        </div>
                                    )}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                    {tradeables?.map((data, index) => (
                                        <MenuItem key={index} value={data}>{data.nameFa}</MenuItem>
                                    ))}
                                </MUISelect>
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <LocalizationProvider dateAdapter={AdapterDayjs} locale={faIR}>
                                <DemoItem label="ساعت شروع بازه">
                                    <MobileTimePicker
                                        className="custom-timepicker w-full !outline-none !border-none"
                                        slotProps={{
                                            textField: {
                                                inputProps: {
                                                    className: errors.startTime ? 'border-red-500 cursor-pointer dark:text-white dark:bg-dark' : 'cursor-pointer dark:text-white dark:bg-dark',
                                                    sx: { border: darkModeToggle ? '1px solid rgb(255, 255, 255,0.2)' : '1px solid rgb(0, 0, 0,0.2)', borderRadius: '16px' },
                                                },
                                            }
                                        }}
                                        value={tradeLimitData?.startTime ? dayjs(tradeLimitData.startTime) : null}
                                        onChange={(time) => {
                                            setTradeLimitData({ ...tradeLimitData, startTime: time?.toISOString() });
                                        }}
                                        localeText={{ ...faIR.components.MuiLocalizationProvider.defaultProps.localeText, cancelButtonLabel: 'انصراف', okButtonLabel: 'تائید' }}
                                    />
                                </DemoItem>
                            </LocalizationProvider>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <LocalizationProvider dateAdapter={AdapterDayjs} locale={faIR}>
                                <DemoItem label="ساعت پایان بازه">
                                    <MobileTimePicker
                                        className="custom-timepicker w-full !outline-none !border-none"
                                        slotProps={{
                                            textField: {
                                                inputProps: {
                                                    className: errors.endTime ? 'border-red-500 cursor-pointer dark:text-white dark:bg-dark' : 'cursor-pointer dark:text-white dark:bg-dark',
                                                    sx: { border: darkModeToggle ? '1px solid rgb(255, 255, 255,0.2)' : '1px solid rgb(0, 0, 0,0.2)', borderRadius: '16px' },
                                                },
                                            }
                                        }}
                                        value={tradeLimitData?.endTime ? dayjs(tradeLimitData.endTime) : null}
                                        onChange={(time) => {
                                            setTradeLimitData({ ...tradeLimitData, endTime: time?.toISOString() });
                                        }}
                                        localeText={{ ...faIR.components.MuiLocalizationProvider.defaultProps.localeText, cancelButtonLabel: 'انصراف', okButtonLabel: 'تائید' }}
                                    />
                                </DemoItem>
                            </LocalizationProvider>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={editTradeLimit(tradeLimitData?._id)}>
                                <text className="text-black font-semibold">ویرایش محدودیت</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

        </div>
    )
}

export default TradeLimitsPageCompo;