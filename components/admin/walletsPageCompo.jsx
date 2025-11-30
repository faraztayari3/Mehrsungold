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
import Tooltip from '@mui/material/Tooltip';
import moment from 'jalali-moment'

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call"

/**
 * WalletsPageCompo component that displays the Wallets Page Component of the website.
 * @returns The rendered Wallets Page component.
 */
const WalletsPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, priceInfo, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const WALLETS_TABLE_HEAD = [
        {
            label: 'کاربر',
            classes: ""
        },
        {
            label: 'واحد',
            classes: ""
        },
        {
            label: 'نوع',
            classes: ""
        },
        {
            label: 'موجودی',
            classes: ""
        },
        {
            label: 'تاریخ ثبت',
            classes: ""
        },
        {
            label: 'آخرین ویرایش',
            classes: ""
        }
    ]

    const [pageItem, setPageItem] = useState(1);
    useEffect(() => {
        getWallets(1, '');
    }, []);

    /**
        * Retrieves Wallets.
        * @returns None
       */
    const [wallets, setWallets] = useState([]);
    const [loadingWallets, setLoadingWallets] = useState(true);
    const [walletsLimit, setWalletsLimit] = useState(10);
    const [walletsTotal, setWalletsTotal] = useState(0);
    const getWallets = (page, search) => {
        setLoadingWallets(true);
        ApiCall('/tradeable/user-inventory', 'GET', locale, {}, `${search ? `search=${search}&` : ''}sortOrder=0&sortBy=createdAt&limit=${walletsLimit}&skip=${(page * walletsLimit) - walletsLimit}`, 'admin', router).then(async (result) => {
            setWalletsTotal(result.count);
            setWallets(result.data);
            setLoadingWallets(false);
        }).catch((error) => {
            setLoadingWallets(false);
            console.log(error);
        });
    }

    const handlePageChange = (event, value) => {
        setPageItem(value);
        getWallets(value, '');
    }

    /**
     * Search for a user based on the input value and filter the displayed Wallets accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchWallets, setSearchWallets] = useState('');
    var typingTimerWallets;
    const doneTypingIntervalWallets = 300;
    const searchWalletsItems = (event) => {
        clearTimeout(typingTimerWallets);

        typingTimerWallets = setTimeout(() => {
            if (event.target.value == '') {
                setSearchWallets('');
                getWallets(1, '');
            } else {
                setSearchWallets(event.target.value);
                getWallets(1, event.target.value);
            }
        }, doneTypingIntervalWallets);

    }
    const searchWalletsItemsHandler = () => {
        clearTimeout(typingTimerWallets)
    }

    return (
        <div className=" flex flex-col gap-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-large-2">کیف پولها</h1>
            </div>
            <section className="overflow-x-auto overflow-y-hidden">
                <div className="flex items-center justify-between gap-x-4">
                    <form autoComplete="off">
                        <FormControl className="w-full md:w-auto">
                            <TextField
                                size="small"
                                type="text"
                                label="جستجو کیف پول"
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                onChange={(event) => setSearchWallets(event.target.value)}
                                onKeyDown={searchWalletsItemsHandler}
                                onKeyUp={searchWalletsItems} />
                        </FormControl>
                    </form>
                    <span className="dark:text-white">تعداد کل: {loadingWallets ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (walletsTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>

                {loadingWallets ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : wallets.length > 0 ?
                    <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                        <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                            <TableHead className="dark:bg-dark">
                                <TableRow>
                                    {WALLETS_TABLE_HEAD.map((data, index) => (
                                        <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
                                            <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {wallets.map((data, index) => (
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
                                            {data.tradeable ? <div className="flex items-center gap-x-4">
                                                <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} alt={data.tradeable?.name}
                                                    className="w-10 h-10 rounded-[50%]" />
                                                <span>{data.tradeable?.name} - {data.tradeable?.nameFa}</span>
                                            </div> : '----'}
                                        </TableCell>
                                        <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                            {data.blocked ? <Chip label="بلوکه شده" variant="outlined" size="small" className="w-full badge badge-error px-4" /> :
                                                <Chip label="در دسترس" variant="outlined" size="small" className="w-full badge badge-success px-4" />}
                                        </TableCell>
                                        <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                            {(data.balance || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم
                                        </TableCell>
                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                .locale('fa')
                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                        </TableCell>
                                        <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                            <span>{moment(moment(data.updatedAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                .locale('fa')
                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    : <div className="py-16">
                        <span className="block text-center text-large-1 text-primary-gray">کیف پولی یافت نشد</span>
                    </div>}

            </section>
            {Math.ceil(walletsTotal / walletsLimit) > 1 ?
                <div className="text-center mt-4">
                    <Pagination siblingCount={0} count={Math.ceil(walletsTotal / walletsLimit)} variant="outlined" color="primary" className="justify-center"
                        page={pageItem} onChange={handlePageChange} />
                </div>
                : ''}
        </div>
    )
}

export default WalletsPageCompo;