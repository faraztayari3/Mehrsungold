import { useEffect, useState } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import LoadingButton from '@mui/lab/LoadingButton'
import Slider from '@mui/material/Slider'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Dialog from '@mui/material/Dialog'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import MUISelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import CancelIcon from '@mui/icons-material/CancelOutlined'
import Pagination from '@mui/material/Pagination';
import FormHelperText from '@mui/material/FormHelperText';
import moment from 'jalali-moment'
import Decimal from 'decimal.js';

import { io } from 'socket.io-client'
import TradingViewWidget from "../shared/tradingViewWidget"

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
import FormatNumberFromText from "../../services/formatNumberFromText"

/**
 * OrderbookTradePageCompo component that displays the Orderbook Page Component of the website.
 * @returns The rendered Orderbook Page component.
 */
const OrderbookTradePageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, priceInfo, priceLoading, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);
    const [openAlert, setOpenAlert] = useState(true);
    const [tabValue, setTabValue] = useState(router.query.type == 'buy' ? 0 : 1);

    const [priceType, setPriceType] = useState('Fixed');
    const [symbolPrice, setSymbolPrice] = useState('');
    const [firstInitialize, setFirstInitialize] = useState(true);

    const [rialAmount, setRialAmount] = useState('');
    const [tomanValue, setTomanValue] = useState(0);
    const [tradeableAmount, setTradeableAmount] = useState('');
    const [tradeableInfo, setTradeableInfo] = useState(null);
    const [errorWalletSell, setErrorWalletSell] = useState(false);
    const [errorTomanDivisible, setErrorTomanDivisible] = useState(false);
    const [tomanDivisible, setTomanDivisible] = useState(0);
    const [tradeableDivisible, setTradeableDivisible] = useState(0);

    const PRICE_TYPES = [
        {
            label: 'قیمت ثابت',
            value: "Fixed"
        },
        {
            label: 'قیمت بازار',
            value: "MarketOrder"
        },
    ]
    const ORDERBOOKS_TABLE_HEAD = [
        {
            label: 'واحد معامله',
            classes: ""
        },
        {
            label: 'نوع معامله',
            classes: ""
        },
        {
            label: 'مقدار',
            classes: ""
        },
        {
            label: 'قیمت معامله',
            classes: ""
        },
        {
            label: 'پیشرفت',
            classes: ""
        },
        {
            label: 'مبلغ معامله',
            classes: ""
        },
        {
            label: 'کارمزد',
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
        {
            label: '',
            classes: ""
        }
    ]

    const [pageItem, setPageItem] = useState(1);
    useEffect(() => {
        if (priceInfo?.length > 0) {
            if (router.query?.tradeable) {
                const tradeable = priceInfo?.filter(item => item.tradeable?.name === router.query?.tradeable);
                setTradeableInfo(tradeable[0]);
                setErrorWalletSell(tradeable[0]?.balance >= tradeable[0]?.tradeable?.minSellAmount ? false : true);
            } else {
                setTradeableInfo(priceInfo[0]);
                setErrorWalletSell(priceInfo[0]?.balance >= priceInfo[0]?.tradeable?.minSellAmount ? false : true);
            }
        }
    }, [priceInfo, router.query?.tradeable]);

    const [firstInit, setFirstInit] = useState(true);
    useEffect(() => {
        if (tradeableInfo && firstInit) {
            getOrderBookSetting(tradeableInfo);
            setFirstInit(false);
            getOrderbooks(pageItem, tradeableInfo?.tradeable?._id);
            initializeSocket();
        }

        return () => {
            if (socket) {
                socket.disconnect();
            }
        }
    }, [tradeableInfo]);

    // Socket Connection
    const [socket, setSocket] = useState(null);
    const [buyOrders, setBuyOrders] = useState([]);
    const [sellOrders, setSellOrders] = useState([]);
    const initializeSocket = () => {
        if (socket) {
            socket.disconnect();
        }

        const socketConnection = io(process.env.NEXT_PUBLIC_BASEURL, {
            autoConnect: false
        });

        socketConnection.connect();
        setSocket(socketConnection);

        return () => {
            if (socketConnection) {
                socketConnection.disconnect();
            }
        }
    }

    // Socket Emits
    useEffect(() => {
        if (socket) {
            const orderBookEvent = `orderBook-${tradeableInfo?.tradeable?._id}`;

            const handleOrderBook = (data) => {
                console.log(111, data);
                setFirstInitialize(false);
                setBuyOrders(data.buy || []);
                setSellOrders(data.sell || []);
            };

            socket.on(orderBookEvent, handleOrderBook);

            socket.on("disconnect", () => {
                if (router.pathname.includes('/panel/trade/orderbook')) {
                    console.log(44444, 'connect');
                    const socketConnection = io(process.env.NEXT_PUBLIC_BASEURL, {
                        autoConnect: false,
                        'forceNew': true
                    });
                    if (socketConnection) {
                        console.log(666, 'final connect');
                        socketConnection.connect();
                        setSocket(socketConnection);
                    }
                }
            });

            // Clean up the event listeners on component unmount
            return () => {
                socket.off(orderBookEvent, handleOrderBook);
                socket.disconnect();
            };
        }
    }, [socket]);

    /**
     * Retrieves User Info for the user.
     * @returns None
    */
    const getUserInformation = () => {
        ApiCall('/user/me', 'GET', locale, {}, '', 'user', router).then(async (result) => {
            dispatch({
                type: 'setUserInfo', value: result
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    /**
        * Retrieves OrderbookSetting.
        * @returns None
       */
    const [orderbookSetting, setOrderbookSetting] = useState([]);
    const [orderbookSettingLoading, setOrderbookSettingLoading] = useState([]);
    const getOrderBookSetting = (tradeable) => {
        setOrderbookSettingLoading(true);
        ApiCall('/order-book/order-book-settings', 'GET', locale, {}, ``, 'user', router).then(async (result) => {
            const tradeableInfoSetting = result.data?.filter(item => item.tradeable?._id == tradeable?.tradeable?._id);
            setOrderbookSetting(tradeableInfoSetting[0] || null);
            setOrderbookSettingLoading(false);
        }).catch((error) => {
            setOrderbookSettingLoading(false);
            console.log(error);
        });
    }

    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [transactionsLimit, settransactionsLimit] = useState(10);
    const [transactionsTotal, setTransactionsTotal] = useState(0);
    const getOrderbooks = (page, tradeableId) => {
        setLoadingTransactions(true);
        ApiCall('/order-book/me', 'GET', locale, {}, `tradeableId=${tradeableId}&sortOrder=0&sortBy=createdAt&limit=${transactionsLimit}&skip=${(page * transactionsLimit) - transactionsLimit}`, 'user', router).then(async (result) => {
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
        getOrderbooks(value, tradeableInfo?.tradeable?._id);
    }

    const [ordersList, setOrdersList] = useState('all');
    const handleOrdersList = (type) => () => {
        setOrdersList(type);
    }

    const [openTooltip, setOpenTooltip] = useState(false);
    const handleTooltipClose = () => {
        setOpenTooltip(false);
    }
    const handleTooltipOpen = () => {
        setOpenTooltip(true);
        setTimeout(() => {
            setOpenTooltip(false);
        }, 3000);
    }

    /**
         * Sets the order price for the price inuts.
         * @param {{number}} price - The price to set for all symbol prices.
         * @param {{Event}} event - The event object triggered by the input.
         * @returns None
         */
    const setInputValue = (price) => (event) => {
        event.preventDefault();
        setSymbolPrice(price);
        setTomanValue((price || 0) * (tradeableAmount || 0));
    }
    const handleChangePriceType = (event) => {
        if (event.target.value == 'MarketOrder' && tabValue == 0) {
            setValue('isMarketBuyOrder', true);
        } else {
            setValue('isMarketBuyOrder', false);
        }
        setPriceType(event.target.value);
        setSymbolPrice('');
        setRialAmount('');
        setTradeableAmount('');
        setSliderValue(0);
        setErrorTomanDivisible(false);
        setTomanDivisible(0);
        clearErrors();
        clearForm();
    }

    const validationSchema = Yup.object({
        isMarketBuyOrder: Yup.boolean(),
        amount: Yup.string().when("isMarketBuyOrder", {
            is: true,
            then: schema => schema.optional(),
            otherwise: schema => schema.required('این فیلد الزامی است').transform(value => value.replace(/,/g, ''))
                .test(
                    'is-multiple-of-minTradeableAmount',
                    `مقدار معامله باید حداقل ${tabValue == 0 ? (tradeableInfo?.tradeable?.minBuyAmount || 0) : (tradeableInfo?.tradeable?.minSellAmount || 0)} باشد`,
                    value => {
                        const parsedValue = floorNumber(value?.replace(/,/g, '') || 0, (tabValue == 0 ? (tradeableInfo?.tradeable?.buyMaxDecimals ?? 3) : (tradeableInfo?.tradeable?.sellMaxDecimals ?? 3)));
                        return !isNaN(parsedValue) && (parsedValue >= (tabValue == 0 ? (tradeableInfo?.tradeable?.minBuyAmount || 0) : (tradeableInfo?.tradeable?.minSellAmount || 0)));
                    }
                )
        })
    });

    const { control, setValue, trigger, clearErrors, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: { isMarketBuyOrder: (priceType == 'MarketOrder' && tabValue == 0) }
    });

    const clearForm = () => {
        setValue('amount', '');
    }

    useEffect(() => {
        setTabValue(router.query.type == 'buy' ? 0 : 1);
        setSymbolPrice('');
        setRialAmount('');
        setTradeableAmount('');
        setSliderValue(0);
        setErrorTomanDivisible(false);
        setTomanDivisible(0);
        clearErrors();
        clearForm();
    }, [router.query.type]);

    const handleChange = (event, newTabValue) => {
        if (priceType == 'MarketOrder' && newTabValue == 0) {
            setValue('isMarketBuyOrder', true);
        } else {
            setValue('isMarketBuyOrder', false);
        }
        setTabValue(newTabValue);
        setSymbolPrice('');
        setRialAmount('');
        setTradeableAmount('');
        setSliderValue(0);
        clearErrors();
        clearForm();
        setErrorTomanDivisible(false);
        setTomanDivisible(0);
        if (newTabValue == 0) {
            router.push(`/panel/trade/orderbook?type=buy${router.query?.tradeable ? `&tradeable=${router.query?.tradeable}` : ''}`, `/panel/trade/orderbook?type=buy${router.query?.tradeable ? `&tradeable=${router.query?.tradeable}` : ''}`, { locale });
        } else {
            router.push(`/panel/trade/orderbook?type=sell${router.query?.tradeable ? `&tradeable=${router.query?.tradeable}` : ''}`, `/panel/trade/orderbook?type=sell${router.query?.tradeable ? `&tradeable=${router.query?.tradeable}` : ''}`, { locale });
        }
    }

    // Buy
    /**
    * Calculates the Inputs value for Buy Amounts.
    * @param {{string}} position - the position of the Changing Input (TMN or Tradeable)
    * @returns None
    */
    const calcInputAmountBuy = async (event, position) => {
        setErrorWalletBuy(false);
        setErrorMinTradeBuy(false);
        const value = event.target.value.replace(/,/g, '');
        const marketBuyprice = (symbolPrice || 0);
        let price = 0;

        if (event.target.value == '') {
            if (position == 'TMN') {
                setSymbolPrice('');
            }
            setSliderValue(0);
        } else {
            if (position == 'TMN') {
                if (priceType == 'Fixed' || (priceType == 'MarketOrder' && tabValue == 1)) {
                    setSymbolPrice(value);
                    setTradeableAmount('');
                    setSliderValue(0);
                    clearErrors();
                } else {
                    setRialAmount(value);
                    const calculatedSliderValue = (value / (userInfo?.tomanBalance || 0)) * 100;
                    if (calculatedSliderValue > 100) {
                        setSliderValue(100);
                    } else if (calculatedSliderValue < 0) {
                        setSliderValue(0);
                    } else {
                        setSliderValue(calculatedSliderValue);
                    }
                }
            } else {
                setTradeableAmount(value);
                price = parseInt(value * marketBuyprice);
                await trigger('amount');
                const calculatedSliderValue = (price / (userInfo?.tomanBalance || 0)) * 100;
                if (calculatedSliderValue > 100) {
                    setSliderValue(100);
                } else if (calculatedSliderValue < 0) {
                    setSliderValue(0);
                } else {
                    setSliderValue(calculatedSliderValue);
                }
            }

        }
    }

    /**
    * Calculates the slider value for Buy Amount.
    * @returns None
    */
    const [sliderValue, setSliderValue] = useState(0);
    const calcAmountSliderBuy = async (event) => {
        setErrorWalletBuy(false);
        setErrorMinTradeBuy(false);
        const value = event.target.value;
        const marketBuyprice = (symbolPrice || 0);
        let size = (userInfo?.tomanBalance || 0) * (value / 100);
        setSliderValue(value);
        if (value == 0) {
            setTradeableAmount('');
            setValue('amount', '');
        } else {
            if (priceType == 'Fixed' || (priceType == 'MarketOrder' && tabValue == 1)) {
                setTradeableAmount(Number(new Decimal(size).dividedBy(marketBuyprice).toDecimalPlaces((tradeableInfo?.tradeable?.buyMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()));
                setValue('amount', Number(new Decimal(size).dividedBy(marketBuyprice).toDecimalPlaces((tradeableInfo?.tradeable?.buyMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()));
            } else {
                setRialAmount(floorNumber(size, 0));
            }
            await trigger('amount');
        }

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

    /**
     * User Buy Request.
     * @returns None
    */
    const [errorWalletBuy, setErrorWalletBuy] = useState(userInfo?.tomanBalance >= 0 ? false : true);
    const [errorMinTradeBuy, setErrorMinTradeBuy] = useState(false);
    const userBuy = () => {
        if ((!siteInfo?.offlineFirstStepUserVerifyEnabled && !siteInfo?.onlineFirstStepUserVerifyEnabled) || (['FirstLevelVerified', 'SecondLevelVerified'].includes(userInfo?.verificationStatus))) {
            if ((rialAmount || 0) <= (userInfo?.tomanBalance || 0)) {
                if ((priceType == 'MarketOrder' && tabValue == 0) || (tradeableAmount || 0) >= ((tradeableInfo?.tradeable?.minBuyAmount || 0))) {
                    setErrorWalletBuy(false);
                    setErrorMinTradeBuy(false);
                    setLoading(true);
                    let body;
                    if (priceType == 'Fixed') {
                        body = { type: 'Buy', priceType: 'Fixed', tradeableId: tradeableInfo?.tradeable?._id, amount: Number(tradeableAmount), price: Number(symbolPrice) }
                    } else {
                        body = { type: 'Buy', priceType: 'MarketOrder', tradeableId: tradeableInfo?.tradeable?._id, total: Number(rialAmount) }
                    }

                    ApiCall('/order-book', 'POST', locale, body, '', 'user', router).then(async (result) => {
                        dispatch({
                            type: 'setSnackbarProps', value: {
                                open: true, content: langText('Global.SuccessRequest'),
                                type: 'success', duration: 5000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                            }
                        });
                        setLoading(false);
                        getUserInformation();
                        dispatch({
                            type: 'setRefreshInventory', value: parseInt(Math.floor(Math.random() * 100) + 1)
                        });
                        setSymbolPrice('');
                        setRialAmount('');
                        setTradeableAmount('');
                        setSliderValue(0);
                        setErrorTomanDivisible(false);
                        setTomanDivisible(0);
                        clearErrors();
                        clearForm();
                        // router.push('/panel/history', '/panel/history', { locale });
                    }).catch((error) => {
                        setLoading(false);
                        console.log(error);
                        let list = '';
                        error.message && typeof error.message == 'object' ? error.message.map(item => {
                            list += `${item}<br />`
                        }) : list = error.message;
                        dispatch({
                            type: 'setSnackbarProps', value: {
                                open: true, content: FormatNumberFromText(list),
                                type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                            }
                        });
                    });
                } else {
                    setErrorWalletBuy(false);
                    setErrorMinTradeBuy(true);
                }
            } else {
                setErrorMinTradeBuy(false);
                setErrorWalletBuy(true);
            }
        } else {
            if (window.innerWidth >= 1024) {
                dispatch({
                    type: 'setShowAuthenticate', value: true
                });
                dispatch({
                    type: 'setOpenBottomAuthenticate', value: false
                });
            } else {
                dispatch({
                    type: 'setShowAuthenticate', value: false
                });
                dispatch({
                    type: 'setOpenBottomAuthenticate', value: true
                });
            }
        }
    }

    // Sell
    /**
    * Calculates the Inputs value for Sell Amounts.
    * @param {{string}} position - the position of the Changing Input (TMN or Tradeable)
    * @returns None
    */
    const calcInputAmountSell = async (event, position) => {
        setErrorWalletSell(false);
        setErrorMinTradeSell(false);
        const value = event.target.value.replace(/,/g, '');
        let tradeAmount = 0;

        if (event.target.value == '') {
            if (position == 'TMN') {
                setSymbolPrice('');
            }
            setTomanValue(0);
            setSliderValue(0);
        } else {
            if (position == 'TMN') {
                setSymbolPrice(value);
                setTomanValue((value || 0) * (tradeableAmount || 0));
            } else {
                tradeAmount = value;
                setTradeableAmount(value);
                await trigger('amount');

                setTomanValue((value || 0) * (symbolPrice || buyOrders[0]?.price || 0));
                const calculatedSliderValue = (tradeAmount / (tradeableInfo?.balance || 0)) * 100;
                if (calculatedSliderValue > 100) {
                    setSliderValue(100);
                } else if (calculatedSliderValue < 0) {
                    setSliderValue(0);
                } else {
                    setSliderValue(calculatedSliderValue);
                }
            }
        }
    }

    /**
    * Calculates the slider value for Sell Amount.
    * @returns None
    */
    const calcAmountSliderSell = async (event) => {
        setErrorWalletSell(false);
        setErrorMinTradeSell(false);
        const value = event.target.value;
        let size = (tradeableInfo?.balance || 0) * (value / 100);
        setSliderValue(value);
        if (value == 0) {
            setTradeableAmount('');
            setValue('amount', '');
            setTomanValue(0);
        } else {
            setTradeableAmount(Number(new Decimal(size).toDecimalPlaces((tradeableInfo?.tradeable?.sellMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()));
            setValue('amount', Number(new Decimal(size).toDecimalPlaces((tradeableInfo?.tradeable?.sellMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()));
            setTomanValue(Number(new Decimal(size).toDecimalPlaces((tradeableInfo?.tradeable?.sellMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()) * (symbolPrice || buyOrders[0]?.price || 0));
        }

        await trigger('amount');
    }

    /**
         * User Sell Request.
         * @returns None
        */
    const [errorMinTradeSell, setErrorMinTradeSell] = useState(false);
    const userSell = () => {
        if ((!siteInfo?.offlineFirstStepUserVerifyEnabled && !siteInfo?.onlineFirstStepUserVerifyEnabled) || (['FirstLevelVerified', 'SecondLevelVerified'].includes(userInfo?.verificationStatus))) {
            if ((tradeableAmount || 0) >= ((tradeableInfo?.tradeable?.minSellAmount || 0))) {
                setErrorWalletSell(false);
                setErrorMinTradeSell(false);
                setLoading(true);
                let body;
                if (priceType == 'Fixed') {
                    body = { type: 'Sell', priceType: 'Fixed', tradeableId: tradeableInfo?.tradeable?._id, amount: Number(tradeableAmount), price: Number(symbolPrice) }
                } else {
                    body = { type: 'Sell', priceType: 'MarketOrder', tradeableId: tradeableInfo?.tradeable?._id, amount: Number(tradeableAmount) }
                }

                ApiCall('/order-book', 'POST', locale, body, '', 'user', router).then(async (result) => {
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: langText('Global.SuccessRequest'),
                            type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                    setLoading(false);
                    dispatch({
                        type: 'setRefreshInventory', value: parseInt(Math.floor(Math.random() * 100) + 1)
                    });
                    setSymbolPrice('');
                    setRialAmount('');
                    setTradeableAmount('');
                    setSliderValue(0);
                    setErrorTomanDivisible(false);
                    setTomanDivisible(0);
                    clearErrors();
                    clearForm();
                    // router.push('/panel/history', '/panel/history', { locale });
                }).catch((error) => {
                    setLoading(false);
                    console.log(error);
                    let list = '';
                    error.message && typeof error.message == 'object' ? error.message.map(item => {
                        list += `${item}<br />`
                    }) : list = error.message;
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: FormatNumberFromText(list),
                            type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                });
            } else {
                setErrorWalletSell(false);
                setErrorMinTradeSell(true);
            }
        } else {
            if (window.innerWidth >= 1024) {
                dispatch({
                    type: 'setShowAuthenticate', value: true
                });
                dispatch({
                    type: 'setOpenBottomAuthenticate', value: false
                });
            } else {
                dispatch({
                    type: 'setShowAuthenticate', value: false
                });
                dispatch({
                    type: 'setOpenBottomAuthenticate', value: true
                });
            }
        }
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
            getOrderbooks(pageItem, tradeableInfo?.tradeable?._id);
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
        if (router.query?.tradeable != tradeable?.tradeable?.name) {
            setTradeableInfo(tradeable);
            clearErrors();
            clearForm();
            setErrorTomanDivisible(false);
            setTomanDivisible(0);
        }
        setFirstInit(true);
        setShowTradeables(false);
        setOpenBottomTradeablesDrawer(false);
        if (router.query?.tradeable != tradeable?.tradeable?.name) {
            if (tabValue == 0) {
                router.push(`/panel/trade/orderbook?type=buy&tradeable=${tradeable?.tradeable?.name}`, `/panel/trade/orderbook?type=buy&tradeable=${tradeable?.tradeable?.name}`, { locale });
            } else {
                router.push(`/panel/trade/orderbook?type=sell&tradeable=${tradeable?.tradeable?.name}`, `/panel/trade/orderbook?type=sell&tradeable=${tradeable?.tradeable?.name}`, { locale });
            }
        }
    }

    const [openBottomChartSectionDrawer, setOpenBottomChartSectionDrawer] = useState(false);
    const handleOpenChartSection = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setOpenBottomChartSectionDrawer(true);
    }

    return (
        <>
            {priceLoading ? <div className="h-[50dvh] flex justify-center items-center"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> :
                <section className="grid grid-cols-12 gap-y-4 gap-x-2">
                    {(tradeableInfo?.tradeable?.chartLink && tradeableInfo?.tradeable?.chartLink != 'disable') ? <div className="col-span-12 lg:h-[500px] hidden lg:block">
                        <TradingViewWidget
                            link={tradeableInfo?.tradeable?.chartLink}
                            theme={darkModeToggle ? 'dark' : 'light'}
                        />
                    </div> : ''}
                    <section className="col-span-12 grid grid-cols-12 gap-y-4 gap-x-2 lg:gap-4 bg-light-secondary-foreground shadow lg:bg-transparent lg:shadow-none dark:lg:bg-transparent dark:lg:shadow-none dark:bg-dark-alt rounded-2xl px-0 -mx-4 md:m-0">
                        <Tabs variant="fullWidth" indicatorColor="primary" textColor="inherit" className="col-span-12 rounded-t-2xl -mt-1 lg:hidden"
                            value={tabValue}
                            onChange={handleChange}>
                            <Tab label="خرید" classes={{ selected: 'text-primary' }} />
                            <Tab label="فروش" classes={{ selected: 'text-primary' }} />
                        </Tabs>
                        <div className="form-group col-span-12 lg:hidden flex flex-col gap-y-2 px-4 py-2">
                            {/* <label htmlFor="tradeables" className="form-label">واحدهای قابل معامله</label> */}
                            <TextField type="text" id="tradeables" className="form-input rounded-2xl"
                                InputProps={{
                                    classes: { root: 'rtl:pr-0 ltr:pl-0 dark:bg-dark cursor-pointer rounded-2xl', input: darkModeToggle ? 'text-white cursor-pointer' : 'text-black cursor-pointer', focused: 'border-none' },
                                    autoComplete: "false",
                                    readOnly: true,
                                    startAdornment: <div className="w-9 min-h-[1.71875rem] flex items-center justify-center rounded-[50%] bg-primary-gray dark:bg-white dark:bg-opacity-10 mx-2">
                                        {tradeableInfo ? <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${tradeableInfo?.tradeable?.image}`} alt={tradeableInfo?.tradeable?.name}
                                            className="w-4 min-h-4 rounded-[50%]" /> : ''}
                                    </div>,
                                    endAdornment: <div className="flex items-center gap-x-0">
                                        {(tradeableInfo?.tradeable?.chartLink && tradeableInfo?.tradeable?.chartLink != 'disable') ? <IconButton color={darkModeToggle ? 'white' : 'black'} className="lg:hidden"
                                            onClick={handleOpenChartSection}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path opacity="0.4" d="M7.5 4.5H7.25V2C7.25 1.59 6.91 1.25 6.5 1.25C6.09 1.25 5.75 1.59 5.75 2V4.5H5.5C3.91 4.5 3 5.41 3 7V13C3 14.59 3.91 15.5 5.5 15.5H5.75V22C5.75 22.41 6.09 22.75 6.5 22.75C6.91 22.75 7.25 22.41 7.25 22V15.5H7.5C9.09 15.5 10 14.59 10 13V7C10 5.41 9.09 4.5 7.5 4.5Z" fill={darkModeToggle ? 'white' : 'black'} />
                                                <path d="M18.5 8.5H18.25V2C18.25 1.59 17.91 1.25 17.5 1.25C17.09 1.25 16.75 1.59 16.75 2V8.5H16.5C14.91 8.5 14 9.41 14 11V17C14 18.59 14.91 19.5 16.5 19.5H16.75V22C16.75 22.41 17.09 22.75 17.5 22.75C17.91 22.75 18.25 22.41 18.25 22V19.5H18.5C20.09 19.5 21 18.59 21 17V11C21 9.41 20.09 8.5 18.5 8.5Z" fill={darkModeToggle ? 'white' : 'black'} />
                                            </svg>
                                        </IconButton> : ''}
                                        <svg className="w-9 h-9 dark:!fill-white" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"></path></svg>
                                    </div>
                                }}
                                value={locale == 'fa' ? `${tradeableInfo?.tradeable?.nameFa || ''}` : `${tradeableInfo?.tradeable?.name || ''}`}
                                onClick={handleOpenTradeables} />
                        </div>
                        <div className="col-span-6 lg:col-span-5 orderbook custom-card rounded-2xl order-2 lg:order-1 !px-2 lg:!px-0">
                            <div className="w-[93%] flex justify-between gap-x-1 lg:px-4">
                                <span className="text-base font-bold whitespace-nowrap mt-2">سفارشات</span>
                                <div className="justify-end items-center gap-2 flex w-full">
                                    <IconButton color={darkModeToggle ? 'white' : 'black'} className="px-1 py-0.5" onClick={handleOrdersList('all')}>
                                        <div className="w-5 h-5 relative">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="21" viewBox="0 0 23 21" fill="none">
                                                <g opacity={`${ordersList == 'all' ? '' : '0.4'}`}>
                                                    <path d="M22 1L22 19" stroke="#4D5F7A" strokeWidth="1.5" strokeLinecap="round" />
                                                    <path d="M17 1L17 19" stroke="#4D5F7A" strokeWidth="1.5" strokeLinecap="round" />
                                                    <path d="M12 1L12 19" stroke="#4D5F7A" strokeWidth="1.5" strokeLinecap="round" />
                                                    <path d="M5.24 0H3.34C1.15 0 0 1.15 0 3.33V5.23C0 7.41 1.15 8.56 3.33 8.56H5.23C7.41 8.56 8.56 7.41 8.56 5.23V3.33C8.57 1.15 7.42 0 5.24 0Z" fill="#26D192" />
                                                    <path d="M5.24 11.56H3.34C1.15 11.56 0 12.71 0 14.89V16.79C0 18.98 1.15 20.13 3.33 20.13H5.23C7.41 20.13 8.56 18.98 8.56 16.8V14.9C8.57 12.71 7.42 11.56 5.24 11.56Z" fill="#F24333" />
                                                </g>
                                            </svg>

                                        </div>
                                    </IconButton>
                                    <IconButton color={darkModeToggle ? 'white' : 'black'} className="px-1 py-0.5" onClick={handleOrdersList('buy')}>
                                        <div className="w-5 h-5 relative">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="20" viewBox="0 0 23 20" fill="none">
                                                <g opacity={`${ordersList == 'buy' ? '' : '0.4'}`}>
                                                    <path d="M22 1L22 19" stroke="#4D5F7A" strokeWidth="1.5" strokeLinecap="round" />
                                                    <path d="M17 1L17 19" stroke="#4D5F7A" strokeWidth="1.5" strokeLinecap="round" />
                                                    <path d="M12 1L12 19" stroke="#4D5F7A" strokeWidth="1.5" strokeLinecap="round" />
                                                    <path d="M5.24 0H3.34C1.15 0 0 1.15 0 3.33V15.23C0 17.41 1.15 18.56 3.33 18.56H5.23C7.41 18.56 8.56 17.41 8.56 15.23V3.33C8.57 1.15 7.42 0 5.24 0Z" fill="#26D192" fillOpacity="0.7" />
                                                </g>
                                            </svg>

                                        </div>
                                    </IconButton>
                                    <IconButton color={darkModeToggle ? 'white' : 'black'} className="px-1 py-0.5" onClick={handleOrdersList('sell')}>
                                        <div className="w-5 h-5 relative">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="20" viewBox="0 0 23 20" fill="none">
                                                <g opacity={`${ordersList == 'sell' ? '' : '0.4'}`}>
                                                    <path d="M22 1L22 19" stroke="#4D5F7A" strokeWidth="1.5" strokeLinecap="round" />
                                                    <path d="M17 1L17 19" stroke="#4D5F7A" strokeWidth="1.5" strokeLinecap="round" />
                                                    <path d="M12 1L12 19" stroke="#4D5F7A" strokeWidth="1.5" strokeLinecap="round" />
                                                    <path d="M5.24 0H3.34C1.15 0 0 1.15 0 3.33V15.23C0 17.41 1.15 18.56 3.33 18.56H5.23C7.41 18.56 8.56 17.41 8.56 15.23V3.33C8.57 1.15 7.42 0 5.24 0Z" fill="#F24333" fillOpacity="0.7" />
                                                </g>
                                            </svg>

                                        </div>
                                    </IconButton>
                                </div>
                            </div>
                            <div className={`lg:h-[535px] h-[345px] overflow-hidden`}>
                                <div className="flex items-center justify-between mt-4 lg:px-4">
                                    <div className="text-start text-dark-light text-base"><span className="font-bold">قیمت</span></div>
                                    <div className="text-end text-dark-light text-base"><span className="font-bold">مقدار</span> {tradeableInfo?.tradeable?.nameFa}</div>
                                </div>
                                <div className={`${ordersList == 'all' ? 'h-1/2 md:h-[45%] lg:h-1/2 overflow-hidden lg:!overflow-y-auto lg:overflow-x-hidden' : 'hidden'}
                   ${ordersList == 'buy' ? '!block h-full overflow-y-auto' : ''}  `}>
                                    {buyOrders.length > 0 || firstInitialize ? <table className="w-full border-separate border-spacing-y-1 overflow-hidden">
                                        <tbody className="block overflow-hidden">
                                            {buyOrders.map((data, index) => {
                                                let sizePercent = parseInt(((data.amount - data.remainingAmount) * 100) / data.amount);
                                                return (
                                                    <tr className="whitespace-nowrap text-xs font-bold table w-full table-fixed cursor-pointer mb-1 h-5" key={index} onClick={setInputValue(data.price)}
                                                        style={{
                                                            backgroundImage: 'linear-gradient(-90deg, rgba(125, 207, 182, 0.2) 50%, rgba(125, 207, 182, 0.2) 100%)',
                                                            backgroundPosition: '100% 0',
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundSize: `${sizePercent}% 100%`,
                                                        }}>
                                                        <td className="text-start text-secondary-green dark:text-buy lg:px-4">
                                                            {data.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                        </td>
                                                        <td className="  text-end text-[#808080] dark:text-white lg:px-4">
                                                            {data.remainingAmount.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table> : <div className="h-full flex items-center justify-center opacity-70 text-primary-green dark:text-secondary-green">
                                        صف خرید خالی می‌باشد
                                    </div>}
                                </div>
                                <div className={`w-full border-b border-x-0 border-t-0 border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20 
                                    ${ordersList == 'all' ? '' : 'hidden'}`}></div>
                                {/* <table className="w-full border-separate border-spacing-y-1 overflow-hidden">
                    <tbody className="h-fit block overflow-hidden">
                      <tr className="table w-full table-fixed">
                        <td className="border-y text-center dark:text-white text-base font-bold cursor-pointer" onClick={setInputValue(symbolInfo?.getSymbol?.last)}>
                          <span className=" ">{parseFloat(symbolInfo?.getSymbol?.last || 0).toLocaleString(undefined, { maximumFractionDigits: 10 })}</span>
                        </td>
                      </tr>
                    </tbody>

                  </table> */}
                                <div className={`${ordersList == 'all' ? 'h-1/2 overflow-hidden lg:!overflow-y-auto lg:overflow-x-hidden' : 'hidden'}
                   ${ordersList == 'sell' ? '!block h-full overflow-y-auto' : ''}  `}>
                                    {sellOrders.length > 0 || firstInitialize ? <table className="w-full border-separate border-spacing-y-1 overflow-hidden">
                                        <tbody className="block overflow-hidden pb-[12%] lg:pb-[10%]">
                                            {sellOrders.map((data, index) => {
                                                let sizePercent = parseInt(((data.amount - data.remainingAmount) * 100) / data.amount);
                                                return (
                                                    <tr className="whitespace-nowrap text-xs font-bold table w-full table-fixed cursor-pointer mb-1 h-5" key={index} onClick={setInputValue(data.price)}
                                                        style={{
                                                            backgroundImage: 'linear-gradient(-90deg, rgba(242, 67, 51, 0.2) 50%, rgba(242, 67, 51, 0.2) 100%)',
                                                            backgroundPosition: '100% 0',
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundSize: `${sizePercent}% 100%`,
                                                        }}>
                                                        <td className="  text-start text-sell lg:px-4">
                                                            {data.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                        </td>
                                                        <td className="  text-end text-[#808080] dark:text-white lg:px-4">
                                                            {data.remainingAmount.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table> : <div className="h-full flex items-center justify-center opacity-70 text-sell">
                                        صف فروش خالی می‌باشد
                                    </div>}
                                </div>
                            </div>
                        </div>
                        <div className="col-span-6 lg:col-span-7 orderbook custom-card rounded-2xl flex flex-col pb-4 !px-0 order-1 lg:order-2">
                            <Tabs variant="fullWidth" indicatorColor="primary" textColor="inherit" className="rounded-t-2xl -mt-1 hidden lg:flex"
                                value={tabValue}
                                onChange={handleChange}>
                                <Tab label="خرید" classes={{ selected: 'text-primary' }} />
                                <Tab label="فروش" classes={{ selected: 'text-primary' }} />
                            </Tabs>
                            <div className="form-group hidden lg:flex flex-col gap-y-2 px-0 py-4 lg:p-4">
                                <label htmlFor="tradeables" className="form-label">واحدهای قابل معامله</label>
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
                            <div className="col-span-12 px-4">
                                <FormControl className="w-full">
                                    <InputLabel id="demo-simple-select-label"
                                        sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>نوع معامله</InputLabel>
                                    <MUISelect
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={priceType}
                                        onChange={handleChangePriceType}
                                        input={<OutlinedInput
                                            id="select-multiple-chip"
                                            label="نوع معامله"
                                            className="dark:bg-dark *:dark:text-white"
                                            sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }} />}
                                        MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                        {PRICE_TYPES?.map((data, index) => (
                                            <MenuItem key={index} value={data.value}>{data.label}</MenuItem>
                                        ))}
                                    </MUISelect>
                                </FormControl>
                            </div>
                            {tabValue == 0 ?
                                <>
                                    <form className="flex flex-col gap-y-3 px-4 py-4 lg:pb-6 lg:px-4" noValidate autoComplete="off" onSubmit={handleSubmit(userBuy)}>
                                        {priceType == 'Fixed' ? <FormControl className="w-full">
                                            <NumericFormat
                                                thousandSeparator
                                                decimalScale={0}
                                                allowNegative={false}
                                                customInput={TextField}
                                                type="tel"
                                                label="قیمت"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    inputProps: {
                                                        className: 'ltr pl-4', maxLength: 15,
                                                        inputMode: 'decimal'
                                                    },
                                                    endAdornment: <span className="input-end-span">تومان</span>,
                                                }}
                                                value={symbolPrice}
                                                onChange={(event) => calcInputAmountBuy(event, 'TMN')} />
                                            {/* {errorTomanDivisible ? <FormHelperText className="text-sell text-xs">نزدیک ترین مقدار تومان به مضرب {tradeableInfo?.tradeable?.minBuyAmount} : <span className="cursor-pointer hover:underline" onClick={handleSeTtomanDivisible}>{tomanDivisible?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> تومان می باشد.</FormHelperText> : ''} */}
                                        </FormControl> : <FormControl className="w-full">
                                            <NumericFormat
                                                thousandSeparator
                                                decimalScale={0}
                                                allowNegative={false}
                                                customInput={TextField}
                                                type="tel"
                                                label="بهترین قیمت بازار"
                                                variant="outlined"
                                                disabled
                                                InputLabelProps={{
                                                    classes: { disabled: darkModeToggle ? '!text-white !text-opacity-70' : '!text-black !text-opacity-70' },
                                                    sx: {
                                                        color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)',
                                                        textAlign: 'center',
                                                        width: '100%',
                                                    }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    inputProps: { className: 'text-center' },
                                                    readOnly: true
                                                }}
                                                value={''} />
                                        </FormControl>}
                                        {priceType == 'Fixed' || (priceType == 'MarketOrder' && tabValue == 1) ? <FormControl className="w-full">
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
                                                        label={`مقدار ${tradeableInfo?.tradeable?.nameFa || ''}`}
                                                        variant="outlined"
                                                        error={!!errors.amount}
                                                        helperText={(errors.amount ? errors.amount.message : '')}
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                            inputProps: {
                                                                className: 'ltr pl-4', maxLength: 10,
                                                                inputMode: 'decimal'
                                                            },
                                                            endAdornment: <span className="input-end-span">گرم</span>,
                                                        }}
                                                        value={tradeableAmount}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            calcInputAmountBuy(event, tradeableInfo?.tradeable?.name);
                                                        }} />
                                                )}
                                            />
                                        </FormControl> : <FormControl className="w-full">
                                            <NumericFormat
                                                thousandSeparator
                                                decimalScale={0}
                                                allowNegative={false}
                                                customInput={TextField}
                                                type="tel"
                                                label="مقدار کل"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    inputProps: {
                                                        className: 'ltr pl-4', maxLength: 15,
                                                        inputMode: 'decimal'
                                                    },
                                                    endAdornment: <span className="input-end-span">تومان</span>,
                                                }}
                                                value={rialAmount}
                                                onChange={(event) => calcInputAmountBuy(event, 'TMN')} />
                                        </FormControl>}
                                        <FormHelperText className="text-primary-green dark:text-secondary-green text-sm flex items-center justify-between gap-x-2 invisible">
                                            <span>ارزش تومانی:</span>
                                            <span>0</span>
                                        </FormHelperText>
                                        <div className="px-0 lg:px-4">
                                            <span className="w-full md:w-fit flex items-center justify-between lg:justify-start gap-x-4">
                                                <svg viewBox="0 0 24 24" className="svg-icon">
                                                    <path d="m12.1 3.393-7.127.164a1 1 0 0 0-.33.065 3.61 3.61 0 0 0-2.328 3.373v4.17c-.001 3.064-.039 3.588-.096 6.018a1 1 0 0 0 0 .078c.114 2.07 2.194 4.47 5.81 4.383h9.216c2.435 0 4.436-1.996 4.436-4.43v-.354a1.94 1.94 0 0 0 .967-1.664v-1.879a1.94 1.94 0 0 0-.967-1.664v-.58c0-2.434-2-4.434-4.436-4.434H15.62c.02-.342.035-.67.008-.994-.035-.432-.15-.913-.478-1.318-.329-.406-.808-.643-1.301-.766-.493-.122-1.037-.162-1.717-.168a1 1 0 0 0-.032 0zm.045 2-.031.002c.599.005 1.019.05 1.252.107.232.058.24.096.228.082-.01-.013.022.012.04.225.014.177.003.475-.018.83H6.75c-.897 0-1.735.274-2.436.738v-.382c0-.643.382-1.185.959-1.443zM6.75 8.639h10.49a2.433 2.433 0 0 1 2.436 2.434v.313h-.848a2.841 2.841 0 0 0-.783.113 2.833 2.833 0 0 0-.977.5c-.018.014-.037.026-.054.04l-.002.003a2.8 2.8 0 0 0-.205.187l-.002.002a2.82 2.82 0 0 0-.203.225l-.002.002c-.064.078-.125.16-.18.246l-.002.002a2.874 2.874 0 0 0-.152.266s-.002 0-.002.002a2.86 2.86 0 0 0-.295 1.537c.033.386.145.74.314 1.059v.002c.042.079.088.156.137.23v.002a2.993 2.993 0 0 0 1.203 1.03h.002a3.094 3.094 0 0 0 1.314.294h.736v.086a2.43 2.43 0 0 1-2.436 2.43H7.997a1 1 0 0 0-.023.002c-2.696.065-3.72-1.803-3.76-2.492.055-2.338.095-2.946.096-5.986v-.093A2.433 2.433 0 0 1 6.746 8.64zm.678 2.004a.875.875 0 0 0-.877.875.875.875 0 0 0 .877.875h6.396a.875.875 0 0 0 .875-.875.875.875 0 0 0-.875-.875zm11.4 2.742h1.816v1.742h-1.705c-.187 0-.367-.052-.52-.139h-.002a.971.971 0 0 1-.36-.351.713.713 0 0 1-.095-.3 1 1 0 0 0-.002-.013.81.81 0 0 1 .252-.674 1 1 0 0 0 .017-.02.803.803 0 0 1 .598-.245z"></path>
                                                </svg>
                                                <span className="flex items-center justify-between gap-x-2"><span className="hidden md:block">موجودی کیف پول:</span> <span>{(userInfo?.tomanBalance || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span> </span>
                                            </span>

                                            <Slider className="buy" valueLabelFormat={(value) => {
                                                return (value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })
                                            }} value={sliderValue} step={10} marks min={0} valueLabelDisplay="auto" max={100} color="success" disabled={(userInfo?.tomanBalance || 0) == 0}
                                                onChange={calcAmountSliderBuy} />
                                        </div>
                                        {errorWalletBuy ? <Alert
                                            severity="warning"
                                            variant="filled"
                                            color="warning"
                                            className="custom-alert warning"
                                            sx={{ mb: 2 }}
                                        >
                                            موجودی کیف پول تومانی کافی نیست.
                                        </Alert> : ''}
                                        {errorMinTradeBuy ? <Alert
                                            severity="error"
                                            variant="filled"
                                            color="error"
                                            className="custom-alert error"
                                            sx={{ mb: 2 }}
                                        >
                                            <div className="flex flex-col gap-y-3">
                                                <b className="block">حداقل مقدار خرید {tradeableInfo?.tradeable?.nameFa} {(tradeableInfo?.tradeable?.minBuyAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم می‌باشد.</b>
                                            </div>
                                        </Alert> : ''}

                                        {errorWalletBuy ? <div className="lg:max-w-40 lg:mx-auto px-0 lg:px-4">
                                            <LinkRouter legacyBehavior href="/panel/deposit?type=online">
                                                <Button href="/panel/deposit?type=online" variant="contained" color="primary" size="medium" className="custom-btn text-xs w-full text-black rounded-lg"
                                                    startIcon={<svg viewBox="0 0 24 24" className="svg-icon text-2xl">
                                                        <path d="M12.9 1.42c-.33 0-.66.059-.97.176a1 1 0 0 0-.003 0l-7.26 2.742c-1.4.53-2.33 1.88-2.33 3.377v4.81a6.144 6.144 0 0 0-.476 7.058 6.13 6.13 0 0 0 5.28 2.994c1.196 0 2.32-.344 3.27-.948a1 1 0 0 0 .17.034h6.694c2.437 0 4.438-2.003 4.438-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2-4.438-4.438-4.438h-1.643V4.16a2.728 2.728 0 0 0-1.18-2.251 2.738 2.738 0 0 0-1.553-.489zm-.094 2.006a.754.754 0 0 1 .51.125.73.73 0 0 1 .23.266.736.736 0 0 1 .086.341 1 1 0 0 0 0 .002v2.473H6.777c-.879 0-1.7.264-2.393.711.12-.516.48-.941.99-1.135l7.26-2.742a.721.721 0 0 1 .172-.04zM6.777 8.633h10.5a2.435 2.435 0 0 1 2.438 2.438v.318h-.847c-.771 0-1.5.312-2.023.846a2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904l.05-.084c.57-.93.895-2.024.895-3.176a6.172 6.172 0 0 0-3.502-5.564 6.159 6.159 0 0 0-5.467.063 2.434 2.434 0 0 1 2.43-2.268zm.477 3.6a4.177 4.177 0 0 1 3.42 1.947c.419.666.64 1.436.64 2.223 0 .783-.217 1.52-.6 2.14a1 1 0 0 0-.01.02 3.66 3.66 0 0 1-.802.954 1 1 0 0 0-.027.023 4.039 4.039 0 0 1-2.734 1.037 1 1 0 0 0-.002 0 4.137 4.137 0 0 1-3.563-2.019 1 1 0 0 0-.005-.014 4.07 4.07 0 0 1-.604-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .005-.003 4.17 4.17 0 0 1 2.721-.915zm11.61 1.156h1.816v1.748h-1.705c-.5 0-.945-.37-.98-.793a1 1 0 0 0-.003-.012.83.83 0 0 1 .254-.68 1 1 0 0 0 .018-.017.803.803 0 0 1 .6-.246zm-11.73.568a.75.75 0 0 0-.75.75v.907h-.94a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75h.94v.986a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75v-.986h.945a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75h-.945v-.907a.75.75 0 0 0-.75-.75z"></path>
                                                    </svg>}>
                                                    <span className="text-large-1 mx-2">افزایش موجودی</span>
                                                </Button>
                                            </LinkRouter>
                                        </div> : <div className="lg:max-w-28 lg:mx-auto px-0 lg:px-4">
                                            {orderbookSettingLoading ? '' : orderbookSetting?.isBuyActive ?
                                                <LoadingButton type="submit" variant="contained" size="medium" color="success" fullWidth className="rounded-lg px-10" disableElevation loading={loading}>
                                                    <text className="text-black font-semibold">خرید</text>
                                                </LoadingButton > : <Tooltip title={orderbookSetting?.buyDescription} arrow placement="top"
                                                    PopperProps={{
                                                        disablePortal: true,
                                                    }}
                                                    onClose={handleTooltipClose}
                                                    open={openTooltip}
                                                    disableFocusListener
                                                    disableHoverListener
                                                    disableTouchListener>
                                                    <Button type="button" variant="contained" size="medium" color="error" fullWidth className="rounded-lg px-10" disableElevation onClick={handleTooltipOpen}>
                                                        <text className="text-white font-semibold">غیرفعال</text>
                                                    </Button >
                                                </Tooltip>}
                                        </div>}
                                    </form>
                                </>
                                :
                                <>
                                    <form className="flex flex-col gap-y-3 px-4 py-4 lg:pb-6 lg:px-4" noValidate autoComplete="off" onSubmit={handleSubmit(userSell)}>
                                        {priceType == 'Fixed' ? <FormControl className="w-full">
                                            <NumericFormat
                                                thousandSeparator
                                                decimalScale={0}
                                                allowNegative={false}
                                                customInput={TextField}
                                                type="tel"
                                                label="قیمت"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    inputProps: {
                                                        className: 'ltr pl-4', maxLength: 15,
                                                        inputMode: 'decimal'
                                                    },
                                                    endAdornment: <span className="input-end-span">تومان</span>,
                                                }}
                                                value={symbolPrice}
                                                onChange={(event) => calcInputAmountSell(event, 'TMN')} />
                                        </FormControl> : <FormControl className="w-full">
                                            <NumericFormat
                                                thousandSeparator
                                                decimalScale={0}
                                                allowNegative={false}
                                                customInput={TextField}
                                                type="tel"
                                                label="بهترین قیمت بازار"
                                                variant="outlined"
                                                disabled
                                                InputLabelProps={{
                                                    classes: { disabled: darkModeToggle ? '!text-white !text-opacity-70' : '!text-black !text-opacity-70' },
                                                    sx: {
                                                        color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)',
                                                        textAlign: 'center',
                                                        width: '100%',
                                                    }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    inputProps: { className: 'text-center' },
                                                    readOnly: true
                                                }}
                                                value={''} />
                                        </FormControl>}
                                        {priceType == 'Fixed' || (priceType == 'MarketOrder' && tabValue == 1) ? <FormControl className="w-full">
                                            <Controller
                                                name="amount"
                                                control={control}
                                                render={({ field }) => (
                                                    <NumericFormat
                                                        {...field}
                                                        thousandSeparator
                                                        decimalScale={(tradeableInfo?.tradeable?.sellMaxDecimals ?? 3)}
                                                        allowNegative={false}
                                                        customInput={TextField}
                                                        type="tel"
                                                        label={`مقدار ${tradeableInfo?.tradeable?.nameFa || ''}`}
                                                        variant="outlined"
                                                        error={!!errors.amount}
                                                        helperText={(errors.amount ? errors.amount.message : '')}
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                            inputProps: {
                                                                className: 'ltr pl-4', maxLength: 10,
                                                                inputMode: 'decimal'
                                                            },
                                                            endAdornment: <span className="input-end-span">گرم</span>,
                                                        }}
                                                        value={tradeableAmount}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            calcInputAmountSell(event, tradeableInfo?.tradeable?.name);
                                                        }} />
                                                )}
                                            />
                                        </FormControl> : <FormControl className="w-full">
                                            <NumericFormat
                                                thousandSeparator
                                                decimalScale={0}
                                                allowNegative={false}
                                                customInput={TextField}
                                                type="tel"
                                                label="مقدار کل"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    inputProps: {
                                                        className: 'ltr pl-4', maxLength: 15,
                                                        inputMode: 'decimal'
                                                    },
                                                    endAdornment: <span className="input-end-span">تومان</span>,
                                                }}
                                                value={rialAmount}
                                                onChange={(event) => calcInputAmountSell(event, 'TMN')} />
                                        </FormControl>}
                                        <FormHelperText className={`${priceType == 'Fixed' || (buyOrders?.length > 0) ? '' : 'invisible'} text-primary-green dark:text-secondary-green text-sm flex items-center justify-between gap-x-2 px-2`}>
                                            <span>ارزش تقریبی :</span>
                                            <span>{tomanValue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </FormHelperText>
                                        <div className="px-0 lg:px-4">
                                            <span className="w-full md:w-fit flex items-center justify-between lg:justify-start gap-x-4">
                                                <svg viewBox="0 0 24 24" className="svg-icon">
                                                    <path d="M11.5 5.413c-1.11.15-2.177.397-3.158.723a.75.75 0 0 0-.438.382C7.397 7.56 7.148 8.332 6.9 9.192a.75.75 0 0 0-.028.274c.022.252.1.388.17.51s.075.186.3.355l.31.266c-1.606.485-3.026.88-4.992 1.8a.75.75 0 0 0-.387.423c-.388 1.062-.532 2.187-.758 2.986a.75.75 0 0 0 .098.617l.242.367a.75.75 0 0 0 .33.275c1.262.544 2.382 1.201 3.82 1.684a.75.75 0 0 0 .434.014l8.146-2.186c.666.583 1.317 1.153 1.89 1.662.15.144.312.103.483.158a.75.75 0 0 0 .072.04.75.75 0 0 0 .026-.008c.18.043.372.178.511.166.298-.027.524-.107.602-.127l3.424-.89c.448-.11.758-.512.795-.558a.75.75 0 0 0 .144-.656l-.628-2.46a.75.75 0 0 0-.106-.233l-.314-.469a.75.75 0 0 0-.018-.008.75.75 0 0 0-.033-.05c-2.871-2.714-6.175-5.183-9.383-7.589a.75.75 0 0 0-.549-.142zm-.09 1.551c2.711 2.033 5.364 4.133 7.81 6.314-.525.128-1.03.257-1.534.406-2.04-1.886-4.818-4.464-7.014-5.955a.75.75 0 0 0-1.043.201.75.75 0 0 0 .2 1.041c2.05 1.393 4.92 4.055 6.972 5.951-.103.475-.166.944-.232 1.414a754.808 754.808 0 0 0-8.115-7.029c.178-.596.38-1.159.684-1.822.715-.22 1.478-.399 2.273-.521zm-2.412 4.789.953.818-3.367.916c-.322-.122-.83-.273-1.246-.447 1.18-.422 2.33-.848 3.66-1.287zm2.328 1.998c.65.56 1.254 1.082 1.895 1.639l-5.816 1.561-.125-2.098zm-7.803.213c.7.198 1.488.52 2.25.822l.133 2.287c-.936-.37-1.831-.807-2.848-1.262.156-.635.305-1.255.465-1.848zm16.98.527.434 1.707-2.955.768c.08-.642.164-1.281.306-1.893a75.18 75.18 0 0 1 2.215-.582z"></path>
                                                </svg>
                                                <span className="flex items-center justify-between gap-x-2"><span className="hidden md:block">موجودی {tradeableInfo?.tradeable?.nameFa}:</span> <span>{Number(new Decimal(tradeableInfo?.balance || 0).toDecimalPlaces((tradeableInfo?.tradeable?.sellMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم</span> </span>
                                            </span>

                                            <Slider className="sell" valueLabelFormat={(value) => {
                                                return (value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })
                                            }} value={sliderValue} step={10} marks min={0} valueLabelDisplay="auto" max={100} color="error" disabled={tradeableInfo?.balance == 0}
                                                onChange={calcAmountSliderSell} />
                                        </div>
                                        {errorWalletSell ? <Alert
                                            severity="warning"
                                            variant="filled"
                                            color="warning"
                                            className="custom-alert warning"
                                            sx={{ mb: 2 }}
                                        >
                                            موجودی کیف پول {tradeableInfo?.tradeable?.nameFa} کافی نیست.
                                        </Alert> : ''}
                                        {errorMinTradeSell ? <Alert
                                            severity="error"
                                            variant="filled"
                                            color="error"
                                            className="custom-alert error"
                                            sx={{ mb: 2 }}
                                        >
                                            <div className="flex flex-col gap-y-3">
                                                <b className="block">حداقل مقدار فروش {tradeableInfo?.tradeable?.nameFa} {(tradeableInfo?.tradeable?.minSellAmount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم می‌باشد.</b>
                                            </div>
                                        </Alert> : ''}

                                        {errorWalletSell ? <div className="lg:max-w-40 lg:mx-auto px-0 lg:px-4">
                                            <LinkRouter legacyBehavior href="/panel/trade/orderbook?type=buy">
                                                <Button href="/panel/trade/orderbook?type=buy" variant="contained" color="primary" size="medium" className="custom-btn text-xs w-full text-black rounded-lg"
                                                    startIcon={<svg viewBox="0 0 24 24" className="svg-icon text-black"><path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path></svg>}>
                                                    <span className="text-large-1 mx-2">افزایش موجودی</span>
                                                </Button>
                                            </LinkRouter>
                                        </div> : <div className="lg:max-w-28 lg:mx-auto px-0 lg:px-4">
                                            {orderbookSettingLoading ? '' : orderbookSetting?.isSellActive ?
                                                <LoadingButton type="submit" variant="contained" size="medium" color="error" fullWidth className="rounded-lg px-10" disableElevation loading={loading}>
                                                    <text className="text-black font-semibold">فروش</text>
                                                </LoadingButton > : <Tooltip title={orderbookSetting?.sellDescription} arrow placement="top"
                                                    PopperProps={{
                                                        disablePortal: true,
                                                    }}
                                                    onClose={handleTooltipClose}
                                                    open={openTooltip}
                                                    disableFocusListener
                                                    disableHoverListener
                                                    disableTouchListener>
                                                    <Button type="button" variant="contained" size="medium" color="error" fullWidth className="rounded-lg px-10" disableElevation onClick={handleTooltipOpen}>
                                                        <text className="text-white font-semibold">غیرفعال</text>
                                                    </Button >
                                                </Tooltip>}
                                        </div>}
                                    </form>
                                </>}

                        </div>
                    </section>
                    {loadingTransactions ? <div className="col-span-12 h-[100px] flex justify-center items-center"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : <section className="col-span-12 px-0 -mx-4 md:m-0">
                        {transactions.length > 0 ?
                            <>
                                <div className="col-span-12 flex flex-col gap-y-4 lg:hidden">
                                    {transactions.map((data, index) => {
                                        return (
                                            <Accordion key={index} className="custom-accordion col-span-12 !rounded-2xl !py-2" sx={{ '&:before': { display: 'none' } }}>
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
                                                            {data.amount != 0 ? parseInt((((data.amount || 0) - data.remainingAmount || 0) * 100) / (data.amount || 0)) != 0 ?
                                                                `${parseInt((((data.amount || 0) - data.remainingAmount || 0) * 100) / (data.amount || 0))}%` : 0 : 0}
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
                                    })}
                                </div>
                                <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark hidden lg:block">
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                        <TableHead className="dark:bg-dark">
                                            <TableRow>
                                                {ORDERBOOKS_TABLE_HEAD.map((data, index) => (
                                                    <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-center pb-4`} key={index}>
                                                        <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {transactions.map((data, index) => (
                                                <TableRow
                                                    key={index}
                                                    sx={{ '&:last-child td': { border: 0 } }}
                                                    className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                                    <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                        {data.tradeable ? <div className="flex items-center gap-x-4">
                                                            <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} alt={data.tradeable?.name}
                                                                className="w-10 h-10 rounded-[50%]" />
                                                            <span>{data.tradeable?.nameFa}</span>
                                                        </div> : ''}
                                                    </TableCell>
                                                    <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                        {data.type == 'Buy' ? <Chip label="خرید" variant="outlined" size="small" className="w-full badge badge-success" /> :
                                                            <Chip label="فروش" variant="outlined" size="small" className="w-full badge badge-error" />}
                                                    </TableCell>
                                                    <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                        {(data.amount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم
                                                    </TableCell>
                                                    <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                        {(data.avgPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان
                                                    </TableCell>
                                                    <TableCell className="text-center border-none py-4 text-sm dark:text-white">
                                                        {data.amount != 0 ? parseInt((((data.amount || 0) - data.remainingAmount || 0) * 100) / (data.amount || 0)) != 0 ?
                                                            `${parseInt((((data.amount || 0) - data.remainingAmount || 0) * 100) / (data.amount || 0))}%` : 0 : 0}
                                                    </TableCell>
                                                    <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                        {data.totalPrice > 0 ? `${(data.totalPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان` : '------'}
                                                    </TableCell>
                                                    <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                        {data.wage > 0 ? data.type == 'Buy' ?
                                                            `${(data.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 5 })} گرم`
                                                            : `${(data.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان`
                                                            : '------'}
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                        <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                            .locale('fa')
                                                            .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                        {data.status == 'Queued' ? <Chip label="در صف انتظار" variant="outlined" size="small" className="w-full badge badge-primary" /> : ''}
                                                        {data.status == 'Processing' ? <Chip label="جدید" variant="outlined" size="small" className="w-full badge badge-info" /> : ''}
                                                        {data.status == 'InProgress' ? <Chip label="در حال پردازش" variant="outlined" size="small" className="w-full badge badge-info" /> : ''}
                                                        {data.status == 'Finished' ? (data.wage > 0 && data.totalPrice > 0) ?
                                                            <Chip label="تکمیل شده" variant="outlined" size="small" className="w-full badge badge-success" /> :
                                                            <Chip label="انجام نشده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}
                                                        {data.status == 'Canceled' ? <Chip label="لغو شده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}
                                                    </TableCell>
                                                    <TableCell className="w-fit text-center rtl:rounded-l-2xl ltr:rounded-r-2xl border-none py-4 text-sm dark:text-white">
                                                        {['Queued', 'Processing', 'InProgress'].includes(data.status) ? <Tooltip title="لغو سفارش">
                                                            <IconButton
                                                                color={`error`}
                                                                onClick={cancelOrder(data._id)}>
                                                                {cancelOrderLoading ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} /> : <CancelIcon />}
                                                            </IconButton>
                                                        </Tooltip> : ''}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                            : <div className="col-span-12 py-16">
                                <span className="block text-center text-large-1 text-primary-gray">سفارش فعالی در حال حاضر وجود ندارد.</span>
                            </div>}
                        {Math.ceil(transactionsTotal / transactionsLimit) > 1 ?
                            <div className="col-span-12 text-center mt-4">
                                <Pagination siblingCount={0} count={Math.ceil(transactionsTotal / transactionsLimit)} variant="outlined" color="primary" className="justify-center"
                                    page={pageItem} onChange={handlePageChange} />
                            </div>
                            : ''}
                    </section>}
                </section>}

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
                                        <td className="px-6 text-start text-secondary-green dark:text-buy font-semibold">
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
                                        <td className="text-start text-secondary-green dark:text-buy font-semibold">
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

            <SwipeableDrawer
                disableBackdropTransition={true}
                disableDiscovery={true}
                disableSwipeToOpen={true}
                anchor={'bottom'}
                variant="persistent"
                open={openBottomChartSectionDrawer}
                onClose={() => setOpenBottomChartSectionDrawer(false)}
                PaperProps={{ className: 'drawers page bottom rounded-none !p-0', sx: { width: '100%', height: '100%', zIndex: '18000' } }}
                ModalProps={{
                    keepMounted: false
                }}>
                <div className="drawer-container ">
                    <div className="h-full flex flex-col gap-y-4 px-6 pt-2">
                        <div className="flex items-center justify-between gap-x-2">
                            <h2 className="text-xl font-extrabold dark:text-white">نمودار {tradeableInfo?.tradeable?.nameFa}</h2>
                            <IconButton color={darkModeToggle ? 'white' : 'black'}
                                className="-me-4"
                                onClick={() => setOpenBottomChartSectionDrawer(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white">
                                    <path d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z" fill="currentColor" />
                                    <path d="M9.17035 15.5799C8.98035 15.5799 8.79035 15.5099 8.64035 15.3599C8.35035 15.0699 8.35035 14.5899 8.64035 14.2999L14.3004 8.63986C14.5904 8.34986 15.0704 8.34986 15.3604 8.63986C15.6504 8.92986 15.6504 9.40986 15.3604 9.69986L9.70035 15.3599C9.56035 15.5099 9.36035 15.5799 9.17035 15.5799Z" fill="currentColor" />
                                    <path d="M14.8304 15.5799C14.6404 15.5799 14.4504 15.5099 14.3004 15.3599L8.64035 9.69986C8.35035 9.40986 8.35035 8.92986 8.64035 8.63986C8.93035 8.34986 9.41035 8.34986 9.70035 8.63986L15.3604 14.2999C15.6504 14.5899 15.6504 15.0699 15.3604 15.3599C15.2104 15.5099 15.0204 15.5799 14.8304 15.5799Z" fill="currentColor" />
                                </svg>

                            </IconButton>
                        </div>
                        <div className="relative grid grid-cols-12 gap-y-6 pb-5">
                            {(tradeableInfo?.tradeable?.chartLink && tradeableInfo?.tradeable?.chartLink != 'disable') ? <div className="col-span-12 h-[400px] lg:h-[500px]">
                                <TradingViewWidget
                                    link={tradeableInfo?.tradeable?.chartLink}
                                    theme={darkModeToggle ? 'dark' : 'light'}
                                />
                            </div> : ''}
                            <div className="grid grid-cols-12 gap-x-4 bg-white dark:bg-black shadow fixed bottom-0 right-0 left-0 p-4">
                                <div className="col-span-6">
                                    <Button type="button" variant="contained" color="success" size="medium" fullWidth
                                        className="rounded-lg" disableElevation
                                        onClick={() => {
                                            setOpenBottomChartSectionDrawer(false);
                                            setValue('isMarketBuyOrder', true);
                                            setTabValue(0);
                                            setSymbolPrice('');
                                            setRialAmount('');
                                            setTradeableAmount('');
                                            setSliderValue(0);
                                            clearErrors();
                                            clearForm();
                                            setErrorTomanDivisible(false);
                                            setTomanDivisible(0);
                                            router.push(`/panel/trade/orderbook?type=buy${router.query?.tradeable ? `&tradeable=${router.query?.tradeable}` : ''}`, `/panel/trade/orderbook?type=buy${router.query?.tradeable ? `&tradeable=${router.query?.tradeable}` : ''}`, { locale });
                                        }}>
                                        <text className="text-black font-semibold">خرید</text>
                                    </Button>
                                </div>
                                <div className="col-span-6">
                                    <Button type="button" variant="contained" color="error" size="medium" fullWidth
                                        className="rounded-lg" disableElevation
                                        onClick={() => {
                                            setOpenBottomChartSectionDrawer(false);
                                            setValue('isMarketBuyOrder', false);
                                            setTabValue(1);
                                            setSymbolPrice('');
                                            setRialAmount('');
                                            setTradeableAmount('');
                                            setSliderValue(0);
                                            clearErrors();
                                            clearForm();
                                            setErrorTomanDivisible(false);
                                            setTomanDivisible(0);
                                            router.push(`/panel/trade/orderbook?type=sell${router.query?.tradeable ? `&tradeable=${router.query?.tradeable}` : ''}`, `/panel/trade/orderbook?type=sell${router.query?.tradeable ? `&tradeable=${router.query?.tradeable}` : ''}`, { locale });
                                        }}>
                                        <text className="text-black font-semibold">فروش</text>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SwipeableDrawer>
        </>
    )
}

export default OrderbookTradePageCompo;