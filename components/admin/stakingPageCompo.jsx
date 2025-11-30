import { useState, useEffect } from 'react'
import LinkRouter from 'next/link'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import CircularProgress from '@mui/material/CircularProgress'
import Pagination from '@mui/material/Pagination';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import { useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline'
import CancelIcon from '@mui/icons-material/CancelOutlined'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import MUISelect from '@mui/material/Select'
import moment from 'jalali-moment'
import DatePicker from "react-datepicker2"

import { NumericFormat } from 'react-number-format';

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
import TabPanel from "../shared/TabPanel"
import ConfirmDialog from '../shared/ConfirmDialog';

/**
 * StakingPageCompo component that displays the Staking Page Component of the website.
 * @returns The rendered Staking Page component.
 */
const StakingPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, priceInfo, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [tabValue, setTabValue] = useState(0);
    const handleChange = (event, newValue) => {
        setTabValue(newValue);
        setPageItem(1);
        if (newValue == 0) {
            getStakings(1);
        } else {
            getStakingsRequests(1);
        }
    }

    useEffect(() => {
        getTradeables();
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

    const [loading, setLoading] = useState(false);

    const STAKINGS_TABLE_HEAD = [
        {
            label: 'واحد قابل معامله',
            classes: ""
        },
        {
            label: 'بازه سپرده',
            classes: ""
        },
        {
            label: 'سود سپرده',
            classes: ""
        },
        {
            label: 'وضعیت',
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
        },
    ]

    const [pageItem, setPageItem] = useState(1);
    useEffect(() => {
        getStakings(1);
    }, [pageItem]);

    /**
         * Retrieves Stakings list.
         * @returns None
        */
    const [stakings, setStakings] = useState([]);
    const [loadingStaking, setLoadingStaking] = useState(true);
    const [stakingsLimit, setStakingLimit] = useState(50);
    const [stakingsTotal, setStakingsTotal] = useState(0);
    const getStakings = (page, search) => {
        setLoadingStaking(true);
        ApiCall('/staking/plan', 'GET', locale, {}, ``, 'admin', router).then(async (result) => {
            setStakingsTotal(result.data.length);
            setStakings(result.data);
            setLoadingStaking(false);
        }).catch((error) => {
            setLoadingStaking(false);
            console.log(error);
        });
    }

    /**
     * Search for a Products based on the input value and filter the displayed Products accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchProducts, setSearchProducts] = useState('');
    var typingTimerProducts;
    const doneTypingIntervalProducts = 300;
    const searchProductsItems = (event) => {
        clearTimeout(typingTimerProducts);

        typingTimerProducts = setTimeout(() => {
            if (event.target.value == '') {
                setSearchProducts('');
                setPageItem(1);
                getStakings(1, '');
            } else {
                setSearchProducts(event.target.value);
                setPageItem(1);
                getStakings(1, event.target.value);
            }
        }, doneTypingIntervalProducts);

    }
    const searchProductsItemsHandler = () => {
        clearTimeout(typingTimerProducts)
    }

    const [showAddStaking, setShowAddStaking] = useState(false);
    const [openBottomAddStakingDrawer, setOpenBottomAddStakingDrawer] = useState(false);
    const handleShowAddStaking = () => {
        if (window.innerWidth >= 1024) {
            setShowAddStaking(true);
            setOpenBottomAddStakingDrawer(false);
        } else {
            setShowAddStaking(false);
            setOpenBottomAddStakingDrawer(true);
        }
    }

    const [stakingData, setStakingData] = useState();
    const [showEditStaking, setShowEditStaking] = useState(false);
    const [openBottomEditStakingDrawer, setOpenBottomEditStakingDrawer] = useState(false);
    const handleShowEditStaking = (data) => () => {
        setStakingData(data);
        if (window.innerWidth >= 1024) {
            setShowEditStaking(true);
            setOpenBottomEditStakingDrawer(false);
        } else {
            setShowEditStaking(false);
            setOpenBottomEditStakingDrawer(true);
        }
    }

    /**
     * Handles the change event for Adding products inputs.
     * @param {string} input - The name of the input field being changed.
     * @param {string} type - The type of the input field.
     * @param {Event} event - The change event object.
     * @returns None
     */
    const [addStaking, setAddStaking] = useState(
        {
            tradeableId: '',
            stakingPeriod: 0,
            profitPercentage: 0,
            description: '',
            isActive: true
        }
    )
    const validationSchema = Yup.object().shape({
        tradeableId: Yup.string().required('این فیلد الزامی است'),
        stakingPeriod: Yup.string().required('این فیلد الزامی است'),
        profitPercentage: Yup.string().required('این فیلد الزامی است'),
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema)
    });

    const clearForm = () => {
        setValue('tradeableId', '');
        setValue('stakingPeriod', '');
        setValue('profitPercentage', '');
    }

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
        setAddStaking((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
     * Handles the change event for Eding products inputs.
     * @param {string} input - The name of the input field being changed.
     * @param {string} type - The type of the input field.
     * @param {Event} event - The change event object.
     * @returns None
     */
    const [hasEditPrice, setHasEditPrice] = useState(false);
    const [productEditPrice, setProductEditPrice] = useState(0);
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
        setStakingData((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
     * Add A Staking.
     * @returns None
    */
    const saveStaking = () => {
        setLoading(true);
        let newData = FilterEmptyFields(addStaking);
        ApiCall('/staking/plan', 'POST', locale, newData, '', 'admin', router).then(async (result) => {
            setLoading(false);
            setShowAddStaking(false);
            setOpenBottomAddStakingDrawer(false);
            setAddStaking({
                tradeableId: '',
                stakingPeriod: 0,
                profitPercentage: 0,
                description: '',
                isActive: true
            });
            clearForm();
            getStakings();
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.SuccessRequest'),
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
     * Edit A Staking.
     * @returns None
    */
    const editStaking = (stakingId) => (event) => {
        event.preventDefault();
        setLoading(true);
        let newData = FilterEmptyFields(stakingData);
        const filteredStakingData = FilterObjectFields(newData, [
            "isActive",
            "description"
        ]);

        ApiCall(`/staking/plan/${stakingId}`, 'PATCH', locale, filteredStakingData, '', 'admin', router).then(async (result) => {
            event.target.disabled = false;
            setLoading(false);
            setShowEditStaking(false);
            setOpenBottomEditStakingDrawer(false);
            setStakingData();
            getStakings();
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

    /**
        * change Status for a Staking.
        * @returns None
       */
    const [changeStatusStakingLoading, setChangeStatusStakingLoading] = useState(false);
    const changeStatusStaking = (stakingId, isActive) => (event) => {
        event.preventDefault();
        setChangeStatusStakingLoading(true);
        event.target.disabled = true;
        ApiCall(`/staking/plan/${stakingId}`, 'PATCH', locale, { isActive }, '', 'admin', router).then(async (result) => {
            event.target.disabled = false;
            setChangeStatusStakingLoading(false);
            getStakings();
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setChangeStatusProductLoading(false);
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
    const [deleteId, setDeleteId] = useState('');

    const handleOpenDialog = (deleteId) => (event) => {
        setDeleteId(deleteId);
        setOpenDialog(true);
    }
    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    /**
     * Delete a Staking.
     * @returns None
    */
    const [deleteLoading, setDeleteLoading] = useState(false);
    const deleteStaking = () => {
        setDeleteLoading(true);
        ApiCall(`/staking/plan/${deleteId}`, 'DELETE', locale, {}, '', 'admin', router).then(async (result) => {
            setDeleteLoading(false);
            getStakings();
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
         * Retrieves Stakings Requests list.
         * @returns None
        */
    const [stakingsRequests, setStakingsRequests] = useState([]);
    const [loadingStakingsRequests, setLoadingStakingsRequests] = useState(true);
    const [stakingsRequestsLimit, setStakingsRequestsLimit] = useState(10);
    const [stakingsRequestsTotal, setStakingsRequestsTotal] = useState(0);
    const getStakingsRequests = (page) => {
        setLoadingStakingsRequests(true);
        ApiCall('/staking/stake', 'GET', locale, {}, `sortOrder=0&sortBy=createdAt&limit=${stakingsRequestsLimit}&skip=${(page * stakingsRequestsLimit) - stakingsRequestsLimit}`, 'admin', router).then(async (result) => {
            setStakingsRequestsTotal(result.count);
            setStakingsRequests(result.data);
            setLoadingStakingsRequests(false);
        }).catch((error) => {
            setLoadingStakingsRequests(false);
            console.log(error);
        });
    }
    const handlePageChange = (event, value) => {
        setPageItem(value);
        getStakingsRequests(value);
    }

    const REQUESTS_TABLE_HEAD = [
        {
            label: 'نام کاربر',
            classes: ""
        },
        {
            label: 'سپرده',
            classes: ""
        },
        {
            label: 'مقدار',
            classes: ""
        },
        {
            label: 'تاریخ پایان',
            classes: ""
        },
        {
            label: 'تاریخ ثبت',
            classes: ""
        },
        {
            label: 'وضعیت',
            classes: ""
        }
    ]

    return (
        <div className="flex flex-col gap-y-8">
            <Tabs
                orientation="horizontal"
                value={tabValue}
                onChange={handleChange}
                sx={{ borderRight: 1, borderColor: 'divider' }}
            >
                <Tab label="سپرده ها" className="w-1/3 lg:w-auto whitespace-nowrap dark:text-white" classes={{ selected: 'text-primary' }} />
                <Tab label="درخواست های سپرده" className="w-1/3 lg:w-auto whitespace-nowrap dark:text-white" classes={{ selected: 'text-primary' }} />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
                <div className=" flex flex-col gap-y-8">
                    <section className="flex items-center justify-between">
                        <h1 className="text-large-2">سپرده ها</h1>
                        <div className="flex items-center gap-x-4">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation onClick={handleShowAddStaking}>
                                <text className="text-black font-semibold">افزودن سپرده</text>
                            </Button>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between gap-x-4">
                            {/* <form autoComplete="off">
                                <FormControl className="w-full md:w-auto">
                                    <TextField
                                        size="small"
                                        type="text"
                                        label="جستجو سپرده"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                        }}
                                        onChange={(event) => setSearchProducts(event.target.value)}
                                        onKeyDown={searchProductsItemsHandler}
                                        onKeyUp={searchProductsItems} />
                                </FormControl>
                            </form> */}
                            <div></div>
                            <span className="dark:text-white">تعداد کل: {loadingStaking ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (stakingsTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                        {loadingStaking ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : stakings.length > 0 ?
                            <>
                                <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                        <TableHead className="dark:bg-dark">
                                            <TableRow>
                                                {STAKINGS_TABLE_HEAD.map((data, index) => (
                                                    <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
                                                        <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {stakings.map((data, index) => (
                                                <TableRow
                                                    key={index}
                                                    sx={{ '&:last-child td': { border: 0 } }}
                                                    className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                                    <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        <div className="flex items-center gap-x-4">
                                                            <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} alt={data.tradeable?.name}
                                                                className="w-10 h-10 rounded-[50%]" />
                                                            <span>{data.tradeable?.name} - {data.nameFa}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        <span>{data.stakingPeriod} ماهه</span>
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        <span>{data.profitPercentage} درصد</span>
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        {data.isActive ? <Chip label="فعال" variant="outlined" size="small" className="w-full badge badge-success px-4" /> :
                                                            <Chip label="غیرفعال" variant="outlined" size="small" className="w-full badge badge-error px-4" />}
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                            .locale('fa')
                                                            .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                        <Button variant="text" size="medium" color="primary" className="rounded-lg" disableElevation
                                                            onClick={handleShowEditStaking(data)}>
                                                            <text className=" font-semibold">ویرایش</text>
                                                        </Button >
                                                    </TableCell>
                                                    <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                        {data?.isActive ?
                                                            <Tooltip title="غیرفعالسازی سپرده">
                                                                <IconButton
                                                                    color={`error`}
                                                                    onClick={changeStatusStaking(data?._id, false)}>
                                                                    <CancelIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            : <Tooltip title="فعالسازی سپرده">
                                                                <IconButton
                                                                    color={`success`}
                                                                    onClick={changeStatusStaking(data?._id, true)}>
                                                                    <CheckCircleIcon />
                                                                </IconButton>
                                                            </Tooltip>}
                                                        <Tooltip title="حذف سپرده">
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
                                    onConfirm={deleteStaking}
                                    title="آیا مطمئن هستید؟"
                                    loading={deleteLoading}
                                    darkModeToggle={darkModeToggle}
                                />
                            </>
                            : <div className="py-16">
                                <span className="block text-center text-large-1 text-primary-gray">سپرده ای تعریف نشده است.</span>
                            </div>}

                    </section>
                </div>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <div className=" flex flex-col gap-y-8">
                    <section className="flex items-center justify-between">
                        <h1 className="text-large-2">درخواست های سپرده گذاری</h1>
                    </section>
                    <section className="overflow-x-auto overflow-y-hidden">
                        <div className="flex items-center justify-between gap-x-4">
                            <div></div>
                            <span className="dark:text-white">تعداد کل: {loadingStakingsRequests ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (stakingsRequestsTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                        {loadingStakingsRequests ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : stakingsRequests.length > 0 ?
                            <>
                                <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                        <TableHead className="dark:bg-dark">
                                            <TableRow>
                                                {REQUESTS_TABLE_HEAD.map((data, index) => (
                                                    <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
                                                        <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {stakingsRequests.map((data, index) => (
                                                <TableRow
                                                    key={index}
                                                    sx={{ '&:last-child td': { border: 0 } }}
                                                    className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                                    <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        {data.user ? <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data.user?._id}`}>
                                                            <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                                                <span>({data.user?.mobileNumber}) {data.user?.firstName} {data.user?.lastName}</span>
                                                            </a>
                                                        </LinkRouter> : '----'}
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        سپرده {data.stakePlan?.stakingPeriod} ماهه ({data.stakePlan?.tradeable?.nameFa})
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        {(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} {data.type == 'Fixed' ? 'تومان' : 'درصد'}
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                        <span>{moment(moment(data.endDate).format("YYYY-MM-DD"), 'YYYY-MM-DD')
                                                            .locale('fa')
                                                            .format('jYYYY/jMM/jDD')}</span>
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                        <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                            .locale('fa')
                                                            .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                    </TableCell>
                                                    <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                        {data.status == 'Completed' ? <Chip label="تکمیل شده" variant="outlined" size="small" className="w-full badge badge-success" /> : ''}
                                                        {data.status == 'Active' ? <Chip label="فعال" variant="outlined" size="small" className="w-full badge badge-primary" /> : ''}
                                                        {data.status == 'Canceled' ? <Chip label="لغو شده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                            : <div className="py-16">
                                <span className="block text-center text-large-1 text-primary-gray">درخواستی تاکنون ثبت نشده است</span>
                            </div>}

                    </section>
                    {Math.ceil(stakingsRequestsTotal / stakingsRequestsLimit) > 1 ?
                        <div className="text-center mt-4">
                            <Pagination siblingCount={0} count={Math.ceil(stakingsRequestsTotal / stakingsRequestsLimit)} variant="outlined" color="primary" className="justify-center"
                                page={pageItem} onChange={handlePageChange} />
                        </div>
                        : ''}
                </div>
            </TabPanel>

            {/* AddStaking */}
            <>
                <Dialog onClose={() => setShowAddStaking(false)} open={showAddStaking} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن سپرده
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowAddStaking(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate autoComplete="off" onSubmit={handleSubmit(saveStaking)}>
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
                                        {errors.tradeableId && <FormHelperText className="text-red-500 !mx-4">{errors.tradeableId.message}</FormHelperText>}
                                        {errors.tradeableId ? '' : <FormHelperText className="text-sell text-xs">این فیلد پس از ثبت قابل تغییر نمی باشد</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="stakingPeriod"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="مدت زمان سپرده (به ماه)"
                                            variant="outlined"
                                            error={!!errors.stakingPeriod}
                                            helperText={errors.stakingPeriod ? errors.stakingPeriod.message : ''}
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
                                                handleChangeAddData(event, 'stakingPeriod', 'numberFormat');
                                            }}
                                        />
                                        {errors.stakingPeriod ? '' : <FormHelperText className="text-sell text-xs">این فیلد پس از ثبت قابل تغییر نمی باشد</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="profitPercentage"
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
                                            label="سود سپرده (به درصد)"
                                            variant="outlined"
                                            error={!!errors.profitPercentage}
                                            helperText={errors.profitPercentage ? errors.profitPercentage.message : ''}
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
                                                handleChangeAddData(event, 'profitPercentage', 'numberFormat');
                                            }}
                                        />
                                        {errors.profitPercentage ? '' : <FormHelperText className="text-sell text-xs">این فیلد پس از ثبت قابل تغییر نمی باشد</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="توضیحات سپرده"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={addStaking?.description}
                                    onChange={(event) => handleChangeAddData(event, 'description', 'text')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن سپرده</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomAddStakingDrawer}
                    onClose={() => setOpenBottomAddStakingDrawer(false)}
                    PaperProps={{ className: 'drawers', sx: { height: '90%' } }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن سپرده
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomAddStakingDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate autoComplete="off" onSubmit={handleSubmit(saveStaking)}>
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
                                        {errors.tradeableId && <FormHelperText className="text-red-500 !mx-4">{errors.tradeableId.message}</FormHelperText>}
                                        {errors.tradeableId ? '' : <FormHelperText className="text-sell text-xs">این فیلد پس از ثبت قابل تغییر نمی باشد</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12">
                            <Controller
                                name="stakingPeriod"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="مدت زمان سپرده (به ماه)"
                                            variant="outlined"
                                            error={!!errors.stakingPeriod}
                                            helperText={errors.stakingPeriod ? errors.stakingPeriod.message : ''}
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
                                                handleChangeAddData(event, 'stakingPeriod', 'numberFormat');
                                            }}
                                        />
                                        {errors.stakingPeriod ? '' : <FormHelperText className="text-sell text-xs">این فیلد پس از ثبت قابل تغییر نمی باشد</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12">
                            <Controller
                                name="profitPercentage"
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
                                            label="سود سپرده (به درصد)"
                                            variant="outlined"
                                            error={!!errors.profitPercentage}
                                            helperText={errors.profitPercentage ? errors.profitPercentage.message : ''}
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
                                                handleChangeAddData(event, 'profitPercentage', 'numberFormat');
                                            }}
                                        />
                                        {errors.profitPercentage ? '' : <FormHelperText className="text-sell text-xs">این فیلد پس از ثبت قابل تغییر نمی باشد</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="توضیحات سپرده"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={addStaking?.description}
                                    onChange={(event) => handleChangeAddData(event, 'description', 'text')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن سپرده</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* EditStaking */}
            <>
                <Dialog onClose={() => setShowEditStaking(false)} open={showEditStaking} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش سپرده {stakingData?.name}
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowEditStaking(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={0}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="مدت زمان سپرده (به ماه)"
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
                                    value={stakingData?.stakingPeriod}
                                    onChange={handleChangeEditData('stakingPeriod', 'numberFormat')}
                                />
                                <FormHelperText className="text-sell text-xs">این فیلد قابل تغییر نمی باشد</FormHelperText>
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="سود سپرده (به درصد)"
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
                                    value={stakingData?.profitPercentage}
                                    onChange={handleChangeEditData('profitPercentage', 'numberFormat')}
                                />
                                <FormHelperText className="text-sell text-xs">این فیلد قابل تغییر نمی باشد</FormHelperText>
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="توضیحات سپرده"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={stakingData?.description}
                                    onChange={handleChangeEditData('description', 'text')} />
                            </FormControl>
                        </div>
                    </form>
                    <div className="text-end">
                        <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                            onClick={editStaking(stakingData?._id)}>
                            <text className="text-black font-semibold">ویرایش سپرده</text>
                        </LoadingButton>
                    </div>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomEditStakingDrawer}
                    onClose={() => setOpenBottomEditStakingDrawer(false)}
                    PaperProps={{ className: 'drawers', sx: { height: '90%' } }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش سپرده {stakingData?.name}
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomEditStakingDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <section className="grid grid-cols-12 gap-x-4 gap-y-8 py-8">
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={0}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="مدت زمان سپرده (به ماه)"
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
                                    value={stakingData?.stakingPeriod}
                                    onChange={handleChangeEditData('stakingPeriod', 'numberFormat')}
                                />
                                <FormHelperText className="text-sell text-xs">این فیلد قابل تغییر نمی باشد</FormHelperText>
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="سود سپرده (به درصد)"
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
                                    value={stakingData?.profitPercentage}
                                    onChange={handleChangeEditData('profitPercentage', 'numberFormat')}
                                />
                                <FormHelperText className="text-sell text-xs">این فیلد قابل تغییر نمی باشد</FormHelperText>
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="توضیحات سپرده"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={stakingData?.description}
                                    onChange={handleChangeEditData('description', 'text')} />
                            </FormControl>
                        </div>
                    </section>
                    <div className="w-full">
                        <LoadingButton type="button" variant="contained" size="medium" fullWidth className="rounded-lg" disableElevation loading={loading}
                            onClick={editStaking(stakingData?._id)}>
                            <text className="text-black font-semibold">ویرایش سپرده</text>
                        </LoadingButton>
                    </div>
                </SwipeableDrawer>
            </>

        </div >
    )
}

export default StakingPageCompo;