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
        * Calculates from transaction data
        * @returns None
       */
    const [weeklyMetals, setWeeklyMetals] = useState({
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
    const [loadingWeeklyMetals, setLoadingWeeklyMetals] = useState(true);
    const getWeeklyMetals = () => {
        console.log('[Weekly Metals v8] Starting fetch...');
        setLoadingWeeklyMetals(true);
        
        // Calculate date from 7 days ago
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        console.log('[Weekly Metals v8] One week ago:', oneWeekAgo.toISOString());
        console.log('[Weekly Metals v8] Fetching transactions from:', process.env.NEXT_PUBLIC_BASEURL);
        console.log('[Weekly Metals v8] Making API call to /transaction with limit=50 (API max)');
        
        // Fetch ALL transactions with simple query
        // NOTE: backend caps limit at 50; higher values return 400
        ApiCall('/transaction', 'GET', locale, {}, `limit=50`, 'admin', router).then(async (result) => {
            console.log('[Weekly Metals v8] ✅ API call completed');
            console.log('[Weekly Metals v8] Result type:', typeof result);
            console.log('[Weekly Metals v8] Result keys:', result ? Object.keys(result) : 'null');
            console.log('[Weekly Metals v8] API Response received', {
                hasData: !!(result?.data),
                dataLength: result?.data?.length || 0,
                resultKeys: result ? Object.keys(result) : [],
                fullResult: result
            });
            
            try {
                if (result && result.data && Array.isArray(result.data)) {
                    console.log('[Weekly Metals v8] ✅ Data is array! Total transactions:', result.data.length);
                    
                    // Log first transaction structure for debugging
                    if (result.data.length > 0) {
                        console.log('[Weekly Metals v8] Sample transaction:', {
                            status: result.data[0].status,
                            type: result.data[0].type,
                            amount: result.data[0].amount,
                            tradeable: result.data[0].tradeable,
                            createdAt: result.data[0].createdAt
                        });
                    }
                    
                    // Get unique statuses for debugging
                    const uniqueStatuses = [...new Set(result.data.map(t => t.status))];
                    console.log('[Weekly Metals v8] Available statuses:', uniqueStatuses);
                    
                    // Get unique types for debugging
                    const uniqueTypes = [...new Set(result.data.map(t => t.type))];
                    console.log('[Weekly Metals v8] Available types:', uniqueTypes);
                    
                    // Filter transactions from last week with Accepted status
                    const weeklyTransactions = result.data.filter(t => {
                        const txDate = new Date(t.createdAt);
                        const isRecent = txDate >= oneWeekAgo;
                        const isAccepted = t.status === 'Accepted';
                        if (!isRecent) console.log('[Weekly Metals v8] Filtered out (old):', t.createdAt);
                        if (!isAccepted) console.log('[Weekly Metals v8] Filtered out (status):', t.status);
                        return isRecent && isAccepted;
                    });
                    
                    console.log('[Weekly Metals v8] ✅ Weekly Accepted transactions:', weeklyTransactions.length);
                    
                    // Filter by tradeable name (GOLD or SILVER) - support both English and Persian
                    const goldTransactions = weeklyTransactions.filter(t => 
                        t.tradeable && (
                            t.tradeable.name?.toUpperCase().includes('GOLD') || 
                            t.tradeable.nameFa === 'طلا' ||
                            t.tradeable.nameEn?.toUpperCase().includes('GOLD') ||
                            t.tradeable.nameFa?.includes('طلا')
                        )
                    );
                    const silverTransactions = weeklyTransactions.filter(t => 
                        t.tradeable && (
                            t.tradeable.name?.toUpperCase().includes('SILVER') || 
                            t.tradeable.nameFa === 'نقره' ||
                            t.tradeable.nameEn?.toUpperCase().includes('SILVER') ||
                            t.tradeable.nameFa?.includes('نقره')
                        )
                    );
                    
                    console.log('[Weekly Metals v8] ✅ Gold transactions:', goldTransactions.length);
                    console.log('[Weekly Metals v8] ✅ Silver transactions:', silverTransactions.length);
                    
                    // Log sample transactions for debugging
                    if (goldTransactions.length > 0) {
                        console.log('[Weekly Metals v8] Sample gold transaction:', goldTransactions[0]);
                    } else {
                        console.log('[Weekly Metals v8] ⚠️ NO gold transactions found');
                    }
                    
                    // Calculate totals (amount is in grams)
                    // Support both English (Buy/Sell) and Persian (خرید/فروش) types
                    const goldBuy = goldTransactions
                        .filter(t => t.type === 'Buy' || t.type === 'خرید')
                        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
                    const goldSell = goldTransactions
                        .filter(t => t.type === 'Sell' || t.type === 'فروش')
                        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
                    const silverBuy = silverTransactions
                        .filter(t => t.type === 'Buy' || t.type === 'خرید')
                        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
                    const silverSell = silverTransactions
                        .filter(t => t.type === 'Sell' || t.type === 'فروش')
                        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
                    
                    const goldTotal = goldBuy + goldSell;
                    const silverTotal = silverBuy + silverSell;
                    
                    console.log('[Weekly Metals v8] ✅ Calculated totals:', {
                        gold: { buy: goldBuy, sell: goldSell, total: goldTotal },
                        silver: { buy: silverBuy, sell: silverSell, total: silverTotal }
                    });
                    console.log('[Weekly Metals v8] Setting state with these values...');
                    
                    console.log('[Weekly Metals v6] Gold - Buy:', goldBuy, 'Sell:', goldSell, 'Total:', goldTotal);
                    console.log('[Weekly Metals v6] Silver - Buy:', silverBuy, 'Sell:', silverSell, 'Total:', silverTotal);
                    
                    setWeeklyMetals({
                        gold: {
                            buy: {
                                grams: goldBuy.toFixed(3),
                                milligrams: Math.round(goldBuy * 1000).toString()
                            },
                            sell: {
                                grams: goldSell.toFixed(3),
                                milligrams: Math.round(goldSell * 1000).toString()
                            },
                            total: {
                                grams: goldTotal.toFixed(3),
                                milligrams: Math.round(goldTotal * 1000).toString()
                            }
                        },
                        silver: {
                            buy: {
                                grams: silverBuy.toFixed(3),
                                milligrams: Math.round(silverBuy * 1000).toString()
                            },
                            sell: {
                                grams: silverSell.toFixed(3),
                                milligrams: Math.round(silverSell * 1000).toString()
                            },
                            total: {
                                grams: silverTotal.toFixed(3),
                                milligrams: Math.round(silverTotal * 1000).toString()
                            }
                        }
                    });
                } else {
                    console.log('[Weekly Metals v8] ❌ No data in response or data is not array');
                    console.log('[Weekly Metals v8] Result structure:', JSON.stringify(result, null, 2));
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
            } catch (err) {
                console.error('[Weekly Metals v8] ❌ Error processing data:', err);
                console.error('[Weekly Metals v8] Error stack:', err.stack);
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
            } finally {
                setLoadingWeeklyMetals(false);
            }
        }).catch((error) => {
            console.error('[Weekly Metals v8] ❌ API Error:', error);
            console.error('[Weekly Metals v8] Error type:', typeof error);
            console.error('[Weekly Metals v8] Error details:', JSON.stringify(error, null, 2));
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
                                        <span className="ltr flex items-center gap-1"><span>گرم</span> {(parseFloat(weeklyMetals?.gold?.buy?.grams || 0).toLocaleString('en-US', { maximumFractionDigits: 3 }))}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-red-600">فروش:</span>
                                        <span className="ltr flex items-center gap-1"><span>گرم</span> {(parseFloat(weeklyMetals?.gold?.sell?.grams || 0).toLocaleString('en-US', { maximumFractionDigits: 3 }))}</span>
                                    </div>
                                    <div className="text-large-1 self-end mt-2"><span className="block text-primary-gold ltr flex items-center gap-1"><span>گرم</span> {(parseFloat((weeklyMetals?.gold?.total?.milligrams || 0) / 1000).toLocaleString('en-US', { maximumFractionDigits: 3 }))}</span></div>
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
                                        <span className="ltr flex items-center gap-1"><span>گرم</span> {(parseFloat(weeklyMetals?.silver?.buy?.grams || 0).toLocaleString('en-US', { maximumFractionDigits: 3 }))}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-red-600">فروش:</span>
                                        <span className="ltr flex items-center gap-1"><span>گرم</span> {(parseFloat(weeklyMetals?.silver?.sell?.grams || 0).toLocaleString('en-US', { maximumFractionDigits: 3 }))}</span>
                                    </div>
                                    <div className="text-large-1 self-end mt-2"><span className="block text-gray-400 ltr flex items-center gap-1"><span>گرم</span> {(parseFloat((weeklyMetals?.silver?.total?.milligrams || 0) / 1000).toLocaleString('en-US', { maximumFractionDigits: 3 }))}</span></div>
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