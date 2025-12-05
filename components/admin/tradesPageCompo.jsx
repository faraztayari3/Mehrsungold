import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
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
import moment from 'jalali-moment'

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call"
import CopyData from "../../services/copy"

/**
 * TradesPageCompo component that displays the Trades Page Component of the website.
 * @returns The rendered Trades Page component.
 */
const TradesPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);
    const [rejectDesc, setRejectDesc] = useState('');
    const [transactionId, setTransactionId] = useState('');

    const TRANSACTIONS_TABLE_HEAD = [
        {
            label: 'کاربر',
            classes: ""
        },
        {
            label: 'واحد معامله',
            classes: ""
        },
        {
            label: 'نوع معامله',
            classes: ""
        },
        {
            label: 'مقدار',
            classes: ""
        },
        {
            label: 'مبلغ معامله',
            classes: ""
        },
        {
            label: 'قیمت معامله',
            classes: ""
        },
        {
            label: 'کارمزد',
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
    useEffect(() => {
        getTransactions();
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
    const getTransactions = (search) => {
        setLoadingTransactions(true);
        ApiCall('/transaction', 'GET', locale, {}, `${search ? `search=${search}&` : ''}sortOrder=0&sortBy=createdAt&limit=${transactionsLimit}&skip=${(pageItem * transactionsLimit) - transactionsLimit}`, 'admin', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setTransactions(result.data);
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }

    const handlePageChange = (event, value) => {
        setPageItem(value);
        getTransactions();
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
                getTransactions('');
            } else {
                setSearchTransactions(event.target.value);
                setPageItem(1);
                getTransactions(event.target.value);
            }
        }, doneTypingIntervalTransactions);

    }
    const searchTransactionsItemsHandler = () => {
        clearTimeout(typingTimerTransactions)
    }

    const [showReject, setShowReject] = useState(false);
    const [openBottomRejectDrawer, setOpenBottomRejectDrawer] = useState(false);
    const handleShowReject = (transactionId, type) => () => {
        setTransactionId(transactionId);
        if (window.innerWidth >= 1024) {
            setShowReject(true);
            setOpenBottomRejectDrawer(false);
        } else {
            setShowReject(false);
            setOpenBottomRejectDrawer(true);
        }
    }

    /**
     * Rejcet or Accept Transaction.
     * @returns None
    */
    const changeTransactionStatus = (transactionId, status) => (event) => {
        event.preventDefault();
        if (rejectDesc || status == 'Accepted') {
            setLoading(true);
            event.target.disabled = true;
            ApiCall(`/transaction/${transactionId}/verify`, 'PATCH', locale, { status, confirmDescription: status == 'Rejected' ? rejectDesc : "string" }, '', 'admin', router).then(async (result) => {
                event.target.disabled = false;
                setLoading(false);
                getTransactions();
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

    const exportTrades = async (event) => {
        event && event.preventDefault && event.preventDefault();
        setExporting(true);
        try {
            const limit = 50;
            let skip = 0;
            let all = [];
            // fetch first page
            const first = await ApiCall('/transaction', 'GET', locale, {}, `sortOrder=0&sortBy=createdAt&limit=${limit}&skip=${skip}`, 'admin', router);
            const total = first.count || 0;
            all = first.data || [];
            skip += limit;
            while (all.length < total) {
                const res = await ApiCall('/transaction', 'GET', locale, {}, `sortOrder=0&sortBy=createdAt&limit=${limit}&skip=${skip}`, 'admin', router);
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
                user: it.user?.mobileNumber || '',
                tradeable: it.tradeable?.name || '',
                type: it.type || '',
                amount: it.amount || 0,
                total: it.total || 0,
                price: it.price || 0,
                fee: it.fee || 0,
                createdAt: it.createdAt || '',
                status: it.status || ''
            }));

            const XLSX = await import('xlsx');
            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'trades');
            const fileName = `trades_last_${days}_days_${(new Date()).toISOString().slice(0,10)}.xlsx`;
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
            <h1 className="text-large-2">معاملات</h1>
            <div className="flex items-center justify-between gap-x-4">
                <form autoComplete="off">
                    <FormControl className="w-full md:w-auto">
                        <TextField
                            size="small"
                            type="text"
                            label="جستجو معامله"
                            InputLabelProps={{
                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                        }}
                        InputProps={{
                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                        }}
                        onChange={(event) => setSearchTransactions(event.target.value)}
                        onKeyDown={searchTransactionsItemsHandler}
                        onKeyUp={searchTransactionsItems} />
                </FormControl>
            </form>
            <div className="flex items-center gap-x-4">
                <Button variant="outlined" size="small" onClick={() => setOpenExportDialog(true)}>خروجی اکسل</Button>
                <span className="dark:text-white">تعداد کل: {loadingTransactions ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (transactionsTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>
        </div>            {loadingTransactions ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div>
                :
                <section className="overflow-x-auto overflow-y-hidden">
                    {transactions.length > 0 ?
                        <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                            <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                <TableHead className="dark:bg-dark">
                                    <TableRow>
                                        {TRANSACTIONS_TABLE_HEAD.map((data, index) => (
                                            <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
                                                <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                            </TableCell>
                                        ))}
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
                                                {data.tradeable ? <div className="flex items-center gap-x-4">
                                                    <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} alt={data.tradeable?.name}
                                                        className="w-10 h-10 rounded-[50%]" />
                                                    <span>{data.tradeable?.nameFa}</span>
                                                </div> : ''}
                                            </TableCell>
                                            <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                {data.type == 'PayLaterBuy' ? <Chip label="خرید قرضی" variant="outlined" size="small" className="w-full badge badge-success" /> :
                                                    data.type == 'Buy' ? <Chip label={data.isFixedPrice ? 'خرید با قیمت ثابت' : 'خرید'} variant="outlined" size="small" className="w-full badge badge-success" /> :
                                                        <Chip label={data.isFixedPrice ? 'فروش با قیمت ثابت' : 'فروش'} variant="outlined" size="small" className="w-full badge badge-error" />}
                                            </TableCell>
                                            <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم
                                            </TableCell>
                                            <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                {(data.total || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان
                                            </TableCell>
                                            <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                <div className="flex flex-col gap-y-1.5">
                                                    <span>
                                                        {data.tradeablePrice ? `${(data.tradeablePrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` : '------'}
                                                    </span>
                                                    {data.wallgoldPrice ?
                                                        <>
                                                            <span>در وال گلد: {data.wallgoldPrice ? `${(data.wallgoldPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` : '------'}</span>
                                                            {data.wallgoldOrderId ? <div className="flex items-center gap-x-1.5">
                                                                <span>شناسه: {data?.wallgoldOrderId}</span>
                                                                <IconButton className="p-0.5" onClick={CopyData(data?.wallgoldOrderId)}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                                        <path d="M9.24984 18.9582H5.74984C2.4915 18.9582 1.0415 17.5082 1.0415 14.2498V10.7498C1.0415 7.4915 2.4915 6.0415 5.74984 6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V14.2498C13.9582 17.5082 12.5082 18.9582 9.24984 18.9582ZM5.74984 7.2915C3.1665 7.2915 2.2915 8.1665 2.2915 10.7498V14.2498C2.2915 16.8332 3.1665 17.7082 5.74984 17.7082H9.24984C11.8332 17.7082 12.7082 16.8332 12.7082 14.2498V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H5.74984Z" fill="#F1C40F" />
                                                                        <path d="M14.2498 13.9582H13.3332C12.9915 13.9582 12.7082 13.6748 12.7082 13.3332V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H6.6665C6.32484 7.2915 6.0415 7.00817 6.0415 6.6665V5.74984C6.0415 2.4915 7.4915 1.0415 10.7498 1.0415H14.2498C17.5082 1.0415 18.9582 2.4915 18.9582 5.74984V9.24984C18.9582 12.5082 17.5082 13.9582 14.2498 13.9582ZM13.9582 12.7082H14.2498C16.8332 12.7082 17.7082 11.8332 17.7082 9.24984V5.74984C17.7082 3.1665 16.8332 2.2915 14.2498 2.2915H10.7498C8.1665 2.2915 7.2915 3.1665 7.2915 5.74984V6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V12.7082Z" fill="#F1C40F" />
                                                                    </svg>
                                                                </IconButton>
                                                            </div> : ''}
                                                        </> : ''}
                                                </div>
                                            </TableCell>
                                            <TableCell className=" border-none px-8 py-4 text-sm dark:text-white" dir="ltr">
                                                {(data.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 5 })}
                                            </TableCell>
                                            <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                    .locale('fa')
                                                    .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                            </TableCell>
                                            <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                {data.status == 'Accepted' ? data.paid ? <Chip label="پرداخت شده" variant="outlined" size="small" className="w-full badge badge-success" /> :
                                                    <Chip label="تائید شده" variant="outlined" size="small" className="w-full badge badge-success" /> : ''}
                                                {data.status == 'Pending' ? data.type == 'PayLaterBuy' && !data.paid ? <Chip label="در انتظار پرداخت" variant="outlined" size="small" className="w-full badge badge-primary" /> :
                                                    <Chip label="در انتظار تائید" variant="outlined" size="small" className="w-full badge badge-primary" /> : ''}
                                                {data.status == 'Rejected' ? <Chip label="رد شده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}

                                                {data.status == 'PendingFixedPrice' ? <Chip label="سفارش باز" variant="outlined" size="small" className="w-full badge badge-primary" /> : ''}
                                                {data.status == 'Cancelled' ? <Chip label="لغو شده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}
                                            </TableCell>
                                            <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                {data.status == 'Pending' || (data.status == 'PendingFixedPrice' && siteInfo?.manualTransactionConfirmation) ?
                                                    <>
                                                        <IconButton
                                                            color={`success`}
                                                            onClick={changeTransactionStatus(data._id, 'Accepted')}>
                                                            <CheckCircleIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            color={`error`}
                                                            onClick={handleShowReject(data._id, 'trade')}>
                                                            <CancelIcon />
                                                        </IconButton>
                                                    </> : '----'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        : <div className="py-16">
                            <span className="block text-center text-large-1 text-primary-gray">معامله ای یافت نشد</span>
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
                                label="توضیحات رد معامله"
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
                                onClick={changeTransactionStatus(transactionId, 'Rejected')}>
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
                                label="توضیحات رد معامله"
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
                                onClick={changeTransactionStatus(transactionId, 'Rejected')}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >
                        </div>
                    </div>
                </SwipeableDrawer>

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
                                onClick={exportTrades}>
                                <text className="text-black font-semibold">خروجی اکسل</text>
                            </LoadingButton >
                        </div>
                    </div>
                </Dialog>
            </>
        </div>
    )
}

export default TradesPageCompo;