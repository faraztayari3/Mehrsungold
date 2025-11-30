import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress'
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
 * FactorsPageCompo component that displays the Factors Page Component of the website.
 * @returns The rendered Factors Page component.
 */
const FactorsPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, priceInfo, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const FACTORS_TABLE_HEAD = [
        {
            label: 'کاربر',
            classes: ""
        },
        {
            label: 'نام درخواست',
            classes: ""
        },
        {
            label: 'مقدار',
            classes: ""
        },
        {
            label: 'هزینه',
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
    ]

    const [pageItem, setPageItem] = useState(1);
    useEffect(() => {
        getFactors();
    }, [pageItem]);

    /**
        * Retrieves Factors.
        * @returns None
       */
    const [factors, setFactors] = useState([]);
    const [loadingFactors, setLoadingFactors] = useState(true);
    const [factorsLimit, setFactorsLimit] = useState(10);
    const [factorsTotal, setFactorsTotal] = useState(0);
    const getFactors = (search) => {
        setLoadingFactors(true);
        ApiCall('/product/factor', 'GET', locale, {}, `${search ? `search=${search}&` : ''}sortOrder=0&sortBy=createdAt&limit=${factorsLimit}&skip=${(pageItem * factorsLimit) - factorsLimit}`, 'admin', router).then(async (result) => {
            setFactorsTotal(result.count);
            setFactors(result.data);
            setLoadingFactors(false);
        }).catch((error) => {
            setLoadingFactors(false);
            console.log(error);
        });
    }

    const handlePageChange = (event, value) => {
        setPageItem(value);
        getFactors(value);
    }

    /**
     * Search for a Factors based on the input value and filter the displayed Factors accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchFactors, setSearchFactors] = useState('');
    var typingTimerFactors;
    const doneTypingIntervalFactors = 300;
    const searchFactorsItems = (event) => {
        clearTimeout(typingTimerFactors);

        typingTimerFactors = setTimeout(() => {
            if (event.target.value == '') {
                setSearchFactors('');
                setPageItem(1);
                getFactors('');
            } else {
                setSearchFactors(event.target.value);
                setPageItem(1);
                getFactors(event.target.value);
            }
        }, doneTypingIntervalFactors);

    }
    const searchFactorsItemsHandler = () => {
        clearTimeout(typingTimerFactors)
    }

    return (
        <div className=" flex flex-col gap-y-8">
            <h1 className="text-large-2">فاکتور ها</h1>
            <section className="overflow-x-auto overflow-y-hidden">
                <div className="flex items-center justify-between gap-x-4">
                    <form autoComplete="off">
                        <FormControl className="w-full md:w-auto">
                            <TextField
                                size="small"
                                type="text"
                                label="جستجو فاکتور"
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                onChange={(event) => setSearchFactors(event.target.value)}
                                onKeyDown={searchFactorsItemsHandler}
                                onKeyUp={searchFactorsItems} />
                        </FormControl>
                    </form>
                    <span className="dark:text-white">تعداد کل: {loadingFactors ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (factorsTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
                {loadingFactors ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : factors.length > 0 ?
                    <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                        <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                            <TableHead className="dark:bg-dark">
                                <TableRow>
                                    {FACTORS_TABLE_HEAD.map((data, index) => (
                                        <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
                                            <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {factors.map((data, index) => (
                                    <TableRow
                                        key={index}
                                        sx={{ '&:last-child td': { border: 0 } }}
                                        className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                        <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                            <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data._id}`}>
                                                <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                                    <span>({data.user?.mobileNumber}) {data.user?.firstName} {data.user?.lastName}</span>
                                                </a>
                                            </LinkRouter>
                                        </TableCell>
                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                            <span>
                                                {data.productRequest?.product?.name} -  <span className="ltr">
                                                    {(data.productRequest?.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}
                                                </span> گرم
                                            </span>
                                        </TableCell>
                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                            {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم
                                        </TableCell>
                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                            {(data.price || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان
                                        </TableCell>
                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                .locale('fa')
                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                        </TableCell>
                                        <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                            {data.status == 'Accepted' ? <Chip label="تائید شده" variant="outlined" size="small" className="w-full badge badge-success" /> : ''}
                                            {data.status == 'Pending' ? <Chip label="در انتظار تائید" variant="outlined" size="small" className="w-full badge badge-primary" /> : ''}
                                            {data.status == 'Rejected' ? <Chip label="رد شده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    : <div className="py-16">
                        <span className="block text-center text-large-1 text-primary-gray">فاکتوری یافت نشد</span>
                    </div>}

            </section>
            {Math.ceil(factorsTotal / factorsLimit) > 1 ?
                <div className="text-center mt-4">
                    <Pagination siblingCount={0} count={Math.ceil(factorsTotal / factorsLimit)} variant="outlined" color="primary" className="justify-center"
                        page={pageItem} onChange={handlePageChange} />
                </div>
                : ''}
        </div>
    )
}

export default FactorsPageCompo;