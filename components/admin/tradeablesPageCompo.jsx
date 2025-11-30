import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import CircularProgress from '@mui/material/CircularProgress'
import Pagination from '@mui/material/Pagination';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import { useTheme } from '@mui/material/styles';
import AddCircleIcon from '@mui/icons-material/AddCircle'
import CancelIcon from '@mui/icons-material/CancelOutlined'
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import MUISelect from '@mui/material/Select'
import moment from 'jalali-moment'

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
import FilterEmptyFields from "../../services/filterEmptyFields"
import FilterObjectFields from "../../services/filterObjectFields"

// Components
import CustomSwitch from "../shared/CustomSwitch"
import ConfirmDialog from '../shared/ConfirmDialog';

/**
 * TradeablesPageCompo component that displays the Tradeables Page Component of the website.
 * @returns The rendered Tradeables Page component.
 */
const TradeablesPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, priceInfo, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);

    const TRADEABLES_TABLE_HEAD = [
        {
            label: 'نام واحد',
            classes: ""
        },
        {
            label: 'تاریخ ثبت',
            classes: ""
        },
        {
            label: 'جزئیات',
            classes: ""
        },
        {
            label: '',
            classes: ""
        },
    ]

    const [pageItem, setPageItem] = useState(1);
    useEffect(() => {
        getTradeables();
    }, [pageItem]);

    /**
         * Retrieves Tradeables list.
         * @returns None
        */
    const [tradeables, setTradeables] = useState([]);
    const [loadingTradeables, setLoadingTradeables] = useState(true);
    const [tradeablesLimit, setTradeablesLimit] = useState(10);
    const [tradeablesTotal, setTradeablesTotal] = useState(0);
    const getTradeables = () => {
        setLoadingTradeables(true);
        ApiCall('/tradeable', 'GET', locale, {}, `limit=${tradeablesLimit}&skip=${(pageItem * tradeablesLimit) - tradeablesLimit}&sortBy=createdAt&sortOrder=0`, 'admin', router).then(async (result) => {
            setTradeablesTotal(result.count);
            setTradeables(result.data);
            setLoadingTradeables(false);
        }).catch((error) => {
            setLoadingTradeables(false);
            console.log(error);
        });
    }

    const [showAddTradeable, setShowAddTradeable] = useState(false);
    const [openBottomAddTradeableDrawer, setOpenBottomAddTradeableDrawer] = useState(false);
    const handleShowAddTradeable = () => {
        if (window.innerWidth >= 1024) {
            setShowAddTradeable(true);
            setOpenBottomAddTradeableDrawer(false);
        } else {
            setShowAddTradeable(false);
            setOpenBottomAddTradeableDrawer(true);
        }
    }

    const [tradeableData, setTradeableData] = useState();
    const [tradeableHasChart, setTradeableHasChart] = useState(false);
    const [showEditTradeable, setShowEditTradeable] = useState(false);
    const [openBottomEditTradeableDrawer, setOpenBottomEditTradeableDrawer] = useState(false);
    const handleShowEditTradeable = (data) => () => {
        setTradeableData(data);
        setTradeableHasChart(data.chartLink && data.chartLink != 'disable' ? true : false);
        if (window.innerWidth >= 1024) {
            setShowEditTradeable(true);
            setOpenBottomEditTradeableDrawer(false);
        } else {
            setShowEditTradeable(false);
            setOpenBottomEditTradeableDrawer(true);
        }
    }

    /**
     * Handles the change event for Adding Tradeables inputs.
     * @param {string} input - The name of the input field being changed.
     * @param {string} type - The type of the input field.
     * @param {Event} event - The change event object.
     * @returns None
     */
    const [addTradeable, setAddTradeable] = useState(
        {
            name: '',
            nameFa: '',
            priceApi: '',
            pricePathInApi: '',
            priceApiMethod: 'GET',
            priceApiHeaders: [],
            image: '',
            isToman: true,
            minBuyAmount: '',
            minSellAmount: '',
            onlinePriceUpdate: true,
            ignoreApiError: true,
            stock: '',
            stockThreshold: '',
            buyMaxDecimals: '',
            sellMaxDecimals: '',
            referrerRewardPercent: '',
            transferMaxDecimals: '',
            chartLink: '',
            wallgoldIntegrationIsActive: false,
            enableZarbahaApi: false
        }
    )
    const priceMethods = [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'PATCH', label: 'PATCH' }
    ]
    const [isChartEnable, setIsChartEnable] = useState(false);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('این فیلد الزامی است'),
        nameFa: Yup.string().required('این فیلد الزامی است'),
        stock: Yup.string().required('این فیلد الزامی است'),
        stockThreshold: Yup.string().required('این فیلد الزامی است'),
        priceApi: Yup.string().when("onlinePriceUpdate", {
            is: true,
            then: (schema) => schema.required('این فیلد الزامی است').url('این فیلد باید یک لینک معتبر باشد'),
            otherwise: (schema) => schema.optional(),
        }),
        pricePathInApi: Yup.string().when("onlinePriceUpdate", {
            is: true,
            then: (schema) => schema.required('این فیلد الزامی است'),
            otherwise: (schema) => schema.optional(),
        }),
        priceApiMethod: Yup.string().required('این فیلد الزامی است'),
        image: Yup.string().required('این فیلد الزامی است'),
        minBuyAmount: Yup.string().required('این فیلد الزامی است'),
        minSellAmount: Yup.string().required('این فیلد الزامی است'),
        buyMaxDecimals: Yup.string().required('این فیلد الزامی است'),
        sellMaxDecimals: Yup.string().required('این فیلد الزامی است'),
        referrerRewardPercent: Yup.string().required('این فیلد الزامی است'),
        transferMaxDecimals: Yup.string().required('این فیلد الزامی است'),
        priceApiHeaders: Yup.array().of(
            Yup.object().shape({
                key: Yup.string()
                    .required('این فیلد الزامی است'),
                value: Yup.string()
                    .required('این فیلد الزامی است')
            })
        ),
        price: Yup.string().when("onlinePriceUpdate", {
            is: false,
            then: schema => schema.required('این فیلد الزامی است'),
            otherwise: schema => schema.optional(),
        }),
        onlinePriceUpdate: Yup.boolean(),
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            priceApiMethod: 'GET',
            onlinePriceUpdate: true,
        }
    });

    const clearForm = () => {
        setValue('name', '');
        setValue('nameFa', '');
        setValue('priceApi', '');
        setValue('pricePathInApi', '');
        setValue('priceApiMethod', 'GET');
        setValue('image', '');
        setValue('minBuyAmount', '');
        setValue('minSellAmount', '');
        setValue('onlinePriceUpdate', true);
        setValue('stock', '');
        setValue('stockThreshold', '');
        setValue('buyMaxDecimals', '');
        setValue('sellMaxDecimals', '');
        setValue('referrerRewardPercent', '');
        setValue('transferMaxDecimals', '');
    }

    const handleChangeAddData = (event, input, type) => {
        let value;
        switch (type) {
            case "checkbox":
                value = event.target.checked;
                break;
            case "numberFormat":
                value = Number(event.target.value.replace(/,/g, ''));
                break;
            default:
                value = event.target.value;
                break;
        }
        setAddTradeable((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
     * Handles the change event for Eding Tradeables inputs.
     * @param {string} input - The name of the input field being changed.
     * @param {string} type - The type of the input field.
     * @param {Event} event - The change event object.
     * @returns None
     */
    const handleChangeEditData = (input, type) => (event) => {
        let value;
        switch (type) {
            case "checkbox":
                value = event.target.checked;
                break;
            case "numberFormat":
                value = Number(event.target.value.replace(/,/g, ''));
                break;
            case "priceApi":
                value = event.target.value;
                if (/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(event.target.value)) {
                    setPriceApiError(false);
                } else {
                    setPriceApiError(true);
                }
                break;
            default:
                value = event.target.value;
                break;
        }
        setTradeableData((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    const [isDisabled, setIsDisabled] = useState(false);
    const openItemImageFile = (event) => {
        if (!isDisabled) {
            document.querySelector('input#ItemPic').click();
        }
    }

    /**
     * Uploads an Item Image asynchronously.
     * @param {{File}} file - The Image file to upload.
     * @returns None
     * @throws Any error that occurs during the upload process.
     */
    const [imageLoading, setImageLoading] = useState(false);
    const uploadItemImage = (type) => (event) => {
        try {
            if (event.target.files && event.target.files[0]) {
                setImageLoading(true);
                setIsDisabled(true);
                let file = new FormData();
                file.append("file", event.target.files[0]);
                ApiCall('/upload', 'POST', locale, file, '', 'admin', router, true).then(async (result) => {
                    setImageLoading(false);
                    setIsDisabled(false);
                    if (type == 'add') {
                        setAddTradeable({ ...addTradeable, image: result.fileUrl });
                        setValue('image', result.fileUrl)
                    } else {
                        setTradeableData({ ...tradeableData, image: result.fileUrl });
                    }
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: langText('Global.Success'),
                            type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                }).catch((error) => {
                    setImageLoading(false);
                    setIsDisabled(false);
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

        } catch (error) {
            setImageLoading(false);
            setIsDisabled(false);
            console.log(error);
        }
    }

    /**
     * Add A Tradeable.
     * @returns None
    */
    const saveTradeable = () => {
        let newData = FilterEmptyFields(addTradeable);
        setLoading(true);
        ApiCall('/tradeable', 'POST', locale, { ...newData, price: 1 }, '', 'admin', router).then(async (result) => {
            setLoading(false);
            setShowAddTradeable(false);
            setOpenBottomAddTradeableDrawer(false);
            setAddTradeable({
                name: '',
                nameFa: '',
                priceApi: '',
                pricePathInApi: '',
                priceApiMethod: 'GET',
                priceApiHeaders: [],
                image: '',
                isToman: true,
                minBuyAmount: '',
                minSellAmount: '',
                onlinePriceUpdate: true,
                ignoreApiError: true,
                stock: '',
                stockThreshold: '',
                buyMaxDecimals: '',
                sellMaxDecimals: '',
                referrerRewardPercent: '',
                transferMaxDecimals: '',
                chartLink: '',
                wallgoldIntegrationIsActive: false,
                enableZarbahaApi: false
            });
            clearForm();
            setValue('priceApiHeaders', []);
            getTradeables();
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.SuccessRequest'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
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

    const validatePriceApiHeaders = (headers) => {
        const errors = [];

        headers?.forEach((header, index) => {
            const headerErrors = {};

            if (!header?.key) {
                headerErrors.key = 'این فیلد الزامی است';
            }

            if (!header?.value) {
                headerErrors.value = 'این فیلد الزامی است';
            }

            if (Object.keys(headerErrors)?.length > 0) {
                errors[index] = headerErrors;
            }
        });

        return errors.length > 0 ? errors : null;
    }

    /**
     * Edit A Tradeable.
     * @returns None
    */
    const [priceApiError, setPriceApiError] = useState(false);
    const [priceHeadersErrors, setPriceHeadersErrors] = useState([]);
    const editTradeable = (tradeableId) => (event) => {
        event.preventDefault();

        const headerErrors = validatePriceApiHeaders(tradeableData.priceApiHeaders || []);

        if (headerErrors && tradeableData?.onlinePriceUpdate) {
            setPriceHeadersErrors((prevErrors) => ({
                ...prevErrors,
                priceApiHeaders: headerErrors,
            }));
            return;
        } else {
            setPriceHeadersErrors((prevErrors) => ({
                ...prevErrors,
                priceApiHeaders: null,
            }));
        }

        if ((!tradeableData?.onlinePriceUpdate || (/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(tradeableData?.priceApi)))) {
            setLoading(true);
            const { priceApiHeaders, ...tradeableDataWithoutHeaders } = tradeableData;
            let newData = FilterEmptyFields(tradeableDataWithoutHeaders);
            const filteredData = FilterObjectFields(newData, [
                "name",
                "nameFa",
                "priceApi",
                "pricePathInApi",
                "priceApiMethod",
                "isToman",
                "price",
                "stock",
                "stockThreshold",
                "onlinePriceUpdate",
                "image",
                "minBuyAmount",
                "buyMaxDecimals",
                "minSellAmount",
                "sellMaxDecimals",
                "referrerRewardPercent",
                "ignoreApiError",
                "transferMaxDecimals",
                "chartLink",
                "wallgoldIntegrationIsActive",
                "enableZarbahaApi"
            ]);
            let body = {
                ...filteredData,
                ...(tradeableData?.onlinePriceUpdate && { priceApiHeaders: tradeableData?.priceApiHeaders })
            }

            ApiCall(`/tradeable/${tradeableId}`, 'PATCH', locale, { ...body }, '', 'admin', router).then(async (result) => {
                event.target.disabled = false;
                setLoading(false);
                setShowEditTradeable(false);
                setOpenBottomEditTradeableDrawer(false);
                setTradeableData();
                getTradeables();
                dispatch({
                    type: 'setSnackbarProps', value: {
                        open: true, content: langText('Global.SuccessRequest'),
                        type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                    }
                });
            }).catch((error) => {
                setLoading(false);
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
        } else {
            setPriceApiError(true);
        }
    }

    const [openDialog, setOpenDialog] = useState(false);
    const [tradeableId, setTradeableId] = useState('');
    const handleOpenDialog = (tradeableId) => (event) => {
        setTradeableId(tradeableId);
        setOpenDialog(true);
    }
    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    /**
        * Delete a Tradeable.
        * @returns None
    */
    const [deleteLoading, setDeleteLoading] = useState(false);
    const deleteTradeable = () => {
        setDeleteLoading(true);
        ApiCall(`/tradeable/${tradeableId}`, 'DELETE', locale, {}, '', 'admin', router).then(async (result) => {
            setDeleteLoading(false);
            getTradeables();
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
            handleCloseDialog();
        }).catch((error) => {
            setDeleteLoading(false);
            console.log(error);
            handleCloseDialog();
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
    * change Status for a Tradeable.
    * @returns None
   */
    // const [changeStatusTradeableLoading, setChangeStatusTradeableLoading] = useState(false);
    // const changeStatusTradeable = (tradeableId, isActive) => (event) => {
    //     event.preventDefault();
    //     setChangeStatusTradeableLoading(true);
    //     event.target.disabled = true;
    //     ApiCall(``, 'PATCH', locale, { isActive }, '', 'admin', router).then(async (result) => {
    //         event.target.disabled = false;
    //         setChangeStatusTradeableLoading(false);
    //         getTradeables();
    //         dispatch({
    //             type: 'setSnackbarProps', value: {
    //                 open: true, content: langText('Global.Success'),
    //                 type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
    //             }
    //         });
    //     }).catch((error) => {
    //         setChangeStatusTradeableLoading(false);
    //         console.log(error);
    //         event.target.disabled = false;
    //         let list = '';
    //         error.message && typeof error.message == 'object' ? error.message.map(item => {
    //             list += `${item}<br />`
    //         }) : list = error.message;
    //         dispatch({
    //             type: 'setSnackbarProps', value: {
    //                 open: true, content: list,
    //                 type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
    //             }
    //         });
    //     });
    // }

    return (
        <div className="flex flex-col gap-y-8">
            <div className=" flex flex-col gap-y-8">
                <section className="flex items-center justify-between">
                    <h1 className="text-large-2">واحدهای قابل معامله</h1>
                    <div className="flex items-center gap-x-4">
                        <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation onClick={handleShowAddTradeable}>
                            <text className="text-black font-semibold">افزودن واحد</text>
                        </Button >
                    </div>
                </section>
                <span className="text-end mt-4 dark:text-white">تعداد کل: {loadingTradeables ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (tradeablesTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                <section>
                    {loadingTradeables ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : tradeables.length > 0 ?
                        <>
                            <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                                <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                    <TableHead className="dark:bg-dark">
                                        <TableRow>
                                            {TRADEABLES_TABLE_HEAD.map((data, index) => (
                                                <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
                                                    <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tradeables.map((data, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{ '&:last-child td': { border: 0 } }}
                                                className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                                <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                    <div className="flex items-center gap-x-4">
                                                        <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.image}`} alt={data.name}
                                                            className="w-10 h-10 rounded-[50%]" />
                                                        <span>{data.name} - {data.nameFa}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                    <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                        .locale('fa')
                                                        .format('jYYYY/jMM/jDD | HH:mm')}</span>

                                                </TableCell>
                                                <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                    <Button variant="text" size="medium" color="primary" className="rounded-lg" disableElevation
                                                        onClick={handleShowEditTradeable(data)}>
                                                        <text className=" font-semibold">ویرایش</text>
                                                    </Button >
                                                </TableCell>
                                                <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                    <Tooltip title="حذف واحد">
                                                        <IconButton
                                                            color={`error`}
                                                            onClick={handleOpenDialog(data._id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {Math.ceil(tradeablesTotal / tradeablesLimit) > 1 ?
                                <div className="text-center mt-4">
                                    <Pagination siblingCount={0} count={Math.ceil(tradeablesTotal / tradeablesLimit)} variant="outlined" color="primary" className="justify-center"
                                        page={pageItem} onChange={(event, value) => setPageItem(value)} />
                                </div>
                                : ''}
                            <ConfirmDialog
                                open={openDialog}
                                onClose={handleCloseDialog}
                                onConfirm={deleteTradeable}
                                title="آیا مطمئن هستید؟"
                                loading={deleteLoading}
                                darkModeToggle={darkModeToggle}
                            />
                        </>
                        : <div className="py-16">
                            <span className="block text-center text-large-1 text-primary-gray">واحدی تعریف نشده است.</span>
                        </div>}

                </section>
            </div>

            {/* AddTradeable */}
            <>
                <Dialog onClose={() => setShowAddTradeable(false)} open={showAddTradeable} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن واحد
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowAddTradeable(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate autoComplete="off" onSubmit={handleSubmit(saveTradeable)}>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="نام انگلیسی واحد (منحصر بفرد)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.name}
                                            helperText={errors.name ? errors.name.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'name', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="nameFa"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="نام فارسی واحد"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.nameFa}
                                            helperText={errors.nameFa ? errors.nameFa.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'nameFa', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className={`col-span-12 md:col-span-4`}>
                            <FormControl className="w-full">
                                <input type="file" id="ItemPic" className="hidden" onChange={uploadItemImage('add')} />
                                <Controller
                                    name="image"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            className="form-input cursor-default"
                                            disabled
                                            label="انتخاب تصویر واحد"
                                            InputLabelProps={{
                                                classes: { disabled: darkModeToggle ? '!text-white !text-opacity-70' : '!text-black !text-opacity-70' },
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                readOnly: true,
                                                endAdornment: <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={openItemImageFile}>
                                                    {addTradeable?.image ?
                                                        <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${addTradeable?.image}`} alt={addTradeable?.slug}
                                                            className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" className={darkModeToggle ? 'text-white' : 'text-black'}>
                                                            <path opacity="0.4" d="M16.19 2.5H7.82001C4.18001 2.5 2.01001 4.67 2.01001 8.31V16.68C2.01001 20.32 4.18001 22.49 7.82001 22.49H16.19C19.83 22.49 22 20.32 22 16.68V8.31C22 4.67 19.83 2.5 16.19 2.5Z" fill="currentColor" />
                                                            <path d="M12.2 17.8799C11.5 17.8799 10.79 17.6099 10.26 17.0799C9.74001 16.5599 9.45001 15.8699 9.45001 15.1399C9.45001 14.4099 9.74001 13.7099 10.26 13.1999L11.67 11.7899C11.96 11.4999 12.44 11.4999 12.73 11.7899C13.02 12.0799 13.02 12.5599 12.73 12.8499L11.32 14.2599C11.08 14.4999 10.95 14.8099 10.95 15.1399C10.95 15.4699 11.08 15.7899 11.32 16.0199C11.81 16.5099 12.6 16.5099 13.09 16.0199L15.31 13.7999C16.58 12.5299 16.58 10.4699 15.31 9.19994C14.04 7.92994 11.98 7.92994 10.71 9.19994L8.28998 11.6199C7.77998 12.1299 7.5 12.7999 7.5 13.5099C7.5 14.2199 7.77998 14.8999 8.28998 15.3999C8.57998 15.6899 8.57998 16.1699 8.28998 16.4599C7.99998 16.7499 7.51998 16.7499 7.22998 16.4599C6.43998 15.6699 6.01001 14.6199 6.01001 13.4999C6.01001 12.3799 6.43998 11.3299 7.22998 10.5399L9.65002 8.11992C11.5 6.26992 14.52 6.26992 16.37 8.11992C18.22 9.96992 18.22 12.9899 16.37 14.8399L14.15 17.0599C13.61 17.6099 12.91 17.8799 12.2 17.8799Z" fill="currentColor" />
                                                        </svg>}
                                                </IconButton>
                                            }}
                                            value={''}
                                            error={!!errors.image}
                                            helperText={errors.image ? errors.image.message : ''}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-4 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={addTradeable?.enableZarbahaApi}
                                        onChange={(event) => {
                                            setAddTradeable({ ...addTradeable, enableZarbahaApi: event.target.checked, onlinePriceUpdate: false });
                                            setValue('onlinePriceUpdate', false);
                                        }}
                                    />}
                                    label="گرفتن قیمت از زربها ؟"
                                />
                            </FormGroup>
                        </div>
                        {addTradeable?.enableZarbahaApi ? <div className={`col-span-12 md:col-span-4`}>
                            <FormControl className="w-full">
                                <Controller
                                    name="pricePathInApi"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="فیلد قیمت درون Api قیمت"
                                            placeholder="فروش هر گرم طلای 18 عیار"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.pricePathInApi}
                                            helperText={errors.pricePathInApi ? errors.pricePathInApi.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'pricePathInApi', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div> : ''}
                        <div className="col-span-12 md:col-span-4 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={addTradeable?.wallgoldIntegrationIsActive}
                                        onChange={(event) => {
                                            setAddTradeable({ ...addTradeable, wallgoldIntegrationIsActive: event.target.checked });
                                        }}
                                    />}
                                    label="ثبت معاملات در وال گلد ؟"
                                />
                            </FormGroup>
                        </div>
                        <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={isChartEnable}
                                        onChange={(event) => {
                                            setIsChartEnable(event.target.checked);
                                            if (event.target.checked) {
                                                setAddTradeable((prevState) => ({
                                                    ...prevState,
                                                    chartLink: ''
                                                }));
                                            } else {
                                                setAddTradeable((prevState) => ({
                                                    ...prevState,
                                                    chartLink: 'disable'
                                                }));
                                            }
                                        }}
                                    />}
                                    label="فعالسازی نمودار ؟" />
                            </FormGroup>
                        </div>
                        {isChartEnable ? <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="لینک نمودار"
                                    placeholder="https://widget.bitycle.com/fa/ac?market=GOLD18IRT"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    onChange={(event) => {
                                        field.onChange(event);
                                        handleChangeAddData(event, 'chartLink', 'text');
                                    }}
                                />
                            </FormControl>
                        </div> : <div className="col-span-12 md:col-span-6"></div>}
                        <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="stock"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            customInput={TextField}
                                            type="tel"
                                            label="موجودی انبار (به گرم)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.stock}
                                            helperText={errors.stock ? errors.stock.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'stock', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="transferMaxDecimals"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداکثر تعداد اعشار برای انتقال دارایی کاربر به کاربر"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.transferMaxDecimals}
                                            helperText={errors.transferMaxDecimals ? errors.transferMaxDecimals.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'transferMaxDecimals', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="stockThreshold"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداقل مقدار موجودی جهت ارسال پیام به مدیریت (به گرم)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.stockThreshold}
                                            helperText={errors.stockThreshold ? errors.stockThreshold.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'stockThreshold', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="referrerRewardPercent"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            customInput={TextField}
                                            type="tel"
                                            label="کمیسیون فرد معرف در معاملات خرید (به درصد)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.referrerRewardPercent}
                                            helperText={errors.referrerRewardPercent ? errors.referrerRewardPercent.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'referrerRewardPercent', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>

                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={addTradeable?.onlinePriceUpdate}
                                        onChange={(event) => {
                                            setAddTradeable((prevState) => ({
                                                ...prevState,
                                                price: '',
                                                priceApi: '',
                                                pricePathInApi: '',
                                                onlinePriceUpdate: event.target.checked,
                                                enableZarbahaApi: false
                                            }));
                                            setValue('onlinePriceUpdate', event.target.checked);
                                        }}
                                    />}
                                    label="قیمت از وبسرویس گرفته شود ؟" />
                            </FormGroup>
                        </div>
                        {addTradeable?.onlinePriceUpdate ? '' : <div className={`col-span-12 md:col-span-6`}>
                            <FormControl className="w-full">
                                <Controller
                                    name="price"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="قیمت واحد"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.price}
                                            helperText={errors.price ? errors.price.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'price', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>}
                        {addTradeable?.onlinePriceUpdate ? <>
                            <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between m-0"
                                        control={<CustomSwitch
                                            checked={addTradeable?.ignoreApiError}
                                            onChange={(event) => {
                                                setAddTradeable({ ...addTradeable, ignoreApiError: event.target.checked });
                                            }}
                                        />}
                                        label="عدم توقف معاملات در صورت خطا دادن وبسرویس قیمت ؟"
                                    />
                                </FormGroup>
                            </div>
                            <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between m-0"
                                        control={<CustomSwitch
                                            checked={addTradeable?.isToman}
                                            onChange={(event) => handleChangeAddData(event, 'isToman', 'checkbox')}
                                        />}
                                        label="قیمت وبسرویس به تومان می باشد ؟" />
                                </FormGroup>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <Controller
                                        name="priceApi"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                type="text"
                                                label="لینک Api قیمت گرفتن واحد"
                                                placeholder="https://goldika.ir/api/public/price"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                error={!!errors.priceApi}
                                                helperText={errors.priceApi ? errors.priceApi.message : ''}
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    handleChangeAddData(event, 'priceApi', 'text');
                                                }}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <Controller
                                        name="pricePathInApi"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                type="text"
                                                label="فیلد قیمت درون Api قیمت"
                                                placeholder="data.price.buy"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                error={!!errors.pricePathInApi}
                                                helperText={errors.pricePathInApi ? errors.pricePathInApi.message : ''}
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    handleChangeAddData(event, 'pricePathInApi', 'text');
                                                }}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <Controller
                                    name="priceApiMethod"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl className="w-full">
                                            <InputLabel id="demo-simple-select-label" error={!!errors.priceApiMethod}
                                                sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب متد وبسرویس</InputLabel>
                                            <MUISelect
                                                {...field}
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                onChange={(event) => { field.onChange(event); handleChangeAddData(event, 'priceApiMethod', 'text') }}
                                                input={<OutlinedInput
                                                    id="select-multiple-chip"
                                                    label="انتخاب متد وبسرویس"
                                                    className="dark:bg-dark *:dark:text-white"
                                                    sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                                />}
                                                error={!!errors.priceApiMethod}
                                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                                {priceMethods?.map((data, index) => (
                                                    <MenuItem key={index} value={data.value}>{data.label}</MenuItem>
                                                ))}
                                            </MUISelect>
                                            {errors.priceApiMethod && <FormHelperText className="text-red-500 !mx-4">{errors.priceApiMethod.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </div>
                            <div className="col-span-12 flex items-center gap-x-4">
                                <span className="whitespace-nowrap">هدرهای وبسرویس</span>
                                <Divider component="div" className="w-[78%] dark:bg-primary dark:bg-opacity-50" />
                                <IconButton onClick={() => {
                                    setAddTradeable(prevState => {
                                        const updatedHeaders = [
                                            ...(prevState.priceApiHeaders || []),
                                            { key: '', value: '' }
                                        ];
                                        setValue('priceApiHeaders', updatedHeaders);
                                        return {
                                            ...prevState,
                                            priceApiHeaders: updatedHeaders
                                        };
                                    });
                                }}>
                                    <AddCircleIcon color={darkModeToggle ? 'white' : 'black'} />
                                </IconButton>
                            </div>
                            {addTradeable?.priceApiHeaders?.map((data, index) => (
                                <div key={index} className="col-span-12 grid grid-cols-12 gap-4 relative">
                                    <Button variant="text" color="error" size="small" className="custom-btn rounded-lg absolute -top-8 rtl:left-0 ltr:right-0"
                                        onClick={() => {
                                            setAddTradeable(prevState => {
                                                const updatedHeaders = [...prevState.priceApiHeaders];
                                                updatedHeaders.splice(index, 1);
                                                setValue('priceApiHeaders', updatedHeaders);
                                                return {
                                                    ...prevState,
                                                    priceApiHeaders: updatedHeaders
                                                };
                                            });
                                        }}>
                                        <span className="mx-2">حذف</span>
                                    </Button>
                                    <div className="col-span-12 lg:col-span-4">
                                        <Controller
                                            name={`priceApiHeaders[${index}].key`}
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl className="w-full">
                                                    <TextField
                                                        {...field}
                                                        type="text"
                                                        label="کلید"
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        error={!!errors.priceApiHeaders?.[index]?.key}
                                                        helperText={errors.priceApiHeaders?.[index]?.key?.message || ''}
                                                        value={data.key}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            const value = event.target.value;
                                                            setAddTradeable(prevState => {
                                                                const updatedHeaders = [...prevState.priceApiHeaders];
                                                                updatedHeaders[index] = {
                                                                    ...updatedHeaders[index],
                                                                    key: value
                                                                };
                                                                return {
                                                                    ...prevState,
                                                                    priceApiHeaders: updatedHeaders
                                                                };
                                                            });
                                                        }}
                                                    />
                                                </FormControl>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-12 lg:col-span-8">
                                        <Controller
                                            name={`priceApiHeaders[${index}].value`}
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl className="w-full">
                                                    <TextField
                                                        {...field}
                                                        type="tel"
                                                        label="مقدار"
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                            inputProps: {
                                                                inputMode: 'decimal'
                                                            }
                                                        }}
                                                        error={!!errors.priceApiHeaders?.[index]?.value}
                                                        helperText={errors.priceApiHeaders?.[index]?.value?.message || ''}
                                                        value={data.value}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            const value = event.target.value;
                                                            setAddTradeable(prevState => {
                                                                const updatedHeaders = [...prevState.priceApiHeaders];
                                                                updatedHeaders[index] = {
                                                                    ...updatedHeaders[index],
                                                                    value: value
                                                                };
                                                                return {
                                                                    ...prevState,
                                                                    priceApiHeaders: updatedHeaders
                                                                };
                                                            });
                                                        }}
                                                    />
                                                </FormControl>
                                            )}
                                        />
                                    </div>
                                    <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                                </div>
                            ))}
                        </> : ''}

                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="minBuyAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداقل مقدار خرید (به گرم)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.minBuyAmount}
                                            helperText={errors.minBuyAmount ? errors.minBuyAmount.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'minBuyAmount', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="buyMaxDecimals"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداکثر تعداد اعشار برای خرید"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.buyMaxDecimals}
                                            helperText={errors.buyMaxDecimals ? errors.buyMaxDecimals.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'buyMaxDecimals', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="minSellAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداقل مقدار فروش (به گرم)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.minSellAmount}
                                            helperText={errors.minSellAmount ? errors.minSellAmount.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'minSellAmount', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="sellMaxDecimals"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداکثر تعداد اعشار برای فروش"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.sellMaxDecimals}
                                            helperText={errors.sellMaxDecimals ? errors.sellMaxDecimals.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'sellMaxDecimals', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن واحد</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomAddTradeableDrawer}
                    onClose={() => setOpenBottomAddTradeableDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن واحد
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomAddTradeableDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate autoComplete="off" onSubmit={handleSubmit(saveTradeable)}>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="نام انگلیسی واحد (منحصر بفرد)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.name}
                                            helperText={errors.name ? errors.name.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'name', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="nameFa"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="نام فارسی واحد"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.nameFa}
                                            helperText={errors.nameFa ? errors.nameFa.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'nameFa', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>

                        <div className={`col-span-12`}>
                            <FormControl className="w-full">
                                <input type="file" id="ItemPic" className="hidden" onChange={uploadItemImage('add')} />
                                <Controller
                                    name="image"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            className="form-input cursor-default"
                                            disabled
                                            label="انتخاب تصویر واحد"
                                            InputLabelProps={{
                                                classes: { disabled: darkModeToggle ? '!text-white !text-opacity-70' : '!text-black !text-opacity-70' },
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                readOnly: true,
                                                endAdornment: <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={openItemImageFile}>
                                                    {addTradeable?.image ?
                                                        <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${addTradeable?.image}`} alt={addTradeable?.slug}
                                                            className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" className={darkModeToggle ? 'text-white' : 'text-black'}>
                                                            <path opacity="0.4" d="M16.19 2.5H7.82001C4.18001 2.5 2.01001 4.67 2.01001 8.31V16.68C2.01001 20.32 4.18001 22.49 7.82001 22.49H16.19C19.83 22.49 22 20.32 22 16.68V8.31C22 4.67 19.83 2.5 16.19 2.5Z" fill="currentColor" />
                                                            <path d="M12.2 17.8799C11.5 17.8799 10.79 17.6099 10.26 17.0799C9.74001 16.5599 9.45001 15.8699 9.45001 15.1399C9.45001 14.4099 9.74001 13.7099 10.26 13.1999L11.67 11.7899C11.96 11.4999 12.44 11.4999 12.73 11.7899C13.02 12.0799 13.02 12.5599 12.73 12.8499L11.32 14.2599C11.08 14.4999 10.95 14.8099 10.95 15.1399C10.95 15.4699 11.08 15.7899 11.32 16.0199C11.81 16.5099 12.6 16.5099 13.09 16.0199L15.31 13.7999C16.58 12.5299 16.58 10.4699 15.31 9.19994C14.04 7.92994 11.98 7.92994 10.71 9.19994L8.28998 11.6199C7.77998 12.1299 7.5 12.7999 7.5 13.5099C7.5 14.2199 7.77998 14.8999 8.28998 15.3999C8.57998 15.6899 8.57998 16.1699 8.28998 16.4599C7.99998 16.7499 7.51998 16.7499 7.22998 16.4599C6.43998 15.6699 6.01001 14.6199 6.01001 13.4999C6.01001 12.3799 6.43998 11.3299 7.22998 10.5399L9.65002 8.11992C11.5 6.26992 14.52 6.26992 16.37 8.11992C18.22 9.96992 18.22 12.9899 16.37 14.8399L14.15 17.0599C13.61 17.6099 12.91 17.8799 12.2 17.8799Z" fill="currentColor" />
                                                        </svg>}
                                                </IconButton>
                                            }}
                                            value={''}
                                            error={!!errors.image}
                                            helperText={errors.image ? errors.image.message : ''}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className={`col-span-12 ${addTradeable?.enableZarbahaApi ? 'md:col-span-6' : ''} w-full flex items-center`}>
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={addTradeable?.enableZarbahaApi}
                                        onChange={(event) => {
                                            setAddTradeable({ ...addTradeable, enableZarbahaApi: event.target.checked, onlinePriceUpdate: false });
                                            setValue('onlinePriceUpdate', false);
                                        }}
                                    />}
                                    label="گرفتن قیمت از زربها ؟"
                                />
                            </FormGroup>
                        </div>
                        {addTradeable?.enableZarbahaApi ? <div className={`col-span-12 md:col-span-6`}>
                            <FormControl className="w-full">
                                <Controller
                                    name="pricePathInApi"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="فیلد قیمت درون Api قیمت"
                                            placeholder="فروش هر گرم طلای 18 عیار"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.pricePathInApi}
                                            helperText={errors.pricePathInApi ? errors.pricePathInApi.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'pricePathInApi', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div> : ''}
                        <div className="col-span-12 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={addTradeable?.wallgoldIntegrationIsActive}
                                        onChange={(event) => {
                                            setAddTradeable({ ...addTradeable, wallgoldIntegrationIsActive: event.target.checked });
                                        }}
                                    />}
                                    label="ثبت معاملات در وال گلد ؟"
                                />
                            </FormGroup>
                        </div>

                        <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                        <div className="col-span-12 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={isChartEnable}
                                        onChange={(event) => {
                                            setIsChartEnable(event.target.checked);
                                            if (event.target.checked) {
                                                setAddTradeable((prevState) => ({
                                                    ...prevState,
                                                    chartLink: ''
                                                }));
                                            } else {
                                                setAddTradeable((prevState) => ({
                                                    ...prevState,
                                                    chartLink: 'disable'
                                                }));
                                            }
                                        }}
                                    />}
                                    label="فعالسازی نمودار ؟" />
                            </FormGroup>
                        </div>
                        {isChartEnable ? <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="لینک نمودار"
                                    placeholder="https://widget.bitycle.com/fa/ac?market=GOLD18IRT"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    onChange={(event) => {
                                        handleChangeAddData(event, 'chartLink', 'text');
                                    }}
                                />
                            </FormControl>
                        </div> : <div className="col-span-12 md:col-span-6"></div>}
                        <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />

                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="stock"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            customInput={TextField}
                                            type="tel"
                                            label="موجودی انبار (به گرم)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.stock}
                                            helperText={errors.stock ? errors.stock.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'stock', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="transferMaxDecimals"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداکثر تعداد اعشار برای انتقال دارایی کاربر به کاربر"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.transferMaxDecimals}
                                            helperText={errors.transferMaxDecimals ? errors.transferMaxDecimals.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'transferMaxDecimals', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>

                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="stockThreshold"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداقل مقدار موجودی جهت ارسال پیام به مدیریت (به گرم)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.stockThreshold}
                                            helperText={errors.stockThreshold ? errors.stockThreshold.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'stockThreshold', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="referrerRewardPercent"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            customInput={TextField}
                                            type="tel"
                                            label="کمیسیون فرد معرف در معاملات خرید (به درصد)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.referrerRewardPercent}
                                            helperText={errors.referrerRewardPercent ? errors.referrerRewardPercent.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'referrerRewardPercent', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>

                        <div className="col-span-12 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={addTradeable?.onlinePriceUpdate}
                                        onChange={(event) => {
                                            setAddTradeable((prevState) => ({
                                                ...prevState,
                                                price: '',
                                                priceApi: '',
                                                pricePathInApi: '',
                                                onlinePriceUpdate: event.target.checked,
                                                enableZarbahaApi: false
                                            }));
                                            setValue('onlinePriceUpdate', event.target.checked);
                                        }}
                                    />}
                                    label="قیمت از وبسرویس گرفته شود ؟" />
                            </FormGroup>
                        </div>
                        {addTradeable?.onlinePriceUpdate ? '' : <div className={`col-span-12`}>
                            <FormControl className="w-full">
                                <Controller
                                    name="price"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="قیمت واحد"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.price}
                                            helperText={errors.price ? errors.price.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'price', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>}
                        {addTradeable?.onlinePriceUpdate ? <>
                            <div className="col-span-12 w-full flex items-center">
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between m-0"
                                        control={<CustomSwitch
                                            checked={addTradeable?.ignoreApiError}
                                            onChange={(event) => {
                                                setAddTradeable({ ...addTradeable, ignoreApiError: event.target.checked });
                                            }}
                                        />}
                                        label="عدم توقف معاملات در صورت خطا دادن وبسرویس قیمت ؟"
                                    />
                                </FormGroup>
                            </div>
                            <div className="col-span-12 w-full flex items-center">
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between m-0"
                                        control={<CustomSwitch
                                            checked={addTradeable?.isToman}
                                            onChange={(event) => handleChangeAddData(event, 'isToman', 'checkbox')}
                                        />}
                                        label="قیمت وبسرویس به تومان می باشد ؟" />
                                </FormGroup>
                            </div>
                            <div className="col-span-12">
                                <FormControl className="w-full">
                                    <Controller
                                        name="priceApi"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                type="text"
                                                label="لینک Api قیمت گرفتن واحد"
                                                placeholder="https://goldika.ir/api/public/price"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                error={!!errors.priceApi}
                                                helperText={errors.priceApi ? errors.priceApi.message : ''}
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    handleChangeAddData(event, 'priceApi', 'text');
                                                }}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </div>
                            <div className="col-span-12">
                                <FormControl className="w-full">
                                    <Controller
                                        name="pricePathInApi"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                type="text"
                                                label="فیلد قیمت درون Api قیمت"
                                                placeholder="data.price.buy"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                error={!!errors.pricePathInApi}
                                                helperText={errors.pricePathInApi ? errors.pricePathInApi.message : ''}
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    handleChangeAddData(event, 'pricePathInApi', 'text');
                                                }}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </div>
                            <div className="col-span-12">
                                <Controller
                                    name="priceApiMethod"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl className="w-full">
                                            <InputLabel id="demo-simple-select-label" error={!!errors.priceApiMethod}
                                                sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب متد وبسرویس</InputLabel>
                                            <MUISelect
                                                {...field}
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                onChange={(event) => { field.onChange(event); handleChangeAddData(event, 'priceApiMethod', 'text') }}
                                                input={<OutlinedInput
                                                    id="select-multiple-chip"
                                                    label="انتخاب متد وبسرویس"
                                                    className="dark:bg-dark *:dark:text-white"
                                                    sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                                />}
                                                error={!!errors.priceApiMethod}
                                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                                {priceMethods?.map((data, index) => (
                                                    <MenuItem key={index} value={data.value}>{data.label}</MenuItem>
                                                ))}
                                            </MUISelect>
                                            {errors.priceApiMethod && <FormHelperText className="text-red-500 !mx-4">{errors.priceApiMethod.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </div>
                            <div className="col-span-12 flex items-center gap-x-4">
                                <span className="whitespace-nowrap">هدرهای وبسرویس</span>
                                <Divider component="div" className="w-[55%] md:w-[74%] dark:bg-primary dark:bg-opacity-50" />
                                <IconButton onClick={() => {
                                    setAddTradeable(prevState => {
                                        const updatedHeaders = [
                                            ...(prevState.priceApiHeaders || []),
                                            { key: '', value: '' }
                                        ];
                                        setValue('priceApiHeaders', updatedHeaders);
                                        return {
                                            ...prevState,
                                            priceApiHeaders: updatedHeaders
                                        };
                                    });
                                }}>
                                    <AddCircleIcon color={darkModeToggle ? 'white' : 'black'} />
                                </IconButton>
                            </div>
                            {addTradeable?.priceApiHeaders?.map((data, index) => (
                                <div key={index} className="col-span-12 grid grid-cols-12 gap-4 relative">
                                    <Button variant="text" color="error" size="small" className="custom-btn rounded-lg absolute -top-8 rtl:left-0 ltr:right-0"
                                        onClick={() => {
                                            setAddTradeable(prevState => {
                                                const updatedHeaders = [...prevState.priceApiHeaders];
                                                updatedHeaders.splice(index, 1);
                                                setValue('priceApiHeaders', updatedHeaders);
                                                return {
                                                    ...prevState,
                                                    priceApiHeaders: updatedHeaders
                                                };
                                            });
                                        }}>
                                        <span className="mx-2">حذف</span>
                                    </Button>
                                    <div className="col-span-12">
                                        <Controller
                                            name={`priceApiHeaders[${index}].key`}
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl className="w-full">
                                                    <TextField
                                                        {...field}
                                                        type="text"
                                                        label="کلید"
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        error={!!errors.priceApiHeaders?.[index]?.key}
                                                        helperText={errors.priceApiHeaders?.[index]?.key?.message || ''}
                                                        value={data.key}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            const value = event.target.value;
                                                            setAddTradeable(prevState => {
                                                                const updatedHeaders = [...prevState.priceApiHeaders];
                                                                updatedHeaders[index] = {
                                                                    ...updatedHeaders[index],
                                                                    key: value
                                                                };
                                                                return {
                                                                    ...prevState,
                                                                    priceApiHeaders: updatedHeaders
                                                                };
                                                            });
                                                        }}
                                                    />
                                                </FormControl>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-12">
                                        <Controller
                                            name={`priceApiHeaders[${index}].value`}
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl className="w-full">
                                                    <TextField
                                                        {...field}
                                                        type="tel"
                                                        label="مقدار"
                                                        variant="outlined"
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                            inputProps: {
                                                                inputMode: 'decimal'
                                                            }
                                                        }}
                                                        error={!!errors.priceApiHeaders?.[index]?.value}
                                                        helperText={errors.priceApiHeaders?.[index]?.value?.message || ''}
                                                        value={data.value}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            const value = event.target.value;
                                                            setAddTradeable(prevState => {
                                                                const updatedHeaders = [...prevState.priceApiHeaders];
                                                                updatedHeaders[index] = {
                                                                    ...updatedHeaders[index],
                                                                    value: value
                                                                };
                                                                return {
                                                                    ...prevState,
                                                                    priceApiHeaders: updatedHeaders
                                                                };
                                                            });
                                                        }}
                                                    />
                                                </FormControl>
                                            )}
                                        />
                                    </div>
                                    <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                                </div>
                            ))}
                        </> : ''}

                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="minBuyAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداقل مقدار خرید (به گرم)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.minBuyAmount}
                                            helperText={errors.minBuyAmount ? errors.minBuyAmount.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'minBuyAmount', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="buyMaxDecimals"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداکثر تعداد اعشار برای خرید"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.buyMaxDecimals}
                                            helperText={errors.buyMaxDecimals ? errors.buyMaxDecimals.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'buyMaxDecimals', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>

                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="minSellAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداقل مقدار فروش (به گرم)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.minSellAmount}
                                            helperText={errors.minSellAmount ? errors.minSellAmount.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'minSellAmount', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="sellMaxDecimals"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداکثر تعداد اعشار برای فروش"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.sellMaxDecimals}
                                            helperText={errors.sellMaxDecimals ? errors.sellMaxDecimals.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'sellMaxDecimals', 'numberFormat');
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن واحد</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* EditTradeable */}
            <>
                <Dialog onClose={() => setShowEditTradeable(false)} open={showEditTradeable} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش واحد {tradeableData?.name}
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowEditTradeable(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="نام واحد (منحصر بفرد)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={tradeableData?.name}
                                    onChange={handleChangeEditData('name', 'text')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="نام فارسی واحد"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={tradeableData?.nameFa}
                                    onChange={handleChangeEditData('nameFa', 'text')} />
                            </FormControl>
                        </div>

                        <div className={`col-span-12 md:col-span-4`}>
                            <FormControl className="w-full">
                                <input type="file" id="ItemPic" className="hidden" onChange={uploadItemImage('edit')} />
                                <TextField type="text" id="account" className="form-input cursor-default"
                                    disabled
                                    label="انتخاب تصویر واحد"
                                    InputLabelProps={{
                                        classes: { disabled: darkModeToggle ? '!text-white !text-opacity-70' : '!text-black !text-opacity-70' },
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        readOnly: true,
                                        endAdornment: <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={openItemImageFile}>
                                            {tradeableData?.image ?
                                                <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${tradeableData?.image}`} alt={tradeableData?.slug}
                                                    className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                                                    <path opacity="0.4" d="M16.19 2.5H7.82001C4.18001 2.5 2.01001 4.67 2.01001 8.31V16.68C2.01001 20.32 4.18001 22.49 7.82001 22.49H16.19C19.83 22.49 22 20.32 22 16.68V8.31C22 4.67 19.83 2.5 16.19 2.5Z" fill="white" />
                                                    <path d="M12.2 17.8799C11.5 17.8799 10.79 17.6099 10.26 17.0799C9.74001 16.5599 9.45001 15.8699 9.45001 15.1399C9.45001 14.4099 9.74001 13.7099 10.26 13.1999L11.67 11.7899C11.96 11.4999 12.44 11.4999 12.73 11.7899C13.02 12.0799 13.02 12.5599 12.73 12.8499L11.32 14.2599C11.08 14.4999 10.95 14.8099 10.95 15.1399C10.95 15.4699 11.08 15.7899 11.32 16.0199C11.81 16.5099 12.6 16.5099 13.09 16.0199L15.31 13.7999C16.58 12.5299 16.58 10.4699 15.31 9.19994C14.04 7.92994 11.98 7.92994 10.71 9.19994L8.28998 11.6199C7.77998 12.1299 7.5 12.7999 7.5 13.5099C7.5 14.2199 7.77998 14.8999 8.28998 15.3999C8.57998 15.6899 8.57998 16.1699 8.28998 16.4599C7.99998 16.7499 7.51998 16.7499 7.22998 16.4599C6.43998 15.6699 6.01001 14.6199 6.01001 13.4999C6.01001 12.3799 6.43998 11.3299 7.22998 10.5399L9.65002 8.11992C11.5 6.26992 14.52 6.26992 16.37 8.11992C18.22 9.96992 18.22 12.9899 16.37 14.8399L14.15 17.0599C13.61 17.6099 12.91 17.8799 12.2 17.8799Z" fill="white" />
                                                </svg>}
                                        </IconButton>
                                    }}
                                    value={''} />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-4 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={tradeableData?.enableZarbahaApi || false}
                                        onChange={(event) => {
                                            setTradeableData((prevState) => ({
                                                ...prevState,
                                                enableZarbahaApi: event.target.checked,
                                                onlinePriceUpdate: false
                                            }));
                                        }}
                                    />}
                                    label="گرفتن قیمت از زربها ؟"
                                />
                            </FormGroup>
                        </div>
                        {tradeableData?.enableZarbahaApi ? <div className="col-span-12 md:col-span-4">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="فیلد قیمت درون Api قیمت"
                                    placeholder="data.price.buy"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={tradeableData?.pricePathInApi}
                                    onChange={handleChangeEditData('pricePathInApi', 'text')} />
                            </FormControl>
                        </div> : ''}
                        <div className="col-span-12 md:col-span-4 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={tradeableData?.wallgoldIntegrationIsActive}
                                        onChange={(event) => {
                                            setTradeableData((prevState) => ({
                                                ...prevState,
                                                wallgoldIntegrationIsActive: event.target.checked
                                            }));
                                        }}
                                    />}
                                    label="ثبت معامله در وال گلد ؟" />
                            </FormGroup>
                        </div>

                        <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={tradeableHasChart}
                                        onChange={(event) => {
                                            setTradeableHasChart(event.target.checked);
                                            if (event.target.checked) {
                                                setTradeableData((prevState) => ({
                                                    ...prevState,
                                                    chartLink: ''
                                                }));
                                            } else {
                                                setTradeableData((prevState) => ({
                                                    ...prevState,
                                                    chartLink: 'disable'
                                                }));
                                            }
                                        }}
                                    />}
                                    label="فعالسازی نمودار ؟" />
                            </FormGroup>
                        </div>
                        {tradeableHasChart ? <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="لینک نمودار"
                                    placeholder="https://widget.bitycle.com/fa/ac?market=GOLD18IRT"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={tradeableData?.chartLink}
                                    onChange={handleChangeEditData('chartLink', 'text')}
                                />
                            </FormControl>
                        </div> : <div className="col-span-12 md:col-span-6"></div>}
                        <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />

                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    customInput={TextField}
                                    type="tel"
                                    label="موجودی انبار (به گرم)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.stock}
                                    onChange={handleChangeEditData('stock', 'numberFormat')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={0}
                                    customInput={TextField}
                                    type="tel"
                                    label="حداکثر تعداد اعشار برای انتقال دارایی کاربر به کاربر"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.transferMaxDecimals}
                                    onChange={handleChangeEditData('transferMaxDecimals', 'numberFormat')} />
                            </FormControl>
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    customInput={TextField}
                                    type="tel"
                                    label="حداقل مقدار موجودی جهت ارسال پیام به مدیریت (به گرم)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.stockThreshold}
                                    onChange={handleChangeEditData('stockThreshold', 'numberFormat')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    customInput={TextField}
                                    type="tel"
                                    label="کمیسیون فرد معرف در معاملات خرید (به درصد)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.referrerRewardPercent}
                                    onChange={handleChangeEditData('referrerRewardPercent', 'numberFormat')} />
                            </FormControl>
                        </div>

                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={tradeableData?.onlinePriceUpdate}
                                        onChange={(event) => {
                                            setTradeableData((prevState) => ({
                                                ...prevState,
                                                price: '',
                                                onlinePriceUpdate: event.target.checked,
                                                enableZarbahaApi: false
                                            }));
                                        }}
                                    />}
                                    label="قیمت از وبسرویس گرفته شود ؟" />
                            </FormGroup>
                        </div>
                        {tradeableData?.onlinePriceUpdate ? '' : <div className={`col-span-12 md:col-span-6`}>
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="قیمت واحد"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.price}
                                    onChange={handleChangeEditData('price', 'numberFormat')}
                                />
                            </FormControl>
                        </div>}
                        {tradeableData?.onlinePriceUpdate ? <>
                            <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between m-0"
                                        control={<CustomSwitch
                                            checked={tradeableData?.ignoreApiError}
                                            onChange={handleChangeEditData('ignoreApiError', 'checkbox')}
                                        />}
                                        label="عدم توقف معاملات در صورت خطا دادن وبسرویس قیمت ؟"
                                    />
                                </FormGroup>
                            </div>
                            <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between m-0"
                                        control={<CustomSwitch
                                            checked={tradeableData?.isToman}
                                            onChange={handleChangeEditData('isToman', 'checkbox')}
                                        />}
                                        label="قیمت وبسرویس به تومان می باشد ؟" />
                                </FormGroup>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="لینک Api قیمت گرفتن واحد"
                                        placeholder="https://goldika.ir/api/public/price"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        error={!!priceApiError}
                                        value={tradeableData?.priceApi}
                                        onChange={handleChangeEditData('priceApi', 'priceApi')} />
                                    {priceApiError ? <FormHelperText className="text-red-500 text-xs mx-4">این فیلد باید یک لینک معتبر باشد</FormHelperText> : ''}
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="فیلد قیمت درون Api قیمت"
                                        placeholder="data.price.buy"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={tradeableData?.pricePathInApi}
                                        onChange={handleChangeEditData('pricePathInApi', 'text')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <InputLabel id="demo-simple-select-label"
                                        sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب متد وبسرویس</InputLabel>
                                    <MUISelect
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        defaultValue={tradeableData?.priceApiMethod}
                                        onChange={handleChangeEditData('priceApiMethod', 'text')}
                                        input={<OutlinedInput
                                            id="select-multiple-chip"
                                            label="انتخاب متد وبسرویس"
                                            className="dark:bg-dark *:dark:text-white"
                                            sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                        />}
                                        renderValue={(selected) => {
                                            return (
                                                <div className="flex flex-wrap gap-0.5">
                                                    <span>{selected}</span>
                                                </div>
                                            )
                                        }}
                                        MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                        {priceMethods?.map((data, index) => (
                                            <MenuItem key={index} value={data.value}>{data.label}</MenuItem>
                                        ))}
                                    </MUISelect>
                                </FormControl>
                            </div>

                            <div className="col-span-12 flex items-center gap-x-4">
                                <span className="whitespace-nowrap">هدرهای وبسرویس</span>
                                <Divider component="div" className="w-[78%] dark:bg-primary dark:bg-opacity-50" />
                                <IconButton onClick={() => {
                                    setTradeableData(prevState => {
                                        const updatedHeaders = [
                                            ...(prevState.priceApiHeaders || []),
                                            { key: '', value: '' }
                                        ];
                                        return {
                                            ...prevState,
                                            priceApiHeaders: updatedHeaders
                                        };
                                    });
                                }}>
                                    <AddCircleIcon color={darkModeToggle ? 'white' : 'black'} />
                                </IconButton>
                            </div>
                            {tradeableData?.priceApiHeaders?.map((data, index) => (
                                <div key={index} className="col-span-12 grid grid-cols-12 gap-4 relative">
                                    <Button variant="text" color="error" size="small" className="custom-btn rounded-lg absolute -top-8 rtl:left-0 ltr:right-0"
                                        onClick={() => {
                                            setTradeableData(prevState => {
                                                const updatedHeaders = [...prevState.priceApiHeaders];
                                                updatedHeaders.splice(index, 1);
                                                return {
                                                    ...prevState,
                                                    priceApiHeaders: updatedHeaders
                                                };
                                            });
                                        }}>
                                        <span className="mx-2">حذف</span>
                                    </Button>
                                    <div className="col-span-12 lg:col-span-4">
                                        <FormControl className="w-full">
                                            <TextField
                                                type="text"
                                                label="کلید"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                error={!!priceHeadersErrors?.priceApiHeaders?.[index]?.key}
                                                helperText={priceHeadersErrors?.priceApiHeaders?.[index]?.key || ''}
                                                value={data.key}
                                                onChange={(event) => {
                                                    const value = event.target.value;
                                                    setTradeableData(prevState => {
                                                        const updatedHeaders = [...prevState.priceApiHeaders];
                                                        updatedHeaders[index] = {
                                                            ...updatedHeaders[index],
                                                            key: value
                                                        };
                                                        return {
                                                            ...prevState,
                                                            priceApiHeaders: updatedHeaders
                                                        };
                                                    });
                                                    setPriceHeadersErrors(prevErrors => ({
                                                        ...prevErrors,
                                                        priceApiHeaders: {
                                                            ...prevErrors.priceApiHeaders,
                                                            [index]: {
                                                                ...prevErrors.priceApiHeaders?.[index],
                                                                key: null
                                                            }
                                                        }
                                                    }));
                                                }}
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="col-span-12 lg:col-span-8">
                                        <FormControl className="w-full">
                                            <TextField
                                                type="tel"
                                                label="مقدار"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    inputProps: {
                                                        inputMode: 'decimal'
                                                    }
                                                }}
                                                error={!!priceHeadersErrors?.priceApiHeaders?.[index]?.value}
                                                helperText={priceHeadersErrors?.priceApiHeaders?.[index]?.value || ''}
                                                value={data.value}
                                                onChange={(event) => {
                                                    const value = event.target.value;
                                                    setTradeableData(prevState => {
                                                        const updatedHeaders = [...prevState.priceApiHeaders];
                                                        updatedHeaders[index] = {
                                                            ...updatedHeaders[index],
                                                            value: value
                                                        };
                                                        return {
                                                            ...prevState,
                                                            priceApiHeaders: updatedHeaders
                                                        };
                                                    });
                                                    setPriceHeadersErrors(prevErrors => ({
                                                        ...prevErrors,
                                                        priceApiHeaders: {
                                                            ...prevErrors.priceApiHeaders,
                                                            [index]: {
                                                                ...prevErrors.priceApiHeaders?.[index],
                                                                value: null
                                                            }
                                                        }
                                                    }));
                                                }}
                                            />
                                        </FormControl>
                                    </div>
                                    <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                                </div>
                            ))}
                        </> : ''}

                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    customInput={TextField}
                                    type="tel"
                                    label="حداقل مقدار خرید (به گرم)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.minBuyAmount}
                                    onChange={handleChangeEditData('minBuyAmount', 'numberFormat')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={0}
                                    customInput={TextField}
                                    type="tel"
                                    label="حداکثر تعداد اعشار برای خرید"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.buyMaxDecimals}
                                    onChange={handleChangeEditData('buyMaxDecimals', 'numberFormat')} />
                            </FormControl>
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    customInput={TextField}
                                    type="tel"
                                    label="حداقل مقدار فروش (به گرم)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.minSellAmount}
                                    onChange={handleChangeEditData('minSellAmount', 'numberFormat')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={0}
                                    customInput={TextField}
                                    type="tel"
                                    label="حداکثر تعداد اعشار برای فروش"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.sellMaxDecimals}
                                    onChange={handleChangeEditData('sellMaxDecimals', 'numberFormat')} />
                            </FormControl>
                        </div>
                        {tradeableData?.apiError ? <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={8}
                                    error={true}
                                    label="دلیل قطع وبسرویس قیمت گیری"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl cursor-default' : 'text-black rtl cursor-default', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                    }}
                                    value={tradeableData?.apiError} />
                            </FormControl>
                        </div> : ''}
                    </form>
                    <div className="text-end">
                        <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                            onClick={editTradeable(tradeableData?._id)}>
                            <text className="text-black font-semibold">ویرایش واحد</text>
                        </LoadingButton>
                    </div>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomEditTradeableDrawer}
                    onClose={() => setOpenBottomEditTradeableDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش واحد {tradeableData?.name}
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomEditTradeableDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <section className="grid grid-cols-12 gap-x-4 gap-y-8 py-8">
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="نام واحد (منحصر بفرد)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={tradeableData?.name}
                                    onChange={handleChangeEditData('name', 'text')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="نام فارسی واحد"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={tradeableData?.nameFa}
                                    onChange={handleChangeEditData('nameFa', 'text')} />
                            </FormControl>
                        </div>

                        <div className={`col-span-12`}>
                            <FormControl className="w-full">
                                <input type="file" id="ItemPic" className="hidden" onChange={uploadItemImage('edit')} />
                                <TextField type="text" id="account" className="form-input cursor-default"
                                    disabled
                                    label="انتخاب تصویر واحد"
                                    InputLabelProps={{
                                        classes: { disabled: darkModeToggle ? '!text-white !text-opacity-70' : '!text-black !text-opacity-70' },
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        readOnly: true,
                                        endAdornment: <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={openItemImageFile}>
                                            {tradeableData?.image ?
                                                <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${tradeableData?.image}`} alt={tradeableData?.slug}
                                                    className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                                                    <path opacity="0.4" d="M16.19 2.5H7.82001C4.18001 2.5 2.01001 4.67 2.01001 8.31V16.68C2.01001 20.32 4.18001 22.49 7.82001 22.49H16.19C19.83 22.49 22 20.32 22 16.68V8.31C22 4.67 19.83 2.5 16.19 2.5Z" fill="white" />
                                                    <path d="M12.2 17.8799C11.5 17.8799 10.79 17.6099 10.26 17.0799C9.74001 16.5599 9.45001 15.8699 9.45001 15.1399C9.45001 14.4099 9.74001 13.7099 10.26 13.1999L11.67 11.7899C11.96 11.4999 12.44 11.4999 12.73 11.7899C13.02 12.0799 13.02 12.5599 12.73 12.8499L11.32 14.2599C11.08 14.4999 10.95 14.8099 10.95 15.1399C10.95 15.4699 11.08 15.7899 11.32 16.0199C11.81 16.5099 12.6 16.5099 13.09 16.0199L15.31 13.7999C16.58 12.5299 16.58 10.4699 15.31 9.19994C14.04 7.92994 11.98 7.92994 10.71 9.19994L8.28998 11.6199C7.77998 12.1299 7.5 12.7999 7.5 13.5099C7.5 14.2199 7.77998 14.8999 8.28998 15.3999C8.57998 15.6899 8.57998 16.1699 8.28998 16.4599C7.99998 16.7499 7.51998 16.7499 7.22998 16.4599C6.43998 15.6699 6.01001 14.6199 6.01001 13.4999C6.01001 12.3799 6.43998 11.3299 7.22998 10.5399L9.65002 8.11992C11.5 6.26992 14.52 6.26992 16.37 8.11992C18.22 9.96992 18.22 12.9899 16.37 14.8399L14.15 17.0599C13.61 17.6099 12.91 17.8799 12.2 17.8799Z" fill="white" />
                                                </svg>}
                                        </IconButton>
                                    }}
                                    value={''} />
                            </FormControl>
                        </div>
                        <div className={`col-span-12 ${tradeableData?.enableZarbahaApi ? 'md:col-span-6' : ''} w-full flex items-center`}>
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={tradeableData?.enableZarbahaApi || false}
                                        onChange={(event) => {
                                            setTradeableData((prevState) => ({
                                                ...prevState,
                                                enableZarbahaApi: event.target.checked,
                                                onlinePriceUpdate: false
                                            }));
                                        }}
                                    />}
                                    label="گرفتن قیمت از زربها ؟"
                                />
                            </FormGroup>
                        </div>
                        {tradeableData?.enableZarbahaApi ? <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="فیلد قیمت درون Api قیمت"
                                    placeholder="data.price.buy"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={tradeableData?.pricePathInApi}
                                    onChange={handleChangeEditData('pricePathInApi', 'text')} />
                            </FormControl>
                        </div> : ''}
                        <div className="col-span-12 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={tradeableData?.wallgoldIntegrationIsActive}
                                        onChange={(event) => {
                                            setTradeableData((prevState) => ({
                                                ...prevState,
                                                wallgoldIntegrationIsActive: event.target.checked
                                            }));
                                        }}
                                    />}
                                    label="ثبت معامله در وال گلد ؟" />
                            </FormGroup>
                        </div>
                        <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                        <div className="col-span-12 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={tradeableHasChart}
                                        onChange={(event) => {
                                            setTradeableHasChart(event.target.checked);
                                            if (event.target.checked) {
                                                setTradeableData((prevState) => ({
                                                    ...prevState,
                                                    chartLink: ''
                                                }));
                                            } else {
                                                setTradeableData((prevState) => ({
                                                    ...prevState,
                                                    chartLink: 'disable'
                                                }));
                                            }
                                        }}
                                    />}
                                    label="فعالسازی نمودار ؟" />
                            </FormGroup>
                        </div>
                        {tradeableHasChart ? <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="لینک نمودار"
                                    placeholder="https://widget.bitycle.com/fa/ac?market=GOLD18IRT"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={tradeableData?.chartLink}
                                    onChange={handleChangeEditData('chartLink', 'text')}
                                />
                            </FormControl>
                        </div> : <div className="col-span-12"></div>}
                        <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />

                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    customInput={TextField}
                                    type="tel"
                                    label="موجودی انبار (به گرم)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.stock}
                                    onChange={handleChangeEditData('stock', 'numberFormat')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={0}
                                    customInput={TextField}
                                    type="tel"
                                    label="حداکثر تعداد اعشار برای انتقال دارایی کاربر به کاربر"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.transferMaxDecimals}
                                    onChange={handleChangeEditData('transferMaxDecimals', 'numberFormat')} />
                            </FormControl>
                        </div>

                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    customInput={TextField}
                                    type="tel"
                                    label="حداقل مقدار موجودی جهت ارسال پیام به مدیریت (به گرم)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.stockThreshold}
                                    onChange={handleChangeEditData('stockThreshold', 'numberFormat')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    customInput={TextField}
                                    type="tel"
                                    label="کمیسیون فرد معرف در معاملات خرید (به درصد)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.referrerRewardPercent}
                                    onChange={handleChangeEditData('referrerRewardPercent', 'numberFormat')} />
                            </FormControl>
                        </div>

                        <div className="col-span-12 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={tradeableData?.onlinePriceUpdate}
                                        onChange={(event) => {
                                            setTradeableData((prevState) => ({
                                                ...prevState,
                                                price: '',
                                                onlinePriceUpdate: event.target.checked,
                                                enableZarbahaApi: false
                                            }));
                                        }}
                                    />}
                                    label="قیمت از وبسرویس گرفته شود ؟" />
                            </FormGroup>
                        </div>
                        {tradeableData?.onlinePriceUpdate ? '' : <div className={`col-span-12`}>
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="قیمت واحد"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.price}
                                    onChange={handleChangeEditData('price', 'numberFormat')}
                                />
                            </FormControl>
                        </div>}
                        {tradeableData?.onlinePriceUpdate ? <>
                            <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between m-0"
                                        control={<CustomSwitch
                                            checked={tradeableData?.ignoreApiError}
                                            onChange={handleChangeEditData('ignoreApiError', 'checkbox')}
                                        />}
                                        label="عدم توقف معاملات در صورت خطا دادن وبسرویس قیمت ؟"
                                    />
                                </FormGroup>
                            </div>
                            <div className="col-span-12 w-full flex items-center">
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between m-0"
                                        control={<CustomSwitch
                                            checked={tradeableData?.isToman}
                                            onChange={handleChangeEditData('isToman', 'checkbox')}
                                        />}
                                        label="قیمت وبسرویس به تومان می باشد ؟" />
                                </FormGroup>
                            </div>
                            <div className="col-span-12">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="لینک Api قیمت گرفتن واحد"
                                        placeholder="https://goldika.ir/api/public/price"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        error={!!priceApiError}
                                        value={tradeableData?.priceApi}
                                        onChange={handleChangeEditData('priceApi', 'priceApi')} />
                                    {priceApiError ? <FormHelperText className="text-red-500 text-xs mx-4">این فیلد باید یک لینک معتبر باشد</FormHelperText> : ''}
                                </FormControl>
                            </div>
                            <div className="col-span-12">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="فیلد قیمت درون Api قیمت"
                                        placeholder="data.price.buy"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        value={tradeableData?.pricePathInApi}
                                        onChange={handleChangeEditData('pricePathInApi', 'text')} />
                                </FormControl>
                            </div>
                            <div className="col-span-12">
                                <FormControl className="w-full">
                                    <InputLabel id="demo-simple-select-label"
                                        sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب متد وبسرویس</InputLabel>
                                    <MUISelect
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        defaultValue={tradeableData?.priceApiMethod}
                                        onChange={handleChangeEditData('priceApiMethod', 'text')}
                                        input={<OutlinedInput
                                            id="select-multiple-chip"
                                            label="انتخاب متد وبسرویس"
                                            className="dark:bg-dark *:dark:text-white"
                                            sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                        />}
                                        renderValue={(selected) => {
                                            return (
                                                <div className="flex flex-wrap gap-0.5">
                                                    <span>{selected}</span>
                                                </div>
                                            )
                                        }}
                                        MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                        {priceMethods?.map((data, index) => (
                                            <MenuItem key={index} value={data.value}>{data.label}</MenuItem>
                                        ))}
                                    </MUISelect>
                                </FormControl>
                            </div>

                            <div className="col-span-12 flex items-center gap-x-4">
                                <span className="whitespace-nowrap">هدرهای وبسرویس</span>
                                <Divider component="div" className="w-[78%] dark:bg-primary dark:bg-opacity-50" />
                                <IconButton onClick={() => {
                                    setTradeableData(prevState => {
                                        const updatedHeaders = [
                                            ...(prevState.priceApiHeaders || []),
                                            { key: '', value: '' }
                                        ];
                                        return {
                                            ...prevState,
                                            priceApiHeaders: updatedHeaders
                                        };
                                    });
                                }}>
                                    <AddCircleIcon color={darkModeToggle ? 'white' : 'black'} />
                                </IconButton>
                            </div>
                            {tradeableData?.priceApiHeaders?.map((data, index) => (
                                <div key={index} className="col-span-12 grid grid-cols-12 gap-4 relative">
                                    <Button variant="text" color="error" size="small" className="custom-btn rounded-lg absolute -top-8 rtl:left-0 ltr:right-0"
                                        onClick={() => {
                                            setTradeableData(prevState => {
                                                const updatedHeaders = [...prevState.priceApiHeaders];
                                                updatedHeaders.splice(index, 1);
                                                return {
                                                    ...prevState,
                                                    priceApiHeaders: updatedHeaders
                                                };
                                            });
                                        }}>
                                        <span className="mx-2">حذف</span>
                                    </Button>
                                    <div className="col-span-12">
                                        <FormControl className="w-full">
                                            <TextField
                                                type="text"
                                                label="کلید"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                error={!!priceHeadersErrors?.priceApiHeaders?.[index]?.key}
                                                helperText={priceHeadersErrors?.priceApiHeaders?.[index]?.key || ''}
                                                value={data.key}
                                                onChange={(event) => {
                                                    const value = event.target.value;
                                                    setTradeableData(prevState => {
                                                        const updatedHeaders = [...prevState.priceApiHeaders];
                                                        updatedHeaders[index] = {
                                                            ...updatedHeaders[index],
                                                            key: value
                                                        };
                                                        return {
                                                            ...prevState,
                                                            priceApiHeaders: updatedHeaders
                                                        };
                                                    });
                                                    setPriceHeadersErrors(prevErrors => ({
                                                        ...prevErrors,
                                                        priceApiHeaders: {
                                                            ...prevErrors.priceApiHeaders,
                                                            [index]: {
                                                                ...prevErrors.priceApiHeaders?.[index],
                                                                key: null
                                                            }
                                                        }
                                                    }));
                                                }}
                                            />
                                        </FormControl>
                                    </div>
                                    <div className="col-span-12">
                                        <FormControl className="w-full">
                                            <TextField
                                                type="tel"
                                                label="مقدار"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    inputProps: {
                                                        inputMode: 'decimal'
                                                    }
                                                }}
                                                error={!!priceHeadersErrors?.priceApiHeaders?.[index]?.value}
                                                helperText={priceHeadersErrors?.priceApiHeaders?.[index]?.value || ''}
                                                value={data.value}
                                                onChange={(event) => {
                                                    const value = event.target.value;
                                                    setTradeableData(prevState => {
                                                        const updatedHeaders = [...prevState.priceApiHeaders];
                                                        updatedHeaders[index] = {
                                                            ...updatedHeaders[index],
                                                            value: value
                                                        };
                                                        return {
                                                            ...prevState,
                                                            priceApiHeaders: updatedHeaders
                                                        };
                                                    });
                                                    setPriceHeadersErrors(prevErrors => ({
                                                        ...prevErrors,
                                                        priceApiHeaders: {
                                                            ...prevErrors.priceApiHeaders,
                                                            [index]: {
                                                                ...prevErrors.priceApiHeaders?.[index],
                                                                value: null
                                                            }
                                                        }
                                                    }));
                                                }}
                                            />
                                        </FormControl>
                                    </div>
                                    <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                                </div>
                            ))}
                        </> : ''}

                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    customInput={TextField}
                                    type="tel"
                                    label="حداقل مقدار خرید (به گرم)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.minBuyAmount}
                                    onChange={handleChangeEditData('minBuyAmount', 'numberFormat')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={0}
                                    customInput={TextField}
                                    type="tel"
                                    label="حداکثر تعداد اعشار برای خرید"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.buyMaxDecimals}
                                    onChange={handleChangeEditData('buyMaxDecimals', 'numberFormat')} />
                            </FormControl>
                        </div>

                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    customInput={TextField}
                                    type="tel"
                                    label="حداقل مقدار فروش (به گرم)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.minSellAmount}
                                    onChange={handleChangeEditData('minSellAmount', 'numberFormat')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={0}
                                    customInput={TextField}
                                    type="tel"
                                    label="حداکثر تعداد اعشار برای فروش"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={tradeableData?.sellMaxDecimals}
                                    onChange={handleChangeEditData('sellMaxDecimals', 'numberFormat')} />
                            </FormControl>
                        </div>
                        {tradeableData?.apiError ? <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={8}
                                    error={true}
                                    label="دلیل قطع وبسرویس قیمت گیری"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl cursor-default' : 'text-black rtl cursor-default', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                    }}
                                    value={tradeableData?.apiError} />
                            </FormControl>
                        </div> : ''}
                    </section>
                    <div className="w-full">
                        <LoadingButton type="button" variant="contained" size="medium" fullWidth className="rounded-lg" disableElevation loading={loading}
                            onClick={editTradeable(tradeableData?._id)}>
                            <text className="text-black font-semibold">ویرایش واحد</text>
                        </LoadingButton>
                    </div>
                </SwipeableDrawer>
            </>

        </div>
    )
}

export default TradeablesPageCompo;