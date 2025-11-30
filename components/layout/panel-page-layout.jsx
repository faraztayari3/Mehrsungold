import { useState, useEffect, useRef } from "react";
import LinkRouter from "next/link";
import { useRouter } from "next/router";
import { styled, useTheme } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import Dialog from '@mui/material/Dialog'
import CloseIcon from '@mui/icons-material/Close'
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
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Chip from '@mui/material/Chip';

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

const PanelPageLayout = ({ children }) => {

    const { state, dispatch } = useAppContext();
    const { siteInfo, darkModeToggle, snackbarProps, userInfo, userLoading, refreshInventory, openBottomAuthenticate, showAuthenticate, hasMessage, refreshUnreadTickets } = state;

    const router = useRouter();
    const { locale } = useRouter();

    const [unReadTicketData, setUnReadTicketData] = useState({
        newMessageCount: 0,
        hasNewMessageForUser: 0
    });

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
     * Signs out the user by clearing the user token cookie, updating the login status,
     * and redirecting to the sign-in page.
     * @returns None
     */
    const signout = () => {
        setCookie(null, 'userToken', "", { path: '/' });
        dispatch({ type: 'setLoginStatus', value: false });
        setAnchorEl(null);
        router.push('/auth');
    }

    const menuItems = [
        { show: true, title: 'داشبورد', url: '/panel', href: '/panel', icon: <GridViewOutlinedIcon className="text-black dark:text-white" /> },
        { show: true, title: 'واریز تومان', url: '/panel/deposit', href: '/panel/deposit?type=online', icon: <svg viewBox="0 0 24 24" className="svg-icon text-black dark:text-white"><path d="M12.9 1.42c-.33 0-.66.059-.97.176a1 1 0 0 0-.003 0l-7.26 2.742c-1.4.53-2.33 1.88-2.33 3.377v4.81a6.144 6.144 0 0 0-.476 7.058 6.13 6.13 0 0 0 5.28 2.994c1.196 0 2.32-.344 3.27-.948a1 1 0 0 0 .17.034h6.694c2.437 0 4.438-2.003 4.438-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2-4.438-4.438-4.438h-1.643V4.16a2.728 2.728 0 0 0-1.18-2.251 2.738 2.738 0 0 0-1.553-.489zm-.094 2.006a.754.754 0 0 1 .51.125.73.73 0 0 1 .23.266.736.736 0 0 1 .086.341 1 1 0 0 0 0 .002v2.473H6.777c-.879 0-1.7.264-2.393.711.12-.516.48-.941.99-1.135l7.26-2.742a.721.721 0 0 1 .172-.04zM6.777 8.633h10.5a2.435 2.435 0 0 1 2.438 2.438v.318h-.847c-.771 0-1.5.312-2.023.846a2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904l.05-.084c.57-.93.895-2.024.895-3.176a6.172 6.172 0 0 0-3.502-5.564 6.159 6.159 0 0 0-5.467.063 2.434 2.434 0 0 1 2.43-2.268zm.477 3.6a4.177 4.177 0 0 1 3.42 1.947c.419.666.64 1.436.64 2.223 0 .783-.217 1.52-.6 2.14a1 1 0 0 0-.01.02 3.66 3.66 0 0 1-.802.954 1 1 0 0 0-.027.023 4.039 4.039 0 0 1-2.734 1.037 1 1 0 0 0-.002 0 4.137 4.137 0 0 1-3.563-2.019 1 1 0 0 0-.005-.014 4.07 4.07 0 0 1-.604-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .005-.003 4.17 4.17 0 0 1 2.721-.915zm11.61 1.156h1.816v1.748h-1.705c-.5 0-.945-.37-.98-.793a1 1 0 0 0-.003-.012.83.83 0 0 1 .254-.68 1 1 0 0 0 .018-.017.803.803 0 0 1 .6-.246zm-11.73.568a.75.75 0 0 0-.75.75v.907h-.94a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75h.94v.986a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75v-.986h.945a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75h-.945v-.907a.75.75 0 0 0-.75-.75z"></path></svg> },
        { show: true, title: 'برداشت تومان', url: '/panel/withdraw', href: '/panel/withdraw', icon: <svg viewBox="0 0 24 24" className="svg-icon text-black dark:text-white"><path d="M12.9 1.42c-.33 0-.658.059-.969.176a1 1 0 0 0-.002 0L4.667 4.338A3.615 3.615 0 0 0 2.34 7.715v4.81a6.144 6.144 0 0 0-.476 7.058 6.124 6.124 0 0 0 5.28 2.994 6.083 6.083 0 0 0 3.269-.948 1 1 0 0 0 .17.034h6.693c2.437 0 4.439-2.003 4.439-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2.002-4.437-4.44-4.437h-1.642V4.161c0-.443-.106-.88-.311-1.273a2.733 2.733 0 0 0-.87-.978 2.738 2.738 0 0 0-1.552-.49zm-.092 2.006a.738.738 0 0 1 .824.732 1 1 0 0 0 0 .002v2.473H6.777c-.88 0-1.7.263-2.393.711.12-.516.48-.941.99-1.135l7.263-2.742a.721.721 0 0 1 .172-.04zm-6.03 5.207h10.5a2.435 2.435 0 0 1 2.437 2.438v.318h-.845a2.84 2.84 0 0 0-2.025.846 2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904c.017-.028.036-.055.053-.084a6.07 6.07 0 0 0 .892-3.176A6.17 6.17 0 0 0 4.35 10.9a2.434 2.434 0 0 1 2.43-2.267zm.478 3.6a4.168 4.168 0 0 1 1.693.41c.709.34 1.308.872 1.727 1.537.419.666.64 1.436.64 2.223 0 .783-.219 1.52-.601 2.14a1 1 0 0 0-.012.02c-.214.367-.49.693-.8.954a1 1 0 0 0-.028.023 4.034 4.034 0 0 1-2.732 1.037 1 1 0 0 0-.002 0 4.144 4.144 0 0 1-3.563-2.019 1 1 0 0 0-.008-.014 4.069 4.069 0 0 1-.602-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .004-.003 4.177 4.177 0 0 1 2.723-.915zm11.61 1.156h1.816v1.748h-1.707c-.5 0-.945-.37-.98-.793a1 1 0 0 0 0-.012.828.828 0 0 1 .251-.68 1 1 0 0 0 .018-.017.807.807 0 0 1 .601-.246zm-13.42 2.266a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.748h3.383a.75.75 0 0 0 .75-.748.75.75 0 0 0-.75-.75z"></path></svg> },
        { show: true, title: (siteInfo?.paidModules && siteInfo?.paidModules?.includes('OrderBook')) && userInfo?.orderBookIsActive ? 'معامله آنی' : 'معامله', url: '/panel/trade', href: '/panel/trade?type=buy', icon: <svg viewBox="0 0 24 24" className="svg-icon text-black dark:text-white"><path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path></svg> },
        {
            show: (siteInfo?.paidModules && siteInfo?.paidModules?.includes('OrderBook')) && userInfo?.orderBookIsActive ? true : false, title: 'معامله پیشرفته', url: '/panel/trade/orderbook', href: '/panel/trade/orderbook?type=buy', icon: <svg width="24" height="24" viewBox="0 0 24 24" className="svg-icon text-black dark:text-white">
                <path d="M14.9702 22.75H8.97021C3.54022 22.75 1.22021 20.43 1.22021 15V9C1.22021 3.57 3.54022 1.25 8.97021 1.25H14.9702C20.4002 1.25 22.7202 3.57 22.7202 9V15C22.7202 20.43 20.4102 22.75 14.9702 22.75ZM8.97021 2.75C4.36021 2.75 2.72021 4.39 2.72021 9V15C2.72021 19.61 4.36021 21.25 8.97021 21.25H14.9702C19.5802 21.25 21.2202 19.61 21.2202 15V9C21.2202 4.39 19.5802 2.75 14.9702 2.75H8.97021Z" fill="currentColor" />
                <path d="M11.4502 18.06C11.2102 18.06 10.6302 17.97 10.2902 17.1L9.15023 14.22C8.99023 13.81 8.42023 13.43 7.99023 13.43L1.99023 13.45C1.58023 13.45 1.24023 13.12 1.24023 12.7C1.24023 12.29 1.57023 11.95 1.99023 11.95L7.99023 11.93H8.00023C9.05023 11.93 10.1702 12.69 10.5602 13.67L11.4702 15.97L13.5302 10.75C13.8402 9.97001 14.3902 9.86001 14.6202 9.84001C14.8502 9.83001 15.4102 9.88001 15.8002 10.62L16.8402 12.59C17.0202 12.93 17.5602 13.26 17.9502 13.26H22.0102C22.4202 13.26 22.7602 13.6 22.7602 14.01C22.7602 14.42 22.4202 14.76 22.0102 14.76H17.9502C17.0002 14.76 15.9602 14.13 15.5202 13.29L14.7402 11.81L12.6402 17.1C12.2702 17.96 11.6802 18.06 11.4502 18.06Z" fill="currentColor" />
            </svg>
        },
        { show: true, title: 'گزارشات', url: '/panel/history', href: '/panel/history', icon: <svg viewBox="0 0 24 24" className="svg-icon text-black dark:text-white"><path d="M6.33 2.285a1 1 0 0 0-.41.088s-.375.165-.77.451c-.394.286-1.006.721-1.006 1.65v15.05c0 1.194.99 2.19 2.186 2.19h11.34a2.204 2.204 0 0 0 2.184-2.19V8.104a1 1 0 0 0-.289-.705l-4.803-4.818a1 1 0 0 0-.709-.295zm.26 2h6.359v2.799c0 1.161.959 2.125 2.12 2.125h2.788v10.32c0 .124-.068.19-.186.19H6.331c-.118 0-.185-.066-.185-.19V4.609c.004.063.03-.054.18-.162.127-.093.185-.115.265-.156zm8.109 1.064 2.105 2.111H15.07c-.22 0-.371-.152-.371-.377zM8.568 9.79a.875.875 0 0 0-.875.875.875.875 0 0 0 .875.875H12.3a.875.875 0 0 0 .875-.875.875.875 0 0 0-.875-.875zm0 2.939a.875.875 0 0 0-.875.875.875.875 0 0 0 .875.875h5.357a.875.875 0 0 0 .875-.875.875.875 0 0 0-.875-.875zm0 2.938a.875.875 0 0 0-.875.877.875.875 0 0 0 .875.875h6.863a.875.875 0 0 0 .875-.875.875.875 0 0 0-.875-.877z"></path></svg> },
        { show: true, title: 'محصولات', url: '/panel/order', href: '/panel/order', icon: <svg viewBox="0 0 24 24" className="svg-icon text-black dark:text-white"><path d="M20.8 1.406a.188.188 0 0 0-.178.176l-.082 1.365-1.6-.26c-.22-.036-.307.276-.1.36l1.274.5-.743 1.44c-.108.202.171.386.313.205l.867-1.057 1.143 1.15c.158.156.407-.043.291-.232l-.736-1.152 1.447-.73c.203-.1.088-.408-.13-.35l-1.325.344-.246-1.602a.188.188 0 0 0-.195-.158zm-7.494.953a.751.751 0 0 0-.27.004c-1.094.22-3.418.994-4.324 1.36a.75.75 0 0 0-.412.411c-.415 1.011-.622 2.1-.787 2.85a.757.757 0 0 0-.01.275c.038.245.123.367.198.477.065.097.084.157.244.272.694.563 4.124 3.46 5.643 4.586.372.244.661.304 1.055.27.276-.044.477-.131.543-.153l4.537-1.52c.414-.132.69-.538.714-.573a.75.75 0 0 0 .114-.619l-.66-2.547a.748.748 0 0 0-.135-.273l-.31-.397-.03-.01a.742.742 0 0 0-.068-.081c-.489-.35-1.612-1.224-2.756-2.092-1.144-.868-2.291-1.723-3.031-2.15a.748.748 0 0 0-.254-.09zm-.252 1.563c.599.373 1.593 1.086 2.631 1.873.64.486 1.05.796 1.576 1.197-.992.322-1.963.637-2.75.928-.902-.729-2.199-1.85-3.031-2.465a.75.75 0 1 0-.893 1.205c.74.548 2.135 1.751 3.104 2.525-.07.474-.1.943-.14 1.447C11.994 9.4 9.81 7.596 9.067 6.986c.136-.63.307-1.325.539-1.975.845-.316 2.589-.881 3.449-1.09zM4.956 5.533a.2.2 0 0 0-.191.188l-.059.97-1.15-.185c-.233-.034-.323.292-.106.383l.907.355-.533 1.037c-.108.212.179.401.332.219l.619-.752.82.828c.169.166.436-.047.31-.248l-.523-.82 1.041-.526c.22-.106.095-.438-.14-.373l-.942.244-.178-1.152a.2.2 0 0 0-.207-.168zm13.56 2.615.445 1.717-3.967 1.324c.045-.667.092-1.34.184-1.916.911-.328 2.309-.785 3.338-1.125zm-17.16 3.57v8.922h4.91v-.687h.242l6.17 2.027c.314.103.568.116.873.115.306-.001.597.014 1.008-.2l7.627-3.956c.496-.258.838-.726.96-1.2.12-.473.06-.946-.118-1.36-.178-.415-.484-.791-.926-1.027s-1.026-.292-1.562-.106l-3.955 1.373c-.196-.91-.972-1.736-2.139-1.736h-3.258l-2.465-1.297H6.266v-.867zm1.75 1.75h1.408v5.422H3.106zm3.16.865h2.025l2.465 1.3h3.689c.603 0 .553.174.55.322-.001.147.004.35-.55.35h-2.496a.875.875 0 0 0 0 1.747h2.496c.33 0 .563-.034.86-.137l5.808-2.016c.12-.041.124-.024.162-.003.039.02.106.081.145.172.039.09.04.192.03.236-.012.044.002.042-.071.08l-7.627 3.957c.133-.069-.046.003-.207.004-.162 0-.372-.045-.32-.028l-6.438-2.115h-.524z"></path></svg> },
        {
            show: siteInfo?.giftCardIsActive ? true : false, title: 'گیفت کارت', url: '/panel/giftcards', href: '/panel/giftcards', icon: <svg width="24" height="24" viewBox="0 0 24 24" className="svg-icon text-black dark:text-white">
                <path d="M15.97 22.75H7.96997C4.54997 22.75 3.21997 21.42 3.21997 18V10C3.21997 9.59 3.55997 9.25 3.96997 9.25H19.97C20.38 9.25 20.72 9.59 20.72 10V18C20.72 21.42 19.39 22.75 15.97 22.75ZM4.71997 10.75V18C4.71997 20.58 5.38997 21.25 7.96997 21.25H15.97C18.55 21.25 19.22 20.58 19.22 18V10.75H4.71997Z" fill="currentColor" />
                <path d="M19.5 10.75H4.5C2.75 10.75 1.75 9.75 1.75 8V7C1.75 5.25 2.75 4.25 4.5 4.25H19.5C21.2 4.25 22.25 5.3 22.25 7V8C22.25 9.7 21.2 10.75 19.5 10.75ZM4.5 5.75C3.59 5.75 3.25 6.09 3.25 7V8C3.25 8.91 3.59 9.25 4.5 9.25H19.5C20.38 9.25 20.75 8.88 20.75 8V7C20.75 6.12 20.38 5.75 19.5 5.75H4.5Z" fill="currentColor" />
                <path d="M11.64 5.75H6.11997C5.90997 5.75 5.70997 5.66001 5.56997 5.51C4.95997 4.84 4.97997 3.81 5.61997 3.17L7.03997 1.75C7.69997 1.09 8.78997 1.09 9.44997 1.75L12.17 4.47C12.38 4.68 12.45 5.01 12.33 5.29C12.22 5.57 11.95 5.75 11.64 5.75ZM6.66997 4.25001H9.83997L8.38997 2.81C8.30997 2.73 8.17997 2.73 8.09997 2.81L6.67997 4.23001C6.67997 4.24001 6.66997 4.24001 6.66997 4.25001Z" fill="currentColor" />
                <path d="M17.87 5.75H12.35C12.05 5.75 11.77 5.57 11.66 5.29C11.54 5.01 11.61 4.69 11.82 4.47L14.54 1.75C15.2 1.09 16.29 1.09 16.95 1.75L18.37 3.17C19.01 3.81 19.04 4.84 18.42 5.51C18.28 5.66001 18.08 5.75 17.87 5.75ZM14.17 4.25001H17.34C17.33 4.24001 17.33 4.24001 17.32 4.23001L15.9 2.81C15.82 2.73 15.69 2.73 15.61 2.81L14.17 4.25001Z" fill="currentColor" />
                <path d="M9.94 16.9C9.66 16.9 9.37 16.83 9.11 16.69C8.54 16.38 8.19 15.79 8.19 15.15V10C8.19 9.59 8.53 9.25 8.94 9.25H14.98C15.39 9.25 15.73 9.59 15.73 10V15.13C15.73 15.78 15.38 16.37 14.81 16.67C14.24 16.98 13.55 16.94 13.01 16.58L12.12 15.98C12.04 15.92 11.93 15.92 11.84 15.98L10.9 16.6C10.61 16.8 10.27 16.9 9.94 16.9ZM9.69 10.75V15.14C9.69 15.27 9.77 15.33 9.82 15.36C9.87 15.39 9.97 15.42 10.08 15.35L11.02 14.73C11.61 14.34 12.37 14.34 12.95 14.73L13.84 15.33C13.95 15.4 14.05 15.37 14.1 15.34C14.15 15.31 14.23 15.25 14.23 15.12V10.74H9.69V10.75Z" fill="currentColor" />
            </svg>
        },
        {
            show: siteInfo?.stakeIsActive ? true : false, title: 'سپرده گذاری', url: '/panel/stakings', href: '/panel/stakings', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-icon text-black dark:text-white">
                <path d="M11.7904 11.88C11.2504 11.88 10.7004 11.78 10.2704 11.59L4.37039 8.97C2.87039 8.3 2.65039 7.4 2.65039 6.91C2.65039 6.42 2.87039 5.52 4.37039 4.85L10.2704 2.23C11.1404 1.84 12.4504 1.84 13.3204 2.23L19.2304 4.85C20.7204 5.51 20.9504 6.42 20.9504 6.91C20.9504 7.4 20.7304 8.3 19.2304 8.97L13.3204 11.59C12.8804 11.79 12.3404 11.88 11.7904 11.88ZM11.7904 3.44C11.4504 3.44 11.1204 3.49 10.8804 3.6L4.98039 6.22C4.37039 6.5 4.15039 6.78 4.15039 6.91C4.15039 7.04 4.37039 7.33 4.97039 7.6L10.8704 10.22C11.3504 10.43 12.2204 10.43 12.7004 10.22L18.6104 7.6C19.2204 7.33 19.4404 7.04 19.4404 6.91C19.4404 6.78 19.2204 6.49 18.6104 6.22L12.7104 3.6C12.4704 3.5 12.1304 3.44 11.7904 3.44Z" fill="currentColor" />
                <path d="M12 17.09C11.62 17.09 11.24 17.01 10.88 16.85L4.09 13.83C3.06 13.38 2.25 12.13 2.25 11C2.25 10.59 2.59 10.25 3 10.25C3.41 10.25 3.75 10.59 3.75 11C3.75 11.55 4.2 12.24 4.7 12.47L11.49 15.49C11.81 15.63 12.18 15.63 12.51 15.49L19.3 12.47C19.8 12.25 20.25 11.55 20.25 11C20.25 10.59 20.59 10.25 21 10.25C21.41 10.25 21.75 10.59 21.75 11C21.75 12.13 20.94 13.38 19.91 13.84L13.12 16.86C12.76 17.01 12.38 17.09 12 17.09Z" fill="currentColor" />
                <path d="M12 22.09C11.62 22.09 11.24 22.01 10.88 21.85L4.09 18.83C2.97 18.33 2.25 17.22 2.25 15.99C2.25 15.58 2.59 15.24 3 15.24C3.41 15.24 3.75 15.59 3.75 16C3.75 16.63 4.12 17.21 4.7 17.47L11.49 20.49C11.81 20.63 12.18 20.63 12.51 20.49L19.3 17.47C19.88 17.21 20.25 16.64 20.25 16C20.25 15.59 20.59 15.25 21 15.25C21.41 15.25 21.75 15.59 21.75 16C21.75 17.23 21.03 18.34 19.91 18.84L13.12 21.86C12.76 22.01 12.38 22.09 12 22.09Z" fill="currentColor" />
            </svg>
        },
        {
            show: true, title: 'کارت های بانکی', url: '/panel/bankaccounts', href: '/panel/bankaccounts', icon: <svg width="24" height="24" viewBox="0 0 24 24" className="svg-icon text-black dark:text-white">
                <path d="M22 9.25H2C1.59 9.25 1.25 8.91 1.25 8.5C1.25 8.09 1.59 7.75 2 7.75H22C22.41 7.75 22.75 8.09 22.75 8.5C22.75 8.91 22.41 9.25 22 9.25Z" fill="currentColor" />
                <path d="M8 17.25H6C5.59 17.25 5.25 16.91 5.25 16.5C5.25 16.09 5.59 15.75 6 15.75H8C8.41 15.75 8.75 16.09 8.75 16.5C8.75 16.91 8.41 17.25 8 17.25Z" fill="currentColor" />
                <path d="M14.5 17.25H10.5C10.09 17.25 9.75 16.91 9.75 16.5C9.75 16.09 10.09 15.75 10.5 15.75H14.5C14.91 15.75 15.25 16.09 15.25 16.5C15.25 16.91 14.91 17.25 14.5 17.25Z" fill="currentColor" />
                <path d="M17.56 21.25H6.44C2.46 21.25 1.25 20.05 1.25 16.11V7.89C1.25 3.95 2.46 2.75 6.44 2.75H17.55C21.53 2.75 22.74 3.95 22.74 7.89V16.1C22.75 20.05 21.54 21.25 17.56 21.25ZM6.44 4.25C3.3 4.25 2.75 4.79 2.75 7.89V16.1C2.75 19.2 3.3 19.74 6.44 19.74H17.55C20.69 19.74 21.24 19.2 21.24 16.1V7.89C21.24 4.79 20.69 4.25 17.55 4.25H6.44Z" fill="currentColor" />
            </svg>
        },
        {
            show: true, title: 'تیکت ها', url: '/panel/tickets', href: '/panel/tickets', name: 'ticket', icon: <svg width="24" height="24" viewBox="0 0 24 24" className="svg-icon text-black dark:text-white">
                <path d="M12 22.81C11.31 22.81 10.66 22.46 10.2 21.85L8.7 19.85C8.67 19.81 8.55 19.76 8.5 19.75H8C3.83 19.75 1.25 18.62 1.25 13V8C1.25 3.58 3.58 1.25 8 1.25H16C20.42 1.25 22.75 3.58 22.75 8V13C22.75 17.42 20.42 19.75 16 19.75H15.5C15.42 19.75 15.35 19.79 15.3 19.85L13.8 21.85C13.34 22.46 12.69 22.81 12 22.81ZM8 2.75C4.42 2.75 2.75 4.42 2.75 8V13C2.75 17.52 4.3 18.25 8 18.25H8.5C9.01 18.25 9.59 18.54 9.9 18.95L11.4 20.95C11.75 21.41 12.25 21.41 12.6 20.95L14.1 18.95C14.43 18.51 14.95 18.25 15.5 18.25H16C19.58 18.25 21.25 16.58 21.25 13V8C21.25 4.42 19.58 2.75 16 2.75H8Z" fill="currentColor" />
                <path d="M12 12C11.44 12 11 11.55 11 11C11 10.45 11.45 10 12 10C12.55 10 13 10.45 13 11C13 11.55 12.56 12 12 12Z" fill="currentColor" />
                <path d="M16 12C15.44 12 15 11.55 15 11C15 10.45 15.45 10 16 10C16.55 10 17 10.45 17 11C17 11.55 16.56 12 16 12Z" fill="currentColor" />
                <path d="M8 12C7.44 12 7 11.55 7 11C7 10.45 7.45 10 8 10C8.55 10 9 10.45 9 11C9 11.55 8.56 12 8 12Z" fill="currentColor" />
            </svg>

        }
    ]

    const drawer = (
        <div style={{ width: drawerWidth }} className="flex flex-col gap-y-7 h-full">
            <LinkRouter legacyBehavior href="/">
                <Link href="/" className="text-white">
                    <div className="flex flex-col cursor-pointer mt-5 lg:mt-10">
                        <div className="text-[2rem] flex items-center justify-evenly">
                            <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${darkModeToggle ? siteInfo?.darkIconImage : siteInfo?.lightIconImage}`} alt="icon" className="svgr w-[5rem] h-[5rem] me-[0.3rem] text-black dark:text-white" />
                            <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${darkModeToggle ? siteInfo?.darkLogoImage : siteInfo?.lightLogoImage}`} alt="logo" className="svgr h-[3rem] text-black dark:text-white" />
                        </div>
                        {/* <span className="text-small-1 self-center">بازار امن</span> */}
                    </div>
                </Link>
            </LinkRouter>
            <div className="flex flex-col justify-between h-full">
                <List color="inherit">
                    {menuItems.map((data, index) => {
                        if (data.show) {
                            return (
                                <ListItem key={index} disablePadding className={`${router.pathname == data.url ? 'pointer-events-none bg-primary bg-opacity-15' : ''}`}
                                    onClick={() => setMobileOpen(!mobileOpen)}>
                                    <LinkRouter legacyBehavior href={data.href}>
                                        <Button href={data.href} variant="text" color={darkModeToggle ? 'white' : 'black'} className="w-full p-[8px_16px]">
                                            <ListItemIcon color="inherit">
                                                {data.icon}
                                            </ListItemIcon>
                                            <ListItemText className="text-start *:flex *:items-center *:justify-between *:w-full">
                                                {data.title}
                                                {data.name == 'ticket' && unReadTicketData?.newMessageCount > 0 ?
                                                    <Chip label={`${unReadTicketData?.newMessageCount} تیکت جدید`} variant="outlined" size="small" className="w-fit badge badge-error" /> : ''}
                                            </ListItemText>
                                        </Button>
                                    </LinkRouter>
                                </ListItem>
                            )
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

    const [prevPath, setPrevPath] = useState(router.pathname);
    // useEffect(() => {
    //     const handleRouteChange = (url) => {
    //         const pathWithoutQuery = url.split('?')[0];
    //         if (pathWithoutQuery !== prevPath) {
    //             setPrevPath(pathWithoutQuery);
    //             if (pathWithoutQuery !== '/') {
    //                 dispatch({
    //                     type: 'setUserLoading',
    //                     value: true
    //                 });
    //             }
    //         }
    //     }

    //     router.events.on('routeChangeStart', handleRouteChange);
    //     return () => {
    //         router.events.off('routeChangeStart', handleRouteChange);
    //     }
    // }, [prevPath]);

    useEffect(() => {
        getUserInformation();
    }, []);

    const [autoRefresh, setAutoRefresh] = useState(false);
    const userInfoRef = useRef(userInfo);
    useEffect(() => {
        userInfoRef.current = userInfo;
    }, [userInfo]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            getPrices(userInfoRef?.current?.level?._id, false);
        }, 15000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);
    useEffect(() => {
        if (refreshInventory) {
            getPrices(userInfoRef?.current?.level?._id, false);
        }
    }, [refreshInventory]);

    useEffect(() => {
        if (!localStorage.getItem("userNotifHidden")) {
            getPublicSettings();
        }
    }, []);

    /**
    * Retrieves user unread messages.
    * @returns None
    */
    useEffect(() => {
        getMessages();
    }, []);
    const getMessages = () => {
        ApiCall('/message/my-messages', 'GET', locale, {}, 'seen=false', 'user', router).then(async (result) => {
            dispatch({
                type: 'setHasMessage', value: result.data?.length > 0
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    /**
    * Retrieves user unread tickets.
    * @returns None
    */
    useEffect(() => {
        getUnreadTickets();
    }, [refreshUnreadTickets]);
    const getUnreadTickets = () => {
        ApiCall('/ticket', 'GET', locale, {}, 'limit=1', 'user', router).then(async (result) => {
            setUnReadTicketData({ ...unReadTicketData, newMessageCount: result.newMessageCount || 0, hasNewMessageForUser: result.hasNewMessageForUser || false });
        }).catch((error) => {
            console.log(error);
        });
    }

    const [showNotification, setShowNotification] = useState(false);
    const [openBottomNotificationDrawer, setOpenBottomNotificationDrawer] = useState(false);

    /**
     * Retrieves Public Settings.
     * @returns None
    */
    const [publicSetting, setPublicSetting] = useState();
    const [publicSettingLoading, setPublicSettingLoading] = useState(false);
    const getPublicSettings = () => {
        setPublicSettingLoading(true);
        ApiCall('/settings/public-settings', 'GET', locale, {}, '', 'user', router).then(async (result) => {
            if (!localStorage.getItem("userNotifHidden") && result?.userNotifications?.length > 0) {
                if (window.innerWidth >= 1024) {
                    setShowNotification(true);
                    setOpenBottomNotificationDrawer(false);
                } else {
                    setShowNotification(false);
                    setOpenBottomNotificationDrawer(true);
                }
            }
            setPublicSetting(result);
            setPublicSettingLoading(false);
        }).catch((error) => {
            setPublicSettingLoading(false);
            console.log(error);
        });
    }

    const handleCloseNotification = () => {
        localStorage.setItem("userNotifHidden", true);
        setShowNotification(false);
        setOpenBottomNotificationDrawer(false);
    }

    /**
     * Retrieves Prices Info base on the user level or user fee prices for the user.
     * @returns None
    */
    const getPrices = (levelId, initLoading) => {
        if (initLoading) {
            dispatch({
                type: 'setPriceLoading', value: true
            });
        }
        ApiCall('/transaction/user-prices', 'GET', locale, {}, ``, 'user', router).then(async (result) => {
            if (result.data?.length > 0) {
                getUserInventories(result.data);
            } else {
                getLevelPrices(levelId);
            }
        }).catch((error) => {
            dispatch({
                type: 'setPriceLoading', value: false
            });
            console.log(error);
        });
    }
    const getLevelPrices = (levelId) => {
        ApiCall('/level/prices', 'GET', locale, {}, `levelId=${levelId}`, 'user', router).then(async (result) => {
            getUserInventories(result.data || []);
        }).catch((error) => {
            dispatch({
                type: 'setPriceLoading', value: false
            });
            console.log(error);
        });
    }

    /**
     * Retrieves User Inventories for the user.
     * @returns None
    */
    const getUserInventories = (prices) => {
        ApiCall('/tradeable/user-inventory/me', 'GET', locale, {}, ``, 'user', router).then(async (result) => {
            const userInventories = result.data || [];
            const updatedPrices = prices?.map(price => {
                const inventoryBlocked = userInventories?.find(inventory =>
                    inventory.tradeable?._id === price.tradeable?._id && inventory.blocked === true);
                const inventoryAvailable = userInventories?.find(inventory =>
                    inventory.tradeable?._id === price.tradeable?._id && inventory.blocked === false);

                return {
                    ...price,
                    balance: inventoryAvailable ? inventoryAvailable?.balance : 0,
                    totalBlocked: inventoryBlocked ? inventoryBlocked?.balance : 0
                }
            });

            dispatch({
                type: 'setPriceInfo', value: updatedPrices
            });
            dispatch({
                type: 'setPriceLoading', value: false
            });
        }).catch((error) => {
            dispatch({
                type: 'setPriceLoading', value: false
            });
            console.log(error);
        });
    }

    /**
     * Retrieves User Info for the user.
     * @returns None
    */
    const getUserInformation = () => {
        dispatch({
            type: 'setUserLoading', value: true
        });
        ApiCall('/user/me', 'GET', locale, {}, '', 'user', router).then(async (result) => {
            getPrices(result?.level?._id, true);
            dispatch({
                type: 'setUserInfo', value: result
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
                        <LinkRouter legacyBehavior href="/panel/messages">
                            <a>
                                <IconButton
                                    color={darkModeToggle ? 'white' : 'black'}
                                    className="relative">
                                    {hasMessage ? <div className="w-2.5 h-2.5 md:w-2 md:h-2 bg-primary-red rounded-[50%] absolute top-4 md:top-3 rtl:right-4 ltr:left-4
                                    md:rtl:right-3 md:ltr:left-3"></div> : ''}
                                    <NotificationsIcon className="w-8 h-8 md:w-6 md:h-6" />
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
                            {userInfo?.firstName && userInfo?.lastName ? `${userInfo?.firstName} ${userInfo?.lastName}` :
                                <PatternFormat displayType="text" value={userInfo?.mobileNumber} format="#### ### ## ##" dir="ltr" />}
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
                                    <LinkRouter legacyBehavior href="/panel/profile">
                                        <Button href="/panel/profile" variant="text" color={darkModeToggle ? 'white' : 'black'} className={`w-full p-[8px_16px] ${router.pathname == '/panel/profile' ? 'pointer-events-none' : ''}`}
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
                <div className="w-full lg:max-w-[70rem] flex justify-center">
                    <div className="text-start w-full">
                        {userLoading ?
                            <div className="h-[50dvh] flex justify-center items-center"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> :
                            children}
                    </div>
                </div>

            </Main>

            {/* Notification */}
            <>
                <Dialog onClose={handleCloseNotification} open={showNotification} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <IconButton
                        color={darkModeToggle ? 'white' : 'black'}
                        className="absolute top-2 rtl:left-3 ltr:right-3"
                        onClick={handleCloseNotification}>
                        <CloseIcon />
                    </IconButton>
                    <p className="mt-8">
                        {publicSetting?.userNotifications?.length > 0 ? publicSetting?.userNotifications[0] : ''}
                    </p>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomNotificationDrawer}
                    onOpen={() => { }}
                    onClose={handleCloseNotification}
                    PaperProps={{ className: 'drawers', sx: { height: '50%' } }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <p>
                        {publicSetting?.userNotifications?.length > 0 ? publicSetting?.userNotifications[0] : ''}
                    </p>
                </SwipeableDrawer>
            </>

            {/* Authentication */}
            <>
                <Dialog onClose={() => {
                    dispatch({
                        type: 'setShowAuthenticate', value: false
                    });
                }} open={showAuthenticate} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6 mb-4">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">تائید حساب
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => dispatch({
                                    type: 'setShowAuthenticate', value: false
                                })}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" autoComplete="off">
                        <p className="text-center">جهت استفاده از امکانات {siteInfo?.title || 'صرافی'} نیاز است که احراز هویت خود را تکمیل نمائید.</p>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => {
                                    dispatch({
                                        type: 'setShowAuthenticate', value: false
                                    });
                                }}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LinkRouter legacyBehavior href="/panel/authentication">
                                <Button href="/panel/authentication" type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation
                                    onClick={() => dispatch({
                                        type: 'setShowAuthenticate', value: false
                                    })}>
                                    <text className="text-black font-semibold">احراز هویت</text>
                                </Button >
                            </LinkRouter>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomAuthenticate}
                    onOpen={() => { }}
                    onClose={() => {
                        dispatch({
                            type: 'setOpenBottomAuthenticate', value: false
                        });
                    }}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6 mb-4">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">تائید حساب
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => dispatch({
                                    type: 'setOpenBottomAuthenticate', value: false
                                })}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" autoComplete="off">
                        <p className="text-center">جهت استفاده از امکانات {siteInfo?.title || 'صرافی'} نیاز است که احراز هویت خود را تکمیل نمائید.</p>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => {
                                    dispatch({
                                        type: 'setOpenBottomAuthenticate', value: false
                                    });
                                }}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LinkRouter legacyBehavior href="/panel/authentication">
                                <Button href="/panel/authentication" type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation
                                    onClick={() => dispatch({
                                        type: 'setOpenBottomAuthenticate', value: false
                                    })}>
                                    <text className="text-black font-semibold">احراز هویت</text>
                                </Button >
                            </LinkRouter>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            <CustomSnackbar open={snackbarProps?.open || false} content={snackbarProps?.content || ''} type={snackbarProps?.type || 'success'} duration={snackbarProps?.duration || 1000} refresh={snackbarProps?.refresh || 1} />
        </div>
    )
}

export default PanelPageLayout;