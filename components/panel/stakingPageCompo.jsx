import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import LoadingButton from '@mui/lab/LoadingButton'
import CircularProgress from '@mui/material/CircularProgress'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Slider from '@mui/material/Slider'
import Dialog from '@mui/material/Dialog'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Tooltip from '@mui/material/Tooltip';
import Pagination from '@mui/material/Pagination';
import CancelIcon from '@mui/icons-material/CancelOutlined'
import Decimal from 'decimal.js';
import moment from 'jalali-moment'

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
import ConfirmDialog from '../shared/ConfirmDialog';

/**
 * StakingPageCompo component that displays the Staking Page Component of the website.
 * @returns The rendered Staking Page component.
 */
const StakingPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, priceInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();
    const [tabValue, setTabValue] = useState(0);
    const [addStaking, setAddStaking] = useState(
        {
            stakePlanId: '',
            amount: '',
        }
    )
    const validationSchema = Yup.object({
        stakePlanId: Yup.string().required('این فیلد الزامی است'),
        amount: Yup.string().required('این فیلد الزامی است')
    });

    const { control, setValue, trigger, handleSubmit, formState: { errors }, clearErrors } = useForm({
        resolver: yupResolver(validationSchema)
    });

    const clearForm = () => {
        setValue('stakePlanId', '');
        setValue('amount', '');
    }

    const [loading, setLoading] = useState(false);

    const handleChange = (event, newTabValue) => {
        setTabValue(newTabValue);
        setAddStaking({ ...addStaking, amount: '' });
        clearForm();
        clearErrors();
        if (newTabValue == 1) {
            getStakingsRequests(1);
        }
    }
    const [productTradeableBalance, setProductTradeableBalance] = useState(0);
    const [tradeableInfo, setTradeableInfo] = useState(null);
    const [firstInitialize, setFirstInitialize] = useState(true);

    /**
   * Calculates the slider value for Stake Amount.
   * @returns None
   */
    const [sliderValue, setSliderValue] = useState(0);
    const calcAmountSlider = async (event) => {
        const value = event.target.value;
        let size = (productTradeableBalance || 0) * (value / 100);

        size = floorNumber(size, (tradeableInfo?.tradeable?.buyMaxDecimals ?? 3));

        setSliderValue(value);

        if (value == 0) {
            setAddStaking({ ...addStaking, amount: '' });
            setValue('amount', '');
        } else {
            setAddStaking({ ...addStaking, amount: size });
            setValue('amount', size);
        }
    }

    useEffect(() => {
        if (priceInfo?.length > 0 && firstInitialize) {
            setTradeableInfo(priceInfo[0]);
            getStakings(priceInfo[0]?.tradeable);
        }
    }, [priceInfo]);

    /**
         * Retrieves Stakings list.
         * @returns None
        */
    const [stakings, setStakings] = useState([]);
    const [loadingStaking, setLoadingStaking] = useState(true);
    const getStakings = (tradeable) => {
        setLoadingStaking(true);
        ApiCall('/staking/plan', 'GET', locale, {}, ``, 'user', router).then(async (result) => {
            setFirstInitialize(false);
            const activeStakings = result.data?.filter(item => item.isActive && (item.tradeable?._id == tradeable?._id));
            setStakings(activeStakings);
            const balance = priceInfo?.filter(item => item.tradeable?.name == tradeable?.name);
            setProductTradeableBalance(floorNumber((balance?.length > 0 ? balance[0]?.balance || 0 : 0), (tradeable?.maxDecimals ?? 3)));
            setLoadingStaking(false);
        }).catch((error) => {
            setLoadingStaking(false);
            console.log(error);
        });
    }

    /**
   * Rounds a number down to a specified number of decimal places.
   * @param {number} number - The number to round down.
   * @param {number} decimal - The number of decimal places to round down to.
   * @returns {number} - The rounded down number.
   */
    const floorNumber = (number, decimal) => {
        return Number(Math.floor(number * 10 ** decimal) / 10 ** decimal);
    }

    const handleStake = () => {
        setLoading(true);
        ApiCall('/staking/stake', 'POST', locale, { stakePlanId: addStaking?.stakePlanId, amount: Number(addStaking?.amount) }, '', 'user', router).then(async (result) => {
            setLoading(false);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
            setTabValue(1);
            getStakingsRequests(1);
            setAddStaking({
                stakePlanId: '',
                amount: '',
            });
            clearForm();
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

    const TRADEABLES_TABLE_HEAD = [
        {
            label: 'نام واحد',
            classes: "lg:w-[130px] rtl:pl-0 ltr:pl-4 rtl:pr-4 ltr:pr-0"
        },
        {
            label: 'قیمت خرید',
            classes: ""
        },
        {
            label: 'قیمت فروش',
            classes: ""
        },
        {
            label: 'موجودی',
            classes: ""
        }
    ]

    const [showTradeables, setShowTradeables] = useState(false);
    const [openBottomTradeablesDrawer, setOpenBottomTradeablesDrawer] = useState(false);
    const handleOpenTradeables = (event) => {
        event.preventDefault();
        if (window.innerWidth >= 1024) {
            setShowTradeables(true);
            setOpenBottomTradeablesDrawer(false);
        } else {
            setShowTradeables(false);
            setOpenBottomTradeablesDrawer(true);
        }
    }

    const changeTradeable = (tradeable) => (event) => {
        event.preventDefault();
        if (tradeableInfo?.tradeable?.name != tradeable?.tradeable?.name) {
            setTradeableInfo(tradeable);
            clearErrors();
            clearForm();
            setTradeableInfo(tradeable);
            getStakings(tradeable?.tradeable);
        }
        setShowTradeables(false);
        setOpenBottomTradeablesDrawer(false);
    }

    /**
             * Retrieves Stakings Requests list.
             * @returns None
            */
    const [stakingsRequests, setStakingsRequests] = useState([]);
    const [loadingStakingsRequests, setLoadingStakingsRequests] = useState(true);
    const [stakingsRequestsLimit, setStakingsRequestsLimit] = useState(10);
    const [stakingsRequestsTotal, setStakingsRequestsTotal] = useState(0);
    const [pageItem, setPageItem] = useState(1);
    const getStakingsRequests = (page) => {
        setLoadingStakingsRequests(true);
        ApiCall('/staking/stake', 'GET', locale, {}, `sortOrder=0&sortBy=createdAt&limit=${stakingsRequestsLimit}&skip=${(page * stakingsRequestsLimit) - stakingsRequestsLimit}`, 'user', router).then(async (result) => {
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

    const [openDialog, setOpenDialog] = useState(false);
    const [stakeId, setStakeId] = useState('');

    const handleOpenDialog = (stakeId) => (event) => {
        event.stopPropagation();
        setStakeId(stakeId);
        setOpenDialog(true);
    }
    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    /**
        * Cancel a Request.
        * @returns None
       */
    const [cancelLoading, setCancelLoading] = useState(false);
    const cancelRequest = () => {
        setCancelLoading(true);
        ApiCall(`/staking/stake/${stakeId}/cancel`, 'PATCH', locale, {}, '', 'user', router).then(async (result) => {
            setCancelLoading(false);
            getStakingsRequests(pageItem);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
            handleCloseDialog();
        }).catch((error) => {
            setCancelLoading(false);
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

    const [itemData, setItemData] = useState('');
    const [showDescription, setShowDescription] = useState(false);
    const [openBottomDescriptionDrawer, setOpenBottomDescriptionDrawer] = useState(false);
    const handleShowDescription = (data) => (event) => {
        event.stopPropagation();
        setItemData(data);
        if (window.innerWidth >= 1024) {
            setShowDescription(true);
            setOpenBottomDescriptionDrawer(false);
        } else {
            setShowDescription(false);
            setOpenBottomDescriptionDrawer(true);
        }
    }

    return (
        <>
            <div className="xl:max-w-[40rem] mx-auto">
                <form className="flex flex-col gap-y-4" noValidate autoComplete="off" onSubmit={tabValue == 0 ? handleSubmit(handleStake) : () => { }}>
                    <Tabs variant="fullWidth" indicatorColor="primary" textColor="inherit" className="rounded-t-2xl mb-4 lg:w-fit"
                        value={tabValue}
                        onChange={handleChange}>
                        <Tab label="سپرده ها" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} />
                        <Tab label="درخواست ها" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} />
                    </Tabs>
                    {tabValue == 0 ? <div key={0} className="custom-card flex flex-col gap-y-4 rounded-2xl py-8 px-3">
                        <div className="form-group flex flex-col gap-y-2">
                            <label htmlFor="tradeables" className="form-label">انتخاب واحد</label>
                            <TextField type="text" id="tradeables" className="form-input rounded-2xl"
                                InputProps={{
                                    classes: { root: 'rtl:pr-0 ltr:pl-0 dark:bg-dark cursor-pointer rounded-2xl', input: darkModeToggle ? 'text-white cursor-pointer' : 'text-black cursor-pointer', focused: 'border-none' },
                                    autoComplete: "false",
                                    readOnly: true,
                                    startAdornment: <div className="w-9 h-[1.71875rem] flex items-center justify-center rounded-[50%] bg-primary-gray dark:bg-white dark:bg-opacity-10 mx-2">
                                        {tradeableInfo ? <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${tradeableInfo?.tradeable?.image}`} alt={tradeableInfo?.tradeable?.name}
                                            className="w-4 h-4 rounded-[50%]" /> : ''}
                                    </div>,
                                    endAdornment: <svg className="w-9 h-9 dark:!fill-white" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"></path></svg>
                                }}
                                value={locale == 'fa' ? `${tradeableInfo?.tradeable?.nameFa || ''}` : `${tradeableInfo?.tradeable?.name || ''}`}
                                onClick={handleOpenTradeables} />
                        </div>
                        <FormControl className="w-full">
                            <Controller
                                name="amount"
                                control={control}
                                render={({ field }) => (
                                    <NumericFormat
                                        {...field}
                                        thousandSeparator
                                        decimalScale={(tradeableInfo?.tradeable?.buyMaxDecimals ?? 3)}
                                        allowNegative={false}
                                        customInput={TextField}
                                        type="tel"
                                        label="مقدار مورد نظر را وارد کنید"
                                        variant="outlined"
                                        error={!!errors.amount}
                                        helperText={errors.amount ? errors.amount.message : ''}
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            inputProps: {
                                                className: 'ltr pl-4', maxLength: 15,
                                                inputMode: 'decimal'
                                            },
                                            endAdornment: <span className="input-end-span">گرم</span>,
                                        }}
                                        value={addStaking?.amount}
                                        onValueChange={(event) => {
                                            setAddStaking({ ...addStaking, amount: event.value });
                                            let stakeAmount = 0;
                                            setSliderValue(0);
                                            stakeAmount = event.value;
                                            const calculatedSliderValue = (stakeAmount / (productTradeableBalance || 0)) * 100;
                                            if (calculatedSliderValue > 100) {
                                                setSliderValue(100);
                                            } else if (calculatedSliderValue < 0) {
                                                setSliderValue(0);
                                            } else {
                                                setSliderValue(calculatedSliderValue);
                                            }
                                        }} />
                                )}
                            />
                        </FormControl>
                        <div className="px-4">
                            <span className="flex items-center gap-x-4">
                                <svg viewBox="0 0 24 24" className="svg-icon">
                                    <path d="M11.5 5.413c-1.11.15-2.177.397-3.158.723a.75.75 0 0 0-.438.382C7.397 7.56 7.148 8.332 6.9 9.192a.75.75 0 0 0-.028.274c.022.252.1.388.17.51s.075.186.3.355l.31.266c-1.606.485-3.026.88-4.992 1.8a.75.75 0 0 0-.387.423c-.388 1.062-.532 2.187-.758 2.986a.75.75 0 0 0 .098.617l.242.367a.75.75 0 0 0 .33.275c1.262.544 2.382 1.201 3.82 1.684a.75.75 0 0 0 .434.014l8.146-2.186c.666.583 1.317 1.153 1.89 1.662.15.144.312.103.483.158a.75.75 0 0 0 .072.04.75.75 0 0 0 .026-.008c.18.043.372.178.511.166.298-.027.524-.107.602-.127l3.424-.89c.448-.11.758-.512.795-.558a.75.75 0 0 0 .144-.656l-.628-2.46a.75.75 0 0 0-.106-.233l-.314-.469a.75.75 0 0 0-.018-.008.75.75 0 0 0-.033-.05c-2.871-2.714-6.175-5.183-9.383-7.589a.75.75 0 0 0-.549-.142zm-.09 1.551c2.711 2.033 5.364 4.133 7.81 6.314-.525.128-1.03.257-1.534.406-2.04-1.886-4.818-4.464-7.014-5.955a.75.75 0 0 0-1.043.201.75.75 0 0 0 .2 1.041c2.05 1.393 4.92 4.055 6.972 5.951-.103.475-.166.944-.232 1.414a754.808 754.808 0 0 0-8.115-7.029c.178-.596.38-1.159.684-1.822.715-.22 1.478-.399 2.273-.521zm-2.412 4.789.953.818-3.367.916c-.322-.122-.83-.273-1.246-.447 1.18-.422 2.33-.848 3.66-1.287zm2.328 1.998c.65.56 1.254 1.082 1.895 1.639l-5.816 1.561-.125-2.098zm-7.803.213c.7.198 1.488.52 2.25.822l.133 2.287c-.936-.37-1.831-.807-2.848-1.262.156-.635.305-1.255.465-1.848zm16.98.527.434 1.707-2.955.768c.08-.642.164-1.281.306-1.893a75.18 75.18 0 0 1 2.215-.582z"></path>
                                </svg>
                                <span>موجودی {tradeableInfo?.tradeable?.nameFa}: <span>{Number(new Decimal(tradeableInfo?.balance || 0).toDecimalPlaces((tradeableInfo?.tradeable?.sellMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString())?.toLocaleString('en-US', { maximumFractionDigits: 3 })}</span> گرم</span>
                            </span>

                            <Slider className="sell" valueLabelFormat={(value) => {
                                return (value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })
                            }} value={sliderValue} step={10} marks min={0} valueLabelDisplay="auto" max={100} color="error" disabled={tradeableInfo?.balance == 0}
                                onChange={calcAmountSlider} />
                        </div>
                        {loadingStaking ? <div className="w-full flex items-center justify-center mt-4">
                            <CircularProgress color={darkModeToggle ? 'white' : 'black'} />
                        </div> :
                            <>
                                <div className="col-span-12">
                                    <span>انتخاب سپرده</span>
                                </div>
                                {stakings.length > 0 ? <div className="lg:grid grid-cols-12 gap-2 flex flex-nowrap overflow-x-auto overflow-y-hidden pb-2 -mb-4">
                                    {stakings.map((data, index) => {
                                        return (
                                            <div className={`${stakings?.length == 1 ? 'min-w-full' : 'min-w-[45%]'} col-span-3`} key={index}>
                                                <input type="radio" className="hidden peer" id={data._id} name="gateway" checked={data._id == addStaking?.stakePlanId}
                                                    onChange={(event) => { setAddStaking({ ...addStaking, stakePlanId: data._id }); setValue('stakePlanId', data._id); }} />
                                                <label htmlFor={data._id} className={`relative custom-card rounded-2xl px-2 flex items-center justify-between gap-x-2 transition cursor-pointer border-light-gray dark:border-dark-secondary border-solid peer-checked:bg-primary peer-checked:bg-opacity-10 peer-checked:border-primary peer-checked:border-solid ${data.description ? 'pt-[30px] pb-1' : 'py-4'}`}>
                                                    <span>{data.stakingPeriod} ماهه</span>
                                                    <span>{data.profitPercentage} %</span>
                                                    {data.description ? <IconButton color={darkModeToggle ? 'white' : 'black'} className="p-0.5 absolute top-1 left-1" onClick={handleShowDescription(data)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none" className="w-6 h-6 md:w-5 md:h-5 text-black dark:text-white">
                                                            <path d="M8.00004 1.38194C4.32671 1.38194 1.33337 4.37528 1.33337 8.04861C1.33337 11.7219 4.32671 14.7153 8.00004 14.7153C11.6734 14.7153 14.6667 11.7219 14.6667 8.04861C14.6667 4.37528 11.6734 1.38194 8.00004 1.38194ZM7.50004 5.38194C7.50004 5.10861 7.72671 4.88194 8.00004 4.88194C8.27337 4.88194 8.50004 5.10861 8.50004 5.38194V8.71528C8.50004 8.98861 8.27337 9.21528 8.00004 9.21528C7.72671 9.21528 7.50004 8.98861 7.50004 8.71528V5.38194ZM8.61337 10.9686C8.58004 11.0553 8.53337 11.1219 8.47337 11.1886C8.40671 11.2486 8.33337 11.2953 8.25337 11.3286C8.17337 11.3619 8.08671 11.3819 8.00004 11.3819C7.91337 11.3819 7.82671 11.3619 7.74671 11.3286C7.66671 11.2953 7.59337 11.2486 7.52671 11.1886C7.46671 11.1219 7.42004 11.0553 7.38671 10.9686C7.35337 10.8886 7.33337 10.8019 7.33337 10.7153C7.33337 10.6286 7.35337 10.5419 7.38671 10.4619C7.42004 10.3819 7.46671 10.3086 7.52671 10.2419C7.59337 10.1819 7.66671 10.1353 7.74671 10.1019C7.90671 10.0353 8.09337 10.0353 8.25337 10.1019C8.33337 10.1353 8.40671 10.1819 8.47337 10.2419C8.53337 10.3086 8.58004 10.3819 8.61337 10.4619C8.64671 10.5419 8.66671 10.6286 8.66671 10.7153C8.66671 10.8019 8.64671 10.8886 8.61337 10.9686Z" fill="currentColor" />
                                                        </svg>
                                                    </IconButton> : ''}
                                                </label>
                                            </div>
                                        )
                                    })}
                                </div> : <span className="block text-center w-full opacity-50">سپرده ای تعریف نشده است</span>}
                            </>}
                    </div> : <div>
                        {loadingStakingsRequests ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div>
                            :
                            <section className="overflow-x-auto overflow-y-hidden flex flex-col gap-y-4 mt-16">
                                {stakingsRequests.length > 0 ?
                                    <>
                                        {stakingsRequests.map((data, index) => (
                                            <Accordion key={index} className="custom-accordion col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                                <AccordionSummary
                                                    className="font-medium text-black w-full *:!my-3 !px-0"
                                                    expandIcon={''}>
                                                    <div className="w-full">
                                                        <div className="flex items-center justify-between gap-x-2">
                                                            <div>
                                                                <span className="flex items-center gap-x-4">
                                                                    {data.stakePlan?.tradeable ?
                                                                        <img
                                                                            crossOrigin="anonymous"
                                                                            src={`${process.env.NEXT_PUBLIC_BASEURL}${data.stakePlan?.tradeable.image}`}
                                                                            alt={data.stakePlan?.tradeable.name}
                                                                            className="w-8 h-8 rounded-[50%]"
                                                                        />
                                                                        : ''}
                                                                    <span>سپرده {data.stakePlan?.stakingPeriod} ماهه ({data.stakePlan?.tradeable?.nameFa})</span>
                                                                </span>
                                                                <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {`${(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}-`} گرم
                                                                    </span></span>
                                                            </div>
                                                            <div className="flex flex-col items-end text-end">
                                                                <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                    .locale('fa')
                                                                    .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                                <span className="flex items-center gap-x-2 mt-2">
                                                                    <span>وضعیت: </span>
                                                                    {data.status == 'Completed' ? <span className="text-secondary-green dark:text-buy">تکمیل شده</span> : ''}
                                                                    {data.status == 'Active' ? <div className="flex items-center whitespace-nowrap">
                                                                        <span className="text-primary">فعال</span>
                                                                        <Tooltip title="لغو درخواست">
                                                                            <IconButton color="error" className="-me-4" onClick={handleOpenDialog(data._id)}>
                                                                                <CancelIcon />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </div> : ''}
                                                                    {data.status == 'Canceled' ? <span className="text-sell">لغو شده</span> : ''}
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
                                                    <div className="w-full flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span>سود سپرده: </span>
                                                            {data.stakePlan?.profitPercentage}%
                                                        </div>
                                                        <span className="flex flex-col">
                                                            <span>مدت زمان سپرده: </span>
                                                            {data.stakePlan?.stakingPeriod} ماهه
                                                        </span>
                                                        <span className="flex flex-col">
                                                            <span>تاریخ پایان: </span>
                                                            {moment(moment(data.endDate).format("YYYY-MM-DD"), 'YYYY-MM-DD')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD')}
                                                        </span>
                                                    </div>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                        <ConfirmDialog
                                            open={openDialog}
                                            onClose={handleCloseDialog}
                                            onConfirm={cancelRequest}
                                            title="آیا مطمئن هستید؟"
                                            loading={cancelLoading}
                                            darkModeToggle={darkModeToggle}
                                        />
                                    </>
                                    : <div className="py-16">
                                        <span className="block text-center text-large-1 text-primary-gray">درخواستی ای یافت نشد</span>
                                    </div>}
                            </section>}

                        {Math.ceil(stakingsRequestsTotal / stakingsRequestsLimit) > 1 ?
                            <div className="text-center mt-4">
                                <Pagination count={Math.ceil(stakingsRequestsTotal / stakingsRequestsLimit)} variant="outlined" color="primary" className="justify-center"
                                    page={pageItem} onChange={handlePageChange} />
                            </div>
                            : ''}

                    </div>}
                    <div className="lg:max-w-32 lg:mx-auto whitespace-nowrap">
                        {tabValue == 0 ? <LoadingButton type="submit" variant="contained" size="medium" fullWidth className="rounded-lg px-10" disableElevation loading={loading}>
                            <text className="text-black font-semibold">ثبت سپرده گذاری</text>
                        </LoadingButton > : ''}
                    </div>
                </form>
            </div>

            <>
                <Dialog onClose={() => setShowTradeables(false)} open={showTradeables} maxWidth={'sm'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6 mb-4">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2"><span>واحد های قابل معامله</span>
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowTradeables(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                    </div>
                    <div className="space-y-4">
                        {priceInfo?.length > 0 ? <table className="w-full border-separate border-spacing-y-1">
                            <thead className="table w-full table-fixed">
                                <tr>
                                    {TRADEABLES_TABLE_HEAD.map((data, index) => (
                                        <td
                                            key={index}
                                            className={`${data.classes} text-start first:px-6 px-6 last:px-4 last:text-end`}
                                        >
                                            <div className="text-[10px] font-medium opacity-70 dark:text-white">{data.label}</div>
                                        </td>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="block max-h-[60svh] overflow-y-auto mt-2">
                                {priceInfo?.map((data, index) => {
                                    return (
                                        <tr className="hover:rounded-lg hover:bg-black hover:bg-opacity-5 hover:dark:bg-white hover:dark:bg-opacity-5 whitespace-nowrap text-sm font-medium cursor-pointer leading-10 table w-full table-fixed 
                            border-b border-t-0 border-x-0 border-solid last:border-none border-light-foreground dark:border-black dark:border-opacity-20" key={index}
                                            onClick={changeTradeable(data)}
                                        >
                                            <td className="px-4 text-start w-[130px]">
                                                <div className="flex items-center gap-x-2">
                                                    <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} alt={data.tradeable?.name}
                                                        className="w-10 h-10 rounded-[50%]" />
                                                    <span>{data.tradeable?.nameFa}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 text-start text-primary-green font-semibold">
                                                <span>{(data?.buyPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                            </td>
                                            <td className="px-6 text-start text-primary-red font-semibold">
                                                <span>{(data?.sellPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                            </td>
                                            <td className="px-4 text-end">
                                                <span>{(data?.balance || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم</span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table> : ''}
                    </div>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    variant="temporary"
                    open={openBottomTradeablesDrawer}
                    onClose={() => setOpenBottomTradeablesDrawer(false)}
                    className="z-[18800]"
                    PaperProps={{ className: 'drawers temporary block' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6 mb-4">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2"><span>واحد های قابل معامله</span>
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomTradeablesDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <div className="space-y-4">
                        {priceInfo?.length > 0 ? <table className="w-full border-separate border-spacing-y-1">
                            <thead className="table w-full table-fixed">
                                <tr>
                                    {TRADEABLES_TABLE_HEAD.map((data, index) => (
                                        <td
                                            key={index}
                                            className={`${data.classes} text-start last:text-end`}
                                        >
                                            <div className="text-[10px] font-medium opacity-70 dark:text-white">{data.label}</div>
                                        </td>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="block max-h-[60svh] overflow-y-auto mt-2">
                                {priceInfo?.map((data, index) => {
                                    return (
                                        <tr className="hover:rounded-lg hover:bg-black hover:bg-opacity-5 hover:dark:bg-white hover:dark:bg-opacity-5 whitespace-nowrap text-sm font-medium cursor-pointer leading-10 table w-full table-fixed 
                            border-b border-t-0 border-x-0 border-solid last:border-none border-light-foreground dark:border-black dark:border-opacity-20" key={index}
                                            onClick={changeTradeable(data)}
                                        >
                                            <td className="text-start">
                                                <div className="flex flex-col md:flex-row items-center gap-2">
                                                    <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} alt={data.tradeable?.name}
                                                        className="w-10 h-10 rounded-[50%]" />
                                                    <span className="text-center whitespace-break-spaces">{data.tradeable?.nameFa}</span>
                                                </div>
                                            </td>
                                            <td className="text-start text-primary-green font-semibold">
                                                <span>{(data?.buyPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                            </td>
                                            <td className="text-start text-primary-red font-semibold">
                                                <span>{(data?.sellPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                            </td>
                                            <td className="text-end">
                                                <span>{(data?.balance || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم</span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table> : ''}
                    </div>
                </SwipeableDrawer>
            </>

            {/* Stake Plan Description */}
            <>
                <Dialog onClose={() => setShowDescription(false)} open={showDescription} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <Typography component={'h2'}>توضیحات سپرده {itemData?.stakingPeriod} ماهه</Typography>
                    <div className="flex flex-col gap-y-4 mt-6">
                        <FormControl>
                            <TextField
                                type="text"
                                multiline
                                rows={4}
                                className='pointer-events-none'
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl cursor-default pointer-events-none' : 'text-black rtl cursor-default pointer-events-none', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                value={itemData?.description} />
                        </FormControl>
                        <div className="flex items-center justify-end gap-x-2">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                onClick={() => setShowDescription(false)}>
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
                    open={openBottomDescriptionDrawer}
                    onClose={() => setOpenBottomDescriptionDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <Typography component={'h2'}>توضیحات سپرده {itemData?.stakingPeriod} ماهه</Typography>
                    <div className="flex flex-col gap-y-4 mt-6">
                        <FormControl>
                            <TextField
                                type="text"
                                multiline
                                rows={4}
                                className='pointer-events-none'
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl cursor-default pointer-events-none' : 'text-black rtl cursor-default pointer-events-none', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                value={itemData?.description} />
                        </FormControl>
                        <Button type="button" variant="contained" size="medium" fullWidth className="rounded-lg" disableElevation
                            onClick={() => setOpenBottomDescriptionDrawer(false)}>
                            <text className="text-black font-semibold">بستن</text>
                        </Button >
                    </div>
                </SwipeableDrawer>
            </>
        </>
    )
}

export default StakingPageCompo;