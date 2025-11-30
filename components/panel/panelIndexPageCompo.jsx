import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import CreditScoreIcon from '@mui/icons-material/CreditScore'
import Slider from '@mui/material/Slider'
import CancelIcon from '@mui/icons-material/CancelOutlined';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Decimal from 'decimal.js';

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call"
import CopyData from "../../services/copy"

//Components
import AddTransfer from "./compos/addTransfer"

/**
 * PanelIndexPageCompo component that displays the Panel Index Page Component of the website.
 * @returns The rendered Panel Index Page component.
 */
const PanelIndexPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, priceInfo, priceLoading, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const TRADEABLES_TABLE_HEAD = [
        {
            label: 'نام واحد',
            classes: ""
        },
        {
            label: `قیمت خرید از ${siteInfo?.title}`,
            classes: ""
        },
        {
            label: `قیمت فروش به ${siteInfo?.title}`,
            classes: ""
        },
        {
            label: 'موجودی',
            classes: ""
        },
        {
            label: 'ارزش تومانی',
            classes: ""
        },
        {
            label: '',
            classes: ""
        }
    ]

    const marks = [
        {
            value: (userInfo?.totalTransactions || 0),
            label: (userInfo?.totalTransactions || 0).toLocaleString(undefined, { maximumFractionDigits: 0 }),
        },
        {
            value: (userInfo?.level?.minRequiredTradesAmount || 0),
            label: ``,
        }
    ]

    const referralMarks = [
        {
            value: (userInfo?.referralCount || 0),
            label: (userInfo?.referralCount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 }),
        },
        {
            value: (userInfo?.level?.minRequiredReferralCount || 0),
            label: ``,
        }
    ]

    useEffect(() => {
        getLevels(1);
    }, []);

    /**
         * Retrieves Levels list.
         * @returns None
        */
    const [levels, setLevels] = useState([]);
    const [loadingLevels, setLoadingLevels] = useState(true);
    const [levelsLimit, setLevelsLimit] = useState(50);
    const [levelsTotal, setLevelsTotal] = useState(0);
    const [lastLevel, setLastLevel] = useState(false);
    const [nextLevel, setNextLevel] = useState(null);
    const getLevels = (page) => {
        setLoadingLevels(true);
        ApiCall('/level', 'GET', locale, {}, `sortOrder=1&sortBy=number&limit=${levelsLimit}&skip=${(page * levelsLimit) - levelsLimit}`, 'user', router).then(async (result) => {
            setLevelsTotal(result.count);
            const currentLevelNumber = userInfo?.level?.number;
            if (result.data[result.data?.length - 1]?.number == userInfo?.level?.number) {
                setLastLevel(true);
                setNextLevel(null);
            } else {
                setLastLevel(false);
                const nextLevel = result.data.find((level) => level.number === currentLevelNumber + 1);
                setNextLevel(nextLevel || null);
            }
            setLevels(result.data);
            setLoadingLevels(false);
        }).catch((error) => {
            setLoadingLevels(false);
            console.log(error);
        });
    }

    const referralRewardMarks = [
        {
            value: 0,
            label: '',
            className: 'dsdsdsds'
        },
        {
            value: 100,
            label: '',
            className: 'dsdsdsds'
        }
    ]

    return (
        <div className="xl:max-w-[62rem] 2xl:max-w-[82rem] xl:mx-auto">
            <section>
                <h1 className="text-large-3 mb-6 flex items-center justify-between gap-x-2">داشبورد
                    {siteInfo?.tradeableTransferIsActive ? <AddTransfer disableElevation={true} /> : ''}
                </h1>
                <div className="grid grid-cols-12 gap-x-4 gap-y-14">
                    {(siteInfo?.offlineFirstStepUserVerifyEnabled || siteInfo?.onlineFirstStepUserVerifyEnabled) ?
                        <>
                            {userInfo?.verificationStatus == 'NotVerified' ? <div className="col-span-12">
                                <Alert
                                    severity="info"
                                    variant="filled"
                                    color="info"
                                    className="custom-alert auth info"
                                >
                                    <div className="flex flex-col items-baseline md:items-center gap-y-2 md:flex-row md:justify-between w-full">
                                        <span>کاربر گرامی برای استفاده از امکانات {siteInfo?.title} می بایست حساب خود را تائید نمائید.</span>
                                        <LinkRouter legacyBehavior href={'/panel/authentication'}>
                                            <Button href={'/panel/authentication'} variant="contained" color="primary" size="medium" className="custom-btn text-black rounded-lg w-fit"
                                                startIcon={<CreditScoreIcon />}>
                                                <span className="mx-2">تائید حساب</span>
                                            </Button>
                                        </LinkRouter>
                                    </div>

                                </Alert>
                            </div> : ''}
                            {userInfo?.verificationStatus == 'FirstLevelRejected' ? <div className="col-span-12">
                                <Alert
                                    severity="info"
                                    variant="filled"
                                    color="error"
                                    className="custom-alert auth error"
                                >
                                    <div className="flex flex-col items-baseline md:items-center gap-y-2 md:flex-row md:justify-between w-full">
                                        <span>کاربر گرامی احراز پایه شما در {siteInfo?.title} رد شده است.</span>
                                        <LinkRouter legacyBehavior href={'/panel/authentication'}>
                                            <Button href={'/panel/authentication'} variant="contained" color="error" size="medium" className="custom-btn text-white rounded-lg w-fit"
                                                startIcon={<CancelIcon />}>
                                                <span className="mx-2">مشاهده علت</span>
                                            </Button>
                                        </LinkRouter>
                                    </div>

                                </Alert>
                            </div> : ''}
                            {userInfo?.verificationStatus == 'FirstLevelVerified' && siteInfo?.secondStepUserVerifyEnabled ? <div className="col-span-12">
                                <Alert
                                    severity="info"
                                    variant="filled"
                                    color="info"
                                    className="custom-alert auth info"
                                >
                                    <div className="flex flex-col items-baseline md:items-center gap-y-2 md:flex-row md:justify-between w-full">
                                        <span>کاربر گرامی برای استفاده از تمامی امکانات {siteInfo?.title} می بایست احراز کامل نمائید.</span>
                                        <LinkRouter legacyBehavior href={'/panel/authentication'}>
                                            <Button href={'/panel/authentication'} variant="contained" color="primary" size="medium" className="custom-btn text-black rounded-lg w-fit"
                                                startIcon={<CreditScoreIcon />}>
                                                <span className="mx-2">احراز کامل</span>
                                            </Button>
                                        </LinkRouter>
                                    </div>

                                </Alert>
                            </div> : ''}
                            {userInfo?.verificationStatus == 'FirstLevelVerified' && !siteInfo?.secondStepUserVerifyEnabled ? <div className="col-span-12">
                                <Alert
                                    severity="info"
                                    variant="filled"
                                    color="success"
                                    className="custom-alert auth success"
                                >
                                    <div className="flex flex-col items-baseline md:items-center gap-y-2 md:flex-row md:justify-between w-full">
                                        <span>کاربر گرامی حساب شما در {siteInfo?.title} کامل می باشد.</span>
                                        <Button variant="contained" color="error" size="medium" className="custom-btn text-white rounded-lg w-fit invisible"
                                            startIcon={<CancelIcon />}>
                                            <span className="mx-2">کامل</span>
                                        </Button>
                                    </div>
                                </Alert>
                            </div> : ''}
                            {userInfo?.verificationStatus == 'SecondLevelRejected' ? <div className="col-span-12">
                                <Alert
                                    severity="info"
                                    variant="filled"
                                    color="error"
                                    className="custom-alert auth error"
                                >
                                    <div className="flex flex-col items-baseline md:items-center gap-y-2 md:flex-row md:justify-between w-full">
                                        <span>کاربر گرامی احراز کامل شما در {siteInfo?.title} رد شده است.</span>
                                        <LinkRouter legacyBehavior href={'/panel/authentication'}>
                                            <Button href={'/panel/authentication'} variant="contained" color="error" size="medium" className="custom-btn text-white rounded-lg w-fit"
                                                startIcon={<CancelIcon />}>
                                                <span className="mx-2">مشاهده علت</span>
                                            </Button>
                                        </LinkRouter>
                                    </div>

                                </Alert>
                            </div> : ''}
                            {userInfo?.verificationStatus == 'PendingSecondLevel' || userInfo?.verificationStatus == 'PendingFirstLevel' ? <div className="col-span-12">
                                <Alert
                                    severity="info"
                                    variant="filled"
                                    color="warning"
                                    className="custom-alert auth warning"
                                >
                                    <div className="flex flex-col items-baseline md:items-center gap-y-2 md:flex-row md:justify-between w-full">
                                        <span>کاربر گرامی حساب شما در حال بررسی می باشد.</span>
                                        <Button variant="contained" color="error" size="medium" className="custom-btn text-white rounded-lg w-fit invisible"
                                            startIcon={<CancelIcon />}>
                                            <span className="mx-2">درحال بررسی</span>
                                        </Button>
                                    </div>
                                </Alert>
                            </div> : ''}
                            {userInfo?.verificationStatus == 'SecondLevelVerified' ? <div className="col-span-12">
                                <Alert
                                    severity="info"
                                    variant="filled"
                                    color="success"
                                    className="custom-alert auth success"
                                >
                                    <div className="flex flex-col items-baseline md:items-center gap-y-2 md:flex-row md:justify-between w-full">
                                        <span>کاربر گرامی حساب شما در {siteInfo?.title} کامل می باشد.</span>
                                        <Button variant="contained" color="error" size="medium" className="custom-btn text-white rounded-lg w-fit invisible"
                                            startIcon={<CancelIcon />}>
                                            <span className="mx-2">کامل</span>
                                        </Button>
                                    </div>
                                </Alert>
                            </div> : ''}
                        </> : ''}
                    {priceInfo?.length > 0 ?
                        <>
                            <div className="col-span-12 lg:hidden flex flex-col gap-y-4">
                                <div className="custom-card rounded-2xl flex justify-between gap-x-2 p-4 dark:text-white">
                                    <div className="flex flex-col items-start justify-between gap-y-4">
                                        <div className="flex items-center gap-x-4">
                                            <div className="relative flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="35" height="36" viewBox="0 0 35 36" fill="none" className="w-11 h-11">
                                                    <g filter="url(#filter0_i_1_47729)">
                                                        <path d="M0 12.5C0 5.87258 5.37258 0.5 12 0.5H23C29.6274 0.5 35 5.87258 35 12.5V23.5C35 30.1274 29.6274 35.5 23 35.5H12C5.37258 35.5 0 30.1274 0 23.5V12.5Z" fill={darkModeToggle ? 'white' : '#CBCBCB'} fillOpacity={darkModeToggle ? '0.05' : '1'} />
                                                    </g>
                                                    <defs>
                                                        <filter id="filter0_i_1_47729" x="0" y="0.5" width="35" height="40" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                                            <feOffset dy="5" />
                                                            <feGaussianBlur stdDeviation="7.5" />
                                                            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                                                            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0" />
                                                            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_47729" />
                                                        </filter>
                                                        <linearGradient id="paint0_linear_1_47729" x1="17.5" y1="0.5" x2="17.5" y2="35.5" gradientUnits="userSpaceOnUse">
                                                            <stop stopcolor={darkModeToggle ? 'white' : 'black'} />
                                                            <stop offset="1" stopcolor={darkModeToggle ? 'white' : 'black'} stopOpacity="0.3" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45" fill="none" className="absolute">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M14.5 18C15.3284 18 16 18.6716 16 19.5C16 22.098 18.1061 24.2041 20.7041 24.2041H24.2959C26.8939 24.2041 29 22.098 29 19.5C29 18.6716 29.6716 18 30.5 18C31.3284 18 32 18.6716 32 19.5C32 23.7548 28.5508 27.2041 24.2959 27.2041H20.7041C16.4492 27.2041 13 23.7548 13 19.5C13 18.6716 13.6716 18 14.5 18Z" fill="white" />
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M18 20.5C18 19.6716 18.7555 19 19.6875 19H25.3125C26.2445 19 27 19.6716 27 20.5C27 21.3284 26.2445 22 25.3125 22H19.6875C18.7555 22 18 21.3284 18 20.5Z" fill="white" />
                                                </svg>
                                            </div>
                                            <span>تومان</span>
                                        </div>
                                        <span>موجودی:  <span className="font-semibold">{(userInfo?.tomanBalance || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> تومان</span>
                                        <div className="flex items-center gap-x-5">
                                            <LinkRouter legacyBehavior href="/panel/deposit?type=online">
                                                <Button href="/panel/deposit?type=online" variant="text" size="medium" color="primary" className="rounded-lg" disableElevation>
                                                    <text className=" font-semibold">افزایش موجودی</text>
                                                </Button >
                                            </LinkRouter>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-between gap-y-2">
                                        <div className="flex flex-col gap-y-1">
                                            <div className="font-medium leading-7">قیمت خرید از {siteInfo?.title}:</div>
                                            ------
                                        </div>
                                        <div className="flex flex-col gap-y-1">
                                            <div className="font-medium leading-7">قیمت فروش به {siteInfo?.title}:</div>
                                            ------
                                        </div>
                                    </div>
                                </div>
                                {priceInfo?.map((data, index) => (
                                    <div key={index} className="col-span-12 lg:hidden custom-card rounded-2xl flex justify-between gap-x-2 p-4 dark:text-white">
                                        <div className="flex flex-col items-start justify-between gap-y-4">
                                            <div className="flex items-center gap-x-4">
                                                <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} alt={data.tradeable?.name}
                                                    className="w-10 h-10 rounded-[50%]" />
                                                <span>{data.tradeable?.nameFa}</span>
                                            </div>
                                            {userInfo?.role == 'VIPUser' ? <div className="flex flex-col gap-y-2">
                                                <span>در دسترس:  <span className="font-bold">{(Number(new Decimal(data.balance || 0).toDecimalPlaces((data.tradeable?.sellMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()))?.toLocaleString('en-US', { maximumFractionDigits: 3 })}</span> گرم</span>
                                                <span>بلوکه شده:  <span className="font-bold">{(data?.totalBlocked || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })}</span> گرم</span>
                                            </div> : <span><span className="font-bold">{(Number(new Decimal(data.balance || 0).toDecimalPlaces((data.tradeable?.sellMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()))?.toLocaleString('en-US', { maximumFractionDigits: 3 })}</span> گرم</span>}
                                            <div className="flex items-center gap-x-5">
                                                <LinkRouter legacyBehavior href={`/panel/trade?type=buy&tradeable=${data.tradeable?.name}`}>
                                                    <Button href={`/panel/trade?type=buy&tradeable=${data.tradeable?.name}`} variant="text" size="medium" color="primary" className="rounded-lg" disableElevation>
                                                        <text className=" font-semibold">معامله</text>
                                                    </Button >
                                                </LinkRouter>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-between gap-y-2">
                                            <div className="flex flex-col gap-y-1">
                                                <div className="font-medium leading-7">قیمت خرید از {siteInfo?.title}:</div>
                                                <span className="text-secondary-green dark:text-buy font-semibold">{(data?.buyPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                            </div>
                                            <div className="flex flex-col gap-y-1">
                                                <div className="font-medium leading-7">قیمت فروش به {siteInfo?.title}:</div>
                                                <span className="text-sell font-semibold">{(data?.sellPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                            </div>
                                            <div className="flex flex-col gap-y-1">
                                                <div className="font-medium leading-7">ارزش تومانی:</div>
                                                <span className="font-semibold">{((data?.sellPrice || 0) * (data?.balance || 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="col-span-12 hidden lg:block overflow-x-auto overflow-y-hidden">
                                <TableContainer component={Paper} className="rounded-xl shadow-none table dark:bg-dark">
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                        <TableHead className="dark:bg-dark">
                                            <TableRow>
                                                {TRADEABLES_TABLE_HEAD.map((data, index) => (
                                                    <TableCell className={`${data.classes} border-b-0 first:text-start text-center last:text-end pb-4`} key={index}>
                                                        <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow
                                                sx={{ '&:last-child td': { border: 0 } }}
                                                className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                                <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none py-4 text-sm dark:text-white" scope="row">
                                                    <div className="flex items-center gap-x-4">
                                                        <div className="relative flex items-center justify-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="36" viewBox="0 0 35 36" fill="none" className="w-11 h-11">
                                                                <g filter="url(#filter0_i_1_47729)">
                                                                    <path d="M0 12.5C0 5.87258 5.37258 0.5 12 0.5H23C29.6274 0.5 35 5.87258 35 12.5V23.5C35 30.1274 29.6274 35.5 23 35.5H12C5.37258 35.5 0 30.1274 0 23.5V12.5Z" fill={darkModeToggle ? 'white' : '#CBCBCB'} fillOpacity={darkModeToggle ? '0.05' : '1'} />
                                                                </g>
                                                                <defs>
                                                                    <filter id="filter0_i_1_47729" x="0" y="0.5" width="35" height="40" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                                                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                                                        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                                                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                                                        <feOffset dy="5" />
                                                                        <feGaussianBlur stdDeviation="7.5" />
                                                                        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                                                                        <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0" />
                                                                        <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_47729" />
                                                                    </filter>
                                                                    <linearGradient id="paint0_linear_1_47729" x1="17.5" y1="0.5" x2="17.5" y2="35.5" gradientUnits="userSpaceOnUse">
                                                                        <stop stopcolor={darkModeToggle ? 'white' : 'black'} />
                                                                        <stop offset="1" stopcolor={darkModeToggle ? 'white' : 'black'} stopOpacity="0.3" />
                                                                    </linearGradient>
                                                                </defs>
                                                            </svg>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45" fill="none" className="absolute">
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M14.5 18C15.3284 18 16 18.6716 16 19.5C16 22.098 18.1061 24.2041 20.7041 24.2041H24.2959C26.8939 24.2041 29 22.098 29 19.5C29 18.6716 29.6716 18 30.5 18C31.3284 18 32 18.6716 32 19.5C32 23.7548 28.5508 27.2041 24.2959 27.2041H20.7041C16.4492 27.2041 13 23.7548 13 19.5C13 18.6716 13.6716 18 14.5 18Z" fill="white" />
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M18 20.5C18 19.6716 18.7555 19 19.6875 19H25.3125C26.2445 19 27 19.6716 27 20.5C27 21.3284 26.2445 22 25.3125 22H19.6875C18.7555 22 18 21.3284 18 20.5Z" fill="white" />
                                                            </svg>
                                                        </div>
                                                        <span>تومان</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center border-none py-4 text-sm dark:text-white" scope="row">
                                                    ------
                                                </TableCell>
                                                <TableCell className="text-center border-none py-4 text-sm dark:text-white">
                                                    ------
                                                </TableCell>
                                                <TableCell className="text-center border-none py-4 text-sm dark:text-white">
                                                    <span className="font-bold">{(userInfo?.tomanBalance || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> تومان
                                                </TableCell>
                                                <TableCell className="text-center border-none py-4 text-sm dark:text-white">
                                                    ------
                                                </TableCell>
                                                <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none py-4 text-sm dark:text-white">
                                                    <LinkRouter legacyBehavior href="/panel/deposit?type=online">
                                                        <Button href="/panel/deposit?type=online" variant="text" size="medium" color="primary" className="rounded-lg" disableElevation>
                                                            <text className=" font-semibold">افزایش موجودی</text>
                                                        </Button >
                                                    </LinkRouter>
                                                </TableCell>
                                            </TableRow>
                                            {priceInfo?.map((data, index) => (
                                                <TableRow
                                                    key={index}
                                                    sx={{ '&:last-child td': { border: 0 } }}
                                                    className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                                    <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none py-4 text-sm dark:text-white" scope="row">
                                                        <div className="flex items-center gap-x-4">
                                                            <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} alt={data.tradeable?.name}
                                                                className="w-10 h-10 rounded-[50%]" />
                                                            <span>{data.tradeable?.nameFa}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center border-none py-4 text-sm font-semibold text-secondary-green dark:text-buy" scope="row">
                                                        {(data?.buyPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان
                                                    </TableCell>
                                                    <TableCell className="text-center border-none py-4 text-sm font-semibold text-sell">
                                                        {(data?.sellPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان
                                                    </TableCell>
                                                    <TableCell className="text-center border-none py-4 text-sm dark:text-white flex flex-col items-center gap-y-2">
                                                        {userInfo?.role == 'VIPUser' ?
                                                            <>
                                                                <span>در دسترس: <span className="font-bold">{(Number(new Decimal(data.balance || 0).toDecimalPlaces((data.tradeable?.sellMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()))?.toLocaleString('en-US', { maximumFractionDigits: 3 })}</span> گرم</span>
                                                                <span>بلوکه شده: <span className="font-bold">{(data?.totalBlocked || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })}</span> گرم</span>
                                                            </>
                                                            : <span className="mt-2"><span className="font-bold">{(Number(new Decimal(data.balance || 0).toDecimalPlaces((data.tradeable?.sellMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()))?.toLocaleString('en-US', { maximumFractionDigits: 3 })}</span> گرم</span>}

                                                    </TableCell>
                                                    <TableCell className="text-center border-none py-4 text-sm dark:text-white font-semibold">
                                                        {((data?.sellPrice || 0) * (data?.balance || 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان
                                                    </TableCell>
                                                    <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none py-4 text-sm dark:text-white">
                                                        <LinkRouter legacyBehavior href={`/panel/trade?type=buy&tradeable=${data.tradeable?.name}`}>
                                                            <Button href={`/panel/trade?type=buy&tradeable=${data.tradeable?.name}`} variant="text" size="medium" color="primary" className="rounded-lg" disableElevation>
                                                                <text className=" font-semibold">معامله</text>
                                                            </Button >
                                                        </LinkRouter>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        </>
                        : ''}
                </div>
            </section>
            <section className="my-16">
                <div className="grid grid-cols-12 gap-2">
                    {(siteInfo?.referralCountForGettingReward == 0) ? '' : (userInfo?.referralCount || 0) < (siteInfo?.referralCountForGettingReward) ? <div className="col-span-12 lg:col-span-4">
                        <div className="lg:h-[80%] custom-card flex flex-col items-center justify-between rounded-2xl p-5">
                            <p className="text-center">با دعوت <strong className="font-black">{siteInfo?.referralCountForGettingReward}</strong> نفر از دوستان خود به <strong className="font-black">{siteInfo?.title}</strong> {(siteInfo?.offlineFirstStepUserVerifyEnabled || siteInfo?.onlineFirstStepUserVerifyEnabled) ? ' و با احراز هویت آنها' : ''} مبلغ <strong className="font-black">{siteInfo?.referralReward?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong> تومان جایزه بگیرید</p>
                            <div className="relative w-[90%] mx-auto px-2 mt-2" dir="ltr">
                                <Slider
                                    size='medium'
                                    valueLabelFormat={() => {
                                        return <span className="fa-number">{(userInfo?.referralCount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} نفر</span>
                                    }}
                                    value={(userInfo?.referralCount || 0)}
                                    color="primary"
                                    valueLabelDisplay="on"
                                    marks={referralRewardMarks}
                                    step={1}
                                    min={0}
                                    max={siteInfo?.referralCountForGettingReward}
                                    className="gold referral-reward m-0"
                                />
                                <span className="text-sm absolute -bottom-1 left-2" dir="rtl">
                                    {siteInfo?.referralCountForGettingReward?.toLocaleString(undefined, { maximumFractionDigits: 0 })} نفر
                                </span>
                            </div>
                        </div>
                    </div> : ''}
                    <div className={`col-span-12 ${(siteInfo?.referralCountForGettingReward == 0) ? '' : (userInfo?.referralCount || 0) < (siteInfo?.referralCountForGettingReward) ? 'lg:col-span-8' : ''} `}>
                        <div className="bg-[#EBB402] rounded-xl flex flex-col items-center gap-y-4 p-4">
                            <div className="w-full flex flex-row items-center justify-between gap-x-2 gap-y-4 whitespace-nowrap">
                                <span className="text-black text-base font-medium leading-loose">کد دعوت شما (کد کاربری)</span>
                                <Button
                                    variant="text"
                                    color="black"
                                    onClick={CopyData(userInfo?.referralCode || '')}>
                                    <span className="text-white text-2xl font-medium leading-10">{userInfo?.referralCode || ''}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z" stroke="white" stroke-width="1.5" />
                                        <path d="M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531" stroke="white" stroke-width="1.5" />
                                    </svg>
                                </Button>
                            </div>
                            <div className="w-11/12 flex flex-col items-center gap-y-4">
                                <div className="w-full flex items-center justify-between gap-x-2 whitespace-nowrap rounded-lg bg-white border border-white py-2 px-5 dark:border-opacity-20">
                                    {/* <span className="text-base text-black font-normal hidden md:block 2xl:hidden">لینک مستقیم</span> */}
                                    <span className="text-black text-base font-normal text-center whitespace-break-spaces">{location.origin}/auth?ref={userInfo?.referralCode || ''}</span>
                                    <IconButton
                                        onClick={CopyData(`${location.origin}/auth?ref=${userInfo?.referralCode || ''}`)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-black">
                                            <path d="M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z" stroke="currentColor" />
                                            <path d="M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531" stroke="currentColor" />
                                        </svg>
                                    </IconButton>
                                </div>
                                <div className="w-full md:w-[80%] md:mx-auto flex items-center justify-center md:gap-x-8">
                                    <div className="text-black text-base font-light leading-loose">
                                        <span>تعداد دعوت:</span>
                                        <span className="text-black text-base font-medium leading-loose mx-2">{userInfo?.referralCount || 0} نفر</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-y-2">
                        {loadingLevels ? <div className="h-full flex flex-col justify-between gap-y-10 custom-card rounded-2xl !py-4"></div> : nextLevel?.minRequiredTradesAmount > 0 ? <div className="h-full flex flex-col justify-between gap-y-10 custom-card rounded-2xl !py-4">
                            <div className="flex flex-col items-center gap-y-4">
                                <span className="text-sm dark:text-white">
                                    حجم معاملات شما: <span>{(userInfo?.totalTransactions || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} تومان</span>
                                </span>
                                {lastLevel ? '' : <span className="text-sm dark:text-white">
                                    تا سطح بعدی باید <span className="text-black font-bold dark:text-white">
                                        {((nextLevel?.minRequiredTradesAmount || 0) - (userInfo?.totalTransactions || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })} تومان</span> معامله کنید
                                </span>}
                            </div>
                            {lastLevel ? <div className="custom-slider w-[90%] mx-auto order-3 px-2">
                                <Slider
                                    size='medium'
                                    valueLabelFormat={() => {
                                        return <span className="fa-number">{(userInfo?.totalTransactions || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} تومان</span>
                                    }}
                                    value={(userInfo?.totalTransactions || 0)}
                                    color="primary"
                                    valueLabelDisplay="on"
                                    step={1}
                                    min={0}
                                    max={userInfo?.totalTransactions}
                                    className="gold m-0"
                                />
                            </div> : <div className="relative custom-slider w-[90%] mx-auto order-3 px-2">
                                <Slider
                                    size='medium'
                                    valueLabelFormat={() => {
                                        return <span className="fa-number">{(userInfo?.totalTransactions || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} تومان</span>
                                    }}
                                    value={((userInfo?.totalTransactions || 0) / (nextLevel?.minRequiredTradesAmount || 1) * 100)}
                                    color="primary"
                                    valueLabelDisplay="on"
                                    marks={marks}
                                    step={1}
                                    min={0}
                                    max={100}
                                    className="gold m-0"
                                />
                                <span className="text-sm absolute -bottom-1 left-2" dir="rtl">
                                    {(nextLevel?.minRequiredTradesAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} تومان
                                </span>
                            </div>}
                        </div> : <div className="h-full flex flex-col justify-between gap-y-10 custom-card rounded-2xl !py-4">
                            <div className="flex flex-col items-center gap-y-4">
                                <span className="text-sm dark:text-white">
                                    تعداد دعوت های شما: <span>{(userInfo?.referralCount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} نفر</span>
                                </span>
                                {lastLevel ? '' : <span className="text-sm dark:text-white">
                                    تا سطح بعدی باید <span className="text-black font-bold dark:text-white">
                                        {((nextLevel?.minRequiredReferralCount || 0) - (userInfo?.referralCount || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })} نفر</span> را دعوت کنید
                                </span>}
                            </div>
                            {lastLevel ? <div className="custom-slider w-[90%] mx-auto order-3 px-2">
                                <Slider
                                    size='medium'
                                    valueLabelFormat={() => {
                                        return <span className="fa-number">{(userInfo?.referralCount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} نفر</span>
                                    }}
                                    value={(userInfo?.referralCount || 0)}
                                    color="primary"
                                    valueLabelDisplay="on"
                                    step={2}
                                    min={0}
                                    max={userInfo?.referralCount}
                                    className="gold m-0"
                                />
                            </div> : <div className="relative custom-slider w-[90%] mx-auto order-3 px-2">
                                <Slider
                                    size='medium'
                                    valueLabelFormat={() => {
                                        return <span className="fa-number">{(userInfo?.referralCount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} نفر</span>
                                    }}
                                    value={((userInfo?.referralCount || 0) / (nextLevel?.minRequiredReferralCount || 1) * 100)}
                                    color="primary"
                                    valueLabelDisplay="on"
                                    marks={referralMarks}
                                    step={1}
                                    min={0}
                                    max={100}
                                    className="gold m-0"
                                />
                                <span className="text-sm absolute -bottom-1 left-2" dir="rtl">
                                    {(nextLevel?.minRequiredReferralCount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} نفر
                                </span>
                            </div>}
                        </div>}
                    </div>
                    <div className="col-span-12 lg:col-span-4">
                        <div className="h-full xl:h-[90%] 2xl:h-[92%] bg-[#EBB402] rounded-xl flex flex-col items-center justify-between gap-y-4 p-2">
                            <div className="flex flex-col items-center gap-y-2">
                                <span className="text-black text-base font-light leading-loose mt-4">سطح کاربری شما</span>
                                <div className="fa-number">
                                    <span className="text-white text-3xl font-black">سطح </span>
                                    <span className="text-white text-5xl font-black">{userInfo?.level?.number}</span>
                                    <span className="text-white text-3xl font-black"> </span>
                                </div>
                            </div>
                            <LinkRouter legacyBehavior href={'/panel/profile'}>
                                <Button
                                    href={'/panel/profile'}
                                    variant="filled"
                                    color={darkModeToggle ? 'white' : 'black'}
                                    className="btn-main-gold !bg-white rounded w-full whitespace-nowrap">
                                    <span className="text-center text-[#595959] text-xs font-medium leading-loose">شرایط و توضیحات</span>
                                </Button>
                            </LinkRouter>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default PanelIndexPageCompo;