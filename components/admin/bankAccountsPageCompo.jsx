import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import CancelIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline'
import Chip from '@mui/material/Chip';
import LoadingButton from '@mui/lab/LoadingButton'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
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
 * BankAccountsPageCompo component that displays the BankAccounts Page Component of the website.
 * @returns The rendered BankAccounts Page component.
 */
const BankAccountsPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);
    const [rejectDesc, setRejectDesc] = useState('string');
    const [bankAccountId, setBankAccountId] = useState('');

    const BANKACCOUNTS_TABLE_HEAD = [
        {
            label: 'کاربر',
            classes: ""
        },
        {
            label: 'نام بانک',
            classes: ""
        },
        {
            label: 'شماره کارت',
            classes: ""
        },
        {
            label: 'شماره شبا',
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
        getBankAccounts();
    }, []);

    /**
        * Retrieves BankAccounts.
        * @returns None
       */
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loadingBankAccounts, setLoadingBankAccounts] = useState(true);
    const [bankAccountsLimit, setBankAccountsLimit] = useState(10);
    const [bankAccountsTotal, setBankAccountsTotal] = useState(0);
    const getBankAccounts = (search) => {
        setLoadingBankAccounts(true);
        ApiCall('/user/card', 'GET', locale, {}, `${search ? `search=${search}&` : ''}sortOrder=0&sortBy=createdAt&limit=${bankAccountsLimit}&skip=${(pageItem * bankAccountsLimit) - bankAccountsLimit}`, 'admin', router).then(async (result) => {
            setBankAccountsTotal(result.count);
            setBankAccounts(result.data);
            setLoadingBankAccounts(false);
        }).catch((error) => {
            setLoadingBankAccounts(false);
            console.log(error);
        });
    }

    const handlePageChange = (event, value) => {
        setPageItem(value);
        getBankAccounts();
    }

    /**
     * Search for a bankaccounts based on the input value and filter the displayed bankaccounts accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchBankAccounts, setSearchBankAccounts] = useState('');
    var typingTimerBankAccounts;
    const doneTypingIntervalBankAccounts = 300;
    const searchBankAccountsItems = (event) => {
        clearTimeout(typingTimerBankAccounts);

        typingTimerBankAccounts = setTimeout(() => {
            if (event.target.value == '') {
                setSearchBankAccounts('');
                setPageItem(1);
                getBankAccounts('');
            } else {
                setSearchBankAccounts(event.target.value);
                setPageItem(1);
                getBankAccounts(event.target.value);
            }
        }, doneTypingIntervalBankAccounts);

    }
    const searchBankAccountsItemsHandler = () => {
        clearTimeout(typingTimerBankAccounts)
    }

    const [showReject, setShowReject] = useState(false);
    const [openBottomRejectDrawer, setOpenBottomRejectDrawer] = useState(false);
    const handleShowReject = (bankAccountId) => () => {
        setBankAccountId(bankAccountId);
        if (window.innerWidth >= 1024) {
            setShowReject(true);
            setOpenBottomRejectDrawer(false);
        } else {
            setShowReject(false);
            setOpenBottomRejectDrawer(true);
        }
    }

    /**
     * Rejcet or Accept Bank Account.
     * @returns None
    */
    const changeBankAccountstatus = (bankAccountId, status) => (event) => {
        event.preventDefault();
        if (rejectDesc || status == 'Active') {
            setLoading(true);
            event.target.disabled = true;
            ApiCall(`/user/card/${bankAccountId}/offline-confirm`, 'PATCH', locale, { status, confirmDescription: rejectDesc }, '', 'admin', router).then(async (result) => {
                event.target.disabled = false;
                setLoading(false);
                getBankAccounts();
                setShowReject(false);
                setOpenBottomRejectDrawer(false);
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
            <h1 className="text-large-2">کارت های بانکی</h1>
            <div className="flex items-center justify-between gap-x-4">
                <form autoComplete="off">
                    <FormControl className="w-full md:w-auto">
                        <TextField
                            size="small"
                            type="text"
                            label="جستجو کارت بانکی"
                            InputLabelProps={{
                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                            }}
                            InputProps={{
                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                            }}
                            onChange={(event) => setSearchBankAccounts(event.target.value)}
                            onKeyDown={searchBankAccountsItemsHandler}
                            onKeyUp={searchBankAccountsItems} />
                    </FormControl>
                </form>
                <span className="dark:text-white">تعداد کل: {loadingBankAccounts ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (bankAccountsTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>
            {loadingBankAccounts ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div>
                :
                <section className="overflow-x-auto overflow-y-hidden">
                    {bankAccounts.length > 0 ?
                        <>
                            <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                                <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                    <TableHead className="dark:bg-dark">
                                        <TableRow>
                                            {BANKACCOUNTS_TABLE_HEAD.map((data, index) => (
                                                <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
                                                    <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bankAccounts.map((data, index) => (
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
                                                    <div className="flex items-center gap-x-2">
                                                        <div className="flex items-center justify-center bg-white w-9 h-9 rounded-[50%]">
                                                            <img src={CheckCardNumber(data.number).image} alt={CheckCardNumber(data.number).name} width="48" height="48" decoding="async" data-nimg="1" loading="lazy" className="w-7 h-7 object-contain" />
                                                        </div>
                                                        <span>{CheckCardNumber(data.number).name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                    <PatternFormat displayType='text' value={data.number} format="####-####-####-####" dir="ltr" />
                                                </TableCell>
                                                <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                    {data.iban ? <PatternFormat displayType='text' value={(data.iban)?.replace('ir', '').replace('IR', '')} format="IR## #### #### #### #### #### ##"
                                                    /> :
                                                        <Chip label="فاقد شماره شبا" variant="outlined" size="small" className="w-full badge badge-error" />}
                                                </TableCell>
                                                <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                    <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                        .locale('fa')
                                                        .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                </TableCell>
                                                <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                    {data.status == 'Active' || data.status == 'Accepted' ? <Chip label="تائید شده" variant="outlined" size="small" className="w-full badge badge-success" /> : ''}
                                                    {data.status == 'Pending' ? <Chip label="در انتظار تائید" variant="outlined" size="small" className="w-full badge badge-primary" /> : ''}
                                                    {data.status == 'Deactive' ? <Chip label="رد شده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}
                                                    {data.status == 'Deleted' ? <Chip label="حذف شده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}
                                                </TableCell>
                                                <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                    {data.status == 'Pending' ?
                                                        <>
                                                            <Tooltip title="فعالسازی">
                                                                <IconButton
                                                                    color={`success`}
                                                                    onClick={changeBankAccountstatus(data._id, 'Active')}>
                                                                    <CheckCircleIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="رد کردن">
                                                                <IconButton
                                                                    color={`error`}
                                                                    onClick={handleShowReject(data._id)}>
                                                                    <CancelIcon />
                                                                </IconButton>
                                                            </Tooltip>

                                                        </> : ''}
                                                    {data.status == 'Active' || data.status == 'Accepted' ?
                                                        <Tooltip title="غیرفعال کردن">
                                                            <IconButton
                                                                color={`error`}
                                                                onClick={changeBankAccountstatus(data._id, 'Deactive')}>
                                                                <CancelIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        : ''}
                                                    {data.status == 'Deactive' ?
                                                        <Tooltip title="فعالسازی">
                                                            <IconButton
                                                                color={`success`}
                                                                onClick={changeBankAccountstatus(data._id, 'Active')}>
                                                                <CheckCircleIcon />
                                                            </IconButton>
                                                        </Tooltip> : ''}
                                                    {data.status == 'Deleted' ? '------' : ''}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                        : <div className="py-16">
                            <span className="block text-center text-large-1 text-primary-gray">کارتی یافت نشد</span>
                        </div>}
                </section>
            }

            {Math.ceil(bankAccountsTotal / bankAccountsLimit) > 1 ?
                <div className="text-center mt-4">
                    <Pagination siblingCount={0} count={Math.ceil(bankAccountsTotal / bankAccountsLimit)} variant="outlined" color="primary" className="justify-center"
                        page={pageItem} onChange={handlePageChange} />
                </div>
                : ''}

            {/* Reject BankAccounts */}
            <>
                <Dialog onClose={() => setShowReject(false)} open={showReject} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-4">
                        <FormControl>
                            <TextField
                                type="text"
                                label="توضیحات رد کارت بانکی"
                                multiline
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
                                onClick={changeBankAccountstatus(bankAccountId, 'Deactive')}>
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
                                label="توضیحات رد کارت بانکی"
                                multiline
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
                                onClick={changeBankAccountstatus(bankAccountId, 'Deactive')}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >
                        </div>
                    </div>
                </SwipeableDrawer>
            </>
        </div>
    )
}

export default BankAccountsPageCompo;