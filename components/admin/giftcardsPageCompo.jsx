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

import { PatternFormat } from 'react-number-format';
import { useQRCode } from 'next-qrcode'

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call"
import CopyData from "../../services/copy"

/**
 * GiftcardsPageCompo component that displays the Giftcards Page Component of the website.
 * @returns The rendered Giftcards Page component.
 */
const GiftcardsPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle } = state;

    const { Image } = useQRCode();

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);
    const [rejectDesc, setRejectDesc] = useState('');
    const [transactionId, setTransactionId] = useState('');

    const GIFTCARDS_TABLE_HEAD = [
        {
            label: 'سازنده',
            classes: ""
        },
        {
            label: 'استفاده کننده',
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
            label: 'جزئیات',
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
        getGiftcards();
    }, []);

    /**
        * Retrieves Giftcards.
        * @returns None
       */
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [transactionsLimit, settransactionsLimit] = useState(10);
    const [transactionsTotal, setTransactionsTotal] = useState(0);
    const getGiftcards = (search) => {
        setLoadingTransactions(true);
        ApiCall('/gift-card', 'GET', locale, {}, `${search ? `search=${search}&` : ''}roles=User&roles=VIPUser&sortOrder=0&sortBy=createdAt&limit=${transactionsLimit}&skip=${(pageItem * transactionsLimit) - transactionsLimit}`, 'admin', router).then(async (result) => {
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
        getGiftcards();
    }

    /**
     * Search for a Giftcards based on the input value and filter the displayed Giftcards accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchGiftcards, setSearchGiftcards] = useState('');
    var typingTimerGiftcards;
    const doneTypingIntervalGiftcards = 300;
    const searchGiftcardsItems = (event) => {
        clearTimeout(typingTimerGiftcards);

        typingTimerGiftcards = setTimeout(() => {
            if (event.target.value == '') {
                setSearchGiftcards('');
                setPageItem(1);
                getGiftcards('');
            } else {
                setSearchGiftcards(event.target.value);
                setPageItem(1);
                getGiftcards(event.target.value);
            }
        }, doneTypingIntervalGiftcards);

    }
    const searchGiftcardsItemsHandler = () => {
        clearTimeout(typingTimerGiftcards)
    }

    const openInNewTab = (index) => () => {
        const imgElement = document.querySelector(`div#qrcode${index} img`);
        const imgSrc = imgElement.src;

        const newWindow = window.open();
        newWindow.document.body.innerHTML = `<img src="${imgSrc}" alt="QR Code" />`;
    }

    const [showReject, setShowReject] = useState(false);
    const [openBottomRejectDrawer, setOpenBottomRejectDrawer] = useState(false);
    const handleShowReject = (transactionId) => () => {
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
     * Rejcet or Accept Giftcard Request.
     * @returns None
    */
    const changeGiftcardStatus = (transactionId, status) => (event) => {
        event.preventDefault();
        if (rejectDesc || status == 'Accepted') {
            setLoading(true);
            event.target.disabled = true;
            ApiCall(`/gift-card/${transactionId}/verify`, 'PATCH', locale, { status, confirmDescription: status == 'Rejected' ? rejectDesc : "string" }, '', 'admin', router).then(async (result) => {
                event.target.disabled = false;
                setLoading(false);
                getGiftcards();
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

    const [moreData, setMoreData] = useState(null);
    const [showMoreData, setShowMoreData] = useState(false);
    const [openBottomMoreDataDrawer, setOpenBottomMoreDataDrawer] = useState(false);
    const handleShowMoreDetail = (data) => () => {
        setMoreData(data);
        if (window.innerWidth >= 1024) {
            setShowMoreData(true);
            setOpenBottomMoreDataDrawer(false);
        } else {
            setShowMoreData(false);
            setOpenBottomMoreDataDrawer(true);
        }
    }

    return (
        <div className=" flex flex-col gap-y-8">
            <h1 className="text-large-2">درخواست های گیفت کارت</h1>
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
                            onChange={(event) => setSearchGiftcards(event.target.value)}
                            onKeyDown={searchGiftcardsItemsHandler}
                            onKeyUp={searchGiftcardsItems} />
                    </FormControl>
                </form>
                <span className="dark:text-white">تعداد کل: {loadingTransactions ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (transactionsTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>

            {loadingTransactions ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div>
                :
                <section className="overflow-x-auto overflow-y-hidden">
                    {transactions.length > 0 ?
                        <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                            <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                <TableHead className="dark:bg-dark">
                                    <TableRow>
                                        {GIFTCARDS_TABLE_HEAD.map((data, index) => (
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
                                                {data?.createdBy?.role == 'User' || data?.createdBy?.role == 'VIPUser' ? <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data.createdBy?._id}`}>
                                                    <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                                        <span>({data.createdBy?.mobileNumber}) {data.createdBy?.firstName} {data.createdBy?.lastName}</span>
                                                    </a>
                                                </LinkRouter> : <LinkRouter legacyBehavior href={`/admin/panel/adminsinglepage?id=${data.createdBy?._id}`}>
                                                    <a target="_blank" className="no-underline text-primary hover:underline">
                                                        <span>({data.createdBy?.mobileNumber}) {data.createdBy?.firstName} {data.createdBy?.lastName}</span>
                                                    </a>
                                                </LinkRouter>}
                                            </TableCell>
                                            <TableCell className=" border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                {data.used ? <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data.usedBy?._id}`}>
                                                    <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                                        <span>({data.usedBy?.mobileNumber}) {data.usedBy?.firstName} {data.usedBy?.lastName}</span>
                                                    </a>
                                                </LinkRouter> : '------'}
                                            </TableCell>
                                            <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                {data.tradeable ? <div className="flex items-center gap-x-4">
                                                    <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} alt={data.tradeable?.name}
                                                        className="w-10 h-10 rounded-[50%]" />
                                                    <span>{data.tradeable?.nameFa}</span>
                                                </div> : ''}
                                            </TableCell>
                                            <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                {(data.weight || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم
                                            </TableCell>
                                            <TableCell className="text-center border-none py-4 text-sm dark:text-white">
                                                <Button type="button" variant="text" size="medium" color="primary" className="rounded-lg" disableElevation
                                                    onClick={handleShowMoreDetail(data)}>
                                                    <text className=" font-semibold">جزئیات بیشتر</text>
                                                </Button >
                                            </TableCell>
                                            <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                    .locale('fa')
                                                    .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                            </TableCell>
                                            <TableCell className="text-center border-none px-8 py-4 text-sm dark:text-white">
                                                {data.status == 'Pending' ? <Chip label="در انتظار تائید" variant="outlined" size="small" className="w-full badge badge-primary" /> : ''}
                                                {data.status == 'Accepted' ? <Chip label="تائید شده" variant="outlined" size="small" className="w-full badge badge-success" /> : ''}
                                                {data.status == 'Rejected' ? <Chip label="رد شده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}
                                            </TableCell>
                                            <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                <div className="flex items-center">
                                                    {data.status == 'Pending' ?
                                                        <>
                                                            <IconButton
                                                                color={`success`}
                                                                onClick={changeGiftcardStatus(data._id, 'Accepted')}>
                                                                <CheckCircleIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                color={`error`}
                                                                onClick={handleShowReject(data._id)}>
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
                            <span className="block text-center text-large-1 text-primary-gray">درخواستی ای یافت نشد</span>
                        </div>}
                </section>}

            {Math.ceil(transactionsTotal / transactionsLimit) > 1 ?
                <div className="text-center mt-4">
                    <Pagination count={Math.ceil(transactionsTotal / transactionsLimit)} variant="outlined" color="primary" className="justify-center"
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
                                onClick={changeGiftcardStatus(transactionId, 'Rejected')}>
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
                                onClick={changeGiftcardStatus(transactionId, 'Rejected')}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >
                        </div>
                    </div>
                </SwipeableDrawer>
            </>

            {/* More Details */}
            <>
                <Dialog onClose={() => setShowMoreData(false)} open={showMoreData} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-4">
                        <div className="flex flex-col gap-y-4 w-full h-full">
                            <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>کد گیفت کارت:</span>
                                {moreData?.status == 'Accepted' ? <div className="flex items-center gap-x-2">
                                    <span>{moreData?.code}</span>
                                    <IconButton onClick={CopyData(moreData?.code)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M9.24984 18.9582H5.74984C2.4915 18.9582 1.0415 17.5082 1.0415 14.2498V10.7498C1.0415 7.4915 2.4915 6.0415 5.74984 6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V14.2498C13.9582 17.5082 12.5082 18.9582 9.24984 18.9582ZM5.74984 7.2915C3.1665 7.2915 2.2915 8.1665 2.2915 10.7498V14.2498C2.2915 16.8332 3.1665 17.7082 5.74984 17.7082H9.24984C11.8332 17.7082 12.7082 16.8332 12.7082 14.2498V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H5.74984Z" fill="#F1C40F" />
                                            <path d="M14.2498 13.9582H13.3332C12.9915 13.9582 12.7082 13.6748 12.7082 13.3332V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H6.6665C6.32484 7.2915 6.0415 7.00817 6.0415 6.6665V5.74984C6.0415 2.4915 7.4915 1.0415 10.7498 1.0415H14.2498C17.5082 1.0415 18.9582 2.4915 18.9582 5.74984V9.24984C18.9582 12.5082 17.5082 13.9582 14.2498 13.9582ZM13.9582 12.7082H14.2498C16.8332 12.7082 17.7082 11.8332 17.7082 9.24984V5.74984C17.7082 3.1665 16.8332 2.2915 14.2498 2.2915H10.7498C8.1665 2.2915 7.2915 3.1665 7.2915 5.74984V6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V12.7082Z" fill="#F1C40F" />
                                        </svg>
                                    </IconButton>
                                </div> : '------'}
                            </div>
                            <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>بارکد:</span>
                                {moreData?.code && moreData?.status == 'Accepted' ? <div id={`qrcode${moreData?._id}`} className="qrcode-container w-10 h-10 cursor-pointer" onClick={openInNewTab(moreData?._id)}>
                                    <Image
                                        text={moreData?.code || 'test'}
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
                            </div>
                            <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>استفاده شده:</span>
                                {moreData?.used ? <Chip label="بله" variant="outlined" size="small" className="w-fit px-8 badge badge-success" /> :
                                    <Chip label="خیر" variant="outlined" size="small" className="w-fit px-8 badge badge-error" />}
                            </div>
                            {moreData?.createdBy?.role == 'User' || moreData?.createdBy?.role == 'VIPUser' ? <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>هزینه آماده سازی:</span>
                                <span>{(moreData?.preparationCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                            </div> : ''}
                            {moreData?.address ?
                                <>
                                    <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                        <span>هزینه ارسال:</span>
                                        <span>{(moreData?.shippingCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                        <span>کد پستی:</span>
                                        <span>{moreData?.postalCode}</span>
                                    </div>
                                    <div className="dark:text-white">
                                        <span>آدرس: {moreData?.address}</span>
                                    </div>
                                </> : ''}
                            {(moreData?.branchTime && Object.keys(moreData?.branchTime).length > 0) ? <>
                                <span>
                                    {moreData?.branchTime?.branch?.nameFa} <br /> آدرس: <span className="whitespace-break-spaces">{moreData?.branchTime?.branch?.address}</span> <br />
                                    شماره تماس شعبه: <PatternFormat displayType="text" value={moreData?.branchTime?.branch?.phone} format="#### ### ## ##" dir="ltr" />
                                </span>
                                <span className="whitespace-break-spaces">
                                    زمان مراجعه: {moment(moreData?.branchTime?.startTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')} الی {moment(moreData?.branchTime?.endTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')}
                                </span>
                            </> : ''}
                        </div>
                        <div className="flex items-center justify-end gap-x-2">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                onClick={() => setShowMoreData(false)}>
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
                    open={openBottomMoreDataDrawer}
                    onClose={() => setOpenBottomMoreDataDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <div className="flex flex-col gap-y-4">
                        <div className="flex flex-col gap-y-4">
                            <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>کد گیفت کارت:</span>
                                {moreData?.status == 'Accepted' ? <div className="flex items-center gap-x-2">
                                    <span>{moreData?.code}</span>
                                    <IconButton onClick={CopyData(moreData?.code)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M9.24984 18.9582H5.74984C2.4915 18.9582 1.0415 17.5082 1.0415 14.2498V10.7498C1.0415 7.4915 2.4915 6.0415 5.74984 6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V14.2498C13.9582 17.5082 12.5082 18.9582 9.24984 18.9582ZM5.74984 7.2915C3.1665 7.2915 2.2915 8.1665 2.2915 10.7498V14.2498C2.2915 16.8332 3.1665 17.7082 5.74984 17.7082H9.24984C11.8332 17.7082 12.7082 16.8332 12.7082 14.2498V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H5.74984Z" fill="#F1C40F" />
                                            <path d="M14.2498 13.9582H13.3332C12.9915 13.9582 12.7082 13.6748 12.7082 13.3332V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H6.6665C6.32484 7.2915 6.0415 7.00817 6.0415 6.6665V5.74984C6.0415 2.4915 7.4915 1.0415 10.7498 1.0415H14.2498C17.5082 1.0415 18.9582 2.4915 18.9582 5.74984V9.24984C18.9582 12.5082 17.5082 13.9582 14.2498 13.9582ZM13.9582 12.7082H14.2498C16.8332 12.7082 17.7082 11.8332 17.7082 9.24984V5.74984C17.7082 3.1665 16.8332 2.2915 14.2498 2.2915H10.7498C8.1665 2.2915 7.2915 3.1665 7.2915 5.74984V6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V12.7082Z" fill="#F1C40F" />
                                        </svg>
                                    </IconButton>
                                </div> : '------'}
                            </div>
                            <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>بارکد:</span>
                                {moreData?.code && moreData?.status == 'Accepted' ? <div id={`qrcode${moreData?._id}`} className="qrcode-container w-10 h-10 cursor-pointer" onClick={openInNewTab(moreData?._id)}>
                                    <Image
                                        text={moreData?.code || 'test'}
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
                            </div>
                            <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>استفاده شده:</span>
                                {moreData?.used ? <Chip label="بله" variant="outlined" size="small" className="w-fit px-8 badge badge-success" /> :
                                    <Chip label="خیر" variant="outlined" size="small" className="w-fit px-8 badge badge-error" />}
                            </div>
                            {moreData?.createdBy?.role == 'User' || moreData?.createdBy?.role == 'VIPUser' ? <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>هزینه آماده سازی:</span>
                                <span>{(moreData?.preparationCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                            </div> : ''}
                            {moreData?.address ?
                                <>
                                    <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                        <span>هزینه ارسال:</span>
                                        <span>{(moreData?.shippingCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                        <span>کد پستی:</span>
                                        <span>{moreData?.postalCode}</span>
                                    </div>
                                    <div className="dark:text-white">
                                        <span>آدرس: {moreData?.address}</span>
                                    </div>
                                </> : ''}
                            {(moreData?.branchTime && Object.keys(moreData?.branchTime).length > 0) ? <>
                                <span>
                                    {moreData?.branchTime?.branch?.nameFa} <br /> آدرس: <span className="whitespace-break-spaces">{moreData?.branchTime?.branch?.address}</span> <br />
                                    شماره تماس شعبه: <PatternFormat displayType="text" value={moreData?.branchTime?.branch?.phone} format="#### ### ## ##" dir="ltr" />
                                </span>
                                <span className="whitespace-break-spaces">
                                    زمان مراجعه: {moment(moreData?.branchTime?.startTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')} الی {moment(moreData?.branchTime?.endTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')}
                                </span>
                            </> : ''}
                        </div>
                        <div className="flex justify-end">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                onClick={() => setOpenBottomMoreDataDrawer(false)}>
                                <text className="text-black font-semibold">بستن</text>
                            </Button >
                        </div>
                    </div>
                </SwipeableDrawer>
            </>
        </div>
    )
}

export default GiftcardsPageCompo;