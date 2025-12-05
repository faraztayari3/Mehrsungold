import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import CancelIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline'
import Chip from '@mui/material/Chip';
import LoadingButton from '@mui/lab/LoadingButton'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import CircularProgress from '@mui/material/CircularProgress'
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
import moment from 'jalali-moment'

import { PatternFormat } from 'react-number-format';

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call"
import CheckCardNumber from "../../services/checkCardNumber"

/**
 * FiatTransationsPageCompo component that displays the FiatTransations Page Component of the website.
 * @returns The rendered FiatTransations Page component.
 */
const FiatTransationsPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const ONLINE_DEPOSITS_TABLE_HEAD = [
        {
            label: 'کاربر',
            classes: ""
        },
        {
            label: 'مقدار',
            classes: ""
        },
        {
            label: 'کارت مبدا',
            classes: ""
        },
        {
            label: 'تاریخ ثبت',
            classes: ""
        },
        {
            label: 'وضعیت',
            classes: ""
        },
        // {
        //     label: '',
        //     classes: ""
        // }
    ]
    const OFFLINE_DEPOSITS_TABLE_HEAD = [
        {
            label: 'کاربر',
            classes: ""
        },
        {
            label: 'مقدار',
            classes: ""
        },
        {
            label: 'کارت مبدا',
            classes: ""
        },
        {
            label: 'کد رهگیری',
            classes: ""
        },
        {
            label: 'تصویر رسید',
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
    const ID_DEPOSITS_TABLE_HEAD = [
        {
            label: 'کاربر',
            classes: ""
        },
        {
            label: 'مقدار',
            classes: ""
        },
        {
            label: 'کد رهگیری',
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
    const WITHDRAWS_TABLE_HEAD = [
        {
            label: 'کاربر',
            classes: ""
        },
        {
            label: 'مقدار',
            classes: ""
        },
        {
            label: tabValue == 0 ? 'کارت مبدا' : 'کارت مقصد',
            classes: ""
        },
        {
            label: 'کد پیگیری',
            classes: ""
        },
        {
            label: 'تاریخ ثبت',
            classes: ""
        },
        {
            label: 'وضعیت',
            classes: ""
        },
        {
            label: '',
            classes: ""
        }
    ]

    const [pageItem, setPageItem] = useState(1);
    const [firstLoading, setFirstLoading] = useState(true);
    useEffect(() => {
        getTransactions('OnlineDeposit');
    }, []);

    /**
        * Retrieves Transactions.
        * @returns None
       */
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [transactionsLimit, settransactionsLimit] = useState(10);
    const [transactionsTotal, setTransactionsTotal] = useState(0);
    const [openExportDialog, setOpenExportDialog] = useState(false);
    const [exportDays, setExportDays] = useState(7);
    const [exporting, setExporting] = useState(false);
    const getTransactions = (type, search) => {
        setLoadingTransactions(true);
        ApiCall('/balance-transaction', 'GET', locale, {}, `${search ? `search=${search}&` : ''}sortOrder=0&sortBy=createdAt&type=${type}&limit=${transactionsLimit}&skip=${(pageItem * transactionsLimit) - transactionsLimit}`, 'admin', router).then(async (result) => {
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

    const handleChange = (event, newTabValue) => {
        setTabValue(newTabValue);
        setSearchTransactions('');
        if (newTabValue == 0) {
            getTransactions('OnlineDeposit');
        } else if (newTabValue == 1) {
            getTransactions('OfflineDeposit');
        } else if (newTabValue == 2) {
            getTransactions('IdDeposit');
        } else {
            getTransactions('Withdraw');
        }
    }

    const handlePageChange = (event, value) => {
        setPageItem(value);
        if (tabValue == 0) {
            getTransactions('OnlineDeposit');
        } else if (tabValue == 1) {
            getTransactions('OfflineDeposit');
        } else if (tabValue == 2) {
            getTransactions('IdDeposit');
        } else {
            getTransactions('Withdraw');
        }
    }

    /**
     * Search for a Transactions based on the input value and filter the displayed Transactions accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchTransactions, setSearchTransactions] = useState('');
    var typingTimerTransactions;
    const doneTypingIntervalTransactions = 300;
    const searchTransactionsItems = (event) => {
        clearTimeout(typingTimerTransactions);

        typingTimerTransactions = setTimeout(() => {
            if (event.target.value == '') {
                setSearchTransactions('');
                setPageItem(1);
                getTransactions(tabValue == 0 ? 'OnlineDeposit' : tabValue == 1 ? 'OfflineDeposit' : tabValue == 2 ? 'IdDeposit' : 'Withdraw', '');
            } else {
                setSearchTransactions(event.target.value);
                setPageItem(1);
                getTransactions(tabValue == 0 ? 'OnlineDeposit' : tabValue == 1 ? 'OfflineDeposit' : tabValue == 2 ? 'IdDeposit' : 'Withdraw', event.target.value);
            }
        }, doneTypingIntervalTransactions);

    }
    const searchTransactionsItemsHandler = () => {
        clearTimeout(typingTimerTransactions)
    }

    const [showChangeStatus, setShowChangeStatus] = useState(false);
    const [openBottomChangeStatusDrawer, setOpenBottomChangeStatusDrawer] = useState(false);
    const [statusType, setStatusType] = useState('Accepted');
    const handleShowChangeStatus = (transactionId, type) => () => {
        setTransactionId(transactionId);
        setStatusType(type);
        if (window.innerWidth >= 1024) {
            setShowChangeStatus(true);
            setOpenBottomChangeStatusDrawer(false);
        } else {
            setShowChangeStatus(false);
            setOpenBottomChangeStatusDrawer(true);
        }
    }

    /**
     * Rejcet or Accept Transaction.
     * @returns None
    */
    const [rejectDesc, setRejectDesc] = useState('');
    const [trackingCode, setTrackingCode] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const changeTransactionStatus = (transactionId, status) => (event) => {
        event.preventDefault();
        if (rejectDesc || status == 'Accepted') {
            setLoading(true);
            event.target.disabled = true;
            if (tabValue == 1) {
                let body = status == 'Accepted' ? { id: transactionId, status } : { id: transactionId, status, confirmDescription: rejectDesc }
                ApiCall(`/balance-transaction/confirm-offline-deposit`, 'PATCH', locale, body, '', 'admin', router).then(async (result) => {
                    event.target.disabled = false;
                    setLoading(false);
                    if (tabValue == 0) {
                        getTransactions('OnlineDeposit');
                    } else if (tabValue == 1) {
                        getTransactions('OfflineDeposit');
                    } else {
                        getTransactions('Withdraw');
                    }
                    setShowChangeStatus(false);
                    setOpenBottomChangeStatusDrawer(false);
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
            } else if (tabValue == 3) {
                let body = status == 'Accepted' ? { id: transactionId, status, trackingCode } : { id: transactionId, status, confirmDescription: rejectDesc }
                ApiCall(`/balance-transaction/confirm-withdraw`, 'PATCH', locale, body, '', 'admin', router).then(async (result) => {
                    event.target.disabled = false;
                    setLoading(false);
                    if (tabValue == 0) {
                        getTransactions('OnlineDeposit');
                    } else {
                        getTransactions('Withdraw');
                    }
                    setShowChangeStatus(false);
                    setOpenBottomChangeStatusDrawer(false);
                    setRejectDesc('');
                    setTrackingCode('');
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
    }

    const exportOfflineDeposits = async (event) => {
        event && event.preventDefault && event.preventDefault();
        setExporting(true);
        try {
            const limit = 50;
            let skip = 0;
            let all = [];
            // fetch first page
            const first = await ApiCall('/balance-transaction', 'GET', locale, {}, `sortOrder=0&sortBy=createdAt&type=OfflineDeposit&limit=${limit}&skip=${skip}`, 'admin', router);
            const total = first.count || 0;
            all = first.data || [];
            skip += limit;
            while (all.length < total) {
                const res = await ApiCall('/balance-transaction', 'GET', locale, {}, `sortOrder=0&sortBy=createdAt&type=OfflineDeposit&limit=${limit}&skip=${skip}`, 'admin', router);
                all = all.concat(res.data || []);
                skip += limit;
            }

            const days = parseInt(exportDays) || 0;
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - days);

            const filtered = all.filter(item => new Date(item.createdAt) >= fromDate);

            if (!filtered.length) {
                dispatch({ type: 'setSnackbarProps', value: { open: true, content: 'موردی برای خروجی یافت نشد', type: 'info', duration: 3000, refresh: Math.floor(Math.random() * 100) } });
                setExporting(false);
                setOpenExportDialog(false);
                return;
            }

            const rows = filtered.map(it => ({
                mobile: it.user?.mobileNumber || '',
                firstName: it.user?.firstName || '',
                lastName: it.user?.lastName || '',
                amount: it.amount || 0,
                trackingCode: it.trackingCode || it._id || '',
                cardNumber: it.card?.number || '',
                createdAt: it.createdAt || '',
                status: it.status || ''
            }));

            const XLSX = await import('xlsx');
            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'deposits');
            const fileName = `fiat_deposits_last_${days}_days_${(new Date()).toISOString().slice(0,10)}.xlsx`;
            XLSX.writeFile(wb, fileName);

            dispatch({ type: 'setSnackbarProps', value: { open: true, content: 'خروجی اکسل با موفقیت ایجاد شد', type: 'success', duration: 3000, refresh: Math.floor(Math.random() * 100) } });

        } catch (error) {
            console.log(error);
            dispatch({ type: 'setSnackbarProps', value: { open: true, content: 'خطا در ایجاد خروجی', type: 'error', duration: 3000, refresh: Math.floor(Math.random() * 100) } });
        } finally {
            setExporting(false);
            setOpenExportDialog(false);
        }
    }

    const exportWithdrawals = async (event) => {
        event && event.preventDefault && event.preventDefault();
        setExporting(true);
        try {
            const limit = 50;
            let skip = 0;
            let all = [];
            // fetch first page
            const first = await ApiCall('/balance-transaction', 'GET', locale, {}, `sortOrder=0&sortBy=createdAt&type=Withdraw&limit=${limit}&skip=${skip}`, 'admin', router);
            const total = first.count || 0;
            all = first.data || [];
            skip += limit;
            while (all.length < total) {
                const res = await ApiCall('/balance-transaction', 'GET', locale, {}, `sortOrder=0&sortBy=createdAt&type=Withdraw&limit=${limit}&skip=${skip}`, 'admin', router);
                all = all.concat(res.data || []);
                skip += limit;
            }

            const days = parseInt(exportDays) || 0;
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - days);

            const filtered = all.filter(item => new Date(item.createdAt) >= fromDate);

            if (!filtered.length) {
                dispatch({ type: 'setSnackbarProps', value: { open: true, content: 'موردی برای خروجی یافت نشد', type: 'info', duration: 3000, refresh: Math.floor(Math.random() * 100) } });
                setExporting(false);
                setOpenExportDialog(false);
                return;
            }

            const rows = filtered.map(it => ({
                mobile: it.user?.mobileNumber || '',
                firstName: it.user?.firstName || '',
                lastName: it.user?.lastName || '',
                amount: it.amount || 0,
                trackingCode: it.trackingCode || it._id || '',
                cardNumber: it.card?.number || '',
                createdAt: it.createdAt || '',
                status: it.status || ''
            }));

            const XLSX = await import('xlsx');
            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'withdrawals');
            const fileName = `fiat_withdrawals_last_${days}_days_${(new Date()).toISOString().slice(0,10)}.xlsx`;
            XLSX.writeFile(wb, fileName);

            dispatch({ type: 'setSnackbarProps', value: { open: true, content: 'خروجی اکسل با موفقیت ایجاد شد', type: 'success', duration: 3000, refresh: Math.floor(Math.random() * 100) } });

        } catch (error) {
            console.log(error);
            dispatch({ type: 'setSnackbarProps', value: { open: true, content: 'خطا در ایجاد خروجی', type: 'error', duration: 3000, refresh: Math.floor(Math.random() * 100) } });
        } finally {
            setExporting(false);
            setOpenExportDialog(false);
        }
    }

    return (
        <div className=" flex flex-col gap-y-8">
            {firstLoading ? '' : <>
                <h1 className="text-large-2">تراکنش های تومان</h1>
                <Tabs variant="fullWidth" indicatorColor="primary" textColor="inherit" value={tabValue} className="w-full lg:w-fit"
                    onChange={handleChange}
                >
                    <Tab label="واریز" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} />
                    <Tab label="واریز دستی" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} />
                    <Tab label="واریز شناسه دار" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} />
                    <Tab label="برداشت" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} />
                </Tabs>
                <div className="flex items-center justify-between gap-x-4">
                    <form autoComplete="off">
                        <FormControl className="w-full md:w-auto">
                            <TextField
                                size="small"
                                type="text"
                                label="جستجو تراکنش"
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                            }}
                            value={searchTransactions}
                            onChange={(event) => setSearchTransactions(event.target.value)}
                            onKeyDown={searchTransactionsItemsHandler}
                            onKeyUp={searchTransactionsItems} />
                    </FormControl>
                </form>
                <div className="flex items-center gap-x-4">
                    {tabValue == 1 ? <Button variant="outlined" size="small" onClick={() => setOpenExportDialog(true)}>خروجی اکسل</Button> : ''}
                    {tabValue == 3 ? <Button variant="outlined" size="small" onClick={() => setOpenExportDialog(true)}>خروجی اکسل</Button> : ''}
                    <span className="dark:text-white">تعداد کل: {loadingTransactions ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (transactionsTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>                </div>
            </>}
            {loadingTransactions ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div>
                :
                <section className="overflow-x-auto overflow-y-hidden">
                    {transactions.length > 0 ?
                        <>
                            <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                                <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                    <TableHead className="dark:bg-dark">
                                        <TableRow>
                                            {tabValue == 0 ? ONLINE_DEPOSITS_TABLE_HEAD.map((data, index) => (
                                                <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-center pb-4`} key={index}>
                                                    <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                </TableCell>
                                            )) : ''}
                                            {tabValue == 1 ? OFFLINE_DEPOSITS_TABLE_HEAD.map((data, index) => (
                                                <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-center pb-4`} key={index}>
                                                    <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                </TableCell>
                                            )) : ''}
                                            {tabValue == 2 ? ID_DEPOSITS_TABLE_HEAD.map((data, index) => (
                                                <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-center pb-4`} key={index}>
                                                    <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                </TableCell>
                                            )) : ''}
                                            {tabValue == 3 ? WITHDRAWS_TABLE_HEAD.map((data, index) => (
                                                <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
                                                    <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                </TableCell>
                                            )) : ''}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transactions.map((data, index) => (
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
                                                    {(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} تومان
                                                </TableCell>
                                                {tabValue == 2 ? '' : <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                    {data.card ? <div className="flex items-center gap-x-2">
                                                        <div className="flex items-center justify-center bg-white w-9 h-9 rounded-[50%]">
                                                            <img src={CheckCardNumber(data.card?.number || '').image} alt={CheckCardNumber(data.card?.number || '').name} width="48" height="48" decoding="async" data-nimg="1" loading="lazy" className="w-7 h-7 object-contain" />
                                                        </div>
                                                        <PatternFormat displayType='text' value={data.card?.number} format="####-####-####-####" dir="ltr" />
                                                    </div> : '------'}
                                                </TableCell>}
                                                {tabValue == 1 ? <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                    {data.accountNumber || data.trackingCode}
                                                </TableCell> : ''}
                                                {tabValue == 1 ? <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                    {data.image ? <LinkRouter legacyBehavior href={`${process.env.NEXT_PUBLIC_BASEURL}${data.image}`}>
                                                        <a target="_blank">
                                                            <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.image}`} alt={'recievePic'}
                                                                className="w-8 h-8 rounded-[50%]" />
                                                        </a>
                                                    </LinkRouter> : '------'}
                                                </TableCell> : ''}
                                                {[2, 3].includes(tabValue) ? <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                    {data.status == 'Accepted' ? (data.trackingCode || data.transId) : '----'}
                                                </TableCell> : ''}
                                                <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                    <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                        .locale('fa')
                                                        .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                </TableCell>
                                                <TableCell className={`${tabValue == 0 ? 'text-end rtl:rounded-l-2xl ltr:rounded-r-2xl' : ''} border-none px-8 py-4 text-sm dark:text-white`}>
                                                    {data.status == 'Accepted' ? <Chip label="تائید شده" variant="outlined" size="small" className="w-full badge badge-success" /> : ''}
                                                    {data.status == 'Pending' ? <Chip label="در انتظار تائید" variant="outlined" size="small" className="w-full badge badge-primary" /> : ''}
                                                    {data.status == 'Rejected' ? <Chip label="رد شده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}
                                                </TableCell>
                                                {[0, 2].includes(tabValue) ? '' : <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                    {data.status == 'Pending' ?
                                                        <>
                                                            <IconButton
                                                                color={`success`}
                                                                onClick={tabValue == 1 ? changeTransactionStatus(data._id, 'Accepted') : handleShowChangeStatus(data._id, 'Accepted')}>
                                                                <CheckCircleIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                color={`error`}
                                                                onClick={handleShowChangeStatus(data._id)}>
                                                                <CancelIcon />
                                                            </IconButton>
                                                        </> : '----'}
                                                </TableCell>}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                        : <div className="py-16">
                            <span className="block text-center text-large-1 text-primary-gray">تراکنشی یافت نشد</span>
                        </div>}
                </section>
            }

            {Math.ceil(transactionsTotal / transactionsLimit) > 1 ?
                <div className="text-center mt-4">
                    <Pagination siblingCount={0} count={Math.ceil(transactionsTotal / transactionsLimit)} variant="outlined" color="primary" className="justify-center"
                        page={pageItem} onChange={handlePageChange} />
                </div>
                : ''}

            {/* Export to Excel Dialog */}
            <Dialog onClose={() => setOpenExportDialog(false)} open={openExportDialog} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                <div className="flex flex-col gap-y-4 p-4">
                    <FormControl>
                        <TextField
                            type="number"
                            label="تعداد روز (مثال: 5)"
                            InputLabelProps={{ sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' } }}
                            InputProps={{ classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' }, sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' } }}
                            value={exportDays}
                            onChange={(e) => setExportDays(e.target.value)} />
                    </FormControl>
                    <div className="flex items-center justify-end gap-x-2">
                        <Button variant="text" onClick={() => setOpenExportDialog(false)}>انصراف</Button>
                        <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={exporting}
                            onClick={tabValue == 3 ? exportWithdrawals : exportOfflineDeposits}>
                            <text className="text-black font-semibold">خروجی اکسل</text>
                        </LoadingButton >
                    </div>
                </div>
            </Dialog>

            {/* Change Status Transactions */}
            <>
                <Dialog onClose={() => setShowChangeStatus(false)} open={showChangeStatus} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-4">
                        {statusType == 'Accepted' ? <FormControl>
                            <TextField
                                type="text"
                                label="کد پیگیری"
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
                                onChange={(event) => setTrackingCode(event.target.value)} />
                        </FormControl> : <FormControl>
                            <TextField
                                type="text"
                                label="توضیحات رد تراکنش"
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
                        </FormControl>}
                        <div className="flex items-center justify-end gap-x-2">
                            <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={changeTransactionStatus(transactionId, statusType == 'Accepted' ? 'Accepted' : 'Rejected')}>
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
                    open={openBottomChangeStatusDrawer}
                    onClose={() => setOpenBottomChangeStatusDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <div className="flex flex-col gap-y-4">
                        {statusType == 'Accepted' ? <FormControl>
                            <TextField
                                type="text"
                                label="کد پیگیری"
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
                                onChange={(event) => setTrackingCode(event.target.value)} />
                        </FormControl> : <FormControl>
                            <TextField
                                type="text"
                                label="توضیحات رد تراکنش"
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
                        </FormControl>}
                        <div className="flex">
                            <LoadingButton type="button" variant="contained" size="medium" fullWidth className="rounded-lg" disableElevation loading={loading}
                                onClick={changeTransactionStatus(transactionId, statusType == 'Accepted' ? 'Accepted' : 'Rejected')}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >
                        </div>
                    </div>
                </SwipeableDrawer>
            </>
        </div>
    )
}

export default FiatTransationsPageCompo;