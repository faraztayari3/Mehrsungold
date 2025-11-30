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
import FormHelperText from '@mui/material/FormHelperText';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import MUISelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Decimal from 'decimal.js';

import { NumericFormat } from 'react-number-format';
import TradingViewWidget from "../shared/tradingViewWidget"

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
 * TradePageCompo component that displays the Trade Page Component of the website.
 * @returns The rendered Trade Page component.
 */
const TradePageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, priceInfo, priceLoading, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);
    const [openAlert, setOpenAlert] = useState(true);
    const [tabValue, setTabValue] = useState(router.query.type == 'buy' ? 0 : 1);

    const [rialAmount, setRialAmount] = useState('');
    const [rialPureAmount, setRialPureAmount] = useState('');
    const [tradeableAmount, setTradeableAmount] = useState('');
    const [tradeableInfo, setTradeableInfo] = useState(null);
    const [errorWalletSell, setErrorWalletSell] = useState(false);
    const [errorTomanDivisible, setErrorTomanDivisible] = useState(false);
    const [tomanDivisible, setTomanDivisible] = useState(0);
    const [tradeableDivisible, setTradeableDivisible] = useState(0);
    const [isPayLater, setIsPayLater] = useState(false);
    const [price, setPrice] = useState();

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

    const validationSchema = Yup.object({
        amount: Yup.string().required('این فیلد الزامی است')
            .transform(value => value.replace(/,/g, ''))
            .test(
                'is-multiple-of-minTradeableAmount',
                `مقدار معامله باید حداقل ${tabValue == 0 ? (tradeableInfo?.tradeable?.minBuyAmount || 0) : (tradeableInfo?.tradeable?.minSellAmount || 0)} باشد`,
                value => {
                    const parsedValue = floorNumber(value?.replace(/,/g, '') || 0, (tabValue == 0 ? (tradeableInfo?.tradeable?.buyMaxDecimals ?? 3) : (tradeableInfo?.tradeable?.sellMaxDecimals ?? 3)));
                    return !isNaN(parsedValue) && (parsedValue >= (tabValue == 0 ? (tradeableInfo?.tradeable?.minBuyAmount || 0) : (tradeableInfo?.tradeable?.minSellAmount || 0)));
                }
            ),
        isFixedPrice: Yup.boolean(),
        price: Yup.string().when("isFixedPrice", {
            is: false,
            then: schema => schema.optional(),
            otherwise: schema => schema.required('این فیلد الزامی است')
        })
    });

    const { control, setValue, trigger, clearErrors, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: { isFixedPrice: false }
    });

    const clearForm = () => {
        setValue('amount', '');
        setValue('isFixedPrice', false);
    }

    useEffect(() => {
        if (priceInfo?.length > 0) {
            if (router.query?.tradeable) {
                const tradeable = priceInfo?.filter(item => item.tradeable?.name === router.query?.tradeable);
                setTradeableInfo(tradeable[0]);
                setErrorWalletSell(tradeable[0]?.balance >= tradeable[0]?.tradeable?.minSellAmount ? false : true);
                setPrice(router.query.type == 'buy' ? tradeable[0]?.buyPrice : tradeable[0]?.sellPrice);
            } else {
                setTradeableInfo(priceInfo[0]);
                setErrorWalletSell(priceInfo[0]?.balance >= priceInfo[0]?.tradeable?.minSellAmount ? false : true);
                setPrice(router.query.type == 'buy' ? priceInfo[0]?.buyPrice : priceInfo[0]?.sellPrice);
            }
        }
    }, [priceInfo, router.query?.tradeable]);

    useEffect(() => {
        setTabValue(router.query.type == 'buy' ? 0 : 1);
        setRialAmount('');
        setRialPureAmount('');
        setTradeableAmount('');
        setSliderValue(0);
        setErrorTomanDivisible(false);
        setTomanDivisible(0);
        clearErrors();
        clearForm();
    }, [router.query.type]);

    const handleChange = (event, newTabValue) => {
        setPrice(newTabValue == 0 ? tradeableInfo?.buyPrice : tradeableInfo?.sellPrice);
        setTabValue(newTabValue);
        setRialAmount('');
        setRialPureAmount('');
        setTradeableAmount('');
        setSliderValue(0);
        clearErrors();
        clearForm();
        setErrorTomanDivisible(false);
        setTomanDivisible(0);
        if (newTabValue == 0) {
            router.push(`/panel/trade?type=buy${router.query?.tradeable ? `&tradeable=${router.query?.tradeable}` : ''}`, `/panel/trade?type=buy${router.query?.tradeable ? `&tradeable=${router.query?.tradeable}` : ''}`, { locale });
        } else {
            router.push(`/panel/trade?type=sell${router.query?.tradeable ? `&tradeable=${router.query?.tradeable}` : ''}`, `/panel/trade?type=sell${router.query?.tradeable ? `&tradeable=${router.query?.tradeable}` : ''}`, { locale });
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
        const marketBuyprice = priceType == 'MarketOrder' ? (tradeableInfo?.buyPrice || 0) : price;
        let rialAmount = 0;

        if (event.target.value == '') {
            setRialAmount('');
            setRialPureAmount('');
            setTradeableAmount('');
            setSliderValue(0);
        } else {
            if (position == 'TMN') {
                setRialAmount(value);
                setRialPureAmount(Number(new Decimal(value).dividedBy(marketBuyprice).toDecimalPlaces((tradeableInfo?.tradeable?.buyMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()) * marketBuyprice);
                setTradeableAmount(Number(new Decimal(value).dividedBy(marketBuyprice).toDecimalPlaces((tradeableInfo?.tradeable?.buyMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()));
                rialAmount = value;
                setValue('amount', Number(new Decimal(value).dividedBy(marketBuyprice).toDecimalPlaces((tradeableInfo?.tradeable?.buyMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()));
            } else {
                setRialAmount(parseInt(value * marketBuyprice));
                setRialPureAmount(parseInt(value * marketBuyprice));
                setTradeableAmount(value);
                rialAmount = parseInt(value * marketBuyprice);
            }

            await trigger('amount');

            const calculatedSliderValue = (rialAmount / (userInfo?.tomanBalance || 0)) * 100;
            if (calculatedSliderValue > 100) {
                setSliderValue(100);
            } else if (calculatedSliderValue < 0) {
                setSliderValue(0);
            } else {
                setSliderValue(calculatedSliderValue);
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
        const marketBuyprice = priceType == 'MarketOrder' ? (tradeableInfo?.buyPrice || 0) : price;
        let size = (userInfo?.tomanBalance || 0) * (value / 100);
        setSliderValue(value);
        if (value == 0) {
            setRialAmount('');
            setRialPureAmount('');
            setTradeableAmount('');
            setValue('amount', '');
        } else {
            setRialAmount(size);
            setRialPureAmount(Number(new Decimal(size).dividedBy(marketBuyprice).toDecimalPlaces((tradeableInfo?.tradeable?.buyMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()) * marketBuyprice);
            setTradeableAmount(Number(new Decimal(size).dividedBy(marketBuyprice).toDecimalPlaces((tradeableInfo?.tradeable?.buyMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()));
            setValue('amount', Number(new Decimal(size).dividedBy(marketBuyprice).toDecimalPlaces((tradeableInfo?.tradeable?.buyMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()));
        }

        await trigger('amount');
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
                if ((tradeableAmount || 0) >= ((tradeableInfo?.tradeable?.minBuyAmount || 0))) {
                    setErrorWalletBuy(false);
                    setErrorMinTradeBuy(false);
                    setLoading(true);
                    let body = priceType == 'MarketOrder' ? { type: "Buy", amount: Number(tradeableAmount), tradeableId: tradeableInfo?.tradeable?._id, price } :
                        { type: "Buy", amount: Number(tradeableAmount), tradeableId: tradeableInfo?.tradeable?._id, isFixedPrice: true, price }
                    ApiCall('/transaction', 'POST', locale, body, '', 'user', router).then(async (result) => {
                        dispatch({
                            type: 'setSnackbarProps', value: {
                                open: true, content: priceType == 'FixedPrice' && !siteInfo?.manualTransactionConfirmation ? 'درخواست معامله شما ثبت و پس از رسیدن به قیمت مورد نظر تائید می شود' : (siteInfo?.scalpingPreventionPeriodInHours && siteInfo?.scalpingPreventionPeriodInHours > 0) && priceType == 'MarketOrder' ? `فرایند خرید شما پس از مدت زمان ${siteInfo?.scalpingPreventionPeriodInHours} ساعت به صورت خودکار تائید می شود.` :
                                    siteInfo?.manualTransactionConfirmation ? 'درخواست معامله شما ثبت و پس از تائید مدیریت انجام می شود' : langText('Global.Success'),
                                type: 'success', duration: 5000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                            }
                        });
                        setLoading(false);
                        getUserInformation();
                        dispatch({
                            type: 'setRefreshInventory', value: parseInt(Math.floor(Math.random() * 100) + 1)
                        });
                        router.push('/panel/history', '/panel/history', { locale });
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

    const payLaterBuy = () => {
        if ((!siteInfo?.offlineFirstStepUserVerifyEnabled && !siteInfo?.onlineFirstStepUserVerifyEnabled) || (['FirstLevelVerified', 'SecondLevelVerified'].includes(userInfo?.verificationStatus))) {
            if ((tradeableAmount || 0) >= ((tradeableInfo?.tradeable?.minBuyAmount || 0))) {
                setErrorWalletBuy(false);
                setErrorMinTradeBuy(false);
                setLoading(true);
                ApiCall('/transaction/pay-later-buy', 'POST', locale, { amount: Number(tradeableAmount), tradeableId: tradeableInfo?.tradeable?._id, price }, '', 'user', router).then(async (result) => {
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: siteInfo?.scalpingPreventionPeriodInHours && siteInfo?.scalpingPreventionPeriodInHours > 0 ? `فرایند خرید شما پس از مدت زمان ${siteInfo?.scalpingPreventionPeriodInHours} ساعت به صورت خودکار تائید می شود.` : langText('Global.SuccessRequest'),
                            type: 'success', duration: 5000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                    setLoading(false);
                    getUserInformation();
                    dispatch({
                        type: 'setRefreshInventory', value: parseInt(Math.floor(Math.random() * 100) + 1)
                    });
                    router.push('/panel/history', '/panel/history', { locale });
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

    const [showPayLater, setShowPayLater] = useState(false);
    const [openBottomPayLaterDrawer, setOpenBottomPayLaterDrawer] = useState(false);
    const showPayLaterModals = () => {
        if ((!siteInfo?.offlineFirstStepUserVerifyEnabled && !siteInfo?.onlineFirstStepUserVerifyEnabled) || (['FirstLevelVerified', 'SecondLevelVerified'].includes(userInfo?.verificationStatus))) {
            if ((tradeableAmount || 0) >= ((tradeableInfo?.tradeable?.minBuyAmount || 0))) {
                if (window.innerWidth >= 1024) {
                    setShowPayLater(true);
                    setOpenBottomPayLaterDrawer(false);
                } else {
                    setShowPayLater(false);
                    setOpenBottomPayLaterDrawer(true);
                }
            } else {
                setErrorWalletBuy(false);
                setErrorMinTradeBuy(true);
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
        const marketSellprice = priceType == 'MarketOrder' ? (tradeableInfo?.sellPrice || 0) : price;
        let tradeableAmount = 0;

        if (event.target.value == '') {
            setRialAmount('');
            setRialPureAmount('');
            setTradeableAmount('');
            setSliderValue(0);
        } else {
            if (position == 'TMN') {
                setRialAmount(value);
                setRialPureAmount(Number(new Decimal(value).dividedBy(marketSellprice).toDecimalPlaces((tradeableInfo?.tradeable?.sellMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()) * marketSellprice);
                tradeableAmount = Number(new Decimal(value).dividedBy(marketSellprice).toDecimalPlaces((tradeableInfo?.tradeable?.sellMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString());
                setTradeableAmount(Number(new Decimal(value).dividedBy(marketSellprice).toDecimalPlaces((tradeableInfo?.tradeable?.sellMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()));
                setValue('amount', Number(new Decimal(value).dividedBy(marketSellprice).toDecimalPlaces((tradeableInfo?.tradeable?.sellMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()));
            } else {
                setRialAmount(parseInt(value * marketSellprice));
                setRialPureAmount(parseInt(value * marketSellprice));
                tradeableAmount = value;
                setTradeableAmount(value);
            }

            await trigger('amount');

            const calculatedSliderValue = (tradeableAmount / (tradeableInfo?.balance || 0)) * 100;
            if (calculatedSliderValue > 100) {
                setSliderValue(100);
            } else if (calculatedSliderValue < 0) {
                setSliderValue(0);
            } else {
                setSliderValue(calculatedSliderValue);
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
        const marketSellprice = priceType == 'MarketOrder' ? (tradeableInfo?.sellPrice || 0) : price;
        let size = (tradeableInfo?.balance || 0) * (value / 100);
        setSliderValue(value);
        if (value == 0) {
            setRialAmount('');
            setRialPureAmount('');
            setTradeableAmount('');
            setValue('amount', '');
        } else {
            setRialAmount(parseInt(size * marketSellprice));
            setRialPureAmount(Number(new Decimal(size).toDecimalPlaces((tradeableInfo?.tradeable?.sellMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()) * marketSellprice);
            setTradeableAmount(Number(new Decimal(size).toDecimalPlaces((tradeableInfo?.tradeable?.sellMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()));
            setValue('amount', Number(new Decimal(size).toDecimalPlaces((tradeableInfo?.tradeable?.sellMaxDecimals ?? 3), Decimal.ROUND_DOWN).toString()));
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
                let body = priceType == 'MarketOrder' ? { type: "Sell", amount: Number(tradeableAmount), tradeableId: tradeableInfo?.tradeable?._id, price } :
                    { type: "Sell", amount: Number(tradeableAmount), tradeableId: tradeableInfo?.tradeable?._id, isFixedPrice: true, price }
                ApiCall('/transaction', 'POST', locale, body, '', 'user', router).then(async (result) => {
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: priceType == 'FixedPrice' && !siteInfo?.manualTransactionConfirmation ? 'درخواست معامله شما ثبت و پس از رسیدن به قیمت مورد نظر تائید می شود' : siteInfo?.manualTransactionConfirmation ? 'درخواست معامله شما ثبت و پس از تائید مدیریت انجام می شود' : langText('Global.Success'),
                            type: 'success', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                    setLoading(false);
                    getUserInformation();
                    dispatch({
                        type: 'setRefreshInventory', value: parseInt(Math.floor(Math.random() * 100) + 1)
                    });
                    router.push('/panel/history', '/panel/history', { locale });
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
        setShowTradeables(false);
        setOpenBottomTradeablesDrawer(false);
        if (router.query?.tradeable != tradeable?.tradeable?.name) {
            if (tabValue == 0) {
                router.push(`/panel/trade?type=buy&tradeable=${tradeable?.tradeable?.name}`, `/panel/trade?type=buy&tradeable=${tradeable?.tradeable?.name}`, { locale });
            } else {
                router.push(`/panel/trade?type=sell&tradeable=${tradeable?.tradeable?.name}`, `/panel/trade?type=sell&tradeable=${tradeable?.tradeable?.name}`, { locale });
            }
        }
    }

    const PRICE_TYPES = [
        {
            label: 'قیمت بازار',
            value: "MarketOrder"
        },
        {
            label: 'قیمت ثابت',
            value: "FixedPrice"
        }
    ]
    const [priceType, setPriceType] = useState('MarketOrder');
    const handleChangePriceType = (event) => {
        setPrice(router.query.type == 'buy' ? tradeableInfo?.buyPrice : tradeableInfo?.sellPrice);
        if (event.target.value == 'MarketOrder') {
            setValue('isFixedPrice', false);
        } else {
            setValue('isFixedPrice', true);
        }
        setPriceType(event.target.value);
        setRialAmount('');
        setRialPureAmount('');
        setTradeableAmount('');
        setSliderValue(0);
        clearErrors();
        clearForm();
        setErrorTomanDivisible(false);
        setTomanDivisible(0);
    }

    return (
        <>
            {priceLoading ? <div className="h-[50dvh] flex justify-center items-center"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> :
                <div className={`${(tradeableInfo?.tradeable?.chartLink && tradeableInfo?.tradeable?.chartLink != 'disable') ? 'grid grid-cols-12 gap-4' : 'xl:max-w-[30rem] xl:mx-auto'}`}>
                    <section className={`custom-card rounded-2xl flex flex-col pb-4 px-0 ${(tradeableInfo?.tradeable?.chartLink && tradeableInfo?.tradeable?.chartLink != 'disable') ? 'col-span-12 xl:col-span-4' : ''}`}>
                        <Tabs variant="fullWidth" indicatorColor="primary" textColor="inherit" className="rounded-t-2xl -mt-1"
                            value={tabValue}
                            onChange={handleChange}>
                            <Tab label="خرید" classes={{ selected: 'text-primary' }} />
                            <Tab label="فروش" classes={{ selected: 'text-primary' }} />
                        </Tabs>
                        <div className="form-group flex flex-col gap-y-2 p-4">
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
                        {tabValue == 0 ? <div className="flex items-center justify-between gap-x-2 py-6 px-4">
                            {(tradeableInfo?.tradeable?.chartLink && tradeableInfo?.tradeable?.chartLink != 'disable') ? <div></div> : <div className="flex items-center gap-x-4">
                                <svg viewBox="0 0 24 24" className="svg-icon text-large-3">
                                    <path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path>
                                </svg>
                                <span className="text-large-p5 font-semibold">خرید {tradeableInfo?.tradeable?.nameFa}</span>
                            </div>}
                            <div className="flex items-center gap-x-4">
                                <span>قیمت خرید:</span>
                                <span><span className="ltr text-secondary-green dark:text-buy">{(tradeableInfo?.buyPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> تومان</span>
                            </div>
                        </div> : <div className="flex items-center justify-between gap-x-2 py-6 px-4">
                            {(tradeableInfo?.tradeable?.chartLink && tradeableInfo?.tradeable?.chartLink != 'disable') ? <div></div> : <div className="flex items-center gap-x-4">
                                <svg viewBox="0 0 24 24" className="svg-icon text-large-3">
                                    <path d="M8.238 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.61-4.801L6.24 4.529a.75.75 0 1 0 1.307.73l1.344-2.4a.75.75 0 0 0-.652-1.114zm6.492 1.484c-3.145 0-5.745 2.421-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.064 6.062 6.064 3.145 0 5.742-2.421 6.031-5.492 3.068-.293 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.063-6.062zm0 2.002a4.044 4.044 0 0 1 4.064 4.061c0 2.105-1.593 3.764-3.637 3.982a6.051 6.051 0 0 0-1.316-2.502 3.242 3.242 0 0 0-.273-.315 3.263 3.263 0 0 0-.338-.292 6.044 6.044 0 0 0-2.48-1.287c.212-2.05 1.87-3.647 3.98-3.647zm-5.453 5.463c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.749.749 0 0 0-.746.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.308-.73l-1.342 2.4a.75.75 0 0 0 .653 1.114 6.504 6.504 0 0 0 6.494-6.494.75.75 0 0 0-.752-.748z"></path>
                                </svg>
                                <span className="text-large-p5 font-semibold">فروش {tradeableInfo?.tradeable?.nameFa}</span>
                            </div>}
                            <div className="flex items-center gap-x-4">
                                <span>قیمت فروش:</span>
                                <span><span className="ltr text-sell">{(tradeableInfo?.sellPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> تومان</span>
                            </div>
                        </div>}

                        <div className="col-span-12 pb-6 px-4">
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
                                <form className="flex flex-col gap-y-3 pb-6 px-4" noValidate autoComplete="off" onSubmit={userInfo?.role == 'VIPUser' && isPayLater && priceType == 'MarketOrder' ? handleSubmit(showPayLaterModals) : handleSubmit(userBuy)}>
                                    {priceType != 'MarketOrder' ? <FormControl className="w-full">
                                        <Controller
                                            name="price"
                                            control={control}
                                            render={({ field }) => (
                                                <NumericFormat
                                                    {...field}
                                                    thousandSeparator
                                                    decimalScale={0}
                                                    allowNegative={false}
                                                    customInput={TextField}
                                                    type="tel"
                                                    label={`قیمت ثابت`}
                                                    variant="outlined"
                                                    error={!!errors.price}
                                                    helperText={(errors.price ? errors.price.message : '')}
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        inputProps: {
                                                            className: 'ltr pl-4', maxLength: 16,
                                                            inputMode: 'decimal'
                                                        },
                                                        endAdornment: <span className="input-end-span">تومان</span>,
                                                    }}
                                                    value={price}
                                                    onChange={(event) => {
                                                        field.onChange(event);
                                                        setPrice(Number(event.target.value?.replace(/,/g, '')));
                                                        setRialAmount('');
                                                        setRialPureAmount('');
                                                        setTradeableAmount('');
                                                        setSliderValue(0);
                                                        clearErrors();
                                                        clearForm();
                                                        setErrorTomanDivisible(false);
                                                        setTomanDivisible(0);
                                                    }} />
                                            )}
                                        />
                                    </FormControl> : ''}
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
                                    </FormControl>
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            thousandSeparator
                                            decimalScale={0}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="ارزش کل"
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
                                        {rialPureAmount > 0 ? <FormHelperText className="text-black text-xs dark:text-alert-warning-foreground">مبلغ خالص پرداختی :
                                            <span>
                                                {floorNumber((rialPureAmount || 0), (tradeableInfo?.tradeable?.buyMaxDecimals))?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </span> تومان می باشد.</FormHelperText> : ''}
                                    </FormControl>
                                    <div className="px-4">
                                        <span className="flex items-center gap-x-4">
                                            <svg viewBox="0 0 24 24" className="svg-icon">
                                                <path d="m12.1 3.393-7.127.164a1 1 0 0 0-.33.065 3.61 3.61 0 0 0-2.328 3.373v4.17c-.001 3.064-.039 3.588-.096 6.018a1 1 0 0 0 0 .078c.114 2.07 2.194 4.47 5.81 4.383h9.216c2.435 0 4.436-1.996 4.436-4.43v-.354a1.94 1.94 0 0 0 .967-1.664v-1.879a1.94 1.94 0 0 0-.967-1.664v-.58c0-2.434-2-4.434-4.436-4.434H15.62c.02-.342.035-.67.008-.994-.035-.432-.15-.913-.478-1.318-.329-.406-.808-.643-1.301-.766-.493-.122-1.037-.162-1.717-.168a1 1 0 0 0-.032 0zm.045 2-.031.002c.599.005 1.019.05 1.252.107.232.058.24.096.228.082-.01-.013.022.012.04.225.014.177.003.475-.018.83H6.75c-.897 0-1.735.274-2.436.738v-.382c0-.643.382-1.185.959-1.443zM6.75 8.639h10.49a2.433 2.433 0 0 1 2.436 2.434v.313h-.848a2.841 2.841 0 0 0-.783.113 2.833 2.833 0 0 0-.977.5c-.018.014-.037.026-.054.04l-.002.003a2.8 2.8 0 0 0-.205.187l-.002.002a2.82 2.82 0 0 0-.203.225l-.002.002c-.064.078-.125.16-.18.246l-.002.002a2.874 2.874 0 0 0-.152.266s-.002 0-.002.002a2.86 2.86 0 0 0-.295 1.537c.033.386.145.74.314 1.059v.002c.042.079.088.156.137.23v.002a2.993 2.993 0 0 0 1.203 1.03h.002a3.094 3.094 0 0 0 1.314.294h.736v.086a2.43 2.43 0 0 1-2.436 2.43H7.997a1 1 0 0 0-.023.002c-2.696.065-3.72-1.803-3.76-2.492.055-2.338.095-2.946.096-5.986v-.093A2.433 2.433 0 0 1 6.746 8.64zm.678 2.004a.875.875 0 0 0-.877.875.875.875 0 0 0 .877.875h6.396a.875.875 0 0 0 .875-.875.875.875 0 0 0-.875-.875zm11.4 2.742h1.816v1.742h-1.705c-.187 0-.367-.052-.52-.139h-.002a.971.971 0 0 1-.36-.351.713.713 0 0 1-.095-.3 1 1 0 0 0-.002-.013.81.81 0 0 1 .252-.674 1 1 0 0 0 .017-.02.803.803 0 0 1 .598-.245z"></path>
                                            </svg>
                                            <span>موجودی کیف پول: <span>{(userInfo?.tomanBalance || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> تومان</span>
                                        </span>

                                        <Slider className="buy" valueLabelFormat={(value) => {
                                            return (value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })
                                        }} value={sliderValue} step={10} marks min={0} valueLabelDisplay="auto" max={100} color="success" disabled={(userInfo?.tomanBalance || 0) == 0}
                                            onChange={calcAmountSliderBuy} />
                                    </div>
                                    {userInfo?.role == 'VIPUser' && priceType == 'MarketOrder' ? <FormGroup className="mx-2">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    sx={{ color: 'gray' }}
                                                    checked={isPayLater}
                                                    onChange={(event) => {
                                                        setIsPayLater(event.target.checked);
                                                        if (event.target.checked) {
                                                            setErrorWalletBuy(false);
                                                        } else {
                                                            setErrorWalletBuy(userInfo?.tomanBalance >= 0 ? false : true);
                                                        }
                                                    }}
                                                />
                                            }
                                            label={'بعدا پرداخت خواهم کرد'}
                                        />
                                    </FormGroup> : ''}
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
                                            <b className="block">حداقل مقدار خرید {tradeableInfo?.tradeable?.nameFa} {(tradeableInfo?.tradeable?.minBuyAmount || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم می‌باشد.</b>
                                        </div>
                                    </Alert> : ''}

                                    {userInfo?.role == 'VIPUser' && isPayLater && priceType == 'MarketOrder' ? <div className="lg:max-w-28 lg:mx-auto whitespace-nowrap px-4">
                                        <LoadingButton type="submit" variant="contained" size="medium" color="success" fullWidth className="rounded-lg px-10" disableElevation loading={loading}>
                                            <text className="text-black font-semibold">ثبت خرید</text>
                                        </LoadingButton >
                                    </div> : errorWalletBuy ? <div className="lg:max-w-40 lg:mx-auto px-4">
                                        <LinkRouter legacyBehavior href="/panel/deposit?type=online">
                                            <Button href="/panel/deposit?type=online" variant="contained" color="primary" size="medium" className="custom-btn text-xs w-full text-black rounded-lg"
                                                startIcon={<svg viewBox="0 0 24 24" className="svg-icon text-2xl">
                                                    <path d="M12.9 1.42c-.33 0-.66.059-.97.176a1 1 0 0 0-.003 0l-7.26 2.742c-1.4.53-2.33 1.88-2.33 3.377v4.81a6.144 6.144 0 0 0-.476 7.058 6.13 6.13 0 0 0 5.28 2.994c1.196 0 2.32-.344 3.27-.948a1 1 0 0 0 .17.034h6.694c2.437 0 4.438-2.003 4.438-4.44v-.355c.575-.338.968-.96.968-1.664v-1.883c0-.704-.393-1.326-.968-1.664v-.586c0-2.437-2-4.438-4.438-4.438h-1.643V4.16a2.728 2.728 0 0 0-1.18-2.251 2.738 2.738 0 0 0-1.553-.489zm-.094 2.006a.754.754 0 0 1 .51.125.73.73 0 0 1 .23.266.736.736 0 0 1 .086.341 1 1 0 0 0 0 .002v2.473H6.777c-.879 0-1.7.264-2.393.711.12-.516.48-.941.99-1.135l7.26-2.742a.721.721 0 0 1 .172-.04zM6.777 8.633h10.5a2.435 2.435 0 0 1 2.438 2.438v.318h-.847c-.771 0-1.5.312-2.023.846a2.84 2.84 0 0 0-.836 2.281c.132 1.55 1.497 2.62 2.97 2.62h.737v.087a2.436 2.436 0 0 1-2.438 2.439h-4.904l.05-.084c.57-.93.895-2.024.895-3.176a6.172 6.172 0 0 0-3.502-5.564 6.159 6.159 0 0 0-5.467.063 2.434 2.434 0 0 1 2.43-2.268zm.477 3.6a4.177 4.177 0 0 1 3.42 1.947c.419.666.64 1.436.64 2.223 0 .783-.217 1.52-.6 2.14a1 1 0 0 0-.01.02 3.66 3.66 0 0 1-.802.954 1 1 0 0 0-.027.023 4.039 4.039 0 0 1-2.734 1.037 1 1 0 0 0-.002 0 4.137 4.137 0 0 1-3.563-2.019 1 1 0 0 0-.005-.014 4.07 4.07 0 0 1-.604-2.139 1 1 0 0 0 0-.002c0-1.323.604-2.493 1.561-3.252a1 1 0 0 0 .005-.003 4.17 4.17 0 0 1 2.721-.915zm11.61 1.156h1.816v1.748h-1.705c-.5 0-.945-.37-.98-.793a1 1 0 0 0-.003-.012.83.83 0 0 1 .254-.68 1 1 0 0 0 .018-.017.803.803 0 0 1 .6-.246zm-11.73.568a.75.75 0 0 0-.75.75v.907h-.94a.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75h.94v.986a.75.75 0 0 0 .75.75.75.75 0 0 0 .75-.75v-.986h.945a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75h-.945v-.907a.75.75 0 0 0-.75-.75z"></path>
                                                </svg>}>
                                                <span className="text-large-1 mx-2">افزایش موجودی</span>
                                            </Button>
                                        </LinkRouter>
                                    </div> : <div className="lg:max-w-28 lg:mx-auto px-4">
                                        <LoadingButton type="submit" variant="contained" size="medium" color="success" fullWidth className="rounded-lg px-10" disableElevation loading={loading}>
                                            <text className="text-black font-semibold">خرید</text>
                                        </LoadingButton >
                                    </div>}
                                </form>
                            </>
                            :
                            <>
                                <form className="flex flex-col gap-y-3 pb-6 px-4" noValidate autoComplete="off" onSubmit={handleSubmit(userSell)}>
                                    {priceType != 'MarketOrder' ? <FormControl className="w-full">
                                        <Controller
                                            name="price"
                                            control={control}
                                            render={({ field }) => (
                                                <NumericFormat
                                                    {...field}
                                                    thousandSeparator
                                                    decimalScale={0}
                                                    allowNegative={false}
                                                    customInput={TextField}
                                                    type="tel"
                                                    label={`قیمت ثابت`}
                                                    variant="outlined"
                                                    error={!!errors.price}
                                                    helperText={(errors.price ? errors.price.message : '')}
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        inputProps: {
                                                            className: 'ltr pl-4', maxLength: 16,
                                                            inputMode: 'decimal'
                                                        },
                                                        endAdornment: <span className="input-end-span">تومان</span>,
                                                    }}
                                                    value={price}
                                                    onChange={(event) => {
                                                        field.onChange(event);
                                                        setPrice(Number(event.target.value?.replace(/,/g, '')));
                                                        setRialAmount('');
                                                        setRialPureAmount('');
                                                        setTradeableAmount('');
                                                        setSliderValue(0);
                                                        clearErrors();
                                                        clearForm();
                                                        setErrorTomanDivisible(false);
                                                        setTomanDivisible(0);
                                                    }} />
                                            )}
                                        />
                                    </FormControl> : ''}
                                    <FormControl className="w-full">
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
                                    </FormControl>
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            thousandSeparator
                                            decimalScale={0}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="ارزش کل"
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
                                        {rialPureAmount > 0 ? <FormHelperText className="text-black text-xs dark:text-alert-warning-foreground">مبلغ خالص دریافتی :
                                            <span>
                                                {floorNumber((rialPureAmount || 0), (tradeableInfo?.tradeable?.sellMaxDecimals))?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </span> تومان می باشد.</FormHelperText> : ''}
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
                                            <b className="block">حداقل مقدار فروش {tradeableInfo?.tradeable?.nameFa} {(tradeableInfo?.tradeable?.minSellAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم می‌باشد.</b>
                                        </div>
                                    </Alert> : ''}

                                    {errorWalletSell ? <div className="lg:max-w-40 lg:mx-auto px-4">
                                        <LinkRouter legacyBehavior href="/panel/trade?type=buy">
                                            <Button href="/panel/trade?type=buy" variant="contained" color="primary" size="medium" className="custom-btn text-xs w-full text-black rounded-lg"
                                                startIcon={<svg viewBox="0 0 24 24" className="svg-icon text-black"><path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path></svg>}>
                                                <span className="text-large-1 mx-2">افزایش موجودی</span>
                                            </Button>
                                        </LinkRouter>
                                    </div> : <div className="lg:max-w-28 lg:mx-auto px-4">
                                        <LoadingButton type="submit" variant="contained" size="medium" color="error" fullWidth className="rounded-lg px-10" disableElevation loading={loading}>
                                            <text className="text-black font-semibold">فروش</text>
                                        </LoadingButton >
                                    </div>}
                                </form>
                            </>}

                    </section>
                    {(tradeableInfo?.tradeable?.chartLink && tradeableInfo?.tradeable?.chartLink != 'disable') ? <div className="col-span-12 xl:col-span-8 h-[400px] lg:h-[500px] xl:h-auto">
                        <TradingViewWidget
                            link={tradeableInfo?.tradeable?.chartLink}
                            theme={darkModeToggle ? 'dark' : 'light'}
                        />
                    </div> : ''}
                    {(siteInfo?.scalpingPreventionPeriodInHours && siteInfo?.scalpingPreventionPeriodInHours > 0) ? <div className="col-span-12">
                        <Alert
                            severity="info"
                            variant="filled"
                            color="info"
                            className="custom-alert auth info mt-4"
                        >
                            <div className="flex flex-col items-baseline md:items-center gap-y-2 md:flex-row md:justify-between w-full overflow-hidden">
                                <span className="mt-2">فرایند های خرید شما پس از مدت زمان {siteInfo?.scalpingPreventionPeriodInHours || '--'} ساعت از تاریخ معامله به صورت خودکار تائید می شوند.</span>
                            </div>

                        </Alert>
                    </div> : ''}
                </div>}


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

            <>
                <Dialog onClose={() => setShowPayLater(false)} open={showPayLater} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6 mb-4">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2"><span>خرید قرضی - {tradeableInfo?.tradeable?.nameFa}</span>
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowPayLater(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                    </div>
                    <div className="flex flex-col gap-y-4 w-full h-full pt-4">
                        <div className="flex items-center justify-between gap-x-8 dark:text-white">
                            <Alert
                                severity="info"
                                variant="filled"
                                color="info"
                                className="custom-alert info w-full"
                            >
                                حداکثر مبلغ جهت خرید قرضی {(siteInfo?.payLaterLimit || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان می باشد.
                            </Alert>
                        </div>
                        <div className="flex items-center justify-between gap-x-8 dark:text-white">
                            <Alert
                                severity="info"
                                variant="filled"
                                color="info"
                                className="custom-alert info w-full"
                            >
                                حداکثر زمان تسویه {(siteInfo?.payLaterDeadlineHours || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} ساعت می باشد.
                            </Alert>
                        </div>
                        <div className="flex items-center justify-between gap-x-8 dark:text-white">
                            <span>مقدار {tradeableInfo?.tradeable?.nameFa}:</span>
                            <span>{(tradeableAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم</span>
                        </div>
                        <div className="flex items-center justify-between gap-x-8 dark:text-white">
                            <span>مبلغ خرید :</span>
                            <span>{(rialAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                        </div>
                        <div className="flex items-center justify-end gap-x-2 mt-4">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg" onClick={() => setShowPayLater(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={payLaterBuy}>
                                <text className="text-black font-semibold">تائید</text>
                            </LoadingButton>
                        </div>
                    </div>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    variant="temporary"
                    open={openBottomPayLaterDrawer}
                    onClose={() => setOpenBottomPayLaterDrawer(false)}
                    className="z-[18800]"
                    PaperProps={{ className: 'drawers temporary block' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6 mb-4">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2"><span>خرید قرضی - {tradeableInfo?.tradeable?.nameFa}</span>
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomPayLaterDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <div className="flex flex-col gap-y-4 w-full h-full pt-4">
                        <div className="flex items-center justify-between gap-x-8 dark:text-white">
                            <Alert
                                severity="info"
                                variant="filled"
                                color="info"
                                className="custom-alert info w-full"
                            >
                                حداکثر مبلغ جهت خرید قرضی {(siteInfo?.payLaterLimit || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان می باشد.
                            </Alert>
                        </div>
                        <div className="flex items-center justify-between gap-x-8 dark:text-white">
                            <Alert
                                severity="info"
                                variant="filled"
                                color="info"
                                className="custom-alert info w-full"
                            >
                                حداکثر زمان تسویه {(siteInfo?.payLaterDeadlineHours || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} ساعت می باشد.
                            </Alert>
                        </div>
                        <div className="flex items-center justify-between gap-x-8 dark:text-white">
                            <span>مقدار {tradeableInfo?.tradeable?.nameFa}:</span>
                            <span>{(tradeableAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم</span>
                        </div>
                        <div className="flex items-center justify-between gap-x-8 dark:text-white">
                            <span>مبلغ خرید :</span>
                            <span>{(rialAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                        </div>
                        <div className="flex items-center justify-end gap-x-2 mt-4">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg" onClick={() => setOpenBottomPayLaterDrawer(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={payLaterBuy}>
                                <text className="text-black font-semibold">تائید</text>
                            </LoadingButton>
                        </div>
                    </div>
                </SwipeableDrawer>
            </>
        </>
    )
}

export default TradePageCompo;