import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import CloseIcon from '@mui/icons-material/Close'
import LoadingButton from '@mui/lab/LoadingButton'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import Pagination from '@mui/material/Pagination';
import Divider from '@mui/material/Divider';
import MUISelect from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import moment from 'jalali-moment'

import { NumericFormat, PatternFormat } from 'react-number-format';

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
 * OrderPageCompo component that displays the Order Page Component of the website.
 * @returns The rendered Order Page component.
 */
const OrderPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, priceInfo, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);
    const [openAlert, setOpenAlert] = useState(true);
    const [openBottomFilterDrawer, setOpenBottomFilterDrawer] = useState(false);

    const [refreshOnce, setRefreshOnce] = useState(false);
    useEffect(() => {
        getProducts();
        getTradeables();
    }, [refreshOnce]);

    /**
        * Retrieves Branches.
        * @returns None
       */
    const [branches, setBranches] = useState([]);
    const [loadingBranches, setLoadingBranches] = useState(true);
    const getBranches = (search) => {
        setLoadingBranches(true);
        ApiCall('/branch', 'GET', locale, {}, ``, 'user', router).then(async (result) => {
            setBranches(result.data);
            setLoadingBranches(false);
        }).catch((error) => {
            setLoadingBranches(false);
            console.log(error);
        });
    }

    const [selectedDate, setSelectedDate] = useState(null);
    const weekDays = [];

    const generateWeekDays = () => {
        const startOfWeek = moment().startOf("day");
        const persianWeekDays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];

        for (let i = 0; i <= 7; i++) {
            const day = startOfWeek.clone().add(i, "days");
            const jalaliDayOfWeek = (day.day() + 1) % 7;
            if (jalaliDayOfWeek !== 6) {
                weekDays.push({
                    date: day,
                    dayName: persianWeekDays[jalaliDayOfWeek],
                    formattedDate: day.format("jMM/jDD"),
                });
            }
        }
    }

    generateWeekDays();

    /**
        * Retrieves TimeBranches.
        * @returns None
       */
    const [timeBranches, setTimeBranches] = useState([]);
    const [loadingTimeBranches, setLoadingTimeBranches] = useState(false);
    const [timeBranchesLimit, setTimeBranchesLimit] = useState(10);
    const [timeBranchesTotal, setTimeBranchesTotal] = useState(0);
    const [branch, setBranch] = useState(null);
    const [branchTime, setBranchTime] = useState(null)
    const [disabledRanges, setDisabledRanges] = useState([]);
    const getTimeBranches = (page, branchId, fromDate, toDate) => {
        setLoadingTimeBranches(true);
        ApiCall('/branch/branch-time', 'GET', locale, {},
            `fromDate=${fromDate}&toDate=${toDate}&branchId=${branchId}&sortOrder=0&sortBy=createdAt&limit=${timeBranchesLimit}&skip=${(page * timeBranchesLimit) - timeBranchesLimit}`, 'user', router
        ).then(async (result) => {
            const now = new Date();

            const filteredData = result.data.filter(item => {
                const itemEndTime = new Date(item.endTime);
                return itemEndTime > now;
            });

            setTimeBranchesTotal(filteredData.length);
            setTimeBranches(filteredData);
            setLoadingTimeBranches(false);
        }).catch((error) => {
            setLoadingTimeBranches(false);
            console.log(error);
        });
    }

    const handleSelectBranch = (branch) => {
        // getTimeBranches(1, branch?._id);
        setSelectedDate(null);
        setBranch(branch);
    }

    const handleSelectDay = (date) => (event) => {
        const isoStartDate = moment(date).format("YYYY-MM-DDT00:00:00.000");
        const isoEndDate = moment(date).format("YYYY-MM-DDT23:59:59.999");
        setSelectedDate(date);
        setBranchTime('');
        if (branch) {
            getTimeBranches(1, branch._id, isoStartDate, isoEndDate);
        }
    }

    const [showFactor, setShowFactor] = useState(false);
    const [openBottomFactorDrawer, setOpenBottomFactorDrawer] = useState(false);
    const handleShowFactor = () => {
        getBranches();
        if (window.innerWidth >= 1024) {
            setShowFactor(true);
            setOpenBottomFactorDrawer(false);
        } else {
            setShowFactor(false);
            setOpenBottomFactorDrawer(true);
        }
    }
    const handleCloseFactor = () => {
        setShowFactor(false);
        setOpenBottomFactorDrawer(false);
        setBranch(null);
        setBranchTime(null);
    }

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
         * Retrieves User Info for the user.
         * @returns None
        */
    const [allProducts, setAllProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [products, setProducts] = useState([]);
    const [filterProducts, setFilterProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [categories, setCategories] = useState([]);
    const getProducts = () => {
        setLoadingProducts(true);
        ApiCall('/product', 'GET', locale, {}, 'sortOrder=0&sortBy=createdAt', 'user', router).then(async (result) => {
            const rawData = result.data;

            const categories = rawData.filter(item => item.isGroup && item.products?.length > 0);
            const products = rawData.filter(item => !item.isGroup);

            categories.forEach(category => {
                products.push(...category.products);
            });

            const uniqueProducts = Array.from(
                new Map(products.map(product => [product._id, product])).values()
            );

            setAllProducts(uniqueProducts);
            setProducts(uniqueProducts);
            setFilterProducts(uniqueProducts);
            setCategories(categories);
            setLoadingProducts(false);
        }).catch((error) => {
            setLoadingProducts(false);
            console.log(error);
        });
    }

    /**
         * Retrieves Tradeables list.
         * @returns None
        */
    const [tradeables, setTradeables] = useState([]);
    const [filters, setFilters] = useState(null);
    const [loadingTradeables, setLoadingTradeables] = useState(true);
    const getTradeables = () => {
        setLoadingTradeables(true);
        ApiCall('/tradeable/public', 'GET', locale, {}, ``, 'user', router).then(async (result) => {
            setTradeables(result.data);
            const initialFilters = tradeables.reduce((data, item) => {
                data[item.name] = false;
                return data;
            }, {});

            setFilters(initialFilters);
            setLoadingTradeables(false);
        }).catch((error) => {
            setLoadingTradeables(false);
            console.log(error);
        });
    }

    /**
        * Retrieves Products Requests.
        * @returns None
       */
    const [pageItem, setPageItem] = useState(1);
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [transactionsLimit, settransactionsLimit] = useState(10);
    const [transactionsTotal, setTransactionsTotal] = useState(0);
    const getProductsRequests = () => {
        setLoadingTransactions(true);
        ApiCall('/product-request', 'GET', locale, {}, `sortOrder=0&sortBy=createdAt&limit=${transactionsLimit}&skip=${(pageItem * transactionsLimit) - transactionsLimit}`, 'user', router).then(async (result) => {
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
        getProductsRequests();
    }

    const [productData, setProductData] = useState();
    const [dialogType, setDialogType] = useState('');
    const [productTradeableBalance, setProductTradeableBalance] = useState(0);
    const [showOrder, setShowOrder] = useState(false);
    const [openBottomOrderDrawer, setOpenBottomOrderDrawer] = useState(false);
    const marks = [
        {
            value: 0,
            label: '0'
        },
        {
            value: 25,
            label: ''
        },
        {
            value: 50,
            label: ''
        },
        {
            value: 75,
            label: ''
        },
        {
            value: 100,
            label: `${productTradeableBalance?.toLocaleString(undefined, { maximumFractionDigits: (productData?.maxDecimals ?? 3) })}`
        }
    ]
    const handleShowOrder = (data) => () => {
        if (data.isQuantitative) {
            setProductAmount(1);
        } else {
            clearForm();
            setSliderValue(0);
            setProductAmount('');
        }

        const balance = priceInfo?.filter(item => item.tradeable?.name == data.tradeable?.name);
        setProductTradeableBalance(floorNumber((balance?.length > 0 ? balance[0]?.balance || 0 : 0), (data?.maxDecimals ?? 3)));

        setProductData(data);
        setDialogType(data.isQuantitative ? 'coin' : 'weight');
        if (window.innerWidth >= 1024) {
            setShowOrder(true);
            setOpenBottomOrderDrawer(false);
        } else {
            setShowOrder(false);
            setOpenBottomOrderDrawer(true);
        }
    }

    const [cartIndex, setCartIndex] = useState('');
    const [showCart, setShowCart] = useState(false);
    const [openBottomCartDrawer, setOpenBottomCartDrawer] = useState(false);
    const handleShowCart = () => {
        getProductsRequests();
        if (window.innerWidth >= 1024) {
            setShowCart(true);
            setOpenBottomCartDrawer(false);
        } else {
            setShowCart(false);
            setOpenBottomCartDrawer(true);
        }
    }

    const [itemData, setItemData] = useState(false);
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

    const validationSchema = Yup.object({
        amountOrCount: Yup.string().required('این فیلد الزامی است')
            .transform(value => value.replace(/,/g, ''))
            .test(
                'is-multiple-of-minDeliverableTradeableAmount',
                `مقدار درخواست باید حداقل ${(productData?.minDeliverableAmount || 0)} ${(productData?.isQuantitative ? 'عدد' : 'گرم')} باشد`,
                value => {
                    const parsedValue = floorNumber(value?.replace(/,/g, '') || 0, Number.isInteger(productData?.maxDecimals ?? 3));
                    return !isNaN(parsedValue) && (parsedValue >= (productData?.minDeliverableAmount || 0));
                }
            )
    });
    const { control, setValue, trigger, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const clearForm = () => {
        setValue('amountOrCount', '');
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
    * Calculates the slider value for Product Amount.
    * @returns None
    */
    const [productAmount, setProductAmount] = useState('');
    const [sliderValue, setSliderValue] = useState(0);
    const calcAmountSlider = async (event) => {
        const value = event.target.value;
        let size = (productTradeableBalance || 0) * (value / 100);

        size = floorNumber(size, (productData?.maxDecimals ?? 3));

        setSliderValue(value);

        if (value == 0) {
            setProductAmount('');
            setValue('amountOrCount', '');
        } else {
            setProductAmount(size);
            setValue('amountOrCount', size);
        }

        await trigger('amountOrCount');
    }

    const handleAmountChange = (event) => {
        const inputValue = event.target.value?.replace(/,/g, '') == '' ? '' : Number(event.target.value?.replace(/,/g, ''));
        setProductAmount(inputValue);

        const calculatedSliderValue = (inputValue / (productTradeableBalance || 1)) * 100;
        if (calculatedSliderValue > 100) {
            setSliderValue(100);
        } else if (calculatedSliderValue < 0) {
            setSliderValue(0);
        } else {
            setSliderValue(calculatedSliderValue);
        }
    }

    /**
    * Calculates the input value for Product Amount.
    * @returns None
    */
    const handleChangeAmount = (event) => {
        const value = event.target.value;
        setSliderValue(0);
        if (value == '') {
            setProductAmount(1);
        } else if (value > 10) {
            setProductAmount(10);
        } else if (value < 1) {
            setProductAmount(1);
        } else {
            setProductAmount(value);
        }
    }
    /**
    * Calculates the input button increment and decrement value for Product Amount.
    * @returns None
    */
    const handleNumberInputBtn = (type) => (event) => {
        event.preventDefault();
        if (type == 'increment') {
            if (productAmount == '') {
                setProductAmount(1);
            } else if (productAmount > 10) {
                setProductAmount(10);
            } else if (productAmount < 1) {
                setProductAmount(1);
            } else {
                let amount = productAmount + 1;
                setProductAmount(amount);
            }
        } else {
            if (productAmount == '') {
                setProductAmount(1);
            } else if (productAmount > 10) {
                setProductAmount(10);
            } else if (productAmount < 1) {
                setProductAmount(1);
            } else {
                let amount = productAmount - 1;
                setProductAmount(amount);
            }
        }

    }

    /**
     * User Order Product.
     * @returns None
    */
    const userOrder = () => {
        if (((!siteInfo?.offlineFirstStepUserVerifyEnabled && !siteInfo?.onlineFirstStepUserVerifyEnabled) || !siteInfo?.secondStepUserVerifyEnabled) || (['SecondLevelVerified'].includes(userInfo?.verificationStatus))) {
            setLoading(true);
            let body = discountCode && expanded ? { productId: productData?._id, amountOrCount: Number(productAmount), branchTimeId: branchTime?._id, discountCode } : { productId: productData?._id, amountOrCount: Number(productAmount), branchTimeId: branchTime?._id }
            ApiCall('/product-request', 'POST', locale, body, '', 'user', router).then(async (result) => {
                dispatch({
                    type: 'setSnackbarProps', value: {
                        open: true, content: langText('Global.SuccessRequest'),
                        type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                    }
                });
                getProducts();
                getUserInformation();
                dispatch({
                    type: 'setRefreshInventory', value: parseInt(Math.floor(Math.random() * 100) + 1)
                });
                setLoading(false);
                setProductData();
                handleCloseFactor();
                setShowOrder(false);
                setOpenBottomOrderDrawer(false);
                clearForm();
                setExpanded(true);
            }).catch((error) => {
                setLoading(false);
                console.log(error);
                if (error.neededAmount) {
                    handleShowWithdrawError(error);
                } else {
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
                }
            });
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

    const [errorWithdrawError, setErrorWithdrawError] = useState('');
    const [showWithdrawError, setShowWithdrawError] = useState(false);
    const [openBottomWithdrawErrorDrawer, setOpenBottomWithdrawErrorDrawer] = useState(false);
    const handleShowWithdrawError = (error) => {
        setErrorWithdrawError(error);
        if (window.innerWidth >= 1024) {
            setShowWithdrawError(true);
            setOpenBottomWithdrawErrorDrawer(false);
        } else {
            setShowWithdrawError(false);
            setOpenBottomWithdrawErrorDrawer(true);
        }
    }

    const [hasFilterWeight, setHasFilterWeight] = useState(false);
    const [hasFilterType, setHasFilterType] = useState(false);
    const [weightSlider, setWeightSlider] = useState(0);

    const filterProductsHandler = (products, weight, typeFilters) => {
        let result = [...products];

        if (weight) {
            result = result.filter(product => Number(product.weight) >= weight);
        }

        const activeFilters = Object.keys(typeFilters).filter(key => typeFilters[key]);
        if (activeFilters.length > 0) {
            result = result.filter(product => {
                return activeFilters.some(filter => {
                    const isGold = product.tradeable?.name === "gold";
                    const isCoin = product.isQuantitative;
                    return (filter === "gold" && isGold) || (filter === "coin" && isCoin);
                });
            });
        }

        return result;
    };


    const handleFilter = (type, input) => (event) => {
        let updatedFilters = { ...filters };
        let updatedWeightSlider = weightSlider;
        let updatedHasFilterWeight = hasFilterWeight;
        let updatedHasFilterType = hasFilterType;

        if (type === 'weight') {
            updatedWeightSlider = event.target.value;
            updatedHasFilterWeight = true;
        } else if (type === 'type') {
            updatedHasFilterType = true;
            updatedFilters = {
                ...filters,
                [input]: event.target.checked
            };
        }

        const currentProducts = selectedCategory === "all"
            ? allProducts
            : categories.find(cat => cat._id === selectedCategory)?.products || [];

        const filteredProducts = filterProductsHandler(
            currentProducts,
            updatedWeightSlider,
            updatedFilters
        );

        setFilterProducts(filteredProducts);
        setWeightSlider(updatedWeightSlider);
        setHasFilterWeight(updatedHasFilterWeight);
        setHasFilterType(updatedHasFilterType);
        setFilters(updatedFilters);
    };


    const handleRemoveFilter = (type) => () => {
        let updatedFilters = { ...filters };
        let updatedWeightSlider = weightSlider;
        let updatedHasFilterWeight = hasFilterWeight;
        let updatedHasFilterType = hasFilterType;

        if (type === "weight") {
            updatedHasFilterWeight = false;
            updatedWeightSlider = 0;
        } else if (type === "unit") {
            updatedHasFilterType = false;
            updatedFilters = tradeables.reduce((acc, item) => {
                acc[item.name] = false;
                return acc;
            }, {});
        } else if (type === "all") {
            updatedHasFilterWeight = false;
            updatedHasFilterType = false;
            updatedFilters = tradeables.reduce((acc, item) => {
                acc[item.name] = false;
                return acc;
            }, {});
            updatedWeightSlider = 0;
        }

        const currentProducts =
            selectedCategory === "all"
                ? allProducts
                : categories.find(cat => cat._id === selectedCategory)?.products || [];

        const filteredProducts = filterProductsHandler(
            currentProducts,
            updatedWeightSlider,
            updatedFilters
        );
        setFilterProducts(filteredProducts);
        setWeightSlider(updatedWeightSlider);
        setHasFilterWeight(updatedHasFilterWeight);
        setHasFilterType(updatedHasFilterType);
        setFilters(updatedFilters);
    }

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setHasFilterWeight(false);
        setHasFilterType(false);

        const newProducts =
            categoryId === "all"
                ? allProducts
                : categories.find(cat => cat._id === categoryId)?.products || [];

        setFilterProducts(newProducts);
        setWeightSlider(0);
        setFilters(tradeables.reduce((acc, item) => {
            acc[item.name] = false;
            return acc;
        }, {}));
    }

    /**
   * Checks the discount for a product and updates the UI accordingly.
   * @param {Event} event - The event object triggered by the discount check.
   * @returns None
   */
    const [expanded, setExpanded] = useState(false);
    const [discountLoading, setDiscountLoading] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [finalDiscount, setFinalDiscount] = useState('');
    const checkDiscount = (productId) => (event) => {
        event.preventDefault();
        setDiscountLoading(true);
        event.target.disabled = true;
        ApiCall('/product-request/check-price', 'GET', locale, {}, `productId=${productId}&amountOrCount=${Number(productAmount)}&discountCode=${discountCode}`, 'user', router).then(async (result) => {
            event.target.disabled = false;
            setDiscountLoading(false);
            setExpanded(true);
            setFinalDiscount(result.priceAfterDiscount);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Globals.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            console.log(error);
            setDiscountLoading(false);
            setFinalDiscount('');
            event.target.disabled = false;
            let list = '';
            error.message && typeof error.message == 'object' ? error.message.map(item => {
                list += `${item}<br />`
            }) : null;
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: list,
                    type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        });
    }

    return (
        <div className=" flex flex-col gap-y-4">
            <section className="flex items-center justify-between">
                <div className="flex items-center gap-x-4">
                    <h1 className="text-large-2">محصولات</h1>
                </div>
                <div className="flex items-center gap-x-4">
                    <Button type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation onClick={() => setOpenBottomFilterDrawer(true)}>
                        <text className="text-black font-semibold">فیلتر</text>
                    </Button >
                    <Button type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation onClick={handleShowCart}>
                        <ShoppingCartOutlinedIcon color="black" />
                    </Button >
                </div>
            </section>
            {siteInfo?.productReqPageDesc1 ? <Collapse in={openAlert}>
                <Alert
                    severity="info"
                    variant="filled"
                    color="info"
                    className="custom-alert info"
                    onClose={() => setOpenAlert(false)}
                    sx={{ mb: 2 }}
                >
                    {siteInfo?.productReqPageDesc1}
                </Alert>
            </Collapse> : <Collapse in={openAlert}>
                <Alert
                    severity="info"
                    variant="filled"
                    color="info"
                    className="custom-alert info"
                    onClose={() => setOpenAlert(false)}
                    sx={{ mb: 2 }}
                >
                    تحویل طلا به صورت حضوری و در شعبه اداری {siteInfo?.title} صورت می‌گیرد. به علت محدودیت‌های ارسال پستی طلا و جواهر، امکان ارسال به صورت پستی یا پیک میسر نمی‌باشد.
                </Alert>
            </Collapse>}

            {categories?.length > 0 ? <section className="w-full flex items-center flex-nowrap gap-x-4 overflow-x-auto overflow-y-hidden md:my-4">
                <div className="w-fit whitespace-nowrap">
                    <input
                        type="radio"
                        name="exchangeType"
                        id="all"
                        className="hidden peer"
                        checked={selectedCategory === "all"}
                        onChange={() => handleCategoryChange("all")}
                    />
                    <label
                        htmlFor="all"
                        className="transition cursor-pointer p-3 rounded-lg border border-solid border-[#EEEEEE] dark:border-[#4A4A4A] justify-center items-center gap-2.5 flex peer-checked:bg-primary peer-checked:bg-opacity-[15%] peer-checked:border-primary"
                    >
                        <span className="text-sm font-normal">تمام محصولات</span>
                    </label>
                </div>
                {categories?.map((category, index) => (
                    <div className="w-fit whitespace-nowrap" key={index}>
                        <input
                            type="radio"
                            name="exchangeType"
                            id={category._id}
                            className="hidden peer"
                            checked={selectedCategory === category._id}
                            onChange={() => handleCategoryChange(category._id)}
                        />
                        <label
                            htmlFor={category._id}
                            className="transition cursor-pointer p-3 rounded-lg border border-solid border-[#EEEEEE] dark:border-[#4A4A4A] justify-center items-center gap-2.5 flex peer-checked:bg-primary peer-checked:bg-opacity-[15%] peer-checked:border-primary"
                        >
                            <span className="text-sm font-normal">{category.title}</span>
                        </label>
                    </div>
                ))}
            </section> : ''}
            <section className="grid grid-cols-12 gap-4">
                {loadingProducts ? <div className="col-span-12 flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : filterProducts.length > 0 ? filterProducts.map((data, index) => {
                    return (
                        <div className="col-span-12 md:col-span-6 xl:col-span-4 h-full" key={index}>
                            <div className="custom-card rounded-2xl p-0  h-full cursor-pointer" onClick={handleShowOrder(data)}>
                                <div className="text-center">
                                    <img
                                        crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.image}`} alt={data.slug}
                                        className="w-full min-h-52 h-52 rounded-t-2xl object-cover" />
                                </div>
                                <div className="flex items-center justify-between px-4 pb-4">
                                    <span className="flex gap-x-1 dark:text-white text-xl font-bold">{data.name}</span>
                                    {!data.isQuantitative || data.stock > 0 ? <Button type="submit" variant="outlined" size="medium" className="rounded-lg px-10" disableElevation
                                        onClick={handleShowOrder(data)}>
                                        <AddShoppingCartIcon />
                                    </Button> : <Button type="submit" variant="outlined" size="medium" color="error" className="rounded-lg *:text-primary-red px-10" disableElevation
                                        onClick={handleShowOrder(data)}>
                                        <span>ناموجود</span>
                                    </Button>}

                                </div>
                            </div>
                        </div>
                    )
                }) : <div className="col-span-12 py-16">
                    <span className="block text-center text-large-1 text-primary-gray">محصولی تعریف نشده است.</span>
                </div>}
            </section>

            {/* Select Branch */}
            <>
                <Dialog onClose={() => handleCloseFactor()} open={showFactor} maxWidth={'sm'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6 mb-4">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2"><span></span>
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => handleCloseFactor()}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                    </div>
                    <div className="flex flex-col gap-y-8 mt-6">
                        <FormControl className={`${loadingBranches ? 'pointer-events-none' : ''}`}>
                            <InputLabel id="demo-simple-select-label"
                                sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب شعبه دریافت</InputLabel>
                            {loadingBranches ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} className="absolute top-[33%] rtl:left-[10px] ltr:right-[10px] z-10 translate-y-1/2" /> : ''}
                            <MUISelect
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                onChange={(event) => handleSelectBranch(event.target.value)}
                                input={<OutlinedInput
                                    id="select-multiple-chip"
                                    label="انتخاب شعبه دریافت"
                                    className="dark:bg-dark *:dark:text-white"
                                    sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                />}
                                renderValue={(selected) => (
                                    <div className="flex flex-wrap gap-0.5">
                                        <span className="truncate">{selected?.nameFa} - {selected?.address}</span>
                                    </div>
                                )}
                                MenuProps={{ classes: { paper: 'w-full lg:w-[30%] 3xl:w-[24%] dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                {branches?.map((data, index) => (
                                    <MenuItem key={index} value={data}><span className="whitespace-break-spaces">{data.nameFa} - {data.address}</span></MenuItem>
                                ))}
                            </MUISelect>
                        </FormControl>
                        {branch ?
                            <>
                                <div className="flex flex-col gap-y-3">
                                    <label>انتخاب روز دریافت</label>
                                    <div className="flex items-center gap-x-2 overflow-x-auto overflow-y-hidden pb-2 rtl:pl-2">
                                        {weekDays?.map((data, index) => (
                                            <div key={index} className="flex-[1]">
                                                <input type="radio" name="date" id={index} className="hidden peer" checked={selectedDate?.isSame(data.date, "day") ? true : false} onChange={handleSelectDay(data.date)} />
                                                <label htmlFor={index} className="transition cursor-pointer flex flex-col items-center gap-y-2 rounded-lg text-black text-opacity-70 dark:text-white 
                                    border border-light-secondary-foreground border-solid dark:border-dark-secondary py-1.5 px-4 peer-checked:bg-primary peer-checked:bg-opacity-5 peer-checked:border-primary">
                                                    <span className="text-xs font-extrabold">{data.dayName}</span>
                                                    <span className="text-xs font-extrabold">{data.formattedDate}</span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedDate && (
                                    <>
                                        <div className="flex flex-col gap-y-3">
                                            <label className="flex items-center justify-between gap-x-4">انتخاب زمان دریافت
                                                {loadingTimeBranches ? <div className="flex justify-center items-center"><CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} /></div> : ''}
                                            </label>
                                            {timeBranches?.length > 0 ? (
                                                <ul className={`flex items-center gap-x-2 list-none rtl:pr-0 m-0 ${loadingTimeBranches ? 'invisible' : ''}`}>
                                                    {timeBranches?.map((data, index) => (
                                                        <li key={index} className="w-fit">
                                                            <input type="radio" name="time" id={data._id} className="hidden peer" checked={data._id == branchTime?._id ? true : false} onChange={data.capacity > 0 ? (event) => setBranchTime(data) : () => false} />
                                                            <label htmlFor={data._id} className={`${data.capacity > 0 ? 'cursor-pointer' : 'text-black text-opacity-30 cursor-default dark:text-white dark:text-opacity-30'} transition flex flex-col items-center gap-y-2 rounded-lg 
                                                        border border-light-secondary-foreground border-solid dark:border-dark-secondary py-1.5 px-4 peer-checked:bg-primary peer-checked:bg-opacity-5 peer-checked:border-primary`}>
                                                                <span className="text-xs font-extrabold">{moment(data.startTime).format("HH:mm")}</span>
                                                                <span className="text-xs font-extrabold">الی</span>
                                                                <span className="text-xs font-extrabold">{moment(data.endTime).format("HH:mm")}</span>
                                                            </label>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className={`text-center py-3 ${loadingTimeBranches ? 'invisible' : ''}`}>در تاریخ انتخابی زمانی برای تحویل وجود ندارد.</p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </> : ''}

                        <Alert
                            severity="info"
                            variant="filled"
                            color="warning"
                            className="custom-alert auth warning !items-start"
                        >
                            <div className="flex flex-col gap-y-4 w-full text-black dark:text-alert-warning-foreground">
                                <div className="flex flex-col gap-y-2">
                                    <span>
                                        محصول درخواستی : {productData?.name}
                                    </span>
                                    <span>
                                        مقدار درخواستی : {productAmount?.toLocaleString(undefined, { maximumFractionDigits: 3 })} {productData?.isQuantitative ? '' : 'گرم'}
                                    </span>
                                </div>
                                {branchTime && branch ?
                                    <>
                                        <span>
                                            {branch?.nameFa} - آدرس: <span className="whitespace-break-spaces">{branch?.address}</span> <br />
                                            شماره تماس شعبه: <PatternFormat displayType="text" value={branch?.phone} format="#### ### ## ##" dir="ltr" />
                                        </span>
                                        <span>
                                            زمان مراجعه: {moment(branchTime?.startTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')} الی {moment(branchTime?.endTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')}
                                        </span>
                                    </> : ''}
                            </div>
                        </Alert>

                        <div className="flex items-center justify-end gap-x-2">
                            <Button type="button" variant="text" size="medium" className="text-black dark:text-white rounded-lg" disableElevation
                                onClick={() => handleCloseFactor()}>
                                <span className="mx-2">انصراف</span>
                            </Button >
                            {dialogType == 'coin' ?
                                <LoadingButton type="button" variant="outlined" size="medium" className="rounded-lg px-5" disableElevation loading={loading}
                                    disabled={branchTime ? false : true}
                                    onClick={branchTime ? () => userOrder() : () => false}>
                                    <text className={`font-semibold ${branchTime ? 'text-black' : 'text-white text-opacity-50 !visible'}`}>ثبت</text>
                                </LoadingButton>
                                : <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                    disabled={branchTime ? false : true}
                                    onClick={branchTime ? () => userOrder() : () => false}>
                                    <text className={`font-semibold ${branchTime ? 'text-black' : 'text-white text-opacity-50 !visible'}`}>ثبت</text>
                                </LoadingButton>}
                        </div>
                    </div>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomFactorDrawer}
                    onClose={() => handleCloseFactor()}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    {/* <Typography component={'h2'}>علت رد شدن درخواست شما</Typography> */}
                    <div className="flex flex-col gap-y-8 mt-6">
                        <FormControl className={`${loadingBranches ? 'pointer-events-none' : ''}`}>
                            <InputLabel id="demo-simple-select-label"
                                sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب شعبه دریافت</InputLabel>
                            {loadingBranches ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} className="absolute top-[32%] rtl:left-[8px] ltr:right-[8px] rtl:md:left-[10px] ltr:md:right-[10px] z-10 translate-y-1/2" /> : ''}
                            <MUISelect
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                onChange={(event) => handleSelectBranch(event.target.value)}
                                input={<OutlinedInput
                                    id="select-multiple-chip"
                                    label="انتخاب شعبه دریافت"
                                    className="dark:bg-dark *:dark:text-white"
                                    sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                />}
                                renderValue={(selected) => (
                                    <div className="flex flex-wrap gap-0.5">
                                        <span className="truncate">{selected?.nameFa} - {selected?.address}</span>
                                    </div>
                                )}
                                MenuProps={{ classes: { paper: 'w-full lg:w-[30%] 3xl:w-[24%] dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                {branches?.map((data, index) => (
                                    <MenuItem key={index} value={data}><span className="whitespace-break-spaces">{data.nameFa} - {data.address}</span></MenuItem>
                                ))}
                            </MUISelect>
                        </FormControl>
                        {branch ?
                            <>
                                <div className="flex flex-col gap-y-3">
                                    <label>انتخاب روز دریافت</label>
                                    <div className="flex items-center gap-x-2 overflow-x-auto overflow-y-hidden pb-2 rtl:pl-2">
                                        {weekDays?.map((data, index) => (
                                            <div key={index} className="flex-[1]">
                                                <input type="radio" name="date" id={index} className="hidden peer" checked={selectedDate?.isSame(data.date, "day") ? true : false} onChange={handleSelectDay(data.date)} />
                                                <label htmlFor={index} className="transition cursor-pointer flex flex-col items-center gap-y-2 rounded-lg text-black text-opacity-70 dark:text-white 
                                    border border-light-secondary-foreground border-solid dark:border-dark-secondary py-1.5 px-4 peer-checked:bg-primary peer-checked:bg-opacity-5 peer-checked:border-primary">
                                                    <span className="text-xs font-extrabold">{data.dayName}</span>
                                                    <span className="text-xs font-extrabold">{data.formattedDate}</span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedDate && (
                                    <>
                                        <div className="flex flex-col gap-y-3">
                                            <label className="flex items-center justify-between gap-x-4">انتخاب زمان دریافت
                                                {loadingTimeBranches ? <div className="flex justify-center items-center"><CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} /></div> : ''}
                                            </label>
                                            {timeBranches?.length > 0 ? (
                                                <ul className="list-none rtl:pr-0 m-0">
                                                    {timeBranches?.map((data, index) => (
                                                        <li key={index} className="w-fit">
                                                            <input type="radio" name="time" id={data._id} className="hidden peer" checked={data._id == branchTime?._id ? true : false} onChange={data.capacity > 0 ? (event) => setBranchTime(data) : () => false} />
                                                            <label htmlFor={data._id} className={`${data.capacity > 0 ? 'cursor-pointer' : 'text-black text-opacity-30 cursor-default dark:text-white dark:text-opacity-30'} transition flex flex-col items-center gap-y-2 rounded-lg 
                                                    border border-light-secondary-foreground border-solid dark:border-dark-secondary py-1.5 px-4 peer-checked:bg-primary peer-checked:bg-opacity-5 peer-checked:border-primary`}>
                                                                <span className="text-xs font-extrabold">{moment(data.startTime).format("HH:mm")}</span>
                                                                <span className="text-xs font-extrabold">الی</span>
                                                                <span className="text-xs font-extrabold">{moment(data.endTime).format("HH:mm")}</span>
                                                            </label>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className={`text-center py-3 ${loadingTimeBranches ? 'invisible' : ''}`}>در تاریخ انتخابی زمانی برای تحویل وجود ندارد.</p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </> : ''}

                        <Alert
                            severity="info"
                            variant="filled"
                            color="warning"
                            className="custom-alert auth warning !items-start"
                        >
                            <div className="flex flex-col gap-y-4 w-full text-black dark:text-alert-warning-foreground">
                                <div className="flex flex-col gap-y-2">
                                    <span>
                                        محصول درخواستی : {productData?.name}
                                    </span>
                                    <span>
                                        مقدار درخواستی : {productAmount?.toLocaleString(undefined, { maximumFractionDigits: 3 })} {productData?.isQuantitative ? '' : 'گرم'}
                                    </span>
                                </div>
                                {branchTime && branch ?
                                    <>
                                        <span>
                                            {branch?.nameFa} - آدرس: <span className="whitespace-break-spaces">{branch?.address}</span> <br />
                                            شماره تماس شعبه: <PatternFormat displayType="text" value={branch?.phone} format="#### ### ## ##" dir="ltr" />
                                        </span>
                                        <span>
                                            زمان مراجعه: {moment(branchTime?.startTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')} الی {moment(branchTime?.endTime).locale('fa').format('dddd jYYYY/jMM/jDD ساعت HH:mm')}
                                        </span>
                                    </> : ''}
                            </div>
                        </Alert>

                        <div className="flex items-center justify-end gap-x-2">
                            <Button type="button" variant="text" size="medium" className="text-black dark:text-white rounded-lg" disableElevation
                                onClick={() => handleCloseFactor()}>
                                <span className="mx-2">انصراف</span>
                            </Button >
                            {dialogType == 'coin' ?
                                <LoadingButton type="button" variant="outlined" size="medium" className="rounded-lg px-5" disableElevation loading={loading}
                                    disabled={branchTime ? false : true}
                                    onClick={branchTime ? () => userOrder() : () => false}>
                                    <text className={`font-semibold ${branchTime ? 'text-black' : 'text-white text-opacity-50 !visible'}`}>ثبت</text>
                                </LoadingButton>
                                : <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                    disabled={branchTime ? false : true}
                                    onClick={branchTime ? () => userOrder() : () => false}>
                                    <text className={`font-semibold ${branchTime ? 'text-black' : 'text-white text-opacity-50 !visible'}`}>ثبت</text>
                                </LoadingButton>}
                        </div>
                    </div>
                </SwipeableDrawer>
            </>

            {/* Cart */}
            <>
                <Dialog onClose={() => { setShowCart(false); setCartIndex('') }} open={showCart} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <Typography component={'h2'} className="flex items-center gap-x-2">سبد تحویل <ShoppingCartIcon /></Typography>
                    {loadingTransactions ? <div className="flex justify-center items-center mt-10"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> :
                        transactions.length > 0 ? <div className="flex flex-col gap-y-4 mt-5">
                            {
                                transactions.map((data, index) => {
                                    return (
                                        <ButtonBase color={darkModeToggle ? 'white' : 'black'} key={index} disableRipple={!((data.branchTime && Object.keys(data.branchTime).length > 0) || data.purity)} onClick={(data.branchTime && Object.keys(data.branchTime).length > 0) || data.purity ? () => setCartIndex(index) : () => false} className={`w-full text-start text-base flex flex-col ${(data.branchTime && Object.keys(data.branchTime).length > 0) || data.purity ? 'cursor-pointer' : 'cursor-default'} border-b border-t-0 border-x-0 border-solid 
                                        border-black border-opacity-5 dark:border-white dark:border-opacity-5 py-2`}>
                                            <div className="w-full flex items-center justify-between gap-x-2">
                                                <div>
                                                    <span className="flex items-center gap-x-4">
                                                        {data.product?.name}
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
                                                                <span>&nbsp;({(data.weight || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم) &nbsp;(اجرت: {(data.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} تومان)</span> : ''}
                                                    </span>
                                                </div>
                                                <div className="">
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
                                            <Collapse in={cartIndex === index}>
                                                <div className="flex flex-col gap-y-4 w-full text-sm text-black dark:text-alert-warning-foreground mt-4">
                                                    {!data?.product?.price &&
                                                        !data?.product?.isQuantitative ? <>
                                                        <span className="text-black dark:text-white">شماره انگ: {data?.purity || '------'}</span>
                                                        <span className="text-black dark:text-white">نام آزمایشگاه: {data?.labName || '------'}</span>
                                                        <Divider component="div" className="dark:bg-primary dark:bg-opacity-50" />
                                                    </> : ''}
                                                    {(data.branchTime && Object.keys(data.branchTime).length > 0) ?
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
                                            </Collapse>
                                        </ButtonBase>
                                    )
                                })
                            }
                        </div> : <div className="block text-center text-2xl text-primary py-10 px-3">سبد تحویل شما خالی است</div>}
                    {Math.ceil(transactionsTotal / transactionsLimit) > 1 ?
                        <div className="text-center mt-4">
                            <Pagination siblingCount={0} count={Math.ceil(transactionsTotal / transactionsLimit)} variant="outlined" color="primary" className="justify-center"
                                page={pageItem} onChange={handlePageChange} />
                        </div>
                        : ''}
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomCartDrawer}
                    onClose={() => { setOpenBottomCartDrawer(false); setCartIndex('') }}
                    PaperProps={{ className: 'drawers', sx: { height: '85%' } }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <Typography component={'h2'} className="flex items-center gap-x-2">سبد تحویل <ShoppingCartIcon /></Typography>
                    {loadingTransactions ? <div className="h-[50svh] flex justify-center items-center mt-10"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> :
                        transactions.length > 0 ? <div className="flex flex-col gap-y-4 mt-5">
                            {
                                transactions.map((data, index) => {
                                    return (
                                        <ButtonBase color={darkModeToggle ? 'white' : 'black'} key={index} disableRipple={!((data.branchTime && Object.keys(data.branchTime).length > 0) || data.purity)} onClick={(data.branchTime && Object.keys(data.branchTime).length > 0) || data.purity ? () => setCartIndex(index) : () => false} className={`w-full text-start text-base flex flex-col ${(data.branchTime && Object.keys(data.branchTime).length > 0) || data.purity ? 'cursor-pointer' : 'cursor-default'} border-b border-t-0 border-x-0 border-solid 
                                        border-black border-opacity-5 dark:border-white dark:border-opacity-5 py-2`}>
                                            <div className="w-full flex items-center justify-between gap-x-2">
                                                <div>
                                                    <span className="flex items-center gap-x-4">
                                                        {data.product?.name}
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
                                                                <span>&nbsp;({(data.weight || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم) &nbsp;(اجرت: {(data.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} تومان)</span> : ''}
                                                    </span>
                                                </div>
                                                <div className="">
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
                                            <Collapse in={cartIndex === index}>
                                                <div className="flex flex-col gap-y-4 w-full text-sm text-black dark:text-alert-warning-foreground mt-4">
                                                    {!data?.product?.price &&
                                                        !data?.product?.isQuantitative ? <>
                                                        <span className="text-black dark:text-white">شماره انگ: {data?.purity || '------'}</span>
                                                        <span className="text-black dark:text-white">نام آزمایشگاه: {data?.labName || '------'}</span>
                                                        <Divider component="div" className="dark:bg-primary dark:bg-opacity-50" />
                                                    </> : ''}
                                                    {(data.branchTime && Object.keys(data.branchTime).length > 0) ?
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
                                            </Collapse>
                                        </ButtonBase>
                                    )
                                })
                            }
                        </div> : <div className="block text-center text-2xl text-primary py-10 px-3">سبد تحویل شما خالی است</div>}
                    {Math.ceil(transactionsTotal / transactionsLimit) > 1 ?
                        <div className="text-center mt-4">
                            <Pagination siblingCount={0} count={Math.ceil(transactionsTotal / transactionsLimit)} variant="outlined" color="primary" className="justify-center"
                                page={pageItem} onChange={handlePageChange} />
                        </div>
                        : ''}

                </SwipeableDrawer>
            </>

            {/* Reject Description */}
            <>
                <Dialog onClose={() => setShowReject(false)} open={showReject} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <Typography component={'h2'}>علت رد شدن درخواست شما</Typography>
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
                                value={itemData?.confirmDescription || itemData?.rejectReason} />
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
                    <Typography component={'h2'}>علت رد شدن درخواست شما</Typography>
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
                                value={itemData?.confirmDescription || itemData?.rejectReason} />
                        </FormControl>
                        <Button type="button" variant="contained" size="medium" fullWidth className="rounded-lg" disableElevation
                            onClick={() => setOpenBottomRejectDrawer(false)}>
                            <text className="text-black font-semibold">بستن</text>
                        </Button >
                    </div>
                </SwipeableDrawer>
            </>

            {/* Order */}
            <>
                <Dialog onClose={() => setShowOrder(false)} open={showOrder} maxWidth={'sm'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6 mb-4">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2"><span></span>
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowOrder(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                    </div>
                    {dialogType == 'coin' ?
                        <div className="flex flex-col items-center gap-y-2">
                            <div className="flex items-start gap-4">
                                <div className="w-1/2 h-full flex flex-col items-center gap-y-4">
                                    <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${productData?.image}`} alt={productData?.slug}
                                        className="mb-3 rounded-xl object-contain w-full h-1/2 " loading="lazy" />
                                    <span className="text-xl font-bold mb-2">{productData?.name}</span>
                                </div>
                                <p className="w-1/2 text-justify whitespace-pre-line mt-0">{productData?.description}</p>
                            </div>
                            <Divider component="div" className="w-full mb-4 dark:bg-primary dark:bg-opacity-50" />
                            <div className="w-full text-start flex flex-col gap-y-1">
                                <div className="flex gap-x-1">
                                    <span className="text-primary-gray">وزن:</span> <span className="font-semibold">
                                        {(productData?.weight || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}</span><span>گرم</span>
                                </div>
                                <div className="flex gap-x-1">
                                    <span className="text-primary-gray">عیار:</span><span className="font-semibold">{productData?.carat}</span>
                                </div>
                                {productData?.price ? <div className="flex gap-x-1">
                                    <span className="text-primary-gray">قیمت:</span>
                                    <div className="flex gap-x-1"><span className="font-semibold">
                                        {(
                                            (productData?.price || 0) +
                                            (productData?.wageType === 'Fixed'
                                                ? productData?.wage
                                                : productData?.wageType === 'Percent'
                                                    ? (productData?.price || 0) * (productData?.wage / 100)
                                                    : 0)
                                        ).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                    </span><span>تومان</span>
                                    </div>
                                </div> : <div className="flex gap-x-1">
                                    <span className="text-primary-gray">اجرت:</span>
                                    <div className="flex gap-x-1"><span className="font-semibold">
                                        {(productData?.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })}</span><span>تومان</span>
                                    </div>
                                </div>}
                                {expanded ? <div className="flex gap-x-1">
                                    <span className="text-primary-gray">هزینه بعد از تخفیف:</span>
                                    <div className="flex gap-x-1 text-primary-green"><span className=" font-semibold">
                                        {(finalDiscount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span><span>تومان</span>
                                    </div>
                                </div> : ''}
                                <div className="flex gap-x-1">
                                    <span className="text-primary-gray">تعداد موجود:</span>
                                    <div className="flex gap-x-1">
                                        {productData?.stock > 0 ? <>
                                            <span className="font-semibold">
                                                {(productData?.stock || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                            <span>عدد
                                            </span>
                                        </> :
                                            <span className="text-primary-red font-semibold">ناموجود</span>
                                        }
                                    </div>
                                </div>
                                {productData?.price ? <span className="dark:text-white text-sm font-medium text-center mt-2">هزینه محصول پس از تائید مدیریت از حساب شما کسر خواهد شد.</span> :
                                    <span className="dark:text-white text-sm font-medium text-center mt-2">مقدار و اجرت محصول پس از تائید مدیریت از حساب شما کسر خواهد شد.</span>}
                            </div>
                            <div className="w-full flex items-center justify-between gap-x-8 text-primary relative mt-4">
                                {productData?.stock > 0 ? <div className="base-NumberInput-root flex items-center gap-x-1 rounded-lg border border-solid border-primary py-1.5">
                                    <IconButton className="base-NumberInput decrement flex items-center justify-center p-0.5 bg-transparent border-none text-primary *:text-xl"
                                        onClick={handleNumberInputBtn('decrement')}>
                                        <RemoveIcon />
                                    </IconButton>
                                    <input type="number" min="1" max="10" autocomplete="off" autocorrect="off" spellcheck="false"
                                        className="bg-transparent border-none dark:text-white !outline-none text-center"
                                        value={productAmount} onChange={handleChangeAmount} />
                                    <IconButton className="base-NumberInput increment flex items-center justify-center p-0.5 bg-transparent border-none text-primary *:text-xl"
                                        onClick={handleNumberInputBtn('increment')}>
                                        <AddIcon />
                                    </IconButton>
                                </div> : <div></div>}
                                {productData?.stock > 0 ? <FormControl className="w-full">
                                    {/* <label htmlFor="refferal" className="text-gold cursor-pointer" onClick={discountSec}>کد تخفیف دارید؟
                                        <IconButton
                                            color={darkModeToggle ? 'white' : 'black'}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="23" viewBox="0 0 22 23" fill="none"
                                                className={`w-4 h-4 transition ${discountCode ? 'rotate-180' : ''}`}>
                                                <path d="M21.9662 10.62C21.5431 5.25538 17.2446 0.956924 11.88 0.533847C11.5923 0.516924 11.2877 0.5 11 0.5C4.92462 0.5 0 5.42462 0 11.5C0 17.5754 4.92462 22.5 11 22.5C17.0754 22.5 22 17.5754 22 11.5C22 11.2123 21.9831 10.9077 21.9662 10.62ZM12.4892 12.9892L11 15.7308L9.51077 12.9892L6.76923 11.5L9.51077 10.0108L11 7.26923L12.4892 10.0108L15.2308 11.5L12.4892 12.9892Z" fill="#F8CA67" />
                                            </svg>
                                        </IconButton>
                                    </label> */}
                                    <TextField
                                        className={`discount-code`}
                                        type="text"
                                        color="primary"
                                        label="کد تخفیف را در صورت داشتن وارد نمائید"
                                        variant="outlined"
                                        InputLabelProps={{
                                            classes: { root: '-my-2', focused: 'my-0', filled: 'my-0' },
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { input: darkModeToggle ? 'text-white text-end' : 'text-black text-end', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '8px' },
                                            inputProps: { className: 'ltr py-2' },
                                            endAdornment: <IconButton
                                                color={`${darkModeToggle ? 'white' : 'black'}`}
                                                onClick={checkDiscount(productData?._id)}>
                                                {discountLoading ? <div className="flex justify-center items-center"><CircularProgress size={20} color={darkModeToggle ? 'white' : 'black'} /></div> : <ArrowCircleLeftIcon className="ltr:rotate-180" />}
                                            </IconButton>
                                        }}
                                        // value={discountCode}
                                        onChange={(event) => setDiscountCode(event.target.value)} />
                                </FormControl> : ''}
                                {productData?.stock > 0 ? <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                    onClick={handleShowFactor}>
                                    <text className="text-black font-semibold">ادامه</text>
                                </Button> : <Button type="submit" variant="outlined" size="medium" color="error" className="rounded-lg pointer-events-none *:text-primary-red px-10" disableElevation>
                                    <span>ناموجود</span>
                                </Button>}
                            </div>
                        </div> :
                        <form className="flex flex-col items-center gap-y-2" noValidate autoComplete="off" onSubmit={handleSubmit(handleShowFactor)}>
                            <p className="text-justify whitespace-pre-line mt-0">{productData?.description}</p>
                            <div className={`flex flex-col items-center gap-y-4 border border-solid border-primary rounded-lg p-6 
                            ${productTradeableBalance == 0 ? 'opacity-40 pointer-events-none' : ''} `}>
                                <div className="text-xl text-center">می‌خواهید چه میزان از محصول خود را دریافت کنید؟</div>
                                <FormControl className="w-3/5">
                                    <Controller
                                        name="amountOrCount"
                                        control={control}
                                        render={({ field }) => (
                                            <NumericFormat
                                                {...field}
                                                thousandSeparator
                                                decimalScale={productData?.maxDecimals ?? 3}
                                                allowNegative={false}
                                                customInput={TextField}
                                                type="tel"
                                                label="مقدار محصول"
                                                variant="outlined"
                                                error={!!errors.amountOrCount}
                                                helperText={(errors.amountOrCount ? errors.amountOrCount.message : '')}
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
                                                value={productAmount}
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    handleAmountChange(event);
                                                }} />
                                        )}
                                    />
                                </FormControl>
                                <Slider className="gold" valueLabelFormat={(value) => {
                                    return (value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })
                                }} value={sliderValue} step={1} marks={marks} min={0} max={100} valueLabelDisplay="auto" disabled={productTradeableBalance == 0}
                                    onChange={calcAmountSlider} />
                            </div>
                            <div className="w-full flex items-center justify-end gap-x-2 mt-4">
                                {(productTradeableBalance || 0) < (productData?.minDeliverableAmount || 0) ? <span className="text-primary-red font-medium">موجودی محصول شما کمتر از {(productData?.minDeliverableAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم است</span> :
                                    <span className="dark:text-white text-sm font-medium">مقدار درخواستی پس از تائید مدیریت از حساب شما کسر خواهد شد.</span>}
                                {productTradeableBalance >= (productData?.minDeliverableAmount || 0) ?
                                    <Button type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation>
                                        <text className="text-black font-semibold">ادامه</text>
                                    </Button> : <LinkRouter legacyBehavior href={`/panel/trade?type=buy&tradeable=${productData?.tradeable?.name}`}>
                                        <Button href={`/panel/trade?type=buy&tradeable=${productData?.tradeable?.name}`} variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                            <text className="text-black font-semibold">خرید محصول</text>
                                        </Button >
                                    </LinkRouter>}
                            </div>
                        </form>}
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomOrderDrawer}
                    onClose={() => setOpenBottomOrderDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6 mb-4">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2"><span></span>
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomOrderDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    {dialogType == 'coin' ?
                        <div className="flex flex-col items-center gap-y-2">
                            <div className="flex flex-col items-center gap-4">
                                <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${productData?.image}`} alt={productData?.slug}
                                    className="mb-3 rounded-xl object-contain w-full h-[200px] " loading="lazy" />
                                <span className="text-xl font-bold mb-2">{productData?.name}</span>
                                <p className="w-full text-justify whitespace-pre-line mt-0">{productData?.description}</p>
                            </div>
                            <Divider component="div" className="w-full mb-4 dark:bg-primary dark:bg-opacity-50" />
                            <div className="w-full text-start flex flex-col gap-y-1">
                                <div className="flex gap-x-1">
                                    <span className="text-primary-gray">وزن:</span> <span className="font-semibold">
                                        {(productData?.weight || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })}</span><span>گرم</span>
                                </div>
                                <div className="flex gap-x-1">
                                    <span className="text-primary-gray">عیار:</span><span className="font-semibold">{productData?.carat}</span>
                                </div>
                                {productData?.price ? <div className="flex gap-x-1">
                                    <span className="text-primary-gray">قیمت:</span>
                                    <div className="flex gap-x-1"><span className="font-semibold">
                                        {(
                                            (productData?.price || 0) +
                                            (productData?.wageType === 'Fixed'
                                                ? productData?.wage
                                                : productData?.wageType === 'Percent'
                                                    ? (productData?.price || 0) * (productData?.wage / 100)
                                                    : 0)
                                        ).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                    </span><span>تومان</span>
                                    </div>
                                </div> : <div className="flex gap-x-1">
                                    <span className="text-primary-gray">اجرت:</span>
                                    <div className="flex gap-x-1"><span className="font-semibold">
                                        {(productData?.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })}</span><span>تومان</span>
                                    </div>
                                </div>}
                                {expanded ? <div className="flex gap-x-1">
                                    <span className="text-primary-gray">هزینه بعد از تخفیف:</span>
                                    <div className="flex gap-x-1"><span className="font-semibold">
                                        {(finalDiscount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span><span>تومان</span>
                                    </div>
                                </div> : ''}
                                <div className="flex gap-x-1">
                                    <span className="text-primary-gray">تعداد موجود:</span>
                                    <div className="flex gap-x-1">
                                        {productData?.stock > 0 ? <>
                                            <span className="font-semibold">
                                                {(productData?.stock || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                            <span>عدد
                                            </span>
                                        </> :
                                            <span className="text-primary-red font-semibold">ناموجود</span>
                                        }
                                    </div>
                                </div>
                                {productData?.price ? <span className="dark:text-white text-sm font-medium text-center mt-2">هزینه محصول پس از تائید مدیریت از حساب شما کسر خواهد شد.</span> :
                                    <span className="dark:text-white text-sm font-medium text-center mt-2">مقدار و اجرت محصول پس از تائید مدیریت از حساب شما کسر خواهد شد.</span>}
                            </div>
                            <div className="w-full mt-4">
                                {productData?.stock > 0 ? <FormControl className="w-full">
                                    <TextField
                                        className={`discount-code`}
                                        type="text"
                                        color="primary"
                                        label="کد تخفیف را در صورت داشتن وارد نمائید"
                                        variant="outlined"
                                        InputLabelProps={{
                                            classes: { root: '-my-1', focused: 'my-1', filled: 'my-1' },
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { input: darkModeToggle ? 'text-white text-end' : 'text-black text-end', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '8px' },
                                            inputProps: { className: 'ltr py-4' },
                                            endAdornment: <IconButton
                                                color={`${darkModeToggle ? 'white' : 'black'}`}
                                                onClick={checkDiscount(productData?._id)}>
                                                {discountLoading ? <div className="flex justify-center items-center"><CircularProgress size={20} color={darkModeToggle ? 'white' : 'black'} /></div> : <ArrowCircleLeftIcon className="ltr:rotate-180" />}
                                            </IconButton>
                                        }}
                                        // value={discountCode}
                                        onChange={(event) => setDiscountCode(event.target.value)} />
                                </FormControl> : ''}
                            </div>
                            <div className="w-full flex items-center justify-between gap-x-1 text-primary relative mt-4">
                                {productData?.stock > 0 ? <div className="base-NumberInput-root flex items-center gap-x-1 rounded-lg border border-solid border-primary py-1">
                                    <IconButton className="base-NumberInput decrement flex items-center justify-center p-0.5 bg-transparent border-none text-primary *:text-xl"
                                        onClick={handleNumberInputBtn('decrement')}>
                                        <RemoveIcon />
                                    </IconButton>
                                    <input type="number" min="1" max="10" autocomplete="off" autocorrect="off" spellcheck="false"
                                        className="bg-transparent border-none dark:text-white !outline-none text-center"
                                        value={productAmount} onChange={handleChangeAmount} />
                                    <IconButton className="base-NumberInput increment flex items-center justify-center p-0.5 bg-transparent border-none text-primary *:text-xl"
                                        onClick={handleNumberInputBtn('increment')}>
                                        <AddIcon />
                                    </IconButton>
                                </div> : <div></div>}
                                {productData?.stock > 0 ? <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                    onClick={handleShowFactor}>
                                    <text className="text-black font-semibold">ادامه</text>
                                </Button> : <Button type="submit" variant="outlined" size="medium" color="error" className="rounded-lg pointer-events-none *:text-primary-red px-10" disableElevation>
                                    <span>ناموجود</span>
                                </Button>}
                            </div>
                        </div> :
                        <form className="flex flex-col items-center gap-y-2" noValidate autoComplete="off" onSubmit={handleSubmit(handleShowFactor)}>
                            <p className="text-justify whitespace-pre-line mt-0">{productData?.description}</p>
                            <div className={`flex flex-col items-center gap-y-4 border border-solid border-primary rounded-lg p-6 
                            ${productTradeableBalance == 0 ? 'opacity-40 pointer-events-none' : ''} `}>
                                <div className="text-xl text-center">می‌خواهید چه میزان از محصول خود را دریافت کنید؟</div>
                                <FormControl className="w-full">
                                    <Controller
                                        name="amountOrCount"
                                        control={control}
                                        render={({ field }) => (
                                            <NumericFormat
                                                {...field}
                                                thousandSeparator
                                                decimalScale={productData?.maxDecimals ?? 3}
                                                allowNegative={false}
                                                customInput={TextField}
                                                type="tel"
                                                label="مقدار محصول"
                                                variant="outlined"
                                                error={!!errors.amountOrCount}
                                                helperText={(errors.amountOrCount ? errors.amountOrCount.message : '')}
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
                                                value={productAmount}
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    handleAmountChange(event);
                                                }} />
                                        )}
                                    />
                                </FormControl>
                                <Slider className="gold" valueLabelFormat={(value) => {
                                    return (value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })
                                }} value={sliderValue} step={1} marks={marks} min={0} max={100} valueLabelDisplay="auto" disabled={productTradeableBalance == 0}
                                    onChange={calcAmountSlider} />
                            </div>
                            <div className="w-full flex items-center justify-end gap-x-2 mt-4">
                                {(productTradeableBalance || 0) < (productData?.minDeliverableAmount || 0) ? <span className="text-primary-red font-medium">موجودی محصول شما کمتر از {(productData?.minDeliverableAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم است</span> :
                                    <span className="dark:text-white text-sm font-medium">مقدار درخواستی پس از تائید مدیریت از حساب شما کسر خواهد شد.</span>}
                                {productTradeableBalance >= (productData?.minDeliverableAmount || 0) ?
                                    <Button type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation>
                                        <text className="text-black font-semibold">ادامه</text>
                                    </Button> : <LinkRouter legacyBehavior href={`/panel/trade?type=buy&tradeable=${productData?.tradeable?.name}`}>
                                        <Button href={`/panel/trade?type=buy&tradeable=${productData?.tradeable?.name}`} variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                            <text className="text-black font-semibold">خرید محصول</text>
                                        </Button >
                                    </LinkRouter>}
                            </div>
                        </form>}
                </SwipeableDrawer>
            </>

            {/* Filter */}
            <SwipeableDrawer
                disableBackdropTransition={true}
                disableDiscovery={true}
                disableSwipeToOpen={true}
                allowSwipeInChildren={true}
                anchor={'right'}
                variant="temporary"
                open={openBottomFilterDrawer}
                onClose={() => setOpenBottomFilterDrawer(false)}
                PaperProps={{ className: 'drawers block rounded-none', sx: { width: { xs: '90%', sm: '300px' }, flexShrink: 0 } }}
                ModalProps={{
                    keepMounted: false,
                }}
            >
                <div className="flex flex-col gap-y-8">
                    <div className="flex justify-between items-center gap-5">
                        <div className="flex items-start">
                            <IconButton color={`${darkModeToggle ? 'white' : 'black'}`} onClick={() => setOpenBottomFilterDrawer(false)}>
                                <CloseIcon />
                            </IconButton>
                        </div>
                        <span className="text-2xl font-medium">فیلترها</span>
                        <div>
                            {hasFilterType || hasFilterWeight ? (
                                <Button
                                    variant="text"
                                    size="medium"
                                    color="error"
                                    className="rounded-lg"
                                    disableElevation
                                    onClick={handleRemoveFilter('all')}
                                >
                                    <text className=" font-semibold">حذف همه</text>
                                </Button>
                            ) : (
                                <Button variant="text" size="medium" color="error" className="rounded-lg invisible" disableElevation>
                                    <text className=" font-semibold">حذف همه</text>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="border border-primary-gray border-solid border-opacity-50"></div>
                    <div className="flex flex-col gap-y-4">
                        <div className="flex items-center justify-between font-semibold text-xl text-secondary-gray">
                            <span>وزن (گرم)</span>
                            {hasFilterWeight ? (
                                <Button
                                    variant="text"
                                    size="medium"
                                    color="error"
                                    className="rounded-lg"
                                    disableElevation
                                    onClick={handleRemoveFilter('weight')}
                                >
                                    <text className=" font-semibold">حذف</text>
                                </Button>
                            ) : (
                                <Button variant="text" size="medium" color="error" className="rounded-lg invisible" disableElevation>
                                    <text className=" font-semibold">حذف </text>
                                </Button>
                            )}
                        </div>
                        <div onTouchStart={(event) => event.stopPropagation()}>
                            <Slider className="gold" value={weightSlider} min={0} max={100} valueLabelDisplay="auto" onChange={handleFilter('weight', '')} />
                        </div>
                    </div>

                    {tradeables?.length > 0 ? (
                        <>
                            <div className="border border-primary-gray border-solid border-opacity-50"></div>
                            <div className="flex flex-col gap-y-4">
                                <div className="flex items-center justify-between font-semibold text-xl text-secondary-gray">
                                    <span>واحد قابل معامله</span>
                                    {hasFilterType ? (
                                        <Button
                                            variant="text"
                                            size="medium"
                                            color="error"
                                            className="rounded-lg"
                                            disableElevation
                                            onClick={handleRemoveFilter('type')}
                                        >
                                            <span className="font-semibold">حذف</span>
                                        </Button>
                                    ) : (
                                        <Button variant="text" size="medium" color="error" className="rounded-lg invisible" disableElevation>
                                            <span className="font-semibold">حذف</span>
                                        </Button>
                                    )}
                                </div>
                                <FormGroup>
                                    {tradeables?.map((data, index) => (
                                        <FormControlLabel
                                            key={data._id}
                                            control={
                                                <Checkbox
                                                    sx={{ color: 'gray' }}
                                                    checked={filters[data.name] || false}
                                                    onChange={handleFilter('type', data.name)}
                                                />
                                            }
                                            label={data.nameFa}
                                        />
                                    ))}
                                </FormGroup>
                            </div>
                        </>
                    ) : ''}

                </div>
            </SwipeableDrawer>

            {/* Withdraw Error */}
            <>
                <Dialog onClose={() => setShowWithdrawError(false)} open={showWithdrawError} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowWithdrawError(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                    </div>
                    <div className="flex flex-col gap-y-4 mt-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="51" height="51" viewBox="0 0 51 51" fill="none" className="w-16 h-16 text-primary-red mx-auto mb-4">
                            <path d="M25.4989 37.7917C26.0732 37.7917 26.555 37.5975 26.9442 37.209C27.3335 36.8205 27.5281 36.339 27.5281 35.7647C27.5281 35.1904 27.3338 34.7086 26.9453 34.3194C26.5568 33.9301 26.0754 33.7355 25.5011 33.7355C24.9267 33.7355 24.4449 33.9297 24.0557 34.3182C23.6665 34.7068 23.4718 35.1882 23.4718 35.7625C23.4718 36.3369 23.6661 36.8187 24.0546 37.2079C24.4431 37.5971 24.9245 37.7917 25.4989 37.7917ZM23.8406 28.3886H27.5281V12.8397H23.8406V28.3886ZM25.5163 50.0834C22.1265 50.0834 18.9409 49.4381 15.9595 48.1475C12.9782 46.8569 10.371 45.095 8.13798 42.8621C5.90499 40.6291 4.14319 38.0204 2.85256 35.0359C1.56194 32.0515 0.916626 28.8626 0.916626 25.4694C0.916626 22.0761 1.56194 18.8872 2.85256 15.9028C4.14319 12.9184 5.90499 10.3199 8.13798 8.10737C10.371 5.89487 12.9797 4.14331 15.9641 2.85269C18.9486 1.56206 22.1374 0.916748 25.5307 0.916748C28.924 0.916748 32.1128 1.56206 35.0972 2.85269C38.0817 4.14331 40.6802 5.89487 42.8927 8.10737C45.1052 10.3199 46.8567 12.9216 48.1474 15.9126C49.438 18.9036 50.0833 22.0939 50.0833 25.4837C50.0833 28.8735 49.438 32.0591 48.1474 35.0405C46.8567 38.0219 45.1052 40.6253 42.8927 42.8507C40.6802 45.0762 38.0784 46.838 35.0875 48.1362C32.0965 49.4343 28.9061 50.0834 25.5163 50.0834Z" fill="currentColor" />
                        </svg>
                        <p className="text-center">
                            تراکنش درخواست شده بیش از موجودی شما می باشد. لطفا مبلغ {(errorWithdrawError?.neededAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان به حساب خود اضافه کنید.
                        </p>
                        <div className="flex items-center justify-center gap-x-2">
                            <LinkRouter legacyBehavior href={`/panel/deposit?type=online&amount=${errorWithdrawError?.neededAmount}`}>
                                <Button href={`/panel/deposit?type=online&amount=${errorWithdrawError?.neededAmount}`} variant="contained" size="medium" className="rounded-lg" disableElevation
                                    onClick={() => setShowWithdrawError(false)}>
                                    <text className="text-black font-semibold">افزایش موجودی</text>
                                </Button >
                            </LinkRouter>
                        </div>
                    </div>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomWithdrawErrorDrawer}
                    onClose={() => setOpenBottomWithdrawErrorDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomWithdrawErrorDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                    </div>
                    <div className="flex flex-col gap-y-4 mt-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="51" height="51" viewBox="0 0 51 51" fill="none" className="w-16 h-16 text-primary-red mx-auto mb-4">
                            <path d="M25.4989 37.7917C26.0732 37.7917 26.555 37.5975 26.9442 37.209C27.3335 36.8205 27.5281 36.339 27.5281 35.7647C27.5281 35.1904 27.3338 34.7086 26.9453 34.3194C26.5568 33.9301 26.0754 33.7355 25.5011 33.7355C24.9267 33.7355 24.4449 33.9297 24.0557 34.3182C23.6665 34.7068 23.4718 35.1882 23.4718 35.7625C23.4718 36.3369 23.6661 36.8187 24.0546 37.2079C24.4431 37.5971 24.9245 37.7917 25.4989 37.7917ZM23.8406 28.3886H27.5281V12.8397H23.8406V28.3886ZM25.5163 50.0834C22.1265 50.0834 18.9409 49.4381 15.9595 48.1475C12.9782 46.8569 10.371 45.095 8.13798 42.8621C5.90499 40.6291 4.14319 38.0204 2.85256 35.0359C1.56194 32.0515 0.916626 28.8626 0.916626 25.4694C0.916626 22.0761 1.56194 18.8872 2.85256 15.9028C4.14319 12.9184 5.90499 10.3199 8.13798 8.10737C10.371 5.89487 12.9797 4.14331 15.9641 2.85269C18.9486 1.56206 22.1374 0.916748 25.5307 0.916748C28.924 0.916748 32.1128 1.56206 35.0972 2.85269C38.0817 4.14331 40.6802 5.89487 42.8927 8.10737C45.1052 10.3199 46.8567 12.9216 48.1474 15.9126C49.438 18.9036 50.0833 22.0939 50.0833 25.4837C50.0833 28.8735 49.438 32.0591 48.1474 35.0405C46.8567 38.0219 45.1052 40.6253 42.8927 42.8507C40.6802 45.0762 38.0784 46.838 35.0875 48.1362C32.0965 49.4343 28.9061 50.0834 25.5163 50.0834Z" fill="currentColor" />
                        </svg>
                        <p className="text-center">
                            تراکنش درخواست شده بیش از موجودی شما می باشد. لطفا مبلغ {(errorWithdrawError?.neededAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان به حساب خود اضافه کنید.
                        </p>
                        <LinkRouter legacyBehavior href={`/panel/deposit?type=online&amount=${errorWithdrawError?.neededAmount}`}>
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                onClick={() => setOpenBottomWithdrawErrorDrawer(false)}>
                                <text className="text-black font-semibold">افزایش موجودی</text>
                            </Button >
                        </LinkRouter>
                    </div>
                </SwipeableDrawer>
            </>

        </div >
    )
}

export default OrderPageCompo;