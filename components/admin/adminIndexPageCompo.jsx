import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress'

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call"

/**
 * AdminIndexPageCompo component that displays the Admin Index Page Component of the website.
 * @returns The rendered Admin Index Page component.
 */
const AdminIndexPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, priceInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    useEffect(() => {
        getDashboardInfo();
        getNewUsersInfo();
        getUsers();
        getPendingUsers();
        getWeeklyMetals();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /**
        * Retrieves Dashboard Info.
        * @returns None
       */
    const [dashboardInfo, setDashboardInfo] = useState();
    const [loadingdDashboardInfo, setLoadingdDashboardInfo] = useState(true);
    const getDashboardInfo = () => {
        setLoadingdDashboardInfo(true);
        ApiCall('/transaction/count-report', 'GET', locale, {}, ``, 'admin', router).then(async (result) => {
            setDashboardInfo(result);
            setLoadingdDashboardInfo(false);
        }).catch((error) => {
            setLoadingdDashboardInfo(false);
            console.log(error);
        });
    }
    /**
        * Retrieves New Users Info.
        * @returns None
       */
    const [newUsersInfo, setNewUsersInfo] = useState();
    const [loadingdNewUsersInfo, setLoadingdNewUsersInfo] = useState(true);
    const [dateMode, setDateMode] = useState('Week');
    const getNewUsersInfo = () => {
        setLoadingdNewUsersInfo(true);
        ApiCall('/user/new-users-report', 'GET', locale, {}, `dateMode=${dateMode}`, 'admin', router).then(async (result) => {
            setNewUsersInfo(result);
            setLoadingdNewUsersInfo(false);
        }).catch((error) => {
            setLoadingdNewUsersInfo(false);
            console.log(error);
        });
    }

    const [users, setUsers] = useState();
    const getUsers = () => {
        setLoadingdNewUsersInfo(true);
        ApiCall('/user', 'GET', locale, {}, `roles=User&roles=VIPUser&sortOrder=0&sortBy=createdAt&limit=1`, 'admin', router).then(async (result) => {
            setUsers(result);
            setLoadingdNewUsersInfo(false);
        }).catch((error) => {
            setLoadingdNewUsersInfo(false);
            console.log(error);
        });
    }
    const [usersPending, setUsersPending] = useState();
    const getPendingUsers = () => {
        setLoadingdNewUsersInfo(true);
        ApiCall('/user', 'GET', locale, {}, `verificationStatus=PendingFirstLevel&verificationStatus=PendingSecondLevel&roles=User&roles=VIPUser&sortOrder=0&sortBy=createdAt&limit=1`, 'admin', router).then(async (result) => {
            setUsersPending(result);
            setLoadingdNewUsersInfo(false);
        }).catch((error) => {
            setLoadingdNewUsersInfo(false);
            console.log(error);
        });
    }

    /**
        * Retrieves Weekly Metals Info (Gold & Silver).
        * Calculates from transaction data instead of separate endpoint
        * @returns None
       */
    const [weeklyMetals, setWeeklyMetals] = useState();
    const [loadingWeeklyMetals, setLoadingWeeklyMetals] = useState(true);
    const getWeeklyMetals = () => {
        setLoadingWeeklyMetals(true);
        
        // Calculate date from 7 days ago
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const startDate = oneWeekAgo.toISOString();
        
        console.log('[Weekly Metals] Fetching transactions from:', startDate);
        
        // Fetch all successful transactions from the last week
        ApiCall('/transaction', 'GET', locale, {}, `status=Successful&startDate=${startDate}`, 'admin', router).then(async (result) => {
            console.log('[Weekly Metals] API Response:', result);
            
            if (result && result.transactions) {
                console.log('[Weekly Metals] Total transactions:', result.transactions.length);
                
                // Find gold and silver tradeable IDs (you may need to adjust these based on your data)
                const goldTransactions = result.transactions.filter(t => 
                    t.tradeable && (t.tradeable.name === 'gold' || t.tradeable.symbol === 'Au')
                );
                const silverTransactions = result.transactions.filter(t => 
                    t.tradeable && (t.tradeable.name === 'silver' || t.tradeable.symbol === 'Ag')
                );
                
                console.log('[Weekly Metals] Gold transactions:', goldTransactions.length);
                console.log('[Weekly Metals] Silver transactions:', silverTransactions.length);
                
                // Log first transaction to see structure
                if (result.transactions[0]) {
                    console.log('[Weekly Metals] Sample transaction:', result.transactions[0]);
                }
                
                // Calculate totals
                const goldBuy = goldTransactions.filter(t => t.type === 'Buy').reduce((sum, t) => sum + (t.amount || 0), 0);
                const goldSell = goldTransactions.filter(t => t.type === 'Sell').reduce((sum, t) => sum + (t.amount || 0), 0);
                const silverBuy = silverTransactions.filter(t => t.type === 'Buy').reduce((sum, t) => sum + (t.amount || 0), 0);
                const silverSell = silverTransactions.filter(t => t.type === 'Sell').reduce((sum, t) => sum + (t.amount || 0), 0);
                
                console.log('[Weekly Metals] Calculated:', { goldBuy, goldSell, silverBuy, silverSell });
                
                setWeeklyMetals({
                    gold: {
                        buy: {
                            grams: goldBuy.toFixed(3),
                            milligrams: (goldBuy * 1000).toFixed(0)
                        },
                        sell: {
                            grams: goldSell.toFixed(3),
                            milligrams: (goldSell * 1000).toFixed(0)
                        },
                        total: {
                            grams: (goldBuy + goldSell).toFixed(3),
                            milligrams: ((goldBuy + goldSell) * 1000).toFixed(0)
                        }
                    },
                    silver: {
                        buy: {
                            grams: silverBuy.toFixed(3),
                            milligrams: (silverBuy * 1000).toFixed(0)
                        },
                        sell: {
                            grams: silverSell.toFixed(3),
                            milligrams: (silverSell * 1000).toFixed(0)
                        },
                        total: {
                            grams: (silverBuy + silverSell).toFixed(3),
                            milligrams: ((silverBuy + silverSell) * 1000).toFixed(0)
                        }
                    }
                });
            } else {
                console.log('[Weekly Metals] No transactions data in response');
                // Set default empty values if no data
                setWeeklyMetals({
                    gold: {
                        buy: { grams: '0.000', milligrams: '0' },
                        sell: { grams: '0.000', milligrams: '0' },
                        total: { grams: '0.000', milligrams: '0' }
                    },
                    silver: {
                        buy: { grams: '0.000', milligrams: '0' },
                        sell: { grams: '0.000', milligrams: '0' },
                        total: { grams: '0.000', milligrams: '0' }
                    }
                });
            }
            setLoadingWeeklyMetals(false);
        }).catch((error) => {
            console.log('[Weekly Metals] API Error:', error);
            // Set default values on error to prevent infinite loop
            setWeeklyMetals({
                gold: {
                    buy: { grams: '0.000', milligrams: '0' },
                    sell: { grams: '0.000', milligrams: '0' },
                    total: { grams: '0.000', milligrams: '0' }
                },
                silver: {
                    buy: { grams: '0.000', milligrams: '0' },
                    sell: { grams: '0.000', milligrams: '0' },
                    total: { grams: '0.000', milligrams: '0' }
                }
            });
            setLoadingWeeklyMetals(false);
            console.log('Error fetching weekly metals:', error);
        });
    }

    return (
        loadingdDashboardInfo || loadingdNewUsersInfo || loadingWeeklyMetals ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> :
            <div className="xl:max-w-[60rem] xl:mx-auto">
                <section>
                    <h1 className="text-large-3 mb-6">داشبورد</h1>
                    <div className="grid grid-cols-12 gap-x-4 gap-y-14">
                        <div className="col-span-12 md:col-span-4">
                            <div className="h-full custom-card flex flex-col justify-between rounded-2xl p-5">
                                <div className="flex flex-col">
                                    <span>تعداد کاربران جدید این هفته:</span>
                                    <span className="text-small-1 text-primary-gray invisible">()</span>
                                    <div className="text-large-1 self-end"><span className="block"><span className="ltr">{(newUsersInfo?.count || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> نفر</span></div>
                                </div>
                                <LinkRouter legacyBehavior href="/admin/panel/users">
                                    <Button href="/admin/panel/users" variant="contained" color="success" size="small" className="custom-btn text-black rounded-lg w-full lg:mx-auto"
                                        startIcon={<svg viewBox="0 0 24 24" className="svg-icon text-2xl">
                                            <path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path>
                                        </svg>}>
                                        <span className="text-large-1 mx-2">کاربران</span>
                                    </Button>
                                </LinkRouter>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <div className="h-full custom-card flex flex-col justify-between rounded-2xl p-5">
                                <div className="flex flex-col">
                                    <span>تعداد کاربران در انتظار تائید:</span>
                                    <span className="text-small-1 text-primary-gray invisible">()</span>
                                    <div className="text-large-1 self-end"><span className="block"><span className="ltr">{(usersPending?.count || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> نفر</span></div>
                                </div>
                                <LinkRouter legacyBehavior href="/admin/panel/users">
                                    <Button href="/admin/panel/users" variant="contained" color="primary" size="small" className="custom-btn text-black rounded-lg w-full lg:mx-auto"
                                        startIcon={<svg viewBox="0 0 24 24" className="svg-icon text-2xl">
                                            <path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path>
                                        </svg>}>
                                        <span className="text-large-1 mx-2">کاربران</span>
                                    </Button>
                                </LinkRouter>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <div className="h-full custom-card flex flex-col justify-between rounded-2xl p-5">
                                <div className="flex flex-col">
                                    <span>تعداد کل کاربران:</span>
                                    <span className="text-small-1 text-primary-gray invisible">()</span>
                                    <div className="text-large-1 self-end"><span className="block"><span className="ltr">{(users?.count || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> نفر</span></div>
                                </div>
                                <LinkRouter legacyBehavior href="/admin/panel/users">
                                    <Button href="/admin/panel/users" variant="contained" color="info" size="small" className="custom-btn text-black rounded-lg"
                                        startIcon={<svg viewBox="0 0 24 24" className="svg-icon text-2xl">
                                            <path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path>
                                        </svg>}>
                                        <span className="text-large-1 mx-2">کاربران</span>
                                    </Button>
                                </LinkRouter>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <div className="h-full custom-card flex flex-col justify-between rounded-2xl p-5">
                                <div className="flex flex-col">
                                    <span>تعداد معاملات تائید شده:</span>
                                    <span className="text-small-1 text-primary-gray invisible">()</span>
                                    <div className="text-large-1 self-end"><span className="block"><span className="ltr">{(dashboardInfo?.accepted || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> معامله</span></div>
                                </div>
                                <LinkRouter legacyBehavior href="/admin/panel/trades">
                                    <Button href="/admin/panel/trades" variant="contained" color="success" size="small" className="custom-btn text-black rounded-lg w-full lg:mx-auto"
                                        startIcon={<svg viewBox="0 0 24 24" className="svg-icon text-2xl">
                                            <path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path>
                                        </svg>}>
                                        <span className="text-large-1 mx-2">معاملات</span>
                                    </Button>
                                </LinkRouter>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <div className="h-full custom-card flex flex-col justify-between rounded-2xl p-5">
                                <div className="flex flex-col gap-y-1">
                                    <span className="font-bold">طلای معامله شده (هفته):</span>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-green-600">خرید:</span>
                                        <span className="ltr">{(parseFloat(weeklyMetals?.gold?.buy?.grams || 0).toLocaleString('en-US', { maximumFractionDigits: 3 }))} گرم</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-red-600">فروش:</span>
                                        <span className="ltr">{(parseFloat(weeklyMetals?.gold?.sell?.grams || 0).toLocaleString('en-US', { maximumFractionDigits: 3 }))} گرم</span>
                                    </div>
                                    <div className="text-large-1 self-end mt-2"><span className="block text-primary-gold"><span className="ltr">{(parseFloat(weeklyMetals?.gold?.total?.milligrams || 0).toLocaleString('en-US', { maximumFractionDigits: 0 }))}</span> میلی‌گرم</span></div>
                                </div>
                                <LinkRouter legacyBehavior href="/admin/panel/trades">
                                    <Button href="/admin/panel/trades" variant="contained" color="warning" size="small" className="custom-btn text-black rounded-lg w-full lg:mx-auto"
                                        startIcon={<svg viewBox="0 0 24 24" className="svg-icon text-2xl">
                                            <path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path>
                                        </svg>}>
                                        <span className="text-large-1 mx-2">معاملات</span>
                                    </Button>
                                </LinkRouter>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <div className="h-full custom-card flex flex-col justify-between rounded-2xl p-5">
                                <div className="flex flex-col gap-y-1">
                                    <span className="font-bold">نقره معامله شده (هفته):</span>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-green-600">خرید:</span>
                                        <span className="ltr">{(parseFloat(weeklyMetals?.silver?.buy?.grams || 0).toLocaleString('en-US', { maximumFractionDigits: 3 }))} گرم</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-red-600">فروش:</span>
                                        <span className="ltr">{(parseFloat(weeklyMetals?.silver?.sell?.grams || 0).toLocaleString('en-US', { maximumFractionDigits: 3 }))} گرم</span>
                                    </div>
                                    <div className="text-large-1 self-end mt-2"><span className="block text-gray-400"><span className="ltr">{(parseFloat(weeklyMetals?.silver?.total?.milligrams || 0).toLocaleString('en-US', { maximumFractionDigits: 0 }))}</span> میلی‌گرم</span></div>
                                </div>
                                <LinkRouter legacyBehavior href="/admin/panel/trades">
                                    <Button href="/admin/panel/trades" variant="contained" color="inherit" size="small" className="custom-btn text-black rounded-lg w-full lg:mx-auto"
                                        startIcon={<svg viewBox="0 0 24 24" className="svg-icon text-2xl">
                                            <path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path>
                                        </svg>}>
                                        <span className="text-large-1 mx-2">معاملات</span>
                                    </Button>
                                </LinkRouter>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
    )
}

export default AdminIndexPageCompo;