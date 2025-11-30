import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import CancelIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline'
import Chip from '@mui/material/Chip';
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Pagination from '@mui/material/Pagination';
import MUISelect from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
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

//Components 
import CustomSwitch from "../shared/CustomSwitch"
import InvoiceGenerator from "./compos/invoiceGenerator";

/**
 * ProductsTransationsPageCompo component that displays the ProductsTransations Page Component of the website.
 * @returns The rendered ProductsTransations Page component.
 */
const ProductsTransationsPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);
    const [rejectDesc, setRejectDesc] = useState('');
    const [loadingTransactions, setLoadingTransactions] = useState('');
    const [transactionsTotal, setTransactionsTotal] = useState(0);
    const [transactionsLimit, setTransactionsLimit] = useState(10);
    const [transactionId, setTransactionId] = useState('');
    const [transactionType, setTransactionType] = useState('product');

    const PRODUCTS_TABLE_HEAD = [
        {
            label: 'کاربر',
            classes: ""
        },
        {
            label: 'نام محصول',
            classes: ""
        },
        {
            label: 'مقدار',
            classes: ""
        },
        {
            label: 'تاریخ ثبت',
            classes: ""
        },
        {
            label: 'جزئیات',
            classes: ""
        }, {
            label: 'وضعیت',
            classes: ""
        },
        {
            label: 'فاکتور',
            classes: ""
        },
        {
            label: '',
            classes: ""
        },
    ]

    const [pageItem, setPageItem] = useState(1);
    useEffect(() => {
        getProductsRequests();
    }, []);

    /**
        * Retrieves Products Requests.
        * @returns None
       */
    const [products, setProducts] = useState([]);
    const getProductsRequests = (search) => {
        setLoadingTransactions(true);
        ApiCall('/product-request', 'GET', locale, {}, `${search ? `search=${search}&` : ''}sortOrder=0&sortBy=createdAt&limit=${transactionsLimit}&skip=${(pageItem * transactionsLimit) - transactionsLimit}`, 'admin', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setProducts(result.data);
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }

    const handlePageChange = (event, value) => {
        setPageItem(value);
        getProductsRequests();
    }

    /**
     * Search for a ProductsRequests based on the input value and filter the displayed ProductsRequests accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchProductsRequests, setSearchProductsRequests] = useState('');
    var typingTimerProductsRequests;
    const doneTypingIntervalProductsRequests = 300;
    const searchProductsRequestsItems = (event) => {
        clearTimeout(typingTimerProductsRequests);

        typingTimerProductsRequests = setTimeout(() => {
            if (event.target.value == '') {
                setSearchProductsRequests('');
                setPageItem(1);
                getProductsRequests('');
            } else {
                setSearchProductsRequests(event.target.value);
                setPageItem(1);
                getProductsRequests(event.target.value);
            }
        }, doneTypingIntervalProductsRequests);

    }
    const searchProductsRequestsItemsHandler = () => {
        clearTimeout(typingTimerProductsRequests)
    }

    const [showReject, setShowReject] = useState(false);
    const [openBottomRejectDrawer, setOpenBottomRejectDrawer] = useState(false);
    const handleShowReject = (transactionId, type) => () => {
        setTransactionId(transactionId);
        setTransactionType(type);
        if (window.innerWidth >= 1024) {
            setShowReject(true);
            setOpenBottomRejectDrawer(false);
        } else {
            setShowReject(false);
            setOpenBottomRejectDrawer(true);
        }
    }

    const [requestInfo, setRequestInfo] = useState('');
    const [showBranchInfo, setShowBranchInfo] = useState(false);
    const [openBottomBranchInfoDrawer, setOpenBottomBranchInfoDrawer] = useState(false);
    const handleShowBranchInfo = (data) => () => {
        setRequestInfo(data);
        if (window.innerWidth >= 1024) {
            setShowBranchInfo(true);
            setOpenBottomBranchInfoDrawer(false);
        } else {
            setShowBranchInfo(false);
            setOpenBottomBranchInfoDrawer(true);
        }
    }

    const [confirmRequestData, setConfirmRequestData] = useState(false);
    const [showConfirmRequest, setShowConfirmRequest] = useState(false);
    const [openBottomConfirmRequestDrawer, setOpenBottomConfirmRequestDrawer] = useState(false);
    const handleShowConfirmRequest = (data) => () => {
        setConfirmRequestData(data);
        if (window.innerWidth >= 1024) {
            setShowConfirmRequest(true);
            setOpenBottomConfirmRequestDrawer(false);
        } else {
            setShowConfirmRequest(false);
            setOpenBottomConfirmRequestDrawer(true);
        }
    }

    const validationSchema = Yup.object({
        differenceAmount: Yup.string().required('این فیلد الزامی است').transform(value => value?.replace(/,/g, ''))
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: { differenceAmount: 0 }
    });

    const clearForm = () => {
        setValue('differenceAmount', '');
    }

    /**
     * Rejcet or Accept Product Request.
     * @returns None
    */
    const [confirmData, setConfirmData] = useState({
        differenceAmount: 0,
        purity: '',
        labName: '',
        confirmDescription: ''
    });
    const [isLoss, setIsLoss] = useState('Remove');
    const [differenceAmount, setdifferenceAmount] = useState(0);
    const confirmRequestStatus = (transactionId, status) => {
        if (status == 'Accepted') {
            setLoading(true);
            let body = !confirmRequestData?.product?.price &&
                !confirmRequestData?.product?.isQuantitative ? {
                status,
                differenceAmount: confirmData?.differenceAmount,
                purity: confirmData?.purity,
                labName: confirmData?.labName
            } :
                {
                    status, differenceAmount: 0,
                    // confirmDescription: confirmData?.confirmDescription 
                }

            ApiCall(`/product-request/verify/${transactionId}`, 'PATCH', locale, body, '', 'admin', router).then(async (result) => {
                setLoading(false);
                getProductsRequests();
                setShowConfirmRequest(false);
                setOpenBottomConfirmRequestDrawer(false);
                setConfirmData({
                    differenceAmount: 0,
                    purity: '',
                    labName: '',
                    confirmDescription: ''
                });
                setIsLoss('Remove');
                setdifferenceAmount(0);
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
    }
    const rejectRequestStatus = (transactionId, status) => (event) => {
        event.preventDefault();
        if (rejectDesc) {
            setLoading(true);
            event.target.disabled = true;
            let body = { status, differenceAmount: 0, confirmDescription: rejectDesc }

            ApiCall(`/product-request/verify/${transactionId}`, 'PATCH', locale, body, '', 'admin', router).then(async (result) => {
                event.target.disabled = false;
                setLoading(false);
                getProductsRequests();
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

    return (
        <div className=" flex flex-col gap-y-8">
            <h1 className="text-large-2">درخواست های محصولات</h1>
            <div className="flex items-center justify-between gap-x-4">
                <form autoComplete="off">
                    <FormControl className="w-full md:w-auto">
                        <TextField
                            size="small"
                            type="text"
                            label="جستجو درخواست"
                            InputLabelProps={{
                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                            }}
                            InputProps={{
                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                            }}
                            onChange={(event) => setSearchProductsRequests(event.target.value)}
                            onKeyDown={searchProductsRequestsItemsHandler}
                            onKeyUp={searchProductsRequestsItems} />
                    </FormControl>
                </form>
                <span className="dark:text-white">تعداد کل: {loadingTransactions ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (transactionsTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>

            {loadingTransactions ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div>
                :
                <section className="overflow-x-auto overflow-y-hidden">
                    {products.length > 0 ?
                        <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                            <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                <TableHead className="dark:bg-dark">
                                    <TableRow>
                                        {PRODUCTS_TABLE_HEAD.map((data, index) => (
                                            <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
                                                <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {products.map((data, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{ '&:last-child td': { border: 0 } }}
                                            className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                            <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data.user?._id}`}>
                                                    <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                                        <span>({data.user?.mobileNumber}) {data.user?.firstName} {data.user?.lastName}</span>
                                                    </a>
                                                </LinkRouter>
                                            </TableCell>
                                            <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                {data.product?.name}
                                            </TableCell>
                                            <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
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
                                                            <span>&nbsp;({(data.weight || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم) &nbsp;(اجرت: {(data.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} تومان)</span> : ''}
                                                </span>
                                            </TableCell>
                                            <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                    .locale('fa')
                                                    .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                            </TableCell>
                                            <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                {data.status == 'Accepted' ? <Chip label="تائید شده" variant="outlined" size="small" className="w-full badge badge-success" /> : ''}
                                                {data.status == 'Pending' ? <Chip label="در انتظار تائید" variant="outlined" size="small" className="w-full badge badge-primary" /> : ''}
                                                {data.status == 'Rejected' ? <Chip label="رد شده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}
                                            </TableCell>
                                            <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                {(data.branchTime && Object.keys(data.branchTime).length > 0) || data.purity ? <Button variant="text" size="medium" color="primary" className="rounded-lg" disableElevation
                                                    onClick={handleShowBranchInfo(data)}>
                                                    <text className=" font-semibold">جزئیات بیشتر</text>
                                                </Button > : '------'}
                                            </TableCell>
                                            <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                <div className="flex items-center">
                                                    {data.status == 'Accepted' ?
                                                        <>
                                                            <InvoiceGenerator factorData={data} siteInfo={siteInfo} darkModeToggle={darkModeToggle} />
                                                        </> : '----'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                <div className="flex items-center">
                                                    {data.status == 'Pending' ?
                                                        <>
                                                            <IconButton
                                                                color={`success`}
                                                                onClick={handleShowConfirmRequest(data)}>
                                                                <CheckCircleIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                color={`error`}
                                                                onClick={handleShowReject(data._id, 'product')}>
                                                                <CancelIcon />
                                                            </IconButton>
                                                        </> : '----'}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        : <div className="py-16">
                            <span className="block text-center text-large-1 text-primary-gray">درخواستی یافت نشد</span>
                        </div>}
                </section>}

            {Math.ceil(transactionsTotal / transactionsLimit) > 1 ?
                <div className="text-center mt-4">
                    <Pagination siblingCount={0} count={Math.ceil(transactionsTotal / transactionsLimit)} variant="outlined" color="primary" className="justify-center"
                        page={pageItem} onChange={handlePageChange} />
                </div>
                : ''}

            {/* Reject Transactions */}
            <>
                <Dialog onClose={() => setShowReject(false)} open={showReject} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-4">
                        <FormControl>
                            <TextField
                                type="text"
                                label="توضیحات رد درخواست "
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
                                onClick={rejectRequestStatus(transactionId, 'Rejected')}>
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
                                label="توضیحات رد درخواست "
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
                                onClick={rejectRequestStatus(transactionId, 'Rejected')}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >
                        </div>
                    </div>
                </SwipeableDrawer>
            </>

            {/* Branch Information */}
            <>
                <Dialog onClose={() => setShowBranchInfo(false)} open={showBranchInfo} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-4">
                        <div className="flex flex-col gap-y-4 w-full text-black dark:text-alert-warning-foreground mt-4">
                            {!requestInfo?.product?.price &&
                                !requestInfo?.product?.isQuantitative ? <>
                                <span className="text-black dark:text-white">شماره انگ: {requestInfo?.purity || '------'}</span>
                                <span className="text-black dark:text-white">نام آزمایشگاه: {requestInfo?.labName || '------'}</span>
                                <Divider component="div" className="dark:bg-primary dark:bg-opacity-50" />
                            </> : ''}
                            {requestInfo?.branchTime && Object.keys(requestInfo?.branchTime).length > 0 ?
                                <>
                                    <span>
                                        {requestInfo?.branchTime?.branch?.nameFa} <br /><br /> آدرس: <span className="whitespace-break-spaces">{requestInfo?.branchTime?.branch?.address}</span> <br />
                                        شماره تماس شعبه: <PatternFormat displayType="text" value={requestInfo?.branchTime?.branch?.phone} format="#### ### ## ##" dir="ltr" />
                                    </span>
                                    <span className="whitespace-break-spaces">
                                        زمان مراجعه: {moment(requestInfo?.branchTime?.startTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')} الی {moment(requestInfo?.branchTime?.endTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')}
                                    </span>
                                </> : ''}
                        </div>
                        <div className="flex items-center justify-end gap-x-2">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                onClick={() => setShowBranchInfo(false)}>
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
                    open={openBottomBranchInfoDrawer}
                    onClose={() => setOpenBottomBranchInfoDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <div className="flex flex-col gap-y-4">
                        <div className="flex flex-col gap-y-4 w-full text-black dark:text-alert-warning-foreground mt-4">
                            {!requestInfo?.product?.price &&
                                !requestInfo?.product?.isQuantitative ? <>
                                <span className="text-black dark:text-white">شماره انگ: {requestInfo?.purity || '------'}</span>
                                <span className="text-black dark:text-white">نام آزمایشگاه: {requestInfo?.labName || '------'}</span>
                                <Divider component="div" className="dark:bg-primary dark:bg-opacity-50" />
                            </> : ''}
                            {requestInfo?.branchTime && Object.keys(requestInfo?.branchTime).length > 0 ?
                                <>
                                    <span>
                                        {requestInfo?.branchTime?.branch?.nameFa} <br /><br /> آدرس: <span className="whitespace-break-spaces">{requestInfo?.branchTime?.branch?.address}</span> <br />
                                        شماره تماس شعبه: <PatternFormat displayType="text" value={requestInfo?.branchTime?.branch?.phone} format="#### ### ## ##" dir="ltr" />
                                    </span>
                                    <span className="whitespace-break-spaces">
                                        زمان مراجعه: {moment(requestInfo?.branchTime?.startTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')} الی {moment(requestInfo?.branchTime?.endTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')}
                                    </span>
                                </> : ''}
                        </div>
                        <div className="flex items-center justify-end gap-x-2">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                onClick={() => setOpenBottomBranchInfoDrawer(false)}>
                                <text className="text-black font-semibold">بستن</text>
                            </Button >
                        </div>
                    </div>
                </SwipeableDrawer>
            </>

            {/* ConfirmRequest */}
            <>
                <Dialog onClose={() => setShowConfirmRequest(false)} open={showConfirmRequest} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">تائید درخواست تحویل فیزیکی
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowConfirmRequest(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form
                        key={1}
                        className="grid grid-cols-12 gap-4 mt-6"
                        noValidate
                        autoComplete="off"
                        onSubmit={handleSubmit(() => confirmRequestStatus(confirmRequestData?._id, 'Accepted'))}
                    >
                        {!confirmRequestData?.product?.price && !confirmRequestData?.product?.isQuantitative ? <>
                            <div className="col-span-12 w-full flex items-center">
                                <FormControl className="w-full">
                                    <InputLabel id="demo-simple-select-label"
                                        sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب نوع مابه التفاوت</InputLabel>
                                    <MUISelect
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={isLoss}
                                        onChange={(event) => {
                                            setIsLoss(event.target.value);
                                            if (event.target.value == 'Remove') {
                                                setConfirmData({ ...confirmData, differenceAmount: Number(Math.abs(confirmData?.differenceAmount || 0)) });
                                            } else {
                                                setConfirmData({ ...confirmData, differenceAmount: confirmData?.differenceAmount == 0 ? 0 : -(confirmData?.differenceAmount || 0) });
                                            }
                                        }}
                                        input={<OutlinedInput
                                            id="select-multiple-chip"
                                            label="انتخاب نوع مابه التفاوت"
                                            className="dark:bg-dark *:dark:text-white"
                                            sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                        />}
                                        MenuProps={{ classes: { paper: 'w-full lg:w-[30%] 3xl:w-[24%] dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                        <MenuItem value="Remove">کسر شود</MenuItem>
                                        <MenuItem value="Add">افزوده شود</MenuItem>
                                    </MUISelect>
                                </FormControl>
                            </div>
                            <Controller
                                name="differenceAmount"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full col-span-12">
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            customInput={TextField}
                                            type="tel"
                                            label="مقدار مابه التفاوت (به گرم)"
                                            variant="outlined"
                                            error={!!errors.differenceAmount}
                                            helperText={errors.differenceAmount ? errors.differenceAmount.message : ''}
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
                                            value={differenceAmount}
                                            onValueChange={(event) => {
                                                setdifferenceAmount(event.value);
                                                if (isLoss == 'Remove') {
                                                    setConfirmData({ ...confirmData, differenceAmount: Number(Math.abs(event.value || 0)) });
                                                } else {
                                                    setConfirmData({ ...confirmData, differenceAmount: event.value == 0 ? 0 : -(event.value || 0) });
                                                }
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                            <FormControl className="w-full col-span-12 md:col-span-6">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="شماره انگ"
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
                                    onValueChange={(event) => {
                                        setConfirmData({ ...confirmData, purity: event.value !== '' ? Number(event.value) : '' });
                                    }}
                                />
                            </FormControl>
                            <FormControl className="w-full col-span-12 md:col-span-6">
                                <TextField
                                    type="text"
                                    label="نام آزمایشگاه"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputMode: 'decimal'
                                    }}
                                    onChange={(event) => {
                                        setConfirmData({ ...confirmData, labName: event.target.value });
                                    }}
                                />
                            </FormControl>
                        </> : <Typography component={'h2'} className="col-span-12 flex items-center justify-between gap-x-2">آیا از تائید درخواست اطمینان دارید؟</Typography>}
                        {/* <FormControl className="w-full col-span-12">
                            <TextField
                                type="text"
                                label="توضیحات جهت ثبت در فاکتور "
                                multiline
                                rows={4}
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                onChange={(event) => setConfirmData({ ...confirmData, confirmDescription: event.target.value })} />
                        </FormControl> */}
                        <div className="col-span-12">
                            <div className="flex items-center justify-end gap-x-2">
                                <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg" onClick={() => setShowConfirmRequest(false)}>
                                    <span className="mx-2">انصراف</span>
                                </Button>
                                <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                    <text className="text-black font-semibold">ثبت</text>
                                </LoadingButton>
                            </div>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomConfirmRequestDrawer}
                    onClose={() => setOpenBottomConfirmRequestDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ایجاد فاکتور جدید
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomConfirmRequestDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form
                        key={1}
                        className="grid grid-cols-12 gap-4 mt-6"
                        noValidate
                        autoComplete="off"
                        onSubmit={handleSubmit(() => confirmRequestStatus(confirmRequestData?._id, 'Accepted'))}
                    >
                        <div className="col-span-12 w-full flex items-center">
                            <FormControl className="w-full">
                                <InputLabel id="demo-simple-select-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب نوع مابه التفاوت</InputLabel>
                                <MUISelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={isLoss}
                                    onChange={(event) => {
                                        setIsLoss(event.target.value);
                                        if (event.target.value == 'Remove') {
                                            setConfirmData({ ...confirmData, differenceAmount: Number(Math.abs(confirmData?.differenceAmount || 0)) });
                                        } else {
                                            setConfirmData({ ...confirmData, differenceAmount: confirmData?.differenceAmount == 0 ? 0 : -(confirmData?.differenceAmount || 0) });
                                        }
                                    }}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب نوع مابه التفاوت"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                    />}
                                    MenuProps={{ classes: { paper: 'w-full lg:w-[30%] 3xl:w-[24%] dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                    <MenuItem value="Remove">کسر شود</MenuItem>
                                    <MenuItem value="Add">افزوده شود</MenuItem>
                                </MUISelect>
                            </FormControl>
                        </div>
                        <Controller
                            name="differenceAmount"
                            control={control}
                            render={({ field }) => (
                                <FormControl className="w-full col-span-12">
                                    <NumericFormat
                                        {...field}
                                        thousandSeparator
                                        decimalScale={3}
                                        customInput={TextField}
                                        type="tel"
                                        label="مقدار مابه التفاوت (به گرم)"
                                        variant="outlined"
                                        error={!!errors.differenceAmount}
                                        helperText={errors.differenceAmount ? errors.differenceAmount.message : ''}
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
                                        value={differenceAmount}
                                        onValueChange={(event) => {
                                            setdifferenceAmount(event.value);
                                            if (isLoss == 'Remove') {
                                                setConfirmData({ ...confirmData, differenceAmount: Number(Math.abs(event.value || 0)) });
                                            } else {
                                                setConfirmData({ ...confirmData, differenceAmount: event.value == 0 ? 0 : -(event.value || 0) });
                                            }
                                        }}
                                    />
                                </FormControl>
                            )}
                        />
                        {!confirmRequestData?.product?.price && !confirmRequestData?.product?.isQuantitative ? <>
                            <FormControl className="w-full col-span-12">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="شماره انگ"
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
                                    onValueChange={(event) => {
                                        setConfirmData({ ...confirmData, purity: event.value !== '' ? Number(event.value) : '' });
                                    }}
                                />
                            </FormControl>
                            <FormControl className="w-full col-span-12">
                                <TextField
                                    type="text"
                                    label="نام آزمایشگاه"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    onChange={(event) => {
                                        setConfirmData({ ...confirmData, labName: event.target.value });
                                    }}
                                />
                            </FormControl>
                        </> : ''}
                        {/* <FormControl className="w-full col-span-12">
                            <TextField
                                type="text"
                                label="توضیحات جهت ثبت در فاکتور "
                                multiline
                                rows={4}
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                onChange={(event) => setConfirmData({ ...confirmData, confirmDescription: event.target.value })} />
                        </FormControl> */}
                        <div className="col-span-12">
                            <div className="flex items-center justify-end gap-x-2">
                                <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                    <text className="text-black font-semibold">ثبت</text>
                                </LoadingButton>
                            </div>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>


        </div>
    )
}

export default ProductsTransationsPageCompo;