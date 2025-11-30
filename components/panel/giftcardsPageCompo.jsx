import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import LoadingButton from '@mui/lab/LoadingButton'
import DeleteIcon from '@mui/icons-material/Delete'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Pagination from '@mui/material/Pagination';
import Tooltip from '@mui/material/Tooltip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import MUISelect from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import moment from 'jalali-moment'

import { PatternFormat } from 'react-number-format';
import { useQRCode } from 'next-qrcode'

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
import ConfirmDialog from '../shared/ConfirmDialog';
import CopyData from "../../services/copy"
import CustomSwitch from "../shared/CustomSwitch"

// Components
import GiftcardCharge from "./compos/giftcardCharge"

/**
 * GiftcardsPageCompo component that displays the Giftcards Page Component of the website.
 * @returns The rendered Giftcards Page component.
 */
const GiftcardsPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, priceInfo, userInfo, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const { Image } = useQRCode();

    const [tabValue, setTabValue] = useState(0);
    const [pageItem, setPageItem] = useState(1);
    useEffect(() => {
        getGiftcards(1);
    }, []);

    /**
           * Retrieves Branches.
           * @returns None
          */
    const [branches, setBranches] = useState([]);
    const [loadingBranches, setLoadingBranches] = useState(true);
    const getBranches = (search) => {
        setLoadingBranches(true);
        ApiCall('/branch', 'GET', locale, {}, ``, 'user', router).then(async (result) => {
            setBranches(result.data);
            setLoadingBranches(false);
        }).catch((error) => {
            setLoadingBranches(false);
            console.log(error);
        });
    }

    const [selectedDate, setSelectedDate] = useState(null);
    const weekDays = [];

    const generateWeekDays = () => {
        const startOfWeek = moment().startOf("day");
        const persianWeekDays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];

        for (let i = 0; i <= 7; i++) {
            const day = startOfWeek.clone().add(i, "days");
            const jalaliDayOfWeek = (day.day() + 1) % 7;
            if (jalaliDayOfWeek !== 6) {
                weekDays.push({
                    date: day,
                    dayName: persianWeekDays[jalaliDayOfWeek],
                    formattedDate: day.format("jMM/jDD"),
                });
            }
        }
    }

    generateWeekDays();

    /**
        * Retrieves TimeBranches.
        * @returns None
       */
    const [timeBranches, setTimeBranches] = useState([]);
    const [loadingTimeBranches, setLoadingTimeBranches] = useState(false);
    const [timeBranchesLimit, setTimeBranchesLimit] = useState(10);
    const [timeBranchesTotal, setTimeBranchesTotal] = useState(0);
    const [branch, setBranch] = useState(null);
    const [branchTime, setBranchTime] = useState(null)
    const [disabledRanges, setDisabledRanges] = useState([]);
    const getTimeBranches = (page, branchId, fromDate, toDate) => {
        setLoadingTimeBranches(true);
        ApiCall('/branch/branch-time', 'GET', locale, {},
            `fromDate=${fromDate}&toDate=${toDate}&branchId=${branchId}&sortOrder=0&sortBy=createdAt&limit=${timeBranchesLimit}&skip=${(page * timeBranchesLimit) - timeBranchesLimit}`, 'user', router
        ).then(async (result) => {
            const now = new Date();

            const filteredData = result.data.filter(item => {
                const itemEndTime = new Date(item.endTime);
                return itemEndTime > now;
            });

            setTimeBranchesTotal(filteredData.length);
            setTimeBranches(filteredData);
            setLoadingTimeBranches(false);
        }).catch((error) => {
            setLoadingTimeBranches(false);
            console.log(error);
        });
    }

    const handleSelectBranch = (branch) => {
        // getTimeBranches(1, branch?._id);
        setSelectedDate(null);
        setBranch(branch);
    }

    const handleSelectDay = (date) => (event) => {
        const isoStartDate = moment(date).format("YYYY-MM-DDT00:00:00.000");
        const isoEndDate = moment(date).format("YYYY-MM-DDT23:59:59.999");
        setSelectedDate(date);
        setBranchTime('');
        if (branch) {
            getTimeBranches(1, branch._id, isoStartDate, isoEndDate);
        }
    }

    const [showFactor, setShowFactor] = useState(false);
    const handleShowFactor = async () => {
        if (formData?.isPostDelivery) {
            await trigger('postalCode');
            await trigger('address');
            if ((formData?.postalCode && formData?.postalCode?.length == 10) && formData?.address) {
                setShowFactor(true);
            } else {
                return;
            }
        } else {
            setShowFactor(true);
        }
    }
    const handleCloseFactor = () => {
        setShowFactor(false);
    }

    /**
        * Retrieves Giftcards.
        * @returns None
       */
    const [giftcards, setGiftcards] = useState([]);
    const [loadingGiftcards, setLoadingGiftcards] = useState(true);
    const getGiftcards = () => {
        setLoadingGiftcards(true);
        ApiCall('/gift-card/settings', 'GET', locale, {}, ``, 'user', router).then(async (result) => {
            setGiftcards(result.data);
            setLoadingGiftcards(false);
        }).catch((error) => {
            setLoadingGiftcards(false);
            console.log(error);
        });
    }

    const handleChange = (event, newTabValue) => {
        setTabValue(newTabValue);
        if (newTabValue == 1) {
            getGiftcardsOrders(1);
        }
    }

    const [itemData, setItemData] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [openBottomRejectDrawer, setOpenBottomRejectDrawer] = useState(false);
    const handleShowReject = (data) => () => {
        setItemData(data);
        if (window.innerWidth >= 1024) {
            setShowReject(true);
            setOpenBottomRejectDrawer(false);
        } else {
            setShowReject(false);
            setOpenBottomRejectDrawer(true);
        }
    }

    const openInNewTab = (index) => () => {
        const imgElement = document.querySelector(`div#qrcode${index} img`);
        const imgSrc = imgElement.src;

        const newWindow = window.open();
        newWindow.document.body.innerHTML = `<img src="${imgSrc}" alt="QR Code" />`;
    }

    /**
       * Retrieves GiftcardsOrders.
       * @returns None
      */
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [transactionsLimit, setTransactionsLimit] = useState(10);
    const [transactionsTotal, setTransactionsTotal] = useState(0);
    const getGiftcardsOrders = (page) => {
        setLoadingTransactions(true);
        ApiCall('/gift-card', 'GET', locale, {}, `createdBy=${userInfo?._id}&sortOrder=0&sortBy=createdAt&limit=${transactionsLimit}&skip=${(page * transactionsLimit) - transactionsLimit}`, 'user', router).then(async (result) => {
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
        getGiftcardsOrders(value);
    }

    /**
     * User Giftcard Request.
     * @returns None
    */
    const [loadingOrderRequest, setLoadingOrderRequest] = useState(false);
    const submitGiftcardOrder = () => {
        setLoadingOrderRequest(true);
        let body = formData?.isPostDelivery ? {
            tradeableId: giftcardData?.tradeable?._id, weight: giftcardData?.weight, count: productAmount, buyWithToman: formData?.buyWithToman,
            address: formData?.address, postalCode: formData?.postalCode
        } : formData?.isPersonDelivery ? {
            tradeableId: giftcardData?.tradeable?._id, weight: giftcardData?.weight, count: productAmount, buyWithToman: formData?.buyWithToman,
            branchTimeId: branchTime?._id
        } :
            { tradeableId: giftcardData?.tradeable?._id, weight: giftcardData?.weight, count: productAmount, buyWithToman: formData?.buyWithToman }

        ApiCall('/gift-card', 'POST', locale, body, '', 'user', router).then(async (result) => {
            setLoadingOrderRequest(false);
            setShowGiftcardOrder(false);
            setOpenBottomGiftcardOrderDrawer(false);
            setTabValue(1);
            getGiftcardsOrders(1);
            setFormData({ buyWithToman: false, address: '', postalCode: '', isPostDelivery: false, isPersonDelivery: false });
            clearForm();
            clearErrors();
            setBranch(null);
            setBranchTime(null);
            handleCloseFactor();
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setLoadingOrderRequest(false);
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
    const [giftcardId, setGiftcardId] = useState('');

    const handleOpenDialog = (giftcardId) => (event) => {
        event.stopPropagation();
        setGiftcardId(giftcardId);
        setOpenDialog(true);
    }
    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    /**
    * Delete a Order.
    * @returns None
   */
    const [deleteLoading, setDeleteLoading] = useState(false);
    const deleteOrder = () => {
        setDeleteLoading(true);
        ApiCall(`/gift-card/${giftcardId}`, 'DELETE', locale, {}, '', 'user', router).then(async (result) => {
            setDeleteLoading(false);
            getGiftcardsOrders(pageItem);
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

    const [giftcardData, setGiftcardData] = useState(null);
    const [showGiftcardOrder, setShowGiftcardOrder] = useState(false);
    const [openBottomGiftcardOrderDrawer, setOpenBottomGiftcardOrderDrawer] = useState(false);
    const handleShowGiftcardOrder = (data, weight) => () => {
        setGiftcardData({ ...data, weight });
        if (window.innerWidth >= 1024) {
            setShowGiftcardOrder(true);
            setOpenBottomGiftcardOrderDrawer(false);
        } else {
            setShowGiftcardOrder(false);
            setOpenBottomGiftcardOrderDrawer(true);
        }
    }

    const [formData, setFormData] = useState({ buyWithToman: false, address: '', postalCode: '', isPostDelivery: false, isPersonDelivery: false });
    const validationSchema = Yup.object().shape({
        isPostDelivery: Yup.boolean(),
        address: Yup.string().when("isPostDelivery", {
            is: false,
            then: schema => schema.optional(),
            otherwise: schema => schema.required('این فیلد الزامی است')
        }),
        postalCode: Yup.string().when("isPostDelivery", {
            is: false,
            then: schema => schema.optional(),
            otherwise: schema => schema.required('این فیلد الزامی است').min(10, 'کد پستی 10 رقمی می باشد.').max(10, 'کد پستی 10 رقمی می باشد.')
        })
    });

    const { control, setValue, trigger, clearErrors, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            isPostDelivery: false
        }
    });

    const clearForm = () => {
        setValue('address', '');
        setValue('postalCode', '');
        setValue('isPostDelivery', false);
    }

    const [productAmount, setProductAmount] = useState(1);
    /**
    * Calculates the input button increment and decrement value for giftcard Amount.
    * @returns None
    */
    const handleNumberInputBtn = (type) => (event) => {
        event.preventDefault();
        if (type == 'increment') {
            if (productAmount == '') {
                setProductAmount(1);
            } else if (productAmount > 10) {
                setProductAmount(10);
            } else if (productAmount < 1) {
                setProductAmount(1);
            } else {
                let amount = productAmount + 1;
                setProductAmount(parseInt(amount));
            }
        } else {
            if (productAmount == '') {
                setProductAmount(1);
            } else if (productAmount > 10) {
                setProductAmount(10);
            } else if (productAmount < 1) {
                setProductAmount(1);
            } else {
                let amount = productAmount - 1;
                setProductAmount(parseInt(amount));
            }
        }

    }

    /**
    * Calculates the input value for giftcard Amount.
    * @returns None
    */
    const handleChangeAmount = (event) => {
        const value = event.target.value;
        if (value == '') {
            setProductAmount(1);
        } else if (value > 10) {
            setProductAmount(10);
        } else if (value < 1) {
            setProductAmount(1);
        } else {
            setProductAmount(parseInt(value));
        }
    }

    return (
        <div className="xl:max-w-[40rem] xl:mx-auto">
            <section>
                <div className="flex items-center justify-between gap-x-4">
                    <Tabs variant="fullWidth" indicatorColor="primary" textColor="inherit" className="rounded-t-2xl -mt-1 lg:w-fit"
                        value={tabValue}
                        onChange={handleChange}>
                        <Tab label="گیفت کارت ها" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} />
                        <Tab label="درخواست ها" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} />
                    </Tabs>
                    {siteInfo?.giftCardIsActive ? <div className="flex items-center justify-between gap-x-14 whitespace-nowrap">
                        <GiftcardCharge disableElevation={true} />
                    </div> : ''}
                </div>
                {tabValue == 0 ? <div>
                    {loadingGiftcards ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : giftcards?.length > 0 ?
                        <div className="grid grid-cols-12 gap-4 py-16">
                            {giftcards?.map((data, index) => {
                                return (
                                    data.validWeights?.map((item, itemIndex) => (
                                        <div className="col-span-12 md:col-span-6 custom-card rounded-2xl p-2" key={itemIndex}>
                                            <div className="flex flex-col items-start gap-y-4">
                                                <div className="flex items-center gap-x-2">
                                                    <img alt={data.tradeable?.name} src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} width="48" height="48" decoding="async" data-nimg="1" loading="lazy" className="w-14 h-14 object-contain" />
                                                    <span>گیفت کارت {data.tradeable?.nameFa} {item} گرمی</span>
                                                </div>
                                                <div className="w-full block text-end">
                                                    <Button type="submit" variant="outlined" size="medium" className="rounded-lg px-10" disableElevation
                                                        onClick={handleShowGiftcardOrder(data, item)}>
                                                        <AddShoppingCartIcon />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )
                            })}
                        </div> :
                        <div className="py-16">
                            <span className="block text-center text-large-1 text-primary-gray">گیفت کارتی تعریف نشده است.</span>
                        </div>}
                </div> :
                    <div>
                        {loadingTransactions ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div>
                            :
                            <section className="overflow-x-auto overflow-y-hidden flex flex-col gap-y-4 mt-16">
                                {transactions.length > 0 ?
                                    <>
                                        {transactions.map((data, index) => (
                                            <Accordion key={index} className="custom-accordion col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                                <AccordionSummary
                                                    className="font-medium text-black w-full *:!my-3 !px-0"
                                                    expandIcon={''}>
                                                    <div className="w-full">
                                                        <div className="flex items-center justify-between gap-x-2">
                                                            <div>
                                                                <span className="flex items-center gap-x-4">
                                                                    {data.tradeable ?
                                                                        <img
                                                                            crossOrigin="anonymous"
                                                                            src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`}
                                                                            alt={data.tradeable?.name}
                                                                            className="w-8 h-8 rounded-[50%]"
                                                                        />
                                                                        : ''}
                                                                    <span>گیفت کارت {data.tradeable?.nameFa} {data.weight || 0} گرمی</span>
                                                                </span>
                                                                <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {data.buyWithToman ? `${(data.totalCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}-` :
                                                                            `${(data.weight || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })}-`}

                                                                    </span> &nbsp;
                                                                    {data.buyWithToman ? 'تومان' : 'گرم'}</span>
                                                            </div>
                                                            <div className="flex flex-col items-end text-end">
                                                                <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                    .locale('fa')
                                                                    .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                                <span className="flex items-center gap-x-2 mt-2">
                                                                    <span>وضعیت: </span>
                                                                    {data.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">تائید شده</span> : ''}
                                                                    {data.status == 'Pending' ? <div className="flex items-center whitespace-nowrap">
                                                                        <span className="text-primary">در انتظار تائید</span>
                                                                        <Tooltip title="لغو درخواست">
                                                                            <IconButton color="error" className="-me-4" onClick={handleOpenDialog(data._id)}>
                                                                                <DeleteIcon />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </div> : ''}
                                                                    {data.status == 'Rejected' ? <span className="text-sell cursor-pointer hover:underline" onClick={handleShowReject(data)}>رد شده</span> : ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-center">
                                                            <IconButton color={darkModeToggle ? 'white' : 'black'} className="p-1 xl:-mx-8 -rotate-90">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                    <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                    <path d="M13.26 15.53L9.74 12L13.26 8.46997" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                </svg>
                                                            </IconButton>
                                                        </div>
                                                    </div>
                                                </AccordionSummary>
                                                <AccordionDetails className="custom-accordion-text !px-2 !pb-4">
                                                    {data.address ?
                                                        <div className="w-full flex flex-col gap-y-4">
                                                            <div className="w-full flex items-center justify-between">
                                                                <div className="flex flex-col gap-y-1 dark:text-white">
                                                                    <span>هزینه ارسال:</span>
                                                                    <span>{(data.shippingCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                                                </div>
                                                                <div className="flex flex-col gap-y-1 dark:text-white">
                                                                    <span>کد پستی:</span>
                                                                    <span>{data.postalCode}</span>
                                                                </div>
                                                            </div>
                                                            <div className="w-full dark:text-white">
                                                                <span>آدرس: {data.address}</span>
                                                            </div>
                                                        </div> : (data.branchTime && Object.keys(data.branchTime).length > 0) ? <div className="w-full flex flex-col gap-y-4">
                                                            <span>
                                                                {data.branchTime?.branch?.nameFa} <br /> آدرس: <span className="whitespace-break-spaces">{data.branchTime?.branch?.address}</span> <br />
                                                                شماره تماس شعبه: <PatternFormat displayType="text" value={data.branchTime?.branch?.phone} format="#### ### ## ##" dir="ltr" />
                                                            </span>
                                                            <span className="whitespace-break-spaces">
                                                                زمان مراجعه: {moment(data.branchTime?.startTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')} الی {moment(data.branchTime?.endTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')}
                                                            </span>
                                                        </div> : <div className="w-full flex items-center justify-between">
                                                            <div className="flex flex-col">
                                                                <span>کد گیفت کارت: </span>
                                                                {data.status == 'Accepted' ? <div className="flex items-center gap-x-2">
                                                                    <span>{data.code}</span>
                                                                    <IconButton onClick={CopyData(data.code)}>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                                            <path d="M9.24984 18.9582H5.74984C2.4915 18.9582 1.0415 17.5082 1.0415 14.2498V10.7498C1.0415 7.4915 2.4915 6.0415 5.74984 6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V14.2498C13.9582 17.5082 12.5082 18.9582 9.24984 18.9582ZM5.74984 7.2915C3.1665 7.2915 2.2915 8.1665 2.2915 10.7498V14.2498C2.2915 16.8332 3.1665 17.7082 5.74984 17.7082H9.24984C11.8332 17.7082 12.7082 16.8332 12.7082 14.2498V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H5.74984Z" fill="#F1C40F" />
                                                                            <path d="M14.2498 13.9582H13.3332C12.9915 13.9582 12.7082 13.6748 12.7082 13.3332V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H6.6665C6.32484 7.2915 6.0415 7.00817 6.0415 6.6665V5.74984C6.0415 2.4915 7.4915 1.0415 10.7498 1.0415H14.2498C17.5082 1.0415 18.9582 2.4915 18.9582 5.74984V9.24984C18.9582 12.5082 17.5082 13.9582 14.2498 13.9582ZM13.9582 12.7082H14.2498C16.8332 12.7082 17.7082 11.8332 17.7082 9.24984V5.74984C17.7082 3.1665 16.8332 2.2915 14.2498 2.2915H10.7498C8.1665 2.2915 7.2915 3.1665 7.2915 5.74984V6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V12.7082Z" fill="#F1C40F" />
                                                                        </svg>
                                                                    </IconButton>
                                                                </div> : '------'}
                                                            </div>
                                                            <span className="flex flex-col">
                                                                <span>بارکد: </span>
                                                                {data.code && data.status == 'Accepted' ? <div id={`qrcode${index}`} className="qrcode-container w-10 h-10 cursor-pointer" onClick={openInNewTab(index)}>
                                                                    <Image
                                                                        text={data.code}
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
                                                            </span>
                                                        </div>}
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                        <ConfirmDialog
                                            open={openDialog}
                                            onClose={handleCloseDialog}
                                            onConfirm={deleteOrder}
                                            title="آیا مطمئن هستید؟"
                                            loading={deleteLoading}
                                            darkModeToggle={darkModeToggle}
                                        />
                                    </>
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

                    </div>}
            </section>

            {/* Order */}
            <>
                <Dialog onClose={() => { setShowGiftcardOrder(false); handleCloseFactor(); setValue('isPostDelivery', false); clearErrors(); setFormData({ buyWithToman: false, address: '', postalCode: '', isPostDelivery: false, isPersonDelivery: false }); setBranch(null); setBranchTime(null); }} open={showGiftcardOrder} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6 mb-4">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">
                            <div className="h-full flex items-center gap-x-4">
                                <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${giftcardData?.tradeable?.image}`} alt={giftcardData?.tradeable?.name}
                                    className="rounded-xl object-contain w-12 h-12" loading="lazy" />
                                <span className="font-bold">گیفت کارت {giftcardData?.tradeable?.nameFa} {giftcardData?.weight} گرمی</span>
                            </div>
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => { setShowGiftcardOrder(false); handleCloseFactor(); setValue('isPostDelivery', false); clearErrors(); setFormData({ buyWithToman: false, address: '', postalCode: '', isPostDelivery: false, isPersonDelivery: false }); setBranch(null); setBranchTime(null); }}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                    </div>
                    {showFactor ?
                        <form key={1} className="flex flex-col gap-y-2" noValidate autoComplete="off" onSubmit={handleSubmit(submitGiftcardOrder)}>
                            <Divider component="div" className="w-full mb-4 dark:bg-primary dark:bg-opacity-50" />
                            <div className="w-full text-start flex flex-col gap-y-4">
                                {formData?.buyWithToman ? <Alert
                                    severity="info"
                                    variant="filled"
                                    color="info"
                                    className="custom-alert info">
                                    هزینه آماده سازی به هزینه نهایی گیفت کارت در صورت انتخاب کسر از موجودی تومان اضافه شده است.
                                </Alert> : ''}
                                {giftcardData?.deliveryTypes?.length > 0 && giftcardData?.deliveryTypes?.includes("POSTAL") && formData?.isPostDelivery ? <Alert
                                    severity="info"
                                    variant="filled"
                                    color="info"
                                    className="custom-alert error"
                                >
                                    هزینه ارسال به هزینه نهایی گیفت کارت در صورت انتخاب تحویل به صورت پستی اضافه شده است.
                                </Alert> : ''}
                                <div className="flex items-center justify-between gap-x-4 text-sm dark:text-white">
                                    <span>وزن:</span>
                                    <span className="text-base font-medium">{(giftcardData?.weight || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} گرم</span>
                                </div>
                                <div className="flex items-center justify-between gap-x-4 text-sm dark:text-white">
                                    <span>معادل تومانی:</span>
                                    <span className="text-base font-medium">{((((giftcardData?.weight || 0) * (productAmount || 1)) * (priceInfo[0]?.buyPrice || 0))).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                </div>
                                <div className="flex items-center justify-between gap-x-4 text-sm dark:text-white">
                                    <span>تعداد:</span>
                                    <span className="text-base font-medium">{(productAmount || 1).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex items-center justify-between gap-x-4 text-sm dark:text-white">
                                    <span>هزینه آماده سازی:</span>
                                    <span className="text-base font-medium">{(giftcardData?.preparationCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                </div>
                                <div className="flex items-center justify-between gap-x-4 text-sm dark:text-white">
                                    <span>هزینه نهایی:</span>
                                    <span className="text-base font-medium">
                                        {formData?.buyWithToman ? `${(((((giftcardData?.weight || 0) * (productAmount || 1)) * (priceInfo[0]?.buyPrice || 0)) + (giftcardData?.preparationCost || 0)) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` :
                                            `${((giftcardData?.weight || 0) * (productAmount || 1)).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم + ${((giftcardData?.preparationCost || 0) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان`}
                                    </span>
                                </div>
                                <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                                <div className="w-full flex items-center justify-between gap-x-4 font-bold mb-2 dark:text-white">
                                    <span>اطلاعات ارسال</span>
                                    {formData?.isPersonDelivery || formData?.isPostDelivery ? '' : <Chip label="گیفت کارت دیجیتالی" variant="outlined" size="small" className="w-fit badge badge-success px-2" />}
                                </div>
                                {formData?.isPersonDelivery ? <Alert
                                    severity="info"
                                    variant="filled"
                                    color="warning"
                                    className="custom-alert auth warning !items-start -mt-2"
                                >
                                    <div className="flex flex-col gap-y-4 w-full text-black dark:text-alert-warning-foreground">
                                        {branchTime && branch ?
                                            <>
                                                <span>
                                                    {branch?.nameFa} - آدرس: <span className="whitespace-break-spaces">{branch?.address}</span> <br />
                                                    شماره تماس شعبه: <PatternFormat displayType="text" value={branch?.phone} format="#### ### ## ##" dir="ltr" />
                                                </span>
                                                <span>
                                                    زمان مراجعه: {moment(branchTime?.startTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')} الی {moment(branchTime?.endTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')}
                                                </span>
                                            </> : ''}
                                    </div>
                                </Alert> : ''}
                                {formData?.isPostDelivery ? <>
                                    <div className="flex items-center justify-between gap-x-4 text-sm -mt-2 dark:text-white">
                                        <span>هزینه ارسال:</span>
                                        <span className="text-base font-medium">{(giftcardData?.shippingCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                    </div>
                                    <Alert
                                        severity="info"
                                        variant="filled"
                                        color="warning"
                                        className="custom-alert auth warning !items-start -mt-2"
                                    >
                                        <div className="flex flex-col gap-y-4 w-full text-black dark:text-alert-warning-foreground">
                                            <span>
                                                کد پستی: {formData?.postalCode} <br />
                                            </span>
                                            <span>
                                                آدرس: <span className="whitespace-break-spaces">{formData?.address}</span>
                                            </span>
                                        </div>
                                    </Alert>
                                </> : ''}
                            </div>
                            <Divider component="div" className="w-full mb-4 dark:bg-primary dark:bg-opacity-50" />
                            <div className="w-full flex items-center justify-end gap-x-2">
                                <Button type="button" variant="text" size="medium" className="text-black dark:text-white rounded-lg" disableElevation
                                    onClick={() => handleCloseFactor()}>
                                    <span className="mx-2">بازگشت</span>
                                </Button >
                                <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loadingOrderRequest}>
                                    <text className={`font-semibold text-black`}>درخواست</text>
                                </LoadingButton>
                            </div>
                        </form> :
                        <form key={2} className="flex flex-col gap-y-2" noValidate autoComplete="off">
                            <Divider component="div" className="w-full mb-4 dark:bg-primary dark:bg-opacity-50" />
                            <div className="w-full text-start flex flex-col gap-y-4">
                                <div className="w-full h-10 base-NumberInput-root flex items-center gap-x-1 rounded-2xl border border-solid border-primary py-1.5">
                                    <IconButton className="base-NumberInput decrement ms-2 h-full flex-[1] flex items-center justify-center p-0.5 bg-transparent border-none text-primary rounded-2xl *:text-xl"
                                        onClick={handleNumberInputBtn('decrement')}>
                                        <RemoveIcon />
                                    </IconButton>
                                    <input type="number" min="1" max="10" autocomplete="off" autocorrect="off" spellcheck="false"
                                        className="flex-[1] bg-transparent border-none dark:text-white !outline-none text-center"
                                        value={productAmount} onChange={handleChangeAmount} />
                                    <IconButton className="base-NumberInput increment me-2 h-full flex-[1] flex items-center justify-center p-0.5 bg-transparent border-none text-primary rounded-2xl *:text-xl"
                                        onClick={handleNumberInputBtn('increment')}>
                                        <AddIcon />
                                    </IconButton>
                                </div>
                                <div className="w-full flex items-center">
                                    <FormGroup className="w-full ltr">
                                        <FormControlLabel
                                            className="justify-between text-end m-0"
                                            control={<CustomSwitch
                                                checked={formData.buyWithToman}
                                                onChange={(event) => {
                                                    setFormData({ ...formData, buyWithToman: event.target.checked });
                                                }}
                                            />}
                                            label={`کسر از موجودی تومان ؟`} />
                                    </FormGroup>
                                </div>
                                {giftcardData?.deliveryTypes?.length > 0 ?
                                    <>
                                        {giftcardData?.deliveryTypes?.includes("POSTAL") ? <div className="w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between text-end m-0"
                                                    control={<CustomSwitch
                                                        checked={formData.isPostDelivery}
                                                        onChange={(event) => {
                                                            if (event.target.checked) {
                                                                setFormData({ ...formData, isPersonDelivery: false, isPostDelivery: event.target.checked });
                                                                setValue('isPostDelivery', event.target.checked);
                                                            } else {
                                                                setFormData({ ...formData, isPersonDelivery: false, isPostDelivery: event.target.checked });
                                                                setValue('isPostDelivery', false);
                                                            }

                                                        }}
                                                    />}
                                                    label={`تحویل به صورت پستی ؟`} />
                                            </FormGroup>
                                        </div> : ''}
                                        {giftcardData?.deliveryTypes?.includes("IN_PERSON") ? <div className="w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between text-end m-0"
                                                    control={<CustomSwitch
                                                        checked={formData.isPersonDelivery}
                                                        onChange={(event) => {
                                                            setBranch(null);
                                                            setBranchTime(null);
                                                            if (event.target.checked) {
                                                                getBranches();
                                                                setFormData({ ...formData, isPostDelivery: false, isPersonDelivery: event.target.checked });
                                                            } else {
                                                                setFormData({ ...formData, isPostDelivery: false, isPersonDelivery: event.target.checked });
                                                            }
                                                            setValue('isPostDelivery', false);
                                                        }}
                                                    />}
                                                    label={`تحویل حضوری در شعبه ؟`} />
                                            </FormGroup>
                                        </div> : ''}
                                    </> : ''}
                                {formData?.isPostDelivery ? <>
                                    <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                        <span>هزینه ارسال:</span>
                                        <span>{(giftcardData?.shippingCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                    </div>
                                    <FormControl className="w-full">
                                        <Controller
                                            name="postalCode"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    type="tel"
                                                    label="کد پستی"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    }}
                                                    error={!!errors.postalCode}
                                                    helperText={errors.postalCode ? errors.postalCode.message : ''}
                                                    onChange={async (event) => {
                                                        field.onChange(event);
                                                        await trigger('postalCode');
                                                        setFormData({ ...formData, postalCode: event.target.value });
                                                    }}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                    <FormControl className="w-full">
                                        <Controller
                                            name="address"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    type="text"
                                                    multiline
                                                    rows={4}
                                                    label="آدرس"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    }}
                                                    error={!!errors.address}
                                                    helperText={errors.address ? errors.address.message : ''}
                                                    onChange={async (event) => {
                                                        field.onChange(event);
                                                        await trigger('address');
                                                        setFormData({ ...formData, address: event.target.value });
                                                    }}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                </> : ''}
                                {formData?.isPersonDelivery ? <>
                                    <FormControl className={`${loadingBranches ? 'pointer-events-none' : ''}`}>
                                        <InputLabel id="demo-simple-select-label"
                                            sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب شعبه دریافت</InputLabel>
                                        {loadingBranches ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} className="absolute top-[33%] rtl:left-[10px] ltr:right-[10px] z-10 translate-y-1/2" /> : ''}
                                        <MUISelect
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            onChange={(event) => handleSelectBranch(event.target.value)}
                                            input={<OutlinedInput
                                                id="select-multiple-chip"
                                                label="انتخاب شعبه دریافت"
                                                className="dark:bg-dark *:dark:text-white"
                                                sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                            />}
                                            renderValue={(selected) => (
                                                <div className="flex flex-wrap gap-0.5">
                                                    <span className="truncate">{selected?.nameFa} - {selected?.address}</span>
                                                </div>
                                            )}
                                            MenuProps={{ classes: { paper: 'w-full lg:w-[30%] 3xl:w-[24%] dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                            {branches?.map((data, index) => (
                                                <MenuItem key={index} value={data}><span className="whitespace-break-spaces">{data.nameFa} - {data.address}</span></MenuItem>
                                            ))}
                                        </MUISelect>
                                    </FormControl>
                                    {branch ?
                                        <>
                                            <div className="flex flex-col gap-y-3">
                                                <label>انتخاب روز دریافت</label>
                                                <div className="flex items-center gap-x-2 overflow-x-auto overflow-y-hidden pb-2 rtl:pl-2">
                                                    {weekDays?.map((data, index) => (
                                                        <div key={index} className="flex-[1]">
                                                            <input type="radio" name="date" id={index} className="hidden peer" checked={selectedDate?.isSame(data.date, "day") ? true : false} onChange={handleSelectDay(data.date)} />
                                                            <label htmlFor={index} className="transition cursor-pointer flex flex-col items-center gap-y-2 rounded-lg text-black text-opacity-70 dark:text-white 
                                    border border-light-secondary-foreground border-solid dark:border-dark-secondary py-1.5 px-4 peer-checked:bg-primary peer-checked:bg-opacity-5 peer-checked:border-primary">
                                                                <span className="text-xs font-extrabold">{data.dayName}</span>
                                                                <span className="text-xs font-extrabold">{data.formattedDate}</span>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {selectedDate && (
                                                <>
                                                    <div className="flex flex-col gap-y-3">
                                                        <label className="flex items-center justify-between gap-x-4">انتخاب زمان دریافت
                                                            {loadingTimeBranches ? <div className="flex justify-center items-center"><CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} /></div> : ''}
                                                        </label>
                                                        {timeBranches?.length > 0 ? (
                                                            <ul className={`flex items-center gap-x-2 list-none rtl:pr-0 m-0 ${loadingTimeBranches ? 'invisible' : ''}`}>
                                                                {timeBranches?.map((data, index) => (
                                                                    <li key={index} className="w-fit">
                                                                        <input type="radio" name="time" id={data._id} className="hidden peer" checked={data._id == branchTime?._id ? true : false} onChange={data.capacity > 0 ? (event) => setBranchTime(data) : () => false} />
                                                                        <label htmlFor={data._id} className={`${data.capacity > 0 ? 'cursor-pointer' : 'text-black text-opacity-30 cursor-default dark:text-white dark:text-opacity-30'} transition flex flex-col items-center gap-y-2 rounded-lg 
                                                        border border-light-secondary-foreground border-solid dark:border-dark-secondary py-1.5 px-4 peer-checked:bg-primary peer-checked:bg-opacity-5 peer-checked:border-primary`}>
                                                                            <span className="text-xs font-extrabold">{moment(data.startTime).format("HH:mm")}</span>
                                                                            <span className="text-xs font-extrabold">الی</span>
                                                                            <span className="text-xs font-extrabold">{moment(data.endTime).format("HH:mm")}</span>
                                                                        </label>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className={`text-center py-3 ${loadingTimeBranches ? 'invisible' : ''}`}>در تاریخ انتخابی زمانی برای تحویل وجود ندارد.</p>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </> : ''}
                                </> : ''}
                            </div>
                            <Divider component="div" className="w-full mb-4 dark:bg-primary dark:bg-opacity-50" />
                            <div className="w-full flex items-center justify-between gap-x-8">
                                {formData?.buyWithToman ? ((((((giftcardData?.weight || 0) * (productAmount || 1)) * (priceInfo[0]?.buyPrice || 0)) + (giftcardData?.preparationCost || 0)) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)) <= (userInfo?.tomanBalance || 0)) ? <LoadingButton type="button" variant="outlined" size="medium" className="rounded-lg px-10" disableElevation
                                    disabled={formData?.isPersonDelivery && !branchTime} onClick={formData?.isPersonDelivery && !branchTime ? () => false : handleShowFactor}>
                                    <span className={`${formData?.isPersonDelivery && !branchTime ? 'text-white text-opacity-50 !visible' : 'text-primary'}`}>ادامه</span>
                                </LoadingButton> : <Button type="button" variant="outlined" size="medium" color="error" className="rounded-lg *:text-primary-red px-10" disableElevation
                                    onClick={() => {
                                        router.push(`/panel/deposit?type=online&amount=${((((((giftcardData?.weight || 0) * (productAmount || 1)) * (priceInfo[0]?.buyPrice || 0)) + (giftcardData?.preparationCost || 0)) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)) - (userInfo?.tomanBalance || 0))}`,
                                            `/panel/deposit?type=online&amount=${((((((giftcardData?.weight || 0) * (productAmount || 1)) * (priceInfo[0]?.buyPrice || 0)) + (giftcardData?.preparationCost || 0)) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)) - (userInfo?.tomanBalance || 0))}`, { locale });
                                    }}>
                                    <span>افزایش موجودی</span>
                                </Button> : (((giftcardData?.weight || 0) * (productAmount || 1)) <= (priceInfo?.find(item => item.tradeable?._id == giftcardData?.tradeable?._id)?.balance || 0)) ? <LoadingButton type="button" variant="outlined" size="medium" className="rounded-lg px-10" disableElevation
                                    disabled={formData?.isPersonDelivery && !branchTime} onClick={formData?.isPersonDelivery && !branchTime ? () => false : handleShowFactor}>
                                    <span className={`${formData?.isPersonDelivery && !branchTime ? 'text-white text-opacity-50 !visible' : 'text-primary'}`}>ادامه</span>
                                </LoadingButton> : <Button type="button" variant="outlined" size="medium" color="error" className="rounded-lg *:text-primary-red px-10" disableElevation
                                    onClick={() => {
                                        router.push('/panel/trade?type=buy', '/panel/trade?type=buy', { locale });
                                    }}>
                                    <span>خرید طلا</span>
                                </Button>}
                                {formData?.buyWithToman ? ((((((giftcardData?.weight || 0) * (productAmount || 1)) * (priceInfo[0]?.buyPrice || 0)) + (giftcardData?.preparationCost || 0)) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)) <= (userInfo?.tomanBalance || 0)) ? <div className="flex flex-col items-end gap-y-2 text-sm dark:text-white">
                                    <span>هزینه نهایی گیفت کارت:</span>
                                    <span>
                                        {formData?.buyWithToman ? `${(((((giftcardData?.weight || 0) * (productAmount || 1)) * (priceInfo[0]?.buyPrice || 0)) + (giftcardData?.preparationCost || 0)) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` :
                                            `${((giftcardData?.weight || 0) * (productAmount || 1)).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم + ${((giftcardData?.preparationCost || 0) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان`}
                                    </span>
                                </div> : <div className="flex flex-col items-end gap-y-2 text-sm text-sell">
                                    <span>موجودی کافی نمی باشد</span>
                                    <span className="font-medium">موجودی: &nbsp;
                                        {(userInfo?.tomanBalance || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان
                                    </span>
                                </div> : (((giftcardData?.weight || 0) * (productAmount || 1)) <= (priceInfo?.find(item => item.tradeable?._id == giftcardData?.tradeable?._id)?.balance || 0)) ? <div className="flex flex-col items-end gap-y-2 text-sm dark:text-white">
                                    <span>هزینه نهایی گیفت کارت:</span>
                                    <span>
                                        {formData?.buyWithToman ? `${(((((giftcardData?.weight || 0) * (productAmount || 1)) * (priceInfo[0]?.buyPrice || 0)) + (giftcardData?.preparationCost || 0)) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` :
                                            `${((giftcardData?.weight || 0) * (productAmount || 1)).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم + ${((giftcardData?.preparationCost || 0) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان`}
                                    </span>
                                </div> : <div className="flex flex-col items-end gap-y-2 text-sm text-sell">
                                    <span>موجودی کافی نمی باشد</span>
                                    <span className="font-medium">موجودی: &nbsp;
                                        {(priceInfo?.find(item => item.tradeable?._id == giftcardData?.tradeable?._id)?.balance || 0)} گرم
                                    </span>
                                </div>}
                            </div>
                        </form>}
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomGiftcardOrderDrawer}
                    onClose={() => { setOpenBottomGiftcardOrderDrawer(false); handleCloseFactor(); setValue('isPostDelivery', false); clearErrors(); setFormData({ buyWithToman: false, address: '', postalCode: '', isPostDelivery: false, isPersonDelivery: false }); setBranch(null); setBranchTime(null); }}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6 mb-4">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">
                            <div className="h-full flex items-center gap-x-4">
                                <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${giftcardData?.tradeable?.image}`} alt={giftcardData?.tradeable?.name}
                                    className="rounded-xl object-contain w-10 h-10" loading="lazy" />
                                <span className="text-sm font-bold">گیفت کارت {giftcardData?.tradeable?.nameFa} {giftcardData?.weight} گرمی</span>
                            </div>
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => { setOpenBottomGiftcardOrderDrawer(false); handleCloseFactor(); setValue('isPostDelivery', false); clearErrors(); setFormData({ buyWithToman: false, address: '', postalCode: '', isPostDelivery: false, isPersonDelivery: false }); setBranch(null); setBranchTime(null); }}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                        {showFactor ?
                            <form key={1} className="flex flex-col gap-y-2" noValidate autoComplete="off" onSubmit={handleSubmit(submitGiftcardOrder)}>
                                <div className="w-full text-start flex flex-col gap-y-4">
                                    {formData?.buyWithToman ? <Alert
                                        severity="info"
                                        variant="filled"
                                        color="info"
                                        className="custom-alert info">
                                        هزینه آماده سازی به هزینه نهایی گیفت کارت در صورت انتخاب کسر از موجودی تومان اضافه شده است.
                                    </Alert> : ''}
                                    {giftcardData?.deliveryTypes?.length > 0 && giftcardData?.deliveryTypes?.includes("POSTAL") && formData?.isPostDelivery ? <Alert
                                        severity="info"
                                        variant="filled"
                                        color="info"
                                        className="custom-alert error"
                                    >
                                        هزینه ارسال به هزینه نهایی گیفت کارت در صورت انتخاب تحویل به صورت پستی اضافه شده است.
                                    </Alert> : ''}
                                    <div className="flex items-center justify-between gap-x-4 text-sm dark:text-white">
                                        <span>وزن:</span>
                                        <span className="text-base font-medium">{(giftcardData?.weight || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} گرم</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-x-4 text-sm dark:text-white">
                                        <span>معادل تومانی:</span>
                                        <span className="text-base font-medium">{((((giftcardData?.weight || 0) * (productAmount || 1)) * (priceInfo[0]?.buyPrice || 0))).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-x-4 text-sm dark:text-white">
                                        <span>تعداد:</span>
                                        <span className="text-base font-medium">{(productAmount || 1).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-x-4 text-sm dark:text-white">
                                        <span>هزینه آماده سازی:</span>
                                        <span className="text-base font-medium">{(giftcardData?.preparationCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-x-4 text-sm dark:text-white">
                                        <span>هزینه نهایی:</span>
                                        <span className="text-base font-medium">
                                            {formData?.buyWithToman ? `${(((((giftcardData?.weight || 0) * (productAmount || 1)) * (priceInfo[0]?.buyPrice || 0)) + (giftcardData?.preparationCost || 0)) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` :
                                                `${((giftcardData?.weight || 0) * (productAmount || 1)).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم + ${((giftcardData?.preparationCost || 0) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان`}
                                        </span>
                                    </div>
                                    <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                                    <div className="w-full flex items-center justify-between gap-x-4 font-bold mb-2 dark:text-white">
                                        <span>اطلاعات ارسال</span>
                                        {formData?.isPersonDelivery || formData?.isPostDelivery ? '' : <Chip label="گیفت کارت دیجیتالی" variant="outlined" size="small" className="w-fit badge badge-success px-2" />}
                                    </div>
                                    {formData?.isPersonDelivery ? <Alert
                                        severity="info"
                                        variant="filled"
                                        color="warning"
                                        className="custom-alert auth warning !items-start -mt-2"
                                    >
                                        <div className="flex flex-col gap-y-4 w-full text-black dark:text-alert-warning-foreground">
                                            {branchTime && branch ?
                                                <>
                                                    <span>
                                                        {branch?.nameFa} - آدرس: <span className="whitespace-break-spaces">{branch?.address}</span> <br />
                                                        شماره تماس شعبه: <PatternFormat displayType="text" value={branch?.phone} format="#### ### ## ##" dir="ltr" />
                                                    </span>
                                                    <span>
                                                        زمان مراجعه: {moment(branchTime?.startTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')} الی {moment(branchTime?.endTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')}
                                                    </span>
                                                </> : ''}
                                        </div>
                                    </Alert> : ''}
                                    {formData?.isPostDelivery ? <>
                                        <div className="flex items-center justify-between gap-x-4 text-sm -mt-2 dark:text-white">
                                            <span>هزینه ارسال:</span>
                                            <span className="text-base font-medium">{(giftcardData?.shippingCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                        </div>
                                        <Alert
                                            severity="info"
                                            variant="filled"
                                            color="warning"
                                            className="custom-alert auth warning !items-start -mt-2"
                                        >
                                            <div className="flex flex-col gap-y-4 w-full text-black dark:text-alert-warning-foreground">
                                                <span>
                                                    کد پستی: {formData?.postalCode} <br />
                                                </span>
                                                <span>
                                                    آدرس: <span className="whitespace-break-spaces">{formData?.address}</span>
                                                </span>
                                            </div>
                                        </Alert>
                                    </> : ''}
                                </div>
                                <Divider component="div" className="w-full mb-4 dark:bg-primary dark:bg-opacity-50" />
                                <div className="w-full flex items-center justify-end gap-x-2">
                                    <Button type="button" variant="text" size="medium" className="text-black dark:text-white rounded-lg" disableElevation
                                        onClick={() => handleCloseFactor()}>
                                        <span className="mx-2">بازگشت</span>
                                    </Button >
                                    <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loadingOrderRequest}>
                                        <text className={`font-semibold text-black`}>درخواست</text>
                                    </LoadingButton>
                                </div>
                            </form> :
                            <form key={2} className="flex flex-col gap-y-2" noValidate autoComplete="off">
                                <div className="w-full text-start flex flex-col gap-y-4">
                                    <div className="w-full h-10 base-NumberInput-root flex items-center gap-x-1 rounded-2xl border border-solid border-primary py-1.5">
                                        <IconButton className="base-NumberInput decrement ms-2 h-full flex-[1] flex items-center justify-center p-0.5 bg-transparent border-none text-primary rounded-2xl *:text-xl"
                                            onClick={handleNumberInputBtn('decrement')}>
                                            <RemoveIcon />
                                        </IconButton>
                                        <input type="number" min="1" max="10" autocomplete="off" autocorrect="off" spellcheck="false"
                                            className="flex-[1] bg-transparent border-none dark:text-white !outline-none text-center"
                                            value={productAmount} onChange={handleChangeAmount} />
                                        <IconButton className="base-NumberInput increment me-2 h-full flex-[1] flex items-center justify-center p-0.5 bg-transparent border-none text-primary rounded-2xl *:text-xl"
                                            onClick={handleNumberInputBtn('increment')}>
                                            <AddIcon />
                                        </IconButton>
                                    </div>
                                    <div className="w-full flex items-center">
                                        <FormGroup className="w-full ltr">
                                            <FormControlLabel
                                                className="justify-between text-end m-0"
                                                control={<CustomSwitch
                                                    checked={formData.buyWithToman}
                                                    onChange={(event) => {
                                                        setFormData({ ...formData, buyWithToman: event.target.checked });
                                                    }}
                                                />}
                                                label={`کسر از موجودی تومان ؟`} />
                                        </FormGroup>
                                    </div>
                                    {giftcardData?.deliveryTypes?.length > 0 ?
                                        <>
                                            {giftcardData?.deliveryTypes?.includes("POSTAL") ? <div className="w-full flex items-center">
                                                <FormGroup className="w-full ltr">
                                                    <FormControlLabel
                                                        className="justify-between text-end m-0"
                                                        control={<CustomSwitch
                                                            checked={formData.isPostDelivery}
                                                            onChange={(event) => {
                                                                if (event.target.checked) {
                                                                    setFormData({ ...formData, isPersonDelivery: false, isPostDelivery: event.target.checked });
                                                                    setValue('isPostDelivery', event.target.checked);
                                                                } else {
                                                                    setFormData({ ...formData, isPersonDelivery: false, isPostDelivery: event.target.checked });
                                                                    setValue('isPostDelivery', false);
                                                                }

                                                            }}
                                                        />}
                                                        label={`تحویل به صورت پستی ؟`} />
                                                </FormGroup>
                                            </div> : ''}
                                            {giftcardData?.deliveryTypes?.includes("IN_PERSON") ? <div className="w-full flex items-center">
                                                <FormGroup className="w-full ltr">
                                                    <FormControlLabel
                                                        className="justify-between text-end m-0"
                                                        control={<CustomSwitch
                                                            checked={formData.isPersonDelivery}
                                                            onChange={(event) => {
                                                                setBranch(null);
                                                                setBranchTime(null);
                                                                if (event.target.checked) {
                                                                    getBranches();
                                                                    setFormData({ ...formData, isPostDelivery: false, isPersonDelivery: event.target.checked });
                                                                } else {
                                                                    setFormData({ ...formData, isPostDelivery: false, isPersonDelivery: event.target.checked });
                                                                }
                                                                setValue('isPostDelivery', false);
                                                            }}
                                                        />}
                                                        label={`تحویل حضوری در شعبه ؟`} />
                                                </FormGroup>
                                            </div> : ''}
                                        </> : ''}
                                    {formData?.isPostDelivery ? <>
                                        <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                            <span>هزینه ارسال:</span>
                                            <span>{(giftcardData?.shippingCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                        </div>
                                        <FormControl className="w-full">
                                            <Controller
                                                name="postalCode"
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        type="tel"
                                                        label="کد پستی"
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        error={!!errors.postalCode}
                                                        helperText={errors.postalCode ? errors.postalCode.message : ''}
                                                        onChange={async (event) => {
                                                            field.onChange(event);
                                                            await trigger('postalCode');
                                                            setFormData({ ...formData, postalCode: event.target.value });
                                                        }}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                        <FormControl className="w-full">
                                            <Controller
                                                name="address"
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        type="text"
                                                        multiline
                                                        rows={4}
                                                        label="آدرس"
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        error={!!errors.address}
                                                        helperText={errors.address ? errors.address.message : ''}
                                                        onChange={async (event) => {
                                                            field.onChange(event);
                                                            await trigger('address');
                                                            setFormData({ ...formData, address: event.target.value });
                                                        }}
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                    </> : ''}
                                    {formData?.isPersonDelivery ? <>
                                        <FormControl className={`${loadingBranches ? 'pointer-events-none' : ''}`}>
                                            <InputLabel id="demo-simple-select-label"
                                                sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب شعبه دریافت</InputLabel>
                                            {loadingBranches ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} className="absolute top-[33%] rtl:left-[10px] ltr:right-[10px] z-10 translate-y-1/2" /> : ''}
                                            <MUISelect
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                onChange={(event) => handleSelectBranch(event.target.value)}
                                                input={<OutlinedInput
                                                    id="select-multiple-chip"
                                                    label="انتخاب شعبه دریافت"
                                                    className="dark:bg-dark *:dark:text-white"
                                                    sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                                />}
                                                renderValue={(selected) => (
                                                    <div className="flex flex-wrap gap-0.5">
                                                        <span className="truncate">{selected?.nameFa} - {selected?.address}</span>
                                                    </div>
                                                )}
                                                MenuProps={{ classes: { paper: 'w-full lg:w-[30%] 3xl:w-[24%] dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                                {branches?.map((data, index) => (
                                                    <MenuItem key={index} value={data}><span className="whitespace-break-spaces">{data.nameFa} - {data.address}</span></MenuItem>
                                                ))}
                                            </MUISelect>
                                        </FormControl>
                                        {branch ?
                                            <>
                                                <div className="flex flex-col gap-y-3">
                                                    <label>انتخاب روز دریافت</label>
                                                    <div className="flex items-center gap-x-2 overflow-x-auto overflow-y-hidden pb-2 rtl:pl-2">
                                                        {weekDays?.map((data, index) => (
                                                            <div key={index} className="flex-[1]">
                                                                <input type="radio" name="date" id={index} className="hidden peer" checked={selectedDate?.isSame(data.date, "day") ? true : false} onChange={handleSelectDay(data.date)} />
                                                                <label htmlFor={index} className="transition cursor-pointer flex flex-col items-center gap-y-2 rounded-lg text-black text-opacity-70 dark:text-white 
                                    border border-light-secondary-foreground border-solid dark:border-dark-secondary py-1.5 px-4 peer-checked:bg-primary peer-checked:bg-opacity-5 peer-checked:border-primary">
                                                                    <span className="text-xs font-extrabold">{data.dayName}</span>
                                                                    <span className="text-xs font-extrabold">{data.formattedDate}</span>
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {selectedDate && (
                                                    <>
                                                        <div className="flex flex-col gap-y-3">
                                                            <label className="flex items-center justify-between gap-x-4">انتخاب زمان دریافت
                                                                {loadingTimeBranches ? <div className="flex justify-center items-center"><CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} /></div> : ''}
                                                            </label>
                                                            {timeBranches?.length > 0 ? (
                                                                <ul className={`flex items-center gap-x-2 list-none rtl:pr-0 m-0 ${loadingTimeBranches ? 'invisible' : ''}`}>
                                                                    {timeBranches?.map((data, index) => (
                                                                        <li key={index} className="w-fit">
                                                                            <input type="radio" name="time" id={data._id} className="hidden peer" checked={data._id == branchTime?._id ? true : false} onChange={data.capacity > 0 ? (event) => setBranchTime(data) : () => false} />
                                                                            <label htmlFor={data._id} className={`${data.capacity > 0 ? 'cursor-pointer' : 'text-black text-opacity-30 cursor-default dark:text-white dark:text-opacity-30'} transition flex flex-col items-center gap-y-2 rounded-lg 
                                                        border border-light-secondary-foreground border-solid dark:border-dark-secondary py-1.5 px-4 peer-checked:bg-primary peer-checked:bg-opacity-5 peer-checked:border-primary`}>
                                                                                <span className="text-xs font-extrabold">{moment(data.startTime).format("HH:mm")}</span>
                                                                                <span className="text-xs font-extrabold">الی</span>
                                                                                <span className="text-xs font-extrabold">{moment(data.endTime).format("HH:mm")}</span>
                                                                            </label>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <p className={`text-center py-3 ${loadingTimeBranches ? 'invisible' : ''}`}>در تاریخ انتخابی زمانی برای تحویل وجود ندارد.</p>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </> : ''}
                                    </> : ''}
                                </div>
                                <Divider component="div" className="w-full mb-4 dark:bg-primary dark:bg-opacity-50" />
                                <div className="w-full flex items-center justify-between gap-x-8">
                                    {formData?.buyWithToman ? ((((((giftcardData?.weight || 0) * (productAmount || 1)) * (priceInfo[0]?.buyPrice || 0)) + (giftcardData?.preparationCost || 0)) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)) <= (userInfo?.tomanBalance || 0)) ? <LoadingButton type="button" variant="outlined" size="medium" className="rounded-lg px-10" disableElevation
                                        disabled={formData?.isPersonDelivery && !branchTime} onClick={formData?.isPersonDelivery && !branchTime ? () => false : handleShowFactor}>
                                        <span className={`${formData?.isPersonDelivery && !branchTime ? 'text-white text-opacity-50 !visible' : 'text-primary'}`}>ادامه</span>
                                    </LoadingButton> : <Button type="button" variant="outlined" size="medium" color="error" className="rounded-lg *:text-primary-red px-10" disableElevation
                                        onClick={() => {
                                            router.push(`/panel/deposit?type=online&amount=${((((((giftcardData?.weight || 0) * (productAmount || 1)) * (priceInfo[0]?.buyPrice || 0)) + (giftcardData?.preparationCost || 0)) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)) - (userInfo?.tomanBalance || 0))}`,
                                                `/panel/deposit?type=online&amount=${((((((giftcardData?.weight || 0) * (productAmount || 1)) * (priceInfo[0]?.buyPrice || 0)) + (giftcardData?.preparationCost || 0)) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)) - (userInfo?.tomanBalance || 0))}`, { locale });
                                        }}>
                                        <span>افزایش موجودی</span>
                                    </Button> : (((giftcardData?.weight || 0) * (productAmount || 1)) <= (priceInfo?.find(item => item.tradeable?._id == giftcardData?.tradeable?._id)?.balance || 0)) ? <LoadingButton type="button" variant="outlined" size="medium" className="rounded-lg px-10" disableElevation
                                        disabled={formData?.isPersonDelivery && !branchTime} onClick={formData?.isPersonDelivery && !branchTime ? () => false : handleShowFactor}>
                                        <span className={`${formData?.isPersonDelivery && !branchTime ? 'text-white text-opacity-50 !visible' : 'text-primary'}`}>ادامه</span>
                                    </LoadingButton> : <Button type="button" variant="outlined" size="medium" color="error" className="rounded-lg *:text-primary-red px-10" disableElevation
                                        onClick={() => {
                                            router.push('/panel/trade?type=buy', '/panel/trade?type=buy', { locale });
                                        }}>
                                        <span>خرید طلا</span>
                                    </Button>}
                                    {formData?.buyWithToman ? ((((((giftcardData?.weight || 0) * (productAmount || 1)) * (priceInfo[0]?.buyPrice || 0)) + (giftcardData?.preparationCost || 0)) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)) <= (userInfo?.tomanBalance || 0)) ? <div className="flex flex-col items-end gap-y-2 text-sm dark:text-white">
                                        <span>هزینه نهایی گیفت کارت:</span>
                                        <span>
                                            {formData?.buyWithToman ? `${(((((giftcardData?.weight || 0) * (productAmount || 1)) * (priceInfo[0]?.buyPrice || 0)) + (giftcardData?.preparationCost || 0)) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` :
                                                `${((giftcardData?.weight || 0) * (productAmount || 1)).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم + ${((giftcardData?.preparationCost || 0) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان`}
                                        </span>
                                    </div> : <div className="flex flex-col items-end gap-y-2 text-sm text-sell">
                                        <span>موجودی کافی نمی باشد</span>
                                        <span className="font-medium">موجودی: &nbsp;
                                            {(userInfo?.tomanBalance || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان
                                        </span>
                                    </div> : (((giftcardData?.weight || 0) * (productAmount || 1)) <= (priceInfo?.find(item => item.tradeable?._id == giftcardData?.tradeable?._id)?.balance || 0)) ? <div className="flex flex-col items-end gap-y-2 text-sm dark:text-white">
                                        <span>هزینه نهایی گیفت کارت:</span>
                                        <span>
                                            {formData?.buyWithToman ? `${(((((giftcardData?.weight || 0) * (productAmount || 1)) * (priceInfo[0]?.buyPrice || 0)) + (giftcardData?.preparationCost || 0)) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` :
                                                `${((giftcardData?.weight || 0) * (productAmount || 1)).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم + ${((giftcardData?.preparationCost || 0) + (formData?.isPostDelivery ? giftcardData?.shippingCost || 0 : 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان`}
                                        </span>
                                    </div> : <div className="flex flex-col items-end gap-y-2 text-sm text-sell">
                                        <span>موجودی کافی نمی باشد</span>
                                        <span className="font-medium">موجودی: &nbsp;
                                            {(priceInfo?.find(item => item.tradeable?._id == giftcardData?.tradeable?._id)?.balance || 0)} گرم
                                        </span>
                                    </div>}
                                </div>
                            </form>}
                    </div>
                </SwipeableDrawer>
            </>

            {/* Reject Description */}
            <>
                <Dialog onClose={() => setShowReject(false)} open={showReject} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <Typography component={'h2'}>علت رد شدن درخواست</Typography>
                    <div className="flex flex-col gap-y-4 mt-6">
                        <FormControl>
                            <TextField
                                type="text"
                                multiline
                                rows={8}
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl cursor-default' : 'text-black rtl cursor-default', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                value={itemData?.confirmDescription} />
                        </FormControl>
                        <div className="flex items-center justify-end gap-x-2">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                onClick={() => setShowReject(false)}>
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
                    open={openBottomRejectDrawer}
                    onClose={() => setOpenBottomRejectDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <Typography component={'h2'}>علت رد شدن درخواست</Typography>
                    <div className="flex flex-col gap-y-4 mt-6">
                        <FormControl>
                            <TextField
                                type="text"
                                multiline
                                rows={8}
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl cursor-default' : 'text-black rtl cursor-default', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                value={itemData?.confirmDescription} />
                        </FormControl>
                        <Button type="button" variant="contained" size="medium" fullWidth className="rounded-lg" disableElevation
                            onClick={() => setOpenBottomRejectDrawer(false)}>
                            <text className="text-black font-semibold">بستن</text>
                        </Button >
                    </div>
                </SwipeableDrawer>
            </>
        </div>
    )
}

export default GiftcardsPageCompo;