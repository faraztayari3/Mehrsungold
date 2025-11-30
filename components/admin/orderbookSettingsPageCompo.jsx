import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import CancelIcon from '@mui/icons-material/CancelOutlined'
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Pagination from '@mui/material/Pagination';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import MUISelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import moment from 'jalali-moment'
import DatePicker from "react-datepicker2"
import { NumericFormat } from 'react-number-format';
import Select from 'react-dropdown-select'

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
// import ConfirmDialog from '../shared/ConfirmDialog';

/**
 * OrderbookSettingsPageCompo component that displays the OrderbookSettings Page Component of the website.
 * @returns The rendered OrderbookSettings Page component.
 */
const OrderbookSettingsPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);
    const SETTINGS_TABLE_HEAD = [
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
        // {
        //     label: '',
        //     classes: ""
        // }
    ]

    const [pageItem, setPageItem] = useState(1);
    useEffect(() => {
        getOrderBookSettings();
    }, [pageItem]);
    useEffect(() => {
        getTradeables();
    }, []);

    /**
        * Retrieves OrderbookSettings.
        * @returns None
       */
    const [orderbookSettings, setOrderbookSettings] = useState([]);
    const [loadingOrderbookSettings, setLoadingOrderbookSettings] = useState(true);
    const [orderbookSettingsLimit, setOrderbookSettingsLimit] = useState(10);
    const [orderbookSettingsTotal, setOrderbookSettingsTotal] = useState(0);
    const getOrderBookSettings = () => {
        setLoadingOrderbookSettings(true);
        ApiCall('/order-book/order-book-settings', 'GET', locale, {}, ``, 'admin', router).then(async (result) => {
            setOrderbookSettingsTotal(result.count);
            setOrderbookSettings(result.data);
            setLoadingOrderbookSettings(false);
        }).catch((error) => {
            setLoadingOrderbookSettings(false);
            console.log(error);
        });
    }

    const [showAddOrderbookSettings, setShowAddOrderbookSettings] = useState(false);
    const [openBottomAddOrderbookSettingsDrawer, setOpenBottomAddOrderbookSettingsDrawer] = useState(false);
    const handleShowAddOrderbookSettings = () => {
        if (window.innerWidth >= 1024) {
            setShowAddOrderbookSettings(true);
            setOpenBottomAddOrderbookSettingsDrawer(false);
        } else {
            setShowAddOrderbookSettings(false);
            setOpenBottomAddOrderbookSettingsDrawer(true);
        }
    }

    const [settingData, setSettingData] = useState();
    const [showEditOrderbookSettings, setShowEditOrderbookSettings] = useState(false);
    const [openBottomEditOrderbookSettingsDrawer, setOpenBottomEditOrderbookSettingsDrawer] = useState(false);
    const handleShowEditOrderbookSettings = (data) => () => {
        setSettingData(data);
        if (window.innerWidth >= 1024) {
            setShowEditOrderbookSettings(true);
            setOpenBottomEditOrderbookSettingsDrawer(false);
        } else {
            setShowEditOrderbookSettings(false);
            setOpenBottomEditOrderbookSettingsDrawer(true);
        }
    }

    const [addOrderbookSettings, setAddOrderbookSettings] = useState({
        tradeableId: '',
        buyWage: 0,
        sellWage: 0,
        isBuyActive: true,
        isSellActive: true
    });

    const validationSchema = Yup.object({
        tradeableId: Yup.string().required('این فیلد الزامی است'),
        buyWage: Yup.string().required('این فیلد الزامی است').transform(value => value?.replace(/,/g, '')),
        sellWage: Yup.string().required('این فیلد الزامی است')
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const clearForm = () => {
        setValue('tradeableId', '');
        setValue('buyWage', '');
        setValue('sellWage', '');
    }

    /**
         * Handles the change event for saving Orderbook Settings data.
         * @param {string} input - The name of the input field being changed.
         * @param {string} type - The type of the input field.
         * @param {Event} event - The change event object.
         * @returns None
         */
    const handleChangeAddData = (event, input, type) => {
        let value;
        switch (type) {
            case "checkbox":
                value = event.target.checked;
                break;
            case "numberFormat":
                value = Number(event.target.value?.replace(/,/g, ''));
                break;
            default:
                value = event.target.value;
                break;
        }
        setAddOrderbookSettings((prevState) => ({
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
            default:
                value = event.target.value;
                break;
        }
        setSettingData((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
    * Save new OrderbookSettings.
    * @returns None
   */
    const saveOrderbookSettings = () => {
        setLoading(true);
        ApiCall('/order-book/order-book-settings', 'POST', locale, addOrderbookSettings, '', 'admin', router).then(async (result) => {
            setLoading(false);
            getOrderBookSettings();
            setShowAddOrderbookSettings(false);
            setOpenBottomAddOrderbookSettingsDrawer(false);
            setAddOrderbookSettings({
                tradeableId: '',
                buyWage: 0,
                sellWage: 0,
                isBuyActive: true,
                isSellActive: true
            });
            clearForm();
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
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

    /**
     * Edit A OrderbookSettings.
     * @returns None
    */
    const editOrderbookSettings = (settingId) => (event) => {
        event.preventDefault();
        setLoading(true);
        let newData = FilterEmptyFields(settingData);
        const filteredData = FilterObjectFields(newData, [
            "buyWage",
            "sellWage",
            "isBuyActive",
            "isSellActive",
            "buyDescription",
            "sellDescription"
        ]);

        ApiCall(`/order-book/order-book-settings/${settingId}`, 'PATCH', locale, filteredData, '', 'admin', router).then(async (result) => {
            event.target.disabled = false;
            setLoading(false);
            setShowEditOrderbookSettings(false);
            setOpenBottomEditOrderbookSettingsDrawer(false);
            setSettingData();
            getOrderBookSettings();
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
    }

    const [openDialog, setOpenDialog] = useState(false);
    const [orderbookSettingsId, setOrderbookSettingsId] = useState('');

    // const handleOpenDialog = (orderbookSettingsId) => (event) => {
    //     setOrderbookSettingsId(orderbookSettingsId);
    //     setOpenDialog(true);
    // }
    // const handleCloseDialog = () => {
    //     setOpenDialog(false);
    // }

    /**
    * Delete a OrderbookSettings.
    * @returns None
   */
    // const [deleteLoading, setDeleteLoading] = useState(false);
    // const deleteOrderbookSettings = () => {
    //     setDeleteLoading(true);
    //     ApiCall(``, 'DELETE', locale, {}, '', 'admin', router).then(async (result) => {
    //         setDeleteLoading(false);
    //         getOrderBookSettings();
    //         dispatch({
    //             type: 'setSnackbarProps', value: {
    //                 open: true, content: langText('Global.Success'),
    //                 type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
    //             }
    //         });
    //     }).catch((error) => {
    //         setDeleteLoading(false);
    //         console.log(error);
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

    /**
         * Retrieves Tradeables list.
         * @returns None
        */
    const [tradeables, setTradeables] = useState([]);
    const [loadingTradeables, setLoadingTradeables] = useState(true);
    const getTradeables = () => {
        setLoadingTradeables(true);
        ApiCall('/tradeable', 'GET', locale, {}, ``, 'admin', router).then(async (result) => {
            setTradeables(result.data);
            setLoadingTradeables(false);
        }).catch((error) => {
            setLoadingTradeables(false);
            console.log(error);
        });
    }

    return (
        <div className=" flex flex-col gap-y-8">
            <section className="flex items-center justify-between">
                <h1 className="text-2xl md:text-large-2">تنظیمات بخش اوردربوک</h1>
                <div className="flex items-center gap-x-4">
                    <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation onClick={handleShowAddOrderbookSettings}>
                        <text className="text-black font-semibold">افزودن تنظیمات</text>
                    </Button >
                </div>
            </section>
            {loadingOrderbookSettings ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div>
                :
                <section className="overflow-x-auto overflow-y-hidden">
                    {orderbookSettings.length > 0 ?
                        <>
                            <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                                <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                    <TableHead className="dark:bg-dark">
                                        <TableRow>
                                            {SETTINGS_TABLE_HEAD.map((data, index) => (
                                                <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-center pb-4`} key={index}>
                                                    <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {orderbookSettings.map((data, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{ '&:last-child td': { border: 0 } }}
                                                className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                                <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                    <div className="flex items-center gap-x-4">
                                                        <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} alt={data.tradeable?.name}
                                                            className="w-10 h-10 rounded-[50%]" />
                                                        <span>{data.tradeable?.name} - {data.tradeable?.nameFa}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                    <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                        .locale('fa')
                                                        .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                </TableCell>
                                                <TableCell className="text-center rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                    <Button type="button" variant="text" size="medium" color="primary" className="rounded-lg" disableElevation
                                                        onClick={handleShowEditOrderbookSettings(data)}>
                                                        <text className=" font-semibold">ویرایش</text>
                                                    </Button>
                                                </TableCell>
                                                {/* <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                    <Tooltip title="حذف محدودیت">
                                                        <IconButton
                                                            color={`error`}
                                                            onClick={handleOpenDialog(data._id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell> */}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* <ConfirmDialog
                                open={openDialog}
                                onClose={handleCloseDialog}
                                onConfirm={deleteOrderbookSettings}
                                title="آیا مطمئن هستید؟"
                                loading={deleteLoading}
                                darkModeToggle={darkModeToggle}
                            /> */}
                        </>
                        : <div className="py-16">
                            <span className="block text-center text-large-1 text-primary-gray">تنظیماتی یافت نشد</span>
                        </div>}
                </section>
            }

            {/* {Math.ceil(orderbookSettingsTotal / orderbookSettingsLimit) > 1 ?
                <div className="text-center mt-4">
                    <Pagination siblingCount={0}count={Math.ceil(orderbookSettingsTotal / orderbookSettingsLimit)} variant="outlined" color="primary" className="justify-center"
                        page={pageItem} onChange={(event, value) => setPageItem(value)} />
                </div>
                : ''} */}

            {/* AddOrderbookSettings */}
            <>
                <Dialog onClose={() => setShowAddOrderbookSettings(false)} open={showAddOrderbookSettings} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن تنظیمات
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowAddOrderbookSettings(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form
                        key={1}
                        className="grid grid-cols-12 gap-x-4 gap-y-8 py-8"
                        noValidate
                        autoComplete="off"
                        onSubmit={handleSubmit(saveOrderbookSettings)}
                    >
                        <div className="col-span-12">
                            <Controller
                                name="tradeableId"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <InputLabel id="demo-simple-select-label" error={!!errors.tradeableId}
                                            sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                        <MUISelect
                                            {...field}
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            onChange={(event) => { field.onChange(event); handleChangeAddData(event, 'tradeableId', 'text') }}
                                            input={<OutlinedInput
                                                id="select-multiple-chip"
                                                label="انتخاب واحد قابل معامله"
                                                className="dark:bg-dark *:dark:text-white"
                                                sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                            />}
                                            error={!!errors.tradeableId}
                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                            {tradeables?.map((data, index) => (
                                                <MenuItem key={index} value={data._id}>{data.nameFa}</MenuItem>
                                            ))}
                                        </MUISelect>
                                        {errors.tradeableId && <FormHelperText className="text-red-500 !mx-4">{errors.tradeableId.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="buyWage"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="کارمزد خرید (به درصد)"
                                            variant="outlined"
                                            error={!!errors.buyWage}
                                            helperText={errors.buyWage ? errors.buyWage.message : ''}
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
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'buyWage', 'numberFormat');
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="sellWage"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="کارمزد فروش (به درصد)"
                                            variant="outlined"
                                            error={!!errors.sellWage}
                                            helperText={errors.sellWage ? errors.sellWage.message : ''}
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
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'sellWage', 'numberFormat');
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن تنظیمات</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomAddOrderbookSettingsDrawer}
                    onClose={() => setOpenBottomAddOrderbookSettingsDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن تنظیمات
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomAddOrderbookSettingsDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form
                        key={1}
                        className="grid grid-cols-12 gap-x-4 gap-y-8 py-8"
                        noValidate
                        autoComplete="off"
                        onSubmit={handleSubmit(saveOrderbookSettings)}
                    >
                        <div className="col-span-12">
                            <Controller
                                name="tradeableId"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <InputLabel id="demo-simple-select-label" error={!!errors.tradeableId}
                                            sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                        <MUISelect
                                            {...field}
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            onChange={(event) => { field.onChange(event); handleChangeAddData(event, 'tradeableId', 'text') }}
                                            input={<OutlinedInput
                                                id="select-multiple-chip"
                                                label="انتخاب واحد قابل معامله"
                                                className="dark:bg-dark *:dark:text-white"
                                                sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                            />}
                                            error={!!errors.tradeableId}
                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                            {tradeables?.map((data, index) => (
                                                <MenuItem key={index} value={data._id}>{data.nameFa}</MenuItem>
                                            ))}
                                        </MUISelect>
                                        {errors.tradeableId && <FormHelperText className="text-red-500 !mx-4">{errors.tradeableId.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="buyWage"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="کارمزد خرید (به درصد)"
                                            variant="outlined"
                                            error={!!errors.buyWage}
                                            helperText={errors.buyWage ? errors.buyWage.message : ''}
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
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'buyWage', 'numberFormat');
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="sellWage"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="کارمزد فروش (به درصد)"
                                            variant="outlined"
                                            error={!!errors.sellWage}
                                            helperText={errors.sellWage ? errors.sellWage.message : ''}
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
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'sellWage', 'numberFormat');
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن تنظیمات</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* EditOrderbookSettings */}
            <>
                <Dialog onClose={() => setShowEditOrderbookSettings(false)} open={showEditOrderbookSettings} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش تنظیمات
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowEditOrderbookSettings(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form
                        key={1}
                        className="grid grid-cols-12 gap-x-4 gap-y-8 py-8"
                        noValidate
                        autoComplete="off"
                    >
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <InputLabel id="demo-simple-select-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>واحد قابل معامله</InputLabel>
                                <MUISelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={settingData?.tradeable}
                                    className="pointer-events-none"
                                    readOnly
                                    // onChange={(event) => setSettingData((prevState) => ({
                                    //     ...prevState,
                                    //     'tradeableId': event.target?.value?._id,
                                    // }))}
                                    IconComponent={() => { }}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="واحد قابل معامله"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }} />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            <span className="dark:!text-white">{selected?.nameFa}</span>
                                        </div>
                                    )}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                    {tradeables?.map((data, index) => (
                                        <MenuItem key={index} value={data}>{data.nameFa}</MenuItem>
                                    ))}
                                </MUISelect>
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="کارمزد خرید (به درصد)"
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
                                    value={settingData?.buyWage}
                                    onChange={handleChangeEditData('buyWage', 'numberFormat')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="کارمزد فروش (به درصد)"
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
                                    value={settingData?.sellWage}
                                    onChange={handleChangeEditData('sellWage', 'numberFormat')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={settingData?.isBuyActive}
                                        onChange={handleChangeEditData('isBuyActive', 'checkbox')}
                                    />}
                                    label="وضعیت خرید" />
                            </FormGroup>
                        </div>
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={settingData?.isSellActive}
                                        onChange={handleChangeEditData('isSellActive', 'checkbox')}
                                    />}
                                    label="وضعیت فروش" />
                            </FormGroup>
                        </div>
                        {!settingData?.isBuyActive ? <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="توضیحات غیرفعالسازی خرید"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={settingData?.buyDescription}
                                    onChange={handleChangeEditData('buyDescription', 'text')} />
                            </FormControl>
                        </div> : <div className="col-span-12 md:col-span-6"></div>}
                        {!settingData?.isSellActive ? <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="توضیحات غیرفعالسازی فروش"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={settingData?.sellDescription}
                                    onChange={handleChangeEditData('sellDescription', 'text')} />
                            </FormControl>
                        </div> : <div className="col-span-12 md:col-span-6"></div>}
                        <div className="col-span-12 text-end">
                            <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={editOrderbookSettings(settingData?._id)}>
                                <text className="text-black font-semibold">ویرایش تنظیمات</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomEditOrderbookSettingsDrawer}
                    onClose={() => setOpenBottomEditOrderbookSettingsDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش تنظیمات
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomEditOrderbookSettingsDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form
                        key={1}
                        className="grid grid-cols-12 gap-x-4 gap-y-8 py-8"
                        noValidate
                        autoComplete="off"
                    >
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <InputLabel id="demo-simple-select-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                <MUISelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={settingData?.tradeable}
                                    className="pointer-events-none"
                                    readOnly
                                    // onChange={(event) => setSettingData((prevState) => ({
                                    //     ...prevState,
                                    //     'tradeableId': event.target?.value?._id,
                                    // }))}
                                    IconComponent={() => { }}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="واحد قابل معامله"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }} />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            <span className="dark:!text-white">{selected?.nameFa}</span>
                                        </div>
                                    )}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                    {tradeables?.map((data, index) => (
                                        <MenuItem key={index} value={data}>{data.nameFa}</MenuItem>
                                    ))}
                                </MUISelect>
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="کارمزد خرید (به درصد)"
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
                                    value={settingData?.buyWage}
                                    onChange={handleChangeEditData('buyWage', 'numberFormat')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="کارمزد فروش (به درصد)"
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
                                    value={settingData?.sellWage}
                                    onChange={handleChangeEditData('sellWage', 'numberFormat')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={settingData?.isBuyActive}
                                        onChange={handleChangeEditData('isBuyActive', 'checkbox')}
                                    />}
                                    label="وضعیت خرید" />
                            </FormGroup>
                        </div>
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={settingData?.isSellActive}
                                        onChange={handleChangeEditData('isSellActive', 'checkbox')}
                                    />}
                                    label="وضعیت فروش" />
                            </FormGroup>
                        </div>
                        {!settingData?.isBuyActive ? <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="توضیحات غیرفعالسازی خرید"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={settingData?.buyDescription}
                                    onChange={handleChangeEditData('buyDescription', 'text')} />
                            </FormControl>
                        </div> : <div className="col-span-12 md:col-span-6"></div>}
                        {!settingData?.isSellActive ? <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="توضیحات غیرفعالسازی فروش"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={settingData?.sellDescription}
                                    onChange={handleChangeEditData('sellDescription', 'text')} />
                            </FormControl>
                        </div> : <div className="col-span-12 md:col-span-6"></div>}
                        <div className="col-span-12 text-end">
                            <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={editOrderbookSettings(settingData?._id)}>
                                <text className="text-black font-semibold">ویرایش تنظیمات</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>
        </div>
    )
}

export default OrderbookSettingsPageCompo;