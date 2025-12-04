import { useState, useEffect } from "react";
import LinkRouter from "next/link";
import { useRouter } from "next/router";
import { styled, useTheme } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import Drawer from '@mui/material/Drawer';
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';

import { setCookie } from 'nookies'

import { PatternFormat } from 'react-number-format';

// CustomSnackbar
import CustomSnackbar from '../shared/snackbar';

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call";

// Components
// const TapToTop = dynamic(() => import("../shared/tapToTop"), { ssr: false });

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: `-${drawerWidth}px`,
        ...(open && {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: 0,
        }),
    }),
);

const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== 'open', })(
    ({ theme, open }) => ({
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        ...(open && {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: `${drawerWidth}px`,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        }),
    }));

const AdminPageLayout = ({ children }) => {

    const { state, dispatch } = useAppContext();
    const { siteInfo, darkModeToggle, snackbarProps, adminInfo, refreshUnreadTickets } = state;

    const router = useRouter();
    const { locale } = useRouter();

    useEffect(() => {
        if (darkModeToggle) {
            localStorage.setItem('dark', true);
            document.querySelector("html").classList.add("dark");
            dispatch({ type: "setDarkModeToggle", value: true });
        } else {
            localStorage.setItem('dark', false);
            document.querySelector("html").classList.remove("dark");
            dispatch({ type: "setDarkModeToggle", value: false });
        }
    }, [darkModeToggle]);

    /**
    * Retrieves user unread tickets.
    * @returns None
    */
    useEffect(() => {
        getUnreadTickets();
    }, [refreshUnreadTickets]);

    const [unReadTicketData, setUnReadTicketData] = useState({
        newMessageCount: 0,
        hasNewMessageForAdmin: 0
    });
    const getUnreadTickets = () => {
        ApiCall('/ticket', 'GET', locale, {}, 'limit=1', 'admin', router).then(async (result) => {
            setUnReadTicketData({ ...unReadTicketData, newMessageCount: result.newMessageCount || 0, hasNewMessageForAdmin: result.hasNewMessageForAdmin || false });
        }).catch((error) => {
            console.log(error);
        });
    }

    /**
     * Signs out the user by clearing the user token cookie, updating the login status,
     * and redirecting to the sign-in page.
     * @returns None
     */
    const signout = () => {
        setCookie(null, 'adminToken', "", { path: '/' });
        setAnchorEl(null);
        router.push('/admin/auth');
    }

    const menuItems = [
        { show: true, title: 'داشبورد', href: '/admin/panel', icon: <GridViewOutlinedIcon className="text-black dark:text-white" /> },
        {
            show: true, title: 'کاربران', hasSubMenu: true, icon: <svg width="24" height="24" viewBox="0 0 24 24" className="svg-icon text-black dark:text-white">
                <path d="M12 12.75C8.83 12.75 6.25 10.17 6.25 7C6.25 3.83 8.83 1.25 12 1.25C15.17 1.25 17.75 3.83 17.75 7C17.75 10.17 15.17 12.75 12 12.75ZM12 2.75C9.66 2.75 7.75 4.66 7.75 7C7.75 9.34 9.66 11.25 12 11.25C14.34 11.25 16.25 9.34 16.25 7C16.25 4.66 14.34 2.75 12 2.75Z" fill="currentColor" />
                <path d="M20.5901 22.75C20.1801 22.75 19.8401 22.41 19.8401 22C19.8401 18.55 16.3202 15.75 12.0002 15.75C7.68015 15.75 4.16016 18.55 4.16016 22C4.16016 22.41 3.82016 22.75 3.41016 22.75C3.00016 22.75 2.66016 22.41 2.66016 22C2.66016 17.73 6.85015 14.25 12.0002 14.25C17.1502 14.25 21.3401 17.73 21.3401 22C21.3401 22.41 21.0001 22.75 20.5901 22.75Z" fill="currentColor" />
            </svg>,
            subMenuItems: [
                {
                    show: true, title: 'کاربران', href: '/admin/panel/users'
                },
                {
                    show: adminInfo?.role == 'SuperAdmin' ? true : false, title: 'ادمین ها', href: '/admin/panel/admins'
                }
            ]
        },
        {
            show: true, title: 'محصولات', hasSubMenu: true, icon: <svg viewBox="0 0 24 24" className="svg-icon text-black dark:text-white"><path d="M6.33 2.285a1 1 0 0 0-.41.088s-.375.165-.77.451c-.394.286-1.006.721-1.006 1.65v15.05c0 1.194.99 2.19 2.186 2.19h11.34a2.204 2.204 0 0 0 2.184-2.19V8.104a1 1 0 0 0-.289-.705l-4.803-4.818a1 1 0 0 0-.709-.295zm.26 2h6.359v2.799c0 1.161.959 2.125 2.12 2.125h2.788v10.32c0 .124-.068.19-.186.19H6.331c-.118 0-.185-.066-.185-.19V4.609c.004.063.03-.054.18-.162.127-.093.185-.115.265-.156zm8.109 1.064 2.105 2.111H15.07c-.22 0-.371-.152-.371-.377zM8.568 9.79a.875.875 0 0 0-.875.875.875.875 0 0 0 .875.875H12.3a.875.875 0 0 0 .875-.875.875.875 0 0 0-.875-.875zm0 2.939a.875.875 0 0 0-.875.875.875.875 0 0 0 .875.875h5.357a.875.875 0 0 0 .875-.875.875.875 0 0 0-.875-.875zm0 2.938a.875.875 0 0 0-.875.877.875.875 0 0 0 .875.875h6.863a.875.875 0 0 0 .875-.875.875.875 0 0 0-.875-.877z"></path></svg>,
            subMenuItems: [
                {
                    show: true, title: 'واحدهای قابل معامله', href: '/admin/panel/tradeables'
                },
                {
                    show: true, title: 'محصولات', href: '/admin/panel/products'
                },
                {
                    show: true, title: 'تحویل فیزیکی محصولات', href: '/admin/panel/productstransactions'
                },
                {
                    show: true, title: 'شعب تحویل فیزیکی', href: '/admin/panel/productsbranch'
                },
                {
                    show: true, title: 'سپرده گذاری', href: '/admin/panel/stakings'
                },
                {
                    show: true, title: 'تعیین کارمزد معاملاتی برای کاربران', href: '/admin/panel/user-fees'
                }
            ]
        },
        {
            show: true, title: 'گیفت کارت ها', hasSubMenu: true, icon: <svg width="24" height="24" viewBox="0 0 24 24" className="svg-icon text-black dark:text-white">
                <path d="M15.97 22.75H7.96997C4.54997 22.75 3.21997 21.42 3.21997 18V10C3.21997 9.59 3.55997 9.25 3.96997 9.25H19.97C20.38 9.25 20.72 9.59 20.72 10V18C20.72 21.42 19.39 22.75 15.97 22.75ZM4.71997 10.75V18C4.71997 20.58 5.38997 21.25 7.96997 21.25H15.97C18.55 21.25 19.22 20.58 19.22 18V10.75H4.71997Z" fill="currentColor" />
                <path d="M19.5 10.75H4.5C2.75 10.75 1.75 9.75 1.75 8V7C1.75 5.25 2.75 4.25 4.5 4.25H19.5C21.2 4.25 22.25 5.3 22.25 7V8C22.25 9.7 21.2 10.75 19.5 10.75ZM4.5 5.75C3.59 5.75 3.25 6.09 3.25 7V8C3.25 8.91 3.59 9.25 4.5 9.25H19.5C20.38 9.25 20.75 8.88 20.75 8V7C20.75 6.12 20.38 5.75 19.5 5.75H4.5Z" fill="currentColor" />
                <path d="M11.64 5.75H6.11997C5.90997 5.75 5.70997 5.66001 5.56997 5.51C4.95997 4.84 4.97997 3.81 5.61997 3.17L7.03997 1.75C7.69997 1.09 8.78997 1.09 9.44997 1.75L12.17 4.47C12.38 4.68 12.45 5.01 12.33 5.29C12.22 5.57 11.95 5.75 11.64 5.75ZM6.66997 4.25001H9.83997L8.38997 2.81C8.30997 2.73 8.17997 2.73 8.09997 2.81L6.67997 4.23001C6.67997 4.24001 6.66997 4.24001 6.66997 4.25001Z" fill="currentColor" />
                <path d="M17.87 5.75H12.35C12.05 5.75 11.77 5.57 11.66 5.29C11.54 5.01 11.61 4.69 11.82 4.47L14.54 1.75C15.2 1.09 16.29 1.09 16.95 1.75L18.37 3.17C19.01 3.81 19.04 4.84 18.42 5.51C18.28 5.66001 18.08 5.75 17.87 5.75ZM14.17 4.25001H17.34C17.33 4.24001 17.33 4.24001 17.32 4.23001L15.9 2.81C15.82 2.73 15.69 2.73 15.61 2.81L14.17 4.25001Z" fill="currentColor" />
                <path d="M9.94 16.9C9.66 16.9 9.37 16.83 9.11 16.69C8.54 16.38 8.19 15.79 8.19 15.15V10C8.19 9.59 8.53 9.25 8.94 9.25H14.98C15.39 9.25 15.73 9.59 15.73 10V15.13C15.73 15.78 15.38 16.37 14.81 16.67C14.24 16.98 13.55 16.94 13.01 16.58L12.12 15.98C12.04 15.92 11.93 15.92 11.84 15.98L10.9 16.6C10.61 16.8 10.27 16.9 9.94 16.9ZM9.69 10.75V15.14C9.69 15.27 9.77 15.33 9.82 15.36C9.87 15.39 9.97 15.42 10.08 15.35L11.02 14.73C11.61 14.34 12.37 14.34 12.95 14.73L13.84 15.33C13.95 15.4 14.05 15.37 14.1 15.34C14.15 15.31 14.23 15.25 14.23 15.12V10.74H9.69V10.75Z" fill="currentColor" />
            </svg>,
            subMenuItems: [
                {
                    show: true, title: 'درخواست های گیفت کارت', href: '/admin/panel/giftcards'
                },
                {
                    show: true, title: 'تنظیمات', href: '/admin/panel/giftcardsettings'
                },
            ]
        },
        {
            show: true, title: 'اعمال محدودیت', hasSubMenu: true, icon: <svg width="24" height="24" viewBox="0 0 24 24" className="svg-icon text-black dark:text-white">
                <path d="M12.005 22.7326C6.08732 22.7326 1.27734 17.9227 1.27734 12.005C1.27734 6.08732 6.08732 1.27734 12.005 1.27734C17.9227 1.27734 22.7326 6.08732 22.7326 12.005C22.7326 17.9227 17.9127 22.7326 12.005 22.7326ZM12.005 2.77423C6.91559 2.77423 2.77422 6.9156 2.77422 12.005C2.77422 17.0944 6.91559 21.2358 12.005 21.2358C17.0944 21.2358 21.2358 17.0944 21.2358 12.005C21.2358 6.9156 17.0944 2.77423 12.005 2.77423Z" fill="currentColor" />
                <path d="M14.3002 12.953C14.1006 12.953 13.911 12.8731 13.7713 12.7334L5.60832 4.55048C5.31892 4.26108 5.31892 3.78208 5.60832 3.49268C5.89771 3.20329 6.37672 3.20329 6.66611 3.49268L13.5617 10.3983L13.5717 7.66399C13.5717 7.25485 13.911 6.91555 14.3202 6.91555C14.7293 6.88561 15.0686 7.25485 15.0686 7.66399L15.0586 12.2045C15.0586 12.5039 14.879 12.7833 14.5996 12.8931C14.4998 12.933 14.4 12.953 14.3002 12.953Z" fill="currentColor" />
                <path d="M17.8628 20.7268C17.6732 20.7268 17.4836 20.657 17.3339 20.5073L10.4383 13.6017L10.4283 16.336C10.4283 16.7451 10.089 17.0844 9.67983 17.0844C9.27069 17.0844 8.93139 16.7451 8.93139 16.336L8.94137 11.7954C8.94137 11.4961 9.121 11.2166 9.40042 11.1069C9.67983 10.9871 9.99917 11.057 10.2187 11.2665L18.3817 19.4495C18.6711 19.7389 18.6711 20.2179 18.3817 20.5073C18.252 20.657 18.0524 20.7268 17.8628 20.7268Z" fill="currentColor" />
            </svg>,
            subMenuItems: [
                {
                    show: true, title: 'محدودیت برداشت', href: '/admin/panel/withdrawlimits'
                },
                {
                    show: true, title: 'ساعات محدودیت معاملات', href: '/admin/panel/tradelimits'
                },
            ]
        },
        {
            show: true, title: 'حسابداری', hasSubMenu: true, icon: <svg width="24" height="24" viewBox="0 0 24 24" className="svg-icon text-black dark:text-white">
                <path d="M10.1098 18.1501H6.31982C5.90982 18.1501 5.56982 17.8101 5.56982 17.4001V12.2802C5.56982 11.2402 6.41981 10.3901 7.45981 10.3901H10.1098C10.5198 10.3901 10.8598 10.7301 10.8598 11.1401V17.3901C10.8598 17.8101 10.5198 18.1501 10.1098 18.1501ZM7.06982 16.6501H9.3598V11.9001H7.45981C7.24981 11.9001 7.06982 12.0701 7.06982 12.2901V16.6501Z" />
                <path d="M13.8901 18.1501H10.1001C9.6901 18.1501 9.3501 17.8101 9.3501 17.4001V7.74011C9.3501 6.70011 10.2001 5.8501 11.2401 5.8501H12.7601C13.8001 5.8501 14.6501 6.70011 14.6501 7.74011V17.4001C14.6401 17.8101 14.3101 18.1501 13.8901 18.1501ZM10.8601 16.6501H13.1501V7.74011C13.1501 7.53011 12.9801 7.3501 12.7601 7.3501H11.2401C11.0301 7.3501 10.8501 7.52011 10.8501 7.74011V16.6501H10.8601Z" />
                <path d="M17.6801 18.1501H13.8901C13.4801 18.1501 13.1401 17.8101 13.1401 17.4001V12.8501C13.1401 12.4401 13.4801 12.1001 13.8901 12.1001H16.5401C17.5801 12.1001 18.4301 12.9501 18.4301 13.9901V17.4001C18.4301 17.8101 18.1001 18.1501 17.6801 18.1501ZM14.6401 16.6501H16.9301V13.9901C16.9301 13.7801 16.7601 13.6001 16.5401 13.6001H14.6401V16.6501Z" />
                <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z" />
            </svg>,
            subMenuItems: [
                {
                    show: true, title: 'معاملات آنی', href: '/admin/panel/trades'
                },
                {
                    show: true, title: 'معاملات پیشرفته', href: '/admin/panel/orderbooks'
                },
                {
                    show: true, title: 'تراکنش های تومان', href: '/admin/panel/fiattransactions'
                },
                {
                    show: true, title: 'انتقال های دارایی', href: '/admin/panel/transfers'
                },
                {
                    show: true, title: 'حسابداری', href: '/admin/panel/financial'
                },
                {
                    show: true, title: 'کیف پولها', href: '/admin/panel/wallets'
                },
                {
                    show: true, title: 'کارت های بانکی', href: '/admin/panel/bankaccounts'
                },
                {
                    show: true, title: 'تاریخچه خروجی معاملات', href: '/admin/panel/exports'
                }
            ]
        },
        {
            show: true, title: 'پیام ها', name: 'ticket', hasSubMenu: true, icon: <svg width="24" height="24" viewBox="0 0 24 24" className="svg-icon text-black dark:text-white">
                <path d="M17 21.25H7C3.35 21.25 1.25 19.15 1.25 15.5V8.5C1.25 4.85 3.35 2.75 7 2.75H17C20.65 2.75 22.75 4.85 22.75 8.5V15.5C22.75 19.15 20.65 21.25 17 21.25ZM7 4.25C4.14 4.25 2.75 5.64 2.75 8.5V15.5C2.75 18.36 4.14 19.75 7 19.75H17C19.86 19.75 21.25 18.36 21.25 15.5V8.5C21.25 5.64 19.86 4.25 17 4.25H7Z" fill="currentColor" />
                <path d="M11.9998 12.87C11.1598 12.87 10.3098 12.61 9.65978 12.08L6.52978 9.57997C6.20978 9.31997 6.14978 8.84997 6.40978 8.52997C6.66978 8.20997 7.13978 8.14997 7.45978 8.40997L10.5898 10.91C11.3498 11.52 12.6398 11.52 13.3998 10.91L16.5298 8.40997C16.8498 8.14997 17.3298 8.19997 17.5798 8.52997C17.8398 8.84997 17.7898 9.32997 17.4598 9.57997L14.3298 12.08C13.6898 12.61 12.8398 12.87 11.9998 12.87Z" fill="currentColor" />
            </svg>,
            subMenuItems: [
                {
                    show: true, title: 'پیام ها', href: '/admin/panel/messages'
                },
                {
                    show: true, title: 'تیکت ها', href: '/admin/panel/tickets', name: 'ticket'
                }
            ]
        },
        {
            show: true, title: 'پیامک', href: '/admin/panel/sms', icon: <svg width="24" height="24" viewBox="0 0 24 24" className="svg-icon text-black dark:text-white">
                <path d="M17 20.75H7C3.35 20.75 1.25 18.65 1.25 15V9C1.25 5.35 3.35 3.25 7 3.25H17C20.65 3.25 22.75 5.35 22.75 9V15C22.75 18.65 20.65 20.75 17 20.75ZM7 4.75C4.14 4.75 2.75 6.14 2.75 9V15C2.75 17.86 4.14 19.25 7 19.25H17C19.86 19.25 21.25 17.86 21.25 15V9C21.25 6.14 19.86 4.75 17 4.75H7Z" fill="currentColor"/>
                <path d="M12 12.87C11.16 12.87 10.31 12.61 9.66 12.08L6.53 9.57997C6.21 9.31997 6.15 8.84997 6.41 8.52997C6.67 8.20997 7.14 8.14997 7.46 8.40997L10.59 10.91C11.35 11.52 12.64 11.52 13.4 10.91L16.53 8.40997C16.85 8.14997 17.33 8.19997 17.58 8.52997C17.84 8.84997 17.79 9.32997 17.46 9.57997L14.33 12.08C13.69 12.61 12.84 12.87 12 12.87Z" fill="currentColor"/>
            </svg>
        },
        {
            show: true, title: 'تنظیمات', hasSubMenu: true, href: '', icon: <svg viewBox="0 0 24 24" className="svg-icon text-black dark:text-white"><path d="M8.238 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.61-4.801L6.24 4.529a.75.75 0 1 0 1.307.73l1.344-2.4a.75.75 0 0 0-.652-1.114zm6.492 1.484c-3.145 0-5.745 2.421-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.064 6.062 6.064 3.145 0 5.742-2.421 6.031-5.492 3.068-.293 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.063-6.062zm0 2.002a4.044 4.044 0 0 1 4.064 4.061c0 2.105-1.593 3.764-3.637 3.982a6.051 6.051 0 0 0-1.316-2.502 3.242 3.242 0 0 0-.273-.315 3.263 3.263 0 0 0-.338-.292 6.044 6.044 0 0 0-2.48-1.287c.212-2.05 1.87-3.647 3.98-3.647zm-5.453 5.463c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.749.749 0 0 0-.746.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.308-.73l-1.342 2.4a.75.75 0 0 0 .653 1.114 6.504 6.504 0 0 0 6.494-6.494.75.75 0 0 0-.752-.748z"></path></svg>,
            subMenuItems: [
                { show: true, title: 'تنظیمات', href: '/admin/panel/settings' },
                {
                    show: true, title: 'تنظیمات بخش اوردربوک', href: '/admin/panel/orderbook'
                }
            ]
        }
    ]

    const [openSubMenus, setOpenSubMenus] = useState({});

    const handleMenuClick = (data) => {
        if (data.hasSubMenu) {
            setOpenSubMenus((prev) => ({
                ...prev,
                [data.title]: !prev[data.title]
            }));
        } else {
            router.push(data.href, data.href, { locale });
        }
    }

    const drawer = (
        <div style={{ width: drawerWidth }} className="flex flex-col gap-y-7 h-full">
            <LinkRouter legacyBehavior href="/">
                <Link href="/" className="text-white">
                    <div className="flex flex-col cursor-pointer mt-5 lg:mt-10">
                        <div className="text-[2rem] flex items-center justify-evenly">
                            <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${darkModeToggle ? siteInfo?.darkIconImage : siteInfo?.lightIconImage}`} alt="icon" className="svgr w-[5rem] h-[5rem] me-[0.3rem] text-black dark:text-white" />
                            <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${darkModeToggle ? siteInfo?.darkLogoImage : siteInfo?.lightLogoImage}`} alt="logo" className="svgr h-[3rem] text-black dark:text-white" />
                        </div>
                    </div>
                </Link>
            </LinkRouter>
            <div className="flex flex-col justify-between h-full">
                <List color="inherit">
                    {menuItems.map((data, index) => {
                        if (data.show) {
                            return (
                                <div key={index}>
                                    <ListItem
                                        disablePadding
                                        className={`${router.pathname === data.href ? 'pointer-events-none bg-primary bg-opacity-15' : ''}`}
                                        onClick={() => {
                                            handleMenuClick(data);
                                            if (!data.hasSubMenu) {
                                                setMobileOpen(!mobileOpen);
                                            }
                                        }}>
                                        <Button variant="text" color={darkModeToggle ? 'white' : 'black'} className="w-full p-[8px_16px]">
                                            <ListItemIcon color="inherit">
                                                {data.icon}
                                            </ListItemIcon>
                                            <ListItemText className="text-start *:flex *:items-center *:justify-between *:w-full">
                                                {data.title}
                                                <div className="flex items-center gap-x-4">
                                                    {data.name === 'ticket' && unReadTicketData?.newMessageCount > 0 ? (
                                                        <Chip
                                                            label={`${unReadTicketData?.newMessageCount} تیکت جدید`}
                                                            variant="outlined"
                                                            size="small"
                                                            className="w-fit badge badge-error"
                                                        />
                                                    ) : ''}
                                                    {data.hasSubMenu ? <div className={`${data.hasSubMenu && openSubMenus[data.title] ? 'rotate-180' : ''} transition`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="8" viewBox="0 0 14 8" fill="none">
                                                            <path d="M12.8337 1.08331L7.00033 6.91665L1.16699 1.08331" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                        </svg>
                                                    </div> : ''}
                                                </div>
                                            </ListItemText>
                                        </Button>
                                    </ListItem>
                                    <Collapse in={data.hasSubMenu && openSubMenus[data.title]}>
                                        {data.hasSubMenu && openSubMenus[data.title] && (
                                            <List component="div" disablePadding>
                                                {data.subMenuItems.map((subItem, subIndex) => (
                                                    subItem.show && (
                                                        <ListItem
                                                            key={subIndex}
                                                            className={`${router.pathname === subItem.href ? 'pointer-events-none bg-primary bg-opacity-15' : ''} py-0 px-0`}
                                                            onClick={() => {
                                                                router.push(subItem.href, subItem.href, { locale });
                                                                setMobileOpen(!mobileOpen);
                                                            }}>
                                                            <Button variant="text" color={darkModeToggle ? 'white' : 'black'} className="w-full p-[8px_16px]">
                                                                <ListItemText className="text-start *:text-sm *:flex *:items-center *:gap-x-2 *:w-full rtl:mr-8 ltr:ml-8">
                                                                    <div className={`rotate-90 w-3 h-3`}>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="8" viewBox="0 0 14 8" fill="none" className="w-full h-full">
                                                                            <path d="M12.8337 1.08331L7.00033 6.91665L1.16699 1.08331" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                        </svg>
                                                                    </div>
                                                                    {subItem.title}
                                                                </ListItemText>
                                                            </Button>
                                                        </ListItem>
                                                    )
                                                ))}
                                            </List>
                                        )}
                                    </Collapse>
                                </div>
                            );
                        }
                    })}
                </List>

                <List color="inherit">
                    <ListItem disablePadding>
                        <Button variant="text" color={darkModeToggle ? 'white' : 'black'} className="w-full text-start p-[8px_16px]" onClick={signout}>
                            <ListItemIcon color="inherit">
                                <LogoutIcon className="text-black dark:text-white" />
                            </ListItemIcon>
                            <ListItemText>خروج</ListItemText>
                        </Button>
                    </ListItem>
                </List>
            </div>

        </div>
    )

    const [refreshOnce, setRefreshOnce] = useState(false);
    useEffect(() => {
        if (window.innerWidth >= 1024) {
            setOpen(true);
        }
    }, [refreshOnce]);

    useEffect(() => {
        const updateDrawer = () => {
            setMobileOpen(false);
            if (window.innerWidth >= 1024) {
                setOpen(true);
            } else {
                setOpen(false);
            }

        }
        window.addEventListener('resize', updateDrawer);
    }, []);

    useEffect(() => {
        getAdminInformation();
    }, [refreshOnce]);

    /**
     * Retrieves Admin Info for the Admin.
     * @returns None
    */
    const getAdminInformation = () => {
        dispatch({
            type: 'setUserLoading', value: true
        });
        ApiCall('/user/me', 'GET', locale, {}, '', 'admin', router).then(async (result) => {
            dispatch({
                type: 'setAdminInfo', value: result
            });
            dispatch({
                type: 'setUserLoading', value: false
            });
        }).catch((error) => {
            dispatch({
                type: 'setUserLoading', value: false
            });
            console.log(error);
        });
    }

    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const handleDrawer = (type) => () => {
        if (type == 'mobile') {
            setOpen(false);
            setMobileOpen(!mobileOpen);
        } else {
            setOpen(!open);
            setMobileOpen(false);
        }

    }

    const [anchorEl, setAnchorEl] = useState(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    }
    const handleClose = () => {
        setAnchorEl(null);
    }

    const openPopover = Boolean(anchorEl);
    const id = openPopover ? 'simple-popover' : undefined;

    /**
     * Handles the toggling of dark mode based on the state of the event target.
     * @param {{Event}} event - The event object triggered by the toggle action.
     * @returns None
     */
    const handleDarkMode = (event) => {
        if (darkModeToggle) {
            localStorage.setItem('dark', false);
            document.querySelector("html").classList.remove("dark");
            dispatch({ type: "setDarkModeToggle", value: false });
        } else {
            localStorage.setItem('dark', true);
            document.querySelector("html").classList.add("dark");
            dispatch({ type: "setDarkModeToggle", value: true });
        }
    }

    return (
        <div className="flex">
            <AppBar position="fixed" open={open} className="bg-light-secondary-foreground shadow-md dark:bg-dark-secondary">
                <Toolbar className="justify-between">
                    <IconButton
                        color={darkModeToggle ? 'white' : 'black'}
                        aria-label="open drawer"
                        onClick={handleDrawer('mobile')}
                        sx={{ mr: 2, display: { xs: 'flex', md: 'none' }, }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <IconButton
                        color={darkModeToggle ? 'white' : 'black'}
                        aria-label="open drawer"
                        // edge="end"
                        onClick={handleDrawer('desktop')}
                        sx={{ mr: 2, display: { xs: 'none', md: 'flex' }, }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <div className="flex items-center gap-x-2">
                        <LinkRouter legacyBehavior href="/admin/panel/messages">
                            <a>
                                <IconButton
                                    color={darkModeToggle ? 'white' : 'black'}>
                                    <NotificationsIcon />
                                </IconButton>
                            </a>
                        </LinkRouter>
                        {darkModeToggle ? <IconButton
                            color={darkModeToggle ? 'white' : 'black'}
                            onClick={handleDarkMode}>
                            <Brightness7Icon />
                        </IconButton> : <IconButton
                            color={darkModeToggle ? 'white' : 'black'}
                            onClick={handleDarkMode}>
                            <Brightness4Icon />
                        </IconButton>}
                        <Button aria-describedby={id} variant="text" color={darkModeToggle ? 'white' : 'black'} size="medium" endIcon={<PersonIcon className="text-2xl" />}
                            className="rounded-lg bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5 p-2" onClick={handleClick}>
                            {adminInfo?.firstName && adminInfo?.lastName ? `${adminInfo?.firstName} ${adminInfo?.lastName}` :
                                <PatternFormat displayType="text" value={adminInfo?.mobileNumber} format="#### ### ## ##" dir="ltr" />}
                        </Button>
                        <Popover
                            id={id}
                            open={openPopover}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'center',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                            }}
                            slotProps={{ paper: { className: 'bg-light-secondary-foreground dark:bg-dark-alt rounded-2xl' } }}
                        >
                            <List color={darkModeToggle ? 'white' : 'black'}>
                                <ListItem disablePadding>
                                    <LinkRouter legacyBehavior href="/admin/panel/profile">
                                        <Button href="/admin/panel/profile" variant="text" color={darkModeToggle ? 'white' : 'black'} className={`w-full p-[8px_16px] ${router.pathname == '/admin/panel/profile' ? 'pointer-events-none' : ''}`}
                                            onClick={() => setAnchorEl(null)}>
                                            <ListItemText>پروفایل کاربری</ListItemText>
                                        </Button>
                                    </LinkRouter>
                                </ListItem>
                                <ListItem disablePadding>
                                    <Button variant="text" color={darkModeToggle ? 'white' : 'black'} className="w-full p-[8px_16px]" onClick={signout}>
                                        <ListItemText>خروج از حساب</ListItemText>
                                    </Button>
                                </ListItem>
                            </List>
                        </Popover>
                    </div>
                </Toolbar>

            </AppBar>
            <SwipeableDrawer
                disableBackdropTransition={true}
                disableDiscovery={true}
                disableSwipeToOpen={true}
                variant="temporary"
                open={mobileOpen}
                onOpen={() => { }}
                onClose={handleDrawer('mobile')}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', md: 'none' }
                }}
                PaperProps={{ className: 'bg-light-secondary-foreground dark:bg-dark-alt overflow-x-hidden' }}>
                {drawer}
            </SwipeableDrawer>
            <Drawer
                onClose={handleDrawer('desktop')}
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: drawerWidth,
                    flexShrink: 0
                }}
                variant="persistent"
                anchor="left"
                open={open}
                PaperProps={{ className: 'bg-light-secondary-foreground dark:bg-dark-alt overflow-x-hidden' }}>

                {drawer}
            </Drawer>
            <Main open={open} className="panel-main w-[87%] lg:w-[70%] 2xl:w-full flex justify-center mt-20 ">
                <div className="w-full lg:max-w-[90%] flex justify-center">
                    <div className="text-start w-full">
                        {children}
                    </div>
                </div>

            </Main>

            <CustomSnackbar open={snackbarProps?.open || false} content={snackbarProps?.content || ''} type={snackbarProps?.type || 'success'} duration={snackbarProps?.duration || 1000} refresh={snackbarProps?.refresh || 1} />
        </div>
    )
}

export default AdminPageLayout;