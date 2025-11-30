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

/**
 * OrderbooksPageCompo component that displays the Orderbooks Page Component of the website.
 * @returns The rendered Orderbooks Page component.
 */
const OrderbooksPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);
    const [rejectDesc, setRejectDesc] = useState('');
    const [transactionId, setTransactionId] = useState('');

    const ORDERBOOKS_TABLE_HEAD = [
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
            label: 'قیمت معامله',
            classes: ""
        },
        {
            label: 'پیشرفت',
            classes: ""
        },
        {
            label: 'مبلغ معامله',
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
        // {
        //     label: '',
        //     classes: ""
        // }
    ]

    const [pageItem, setPageItem] = useState(1);
    useEffect(() => {
        getOrderbooks();
    }, []);

    /**
        * Retrieves Orderbooks.
        * @returns None
       */
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [transactionsLimit, settransactionsLimit] = useState(10);
    const [transactionsTotal, setTransactionsTotal] = useState(0);
    const getOrderbooks = (search) => {
        setLoadingTransactions(true);
        ApiCall('/order-book', 'GET', locale, {}, `${search ? `search=${search}&` : ''}sortOrder=0&sortBy=createdAt&limit=${transactionsLimit}&skip=${(pageItem * transactionsLimit) - transactionsLimit}`, 'admin', router).then(async (result) => {
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
        getOrderbooks();
    }

    /**
     * Search for a Orderbooks based on the input value and filter the displayed Orderbooks accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchOrderbooks, setSearchOrderbooks] = useState('');
    var typingTimerOrderbooks;
    const doneTypingIntervalOrderbooks = 300;
    const searchOrderbooksItems = (event) => {
        clearTimeout(typingTimerOrderbooks);

        typingTimerOrderbooks = setTimeout(() => {
            if (event.target.value == '') {
                setSearchOrderbooks('');
                setPageItem(1);
                getOrderbooks('');
            } else {
                setSearchOrderbooks(event.target.value);
                setPageItem(1);
                getOrderbooks(event.target.value);
            }
        }, doneTypingIntervalOrderbooks);

    }
    const searchOrderbooksItemsHandler = () => {
        clearTimeout(typingTimerOrderbooks)
    }

    return (
        <div className=" flex flex-col gap-y-8">
            <h1 className="text-large-2">معاملات پیشرفته</h1>
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
                            onChange={(event) => setSearchOrderbooks(event.target.value)}
                            onKeyDown={searchOrderbooksItemsHandler}
                            onKeyUp={searchOrderbooksItems} />
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
                                        {ORDERBOOKS_TABLE_HEAD.map((data, index) => (
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
                                                {data.type == 'Buy' ? <Chip label="خرید" variant="outlined" size="small" className="w-full badge badge-success" /> :
                                                    <Chip label="فروش" variant="outlined" size="small" className="w-full badge badge-error" />}
                                            </TableCell>
                                            <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم
                                            </TableCell>
                                            <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                {(data.avgPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان
                                            </TableCell>
                                            <TableCell className="text-center border-none py-4 text-sm dark:text-white">
                                                {parseInt(((data.amount - data.remainingAmount || 0) * 100) / data.amount) != 0 ?
                                                    `${parseInt(((data.amount - data.remainingAmount || 0) * 100) / data.amount)}%` : 0}
                                            </TableCell>
                                            <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                {data.totalPrice > 0 ? `${(data.totalPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` : '------'}
                                            </TableCell>
                                            <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                {data.wage > 0 ? data.type == 'Buy' ?
                                                    `${(data.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 5 })} گرم`
                                                    : `${(data.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان`
                                                    : '------'}
                                            </TableCell>
                                            <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                    .locale('fa')
                                                    .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                            </TableCell>
                                            <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl  border-none px-8 py-4 text-sm dark:text-white">
                                                {data.status == 'Queued' ? <Chip label="در صف انتظار" variant="outlined" size="small" className="w-full badge badge-primary" /> : ''}
                                                {data.status == 'Processing' ? <Chip label="جدید" variant="outlined" size="small" className="w-full badge badge-info" /> : ''}
                                                {data.status == 'InProgress' ? <Chip label="در حال پردازش" variant="outlined" size="small" className="w-full badge badge-info" /> : ''}
                                                {data.status == 'Finished' ? (data.wage > 0 && data.totalPrice > 0) ?
                                                    <Chip label="تکمیل شده" variant="outlined" size="small" className="w-full badge badge-success" /> :
                                                    <Chip label="انجام نشده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}
                                                {data.status == 'Canceled' ? <Chip label="لغو شده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}
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
        </div>
    )
}

export default OrderbooksPageCompo;