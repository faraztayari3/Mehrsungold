import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import CancelIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RefreshIcon from '@mui/icons-material/Refresh'
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
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import MUISelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Pagination from '@mui/material/Pagination';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import moment from 'jalali-moment'
import { NumericFormat } from 'react-number-format';

import { useQRCode } from 'next-qrcode'

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
import CopyData from "../../services/copy"

// Components
import CustomSwitch from "../shared/CustomSwitch"

/**
 * GiftcardSettingsPageCompo component that displays the GiftcardSettings Page Component of the website.
 * @returns The rendered GiftcardSettings Page component.
 */
const GiftcardSettingsPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle } = state;

    const { Image } = useQRCode();

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
        getGiftcardSettings();
    }, [pageItem]);
    useEffect(() => {
        getTradeables();
    }, []);

    /**
        * Retrieves giftcardSettings.
        * @returns None
       */
    const [giftcardSettings, setGiftcardSettings] = useState([]);
    const [loadingGiftcardSettings, setLoadingGiftcardSettings] = useState(true);
    const [giftcardSettingsLimit, setGiftcardSettingsLimit] = useState(10);
    const [giftcardSettingsTotal, setGiftcardSettingsTotal] = useState(0);
    const [openValidWeights, setOpenValidWeights] = useState(false);
    const [openEditValidWeights, setOpenEditValidWeights] = useState(false);
    const getGiftcardSettings = () => {
        setLoadingGiftcardSettings(true);
        ApiCall('/gift-card/settings', 'GET', locale, {}, ``, 'admin', router).then(async (result) => {
            setGiftcardSettingsTotal(result.count);
            setGiftcardSettings(result.data);
            setLoadingGiftcardSettings(false);
        }).catch((error) => {
            setLoadingGiftcardSettings(false);
            console.log(error);
        });
    }

    const [showAddGiftcardSettings, setShowAddGiftcardSettings] = useState(false);
    const [openBottomAddGiftcardSettingsDrawer, setOpenBottomAddGiftcardSettingsDrawer] = useState(false);
    const handleShowAddGiftcardSettings = () => {
        if (window.innerWidth >= 1024) {
            setShowAddGiftcardSettings(true);
            setOpenBottomAddGiftcardSettingsDrawer(false);
        } else {
            setShowAddGiftcardSettings(false);
            setOpenBottomAddGiftcardSettingsDrawer(true);
        }
    }

    const [settingData, setSettingData] = useState();
    const [showEditGiftcardSettings, setShowEditGiftcardSettings] = useState(false);
    const [openBottomEditGiftcardSettingsDrawer, setOpenBottomEditGiftcardSettingsDrawer] = useState(false);
    const handleShowEditGiftcardSettings = (data) => () => {
        setSettingData(data);
        if (window.innerWidth >= 1024) {
            setShowEditGiftcardSettings(true);
            setOpenBottomEditGiftcardSettingsDrawer(false);
        } else {
            setShowEditGiftcardSettings(false);
            setOpenBottomEditGiftcardSettingsDrawer(true);
        }
    }

    const [addGiftcardSettings, setAddGiftcardSettings] = useState({
        tradeableId: '',
        preparationCost: '',
        shippingCost: '',
        minWeight: '',
        validWeights: [],
        deliveryTypes: []

    });

    const validationSchema = Yup.object({
        tradeableId: Yup.string().required('این فیلد الزامی است'),
        preparationCost: Yup.string().required('این فیلد الزامی است').transform(value => value?.replace(/,/g, '')),
        shippingCost: Yup.string().required('این فیلد الزامی است').transform(value => value?.replace(/,/g, '')),
        minWeight: Yup.string().required('این فیلد الزامی است').transform(value => value?.replace(/,/g, ''))
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const clearForm = () => {
        setValue('tradeableId', '');
        setValue('preparationCost', '');
        setValue('shippingCost', '');
        setValue('minWeight', '');
    }

    /**
         * Handles the change event for saving Giftcard Settings data.
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
        setAddGiftcardSettings((prevState) => ({
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
    * Save new giftcardSettings.
    * @returns None
   */
    const saveGiftcardSettings = () => {
        setLoading(true);
        ApiCall('/gift-card/settings', 'POST', locale, addGiftcardSettings, '', 'admin', router).then(async (result) => {
            setLoading(false);
            getGiftcardSettings();
            setShowAddGiftcardSettings(false);
            setOpenBottomAddGiftcardSettingsDrawer(false);
            setAddGiftcardSettings({
                tradeableId: '',
                preparationCost: '',
                shippingCost: '',
                minWeight: '',
                validWeights: [],
                deliveryTypes: []
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
     * Edit A giftcardSettings.
     * @returns None
    */
    const editGiftcardSettings = (settingId) => (event) => {
        event.preventDefault();
        setLoading(true);
        let newData = FilterEmptyFields(settingData);
        const filteredData = FilterObjectFields(newData, [
            "preparationCost",
            "shippingCost",
            "minWeight",
            "validWeights"
        ]);

        ApiCall(`/gift-card/settings/${settingId}`, 'PATCH', locale, { ...filteredData, deliveryTypes: settingData?.deliveryTypes }, '', 'admin', router).then(async (result) => {
            event.target.disabled = false;
            setLoading(false);
            setShowEditGiftcardSettings(false);
            setOpenBottomEditGiftcardSettingsDrawer(false);
            getGiftcardSettings();
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
    const [GiftcardSettingsId, setGiftcardSettingsId] = useState('');

    // const handleOpenDialog = (GiftcardSettingsId) => (event) => {
    //     setGiftcardSettingsId(GiftcardSettingsId);
    //     setOpenDialog(true);
    // }
    // const handleCloseDialog = () => {
    //     setOpenDialog(false);
    // }

    /**
    * Delete a giftcardSettings.
    * @returns None
   */
    // const [deleteLoading, setDeleteLoading] = useState(false);
    // const deleteGiftcardSettings = () => {
    //     setDeleteLoading(true);
    //     ApiCall(``, 'DELETE', locale, {}, '', 'admin', router).then(async (result) => {
    //         setDeleteLoading(false);
    //         getGiftcardSettings();
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
    const [tabValue, setTabValue] = useState(0);
    const handleChange = (event, newTabValue) => {
        setTabValue(newTabValue);
        if (newTabValue == 1) {
            getGiftcards(1);
        }
    }

    const validationGenerateSchema = Yup.object({
        tradeableId: Yup.string().required('این فیلد الزامی است'),
        weight: Yup.string().required('این فیلد الزامی است')
    });

    const { control: controlGenerate, setValue: setGenerateValue, handleSubmit: handleSubmitGenerate, formState: { errors: errorsGenerate } } = useForm({
        resolver: yupResolver(validationGenerateSchema),
    });

    const [showGenerateCode, setShowGenerateCode] = useState(false);
    const [openBottomGenerateCodeDrawer, setOpenBottomGenerateCodeDrawer] = useState(false);
    const handleShowGenerateCode = () => {
        if (window.innerWidth >= 1024) {
            setShowGenerateCode(true);
            setOpenBottomGenerateCodeDrawer(false);
        } else {
            setShowGenerateCode(false);
            setOpenBottomGenerateCodeDrawer(true);
        }
    }
    const [formData, setFormData] = useState({ tradeableId: '', weight: 0 });
    /**
    * Generate new giftcard Code.
    * @returns None
   */
    const generateCode = () => {
        setLoading(true);
        ApiCall('/gift-card/admin', 'POST', locale, { tradeableId: formData.tradeableId, weight: formData.weight, count: productAmount }, '', 'admin', router).then(async (result) => {
            setLoading(false);
            getGiftcards(pageItem);
            setShowGenerateCode(false);
            setOpenBottomGenerateCodeDrawer(false);
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

    const [rejectDesc, setRejectDesc] = useState('');
    const [transactionId, setTransactionId] = useState('');

    const GIFTCARDS_TABLE_HEAD = [
        {
            label: 'سازنده',
            classes: ""
        },
        {
            label: 'واحد معامله',
            classes: ""
        },
        {
            label: 'مقدار',
            classes: ""
        },
        {
            label: 'کد',
            classes: ""
        },
        {
            label: 'جزئیات',
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

    /**
        * Retrieves Giftcards.
        * @returns None
       */
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [transactionsLimit, settransactionsLimit] = useState(10);
    const [transactionsTotal, setTransactionsTotal] = useState(0);
    const getGiftcards = (page, search) => {
        setLoadingTransactions(true);
        ApiCall('/gift-card', 'GET', locale, {}, `${search ? `search=${search}&` : ''}roles=Admin&roles=SuperAdmin&sortOrder=0&sortBy=createdAt&limit=${transactionsLimit}&skip=${(page * transactionsLimit) - transactionsLimit}`, 'admin', router).then(async (result) => {
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
        getGiftcards();
    }

    /**
     * Search for a Giftcards based on the input value and filter the displayed Giftcards accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchGiftcards, setSearchGiftcards] = useState('');
    var typingTimerGiftcards;
    const doneTypingIntervalGiftcards = 300;
    const searchGiftcardsItems = (event) => {
        clearTimeout(typingTimerGiftcards);

        typingTimerGiftcards = setTimeout(() => {
            if (event.target.value == '') {
                setSearchGiftcards('');
                setPageItem(1);
                getGiftcards(1, '');
            } else {
                setSearchGiftcards(event.target.value);
                setPageItem(1);
                getGiftcards(1, event.target.value);
            }
        }, doneTypingIntervalGiftcards);

    }
    const searchGiftcardsItemsHandler = () => {
        clearTimeout(typingTimerGiftcards)
    }

    const openInNewTab = (index) => () => {
        const imgElement = document.querySelector(`div#qrcode${index} img`);
        const imgSrc = imgElement.src;

        const newWindow = window.open();
        newWindow.document.body.innerHTML = `<img src="${imgSrc}" alt="QR Code" />`;
    }

    const [showReject, setShowReject] = useState(false);
    const [openBottomRejectDrawer, setOpenBottomRejectDrawer] = useState(false);
    const handleShowReject = (transactionId) => () => {
        setTransactionId(transactionId);
        if (window.innerWidth >= 1024) {
            setShowReject(true);
            setOpenBottomRejectDrawer(false);
        } else {
            setShowReject(false);
            setOpenBottomRejectDrawer(true);
        }
    }

    const [moreData, setMoreData] = useState(null);
    const [showMoreData, setShowMoreData] = useState(false);
    const [openBottomMoreDataDrawer, setOpenBottomMoreDataDrawer] = useState(false);
    const handleShowMoreDetail = (data) => () => {
        setMoreData(data);
        if (window.innerWidth >= 1024) {
            setShowMoreData(true);
            setOpenBottomMoreDataDrawer(false);
        } else {
            setShowMoreData(false);
            setOpenBottomMoreDataDrawer(true);
        }
    }

    /**
     * Rejcet or Accept Giftcard Request.
     * @returns None
    */
    const changeGiftcardStatus = (transactionId, status) => (event) => {
        event.preventDefault();
        if (rejectDesc || status == 'Accepted') {
            setLoading(true);
            event.target.disabled = true;
            ApiCall(`/gift-card/${transactionId}/verify`, 'PATCH', locale, { status, confirmDescription: status == 'Rejected' ? rejectDesc : "string" }, '', 'admin', router).then(async (result) => {
                event.target.disabled = false;
                setLoading(false);
                getGiftcards(pageItem);
                setShowReject(false);
                setOpenBottomRejectDrawer(false);
                setRejectDesc('');
                dispatch({
                    type: 'setSnackbarProps', value: {
                        open: true, content: langText('Global.Success'),
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
    }

    const [productAmount, setProductAmount] = useState(1);
    /**
    * Calculates the input button increment and decrement value for giftcard Amount.
    * @returns None
    */
    const handleNumberInputBtn = (type) => (event) => {
        event.preventDefault();
        if (type == 'increment') {
            if (productAmount == '') {
                setProductAmount(1);
            } else if (productAmount > 50) {
                setProductAmount(50);
            } else if (productAmount < 1) {
                setProductAmount(1);
            } else {
                let amount = productAmount + 1;
                setProductAmount(parseInt(amount));
            }
        } else {
            if (productAmount == '') {
                setProductAmount(1);
            } else if (productAmount > 50) {
                setProductAmount(50);
            } else if (productAmount < 1) {
                setProductAmount(1);
            } else {
                let amount = productAmount - 1;
                setProductAmount(parseInt(amount));
            }
        }

    }

    /**
    * Calculates the input value for giftcard Amount.
    * @returns None
    */
    const handleChangeAmount = (event) => {
        const value = event.target.value;
        if (value == '') {
            setProductAmount(1);
        } else if (value > 50) {
            setProductAmount(50);
        } else if (value < 1) {
            setProductAmount(1);
        } else {
            setProductAmount(parseInt(value));
        }
    }

    return (
        <div className=" flex flex-col gap-y-8">
            <section className="flex items-center justify-between">
                <h1 className="text-2xl md:text-large-2">تنظیمات بخش گیفت کارت</h1>
                <div className="flex items-center gap-x-4">
                    {tabValue == 0 ? <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation onClick={handleShowAddGiftcardSettings}>
                        <text className="text-black font-semibold">افزودن تنظیمات</text>
                    </Button > : <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation onClick={handleShowGenerateCode}>
                        <text className="text-black font-semibold">ایجاد کد</text>
                    </Button >}
                </div>
            </section>
            {loadingGiftcardSettings ? '' : <Tabs variant="fullWidth" indicatorColor="primary" textColor="inherit" className="rounded-t-2xl -mt-1 lg:w-fit"
                value={tabValue}
                onChange={handleChange}>
                <Tab label="تنظیمات" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} />
                <Tab label="ایجاد کد گیفت کارت" className="whitespace-nowrap" classes={{ selected: 'text-primary' }} />
            </Tabs>}
            {tabValue == 0 ?
                <>
                    {loadingGiftcardSettings ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div>
                        :
                        <section className="overflow-x-auto overflow-y-hidden">
                            {giftcardSettings.length > 0 ?
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
                                                {giftcardSettings.map((data, index) => (
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
                                                                onClick={handleShowEditGiftcardSettings(data)}>
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
                                onConfirm={deleteGiftcardSettings}
                                title="آیا مطمئن هستید؟"
                                loading={deleteLoading}
                                darkModeToggle={darkModeToggle}
                            /> */}
                                </>
                                : <div className="py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">تنظیماتی یافت نشد</span>
                                </div>}
                        </section>}
                </>
                : <>
                    <div className="flex items-center justify-between gap-x-4">
                        <form autoComplete="off">
                            <FormControl className="w-full md:w-auto">
                                <TextField
                                    size="small"
                                    type="text"
                                    label="جستجو درخواست"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                    }}
                                    onChange={(event) => setSearchGiftcards(event.target.value)}
                                    onKeyDown={searchGiftcardsItemsHandler}
                                    onKeyUp={searchGiftcardsItems} />
                            </FormControl>
                        </form>
                        <div>
                            <span className="dark:text-white">تعداد کل: {loadingTransactions ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (transactionsTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                            {loadingTransactions ? '' : <IconButton
                                color={`${darkModeToggle ? 'white' : 'black'}`}
                                onClick={() => getGiftcards(pageItem)}>
                                <RefreshIcon />
                            </IconButton>}
                        </div>
                    </div>
                    {loadingTransactions ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div>
                        :
                        <section className="overflow-x-auto overflow-y-hidden">
                            {transactions.length > 0 ?
                                <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                        <TableHead className="dark:bg-dark">
                                            <TableRow>
                                                {GIFTCARDS_TABLE_HEAD.map((data, index) => (
                                                    <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
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
                                                    <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        {data?.createdBy?.role == 'User' || data?.createdBy?.role == 'VIPUser' ? <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data.createdBy?._id}`}>
                                                            <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                                                <span>({data.createdBy?.mobileNumber}) {data.createdBy?.firstName} {data.createdBy?.lastName}</span>
                                                            </a>
                                                        </LinkRouter> : <LinkRouter legacyBehavior href={`/admin/panel/adminsinglepage?id=${data.createdBy?._id}`}>
                                                            <a target="_blank" className="no-underline text-primary hover:underline">
                                                                <span>({data.createdBy?.mobileNumber}) {data.createdBy?.firstName} {data.createdBy?.lastName}</span>
                                                            </a>
                                                        </LinkRouter>}
                                                    </TableCell>
                                                    <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                        {data.tradeable ? <div className="flex items-center gap-x-4">
                                                            <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} alt={data.tradeable?.name}
                                                                className="w-10 h-10 rounded-[50%]" />
                                                            <span>{data.tradeable?.nameFa}</span>
                                                        </div> : ''}
                                                    </TableCell>
                                                    <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                        {(data.weight || 0.000).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم
                                                    </TableCell>
                                                    <TableCell className=" border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        {data?.status == 'Accepted' ? <div className="flex items-center gap-x-2">
                                                            <span>{data?.code}</span>
                                                            <IconButton onClick={CopyData(data?.code)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                                    <path d="M9.24984 18.9582H5.74984C2.4915 18.9582 1.0415 17.5082 1.0415 14.2498V10.7498C1.0415 7.4915 2.4915 6.0415 5.74984 6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V14.2498C13.9582 17.5082 12.5082 18.9582 9.24984 18.9582ZM5.74984 7.2915C3.1665 7.2915 2.2915 8.1665 2.2915 10.7498V14.2498C2.2915 16.8332 3.1665 17.7082 5.74984 17.7082H9.24984C11.8332 17.7082 12.7082 16.8332 12.7082 14.2498V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H5.74984Z" fill="#F1C40F" />
                                                                    <path d="M14.2498 13.9582H13.3332C12.9915 13.9582 12.7082 13.6748 12.7082 13.3332V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H6.6665C6.32484 7.2915 6.0415 7.00817 6.0415 6.6665V5.74984C6.0415 2.4915 7.4915 1.0415 10.7498 1.0415H14.2498C17.5082 1.0415 18.9582 2.4915 18.9582 5.74984V9.24984C18.9582 12.5082 17.5082 13.9582 14.2498 13.9582ZM13.9582 12.7082H14.2498C16.8332 12.7082 17.7082 11.8332 17.7082 9.24984V5.74984C17.7082 3.1665 16.8332 2.2915 14.2498 2.2915H10.7498C8.1665 2.2915 7.2915 3.1665 7.2915 5.74984V6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V12.7082Z" fill="#F1C40F" />
                                                                </svg>
                                                            </IconButton>
                                                        </div> : '------'}
                                                    </TableCell>
                                                    <TableCell className="text-center border-none py-4 text-sm dark:text-white">
                                                        <Button type="button" variant="text" size="medium" color="primary" className="rounded-lg" disableElevation
                                                            onClick={handleShowMoreDetail(data)}>
                                                            <text className=" font-semibold">جزئیات بیشتر</text>
                                                        </Button >
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                        <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                            .locale('fa')
                                                            .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                    </TableCell>
                                                    <TableCell className="text-center border-none px-8 py-4 text-sm dark:text-white">
                                                        {data.status == 'Pending' ? <Chip label="در انتظار تائید" variant="outlined" size="small" className="w-full badge badge-primary" /> : ''}
                                                        {data.status == 'Accepted' ? <Chip label="تائید شده" variant="outlined" size="small" className="w-full badge badge-success" /> : ''}
                                                        {data.status == 'Rejected' ? <Chip label="رد شده" variant="outlined" size="small" className="w-full badge badge-error" /> : ''}
                                                    </TableCell>
                                                    <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                        <div className="flex items-center">
                                                            {data.status == 'Pending' ?
                                                                <>
                                                                    <IconButton
                                                                        color={`success`}
                                                                        onClick={changeGiftcardStatus(data._id, 'Accepted')}>
                                                                        <CheckCircleIcon />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        color={`error`}
                                                                        onClick={handleShowReject(data._id)}>
                                                                        <CancelIcon />
                                                                    </IconButton>
                                                                </> : '----'}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                : <div className="py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">درخواستی ای یافت نشد</span>
                                </div>}
                        </section>}

                    {Math.ceil(transactionsTotal / transactionsLimit) > 1 ?
                        <div className="text-center mt-4">
                            <Pagination count={Math.ceil(transactionsTotal / transactionsLimit)} variant="outlined" color="primary" className="justify-center"
                                page={pageItem} onChange={handlePageChange} />
                        </div>
                        : ''}
                </>}

            {/* {Math.ceil(GiftcardSettingsTotal / GiftcardSettingsLimit) > 1 ?
                <div className="text-center mt-4">
                    <Pagination count={Math.ceil(GiftcardSettingsTotal / GiftcardSettingsLimit)} variant="outlined" color="primary" className="justify-center"
                        page={pageItem} onChange={(event, value) => setPageItem(value)} />
                </div>
                : ''} */}

            {/* AddGiftcardSettings */}
            <>
                <Dialog onClose={() => setShowAddGiftcardSettings(false)} open={showAddGiftcardSettings} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن تنظیمات
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowAddGiftcardSettings(false)}>
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
                        onSubmit={handleSubmit(saveGiftcardSettings)}
                    >
                        <div className="col-span-12 md:col-span-6">
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
                                name="preparationCost"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="هزینه آماده سازی گیفت کارت (به تومان)"
                                            variant="outlined"
                                            error={!!errors.preparationCost}
                                            helperText={errors.preparationCost ? errors.preparationCost.message : ''}
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
                                                handleChangeAddData(event, 'preparationCost', 'numberFormat');
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="shippingCost"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="هزینه ارسال گیفت کارت (به تومان)"
                                            variant="outlined"
                                            error={!!errors.shippingCost}
                                            helperText={errors.shippingCost ? errors.shippingCost.message : ''}
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
                                                handleChangeAddData(event, 'shippingCost', 'numberFormat');
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="minWeight"
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
                                            label="حداقل مقدار سفارش (به گرم)"
                                            variant="outlined"
                                            error={!!errors.minWeight}
                                            helperText={errors.minWeight ? errors.minWeight.message : ''}
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
                                                handleChangeAddData(event, 'minWeight', 'numberFormat');
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Autocomplete
                                multiple
                                limitTags={4}
                                freeSolo
                                open={openValidWeights}
                                onOpen={() => {
                                    setOpenValidWeights(true);
                                }}
                                onClose={() => {
                                    setOpenValidWeights(false);
                                }}
                                onChange={(event, newValue) => {
                                    const updatedValue = newValue?.map(value => Number(value));
                                    setAddGiftcardSettings(prevData => ({
                                        ...prevData,
                                        validWeights: updatedValue
                                    }));
                                }}
                                value={addGiftcardSettings?.validWeights}
                                options={[]}
                                renderTags={(value, getTagProps) =>
                                    value?.map((option, index) => {
                                        const { key, ...tagProps } = getTagProps({ index });
                                        return (
                                            <Chip variant="outlined" label={option} key={key} {...tagProps} className="badge badge-success mx-0.5" />
                                        );
                                    })
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        type="number"
                                        label="مقادیر مجاز گیفت کارت"
                                        placeholder="افزودن مقادیر مجاز گیفت کارت"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            ...params.InputProps,
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            endAdornment: (
                                                <div className="remove-all">
                                                    {params.InputProps.endAdornment}
                                                </div>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div className={`col-span-12 md:col-span-6`}>
                            <FormControl className="w-full">
                                <InputLabel id="demo-multiple-chip-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب نحوه تحویل</InputLabel>
                                <MUISelect
                                    labelId="demo-multiple-chip-label"
                                    id="demo-multiple-chip"
                                    multiple
                                    value={addGiftcardSettings?.deliveryTypes}
                                    onChange={(event) => {
                                        setAddGiftcardSettings(prevData => ({
                                            ...prevData,
                                            deliveryTypes: event.target.value
                                        }));
                                    }}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب نحوه تحویل"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }} />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            {selected.map((value, index) => (
                                                <Chip key={index} label={value == 'IN_PERSON' ? 'حضوری (شعبه)' : 'پستی'} variant="outlined" size="small" className="badge badge-success" />
                                            ))}
                                        </div>
                                    )}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                    <MenuItem value="IN_PERSON">حضوری (شعبه)</MenuItem>
                                    <MenuItem value="POSTAL">پستی</MenuItem>
                                </MUISelect>
                            </FormControl>
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
                    open={openBottomAddGiftcardSettingsDrawer}
                    onClose={() => setOpenBottomAddGiftcardSettingsDrawer(false)}
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
                                onClick={() => setOpenBottomAddGiftcardSettingsDrawer(false)}>
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
                        onSubmit={handleSubmit(saveGiftcardSettings)}
                    >
                        <div className="col-span-12 md:col-span-6">
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
                                name="preparationCost"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="هزینه آماده سازی گیفت کارت (به تومان)"
                                            variant="outlined"
                                            error={!!errors.preparationCost}
                                            helperText={errors.preparationCost ? errors.preparationCost.message : ''}
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
                                                handleChangeAddData(event, 'preparationCost', 'numberFormat');
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="shippingCost"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="هزینه ارسال گیفت کارت (به تومان)"
                                            variant="outlined"
                                            error={!!errors.shippingCost}
                                            helperText={errors.shippingCost ? errors.shippingCost.message : ''}
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
                                                handleChangeAddData(event, 'shippingCost', 'numberFormat');
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="minWeight"
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
                                            label="حداقل مقدار سفارش (به گرم)"
                                            variant="outlined"
                                            error={!!errors.minWeight}
                                            helperText={errors.minWeight ? errors.minWeight.message : ''}
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
                                                handleChangeAddData(event, 'minWeight', 'numberFormat');
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12">
                            <Autocomplete
                                multiple
                                limitTags={4}
                                freeSolo
                                open={openValidWeights}
                                onOpen={() => {
                                    setOpenValidWeights(true);
                                }}
                                onClose={() => {
                                    setOpenValidWeights(false);
                                }}
                                onChange={(event, newValue) => {
                                    const updatedValue = newValue?.map(value => Number(value));
                                    setAddGiftcardSettings(prevData => ({
                                        ...prevData,
                                        validWeights: updatedValue
                                    }));
                                }}
                                value={addGiftcardSettings?.validWeights}
                                options={[]}
                                renderTags={(value, getTagProps) =>
                                    value?.map((option, index) => {
                                        const { key, ...tagProps } = getTagProps({ index });
                                        return (
                                            <Chip variant="outlined" label={option} key={key} {...tagProps} className="badge badge-success mx-0.5" />
                                        );
                                    })
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        type="number"
                                        label="مقادیر مجاز گیفت کارت"
                                        placeholder="افزودن مقادیر مجاز گیفت کارت"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            ...params.InputProps,
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            endAdornment: (
                                                <div className="remove-all">
                                                    {params.InputProps.endAdornment}
                                                </div>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div className={`col-span-12`}>
                            <FormControl className="w-full">
                                <InputLabel id="demo-multiple-chip-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب نحوه تحویل</InputLabel>
                                <MUISelect
                                    labelId="demo-multiple-chip-label"
                                    id="demo-multiple-chip"
                                    multiple
                                    value={addGiftcardSettings?.deliveryTypes}
                                    onChange={(event) => {
                                        setAddGiftcardSettings(prevData => ({
                                            ...prevData,
                                            deliveryTypes: event.target.value
                                        }));
                                    }}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب نحوه تحویل"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }} />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            {selected.map((value, index) => (
                                                <Chip key={index} label={value == 'IN_PERSON' ? 'حضوری (شعبه)' : 'پستی'} variant="outlined" size="small" className="badge badge-success" />
                                            ))}
                                        </div>
                                    )}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                    <MenuItem value="IN_PERSON">حضوری (شعبه)</MenuItem>
                                    <MenuItem value="POSTAL">پستی</MenuItem>
                                </MUISelect>
                            </FormControl>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن تنظیمات</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* EditGiftcardSettings */}
            <>
                <Dialog onClose={() => setShowEditGiftcardSettings(false)} open={showEditGiftcardSettings} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش تنظیمات
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowEditGiftcardSettings(false)}>
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
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <InputLabel id="demo-simple-select-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                <MUISelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={settingData?.tradeable}
                                    disabled
                                    IconComponent={() => { }}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب واحد قابل معامله"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }} />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            <span className="!text-black dark:!text-white">{selected?.nameFa}</span>
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
                                    decimalScale={0}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="هزینه آماده سازی گیفت کارت (به تومان)"
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
                                    value={settingData?.preparationCost}
                                    onChange={handleChangeEditData('preparationCost', 'numberFormat')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={0}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="هزینه ارسال گیفت کارت (به تومان)"
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
                                    value={settingData?.shippingCost}
                                    onChange={handleChangeEditData('shippingCost', 'numberFormat')}
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
                                    label="حداقل مقدار سفارش (به گرم)"
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
                                    value={settingData?.minWeight}
                                    onChange={handleChangeEditData('minWeight', 'numberFormat')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Autocomplete
                                multiple
                                limitTags={4}
                                freeSolo
                                open={openEditValidWeights}
                                onOpen={() => {
                                    setOpenEditValidWeights(true);
                                }}
                                onClose={() => {
                                    setOpenEditValidWeights(false);
                                }}
                                onChange={(event, newValue) => {
                                    const updatedValue = newValue?.map(value => Number(value));
                                    setSettingData(prevData => ({
                                        ...prevData,
                                        validWeights: updatedValue
                                    }));
                                }}
                                value={settingData?.validWeights}
                                options={[]}
                                renderTags={(value, getTagProps) =>
                                    value?.map((option, index) => {
                                        const { key, ...tagProps } = getTagProps({ index });
                                        return (
                                            <Chip variant="outlined" label={option} key={key} {...tagProps} className="badge badge-success mx-0.5" />
                                        );
                                    })
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        type="number"
                                        label="مقادیر مجاز گیفت کارت"
                                        placeholder="افزودن مقادیر مجاز گیفت کارت"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            ...params.InputProps,
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            endAdornment: (
                                                <div className="remove-all">
                                                    {params.InputProps.endAdornment}
                                                </div>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div className={`col-span-12 md:col-span-6`}>
                            <FormControl className="w-full">
                                <InputLabel id="demo-multiple-chip-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب نحوه تحویل</InputLabel>
                                <MUISelect
                                    labelId="demo-multiple-chip-label"
                                    id="demo-multiple-chip"
                                    multiple
                                    value={settingData?.deliveryTypes || []}
                                    onChange={(event) => {
                                        setSettingData(prevData => ({
                                            ...prevData,
                                            deliveryTypes: event.target.value
                                        }));
                                    }}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب نحوه تحویل"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }} />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            {selected.map((value, index) => (
                                                <Chip key={index} label={value == 'IN_PERSON' ? 'حضوری (شعبه)' : 'پستی'} variant="outlined" size="small" className="badge badge-success" />
                                            ))}
                                        </div>
                                    )}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                    <MenuItem value="IN_PERSON">حضوری (شعبه)</MenuItem>
                                    <MenuItem value="POSTAL">پستی</MenuItem>
                                </MUISelect>
                            </FormControl>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={editGiftcardSettings(settingData?._id)}>
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
                    open={openBottomEditGiftcardSettingsDrawer}
                    onClose={() => setOpenBottomEditGiftcardSettingsDrawer(false)}
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
                                onClick={() => setOpenBottomEditGiftcardSettingsDrawer(false)}>
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
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <InputLabel id="demo-simple-select-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                <MUISelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={settingData?.tradeable}
                                    disabled
                                    IconComponent={() => { }}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب واحد قابل معامله"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }} />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            <span className="!text-black dark:!text-white">{selected?.nameFa}</span>
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
                                    decimalScale={0}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="هزینه آماده سازی گیفت کارت (به تومان)"
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
                                    value={settingData?.preparationCost}
                                    onChange={handleChangeEditData('preparationCost', 'numberFormat')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={0}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="هزینه ارسال گیفت کارت (به تومان)"
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
                                    value={settingData?.shippingCost}
                                    onChange={handleChangeEditData('shippingCost', 'numberFormat')}
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
                                    label="حداقل مقدار سفارش (به گرم)"
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
                                    value={settingData?.minWeight}
                                    onChange={handleChangeEditData('minWeight', 'numberFormat')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <Autocomplete
                                multiple
                                limitTags={4}
                                freeSolo
                                open={openEditValidWeights}
                                onOpen={() => {
                                    setOpenEditValidWeights(true);
                                }}
                                onClose={() => {
                                    setOpenEditValidWeights(false);
                                }}
                                onChange={(event, newValue) => {
                                    const updatedValue = newValue?.map(value => Number(value));
                                    setSettingData(prevData => ({
                                        ...prevData,
                                        validWeights: updatedValue
                                    }));
                                }}
                                value={settingData?.validWeights}
                                options={[]}
                                renderTags={(value, getTagProps) =>
                                    value?.map((option, index) => {
                                        const { key, ...tagProps } = getTagProps({ index });
                                        return (
                                            <Chip variant="outlined" label={option} key={key} {...tagProps} className="badge badge-success mx-0.5" />
                                        );
                                    })
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        type="number"
                                        label="مقادیر مجاز گیفت کارت"
                                        placeholder="افزودن مقادیر مجاز گیفت کارت"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            ...params.InputProps,
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            endAdornment: (
                                                <div className="remove-all">
                                                    {params.InputProps.endAdornment}
                                                </div>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div className={`col-span-12`}>
                            <FormControl className="w-full">
                                <InputLabel id="demo-multiple-chip-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب نحوه تحویل</InputLabel>
                                <MUISelect
                                    labelId="demo-multiple-chip-label"
                                    id="demo-multiple-chip"
                                    multiple
                                    value={settingData?.deliveryTypes || []}
                                    onChange={(event) => {
                                        setSettingData(prevData => ({
                                            ...prevData,
                                            deliveryTypes: event.target.value
                                        }));
                                    }}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب نحوه تحویل"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }} />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            {selected.map((value, index) => (
                                                <Chip key={index} label={value == 'IN_PERSON' ? 'حضوری (شعبه)' : 'پستی'} variant="outlined" size="small" className="badge badge-success" />
                                            ))}
                                        </div>
                                    )}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                    <MenuItem value="IN_PERSON">حضوری (شعبه)</MenuItem>
                                    <MenuItem value="POSTAL">پستی</MenuItem>
                                </MUISelect>
                            </FormControl>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={editGiftcardSettings(settingData?._id)}>
                                <text className="text-black font-semibold">ویرایش تنظیمات</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* GenerateGiftcardCode */}
            <>
                <Dialog onClose={() => setShowGenerateCode(false)} open={showGenerateCode} maxWidth={'sm'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ایجاد کد
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowGenerateCode(false)}>
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
                        onSubmit={handleSubmitGenerate(generateCode)}
                    >
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="tradeableId"
                                control={controlGenerate}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <InputLabel id="demo-simple-select-label" error={!!errorsGenerate.tradeableId}
                                            sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                        <MUISelect
                                            {...field}
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            onChange={(event) => {
                                                field.onChange(event); setFormData({
                                                    ...formData, tradeableId: event.target.value,
                                                    weight: Number(giftcardSettings?.find(item => item?.tradeable?._id == event.target.value)?.validWeights[0])
                                                });
                                                setGenerateValue('weight', giftcardSettings?.find(item => item?.tradeable?._id == event.target.value)?.validWeights[0]);
                                            }}
                                            input={<OutlinedInput
                                                id="select-multiple-chip"
                                                label="انتخاب واحد قابل معامله"
                                                className="dark:bg-dark *:dark:text-white"
                                                sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                            />}
                                            error={!!errorsGenerate.tradeableId}
                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                            {tradeables?.map((data, index) => (
                                                <MenuItem key={index} value={data._id}>{data.nameFa}</MenuItem>
                                            ))}
                                        </MUISelect>
                                        {errorsGenerate.tradeableId && <FormHelperText className="text-red-500 !mx-4">{errorsGenerate.tradeableId.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6 base-NumberInput-root flex items-center gap-x-1 rounded-2xl border border-solid border-primary py-1.5">
                            <IconButton className="base-NumberInput decrement ms-2 h-full flex-[1] flex items-center justify-center p-0.5 bg-transparent border-none text-primary rounded-2xl *:text-xl"
                                onClick={handleNumberInputBtn('decrement')}>
                                <RemoveIcon />
                            </IconButton>
                            <input type="number" min="1" max="10" autocomplete="off" autocorrect="off" spellcheck="false"
                                className="flex-[1] bg-transparent border-none dark:text-white !outline-none text-center"
                                value={productAmount} onChange={handleChangeAmount} />
                            <IconButton className="base-NumberInput increment me-2 h-full flex-[1] flex items-center justify-center p-0.5 bg-transparent border-none text-primary rounded-2xl *:text-xl"
                                onClick={handleNumberInputBtn('increment')}>
                                <AddIcon />
                            </IconButton>
                        </div>
                        {formData?.tradeableId ? <div className="col-span-12">
                            {giftcardSettings?.find(item => item?.tradeable?._id == formData?.tradeableId)?.validWeights?.length > 0 ? <div className="lg:grid grid-cols-12 gap-2 flex flex-nowrap overflow-x-auto overflow-y-hidden pb-2">
                                {giftcardSettings?.find(item => item?.tradeable?._id == formData?.tradeableId)?.validWeights?.map((data, index) => {
                                    return (
                                        <div className={`col-span-3`} key={index}>
                                            <input type="radio" className="hidden peer" id={data} name="card" defaultChecked={index == 0} onChange={(event) => {
                                                setFormData({ ...formData, weight: Number(event.target.id) });
                                                setGenerateValue('weight', event.target.id);
                                            }} />
                                            <label htmlFor={data} className="custom-card rounded-2xl p-2 flex items-center justify-center transition cursor-pointer border border-light-secondary-foreground dark:border-dark border-solid peer-checked:border-primary peer-checked:border-solid">
                                                {data} گرمی
                                            </label>
                                        </div>
                                    )
                                })}
                            </div> : ''}
                        </div> : <div className="h-[60px]"></div>}
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">ایجاد کد</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomGenerateCodeDrawer}
                    onClose={() => setOpenBottomGenerateCodeDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ایجاد کد
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomGenerateCodeDrawer(false)}>
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
                        onSubmit={handleSubmitGenerate(generateCode)}
                    >
                        <div className="col-span-12">
                            <Controller
                                name="tradeableId"
                                control={controlGenerate}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <InputLabel id="demo-simple-select-label" error={!!errorsGenerate.tradeableId}
                                            sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                        <MUISelect
                                            {...field}
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            onChange={(event) => {
                                                field.onChange(event); setFormData({
                                                    ...formData, tradeableId: event.target.value,
                                                    weight: Number(giftcardSettings?.find(item => item?.tradeable?._id == event.target.value)?.validWeights[0])
                                                });
                                                setGenerateValue('weight', giftcardSettings?.find(item => item?.tradeable?._id == event.target.value)?.validWeights[0]);
                                            }}
                                            input={<OutlinedInput
                                                id="select-multiple-chip"
                                                label="انتخاب واحد قابل معامله"
                                                className="dark:bg-dark *:dark:text-white"
                                                sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                            />}
                                            error={!!errorsGenerate.tradeableId}
                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                            {tradeables?.map((data, index) => (
                                                <MenuItem key={index} value={data._id}>{data.nameFa}</MenuItem>
                                            ))}
                                        </MUISelect>
                                        {errorsGenerate.tradeableId && <FormHelperText className="text-red-500 !mx-4">{errorsGenerate.tradeableId.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 h-full base-NumberInput-root flex items-center gap-x-1 rounded-2xl border border-solid border-primary py-1.5">
                            <IconButton className="base-NumberInput decrement ms-2 h-full flex-[1] flex items-center justify-center p-0.5 bg-transparent border-none text-primary rounded-2xl *:text-xl"
                                onClick={handleNumberInputBtn('decrement')}>
                                <RemoveIcon />
                            </IconButton>
                            <input type="number" min="1" max="10" autocomplete="off" autocorrect="off" spellcheck="false"
                                className="flex-[1] bg-transparent border-none dark:text-white !outline-none text-center"
                                value={productAmount} onChange={handleChangeAmount} />
                            <IconButton className="base-NumberInput increment me-2 h-full flex-[1] flex items-center justify-center p-0.5 bg-transparent border-none text-primary rounded-2xl *:text-xl"
                                onClick={handleNumberInputBtn('increment')}>
                                <AddIcon />
                            </IconButton>
                        </div>
                        {formData?.tradeableId ? <div className="col-span-12">
                            {giftcardSettings?.find(item => item?.tradeable?._id == formData?.tradeableId)?.validWeights?.length > 0 ? <div className="lg:grid grid-cols-12 gap-2 flex flex-nowrap overflow-x-auto overflow-y-hidden pb-2">
                                {giftcardSettings?.find(item => item?.tradeable?._id == formData?.tradeableId)?.validWeights?.map((data, index) => {
                                    return (
                                        <div className={`col-span-3`} key={index}>
                                            <input type="radio" className="hidden peer" id={data} name="card" defaultChecked={index == 0} onChange={(event) => {
                                                setFormData({ ...formData, weight: Number(event.target.id) });
                                                setGenerateValue('weight', event.target.id);
                                            }} />
                                            <label htmlFor={data} className="custom-card rounded-2xl p-2 flex items-center justify-center transition cursor-pointer border border-light-secondary-foreground dark:border-dark border-solid peer-checked:border-primary peer-checked:border-solid">
                                                {data} گرمی
                                            </label>
                                        </div>
                                    )
                                })}
                            </div> : ''}
                        </div> : <div className="h-[60px]"></div>}
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">ایجاد کد</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* Reject Transactions */}
            <>
                <Dialog onClose={() => setShowReject(false)} open={showReject} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-4">
                        <FormControl>
                            <TextField
                                type="text"
                                label="توضیحات رد درخواست "
                                multiline
                                maxRows={8}
                                rows={4}
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                onChange={(event) => setRejectDesc(event.target.value)} />
                        </FormControl>
                        <div className="flex items-center justify-end gap-x-2">
                            <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={changeGiftcardStatus(transactionId, 'Rejected')}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >
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
                    <div className="flex flex-col gap-y-4">
                        <FormControl>
                            <TextField
                                type="text"
                                label="توضیحات رد درخواست "
                                multiline
                                maxRows={8}
                                rows={4}
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                onChange={(event) => setRejectDesc(event.target.value)} />
                        </FormControl>
                        <div className="flex">
                            <LoadingButton type="button" variant="contained" size="medium" fullWidth className="rounded-lg" disableElevation loading={loading}
                                onClick={changeGiftcardStatus(transactionId, 'Rejected')}>
                                <text className="text-black font-semibold">ثبت</text>
                            </LoadingButton >
                        </div>
                    </div>
                </SwipeableDrawer>
            </>

            {/* More Details */}
            <>
                <Dialog onClose={() => setShowMoreData(false)} open={showMoreData} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-4">
                        <div className="flex flex-col gap-y-4 w-full h-full">
                            <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>کد گیفت کارت:</span>
                                {moreData?.status == 'Accepted' ? <div className="flex items-center gap-x-2">
                                    <span>{moreData?.code}</span>
                                    <IconButton onClick={CopyData(moreData?.code)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M9.24984 18.9582H5.74984C2.4915 18.9582 1.0415 17.5082 1.0415 14.2498V10.7498C1.0415 7.4915 2.4915 6.0415 5.74984 6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V14.2498C13.9582 17.5082 12.5082 18.9582 9.24984 18.9582ZM5.74984 7.2915C3.1665 7.2915 2.2915 8.1665 2.2915 10.7498V14.2498C2.2915 16.8332 3.1665 17.7082 5.74984 17.7082H9.24984C11.8332 17.7082 12.7082 16.8332 12.7082 14.2498V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H5.74984Z" fill="#F1C40F" />
                                            <path d="M14.2498 13.9582H13.3332C12.9915 13.9582 12.7082 13.6748 12.7082 13.3332V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H6.6665C6.32484 7.2915 6.0415 7.00817 6.0415 6.6665V5.74984C6.0415 2.4915 7.4915 1.0415 10.7498 1.0415H14.2498C17.5082 1.0415 18.9582 2.4915 18.9582 5.74984V9.24984C18.9582 12.5082 17.5082 13.9582 14.2498 13.9582ZM13.9582 12.7082H14.2498C16.8332 12.7082 17.7082 11.8332 17.7082 9.24984V5.74984C17.7082 3.1665 16.8332 2.2915 14.2498 2.2915H10.7498C8.1665 2.2915 7.2915 3.1665 7.2915 5.74984V6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V12.7082Z" fill="#F1C40F" />
                                        </svg>
                                    </IconButton>
                                </div> : '------'}
                            </div>
                            <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>بارکد:</span>
                                {moreData?.code && moreData?.status == 'Accepted' ? <div id={`qrcode${moreData?._id}`} className="qrcode-container w-10 h-10 cursor-pointer" onClick={openInNewTab(moreData?._id)}>
                                    <Image
                                        text={moreData?.code || 'test'}
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
                            </div>
                            <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>استفاده شده:</span>
                                {moreData?.used ? <Chip label="بله" variant="outlined" size="small" className="w-fit px-8 badge badge-success" /> :
                                    <Chip label="خیر" variant="outlined" size="small" className="w-fit px-8 badge badge-error" />}
                            </div>
                            <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>استفاده کننده:</span>
                                {moreData?.used ? <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${moreData?.usedBy?._id}`}>
                                    <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                        <span>({moreData?.usedBy?.mobileNumber}) {moreData?.usedBy?.firstName} {moreData?.usedBy?.lastName}</span>
                                    </a>
                                </LinkRouter> : '------'}
                            </div>
                            {moreData?.createdBy?.role == 'User' || moreData?.createdBy?.role == 'VIPUser' ? <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>هزینه آماده سازی:</span>
                                <span>{(moreData?.preparationCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                            </div> : ''}
                            {moreData?.address ?
                                <>
                                    <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                        <span>هزینه ارسال:</span>
                                        <span>{(moreData?.shippingCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                        <span>کد پستی:</span>
                                        <span>{moreData?.postalCode}</span>
                                    </div>
                                    <div className="dark:text-white">
                                        <span>آدرس: {moreData?.address}</span>
                                    </div>
                                </> : ''}
                        </div>
                        <div className="flex items-center justify-end gap-x-2">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                onClick={() => setShowMoreData(false)}>
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
                    open={openBottomMoreDataDrawer}
                    onClose={() => setOpenBottomMoreDataDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <div className="flex flex-col gap-y-4">
                        <div className="flex flex-col gap-y-4">
                            <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>کد گیفت کارت:</span>
                                {moreData?.status == 'Accepted' ? <div className="flex items-center gap-x-2">
                                    <span>{moreData?.code}</span>
                                    <IconButton onClick={CopyData(moreData?.code)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M9.24984 18.9582H5.74984C2.4915 18.9582 1.0415 17.5082 1.0415 14.2498V10.7498C1.0415 7.4915 2.4915 6.0415 5.74984 6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V14.2498C13.9582 17.5082 12.5082 18.9582 9.24984 18.9582ZM5.74984 7.2915C3.1665 7.2915 2.2915 8.1665 2.2915 10.7498V14.2498C2.2915 16.8332 3.1665 17.7082 5.74984 17.7082H9.24984C11.8332 17.7082 12.7082 16.8332 12.7082 14.2498V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H5.74984Z" fill="#F1C40F" />
                                            <path d="M14.2498 13.9582H13.3332C12.9915 13.9582 12.7082 13.6748 12.7082 13.3332V10.7498C12.7082 8.1665 11.8332 7.2915 9.24984 7.2915H6.6665C6.32484 7.2915 6.0415 7.00817 6.0415 6.6665V5.74984C6.0415 2.4915 7.4915 1.0415 10.7498 1.0415H14.2498C17.5082 1.0415 18.9582 2.4915 18.9582 5.74984V9.24984C18.9582 12.5082 17.5082 13.9582 14.2498 13.9582ZM13.9582 12.7082H14.2498C16.8332 12.7082 17.7082 11.8332 17.7082 9.24984V5.74984C17.7082 3.1665 16.8332 2.2915 14.2498 2.2915H10.7498C8.1665 2.2915 7.2915 3.1665 7.2915 5.74984V6.0415H9.24984C12.5082 6.0415 13.9582 7.4915 13.9582 10.7498V12.7082Z" fill="#F1C40F" />
                                        </svg>
                                    </IconButton>
                                </div> : '------'}
                            </div>
                            <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>بارکد:</span>
                                {moreData?.code && moreData?.status == 'Accepted' ? <div id={`qrcode${moreData?._id}`} className="qrcode-container w-10 h-10 cursor-pointer" onClick={openInNewTab(moreData?._id)}>
                                    <Image
                                        text={moreData?.code || 'test'}
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
                            </div>
                            <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>استفاده شده:</span>
                                {moreData?.used ? <Chip label="بله" variant="outlined" size="small" className="w-fit px-8 badge badge-success" /> :
                                    <Chip label="خیر" variant="outlined" size="small" className="w-fit px-8 badge badge-error" />}
                            </div>
                            <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>استفاده کننده:</span>
                                {moreData?.used ? <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${moreData?.usedBy?._id}`}>
                                    <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                        <span>({moreData?.usedBy?.mobileNumber}) {moreData?.usedBy?.firstName} {moreData?.usedBy?.lastName}</span>
                                    </a>
                                </LinkRouter> : '------'}
                            </div>
                            {moreData?.createdBy?.role == 'User' || moreData?.createdBy?.role == 'VIPUser' ? <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                <span>هزینه آماده سازی:</span>
                                <span>{(moreData?.preparationCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                            </div> : ''}
                            {moreData?.address ?
                                <>
                                    <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                        <span>هزینه ارسال:</span>
                                        <span>{(moreData?.shippingCost || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-x-8 dark:text-white">
                                        <span>کد پستی:</span>
                                        <span>{moreData?.postalCode}</span>
                                    </div>
                                    <div className="dark:text-white">
                                        <span>آدرس: {moreData?.address}</span>
                                    </div>
                                </> : ''}
                        </div>
                        <div className="flex justify-end">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                onClick={() => setOpenBottomMoreDataDrawer(false)}>
                                <text className="text-black font-semibold">بستن</text>
                            </Button >
                        </div>
                    </div>
                </SwipeableDrawer>
            </>
        </div>
    )
}

export default GiftcardSettingsPageCompo;