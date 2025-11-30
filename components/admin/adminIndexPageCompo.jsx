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
    }, []);

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

    return (
        loadingdDashboardInfo || loadingdNewUsersInfo ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> :
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
                    </div>
                </section>
            </div>
    )
}

export default AdminIndexPageCompo;