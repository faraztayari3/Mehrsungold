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
 * UserFeesPageCompo component that displays the UserFees Page Component of the website.
 * @returns The rendered UserFees Page component.
 */
const UserFeesPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const FEES_TABLE_HEAD = [
        {
            label: 'کاربر',
            classes: ""
        },
        {
            label: 'واحد معامله',
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
        getUserFees(1);
    }, []);

    /**
        * Retrieves userFees.
        * @returns None
       */
    const [userFees, setUserFees] = useState([]);
    const [loadingUserFees, setLoadingUserFees] = useState(true);
    const [userFeesLimit, setUserFeesLimit] = useState(10);
    const [userFeesTotal, setuserFeesTotal] = useState(0);
    const [totalUser, setTotalUser] = useState(true);
    const getUserFees = (page, search) => {
        setLoadingUserFees(true);
        ApiCall('/transaction/user-fee', 'GET', locale, {}, `sortOrder=0&sortBy=createdAt&limit=${userFeesLimit}&skip=${(page * userFeesLimit) - userFeesLimit}`, 'admin', router).then(async (result) => {
            setuserFeesTotal(result.count);
            setUserFees(result.data);
            setLoadingUserFees(false);
        }).catch((error) => {
            setLoadingUserFees(false);
            console.log(error);
        });
    }

    const handlePageChange = (event, value) => {
        setPageItem(value);
        getUserFees(value);
    }

    /**
     * Search for a UserFees based on the input value and filter the displayed UserFees accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchUserFees, setSearchUserFees] = useState('');
    var typingTimerUserFees;
    const doneTypingIntervalUserFees = 300;
    const searchUserFeesItems = (event) => {
        clearTimeout(typingTimerUserFees);

        typingTimerUserFees = setTimeout(() => {
            if (event.target.value == '') {
                setSearchUserFees('');
                setPageItem(1);
                getUserFees(1, '');
            } else {
                setSearchUserFees(event.target.value);
                setPageItem(1);
                getUserFees(1, event.target.value);
            }
        }, doneTypingIntervalUserFees);

    }
    const searchUserFeesItemsHandler = () => {
        clearTimeout(typingTimerUserFees)
    }

    const [showAddUserFee, setShowAddUserFee] = useState(false);
    const [openBottomAddUserFeeDrawer, setOpenBottomAddUserFeeDrawer] = useState(false);
    const handleShowAddUserFee = () => {
        if (window.innerWidth >= 1024) {
            setShowAddUserFee(true);
            setOpenBottomAddUserFeeDrawer(false);
        } else {
            setShowAddUserFee(false);
            setOpenBottomAddUserFeeDrawer(true);
        }
    }

    const [addUserFee, setAddUserFee] = useState({
        userId: '',
        tradeableId: '',
        buyFee: '',
        sellFee: '',
        feeType: 'Fixed'
    });

    const validationSchema = Yup.object({
        userId: Yup.string().required('این فیلد الزامی است'),
        buyFee: Yup.string().required('این فیلد الزامی است'),
        sellFee: Yup.string().required('این فیلد الزامی است'),
        tradeableId: Yup.string().required('این فیلد الزامی است'),
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const clearForm = () => {
        setValue('userId', '');
        setValue('buyFee', '');
        setValue('sellFee', '');
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
        setAddUserFee((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
    * Save new UserFees.
    * @returns None
   */
    const saveUserFees = () => {
        setLoading(true);
        let body = { ...addUserFee };
        ApiCall('/transaction/user-fee', 'POST', locale, body, '', 'admin', router).then(async (result) => {
            setLoading(false);
            getUserFees(1);
            setShowAddUserFee(false);
            setOpenBottomAddUserFeeDrawer(false);
            setAddUserFee({
                userId: '',
                tradeableId: '',
                buyFee: '',
                sellFee: '',
                feeType: 'Fixed'
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
    const [userFeesId, setUserFeesId] = useState('');
    const handleOpenDialog = (userFeesId) => (event) => {
        setUserFeesId(userFeesId);
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
        ApiCall(`/transaction/user-fee/${userFeesId}`, 'DELETE', locale, {}, '', 'admin', router).then(async (result) => {
            setDeleteLoading(false);
            getUserFees(1);
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

    const [userFeesData, setUserFeesData] = useState();
    const [showEditUserFees, setShowEditUserFees] = useState(false);
    const [openBottomEditUserFeesDrawer, setOpenBottomEditUserFeesDrawer] = useState(false);
    const handleShowEditUserFees = (data) => () => {
        setUserFeesData(data);
        if (window.innerWidth >= 1024) {
            setShowEditUserFees(true);
            setOpenBottomEditUserFeesDrawer(false);
        } else {
            setShowEditUserFees(false);
            setOpenBottomEditUserFeesDrawer(true);
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
        setUserFeesData((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
         * Edit A Trade Limit.
         * @returns None
        */
    const editUserFees = (limitId) => (event) => {
        event.preventDefault();
        setLoading(true);
        let newData = FilterEmptyFields(userFeesData);
        const filteredData = FilterObjectFields(newData, [
            "userId",
            "tradeableId",
            "buyFee",
            "sellFee",
            "feeType",
        ]);

        ApiCall(`/transaction/user-fee/${limitId}`, 'PATCH', locale, { ...filteredData }, '', 'admin', router).then(async (result) => {
            event.target.disabled = false;
            setLoading(false);
            setShowEditUserFees(false);
            setOpenBottomEditUserFeesDrawer(false);
            setUserFeesData();
            getUserFees(1);
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
                <h1 className="text-2xl md:text-large-2">تعیین کارمزد معاملاتی برای کاربران</h1>
                <div className="flex items-center gap-x-4">
                    <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation onClick={handleShowAddUserFee}>
                        <text className="text-black font-semibold">افزودن کارمزد معاملاتی</text>
                    </Button >
                </div>
            </section>
            <div className="flex items-center justify-between gap-x-4">
                <div></div>
                <span className="dark:text-white">تعداد کل: {loadingUserFees ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (userFeesTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>

            {loadingUserFees ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div>
                :
                <section className="overflow-x-auto overflow-y-hidden">
                    {userFees.length > 0 ?
                        <>
                            <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                                <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                    <TableHead className="dark:bg-dark">
                                        <TableRow>
                                            {FEES_TABLE_HEAD.map((data, index) => (
                                                <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-center pb-4`} key={index}>
                                                    <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {userFees.map((data, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{ '&:last-child td': { border: 0 } }}
                                                className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                                <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                    {data.user ?
                                                        <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data.user?._id}`}>
                                                            <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                                                <span>({data.user?.mobileNumber}) {data.user?.firstName} {data.user?.lastName}</span>
                                                            </a>
                                                        </LinkRouter> : '----'}
                                                </TableCell>
                                                <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                    {data.tradeable ? <div className="flex items-center gap-x-4">
                                                        <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} alt={data.tradeable?.name}
                                                            className="w-10 h-10 rounded-[50%]" />
                                                        <span>{data.tradeable?.nameFa}</span>
                                                    </div> : '----'}
                                                </TableCell>
                                                <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                    <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                        .locale('fa')
                                                        .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                </TableCell>
                                                <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                    <Button variant="text" size="medium" color="primary" className="rounded-lg" disableElevation
                                                        onClick={handleShowEditUserFees(data)}>
                                                        <text className=" font-semibold">ویرایش</text>
                                                    </Button >
                                                </TableCell>
                                                <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                    <Tooltip title="حذف کارمزد معاملاتی">
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
                            <span className="block text-center text-large-1 text-primary-gray">کارمزد معاملاتی یافت نشد</span>
                        </div>}
                </section>
            }

            {Math.ceil(userFeesTotal / userFeesLimit) > 1 ?
                <div className="text-center mt-4">
                    <Pagination siblingCount={0} count={Math.ceil(userFeesTotal / userFeesLimit)} variant="outlined" color="primary" className="justify-center"
                        page={pageItem} onChange={handlePageChange} />
                </div>
                : ''}

            {/* AddUserFee */}
            <>
                <Dialog onClose={() => setShowAddUserFee(false)} open={showAddUserFee} maxWidth={'sm'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن کارمزد معاملاتی
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowAddUserFee(false)}>
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
                        onSubmit={handleSubmit(saveUserFees)}
                    >
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
                                            setAddUserFee({ ...addUserFee, userId: values.length > 0 ? values[0]._id : '' });
                                        }}
                                        values={[]}
                                        dropdownGap={0}
                                        direction={'ltr'}
                                        searchBy={'username,mobileNumber'}
                                    />
                                )}
                            />
                            {errors.userId ? <FormHelperText className="text-red-500 !mx-4">{errors.userId.message}</FormHelperText> :
                                <FormHelperText className="text-sell text-xs">این فیلد پس از ثبت قابل تغییر نمی باشد.</FormHelperText>}
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
                                        {errors.tradeableId ? <FormHelperText className="text-red-500 !mx-4">{errors.tradeableId.message}</FormHelperText> :
                                            <FormHelperText className="text-sell text-xs">این فیلد پس از ثبت قابل تغییر نمی باشد.</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <MUISelect
                                type="text"
                                variant="filled"
                                color="black"
                                label="نوع  کارمزد معاملاتی"
                                className="form-select w-full"
                                value={addUserFee?.feeType}
                                onChange={(event) => handleChangeAddData(event, 'feeType', 'text')}
                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                <MenuItem value="Fixed" >ثابت</MenuItem>
                                <MenuItem value="Percent" >درصدی</MenuItem>
                            </MUISelect>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <Controller
                                name="buyFee"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={addUserFee?.feeType == 'Fixed' ? 0 : 3}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label={addUserFee?.feeType == 'Fixed' ? "کارمزد خرید (به تومان)" : "کارمزد خرید (به درصد)"}
                                            variant="outlined"
                                            error={!!errors.buyFee}
                                            helperText={errors.buyFee ? errors.buyFee.message : ''}
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
                                                handleChangeAddData(event, 'buyFee', 'numberFormat');
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <Controller
                                name="sellFee"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={addUserFee?.feeType == 'Fixed' ? 0 : 3}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label={addUserFee?.feeType == 'Fixed' ? "کارمزد فروش (به تومان)" : "کارمزد فروش (به درصد)"}
                                            variant="outlined"
                                            error={!!errors.sellFee}
                                            helperText={errors.sellFee ? errors.sellFee.message : ''}
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
                                                handleChangeAddData(event, 'sellFee', 'numberFormat');
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>

                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن  کارمزد معاملاتی</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomAddUserFeeDrawer}
                    onClose={() => setOpenBottomAddUserFeeDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن  کارمزد معاملاتی
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomAddUserFeeDrawer(false)}>
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
                        onSubmit={handleSubmit(saveUserFees)}
                    >
                        <div className="col-span-12">
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
                                            setAddUserFee({ ...addUserFee, userId: values.length > 0 ? values[0]._id : '' });
                                        }}
                                        values={[]}
                                        dropdownGap={0}
                                        direction={'ltr'}
                                        searchBy={'username,mobileNumber'}
                                    />
                                )}
                            />
                            {errors.userId ? <FormHelperText className="text-red-500 !mx-4">{errors.userId.message}</FormHelperText> :
                                <FormHelperText className="text-sell text-xs">این فیلد پس از ثبت قابل تغییر نمی باشد.</FormHelperText>}
                        </div>
                        <div className="col-span-12">
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
                                        {errors.tradeableId ? <FormHelperText className="text-red-500 !mx-4">{errors.tradeableId.message}</FormHelperText> :
                                            <FormHelperText className="text-sell text-xs">این فیلد پس از ثبت قابل تغییر نمی باشد.</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12">
                            <MUISelect
                                type="text"
                                variant="filled"
                                color="black"
                                label="نوع  کارمزد معاملاتی"
                                className="form-select w-full"
                                value={addUserFee?.feeType}
                                onChange={(event) => handleChangeAddData(event, 'feeType', 'text')}
                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                <MenuItem value="Fixed" >ثابت</MenuItem>
                                <MenuItem value="Percent" >درصدی</MenuItem>
                            </MUISelect>
                        </div>
                        <div className="col-span-12">
                            <Controller
                                name="buyFee"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={addUserFee?.feeType == 'Fixed' ? 0 : 3}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label={addUserFee?.feeType == 'Fixed' ? "کارمزد خرید (به تومان)" : "کارمزد خرید (به درصد)"}
                                            variant="outlined"
                                            error={!!errors.buyFee}
                                            helperText={errors.buyFee ? errors.buyFee.message : ''}
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
                                                handleChangeAddData(event, 'buyFee', 'numberFormat');
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12">
                            <Controller
                                name="sellFee"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={addUserFee?.feeType == 'Fixed' ? 0 : 3}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label={addUserFee?.feeType == 'Fixed' ? "کارمزد فروش (به تومان)" : "کارمزد فروش (به درصد)"}
                                            variant="outlined"
                                            error={!!errors.sellFee}
                                            helperText={errors.sellFee ? errors.sellFee.message : ''}
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
                                                handleChangeAddData(event, 'sellFee', 'numberFormat');
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن  کارمزد معاملاتی</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* EditUserFees */}
            <>
                <Dialog onClose={() => setShowEditUserFees(false)} open={showEditUserFees} maxWidth={'sm'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش  کارمزد معاملاتی
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowEditUserFees(false)}>
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
                        <div className="col-span-12 md:col-span-4">
                            <MUISelect
                                type="text"
                                variant="filled"
                                color="black"
                                label="نوع  کارمزد معاملاتی"
                                className="form-select w-full"
                                value={userFeesData?.feeType}
                                onChange={handleChangeEditData('feeType', 'text')}
                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                <MenuItem value="Fixed" >ثابت</MenuItem>
                                <MenuItem value="Percent" >درصدی</MenuItem>
                            </MUISelect>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={userFeesData?.feeType == 'Fixed' ? 0 : 3}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label={userFeesData?.feeType == 'Fixed' ? "کارمزد خرید (به تومان)" : "کارمزد خرید (به درصد)"}
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
                                    value={userFeesData?.buyFee}
                                    onChange={handleChangeEditData('buyFee', 'numberFormat')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={userFeesData?.feeType == 'Fixed' ? 0 : 3}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label={userFeesData?.feeType == 'Fixed' ? "کارمزد فروش (به تومان)" : "کارمزد فروش (به درصد)"}
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
                                    value={userFeesData?.sellFee}
                                    onChange={handleChangeEditData('sellFee', 'numberFormat')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={editUserFees(userFeesData?._id)}>
                                <text className="text-black font-semibold">ویرایش  کارمزد معاملاتی</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomEditUserFeesDrawer}
                    onClose={() => setOpenBottomEditUserFeesDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش  کارمزد معاملاتی
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomEditUserFeesDrawer(false)}>
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
                        <div className="col-span-12">
                            <MUISelect
                                type="text"
                                variant="filled"
                                color="black"
                                label="نوع  کارمزد معاملاتی"
                                className="form-select w-full"
                                value={userFeesData?.feeType}
                                onChange={handleChangeEditData('feeType', 'text')}
                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                <MenuItem value="Fixed" >ثابت</MenuItem>
                                <MenuItem value="Percent" >درصدی</MenuItem>
                            </MUISelect>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={userFeesData?.feeType == 'Fixed' ? 0 : 3}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label={userFeesData?.feeType == 'Fixed' ? "کارمزد خرید (به تومان)" : "کارمزد خرید (به درصد)"}
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
                                    value={userFeesData?.buyFee}
                                    onChange={handleChangeEditData('buyFee', 'numberFormat')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={userFeesData?.feeType == 'Fixed' ? 0 : 3}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label={userFeesData?.feeType == 'Fixed' ? "کارمزد فروش (به تومان)" : "کارمزد فروش (به درصد)"}
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
                                    value={userFeesData?.sellFee}
                                    onChange={handleChangeEditData('sellFee', 'numberFormat')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={editUserFees(userFeesData?._id)}>
                                <text className="text-black font-semibold">ویرایش  کارمزد معاملاتی</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

        </div>
    )
}

export default UserFeesPageCompo;