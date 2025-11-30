import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import RefreshIcon from '@mui/icons-material/Refresh'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import CancelIcon from '@mui/icons-material/CancelOutlined'
import DeleteIcon from '@mui/icons-material/Delete'
import LoadingButton from '@mui/lab/LoadingButton'
import Pagination from '@mui/material/Pagination';
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import moment from 'jalali-moment'

import { PatternFormat } from 'react-number-format';
import { useQRCode } from 'next-qrcode'

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call"
import CheckCardNumber from "../../services/checkCardNumber"
import LogActions from "../../services/logActions"
import CopyData from "../../services/copy"

// Components
import ConfirmDialog from '../shared/ConfirmDialog';

/**
 * HistoryPageCompo component that displays the History Page Component of the website.
 * @returns The rendered History Page component.
 */
const HistoryPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, siteInfo, userInfo, priceInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();
    const { Image } = useQRCode();

    const [loading, setLoading] = useState(false);

    const [pageItem, setPageItem] = useState(1);
    const [tabValue, setTabValue] = useState(10);
    const [latestLogs, setLatestLogs] = useState([]);
    useEffect(() => {
        getTransactions('OnlineDeposit', 1, 1, true);
        getTransactions('OfflineDeposit', 1, 1, true);
        getTransactions('Withdraw', 1, 1, true);
        getTrades(1, 1, true);
        getProductsRequests(1, 1, true);
        getOrderbooks(1, 1, true);
        getTransfers(1, 1, true);
        getTransactions('IdDeposit', 1, 1, true);
        getGiftcardsOrders(1, 1, true);
    }, []);

    /**
        * Retrieves Transactions.
        * @returns None
       */
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [transactionsLimit, setTransactionsLimit] = useState(1);
    const [transactionsTotal, setTransactionsTotal] = useState(0);
    const getTrades = (page, limit, logs) => {
        setLoadingTransactions(true);
        ApiCall('/transaction', 'GET', locale, {}, `limit=${limit}&skip=${(page * limit) - limit}`, 'user', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setTransactions(result.data);
            if (tabValue == 10 || logs) {
                const modifiedResult = {
                    ...result,
                    data: result.data["0"]
                };
                delete modifiedResult["0"];

                setLatestLogs((prevLogs) => {
                    const filteredLogs = prevLogs.filter((log) => log.type !== 'trades');
                    return [...filteredLogs, { type: 'trades', ...modifiedResult }];
                });
            }
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }
    const getTransactions = (type, page, limit, logs) => {
        setLoadingTransactions(true);
        ApiCall('/balance-transaction/me', 'GET', locale, {}, `sortOrder=0&sortBy=createdAt&type=${type}&limit=${limit}&skip=${(page * limit) - limit}`, 'user', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setTransactions(result.data);
            if (tabValue == 10 || logs) {
                const modifiedResult = {
                    ...result,
                    data: result.data["0"]
                };
                delete modifiedResult["0"];
                setLatestLogs((prevLogs) => {
                    const filteredLogs = prevLogs.filter((log) => log.type !== type);
                    return [...filteredLogs, { type, ...modifiedResult }];
                });
            }
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }

    const getOrderbooks = (page, limit, logs) => {
        setLoadingTransactions(true);
        ApiCall('/order-book/me', 'GET', locale, {}, `sortOrder=0&sortBy=createdAt&limit=${limit}&skip=${(page * limit) - limit}`, 'user', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setTransactions(result.data);
            if (tabValue == 10 || logs) {
                const modifiedResult = {
                    ...result,
                    data: result.data["0"]
                };
                delete modifiedResult["0"];
                setLatestLogs((prevLogs) => {
                    const filteredLogs = prevLogs.filter((log) => log.type !== 'orderbooks');
                    return [...filteredLogs, { type: 'orderbooks', ...modifiedResult }];
                });
            }
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }

    const getTomanLogs = (page, limit) => {
        setLoadingTransactions(true);
        ApiCall(`/user/balance-log/me`, 'GET', locale, {}, `limit=${limit}&skip=${(page * limit) - limit}`, 'user', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setTransactions(result.data);
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }

    /**
    * Cancel a Order.
    * @returns None
   */
    const [cancelOrderLoading, setCancelOrderLoading] = useState(false);
    const cancelOrder = (orderId) => (event) => {
        event.preventDefault();
        setCancelOrderLoading(true);
        event.target.disabled = true;
        ApiCall(`/order-book/cancel-order/${orderId}`, 'PATCH', locale, {}, '', 'user', router).then(async (result) => {
            event.target.disabled = false;
            setCancelOrderLoading(false);
            getOrderbooks(pageItem, tabValue == 10 ? 1 : 10);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setCancelOrderLoading(false);
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

    /**
    * Cancel a Trade.
    * @returns None
   */
    const cancelFixedPriceOrder = (orderId) => (event) => {
        event.preventDefault();
        setCancelOrderLoading(true);
        event.target.disabled = true;
        ApiCall(`/transaction/${orderId}/cancel`, 'PATCH', locale, {}, '', 'user', router).then(async (result) => {
            event.target.disabled = false;
            setCancelOrderLoading(false);
            getTrades(pageItem, tabValue == 10 ? 1 : 10);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setCancelOrderLoading(false);
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

    const [transfers, setTransfers] = useState([]);
    const getTransfers = (page, limit, logs) => {
        setLoadingTransactions(true);
        ApiCall('/tradeable/transfer', 'GET', locale, {}, `limit=${limit}&skip=${(page * limit) - limit}`, 'user', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setTransfers(result.data);
            if (tabValue == 10 || logs) {
                const modifiedResult = {
                    ...result,
                    data: result.data["0"]
                };
                delete modifiedResult["0"];

                setLatestLogs((prevLogs) => {
                    const filteredLogs = prevLogs.filter((log) => log.type !== 'transfers');
                    return [...filteredLogs, { type: 'transfers', ...modifiedResult }];
                });
            }
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }

    const getGiftcardsOrders = (page, limit, logs) => {
        setLoadingTransactions(true);
        ApiCall('/gift-card', 'GET', locale, {}, `createdBy=${userInfo?._id}&sortOrder=0&sortBy=createdAt&limit=${limit}&skip=${(page * limit) - limit}`, 'user', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setTransactions(result.data);
            if (tabValue == 10 || logs) {
                const modifiedResult = {
                    ...result,
                    data: result.data["0"]
                };
                delete modifiedResult["0"];

                setLatestLogs((prevLogs) => {
                    const filteredLogs = prevLogs.filter((log) => log.type !== 'giftcards');
                    return [...filteredLogs, { type: 'giftcards', ...modifiedResult }];
                });
            }
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }

    const handleChange = (newTabValue) => (event) => {
        setTabValue(newTabValue);
        setPageItem(1);
        setTransactionsLimit(newTabValue == 10 ? 1 : 10);
        if (newTabValue == 0) {
            getTransactions('OnlineDeposit', 1, 10);
        } else if (newTabValue == 1) {
            getTransactions('OfflineDeposit', 1, 10);
        } else if (newTabValue == 2) {
            getTransactions('Withdraw', 1, 10);
        } else if (newTabValue == 3) {
            getTrades(1, 10);
        } else if (newTabValue == 5) {
            getProductsRequests(1, 10);
        } else if (newTabValue == 6) {
            getOrderbooks(1, 10);
        } else if (newTabValue == 7) {
            getTransfers(1, 10);
        } else if (newTabValue == 8) {
            getTransactions('IdDeposit', 1, 10);
        } else if (newTabValue == 9) {
            getTomanLogs(1, 10);
        } else if (newTabValue == 10) {
            getTransactions('OnlineDeposit', 1, 1, true);
            getTransactions('OfflineDeposit', 1, 1, true);
            getTransactions('Withdraw', 1, 1, true);
            getTrades(1, 1, true);
            getProductsRequests(1, 1, true);
            getOrderbooks(1, 1, true);
            getTransfers(1, 1, true);
            getTransactions('IdDeposit', 1, 1, true);
            getGiftcardsOrders(1, 1, true);
        } else if (newTabValue == 11) {
            getGiftcardsOrders(1, 10);
        }
    }

    const handlePageChange = (event, value) => {
        setPageItem(value);
        if (tabValue == 0) {
            getTransactions('OnlineDeposit', value, 10);
        } else if (tabValue == 1) {
            getTransactions('OfflineDeposit', value, 10);
        } else if (tabValue == 2) {
            getTransactions('Withdraw', value, 10);
        } else if (tabValue == 3) {
            getTrades(value, 10);
        } else if (tabValue == 5) {
            getProductsRequests(value, 10);
        } else if (tabValue == 6) {
            getOrderbooks(value, 10);
        } else if (tabValue == 7) {
            getTransfers(value, 10);
        } else if (tabValue == 8) {
            getTransactions('IdDeposit', value, 10);
        } else if (tabValue == 9) {
            getTomanLogs(value, 10);
        } else if (tabValue == 11) {
            getGiftcardsOrders(value, 10);
        }
    }

    const handleRefresh = (event) => {
        if (tabValue == 0) {
            getTransactions('OnlineDeposit', pageItem, 10);
        } else if (tabValue == 1) {
            getTransactions('OfflineDeposit', pageItem, 10);
        } else if (tabValue == 2) {
            getTransactions('Withdraw', pageItem, 10);
        } else if (tabValue == 3) {
            getTrades(pageItem, 10);
        } else if (tabValue == 5) {
            getProductsRequests(pageItem, 10);
        } else if (tabValue == 6) {
            getOrderbooks(pageItem, 10);
        } else if (tabValue == 7) {
            getTransfers(pageItem, 10);
        } else if (tabValue == 8) {
            getTransactions('IdDeposit', pageItem, 10);
        } else if (tabValue == 9) {
            getTomanLogs(pageItem, 10);
        } else if (tabValue == 10) {
            getTransactions('OnlineDeposit', pageItem, 1, true);
            getTransactions('OfflineDeposit', pageItem, 1, true);
            getTransactions('Withdraw', pageItem, 1, true);
            getTrades(pageItem, 1, true);
            getProductsRequests(pageItem, 1, true);
            getOrderbooks(pageItem, 1, true);
            getTransfers(pageItem, 1, true);
            getTransactions('IdDeposit', pageItem, 1, true);
            getGiftcardsOrders(pageItem, 1, true);
        } else if (tabValue == 11) {
            getGiftcardsOrders(pageItem, 10);
        }
    }

    const [itemData, setItemData] = useState('');
    const [showReject, setShowReject] = useState(false);
    const [openBottomRejectDrawer, setOpenBottomRejectDrawer] = useState(false);
    const handleShowReject = (data) => (event) => {
        event.stopPropagation();
        setItemData(data);
        if (window.innerWidth >= 1024) {
            setShowReject(true);
            setOpenBottomRejectDrawer(false);
        } else {
            setShowReject(false);
            setOpenBottomRejectDrawer(true);
        }
    }

    const [openDialog, setOpenDialog] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const handleOpenDialog = (transactionId) => (event) => {
        setTransactionId(transactionId);
        setOpenDialog(true);
    }
    const handleCloseDialog = () => {
        setOpenDialog(false);
    }
    const handlePayLater = () => {
        setLoading(true);
        ApiCall(`/transaction/pay-later-buy/${transactionId}/pay`, 'PATCH', locale, {}, '', 'user', router).then(async (result) => {
            setLoading(false);
            getTrades(pageItem, 10);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
            handleCloseDialog();
        }).catch((error) => {
            handleCloseDialog();
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

    /**
        * Retrieves Products Requests.
        * @returns None
       */
    const [requests, setRequests] = useState([]);
    const getProductsRequests = (page, limit, logs) => {
        setLoadingTransactions(true);
        ApiCall('/product-request', 'GET', locale, {}, `sortOrder=0&sortBy=createdAt&limit=${limit}&skip=${(page * limit) - limit}`, 'user', router).then(async (result) => {
            setTransactionsTotal(result.count);
            setRequests(result.data);
            if (tabValue == 10 || logs) {
                const modifiedResult = {
                    ...result,
                    data: result.data["0"]
                };
                delete modifiedResult["0"];
                setLatestLogs((prevLogs) => {
                    const filteredLogs = prevLogs.filter((log) => log.type !== 'requests');
                    return [...filteredLogs, { type: 'requests', ...modifiedResult }];
                });
            }
            setLoadingTransactions(false);
        }).catch((error) => {
            setLoadingTransactions(false);
            console.log(error);
        });
    }

    const [openGiftcardDialog, setOpenGiftcardDialog] = useState(false);
    const [giftcardId, setGiftcardId] = useState('');

    const handleOpenGiftcardDialog = (giftcardId) => (event) => {
        event.stopPropagation();
        setGiftcardId(giftcardId);
        setOpenGiftcardDialog(true);
    }
    const handleCloseGiftcardDialog = () => {
        setOpenGiftcardDialog(false);
    }

    /**
    * Delete a Giftcard Order.
    * @returns None
   */
    const [deleteGiftcardLoading, setDeleteGiftcardLoading] = useState(false);
    const deleteGiftcardOrder = () => {
        setDeleteGiftcardLoading(true);
        ApiCall(`/gift-card/${giftcardId}`, 'DELETE', locale, {}, '', 'user', router).then(async (result) => {
            setDeleteGiftcardLoading(false);
            getGiftcardsOrders(pageItem, 10);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
            handleCloseGiftcardDialog();
        }).catch((error) => {
            setDeleteGiftcardLoading(false);
            console.log(error);
            handleCloseGiftcardDialog();
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
    const openInNewTab = (index) => () => {
        const imgElement = document.querySelector(`div#qrcode${index} img`);
        const imgSrc = imgElement.src;

        const newWindow = window.open();
        newWindow.document.body.innerHTML = `<img src="${imgSrc}" alt="QR Code" />`;
    }

    return (
        <div className="xl:max-w-[50rem] xl:mx-auto">
            <section>
                <div className="flex items-center justify-between">
                    <h1 className="text-large-3">تاریخچه</h1>
                    <IconButton
                        color={`${darkModeToggle ? 'white' : 'black'}`}
                        onClick={handleRefresh}>
                        <RefreshIcon />
                    </IconButton>
                </div>
            </section>
            <section className="my-10">
                <Tabs variant="fullWidth" indicatorColor="primary" textColor="inherit" value={tabValue} className="w-full *:!overflow-x-auto *:!overflow-y-hidden custom-scroll history-tabs pb-1"
                    TabIndicatorProps={{ className: 'mb-1' }}>
                    <Tab label="جدیدترین ها" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} value={10} onClick={handleChange(10)} />
                    <Tab label="واریز" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} value={0} onClick={handleChange(0)} />
                    <Tab label="واریز دستی" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} value={1} onClick={handleChange(1)} />
                    {siteInfo?.idDepositIsActive ? <Tab label="واریز با شناسه" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} value={8} onClick={handleChange(8)} /> : ''}
                    <Tab label="برداشت" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} value={2} onClick={handleChange(2)} />
                    <Tab label="تغییرات تومان" className="whitespace-nowrap w-fit" classes={{ selected: 'text-primary' }} value={9} onClick={handleChange(9)} />
                    {(siteInfo?.paidModules && siteInfo?.paidModules?.includes('OrderBook')) && userInfo?.orderBookIsActive ? [
                        <Tab key={1} label="معاملات آنی" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} value={3} onClick={handleChange(3)} />,
                        <Tab key={2} label="معاملات پیشرفته" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} value={6} onClick={handleChange(6)} />
                    ] : (
                        <Tab label="معاملات" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} value={3} onClick={handleChange(3)} />
                    )}
                    <Tab label="سبد تحویل" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} value={5} onClick={handleChange(5)} />
                    <Tab label="انتقال دارایی" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} value={7} onClick={handleChange(7)} />
                    <Tab label="درخواست های گیفت کارت" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} value={11} onClick={handleChange(11)} />
                </Tabs>
                <div>
                    {loadingTransactions ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> :
                        <div className="grid grid-cols-12 gap-y-4 py-8">
                            {tabValue == 10 ?
                                latestLogs.length > 0 ? (
                                    (() => {
                                        const logsMap = latestLogs.reduce((acc, log) => {
                                            acc[log.type] = log;
                                            return acc;
                                        }, {});

                                        const displayOrder = [
                                            'OnlineDeposit',
                                            'OfflineDeposit',
                                            'IdDeposit',
                                            'Withdraw',
                                            'trades',
                                            'orderbooks',
                                            'requests',
                                            'transfers',
                                            'giftcards'
                                        ]

                                        const renderContentByType = (type, data) => {
                                            switch (type) {
                                                case 'OnlineDeposit':
                                                    if (data.data) {
                                                        return (
                                                            <>
                                                                <div className="col-span-12 flex items-center gap-x-4">
                                                                    <span className="whitespace-nowrap">واریز درگاه</span>
                                                                    <Divider component="div" className="flex-[1_0_60%] dark:bg-primary dark:bg-opacity-50" />
                                                                </div>
                                                                <Accordion className="custom-accordion disable col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                                                    <AccordionSummary
                                                                        className="font-medium text-black w-full !cursor-default *:!my-3"
                                                                        expandIcon={''}>
                                                                        <div className="w-full">
                                                                            <div className="flex items-center justify-between gap-x-2">
                                                                                <div>
                                                                                    <span className="flex items-center gap-x-4">
                                                                                        {data.data?.type == 'OnlineDeposit' || data.data?.type == 'OfflineDeposit' ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                                            <path d="M12.9 1.42c-.33 0-.66.059-.97.176a1 1 0 0 0-.003 0l-7.26 2.742c-1.4.53-2.33 1.88-2.33 3.377v4.81a6.144 6.144 0 0 0-.476 7.058 6.13 6.13 0 0 0 5.28 2.994c1.196 0 2.32-.344 3.27-.948a1 1 0 0 0 .17.034h6.694c2.437 0 4.438-2.003 4.438-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2-4.438-4.438-4.438h-1.643V4.16a2.728 2.728 0 0 0-1.18-2.251 2.738 2.738 0 0 0-1.553-.489zm-.094 2.006a.754.754 0 0 1 .51.125.73.73 0 0 1 .23.266.736.736 0 0 1 .086.341 1 1 0 0 0 0 .002v2.473H6.777c-.879 0-1.7.264-2.393.711.12-.516.48-.941.99-1.135l7.26-2.742a.721.721 0 0 1 .172-.04zM6.777 8.633h10.5a2.435 2.435 0 0 1 2.438 2.438v.318h-.847c-.771 0-1.5.312-2.023.846a2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904l.05-.084c.57-.93.895-2.024.895-3.176a6.172 6.172 0 0 0-3.502-5.564 6.159 6.159 0 0 0-5.467.063 2.434 2.434 0 0 1 2.43-2.268zm.477 3.6a4.177 4.177 0 0 1 3.42 1.947c.419.666.64 1.436.64 2.223 0 .783-.217 1.52-.6 2.14a1 1 0 0 0-.01.02 3.66 3.66 0 0 1-.802.954 1 1 0 0 0-.027.023 4.039 4.039 0 0 1-2.734 1.037 1 1 0 0 0-.002 0 4.137 4.137 0 0 1-3.563-2.019 1 1 0 0 0-.005-.014 4.07 4.07 0 0 1-.604-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .005-.003 4.17 4.17 0 0 1 2.721-.915zm11.61 1.156h1.816v1.748h-1.705c-.5 0-.945-.37-.98-.793a1 1 0 0 0-.003-.012.83.83 0 0 1 .254-.68 1 1 0 0 0 .018-.017.803.803 0 0 1 .6-.246zm-11.73.568a.75.75 0 0 0-.75.75v.907h-.94a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75h.94v.986a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75v-.986h.945a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75h-.945v-.907a.75.75 0 0 0-.75-.75z">

                                                                                            </path>
                                                                                        </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                                            <path d="M12.9 1.42c-.33 0-.658.059-.969.176a1 1 0 0 0-.002 0L4.667 4.338A3.615 3.615 0 0 0 2.34 7.715v4.81a6.144 6.144 0 0 0-.476 7.058 6.124 6.124 0 0 0 5.28 2.994 6.083 6.083 0 0 0 3.269-.948 1 1 0 0 0 .17.034h6.693c2.437 0 4.439-2.003 4.439-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2.002-4.437-4.44-4.437h-1.642V4.161c0-.443-.106-.88-.311-1.273a2.733 2.733 0 0 0-.87-.978 2.738 2.738 0 0 0-1.552-.49zm-.092 2.006a.738.738 0 0 1 .824.732 1 1 0 0 0 0 .002v2.473H6.777c-.88 0-1.7.263-2.393.711.12-.516.48-.941.99-1.135l7.263-2.742a.721.721 0 0 1 .172-.04zm-6.03 5.207h10.5a2.435 2.435 0 0 1 2.437 2.438v.318h-.845a2.84 2.84 0 0 0-2.025.846 2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904c.017-.028.036-.055.053-.084a6.07 6.07 0 0 0 .892-3.176A6.17 6.17 0 0 0 4.35 10.9a2.434 2.434 0 0 1 2.43-2.267zm.478 3.6a4.168 4.168 0 0 1 1.693.41c.709.34 1.308.872 1.727 1.537.419.666.64 1.436.64 2.223 0 .783-.219 1.52-.601 2.14a1 1 0 0 0-.012.02c-.214.367-.49.693-.8.954a1 1 0 0 0-.028.023 4.034 4.034 0 0 1-2.732 1.037 1 1 0 0 0-.002 0 4.144 4.144 0 0 1-3.563-2.019 1 1 0 0 0-.008-.014 4.069 4.069 0 0 1-.602-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .004-.003 4.177 4.177 0 0 1 2.723-.915zm11.61 1.156h1.816v1.748h-1.707c-.5 0-.945-.37-.98-.793a1 1 0 0 0 0-.012.828.828 0 0 1 .251-.68 1 1 0 0 0 .018-.017.807.807 0 0 1 .601-.246zm-13.42 2.266a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.748h3.383a.75.75 0 0 0 .75-.748.75.75 0 0 0-.75-.75z"></path>
                                                                                        </svg>}
                                                                                        {data.data?.type == 'OnlineDeposit' || data.data?.type == 'OfflineDeposit' ? 'واریز' : 'برداشت'} تومان</span>
                                                                                    {data.data?.type == 'OnlineDeposit' || data.data?.type == 'OfflineDeposit' ?
                                                                                        <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                                            <span className="ltr">
                                                                                                {(data.data?.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}+
                                                                                            </span> تومان</span> : <span className="block text-lg text-sell mt-2">
                                                                                            <span className="ltr">
                                                                                                {(data.data?.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}-
                                                                                            </span> تومان</span>}
                                                                                </div>
                                                                                <div className="flex flex-col items-end text-start">
                                                                                    <span>{moment(moment(data.data?.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                                        .locale('fa')
                                                                                        .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                                                    <span className="block mt-2">
                                                                                        <span>وضعیت: </span>
                                                                                        {data.data?.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">موفق</span> : ''}
                                                                                        {data.data?.status == 'Pending' ? <span className="text-primary">در انتظار تائید</span> : ''}
                                                                                        {data.data?.status == 'Rejected' ? <span className="text-sell">رد شده</span> : ''}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </AccordionSummary>
                                                                </Accordion>
                                                            </>
                                                        )
                                                    }
                                                case 'OfflineDeposit':
                                                    if (data.data) {
                                                        return (
                                                            <>
                                                                <div className="col-span-12 flex items-center gap-x-4 mt-6">
                                                                    <span className="whitespace-nowrap">واریز دستی</span>
                                                                    <Divider component="div" className="flex-[1_0_60%] dark:bg-primary dark:bg-opacity-50" />
                                                                </div>
                                                                <Accordion className="custom-accordion col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                                                    <AccordionSummary
                                                                        className="font-medium text-black w-full *:!my-3"
                                                                        expandIcon={''}>
                                                                        <div className="w-full">
                                                                            <div className="flex items-center justify-between gap-x-2">
                                                                                <div>
                                                                                    <span className="flex items-center gap-x-4">
                                                                                        {data.data?.type == 'OnlineDeposit' || data.data?.type == 'OfflineDeposit' ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                                            <path d="M12.9 1.42c-.33 0-.66.059-.97.176a1 1 0 0 0-.003 0l-7.26 2.742c-1.4.53-2.33 1.88-2.33 3.377v4.81a6.144 6.144 0 0 0-.476 7.058 6.13 6.13 0 0 0 5.28 2.994c1.196 0 2.32-.344 3.27-.948a1 1 0 0 0 .17.034h6.694c2.437 0 4.438-2.003 4.438-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2-4.438-4.438-4.438h-1.643V4.16a2.728 2.728 0 0 0-1.18-2.251 2.738 2.738 0 0 0-1.553-.489zm-.094 2.006a.754.754 0 0 1 .51.125.73.73 0 0 1 .23.266.736.736 0 0 1 .086.341 1 1 0 0 0 0 .002v2.473H6.777c-.879 0-1.7.264-2.393.711.12-.516.48-.941.99-1.135l7.26-2.742a.721.721 0 0 1 .172-.04zM6.777 8.633h10.5a2.435 2.435 0 0 1 2.438 2.438v.318h-.847c-.771 0-1.5.312-2.023.846a2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904l.05-.084c.57-.93.895-2.024.895-3.176a6.172 6.172 0 0 0-3.502-5.564 6.159 6.159 0 0 0-5.467.063 2.434 2.434 0 0 1 2.43-2.268zm.477 3.6a4.177 4.177 0 0 1 3.42 1.947c.419.666.64 1.436.64 2.223 0 .783-.217 1.52-.6 2.14a1 1 0 0 0-.01.02 3.66 3.66 0 0 1-.802.954 1 1 0 0 0-.027.023 4.039 4.039 0 0 1-2.734 1.037 1 1 0 0 0-.002 0 4.137 4.137 0 0 1-3.563-2.019 1 1 0 0 0-.005-.014 4.07 4.07 0 0 1-.604-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .005-.003 4.17 4.17 0 0 1 2.721-.915zm11.61 1.156h1.816v1.748h-1.705c-.5 0-.945-.37-.98-.793a1 1 0 0 0-.003-.012.83.83 0 0 1 .254-.68 1 1 0 0 0 .018-.017.803.803 0 0 1 .6-.246zm-11.73.568a.75.75 0 0 0-.75.75v.907h-.94a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75h.94v.986a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75v-.986h.945a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75h-.945v-.907a.75.75 0 0 0-.75-.75z">

                                                                                            </path>
                                                                                        </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                                            <path d="M12.9 1.42c-.33 0-.658.059-.969.176a1 1 0 0 0-.002 0L4.667 4.338A3.615 3.615 0 0 0 2.34 7.715v4.81a6.144 6.144 0 0 0-.476 7.058 6.124 6.124 0 0 0 5.28 2.994 6.083 6.083 0 0 0 3.269-.948 1 1 0 0 0 .17.034h6.693c2.437 0 4.439-2.003 4.439-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2.002-4.437-4.44-4.437h-1.642V4.161c0-.443-.106-.88-.311-1.273a2.733 2.733 0 0 0-.87-.978 2.738 2.738 0 0 0-1.552-.49zm-.092 2.006a.738.738 0 0 1 .824.732 1 1 0 0 0 0 .002v2.473H6.777c-.88 0-1.7.263-2.393.711.12-.516.48-.941.99-1.135l7.263-2.742a.721.721 0 0 1 .172-.04zm-6.03 5.207h10.5a2.435 2.435 0 0 1 2.437 2.438v.318h-.845a2.84 2.84 0 0 0-2.025.846 2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904c.017-.028.036-.055.053-.084a6.07 6.07 0 0 0 .892-3.176A6.17 6.17 0 0 0 4.35 10.9a2.434 2.434 0 0 1 2.43-2.267zm.478 3.6a4.168 4.168 0 0 1 1.693.41c.709.34 1.308.872 1.727 1.537.419.666.64 1.436.64 2.223 0 .783-.219 1.52-.601 2.14a1 1 0 0 0-.012.02c-.214.367-.49.693-.8.954a1 1 0 0 0-.028.023 4.034 4.034 0 0 1-2.732 1.037 1 1 0 0 0-.002 0 4.144 4.144 0 0 1-3.563-2.019 1 1 0 0 0-.008-.014 4.069 4.069 0 0 1-.602-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .004-.003 4.177 4.177 0 0 1 2.723-.915zm11.61 1.156h1.816v1.748h-1.707c-.5 0-.945-.37-.98-.793a1 1 0 0 0 0-.012.828.828 0 0 1 .251-.68 1 1 0 0 0 .018-.017.807.807 0 0 1 .601-.246zm-13.42 2.266a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.748h3.383a.75.75 0 0 0 .75-.748.75.75 0 0 0-.75-.75z"></path>
                                                                                        </svg>}
                                                                                        {data.data?.type == 'OnlineDeposit' || data.data?.type == 'OfflineDeposit' ? 'واریز دستی' : 'برداشت'} تومان</span>
                                                                                    {data.data?.type == 'OnlineDeposit' || data.data?.type == 'OfflineDeposit' ?
                                                                                        <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                                            <span className="ltr">
                                                                                                {(data.data?.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}+
                                                                                            </span> تومان</span> : <span className="block text-lg text-sell mt-2">
                                                                                            <span className="ltr">
                                                                                                {(data.data?.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}-
                                                                                            </span> تومان</span>}
                                                                                </div>
                                                                                <div className="flex flex-col items-end text-start">
                                                                                    <span>{moment(moment(data.data?.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                                        .locale('fa')
                                                                                        .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                                                    <span className="block mt-2">
                                                                                        <span>وضعیت: </span>
                                                                                        {data.data?.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">موفق</span> : ''}
                                                                                        {data.data?.status == 'Pending' ? <span className="text-primary">در انتظار تائید</span> : ''}
                                                                                        {data.data?.status == 'Rejected' ? <span className="text-sell cursor-pointer hover:underline" onClick={handleShowReject(data)}>رد شده</span> : ''}
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
                                                                                <span>واریز از: </span>
                                                                                <div className="flex items-center gap-x-2">
                                                                                    <div className="flex items-center justify-center bg-white w-7 h-7 rounded-[50%]">
                                                                                        <img src={CheckCardNumber(data.data?.card?.number || '').image} alt={CheckCardNumber(data.data?.card?.number || '').name} width="48" height="48" decoding="async" data-nimg="1" loading="lazy" className="w-5 h-5 object-contain" />
                                                                                    </div>
                                                                                    <PatternFormat displayType='text' value={data.data?.card?.number} format="####-####-####-####" dir="ltr" />
                                                                                </div>
                                                                            </div>
                                                                            <span className="flex flex-col">
                                                                                <span>کد پیگیری: </span>
                                                                                <span>{data.data?.accountNumber || data.data?.trackingCode}</span></span>
                                                                        </div>
                                                                    </AccordionDetails>
                                                                </Accordion>
                                                            </>
                                                        )
                                                    }
                                                case 'Withdraw':
                                                    if (data.data) {
                                                        return (
                                                            <>
                                                                <div className="col-span-12 flex items-center gap-x-4 mt-6">
                                                                    <span className="whitespace-nowrap">برداشت</span>
                                                                    <Divider component="div" className="flex-[1_0_60%] dark:bg-primary dark:bg-opacity-50" />
                                                                </div>
                                                                <Accordion className="custom-accordion col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                                                    <AccordionSummary
                                                                        className="font-medium text-black w-full"
                                                                        expandIcon={''}
                                                                        // aria-controls="panel1a-content"
                                                                        id="panel1a-header">
                                                                        <div className="w-full">
                                                                            <div className="flex items-center justify-between gap-x-2">
                                                                                <div className="flex flex-col">
                                                                                    <span className="flex items-center gap-x-4">
                                                                                        {data.data?.type == 'OnlineDeposit' || data.data?.type == 'OfflineDeposit' ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                                            <path d="M12.9 1.42c-.33 0-.66.059-.97.176a1 1 0 0 0-.003 0l-7.26 2.742c-1.4.53-2.33 1.88-2.33 3.377v4.81a6.144 6.144 0 0 0-.476 7.058 6.13 6.13 0 0 0 5.28 2.994c1.196 0 2.32-.344 3.27-.948a1 1 0 0 0 .17.034h6.694c2.437 0 4.438-2.003 4.438-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2-4.438-4.438-4.438h-1.643V4.16a2.728 2.728 0 0 0-1.18-2.251 2.738 2.738 0 0 0-1.553-.489zm-.094 2.006a.754.754 0 0 1 .51.125.73.73 0 0 1 .23.266.736.736 0 0 1 .086.341 1 1 0 0 0 0 .002v2.473H6.777c-.879 0-1.7.264-2.393.711.12-.516.48-.941.99-1.135l7.26-2.742a.721.721 0 0 1 .172-.04zM6.777 8.633h10.5a2.435 2.435 0 0 1 2.438 2.438v.318h-.847c-.771 0-1.5.312-2.023.846a2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904l.05-.084c.57-.93.895-2.024.895-3.176a6.172 6.172 0 0 0-3.502-5.564 6.159 6.159 0 0 0-5.467.063 2.434 2.434 0 0 1 2.43-2.268zm.477 3.6a4.177 4.177 0 0 1 3.42 1.947c.419.666.64 1.436.64 2.223 0 .783-.217 1.52-.6 2.14a1 1 0 0 0-.01.02 3.66 3.66 0 0 1-.802.954 1 1 0 0 0-.027.023 4.039 4.039 0 0 1-2.734 1.037 1 1 0 0 0-.002 0 4.137 4.137 0 0 1-3.563-2.019 1 1 0 0 0-.005-.014 4.07 4.07 0 0 1-.604-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .005-.003 4.17 4.17 0 0 1 2.721-.915zm11.61 1.156h1.816v1.748h-1.705c-.5 0-.945-.37-.98-.793a1 1 0 0 0-.003-.012.83.83 0 0 1 .254-.68 1 1 0 0 0 .018-.017.803.803 0 0 1 .6-.246zm-11.73.568a.75.75 0 0 0-.75.75v.907h-.94a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75h.94v.986a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75v-.986h.945a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75h-.945v-.907a.75.75 0 0 0-.75-.75z">

                                                                                            </path>
                                                                                        </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                                            <path d="M12.9 1.42c-.33 0-.658.059-.969.176a1 1 0 0 0-.002 0L4.667 4.338A3.615 3.615 0 0 0 2.34 7.715v4.81a6.144 6.144 0 0 0-.476 7.058 6.124 6.124 0 0 0 5.28 2.994 6.083 6.083 0 0 0 3.269-.948 1 1 0 0 0 .17.034h6.693c2.437 0 4.439-2.003 4.439-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2.002-4.437-4.44-4.437h-1.642V4.161c0-.443-.106-.88-.311-1.273a2.733 2.733 0 0 0-.87-.978 2.738 2.738 0 0 0-1.552-.49zm-.092 2.006a.738.738 0 0 1 .824.732 1 1 0 0 0 0 .002v2.473H6.777c-.88 0-1.7.263-2.393.711.12-.516.48-.941.99-1.135l7.263-2.742a.721.721 0 0 1 .172-.04zm-6.03 5.207h10.5a2.435 2.435 0 0 1 2.437 2.438v.318h-.845a2.84 2.84 0 0 0-2.025.846 2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904c.017-.028.036-.055.053-.084a6.07 6.07 0 0 0 .892-3.176A6.17 6.17 0 0 0 4.35 10.9a2.434 2.434 0 0 1 2.43-2.267zm.478 3.6a4.168 4.168 0 0 1 1.693.41c.709.34 1.308.872 1.727 1.537.419.666.64 1.436.64 2.223 0 .783-.219 1.52-.601 2.14a1 1 0 0 0-.012.02c-.214.367-.49.693-.8.954a1 1 0 0 0-.028.023 4.034 4.034 0 0 1-2.732 1.037 1 1 0 0 0-.002 0 4.144 4.144 0 0 1-3.563-2.019 1 1 0 0 0-.008-.014 4.069 4.069 0 0 1-.602-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .004-.003 4.177 4.177 0 0 1 2.723-.915zm11.61 1.156h1.816v1.748h-1.707c-.5 0-.945-.37-.98-.793a1 1 0 0 0 0-.012.828.828 0 0 1 .251-.68 1 1 0 0 0 .018-.017.807.807 0 0 1 .601-.246zm-13.42 2.266a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.748h3.383a.75.75 0 0 0 .75-.748.75.75 0 0 0-.75-.75z"></path>
                                                                                        </svg>}
                                                                                        {data.data?.type == 'OnlineDeposit' || data.data?.type == 'OfflineDeposit' ? 'واریز' : 'برداشت'} تومان</span>
                                                                                    {data.data?.type == 'OnlineDeposit' || data.data?.type == 'OfflineDeposit' ?
                                                                                        <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                                            <span className="ltr">
                                                                                                {(data.data?.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}+
                                                                                            </span> تومان</span> : <span className="block text-lg text-sell mt-2">
                                                                                            <span className="ltr">
                                                                                                {(data.data?.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}-
                                                                                            </span> تومان</span>}
                                                                                </div>
                                                                                <div className="flex flex-col items-end">
                                                                                    <span>{moment(moment(data.data?.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                                        .locale('fa')
                                                                                        .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                                                    <span className="block mt-2">
                                                                                        <span>وضعیت: </span>
                                                                                        {data.data?.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">تائید شده</span> : ''}
                                                                                        {data.data?.status == 'Pending' ? <span className="text-primary">در انتظار تائید</span> : ''}
                                                                                        {data.data?.status == 'Rejected' ? <span className="text-sell cursor-pointer hover:underline" onClick={handleShowReject(data)}>رد شده</span> : ''}
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
                                                                                <span>واریز به: </span>
                                                                                <div className="flex items-center gap-x-2">
                                                                                    <div className="flex items-center justify-center bg-white w-7 h-7 rounded-[50%]">
                                                                                        <img src={CheckCardNumber(data.data?.card?.number || '').image} alt={CheckCardNumber(data.data?.card?.number || '').name} width="48" height="48" decoding="async" data-nimg="1" loading="lazy" className="w-5 h-5 object-contain" />
                                                                                    </div>
                                                                                    <PatternFormat displayType='text' value={data.data?.card?.number} format="####-####-####-####" dir="ltr" />
                                                                                </div>
                                                                            </div>
                                                                            <span className="flex flex-col">
                                                                                <span>کد پیگیری: </span>
                                                                                {data.data?.status == 'Accepted' ? <span>{data.data?.trackingCode || data.data?.transId}</span> : '------'}</span>
                                                                        </div>
                                                                    </AccordionDetails>
                                                                </Accordion>
                                                            </>
                                                        )
                                                    }
                                                case 'trades':
                                                    if (data.data) {
                                                        return (
                                                            <>
                                                                <div className="col-span-12 flex items-center gap-x-4 mt-6">
                                                                    <span className="whitespace-nowrap">{(siteInfo?.paidModules && siteInfo?.paidModules?.includes('OrderBook')) && userInfo?.orderBookIsActive ? 'معامله آنی' : 'معامله'}</span>
                                                                    <Divider component="div" className="flex-[1_0_60%] dark:bg-primary dark:bg-opacity-50" />
                                                                </div>
                                                                <Accordion className="custom-accordion disable col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                                                    <AccordionSummary
                                                                        className="font-medium text-black w-full !cursor-default *:!my-3"
                                                                        expandIcon={''}>
                                                                        <div className="w-full">
                                                                            <div className="flex items-center justify-between gap-x-2">
                                                                                <div className="flex flex-col">
                                                                                    <span className="flex items-center gap-x-4">
                                                                                        {data.data?.type == 'Buy' || data.data?.type == 'PayLaterBuy' ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                                            <path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path>
                                                                                        </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                                            <path d="M8.238 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.61-4.801L6.24 4.529a.75.75 0 1 0 1.307.73l1.344-2.4a.75.75 0 0 0-.652-1.114zm6.492 1.484c-3.145 0-5.745 2.421-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.064 6.062 6.064 3.145 0 5.742-2.421 6.031-5.492 3.068-.293 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.063-6.062zm0 2.002a4.044 4.044 0 0 1 4.064 4.061c0 2.105-1.593 3.764-3.637 3.982a6.051 6.051 0 0 0-1.316-2.502 3.242 3.242 0 0 0-.273-.315 3.263 3.263 0 0 0-.338-.292 6.044 6.044 0 0 0-2.48-1.287c.212-2.05 1.87-3.647 3.98-3.647zm-5.453 5.463c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.749.749 0 0 0-.746.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.308-.73l-1.342 2.4a.75.75 0 0 0 .653 1.114 6.504 6.504 0 0 0 6.494-6.494.75.75 0 0 0-.752-.748z"></path>
                                                                                        </svg>}
                                                                                        {data.data?.type == 'PayLaterBuy' ? 'خرید قرضی' : data.data?.type == 'Buy' ? 'خرید' : 'فروش'} {data.data?.tradeable ? <span>{data.data?.tradeable?.nameFa}</span> : ''}</span>
                                                                                    {data.data?.type == 'Buy' || data.data?.type == 'PayLaterBuy' ?
                                                                                        <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                                            <span className="ltr">
                                                                                                {(data.data?.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}+
                                                                                            </span> گرم</span> : <span className="block text-lg text-sell mt-2">
                                                                                            <span className="ltr">
                                                                                                {(data.data?.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}-
                                                                                            </span> گرم</span>}
                                                                                    <span className="text-sm mt-2 px-4">{(data.data?.total || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                                                                </div>
                                                                                <div className="flex flex-col items-end text-start">
                                                                                    <span>{moment(moment(data.data?.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                                        .locale('fa')
                                                                                        .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                                                    <span className="block text-sm mt-2">
                                                                                        <span>{data.data?.isFixedPrice ? 'قیمت ثابت: ' : 'قیمت: '}</span>
                                                                                        <span className="mt-2">
                                                                                            {data.data?.tradeablePrice ? `${(data.data?.tradeablePrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` : '------'}
                                                                                        </span>
                                                                                    </span>
                                                                                    <span className="block mt-2">
                                                                                        <span>وضعیت: </span>
                                                                                        {data.data?.status == 'Accepted' ? data.data?.paid ? <span className="text-secondary-green dark:text-buy">پرداخت شده</span> :
                                                                                            <span className="text-secondary-green dark:text-buy">تائید شده</span> : ''}
                                                                                        {data.data?.status == 'Pending' ? data.data?.type == 'PayLaterBuy' && !data.data?.paid ?
                                                                                            <span className="text-primary cursor-pointer hover:underline" onClick={handleOpenDialog(data.data?._id)}>در انتظار پرداخت</span> :
                                                                                            <span className="text-primary">در انتظار تائید</span> : ''}
                                                                                        {data.data?.status == 'Rejected' ? <span className="text-sell cursor-pointer hover:underline" onClick={handleShowReject(data)}>رد شده</span> : ''}

                                                                                        {data.data?.status == 'PendingFixedPrice' ? <span className="text-primary">سفارش باز</span> : ''}
                                                                                        {data.data?.status == 'Cancelled' ? <span className="text-sell">لغو شده</span> : ''}
                                                                                        {['PendingFixedPrice'].includes(data.data?.status) ? <span className="-me-4">
                                                                                            <Tooltip title="لغو معامله">
                                                                                                <IconButton
                                                                                                    color={`error`}
                                                                                                    onClick={cancelFixedPriceOrder(data.data?._id)}>
                                                                                                    {cancelOrderLoading ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} /> : <CancelIcon />}
                                                                                                </IconButton>
                                                                                            </Tooltip>
                                                                                        </span> : ''}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </AccordionSummary>
                                                                </Accordion>
                                                                <ConfirmDialog
                                                                    open={openDialog}
                                                                    onClose={handleCloseDialog}
                                                                    onConfirm={handlePayLater}
                                                                    title="آیا از پرداخت خرید قرضی خود اطمینان دارید؟"
                                                                    loading={loading}
                                                                    darkModeToggle={darkModeToggle}
                                                                />
                                                            </>
                                                        )
                                                    }
                                                case 'transfers':
                                                    if (data.data) {
                                                        return (
                                                            <>
                                                                <div className="col-span-12 flex items-center gap-x-4 mt-6">
                                                                    <span className="whitespace-nowrap">انتقال دارائی</span>
                                                                    <Divider component="div" className="flex-[1_0_60%] dark:bg-primary dark:bg-opacity-50" />
                                                                </div>
                                                                <Accordion className="custom-accordion disable col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                                                    <AccordionSummary
                                                                        className="font-medium text-black w-full *:!my-3"
                                                                        expandIcon={''}>
                                                                        <div className="w-full">
                                                                            <div className="flex items-center justify-between gap-x-2">
                                                                                <div>
                                                                                    <span className="flex items-center gap-x-4">
                                                                                        {data.data?.senderUser?._id != userInfo?._id ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                                            <path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path>
                                                                                        </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                                            <path d="M8.238 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.61-4.801L6.24 4.529a.75.75 0 1 0 1.307.73l1.344-2.4a.75.75 0 0 0-.652-1.114zm6.492 1.484c-3.145 0-5.745 2.421-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.064 6.062 6.064 3.145 0 5.742-2.421 6.031-5.492 3.068-.293 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.063-6.062zm0 2.002a4.044 4.044 0 0 1 4.064 4.061c0 2.105-1.593 3.764-3.637 3.982a6.051 6.051 0 0 0-1.316-2.502 3.242 3.242 0 0 0-.273-.315 3.263 3.263 0 0 0-.338-.292 6.044 6.044 0 0 0-2.48-1.287c.212-2.05 1.87-3.647 3.98-3.647zm-5.453 5.463c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.749.749 0 0 0-.746.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.308-.73l-1.342 2.4a.75.75 0 0 0 .653 1.114 6.504 6.504 0 0 0 6.494-6.494.75.75 0 0 0-.752-.748z"></path>
                                                                                        </svg>}
                                                                                        {data.data?.senderUser?._id == userInfo?._id ? 'انتقال' : 'دریافت'} {data.data?.tradeable ? <span>{data.data?.tradeable?.nameFa}</span> : ''}</span>
                                                                                    {data.data?.senderUser?._id != userInfo?._id ?
                                                                                        <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                                            <span className="ltr">
                                                                                                {(data.data?.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}+
                                                                                            </span> گرم</span> : <span className="block text-lg text-sell mt-2">
                                                                                            <span className="ltr">
                                                                                                {(data.data?.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}-
                                                                                            </span> گرم</span>}
                                                                                </div>
                                                                                <div className="flex flex-col items-end text-start">
                                                                                    <span>{moment(moment(data.data?.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                                        .locale('fa')
                                                                                        .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                                                    <span className="block mt-2">
                                                                                        <span>وضعیت: </span>
                                                                                        {data.data?.status == 'Accepted' ? data.data?.paid ? <span className="text-secondary-green dark:text-buy">پرداخت شده</span> :
                                                                                            <span className="text-secondary-green dark:text-buy">تائید شده</span> : ''}
                                                                                        {data.data?.status == 'Pending' ? data.data?.type == 'PayLaterBuy' && !data.data?.paid ? <span className="text-primary cursor-pointer hover:underline" onClick={handleOpenDialog(data.data?._id)}>در انتظار پرداخت</span> :
                                                                                            <span className="text-primary">در انتظار تائید</span> : ''}
                                                                                        {data.data?.status == 'Rejected' ? <span className="text-sell cursor-pointer hover:underline" onClick={handleShowReject(data)}>رد شده</span> : ''}
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
                                                                    <AccordionDetails className="custom-accordion-text !px-4 !pb-4">
                                                                        <span className="dark:text-white">{data.data?.senderUser?._id == userInfo?._id ? 'به حساب کاربر' : 'از حساب کاربر'} : {data.data?.senderUser?._id == userInfo?._id ? `(${data.data?.receiverUser?.mobileNumber || ''}) ${data.data?.receiverUser?.firstName || ''} ${data.data?.receiverUser?.lastName || ''}` : `(${data.data?.senderUser?.mobileNumber || ''}) ${data.data?.senderUser?.firstName || ''} ${data.data?.senderUser?.lastName || ''}`}</span>
                                                                    </AccordionDetails>
                                                                </Accordion>
                                                            </>
                                                        )
                                                    }
                                                case 'IdDeposit':
                                                    if (data.data) {
                                                        return (
                                                            <>
                                                                <div className="col-span-12 flex items-center gap-x-4 mt-6">
                                                                    <span className="whitespace-nowrap">واریز شناسه دار</span>
                                                                    <Divider component="div" className="flex-[1_0_60%] dark:bg-primary dark:bg-opacity-50" />
                                                                </div>
                                                                <Accordion className="custom-accordion col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                                                    <AccordionSummary
                                                                        className="font-medium text-black w-full *:!my-3"
                                                                        expandIcon={''}>
                                                                        <div className="w-full">
                                                                            <div className="flex items-center justify-between gap-x-2">
                                                                                <div>
                                                                                    <span className="flex items-center gap-x-4">
                                                                                        <svg viewBox="0 0 24 24" className="svg-icon">
                                                                                            <path d="M12.9 1.42c-.33 0-.66.059-.97.176a1 1 0 0 0-.003 0l-7.26 2.742c-1.4.53-2.33 1.88-2.33 3.377v4.81a6.144 6.144 0 0 0-.476 7.058 6.13 6.13 0 0 0 5.28 2.994c1.196 0 2.32-.344 3.27-.948a1 1 0 0 0 .17.034h6.694c2.437 0 4.438-2.003 4.438-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2-4.438-4.438-4.438h-1.643V4.16a2.728 2.728 0 0 0-1.18-2.251 2.738 2.738 0 0 0-1.553-.489zm-.094 2.006a.754.754 0 0 1 .51.125.73.73 0 0 1 .23.266.736.736 0 0 1 .086.341 1 1 0 0 0 0 .002v2.473H6.777c-.879 0-1.7.264-2.393.711.12-.516.48-.941.99-1.135l7.26-2.742a.721.721 0 0 1 .172-.04zM6.777 8.633h10.5a2.435 2.435 0 0 1 2.438 2.438v.318h-.847c-.771 0-1.5.312-2.023.846a2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904l.05-.084c.57-.93.895-2.024.895-3.176a6.172 6.172 0 0 0-3.502-5.564 6.159 6.159 0 0 0-5.467.063 2.434 2.434 0 0 1 2.43-2.268zm.477 3.6a4.177 4.177 0 0 1 3.42 1.947c.419.666.64 1.436.64 2.223 0 .783-.217 1.52-.6 2.14a1 1 0 0 0-.01.02 3.66 3.66 0 0 1-.802.954 1 1 0 0 0-.027.023 4.039 4.039 0 0 1-2.734 1.037 1 1 0 0 0-.002 0 4.137 4.137 0 0 1-3.563-2.019 1 1 0 0 0-.005-.014 4.07 4.07 0 0 1-.604-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .005-.003 4.17 4.17 0 0 1 2.721-.915zm11.61 1.156h1.816v1.748h-1.705c-.5 0-.945-.37-.98-.793a1 1 0 0 0-.003-.012.83.83 0 0 1 .254-.68 1 1 0 0 0 .018-.017.803.803 0 0 1 .6-.246zm-11.73.568a.75.75 0 0 0-.75.75v.907h-.94a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75h.94v.986a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75v-.986h.945a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75h-.945v-.907a.75.75 0 0 0-.75-.75z">

                                                                                            </path>
                                                                                        </svg>
                                                                                        واریز تومان با شناسه</span>
                                                                                    <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                                        <span className="ltr">
                                                                                            {(data.data?.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}+
                                                                                        </span> تومان</span>
                                                                                </div>
                                                                                <div className="flex flex-col items-end text-start">
                                                                                    <span>{moment(moment(data.data?.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                                        .locale('fa')
                                                                                        .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                                                    <span className="block mt-2">
                                                                                        <span>وضعیت: </span>
                                                                                        {data.data?.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">موفق</span> : ''}
                                                                                        {data.data?.status == 'Pending' ? <span className="text-primary">در انتظار تائید</span> : ''}
                                                                                        {data.data?.status == 'Rejected' ? <span className="text-sell">رد شده</span> : ''}
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
                                                                        <span className="flex flex-col">
                                                                            <span>کد پیگیری: </span>
                                                                            <span>{data.data?.status == 'Accepted' ? (data.data?.trackingCode) : '----'}</span></span>
                                                                    </AccordionDetails>
                                                                </Accordion>
                                                            </>
                                                        )
                                                    }
                                                case 'requests':
                                                    if (data.data) {
                                                        return (
                                                            <>
                                                                <div className="col-span-12 flex items-center gap-x-4 mt-6">
                                                                    <span className="whitespace-nowrap">سبد تحویل</span>
                                                                    <Divider component="div" className="flex-[1_0_60%] dark:bg-primary dark:bg-opacity-50" />
                                                                </div>
                                                                <Accordion className={`custom-accordion ${(data.data?.branchTime && Object.keys(data.data?.branchTime).length > 0) || data.data?.purity ? '' : 'disable'} col-span-12 !rounded-2xl !px-6 !py-2`} sx={{ '&:before': { display: 'none' } }}>
                                                                    <AccordionSummary
                                                                        className={`font-medium text-black w-full ${(data.data?.branchTime && Object.keys(data.data?.branchTime).length > 0) || data.data?.purity ? '' : '!cursor-default *:!my-3'}`}
                                                                        expandIcon={''}>
                                                                        <div className="w-full flex flex-col">
                                                                            <div className="flex items-center justify-between gap-x-2">
                                                                                <div className="flex flex-col gap-y-2">
                                                                                    <span className="flex items-center gap-x-4">
                                                                                        <ShoppingCartIcon />
                                                                                        <span className="flex items-center gap-x-4">
                                                                                            {data.data?.product?.name}
                                                                                        </span>
                                                                                    </span>
                                                                                    <span>
                                                                                        {((data.data?.amount || data.data?.amountOrCount || 0) + (data.data?.product?.isQuantitative ? 0 : (data.data?.differenceAmount || 0))).toLocaleString('en-US', { maximumFractionDigits: 3 })}&nbsp;
                                                                                        {data.data?.product?.isQuantitative ? 'عدد' : 'گرم'}
                                                                                        {data.data?.product?.price ? <span>&nbsp;({(
                                                                                            ((data.data?.product?.price || 0) +
                                                                                                (data.data?.product?.wageType === 'Fixed'
                                                                                                    ? data.data?.product?.wage
                                                                                                    : data.data?.product?.wageType === 'Percent'
                                                                                                        ? (data.data?.product?.price || 0) * (data.data?.product?.wage / 100)
                                                                                                        : 0) * (data.data?.amount || data.data?.amountOrCount || 0))
                                                                                        ).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان)</span> :
                                                                                            data.data?.product?.isQuantitative ?
                                                                                                <span>&nbsp;({(data.data?.weight || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم) &nbsp;(اجرت: {(data.data?.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} {data.data?.product?.wageType == 'Fixed' ? 'تومان' : 'درصد'})</span> : ''}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex flex-col gap-y-2 items-end">
                                                                                    <span>{moment(moment(data.data?.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                                        .locale('fa')
                                                                                        .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                                                    <span className="block">
                                                                                        {data.data?.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">موفق</span> : ''}
                                                                                        {data.data?.status == 'Pending' ? <span className="text-primary">در انتظار تائید</span> : ''}
                                                                                        {data.data?.status == 'Rejected' ? <span className="text-sell cursor-pointer hover:underline" onClick={handleShowReject(data)}>ناموفق</span> : ''}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            {(data.data?.branchTime && Object.keys(data.data?.branchTime).length > 0) || data.data?.purity ? <div className="flex items-center justify-center">
                                                                                <IconButton color={darkModeToggle ? 'white' : 'black'} className="p-1 xl:-mx-8 -rotate-90">
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                                        <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                                        <path d="M13.26 15.53L9.74 12L13.26 8.46997" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                                    </svg>
                                                                                </IconButton>
                                                                            </div> : ''}
                                                                        </div>
                                                                    </AccordionSummary>
                                                                    {(data.data?.branchTime && Object.keys(data.data?.branchTime).length > 0) || data.data?.purity ? <AccordionDetails className="custom-accordion-text !px-2 !pb-4">
                                                                        <div className="flex flex-col gap-y-4 w-full text-sm text-black dark:text-alert-warning-foreground mt-4">
                                                                            {!data.data?.product?.price &&
                                                                                !data.data?.product?.isQuantitative ? <>
                                                                                <span className="text-black dark:text-white">شماره انگ: {data.data?.purity || '------'}</span>
                                                                                <span className="text-black dark:text-white">نام آزمایشگاه: {data.data?.labName || '------'}</span>
                                                                                <Divider component="div" className="dark:bg-primary dark:bg-opacity-50" />
                                                                            </> : ''}
                                                                            {data.data?.branchTime && Object.keys(data.data?.branchTime).length > 0 ?
                                                                                <>
                                                                                    <span>
                                                                                        {data.data?.branchTime?.branch?.nameFa} <br /> آدرس: <span className="whitespace-break-spaces">{data.data?.branchTime?.branch?.address}</span> <br />
                                                                                        شماره تماس شعبه: <PatternFormat displayType="text" value={data.data?.branchTime?.branch?.phone} format="#### ### ## ##" dir="ltr" />
                                                                                    </span>
                                                                                    <span className="whitespace-break-spaces">
                                                                                        زمان مراجعه: {moment(data.data?.branchTime?.startTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')} الی {moment(data.data?.branchTime?.endTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')}
                                                                                    </span>
                                                                                </> : ''}
                                                                        </div>
                                                                    </AccordionDetails> : ''}
                                                                </Accordion>
                                                            </>
                                                        )
                                                    }
                                                case 'orderbooks':
                                                    if (data.data) {
                                                        if ((siteInfo?.paidModules && siteInfo?.paidModules?.includes('OrderBook')) && userInfo?.orderBookIsActive) {
                                                            return (
                                                                <>
                                                                    <div className="col-span-12 flex items-center gap-x-4 mt-6">
                                                                        <span className="whitespace-nowrap">معامله پیشرفته</span>
                                                                        <Divider component="div" className="flex-[1_0_60%] dark:bg-primary dark:bg-opacity-50" />
                                                                    </div>
                                                                    <Accordion className="custom-accordion col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                                                        <AccordionSummary
                                                                            className="font-medium text-black w-full *:!my-3"
                                                                            expandIcon={''}>
                                                                            <div className="w-full">
                                                                                <div className="flex items-center justify-between gap-x-2">
                                                                                    <div>
                                                                                        <span className="flex items-center gap-x-4 whitespace-nowrap">
                                                                                            {data.data?.type == 'Buy' ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                                                <path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path>
                                                                                            </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                                                <path d="M8.238 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.61-4.801L6.24 4.529a.75.75 0 1 0 1.307.73l1.344-2.4a.75.75 0 0 0-.652-1.114zm6.492 1.484c-3.145 0-5.745 2.421-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.064 6.062 6.064 3.145 0 5.742-2.421 6.031-5.492 3.068-.293 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.063-6.062zm0 2.002a4.044 4.044 0 0 1 4.064 4.061c0 2.105-1.593 3.764-3.637 3.982a6.051 6.051 0 0 0-1.316-2.502 3.242 3.242 0 0 0-.273-.315 3.263 3.263 0 0 0-.338-.292 6.044 6.044 0 0 0-2.48-1.287c.212-2.05 1.87-3.647 3.98-3.647zm-5.453 5.463c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.749.749 0 0 0-.746.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.308-.73l-1.342 2.4a.75.75 0 0 0 .653 1.114 6.504 6.504 0 0 0 6.494-6.494.75.75 0 0 0-.752-.748z"></path>
                                                                                            </svg>}
                                                                                            {data.data?.type == 'Buy' ? 'خرید' : 'فروش'} {data.data?.tradeable ? <span>{data.data?.tradeable?.nameFa}</span> : ''} (پیشرفته) </span>
                                                                                        {data.data?.status == 'Finished' ? (data.data?.wage > 0 && data.data?.totalPrice > 0) ? data.data?.type == 'Buy' ?
                                                                                            <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                                                <span className="ltr">
                                                                                                    {(data.data?.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}+
                                                                                                </span> گرم</span> : <span className="block text-lg text-sell mt-2">
                                                                                                <span className="ltr">
                                                                                                    {(data.data?.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}-
                                                                                                </span> گرم</span> : <span className="block text-lg mt-2">
                                                                                            <span className="ltr">
                                                                                                {(data.data?.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}
                                                                                            </span> گرم</span> : data.data?.type == 'Buy' ?
                                                                                            <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                                                <span className="ltr">
                                                                                                    {(data.data?.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}+
                                                                                                </span> گرم</span> : <span className="block text-lg text-sell mt-2">
                                                                                                <span className="ltr">
                                                                                                    {(data.data?.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}-
                                                                                                </span> گرم</span>}
                                                                                    </div>
                                                                                    <div className="flex items-center gap-x-2">
                                                                                        <div className="flex flex-col items-end text-start">
                                                                                            <span>{moment(moment(data.data?.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                                                .locale('fa')
                                                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                                                            <span className="block mt-2">
                                                                                                <span>وضعیت: </span>
                                                                                                {data.data?.status == 'Queued' ? <span className="text-primary">در صف انتظار</span> : ''}
                                                                                                {data.data?.status == 'Processing' ? <span className="text-blue-500">جدید</span> : ''}
                                                                                                {data.data?.status == 'InProgress' ? <span className="text-blue-500">در حال پردازش</span> : ''}
                                                                                                {data.data?.status == 'Finished' ? (data.data?.wage > 0 && data.data?.totalPrice > 0) ?
                                                                                                    <span className="text-secondary-green dark:text-buy">تکمیل شده</span> :
                                                                                                    <span className="text-sell">انجام نشده</span> : ''}
                                                                                                {data.data?.status == 'Canceled' ? <span className="text-sell">لغو شده</span> : ''}
                                                                                            </span>
                                                                                        </div>
                                                                                        <span>
                                                                                            {['Queued', 'Processing', 'InProgress'].includes(data.data?.status) ? <Tooltip title="لغو سفارش">
                                                                                                <IconButton
                                                                                                    color={`error`}
                                                                                                    onClick={cancelOrder(data.data?._id)}>
                                                                                                    {cancelOrderLoading ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} /> : <CancelIcon />}
                                                                                                </IconButton>
                                                                                            </Tooltip> : ''}
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
                                                                        <AccordionDetails className="custom-accordion-text !px-4 !pb-4">
                                                                            <div className="w-full grid grid-cols-12 gap-4">
                                                                                <div className="col-span-6 md:col-span-3 flex flex-col items-start md:items-center">
                                                                                    <span>مبلغ معامله: </span>
                                                                                    {data.data?.totalPrice > 0 ? `${(data.data?.totalPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` : '------'}
                                                                                </div>
                                                                                <div className="col-span-6 md:col-span-3 flex flex-col items-start md:items-center">
                                                                                    <span>قیمت معامله: </span>
                                                                                    {data.data?.avgPrice > 0 ? `${(data.data?.avgPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` : '------'}
                                                                                </div>

                                                                                <div className="col-span-6 md:col-span-3 flex flex-col items-start md:items-center">
                                                                                    <span>پیشرفت: </span>
                                                                                    {parseInt(((data.data?.amount - data.data?.remainingAmount || 0) * 100) / data.data?.amount) != 0 ?
                                                                                        `${parseInt(((data.data?.amount - data.data?.remainingAmount || 0) * 100) / data.data?.amount)}%` : 0}
                                                                                </div>
                                                                                <div className="col-span-6 md:col-span-3 flex flex-col items-start md:items-center">
                                                                                    <span>کارمزد معامله: </span>
                                                                                    {data.data?.wage > 0 ? data.data?.type == 'Buy' ?
                                                                                        `${(data.data?.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 5 })} گرم`
                                                                                        : `${(data.data?.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان`
                                                                                        : '------'}
                                                                                </div>
                                                                            </div>
                                                                        </AccordionDetails>
                                                                    </Accordion>
                                                                </>
                                                            )
                                                        }
                                                    }
                                                case 'giftcards':
                                                    if (data.data) {
                                                        return (
                                                            <>
                                                                <div className="col-span-12 flex items-center gap-x-4 mt-6">
                                                                    <span className="whitespace-nowrap">درخواست گیفت کارت</span>
                                                                    <Divider component="div" className="flex-[1_0_60%] dark:bg-primary dark:bg-opacity-50" />
                                                                </div>
                                                                <Accordion className="custom-accordion col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                                                    <AccordionSummary
                                                                        className="font-medium text-black w-full *:!my-3 !px-0"
                                                                        expandIcon={''}>
                                                                        <div className="w-full">
                                                                            <div className="flex items-center justify-between gap-x-2">
                                                                                <div>
                                                                                    <span className="flex items-center gap-x-4">
                                                                                        {data.data?.tradeable ?
                                                                                            <img
                                                                                                crossOrigin="anonymous"
                                                                                                src={`${process.env.NEXT_PUBLIC_BASEURL}${data.data?.tradeable?.image}`}
                                                                                                alt={data.data?.tradeable?.name}
                                                                                                className="w-8 h-8 rounded-[50%]"
                                                                                            />
                                                                                            : ''}
                                                                                        <span>گیفت کارت {data.data?.tradeable?.nameFa} {data.data?.weight || 0} گرمی</span>
                                                                                    </span>
                                                                                    <span className="block text-lg text-sell mt-2">
                                                                                        <span className="ltr">
                                                                                            {data.data?.buyWithToman ? `${(data.data?.totalCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}-` :
                                                                                                `${(data.data?.weight || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })}-`}

                                                                                        </span> &nbsp;
                                                                                        {data.data?.buyWithToman ? 'تومان' : 'گرم'}</span>
                                                                                </div>
                                                                                <div className="flex flex-col items-end text-end">
                                                                                    <span>{moment(moment(data.data?.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                                        .locale('fa')
                                                                                        .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                                                    <span className="flex items-center gap-x-2 mt-2">
                                                                                        <span>وضعیت: </span>
                                                                                        {data.data?.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">تائید شده</span> : ''}
                                                                                        {data.data?.status == 'Pending' ? <div className="flex items-center whitespace-nowrap">
                                                                                            <span className="text-primary">در انتظار تائید</span>
                                                                                            <Tooltip title="لغو درخواست">
                                                                                                <IconButton color="error" className="-me-4" onClick={handleOpenGiftcardDialog(data.data?._id)}>
                                                                                                    <DeleteIcon />
                                                                                                </IconButton>
                                                                                            </Tooltip>
                                                                                        </div> : ''}
                                                                                        {data.data?.status == 'Rejected' ? <span className="text-sell cursor-pointer hover:underline" onClick={handleShowReject(data)}>رد شده</span> : ''}
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
                                                                        {data.data?.address ?
                                                                            <div className="w-full flex flex-col gap-y-4">
                                                                                <div className="w-full flex items-center justify-between">
                                                                                    <div className="flex flex-col gap-y-1 dark:text-white">
                                                                                        <span>هزینه ارسال:</span>
                                                                                        <span>{(data.data?.shippingCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                                                                    </div>
                                                                                    <div className="flex flex-col gap-y-1 dark:text-white">
                                                                                        <span>کد پستی:</span>
                                                                                        <span>{data.data?.postalCode}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="w-full dark:text-white">
                                                                                    <span>آدرس: {data.data?.address}</span>
                                                                                </div>
                                                                            </div> : (data.data?.branchTime && Object.keys(data.data?.branchTime).length > 0) ? <div className="w-full flex flex-col gap-y-4">
                                                                                <span>
                                                                                    {data.data?.branchTime?.branch?.nameFa} <br /> آدرس: <span className="whitespace-break-spaces">{data.data?.branchTime?.branch?.address}</span> <br />
                                                                                    شماره تماس شعبه: <PatternFormat displayType="text" value={data.data?.branchTime?.branch?.phone} format="#### ### ## ##" dir="ltr" />
                                                                                </span>
                                                                                <span className="whitespace-break-spaces">
                                                                                    زمان مراجعه: {moment(data.data?.branchTime?.startTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')} الی {moment(data.data?.branchTime?.endTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')}
                                                                                </span>
                                                                            </div> : <div className="w-full flex items-center justify-between">
                                                                                <div className="flex flex-col">
                                                                                    <span>کد گیفت کارت: </span>
                                                                                    {data.data?.status == 'Accepted' ? <div className="flex items-center gap-x-2">
                                                                                        <span>{data.data?.code}</span>
                                                                                        <IconButton onClick={CopyData(data.data?.code)}>
                                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                                                                <path d="M9.24984 18.9582H5.74984C2.4915 18.9582 1.0415 17.5082 1.0415 14.2498V10.7498C1.0415 7.4915 2.4915 6.0415 5.74984 6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V14.2498C13.9582 17.5082 12.5082 18.9582 9.24984 18.9582ZM5.74984 7.2915C3.1665 7.2915 2.2915 8.1665 2.2915 10.7498V14.2498C2.2915 16.8332 3.1665 17.7082 5.74984 17.7082H9.24984C11.8332 17.7082 12.7082 16.8332 12.7082 14.2498V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H5.74984Z" fill="#F1C40F" />
                                                                                                <path d="M14.2498 13.9582H13.3332C12.9915 13.9582 12.7082 13.6748 12.7082 13.3332V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H6.6665C6.32484 7.2915 6.0415 7.00817 6.0415 6.6665V5.74984C6.0415 2.4915 7.4915 1.0415 10.7498 1.0415H14.2498C17.5082 1.0415 18.9582 2.4915 18.9582 5.74984V9.24984C18.9582 12.5082 17.5082 13.9582 14.2498 13.9582ZM13.9582 12.7082H14.2498C16.8332 12.7082 17.7082 11.8332 17.7082 9.24984V5.74984C17.7082 3.1665 16.8332 2.2915 14.2498 2.2915H10.7498C8.1665 2.2915 7.2915 3.1665 7.2915 5.74984V6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V12.7082Z" fill="#F1C40F" />
                                                                                            </svg>
                                                                                        </IconButton>
                                                                                    </div> : '------'}
                                                                                </div>
                                                                                <span className="flex flex-col">
                                                                                    <span>بارکد: </span>
                                                                                    {data.data?.code && data.data?.status == 'Accepted' ? <div id={`qrcode${0}`} className="qrcode-container w-10 h-10 cursor-pointer" onClick={openInNewTab(0)}>
                                                                                        <Image
                                                                                            text={data.data?.code}
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
                                                                <ConfirmDialog
                                                                    open={openGiftcardDialog}
                                                                    onClose={handleCloseGiftcardDialog}
                                                                    onConfirm={deleteGiftcardOrder}
                                                                    title="آیا مطمئن هستید؟"
                                                                    loading={deleteGiftcardLoading}
                                                                    darkModeToggle={darkModeToggle}
                                                                />
                                                            </>
                                                        )
                                                    }
                                                default:
                                                    return null;
                                            }
                                        };

                                        return displayOrder.map((type) => logsMap[type] && renderContentByType(type, logsMap[type]));
                                    })()
                                ) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">تغییراتی ثبت نشده است.</span>
                                </div> : ''}
                            {tabValue == 0 ?
                                transactions.length > 0 ? transactions.map((data, index) => {
                                    return (
                                        <Accordion key={index} className="custom-accordion disable col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className="font-medium text-black w-full !cursor-default *:!my-3"
                                                expandIcon={''}>
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div>
                                                            <span className="flex items-center gap-x-4">
                                                                {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M12.9 1.42c-.33 0-.66.059-.97.176a1 1 0 0 0-.003 0l-7.26 2.742c-1.4.53-2.33 1.88-2.33 3.377v4.81a6.144 6.144 0 0 0-.476 7.058 6.13 6.13 0 0 0 5.28 2.994c1.196 0 2.32-.344 3.27-.948a1 1 0 0 0 .17.034h6.694c2.437 0 4.438-2.003 4.438-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2-4.438-4.438-4.438h-1.643V4.16a2.728 2.728 0 0 0-1.18-2.251 2.738 2.738 0 0 0-1.553-.489zm-.094 2.006a.754.754 0 0 1 .51.125.73.73 0 0 1 .23.266.736.736 0 0 1 .086.341 1 1 0 0 0 0 .002v2.473H6.777c-.879 0-1.7.264-2.393.711.12-.516.48-.941.99-1.135l7.26-2.742a.721.721 0 0 1 .172-.04zM6.777 8.633h10.5a2.435 2.435 0 0 1 2.438 2.438v.318h-.847c-.771 0-1.5.312-2.023.846a2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904l.05-.084c.57-.93.895-2.024.895-3.176a6.172 6.172 0 0 0-3.502-5.564 6.159 6.159 0 0 0-5.467.063 2.434 2.434 0 0 1 2.43-2.268zm.477 3.6a4.177 4.177 0 0 1 3.42 1.947c.419.666.64 1.436.64 2.223 0 .783-.217 1.52-.6 2.14a1 1 0 0 0-.01.02 3.66 3.66 0 0 1-.802.954 1 1 0 0 0-.027.023 4.039 4.039 0 0 1-2.734 1.037 1 1 0 0 0-.002 0 4.137 4.137 0 0 1-3.563-2.019 1 1 0 0 0-.005-.014 4.07 4.07 0 0 1-.604-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .005-.003 4.17 4.17 0 0 1 2.721-.915zm11.61 1.156h1.816v1.748h-1.705c-.5 0-.945-.37-.98-.793a1 1 0 0 0-.003-.012.83.83 0 0 1 .254-.68 1 1 0 0 0 .018-.017.803.803 0 0 1 .6-.246zm-11.73.568a.75.75 0 0 0-.75.75v.907h-.94a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75h.94v.986a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75v-.986h.945a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75h-.945v-.907a.75.75 0 0 0-.75-.75z">

                                                                    </path>
                                                                </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M12.9 1.42c-.33 0-.658.059-.969.176a1 1 0 0 0-.002 0L4.667 4.338A3.615 3.615 0 0 0 2.34 7.715v4.81a6.144 6.144 0 0 0-.476 7.058 6.124 6.124 0 0 0 5.28 2.994 6.083 6.083 0 0 0 3.269-.948 1 1 0 0 0 .17.034h6.693c2.437 0 4.439-2.003 4.439-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2.002-4.437-4.44-4.437h-1.642V4.161c0-.443-.106-.88-.311-1.273a2.733 2.733 0 0 0-.87-.978 2.738 2.738 0 0 0-1.552-.49zm-.092 2.006a.738.738 0 0 1 .824.732 1 1 0 0 0 0 .002v2.473H6.777c-.88 0-1.7.263-2.393.711.12-.516.48-.941.99-1.135l7.263-2.742a.721.721 0 0 1 .172-.04zm-6.03 5.207h10.5a2.435 2.435 0 0 1 2.437 2.438v.318h-.845a2.84 2.84 0 0 0-2.025.846 2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904c.017-.028.036-.055.053-.084a6.07 6.07 0 0 0 .892-3.176A6.17 6.17 0 0 0 4.35 10.9a2.434 2.434 0 0 1 2.43-2.267zm.478 3.6a4.168 4.168 0 0 1 1.693.41c.709.34 1.308.872 1.727 1.537.419.666.64 1.436.64 2.223 0 .783-.219 1.52-.601 2.14a1 1 0 0 0-.012.02c-.214.367-.49.693-.8.954a1 1 0 0 0-.028.023 4.034 4.034 0 0 1-2.732 1.037 1 1 0 0 0-.002 0 4.144 4.144 0 0 1-3.563-2.019 1 1 0 0 0-.008-.014 4.069 4.069 0 0 1-.602-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .004-.003 4.177 4.177 0 0 1 2.723-.915zm11.61 1.156h1.816v1.748h-1.707c-.5 0-.945-.37-.98-.793a1 1 0 0 0 0-.012.828.828 0 0 1 .251-.68 1 1 0 0 0 .018-.017.807.807 0 0 1 .601-.246zm-13.42 2.266a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.748h3.383a.75.75 0 0 0 .75-.748.75.75 0 0 0-.75-.75z"></path>
                                                                </svg>}
                                                                {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ? 'واریز' : 'برداشت'} تومان</span>
                                                            {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ?
                                                                <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}+
                                                                    </span> تومان</span> : <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}-
                                                                    </span> تومان</span>}
                                                        </div>
                                                        <div className="flex flex-col items-end text-start">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            <span className="block mt-2">
                                                                <span>وضعیت: </span>
                                                                {data.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">موفق</span> : ''}
                                                                {data.status == 'Pending' ? <span className="text-primary">در انتظار تائید</span> : ''}
                                                                {data.status == 'Rejected' ? <span className="text-sell">رد شده</span> : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionSummary>
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">هنوز تراکنشی انجام نداده‌اید.</span>
                                </div> : ''}
                            {tabValue == 1 ?
                                transactions.length > 0 ? transactions.map((data, index) => {
                                    return (
                                        <Accordion key={index} className="custom-accordion col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className="font-medium text-black w-full *:!my-3"
                                                expandIcon={''}>
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div>
                                                            <span className="flex items-center gap-x-4">
                                                                {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M12.9 1.42c-.33 0-.66.059-.97.176a1 1 0 0 0-.003 0l-7.26 2.742c-1.4.53-2.33 1.88-2.33 3.377v4.81a6.144 6.144 0 0 0-.476 7.058 6.13 6.13 0 0 0 5.28 2.994c1.196 0 2.32-.344 3.27-.948a1 1 0 0 0 .17.034h6.694c2.437 0 4.438-2.003 4.438-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2-4.438-4.438-4.438h-1.643V4.16a2.728 2.728 0 0 0-1.18-2.251 2.738 2.738 0 0 0-1.553-.489zm-.094 2.006a.754.754 0 0 1 .51.125.73.73 0 0 1 .23.266.736.736 0 0 1 .086.341 1 1 0 0 0 0 .002v2.473H6.777c-.879 0-1.7.264-2.393.711.12-.516.48-.941.99-1.135l7.26-2.742a.721.721 0 0 1 .172-.04zM6.777 8.633h10.5a2.435 2.435 0 0 1 2.438 2.438v.318h-.847c-.771 0-1.5.312-2.023.846a2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904l.05-.084c.57-.93.895-2.024.895-3.176a6.172 6.172 0 0 0-3.502-5.564 6.159 6.159 0 0 0-5.467.063 2.434 2.434 0 0 1 2.43-2.268zm.477 3.6a4.177 4.177 0 0 1 3.42 1.947c.419.666.64 1.436.64 2.223 0 .783-.217 1.52-.6 2.14a1 1 0 0 0-.01.02 3.66 3.66 0 0 1-.802.954 1 1 0 0 0-.027.023 4.039 4.039 0 0 1-2.734 1.037 1 1 0 0 0-.002 0 4.137 4.137 0 0 1-3.563-2.019 1 1 0 0 0-.005-.014 4.07 4.07 0 0 1-.604-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .005-.003 4.17 4.17 0 0 1 2.721-.915zm11.61 1.156h1.816v1.748h-1.705c-.5 0-.945-.37-.98-.793a1 1 0 0 0-.003-.012.83.83 0 0 1 .254-.68 1 1 0 0 0 .018-.017.803.803 0 0 1 .6-.246zm-11.73.568a.75.75 0 0 0-.75.75v.907h-.94a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75h.94v.986a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75v-.986h.945a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75h-.945v-.907a.75.75 0 0 0-.75-.75z">

                                                                    </path>
                                                                </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M12.9 1.42c-.33 0-.658.059-.969.176a1 1 0 0 0-.002 0L4.667 4.338A3.615 3.615 0 0 0 2.34 7.715v4.81a6.144 6.144 0 0 0-.476 7.058 6.124 6.124 0 0 0 5.28 2.994 6.083 6.083 0 0 0 3.269-.948 1 1 0 0 0 .17.034h6.693c2.437 0 4.439-2.003 4.439-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2.002-4.437-4.44-4.437h-1.642V4.161c0-.443-.106-.88-.311-1.273a2.733 2.733 0 0 0-.87-.978 2.738 2.738 0 0 0-1.552-.49zm-.092 2.006a.738.738 0 0 1 .824.732 1 1 0 0 0 0 .002v2.473H6.777c-.88 0-1.7.263-2.393.711.12-.516.48-.941.99-1.135l7.263-2.742a.721.721 0 0 1 .172-.04zm-6.03 5.207h10.5a2.435 2.435 0 0 1 2.437 2.438v.318h-.845a2.84 2.84 0 0 0-2.025.846 2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904c.017-.028.036-.055.053-.084a6.07 6.07 0 0 0 .892-3.176A6.17 6.17 0 0 0 4.35 10.9a2.434 2.434 0 0 1 2.43-2.267zm.478 3.6a4.168 4.168 0 0 1 1.693.41c.709.34 1.308.872 1.727 1.537.419.666.64 1.436.64 2.223 0 .783-.219 1.52-.601 2.14a1 1 0 0 0-.012.02c-.214.367-.49.693-.8.954a1 1 0 0 0-.028.023 4.034 4.034 0 0 1-2.732 1.037 1 1 0 0 0-.002 0 4.144 4.144 0 0 1-3.563-2.019 1 1 0 0 0-.008-.014 4.069 4.069 0 0 1-.602-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .004-.003 4.177 4.177 0 0 1 2.723-.915zm11.61 1.156h1.816v1.748h-1.707c-.5 0-.945-.37-.98-.793a1 1 0 0 0 0-.012.828.828 0 0 1 .251-.68 1 1 0 0 0 .018-.017.807.807 0 0 1 .601-.246zm-13.42 2.266a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.748h3.383a.75.75 0 0 0 .75-.748.75.75 0 0 0-.75-.75z"></path>
                                                                </svg>}
                                                                {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ? 'واریز' : 'برداشت'} تومان</span>
                                                            {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ?
                                                                <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}+
                                                                    </span> تومان</span> : <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}-
                                                                    </span> تومان</span>}
                                                        </div>
                                                        <div className="flex flex-col items-end text-start">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            <span className="block mt-2">
                                                                <span>وضعیت: </span>
                                                                {data.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">موفق</span> : ''}
                                                                {data.status == 'Pending' ? <span className="text-primary">در انتظار تائید</span> : ''}
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
                                                <div className="w-full flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span>واریز از: </span>
                                                        <div className="flex items-center gap-x-2">
                                                            <div className="flex items-center justify-center bg-white w-7 h-7 rounded-[50%]">
                                                                <img src={CheckCardNumber(data.card?.number || '').image} alt={CheckCardNumber(data.card?.number || '').name} width="48" height="48" decoding="async" data-nimg="1" loading="lazy" className="w-5 h-5 object-contain" />
                                                            </div>
                                                            <PatternFormat displayType='text' value={data.card?.number} format="####-####-####-####" dir="ltr" />
                                                        </div>
                                                    </div>
                                                    <span className="flex flex-col">
                                                        <span>کد پیگیری: </span>
                                                        <span>{data.accountNumber || data.trackingCode}</span></span>
                                                </div>
                                            </AccordionDetails>
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">هنوز تراکنشی انجام نداده‌اید.</span>
                                </div> : ''}
                            {tabValue == 8 ?
                                transactions.length > 0 ? transactions.map((data, index) => {
                                    return (
                                        <Accordion key={index} className="custom-accordion col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className="font-medium text-black w-full *:!my-3"
                                                expandIcon={''}>
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div>
                                                            <span className="flex items-center gap-x-4">
                                                                <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M12.9 1.42c-.33 0-.66.059-.97.176a1 1 0 0 0-.003 0l-7.26 2.742c-1.4.53-2.33 1.88-2.33 3.377v4.81a6.144 6.144 0 0 0-.476 7.058 6.13 6.13 0 0 0 5.28 2.994c1.196 0 2.32-.344 3.27-.948a1 1 0 0 0 .17.034h6.694c2.437 0 4.438-2.003 4.438-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2-4.438-4.438-4.438h-1.643V4.16a2.728 2.728 0 0 0-1.18-2.251 2.738 2.738 0 0 0-1.553-.489zm-.094 2.006a.754.754 0 0 1 .51.125.73.73 0 0 1 .23.266.736.736 0 0 1 .086.341 1 1 0 0 0 0 .002v2.473H6.777c-.879 0-1.7.264-2.393.711.12-.516.48-.941.99-1.135l7.26-2.742a.721.721 0 0 1 .172-.04zM6.777 8.633h10.5a2.435 2.435 0 0 1 2.438 2.438v.318h-.847c-.771 0-1.5.312-2.023.846a2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904l.05-.084c.57-.93.895-2.024.895-3.176a6.172 6.172 0 0 0-3.502-5.564 6.159 6.159 0 0 0-5.467.063 2.434 2.434 0 0 1 2.43-2.268zm.477 3.6a4.177 4.177 0 0 1 3.42 1.947c.419.666.64 1.436.64 2.223 0 .783-.217 1.52-.6 2.14a1 1 0 0 0-.01.02 3.66 3.66 0 0 1-.802.954 1 1 0 0 0-.027.023 4.039 4.039 0 0 1-2.734 1.037 1 1 0 0 0-.002 0 4.137 4.137 0 0 1-3.563-2.019 1 1 0 0 0-.005-.014 4.07 4.07 0 0 1-.604-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .005-.003 4.17 4.17 0 0 1 2.721-.915zm11.61 1.156h1.816v1.748h-1.705c-.5 0-.945-.37-.98-.793a1 1 0 0 0-.003-.012.83.83 0 0 1 .254-.68 1 1 0 0 0 .018-.017.803.803 0 0 1 .6-.246zm-11.73.568a.75.75 0 0 0-.75.75v.907h-.94a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75h.94v.986a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75v-.986h.945a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75h-.945v-.907a.75.75 0 0 0-.75-.75z">

                                                                    </path>
                                                                </svg>
                                                                واریز تومان با شناسه</span>
                                                            <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                <span className="ltr">
                                                                    {(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}+
                                                                </span> تومان</span>
                                                        </div>
                                                        <div className="flex flex-col items-end text-start">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            <span className="block mt-2">
                                                                <span>وضعیت: </span>
                                                                {data.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">موفق</span> : ''}
                                                                {data.status == 'Pending' ? <span className="text-primary">در انتظار تائید</span> : ''}
                                                                {data.status == 'Rejected' ? <span className="text-sell">رد شده</span> : ''}
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
                                                <span className="flex flex-col">
                                                    <span>کد پیگیری: </span>
                                                    <span>{data.status == 'Accepted' ? (data.trackingCode) : '----'}</span></span>
                                            </AccordionDetails>
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">هنوز تراکنشی انجام نداده‌اید.</span>
                                </div> : ''}
                            {tabValue == 2 ?
                                transactions.length > 0 ? transactions.map((data, index) => {
                                    return (
                                        <Accordion key={index} className="custom-accordion col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className="font-medium text-black w-full"
                                                expandIcon={''}
                                                // aria-controls="panel1a-content"
                                                id="panel1a-header">
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div className="flex flex-col">
                                                            <span className="flex items-center gap-x-4">
                                                                {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M12.9 1.42c-.33 0-.66.059-.97.176a1 1 0 0 0-.003 0l-7.26 2.742c-1.4.53-2.33 1.88-2.33 3.377v4.81a6.144 6.144 0 0 0-.476 7.058 6.13 6.13 0 0 0 5.28 2.994c1.196 0 2.32-.344 3.27-.948a1 1 0 0 0 .17.034h6.694c2.437 0 4.438-2.003 4.438-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2-4.438-4.438-4.438h-1.643V4.16a2.728 2.728 0 0 0-1.18-2.251 2.738 2.738 0 0 0-1.553-.489zm-.094 2.006a.754.754 0 0 1 .51.125.73.73 0 0 1 .23.266.736.736 0 0 1 .086.341 1 1 0 0 0 0 .002v2.473H6.777c-.879 0-1.7.264-2.393.711.12-.516.48-.941.99-1.135l7.26-2.742a.721.721 0 0 1 .172-.04zM6.777 8.633h10.5a2.435 2.435 0 0 1 2.438 2.438v.318h-.847c-.771 0-1.5.312-2.023.846a2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904l.05-.084c.57-.93.895-2.024.895-3.176a6.172 6.172 0 0 0-3.502-5.564 6.159 6.159 0 0 0-5.467.063 2.434 2.434 0 0 1 2.43-2.268zm.477 3.6a4.177 4.177 0 0 1 3.42 1.947c.419.666.64 1.436.64 2.223 0 .783-.217 1.52-.6 2.14a1 1 0 0 0-.01.02 3.66 3.66 0 0 1-.802.954 1 1 0 0 0-.027.023 4.039 4.039 0 0 1-2.734 1.037 1 1 0 0 0-.002 0 4.137 4.137 0 0 1-3.563-2.019 1 1 0 0 0-.005-.014 4.07 4.07 0 0 1-.604-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .005-.003 4.17 4.17 0 0 1 2.721-.915zm11.61 1.156h1.816v1.748h-1.705c-.5 0-.945-.37-.98-.793a1 1 0 0 0-.003-.012.83.83 0 0 1 .254-.68 1 1 0 0 0 .018-.017.803.803 0 0 1 .6-.246zm-11.73.568a.75.75 0 0 0-.75.75v.907h-.94a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75h.94v.986a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75v-.986h.945a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75h-.945v-.907a.75.75 0 0 0-.75-.75z">

                                                                    </path>
                                                                </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M12.9 1.42c-.33 0-.658.059-.969.176a1 1 0 0 0-.002 0L4.667 4.338A3.615 3.615 0 0 0 2.34 7.715v4.81a6.144 6.144 0 0 0-.476 7.058 6.124 6.124 0 0 0 5.28 2.994 6.083 6.083 0 0 0 3.269-.948 1 1 0 0 0 .17.034h6.693c2.437 0 4.439-2.003 4.439-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2.002-4.437-4.44-4.437h-1.642V4.161c0-.443-.106-.88-.311-1.273a2.733 2.733 0 0 0-.87-.978 2.738 2.738 0 0 0-1.552-.49zm-.092 2.006a.738.738 0 0 1 .824.732 1 1 0 0 0 0 .002v2.473H6.777c-.88 0-1.7.263-2.393.711.12-.516.48-.941.99-1.135l7.263-2.742a.721.721 0 0 1 .172-.04zm-6.03 5.207h10.5a2.435 2.435 0 0 1 2.437 2.438v.318h-.845a2.84 2.84 0 0 0-2.025.846 2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904c.017-.028.036-.055.053-.084a6.07 6.07 0 0 0 .892-3.176A6.17 6.17 0 0 0 4.35 10.9a2.434 2.434 0 0 1 2.43-2.267zm.478 3.6a4.168 4.168 0 0 1 1.693.41c.709.34 1.308.872 1.727 1.537.419.666.64 1.436.64 2.223 0 .783-.219 1.52-.601 2.14a1 1 0 0 0-.012.02c-.214.367-.49.693-.8.954a1 1 0 0 0-.028.023 4.034 4.034 0 0 1-2.732 1.037 1 1 0 0 0-.002 0 4.144 4.144 0 0 1-3.563-2.019 1 1 0 0 0-.008-.014 4.069 4.069 0 0 1-.602-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .004-.003 4.177 4.177 0 0 1 2.723-.915zm11.61 1.156h1.816v1.748h-1.707c-.5 0-.945-.37-.98-.793a1 1 0 0 0 0-.012.828.828 0 0 1 .251-.68 1 1 0 0 0 .018-.017.807.807 0 0 1 .601-.246zm-13.42 2.266a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.748h3.383a.75.75 0 0 0 .75-.748.75.75 0 0 0-.75-.75z"></path>
                                                                </svg>}
                                                                {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ? 'واریز' : 'برداشت'} تومان</span>
                                                            {data.type == 'OnlineDeposit' || data.type == 'OfflineDeposit' ?
                                                                <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}+
                                                                    </span> تومان</span> : <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}-
                                                                    </span> تومان</span>}
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            <span className="block mt-2">
                                                                <span>وضعیت: </span>
                                                                {data.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">تائید شده</span> : ''}
                                                                {data.status == 'Pending' ? <span className="text-primary">در انتظار تائید</span> : ''}
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
                                                <div className="w-full flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span>واریز به: </span>
                                                        <div className="flex items-center gap-x-2">
                                                            <div className="flex items-center justify-center bg-white w-7 h-7 rounded-[50%]">
                                                                <img src={CheckCardNumber(data.card?.number || '').image} alt={CheckCardNumber(data.card?.number || '').name} width="48" height="48" decoding="async" data-nimg="1" loading="lazy" className="w-5 h-5 object-contain" />
                                                            </div>
                                                            <PatternFormat displayType='text' value={data.card?.number} format="####-####-####-####" dir="ltr" />
                                                        </div>
                                                    </div>
                                                    <span className="flex flex-col">
                                                        <span>کد پیگیری: </span>
                                                        {data.status == 'Accepted' ? <span>{data.trackingCode || data.transId}</span> : '------'}</span>
                                                </div>
                                            </AccordionDetails>
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">هنوز تراکنشی انجام نداده‌اید.</span>
                                </div> : ''}
                            {tabValue == 3 ?
                                <>
                                    {siteInfo?.scalpingPreventionPeriodInHours && siteInfo?.scalpingPreventionPeriodInHours > 0 ? <div className="col-span-12">
                                        <Alert
                                            severity="info"
                                            variant="filled"
                                            color="info"
                                            className="custom-alert auth info"
                                        >
                                            <div className="flex flex-col items-baseline md:items-center gap-y-2 md:flex-row md:justify-between w-full">
                                                <span className="mt-2">فرایند های خرید شما پس از مدت زمان {siteInfo?.scalpingPreventionPeriodInHours || '--'} ساعت از تاریخ معامله به صورت خودکار تائید می شوند.</span>
                                            </div>

                                        </Alert>
                                    </div> : ''}
                                    {transactions.length > 0 ? transactions.map((data, index) => {
                                        return (
                                            <Accordion key={index} className="custom-accordion disable col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                                <AccordionSummary
                                                    className="font-medium text-black w-full !cursor-default *:!my-3"
                                                    expandIcon={''}>
                                                    <div className="w-full">
                                                        <div className="flex items-center justify-between gap-x-2">
                                                            <div className="flex flex-col">
                                                                <span className="flex items-center gap-x-4">
                                                                    {data.type == 'Buy' || data.type == 'PayLaterBuy' ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                        <path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path>
                                                                    </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                        <path d="M8.238 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.61-4.801L6.24 4.529a.75.75 0 1 0 1.307.73l1.344-2.4a.75.75 0 0 0-.652-1.114zm6.492 1.484c-3.145 0-5.745 2.421-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.064 6.062 6.064 3.145 0 5.742-2.421 6.031-5.492 3.068-.293 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.063-6.062zm0 2.002a4.044 4.044 0 0 1 4.064 4.061c0 2.105-1.593 3.764-3.637 3.982a6.051 6.051 0 0 0-1.316-2.502 3.242 3.242 0 0 0-.273-.315 3.263 3.263 0 0 0-.338-.292 6.044 6.044 0 0 0-2.48-1.287c.212-2.05 1.87-3.647 3.98-3.647zm-5.453 5.463c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.749.749 0 0 0-.746.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.308-.73l-1.342 2.4a.75.75 0 0 0 .653 1.114 6.504 6.504 0 0 0 6.494-6.494.75.75 0 0 0-.752-.748z"></path>
                                                                    </svg>}
                                                                    {data.type == 'PayLaterBuy' ? 'خرید قرضی' : data.type == 'Buy' ? 'خرید' : 'فروش'} {data.tradeable ? <span>{data.tradeable?.nameFa}</span> : ''}</span>
                                                                {data.type == 'Buy' || data.type == 'PayLaterBuy' ?
                                                                    <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                        <span className="ltr">
                                                                            {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}+
                                                                        </span> گرم</span> : <span className="block text-lg text-sell mt-2">
                                                                        <span className="ltr">
                                                                            {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}-
                                                                        </span> گرم</span>}
                                                                <span className="text-sm mt-2 px-4">{(data.total || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                                            </div>
                                                            <div className="flex flex-col items-end text-start">
                                                                <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                    .locale('fa')
                                                                    .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                                <span className="block text-sm mt-2">
                                                                    <span>{data.isFixedPrice ? 'قیمت ثابت: ' : 'قیمت: '}</span>
                                                                    <span className="mt-2">
                                                                        {data.tradeablePrice ? `${(data.tradeablePrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` : '------'}
                                                                    </span>
                                                                </span>
                                                                <span className="block mt-2">
                                                                    <span>وضعیت: </span>
                                                                    {data.status == 'Accepted' ? data.paid ? <span className="text-secondary-green dark:text-buy">پرداخت شده</span> :
                                                                        <span className="text-secondary-green dark:text-buy">تائید شده</span> : ''}
                                                                    {data.status == 'Pending' ? data.type == 'PayLaterBuy' && !data.paid ? <span className="text-primary cursor-pointer hover:underline" onClick={handleOpenDialog(data._id)}>در انتظار پرداخت</span> :
                                                                        <span className="text-primary">در انتظار تائید</span> : ''}
                                                                    {data.status == 'Rejected' ? <span className="text-sell cursor-pointer hover:underline" onClick={handleShowReject(data)}>رد شده</span> : ''}

                                                                    {data.status == 'PendingFixedPrice' ? <span className="text-primary">سفارش باز</span> : ''}
                                                                    {data.status == 'Cancelled' ? <span className="text-sell">لغو شده</span> : ''}
                                                                    {['PendingFixedPrice'].includes(data.status) ? <span className="-me-4">
                                                                        <Tooltip title="لغو معامله">
                                                                            <IconButton
                                                                                color={`error`}
                                                                                onClick={cancelFixedPriceOrder(data._id)}>
                                                                                {cancelOrderLoading ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} /> : <CancelIcon />}
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </span> : ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionSummary>
                                            </Accordion>
                                        )
                                    }) : <div className="col-span-12 py-16">
                                        <span className="block text-center text-large-1 text-primary-gray">هنوز معامله ای انجام نداده‌اید.</span>
                                    </div>}
                                    <ConfirmDialog
                                        open={openDialog}
                                        onClose={handleCloseDialog}
                                        onConfirm={handlePayLater}
                                        title="آیا از پرداخت خرید قرضی خود اطمینان دارید؟"
                                        loading={loading}
                                        darkModeToggle={darkModeToggle}
                                    />
                                </>
                                : ''}
                            {tabValue == 5 ?
                                requests.length > 0 ? requests.map((data, index) => {
                                    return (
                                        <Accordion key={index} className={`custom-accordion ${(data.branchTime && Object.keys(data.branchTime).length > 0) || data.purity ? '' : 'disable'} col-span-12 !rounded-2xl !px-6 !py-2`} sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className={`font-medium text-black w-full ${(data.branchTime && Object.keys(data.branchTime).length > 0) || data.purity ? '' : '!cursor-default *:!my-3'}`}
                                                expandIcon={''}>
                                                <div className="w-full flex flex-col">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div className="flex flex-col gap-y-2">
                                                            <span className="flex items-center gap-x-4">
                                                                <ShoppingCartIcon />
                                                                <span className="flex items-center gap-x-4">
                                                                    {data.product?.name}
                                                                </span>
                                                            </span>
                                                            <span>
                                                                {((data.amount || data.amountOrCount || 0) + (data.product?.isQuantitative ? 0 : (data.differenceAmount || 0))).toLocaleString('en-US', { maximumFractionDigits: 3 })}&nbsp;
                                                                {data.product?.isQuantitative ? 'عدد' : 'گرم'}
                                                                {data.product?.price ? <span>&nbsp;({(
                                                                    ((data.product?.price || 0) +
                                                                        (data.product?.wageType === 'Fixed'
                                                                            ? data.product?.wage
                                                                            : data.product?.wageType === 'Percent'
                                                                                ? (data.product?.price || 0) * (data.product?.wage / 100)
                                                                                : 0) * (data.amount || data.amountOrCount || 0))
                                                                ).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان)</span> :
                                                                    data.product?.isQuantitative ?
                                                                        <span>&nbsp;({(data.weight || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم) &nbsp;(اجرت: {(data.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} {data.product?.wageType == 'Fixed' ? 'تومان' : 'درصد'})</span> : ''}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col gap-y-2 items-end">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            <span className="block">
                                                                {data.status == 'Accepted' ? <span className="text-secondary-green dark:text-buy">موفق</span> : ''}
                                                                {data.status == 'Pending' ? <span className="text-primary">در انتظار تائید</span> : ''}
                                                                {data.status == 'Rejected' ? <span className="text-sell cursor-pointer hover:underline" onClick={handleShowReject(data)}>ناموفق</span> : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {(data.branchTime && Object.keys(data.branchTime).length > 0) || data.purity ? <div className="flex items-center justify-center">
                                                        <IconButton color={darkModeToggle ? 'white' : 'black'} className="p-1 xl:-mx-8 -rotate-90">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                <path d="M13.26 15.53L9.74 12L13.26 8.46997" stroke={darkModeToggle ? 'white' : '#CBCBCB'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                        </IconButton>
                                                    </div> : ''}
                                                </div>
                                            </AccordionSummary>
                                            {(data.branchTime && Object.keys(data.branchTime).length > 0) || data.purity ? <AccordionDetails className="custom-accordion-text !px-2 !pb-4">
                                                <div className="flex flex-col gap-y-4 w-full text-sm text-black dark:text-alert-warning-foreground mt-4">
                                                    {!data?.product?.price &&
                                                        !data?.product?.isQuantitative ? <>
                                                        <span className="text-black dark:text-white">شماره انگ: {data?.purity || '------'}</span>
                                                        <span className="text-black dark:text-white">نام آزمایشگاه: {data?.labName || '------'}</span>
                                                        <Divider component="div" className="dark:bg-primary dark:bg-opacity-50" />
                                                    </> : ''}
                                                    {data.branchTime && Object.keys(data.branchTime).length > 0 ?
                                                        <>
                                                            <span>
                                                                {data.branchTime?.branch?.nameFa} <br /> آدرس: <span className="whitespace-break-spaces">{data.branchTime?.branch?.address}</span> <br />
                                                                شماره تماس شعبه: <PatternFormat displayType="text" value={data.branchTime?.branch?.phone} format="#### ### ## ##" dir="ltr" />
                                                            </span>
                                                            <span className="whitespace-break-spaces">
                                                                زمان مراجعه: {moment(data.branchTime?.startTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')} الی {moment(data.branchTime?.endTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')}
                                                            </span>
                                                        </> : ''}
                                                </div>
                                            </AccordionDetails> : ''}
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">سبد تحویل فیزیکی خالی می باشد.</span>
                                </div> : ''}
                            {(siteInfo?.paidModules && siteInfo?.paidModules?.includes('OrderBook')) && userInfo?.orderBookIsActive ? tabValue == 6 ?
                                transactions.length > 0 ? transactions.map((data, index) => {
                                    return (
                                        <Accordion key={index} className="custom-accordion col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className="font-medium text-black w-full *:!my-3"
                                                expandIcon={''}>
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div>
                                                            <span className="flex items-center gap-x-4">
                                                                {data.type == 'Buy' ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path>
                                                                </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M8.238 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.61-4.801L6.24 4.529a.75.75 0 1 0 1.307.73l1.344-2.4a.75.75 0 0 0-.652-1.114zm6.492 1.484c-3.145 0-5.745 2.421-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.064 6.062 6.064 3.145 0 5.742-2.421 6.031-5.492 3.068-.293 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.063-6.062zm0 2.002a4.044 4.044 0 0 1 4.064 4.061c0 2.105-1.593 3.764-3.637 3.982a6.051 6.051 0 0 0-1.316-2.502 3.242 3.242 0 0 0-.273-.315 3.263 3.263 0 0 0-.338-.292 6.044 6.044 0 0 0-2.48-1.287c.212-2.05 1.87-3.647 3.98-3.647zm-5.453 5.463c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.749.749 0 0 0-.746.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.308-.73l-1.342 2.4a.75.75 0 0 0 .653 1.114 6.504 6.504 0 0 0 6.494-6.494.75.75 0 0 0-.752-.748z"></path>
                                                                </svg>}
                                                                {data.type == 'Buy' ? 'خرید' : 'فروش'} {data.tradeable ? <span>{data.tradeable?.nameFa}</span> : ''}</span>
                                                            {data.status == 'Finished' ? (data.wage > 0 && data.totalPrice > 0) ? data.type == 'Buy' ?
                                                                <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}+
                                                                    </span> گرم</span> : <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}-
                                                                    </span> گرم</span> : <span className="block text-lg mt-2">
                                                                <span className="ltr">
                                                                    {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}
                                                                </span> گرم</span> : data.type == 'Buy' ?
                                                                <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}+
                                                                    </span> گرم</span> : <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}-
                                                                    </span> گرم</span>}
                                                        </div>
                                                        <div className="flex items-center gap-x-2">
                                                            <div className="flex flex-col items-end text-start">
                                                                <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                    .locale('fa')
                                                                    .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                                <span className="block mt-2">
                                                                    <span>وضعیت: </span>
                                                                    {data.status == 'Queued' ? <span className="text-primary">در صف انتظار</span> : ''}
                                                                    {data.status == 'Processing' ? <span className="text-blue-500">جدید</span> : ''}
                                                                    {data.status == 'InProgress' ? <span className="text-blue-500">در حال پردازش</span> : ''}
                                                                    {data.status == 'Finished' ? (data.wage > 0 && data.totalPrice > 0) ?
                                                                        <span className="text-secondary-green dark:text-buy">تکمیل شده</span> :
                                                                        <span className="text-sell">انجام نشده</span> : ''}
                                                                    {data.status == 'Canceled' ? <span className="text-sell">لغو شده</span> : ''}
                                                                </span>
                                                            </div>
                                                            <span>
                                                                {['Queued', 'Processing', 'InProgress'].includes(data.status) ? <Tooltip title="لغو سفارش">
                                                                    <IconButton
                                                                        color={`error`}
                                                                        onClick={cancelOrder(data._id)}>
                                                                        {cancelOrderLoading ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} /> : <CancelIcon />}
                                                                    </IconButton>
                                                                </Tooltip> : ''}
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
                                            <AccordionDetails className="custom-accordion-text !px-4 !pb-4">
                                                <div className="w-full grid grid-cols-12 gap-4">
                                                    <div className="col-span-6 md:col-span-3 flex flex-col items-start md:items-center">
                                                        <span>مبلغ معامله: </span>
                                                        {data.totalPrice > 0 ? `${(data.totalPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` : '------'}
                                                    </div>
                                                    <div className="col-span-6 md:col-span-3 flex flex-col items-start md:items-center">
                                                        <span>قیمت معامله: </span>
                                                        {data.avgPrice > 0 ? `${(data.avgPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` : '------'}
                                                    </div>

                                                    <div className="col-span-6 md:col-span-3 flex flex-col items-start md:items-center">
                                                        <span>پیشرفت: </span>
                                                        {parseInt(((data.amount - data.remainingAmount || 0) * 100) / data.amount) != 0 ?
                                                            `${parseInt(((data.amount - data.remainingAmount || 0) * 100) / data.amount)}%` : 0}
                                                    </div>
                                                    <div className="col-span-6 md:col-span-3 flex flex-col items-start md:items-center">
                                                        <span>کارمزد معامله: </span>
                                                        {data.wage > 0 ? data.type == 'Buy' ?
                                                            `${(data.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 5 })} گرم`
                                                            : `${(data.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان`
                                                            : '------'}
                                                    </div>
                                                </div>
                                            </AccordionDetails>
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">هنوز معامله ای انجام نداده‌اید.</span>
                                </div> : '' : ''}
                            {tabValue == 7 ?
                                transfers.length > 0 ? transfers.map((data, index) => {
                                    return (
                                        <Accordion key={index} className="custom-accordion disable col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className="font-medium text-black w-full *:!my-3"
                                                expandIcon={''}>
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div>
                                                            <span className="flex items-center gap-x-4">
                                                                {data.senderUser?._id != userInfo?._id ? <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path>
                                                                </svg> : <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M8.238 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.61-4.801L6.24 4.529a.75.75 0 1 0 1.307.73l1.344-2.4a.75.75 0 0 0-.652-1.114zm6.492 1.484c-3.145 0-5.745 2.421-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.064 6.062 6.064 3.145 0 5.742-2.421 6.031-5.492 3.068-.293 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.063-6.062zm0 2.002a4.044 4.044 0 0 1 4.064 4.061c0 2.105-1.593 3.764-3.637 3.982a6.051 6.051 0 0 0-1.316-2.502 3.242 3.242 0 0 0-.273-.315 3.263 3.263 0 0 0-.338-.292 6.044 6.044 0 0 0-2.48-1.287c.212-2.05 1.87-3.647 3.98-3.647zm-5.453 5.463c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.749.749 0 0 0-.746.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.308-.73l-1.342 2.4a.75.75 0 0 0 .653 1.114 6.504 6.504 0 0 0 6.494-6.494.75.75 0 0 0-.752-.748z"></path>
                                                                </svg>}
                                                                {data.senderUser?._id == userInfo?._id ? 'انتقال' : 'دریافت'} {data.tradeable ? <span>{data.tradeable?.nameFa}</span> : ''}</span>
                                                            {data.senderUser?._id != userInfo?._id ?
                                                                <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}+
                                                                    </span> گرم</span> : <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}-
                                                                    </span> گرم</span>}
                                                        </div>
                                                        <div className="flex flex-col items-end text-start">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            <span className="block mt-2">
                                                                <span>وضعیت: </span>
                                                                {data.status == 'Accepted' ? data.paid ? <span className="text-secondary-green dark:text-buy">پرداخت شده</span> :
                                                                    <span className="text-secondary-green dark:text-buy">تائید شده</span> : ''}
                                                                {data.status == 'Pending' ? data.type == 'PayLaterBuy' && !data.paid ? <span className="text-primary cursor-pointer hover:underline" onClick={handleOpenDialog(data._id)}>در انتظار پرداخت</span> :
                                                                    <span className="text-primary">در انتظار تائید</span> : ''}
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
                                            <AccordionDetails className="custom-accordion-text !px-4 !pb-4">
                                                <span className="dark:text-white">{data.senderUser?._id == userInfo?._id ? 'به حساب کاربر' : 'از حساب کاربر'} : {data.senderUser?._id == userInfo?._id ? `(${data?.receiverUser?.mobileNumber || ''}) ${data?.receiverUser?.firstName || ''} ${data?.receiverUser?.lastName || ''}` : `(${data?.senderUser?.mobileNumber || ''}) ${data?.senderUser?.firstName || ''} ${data?.senderUser?.lastName || ''}`}</span>
                                            </AccordionDetails>
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">تاکنون انتقالی انجام نشده است.</span>
                                </div>
                                : ''}
                            {tabValue == 9 ?
                                transactions.length > 0 ? transactions.map((data, index) => {
                                    return (
                                        <Accordion key={index} className="custom-accordion col-span-12 !rounded-2xl !px-6 !py-2" sx={{ '&:before': { display: 'none' } }}>
                                            <AccordionSummary
                                                className="font-medium text-black w-full *:!my-3"
                                                expandIcon={''}>
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between gap-x-2">
                                                        <div>
                                                            <span className="flex items-center gap-x-4 whitespace-nowrap">
                                                                <svg viewBox="0 0 24 24" className="svg-icon">
                                                                    <path d="M12.9 1.42c-.33 0-.66.059-.97.176a1 1 0 0 0-.003 0l-7.26 2.742c-1.4.53-2.33 1.88-2.33 3.377v4.81a6.144 6.144 0 0 0-.476 7.058 6.13 6.13 0 0 0 5.28 2.994c1.196 0 2.32-.344 3.27-.948a1 1 0 0 0 .17.034h6.694c2.437 0 4.438-2.003 4.438-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2-4.438-4.438-4.438h-1.643V4.16a2.728 2.728 0 0 0-1.18-2.251 2.738 2.738 0 0 0-1.553-.489zm-.094 2.006a.754.754 0 0 1 .51.125.73.73 0 0 1 .23.266.736.736 0 0 1 .086.341 1 1 0 0 0 0 .002v2.473H6.777c-.879 0-1.7.264-2.393.711.12-.516.48-.941.99-1.135l7.26-2.742a.721.721 0 0 1 .172-.04zM6.777 8.633h10.5a2.435 2.435 0 0 1 2.438 2.438v.318h-.847c-.771 0-1.5.312-2.023.846a2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904l.05-.084c.57-.93.895-2.024.895-3.176a6.172 6.172 0 0 0-3.502-5.564 6.159 6.159 0 0 0-5.467.063 2.434 2.434 0 0 1 2.43-2.268zm.477 3.6a4.177 4.177 0 0 1 3.42 1.947c.419.666.64 1.436.64 2.223 0 .783-.217 1.52-.6 2.14a1 1 0 0 0-.01.02 3.66 3.66 0 0 1-.802.954 1 1 0 0 0-.027.023 4.039 4.039 0 0 1-2.734 1.037 1 1 0 0 0-.002 0 4.137 4.137 0 0 1-3.563-2.019 1 1 0 0 0-.005-.014 4.07 4.07 0 0 1-.604-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .005-.003 4.17 4.17 0 0 1 2.721-.915zm11.61 1.156h1.816v1.748h-1.705c-.5 0-.945-.37-.98-.793a1 1 0 0 0-.003-.012.83.83 0 0 1 .254-.68 1 1 0 0 0 .018-.017.803.803 0 0 1 .6-.246zm-11.73.568a.75.75 0 0 0-.75.75v.907h-.94a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75h.94v.986a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75v-.986h.945a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75h-.945v-.907a.75.75 0 0 0-.75-.75z">

                                                                    </path>
                                                                </svg>
                                                                {LogActions(data.action)}</span>
                                                            {data.change == 0 ? <span className="block text-lg text-black dark:text-white mt-2">
                                                                <span className="ltr">
                                                                    {(data.change || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                                </span> تومان</span> : data.change > 0 ?
                                                                <span className="block text-lg text-secondary-green dark:text-buy mt-2">
                                                                    <span className="ltr">
                                                                        {(data.change || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}+
                                                                    </span> تومان</span> : <span className="block text-lg text-sell mt-2">
                                                                    <span className="ltr">
                                                                        {(Number(data.change?.toString()?.replace('-', '') || 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })}-
                                                                    </span> تومان</span>}
                                                        </div>
                                                        <div className="flex flex-col items-end text-start">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            <span className="block text-end mt-2">
                                                                <span>موجودی: </span>
                                                                <span dir="ltr">{(data.balance || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> تومان
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
                                                <div className="flex flex-col">
                                                    <span>توضیحات: </span>
                                                    {data.action == 'ReferralReward' ?
                                                        <p className="whitespace-pre-line m-0">پاداش دعوت {data.description} نفر</p> :
                                                        <p className="whitespace-pre-line m-0">{data.description ? (data.description) : '----'}</p>}
                                                </div>
                                            </AccordionDetails>
                                        </Accordion>
                                    )
                                }) : <div className="col-span-12 py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">تغییراتی ثبت نشده است.</span>
                                </div> : ''}
                            {tabValue == 11 ?
                                <>
                                    {transactions.length > 0 ? transactions.map((data, index) => {
                                        return (
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
                                                                            <IconButton color="error" className="-me-4" onClick={handleOpenGiftcardDialog(data._id)}>
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
                                        )
                                    }) : <div className="col-span-12 py-16">
                                        <span className="block text-center text-large-1 text-primary-gray">درخواستی ثبت نشده است.</span>
                                    </div>}
                                    <ConfirmDialog
                                        open={openGiftcardDialog}
                                        onClose={handleCloseGiftcardDialog}
                                        onConfirm={deleteGiftcardOrder}
                                        title="آیا مطمئن هستید؟"
                                        loading={deleteGiftcardLoading}
                                        darkModeToggle={darkModeToggle}
                                    />
                                </> : ''}
                            {(Math.ceil(transactionsTotal / transactionsLimit) > 1) && tabValue != 10 ?
                                <div className="col-span-12 text-center mt-4">
                                    <Pagination siblingCount={0} count={Math.ceil(transactionsTotal / transactionsLimit)} variant="outlined" color="primary" className="justify-center"
                                        page={pageItem} onChange={handlePageChange} />
                                </div>
                                : ''}
                        </div>}
                </div>
            </section>

            {/* Reject Description */}
            <>
                <Dialog onClose={() => setShowReject(false)} open={showReject} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <Typography component={'h2'}>علت رد شدن {tabValue == 2 ? 'معامله' : 'تراکنش'}</Typography>
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
                                value={tabValue == 2 ? (itemData?.confirmDescription || itemData?.rejectReason) : itemData?.confirmDescription} />
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
                    <Typography component={'h2'}>علت رد شدن {tabValue == 2 ? 'معامله' : 'تراکنش'}</Typography>
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
                                value={tabValue == 2 ? (itemData?.confirmDescription || itemData?.rejectReason) : itemData?.confirmDescription} />
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

export default HistoryPageCompo;