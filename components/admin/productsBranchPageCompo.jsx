import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
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
import MUISelect from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import moment from 'jalali-moment'
import DatePicker from "react-datepicker2"

import { PatternFormat, NumericFormat } from 'react-number-format';

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
import ConvertText from "../../services/convertPersianToEnglish";

// Components
import CustomSwitch from "../shared/CustomSwitch"
import ConfirmDialog from '../shared/ConfirmDialog';
import TabPanel from "../shared/TabPanel"

/**
 * ProductsBranchPageCompo component that displays the ProductsBranch Page Component of the website.
 * @returns The rendered ProductsBranch Page component.
 */
const ProductsBranchPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);

    const BRANCHES_TABLE_HEAD = [
        {
            label: 'نام شعبه',
            classes: ""
        },
        {
            label: 'شماره تماس',
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
        }
    ]
    const TIME_BRANCHES_TABLE_HEAD = [
        {
            label: 'نام شعبه',
            classes: ""
        },
        {
            label: 'بازه زمانی',
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
        }
    ]

    const [pageItem, setPageItem] = useState(1);
    useEffect(() => {
        getBranches(1);
    }, []);

    /**
        * Retrieves Branches.
        * @returns None
       */
    const [branches, setBranches] = useState([]);
    const [loadingBranches, setLoadingBranches] = useState(true);
    const [branchesLimit, setBranchesLimit] = useState(10);
    const [branchesTotal, setBranchesTotal] = useState(0);
    const getBranches = (page, search) => {
        setLoadingBranches(true);
        ApiCall('/branch', 'GET', locale, {}, `${search ? `search=${search}&` : ''}`, 'admin', router).then(async (result) => {
            setBranches(result.data);
            setLoadingBranches(false);
        }).catch((error) => {
            setLoadingBranches(false);
            console.log(error);
        });
    }

    const [showAddBranches, setShowAddBranches] = useState(false);
    const [openBottomAddBranchesDrawer, setOpenBottomAddBranchesDrawer] = useState(false);
    const handleShowAddBranches = () => {
        if (window.innerWidth >= 1024) {
            setShowAddBranches(true);
            setOpenBottomAddBranchesDrawer(false);
        } else {
            setShowAddBranches(false);
            setOpenBottomAddBranchesDrawer(true);
        }
    }

    const [branchData, setBranchData] = useState(null);
    const [showEditBranches, setShowEditBranches] = useState(false);
    const [openBottomEditBranchesDrawer, setOpenBottomEditBranchesDrawer] = useState(false);
    const handleShowEditBranches = (data) => () => {
        setBranchData(data);
        if (window.innerWidth >= 1024) {
            setShowEditBranches(true);
            setOpenBottomEditBranchesDrawer(false);
        } else {
            setShowEditBranches(false);
            setOpenBottomEditBranchesDrawer(true);
        }
    }

    const [tabValue, setTabValue] = useState(0);
    const handleChange = (event, newValue) => {
        setTabValue(newValue);
        if (newValue == 0) {
            getBranches(1);
        } else {
            getTimeBranches(1);
        }
    }

    const [addBranches, setAddBranches] = useState({
        name: '',
        nameFa: '',
        address: '',
        phone: '',
        description: ''
    });

    const validationBranchSchema = Yup.object({
        name: Yup.string().required('این فیلد الزامی است'),
        nameFa: Yup.string().required('این فیلد الزامی است'),
        address: Yup.string().required('این فیلد الزامی است'),
        phone: Yup.string().required('این فیلد الزامی است'),
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationBranchSchema),
    });

    const clearForm = () => {
        setValue('name', '');
        setValue('nameFa', '');
        setValue('phone', '');
        setValue('address', '');
    }

    const handlePageChange = (event, value) => {
        setPageItem(value);
        getTimeBranches(value);
    }

    /**
         * Handles the change event for saving Branch data.
         * @param {string} input - The name of the input field being changed.
         * @param {string} type - The type of the input field.
         * @param {Event} event - The change event object.
         * @returns None
         */
    const handleChangeAddBranchData = (event, input, type) => {
        let value;
        switch (type) {
            case "checkbox":
                value = event.target.checked;
                break;
            case "numberFormat":
                value = Number(event.target.value?.replace(/,/g, ''));
                break;
            case "mobileNumberFormat":
                if (event.value == '') {
                    value = '';
                } else {
                    const inputNumber = ConvertText(event.value);
                    value = `${inputNumber.startsWith("0") ? inputNumber : `0${inputNumber}`}`;
                }
                break;
            default:
                value = event.target.value;
                break;
        }
        setAddBranches((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
     * Handles the change event for Eding Branch inputs.
     * @param {string} input - The name of the input field being changed.
     * @param {string} type - The type of the input field.
     * @param {Event} event - The change event object.
     * @returns None
     */
    const handleChangeEditBranchData = (input, type) => (event) => {
        let value;
        switch (type) {
            case "checkbox":
                value = event.target.checked;
                break;
            case "numberFormat":
                value = Number(event.target.value.replace(/,/g, ''));
                break;
            case "mobileNumberFormat":
                if (event.value == '') {
                    value = '';
                } else {
                    const inputNumber = ConvertText(event.value);
                    value = `${inputNumber.startsWith("0") ? inputNumber : `0${inputNumber}`}`;
                }
                break;
            default:
                value = event.target.value;
                break;
        }
        setBranchData((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
        * Save new Branch.
        * @returns None
    */
    const saveBranch = () => {
        setLoading(true);
        ApiCall('/branch', 'POST', locale, addBranches, '', 'admin', router).then(async (result) => {
            setLoading(false);
            getBranches(1);
            setShowAddBranches(false);
            setOpenBottomAddBranchesDrawer(false);
            setAddBranches({
                name: '',
                nameFa: '',
                address: '',
                phone: '',
                description: ''
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
     * Edit A Branch.
     * @returns None
    */
    const editBranch = (branchId) => (event) => {
        event.preventDefault();
        setLoading(true);
        let body = FilterEmptyFields(branchData);
        const filteredData = FilterObjectFields(body, [
            "name",
            "nameFa",
            "address",
            "phone",
            "description"
        ]);
        ApiCall(`/branch/${branchId}`, 'PATCH', locale, { ...filteredData }, '', 'admin', router).then(async (result) => {
            event.target.disabled = false;
            setLoading(false);
            setShowEditBranches(false);
            setOpenBottomEditBranchesDrawer(false);
            setBranchData();
            getBranches(1);
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

    const [openDialog, setOpenDialog] = useState(false);
    const [recordId, setRecordId] = useState('');
    const handleOpenDialog = (recordFieldId) => (event) => {
        setRecordId(recordFieldId);
        setOpenDialog(true);
    }
    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    /**
    * Delete a Branch.
    * @returns None
   */
    const [deleteLoading, setDeleteLoading] = useState(false);
    const deleteBranch = () => {
        setDeleteLoading(true);
        ApiCall(`/branch/${recordId}`, 'DELETE', locale, {}, '', 'admin', router).then(async (result) => {
            setDeleteLoading(false);
            getBranches(1);
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
        * Retrieves TimeBranches.
        * @returns None
       */
    const [timeBranches, setTimeBranches] = useState([]);
    const [loadingTimeBranches, setLoadingTimeBranches] = useState(true);
    const [timeBranchesLimit, setTimeBranchesLimit] = useState(10);
    const [timeBranchesTotal, setTimeBranchesTotal] = useState(0);

    const getTimeBranches = (page, search) => {
        setLoadingTimeBranches(true);
        ApiCall('/branch/branch-time', 'GET', locale, {}, `${search ? `search=${search}&` : ''}sortOrder=0&sortBy=createdAt&limit=${timeBranchesLimit}&skip=${(page * timeBranchesLimit) - timeBranchesLimit}`, 'admin', router).then(async (result) => {
            setTimeBranchesTotal(result.count);
            setTimeBranches(result.data);
            setLoadingTimeBranches(false);
        }).catch((error) => {
            setLoadingTimeBranches(false);
            console.log(error);
        });
    }

    const [showAddTimeBranches, setShowAddTimeBranches] = useState(false);
    const [openBottomAddTimeBranchesDrawer, setOpenBottomAddTimeBranchesDrawer] = useState(false);
    const handleShowAddTimeBranches = () => {
        if (window.innerWidth >= 1024) {
            setShowAddTimeBranches(true);
            setOpenBottomAddTimeBranchesDrawer(false);
        } else {
            setShowAddTimeBranches(false);
            setOpenBottomAddTimeBranchesDrawer(true);
        }
    }

    const validationTimeBranchSchema = Yup.object({
        branchId: Yup.string().required('این فیلد الزامی است'),
        capacity: Yup.string().required('این فیلد الزامی است'),
        startTime: Yup.string().required('این فیلد الزامی است'),
        endTime: Yup.string().required('این فیلد الزامی است'),
    });

    const { control: controlTimeBranch, setValue: setTimeBranchValue, handleSubmit: handleTimeBranchSubmit, formState: { errors: errorsTimeBranch } } = useForm({
        resolver: yupResolver(validationTimeBranchSchema),
    });

    const clearTimeBranchForm = () => {
        setTimeBranchValue('startTime', '');
        setTimeBranchValue('endTime', '');
        setTimeBranchValue('capacity', '');
    }

    const [timeBranchData, setTimeBranchData] = useState(null);
    const [showEditTimeBranches, setShowEditTimeBranches] = useState(false);
    const [openBottomEditTimeBranchesDrawer, setOpenBottomEditTimeBranchesDrawer] = useState(false);
    const handleShowEditTimeBranches = (data) => () => {
        setTimeBranchData(data);
        setEditStartTime(moment(data.startTime).format("jYYYY-jMM-jDD HH:mm"));
        setEditEndTime(moment(data.endTime).format("jYYYY-jMM-jDD HH:mm"));
        if (window.innerWidth >= 1024) {
            setShowEditTimeBranches(true);
            setOpenBottomEditTimeBranchesDrawer(false);
        } else {
            setShowEditTimeBranches(false);
            setOpenBottomEditTimeBranchesDrawer(true);
        }
    }

    /**
     * save TimeBranche start and end time with the selected date from the datepicker.
     * @param {Event} event - The event object containing the selected date.
     * @returns None
     */
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isGregorian, setIsGregorian] = useState(locale == "fa" ? false : true);
    const limitDatepicker = (event, type) => {
        setAddTimeBranches({ ...addTimeBranches, [type]: event.locale(locale).format("YYYY-MM-DDTHH:mm:ssZ") });
        if (locale == 'fa') {
            type == 'startTime' ? setStartTime(event.locale(locale).format("jYYYY-jMM-jDD HH:mm")) : setEndTime(event.locale(locale).format("jYYYY-jMM-jDD HH:mm"));
        } else {
            type == 'startTime' ? setStartTime(event.locale(locale).format("YYYY-MM-DD HH:mm")) : setEndTime(event.locale(locale).format("YYYY-MM-DD HH:mm"));
        }
    }

    /**
     * edit TimeBranche start and end time with the selected date from the datepicker.
     * @param {Event} event - The event object containing the selected date.
     * @returns None
     */
    const [editStartTime, setEditStartTime] = useState('');
    const [editEndTime, setEditEndTime] = useState('');
    const editLimitDatepicker = (event, type) => {
        setTimeBranchData({ ...timeBranchData, [type]: event.locale(locale).format("YYYY-MM-DDTHH:mm:ssZ") });
        if (locale == 'fa') {
            type == 'startTime' ? setEditStartTime(event.locale(locale).format("jYYYY-jMM-jDD HH:mm")) : setEditEndTime(event.locale(locale).format("jYYYY-jMM-jDD HH:mm"));
        } else {
            type == 'startTime' ? setEditStartTime(event.locale(locale).format("YYYY-MM-DD HH:mm")) : setEditEndTime(event.locale(locale).format("YYYY-MM-DD HH:mm"));
        }
    }

    const [addTimeBranches, setAddTimeBranches] = useState({
        branchId: '',
        startTime: '',
        endTime: '',
        capacity: '',
        isRecurring: true
    });

    /**
         * Handles the change event for saving Time Branch data.
         * @param {string} input - The name of the input field being changed.
         * @param {string} type - The type of the input field.
         * @param {Event} event - The change event object.
         * @returns None
         */
    const handleChangeAddTimeBranchData = (event, input, type) => {
        let value;
        switch (type) {
            case "checkbox":
                value = event.target.checked;
                break;
            case "numberFormat":
                value = Number(event.target.value?.replace(/,/g, ''));
                break;
            case "mobileNumberFormat":
                if (event.target.value == '') {
                    value = '';
                } else {
                    const inputNumber = ConvertText(event.target.value.replace(/[^0-9\u0660-\u0669\u06F0-\u06F9]/g, ''));
                    value = `${inputNumber.startsWith("0") ? inputNumber : `0${inputNumber}`}`;
                }
                break;
            default:
                value = event.target.value;
                break;
        }
        setAddTimeBranches((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
     * Handles the change event for Eding Time Branch inputs.
     * @param {string} input - The name of the input field being changed.
     * @param {string} type - The type of the input field.
     * @param {Event} event - The change event object.
     * @returns None
     */
    const handleChangeEditTimeBranchData = (input, type) => (event) => {
        let value;
        switch (type) {
            case "checkbox":
                value = event.target.checked;
                break;
            case "numberFormat":
                value = Number(event.target.value.replace(/,/g, ''));
                break;
            case "mobileNumberFormat":
                if (event.value == '') {
                    value = '';
                } else {
                    const inputNumber = ConvertText(event.value.replace(/[^0-9\u0660-\u0669\u06F0-\u06F9]/g, ''));
                    value = `${inputNumber.startsWith("0") ? inputNumber : `0${inputNumber}`}`;
                }
                break;
            default:
                value = event.target.value;
                break;
        }
        setTimeBranchData((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
        * Save new Branch.
        * @returns None
    */
    const saveTimeBranch = () => {
        setLoading(true);
        ApiCall('/branch/branch-time', 'POST', locale, { ...addTimeBranches }, '', 'admin', router).then(async (result) => {
            setLoading(false);
            getTimeBranches(1);
            setShowAddTimeBranches(false);
            setOpenBottomAddTimeBranchesDrawer(false);
            setAddTimeBranches({
                branchId: addTimeBranches?.branchId,
                startTime: '',
                endTime: '',
                capacity: '',
                isRecurring: true
            });
            setStartTime('');
            setEndTime('');
            clearTimeBranchForm();
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
     * Edit A Time Branch.
     * @returns None
    */
    const editTimeBranch = (timeBranchId) => (event) => {
        event.preventDefault();
        setLoading(true);
        let body = FilterEmptyFields(timeBranchData);
        const filteredData = FilterObjectFields(body, [
            "branchId",
            "startTime",
            "endTime",
            "isRecurring",
            "description"
        ]);
        ApiCall(`/branch/branch-time/${timeBranchId}`, 'PATCH', locale, { ...filteredData }, '', 'admin', router).then(async (result) => {
            event.target.disabled = false;
            setLoading(false);
            setShowEditTimeBranches(false);
            setOpenBottomEditTimeBranchesDrawer(false);
            setTimeBranchData();
            getTimeBranches(1);
            setEditStartTime('');
            setEditEndTime('');
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

    /**
        * Delete a Branch.
        * @returns None
    */
    const deleteTimeBranch = () => {
        setDeleteLoading(true);
        ApiCall(`/branch/branch-time/${recordId}`, 'DELETE', locale, {}, '', 'admin', router).then(async (result) => {
            setDeleteLoading(false);
            getTimeBranches(1);
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

    return (
        <div className=" flex flex-col gap-y-8">
            <Tabs
                orientation="horizontal"
                value={tabValue}
                onChange={handleChange}
                sx={{ borderRight: 1, borderColor: 'divider' }}
            >
                <Tab label="شعب تحویل" className="w-1/2 lg:w-auto whitespace-nowrap dark:text-white" classes={{ selected: 'text-primary' }} />
                <Tab label="زمانبندی تحویل در شعب" className="w-1/2 lg:w-auto whitespace-nowrap dark:text-white" classes={{ selected: 'text-primary' }} />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
                <div className=" flex flex-col gap-y-8">
                    <section className="flex items-center justify-between">
                        <h1 className="text-large-2">شعب تحویل</h1>
                        <div className="flex items-center gap-x-4">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation onClick={handleShowAddBranches}>
                                <text className="text-black font-semibold">افزودن شعبه</text>
                            </Button >
                        </div>
                    </section>
                    {loadingBranches ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div>
                        :
                        <section className="overflow-x-auto overflow-y-hidden">
                            {branches.length > 0 ?
                                <>
                                    <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                                        <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                            <TableHead className="dark:bg-dark">
                                                <TableRow>
                                                    {BRANCHES_TABLE_HEAD.map((data, index) => (
                                                        <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-center pb-4`} key={index}>
                                                            <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {branches.map((data, index) => (
                                                    <TableRow
                                                        key={index}
                                                        sx={{ '&:last-child td': { border: 0 } }}
                                                        className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                                        <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                            {data.nameFa}
                                                        </TableCell><TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                            {data.phone}
                                                        </TableCell>
                                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                        </TableCell>
                                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                            <Button variant="text" size="medium" color="primary" className="rounded-lg" disableElevation
                                                                onClick={handleShowEditBranches(data)}>
                                                                <text className=" font-semibold">ویرایش</text>
                                                            </Button >
                                                        </TableCell>
                                                        <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                            <Tooltip title="حذف شعبه">
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

                                    <ConfirmDialog
                                        open={openDialog}
                                        onClose={handleCloseDialog}
                                        onConfirm={deleteBranch}
                                        title="آیا مطمئن هستید؟"
                                        loading={deleteLoading}
                                        darkModeToggle={darkModeToggle}
                                    />
                                </>
                                : <div className="py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">شعبه ای یافت نشد</span>
                                </div>}
                        </section>}

                </div>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <div className=" flex flex-col gap-y-4">
                    <section className="flex items-center justify-between">
                        <h1 className="text-large-2">زمانبندی تحویل در شعب</h1>
                        {branches?.length > 0 ? <div className="flex items-center gap-x-4">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                onClick={handleShowAddTimeBranches}>
                                <text className="text-black font-semibold">افزودن زمانبندی</text>
                            </Button >
                        </div> : ''}
                    </section>
                    {branches?.length == 0 ? <Alert
                        severity="error"
                        variant="filled"
                        color="error"
                        className="custom-alert auth error mt-4"
                    >
                        <div className="flex flex-col items-baseline md:items-center gap-y-2 md:flex-row md:justify-between w-full">
                            <p className="text-justify m-0">
                                ابتدا لطفا شعبه تحویل را اضافه نمائید.
                            </p>
                        </div>

                    </Alert> : ''}
                    <span className="text-end mt-4 dark:text-white">تعداد کل: {loadingTimeBranches ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (timeBranchesTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>

                    {loadingTimeBranches ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div>
                        :
                        <section className="overflow-x-auto overflow-y-hidden">
                            {timeBranches.length > 0 ?
                                <>
                                    <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                                        <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                            <TableHead className="dark:bg-dark">
                                                <TableRow>
                                                    {TIME_BRANCHES_TABLE_HEAD.map((data, index) => (
                                                        <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-center pb-4`} key={index}>
                                                            <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {timeBranches.map((data, index) => (
                                                    <TableRow
                                                        key={index}
                                                        sx={{ '&:last-child td': { border: 0 } }}
                                                        className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                                        <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                            {data.branch?.nameFa}
                                                        </TableCell>
                                                        <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                            <span>از {moment(moment(data.startTime).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')} تا {moment(moment(data.endTime).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                    .locale('fa')
                                                                    .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                        </TableCell>
                                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                            <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                        </TableCell>
                                                        <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                            <Button variant="text" size="medium" color="primary" className="rounded-lg" disableElevation
                                                                onClick={handleShowEditTimeBranches(data)}>
                                                                <text className=" font-semibold">ویرایش</text>
                                                            </Button >
                                                        </TableCell>
                                                        <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                            <Tooltip title="حذف زمانبندی">
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

                                    <ConfirmDialog
                                        open={openDialog}
                                        onClose={handleCloseDialog}
                                        onConfirm={deleteTimeBranch}
                                        title="آیا مطمئن هستید؟"
                                        loading={deleteLoading}
                                        darkModeToggle={darkModeToggle}
                                    />
                                </>
                                : <div className="py-16">
                                    <span className="block text-center text-large-1 text-primary-gray">زمانبندی یافت نشد</span>
                                </div>}
                        </section>}

                    {Math.ceil(timeBranchesTotal / timeBranchesLimit) > 1 ?
                        <div className="text-center mt-4">
                            <Pagination siblingCount={0} count={Math.ceil(timeBranchesTotal / timeBranchesLimit)} variant="outlined" color="primary" className="justify-center"
                                page={pageItem} onChange={handlePageChange} />
                        </div>
                        : ''}
                </div>
            </TabPanel>

            {/* AddBranches */}
            <>
                <Dialog onClose={() => setShowAddBranches(false)} open={showAddBranches} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن شعبه
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowAddBranches(false)}>
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
                        onSubmit={handleSubmit(saveBranch)}
                    >
                        <div className="col-span-12 md:col-span-4">
                            <FormControl className="w-full">
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="نام انگلیسی شعبه"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.name}
                                            helperText={errors.name ? errors.name.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddBranchData(event, 'name', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <FormControl className="w-full">
                                <Controller
                                    name="nameFa"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="نام فارسی شعبه"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                            }}
                                            error={!!errors.nameFa}
                                            helperText={errors.nameFa ? errors.nameFa.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddBranchData(event, 'nameFa', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <FormControl className="w-full">
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <PatternFormat
                                            {...field}
                                            format="#### ### ## ##"
                                            customInput={TextField}
                                            type="tel"
                                            color="primary"
                                            label="شماره تماس شعبه"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal',
                                                    pattern: '[0-9]*'
                                                }
                                            }}
                                            error={!!errors.phone}
                                            helperText={errors.phone ? errors.phone.message : ''}
                                            value={addBranches?.phone}
                                            onValueChange={(event) => handleChangeAddBranchData(event, 'phone', 'mobileNumberFormat')}
                                            onPaste={(event) => {
                                                event.preventDefault();
                                                const pastedText = event.clipboardData.getData('Text');
                                                const converted = ConvertText(pastedText);
                                                const mobileNumber = converted.startsWith('0') ? converted : `0${converted}`;
                                                setValue('phone', mobileNumber);
                                                setAddBranches((prevState) => ({
                                                    ...prevState,
                                                    phone: mobileNumber,
                                                }));
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="address"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            multiline
                                            rows={4}
                                            label="آدرس شعبه"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.address}
                                            helperText={errors.address ? errors.address.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddBranchData(event, 'address', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>

                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن شعبه</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomAddBranchesDrawer}
                    onClose={() => setOpenBottomAddBranchesDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن شعبه
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomAddBranchesDrawer(false)}>
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
                        onSubmit={handleSubmit(saveBranch)}
                    >
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="نام انگلیسی شعبه"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.name}
                                            helperText={errors.name ? errors.name.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddBranchData(event, 'name', 'text');
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
                                            label="نام فارسی شعبه"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                            }}
                                            error={!!errors.nameFa}
                                            helperText={errors.nameFa ? errors.nameFa.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddBranchData(event, 'nameFa', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <PatternFormat
                                            {...field}
                                            format="#### ### ## ##"
                                            customInput={TextField}
                                            type="tel"
                                            color="primary"
                                            label="شماره تماس شعبه"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal',
                                                    pattern: '[0-9]*'
                                                }
                                            }}
                                            error={!!errors.phone}
                                            helperText={errors.phone ? errors.phone.message : ''}
                                            value={addBranches?.phone}
                                            onValueChange={(event) => handleChangeAddBranchData(event, 'phone', 'mobileNumberFormat')}
                                            onPaste={(event) => {
                                                event.preventDefault();
                                                const pastedText = event.clipboardData.getData('Text');
                                                const converted = ConvertText(pastedText);
                                                const mobileNumber = converted.startsWith('0') ? converted : `0${converted}`;
                                                setValue('phone', mobileNumber);
                                                setAddBranches((prevState) => ({
                                                    ...prevState,
                                                    phone: mobileNumber,
                                                }));
                                            }} />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="address"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            multiline
                                            rows={4}
                                            label="آدرس شعبه"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.address}
                                            helperText={errors.address ? errors.address.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddBranchData(event, 'address', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>

                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن شعبه</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* Edit Branches */}
            <>
                <Dialog onClose={() => setShowEditBranches(false)} open={showEditBranches} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن شعبه
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowEditBranches(false)}>
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
                        <div className="col-span-12 md:col-span-4">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="نام انگلیسی شعبه"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={branchData?.name}
                                    onChange={handleChangeEditBranchData('name', 'text')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="نام فارسی شعبه"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={branchData?.nameFa}
                                    onChange={handleChangeEditBranchData('nameFa', 'text')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <FormControl className="w-full">
                                <PatternFormat
                                    format="#### ### ## ##"
                                    customInput={TextField}
                                    type="tel"
                                    color="primary"
                                    label="شماره تماس شعبه"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal',
                                            pattern: '[0-9]*'
                                        }
                                    }}
                                    value={branchData?.phone}
                                    onValueChange={handleChangeEditBranchData('phone', 'mobileNumberFormat')}
                                    onPaste={(event) => {
                                        event.preventDefault();
                                        const pastedText = event.clipboardData.getData('Text');
                                        const converted = ConvertText(pastedText);
                                        const mobileNumber = converted.startsWith('0') ? converted : `0${converted}`;
                                        setBranchData((prevState) => ({
                                            ...prevState,
                                            phone: mobileNumber,
                                        }));
                                    }} />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="آدرس شعبه"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={branchData?.address}
                                    onChange={handleChangeEditBranchData('address', 'text')}
                                />
                            </FormControl>
                        </div>

                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={editBranch(branchData?._id)}>
                                <text className="text-black font-semibold">ویرایش شعبه</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomEditBranchesDrawer}
                    onClose={() => setOpenBottomEditBranchesDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن شعبه
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomEditBranchesDrawer(false)}>
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
                        <div className="col-span-12 md:col-span-4">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="نام انگلیسی شعبه"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={branchData?.name}
                                    onChange={handleChangeEditBranchData('name', 'text')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="نام فارسی شعبه"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={branchData?.nameFa}
                                    onChange={handleChangeEditBranchData('nameFa', 'text')}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <FormControl className="w-full">
                                <PatternFormat
                                    format="#### ### ## ##"
                                    customInput={TextField}
                                    type="tel"
                                    color="primary"
                                    label="شماره تماس شعبه"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal',
                                            pattern: '[0-9]*'
                                        }
                                    }}
                                    value={branchData?.phone}
                                    onValueChange={handleChangeEditBranchData('phone', 'mobileNumberFormat')}
                                    onPaste={(event) => {
                                        event.preventDefault();
                                        const pastedText = event.clipboardData.getData('Text');
                                        const converted = ConvertText(pastedText);
                                        const mobileNumber = converted.startsWith('0') ? converted : `0${converted}`;
                                        setBranchData((prevState) => ({
                                            ...prevState,
                                            phone: mobileNumber,
                                        }));
                                    }} />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="آدرس شعبه"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={branchData?.address}
                                    onChange={handleChangeEditBranchData('address', 'text')}
                                />
                            </FormControl>
                        </div>

                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={editBranch(branchData?._id)}>
                                <text className="text-black font-semibold">ویرایش شعبه</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* AddTimeBranches */}
            <>
                <Dialog onClose={() => setShowAddTimeBranches(false)} open={showAddTimeBranches} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن زمانبندی
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowAddTimeBranches(false)}>
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
                        onSubmit={handleTimeBranchSubmit(saveTimeBranch)}
                    >
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="branchId"
                                control={controlTimeBranch}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <InputLabel id="demo-simple-select-label" error={!!errorsTimeBranch.branchId}
                                            sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب شعبه</InputLabel>
                                        <MUISelect
                                            {...field}
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            onChange={(event) => { field.onChange(event); handleChangeAddTimeBranchData(event, 'branchId', 'text') }}
                                            input={<OutlinedInput
                                                id="select-multiple-chip"
                                                label="انتخاب شعبه"
                                                className="dark:bg-dark *:dark:text-white"
                                                sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                            />}
                                            error={!!errorsTimeBranch.branchId}
                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                            {branches?.map((data, index) => (
                                                <MenuItem key={index} value={data._id}>{data.nameFa}</MenuItem>
                                            ))}
                                        </MUISelect>
                                        {errorsTimeBranch.branchId && <FormHelperText className="text-red-500 !mx-4">{errorsTimeBranch.branchId.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="capacity"
                                    control={controlTimeBranch}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداکثر ظرفیت تعداد درخواست"
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
                                            error={!!errorsTimeBranch.capacity}
                                            helperText={errorsTimeBranch.capacity ? errorsTimeBranch.capacity.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddTimeBranchData(event, 'capacity', 'numberFormat');
                                            }} />
                                    )}
                                />
                                <FormHelperText className="text-sell text-xs -mb-6">این فیلد پس از ثبت قابل تغییر نمی باشد</FormHelperText>
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-4 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={addTimeBranches?.isRecurring}
                                        onChange={(event) => {
                                            setAddTimeBranches({ ...addTimeBranches, isRecurring: event.target.checked });
                                        }}
                                    />}
                                    label="هفتگی تکرار شود ؟"
                                />
                            </FormGroup>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <Controller
                                name="startTime"
                                control={controlTimeBranch}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <DatePicker
                                            name="datePickerstartTime"
                                            timePicker={true}
                                            isGregorian={isGregorian}
                                            className="form-input hidden"
                                            onChange={(date) => {
                                                field.onChange(date);
                                                limitDatepicker(date, 'startTime');
                                            }}
                                        />
                                        <TextField
                                            type="text"
                                            color={'primary'}
                                            label="زمان شروع"
                                            variant="outlined"
                                            error={!!errorsTimeBranch.startTime}
                                            helperText={errorsTimeBranch.startTime ? errorsTimeBranch.startTime.message : ''}
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-center' : 'text-black text-center', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    className: 'ltr'
                                                },
                                                readOnly: true
                                            }}
                                            value={startTime}
                                            onClick={() => document.querySelector('input[name="datePickerstartTime"]').click()}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <Controller
                                name="endTime"
                                control={controlTimeBranch}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <DatePicker
                                            name="datePickerEndTime"
                                            timePicker={true}
                                            isGregorian={isGregorian}
                                            className="form-input hidden"
                                            onChange={(date) => {
                                                field.onChange(date);
                                                limitDatepicker(date, 'endTime');
                                            }}
                                        />
                                        <TextField
                                            type="text"
                                            color={'primary'}
                                            label="زمان پایان"
                                            variant="outlined"
                                            error={!!errorsTimeBranch.endTime}
                                            helperText={errorsTimeBranch.endTime ? errorsTimeBranch.endTime.message : ''}
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-center' : 'text-black text-center', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    className: 'ltr'
                                                },
                                                readOnly: true
                                            }}
                                            value={endTime}
                                            onClick={() => document.querySelector('input[name="datePickerEndTime"]').click()}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>

                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن زمانبندی</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomAddTimeBranchesDrawer}
                    onClose={() => setOpenBottomAddTimeBranchesDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن شعبه
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomAddTimeBranchesDrawer(false)}>
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
                        onSubmit={handleTimeBranchSubmit(saveTimeBranch)}
                    >
                        <div className="col-span-12 md:col-span-4">
                            <Controller
                                name="branchId"
                                control={controlTimeBranch}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <InputLabel id="demo-simple-select-label" error={!!errorsTimeBranch.branchId}
                                            sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب شعبه</InputLabel>
                                        <MUISelect
                                            {...field}
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            onChange={(event) => { field.onChange(event); handleChangeAddTimeBranchData(event, 'branchId', 'text') }}
                                            input={<OutlinedInput
                                                id="select-multiple-chip"
                                                label="انتخاب شعبه"
                                                className="dark:bg-dark *:dark:text-white"
                                                sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                            />}
                                            error={!!errorsTimeBranch.branchId}
                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                            {branches?.map((data, index) => (
                                                <MenuItem key={index} value={data._id}>{data.nameFa}</MenuItem>
                                            ))}
                                        </MUISelect>
                                        {errorsTimeBranch.branchId && <FormHelperText className="text-red-500 !mx-4">{errorsTimeBranch.branchId.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="capacity"
                                    control={controlTimeBranch}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداکثر ظرفیت تعداد درخواست"
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
                                            error={!!errorsTimeBranch.capacity}
                                            helperText={errorsTimeBranch.capacity ? errorsTimeBranch.capacity.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddTimeBranchData(event, 'capacity', 'numberFormat');
                                            }} />
                                    )}
                                />
                                <FormHelperText className="text-sell text-xs -mb-6">این فیلد پس از ثبت قابل تغییر نمی باشد</FormHelperText>
                            </FormControl>
                        </div>

                        <div className="col-span-12 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={addTimeBranches?.isRecurring}
                                        onChange={(event) => {
                                            setAddTimeBranches({ ...addTimeBranches, isRecurring: event.target.checked });
                                        }}
                                    />}
                                    label="هفتگی تکرار شود ؟"
                                />
                            </FormGroup>
                        </div>
                        <div className="col-span-12 ">
                            <Controller
                                name="startTime"
                                control={controlTimeBranch}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <DatePicker
                                            name="datePickerstartTime"
                                            timePicker={true}
                                            isGregorian={isGregorian}
                                            className="form-input hidden"
                                            onChange={(date) => {
                                                field.onChange(date);
                                                limitDatepicker(date, 'startTime');
                                            }}
                                        />
                                        <TextField
                                            type="text"
                                            color={'primary'}
                                            label="زمان شروع"
                                            variant="outlined"
                                            error={!!errorsTimeBranch.startTime}
                                            helperText={errorsTimeBranch.startTime ? errorsTimeBranch.startTime.message : ''}
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-center' : 'text-black text-center', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    className: 'ltr'
                                                },
                                                readOnly: true
                                            }}
                                            value={startTime}
                                            onClick={() => document.querySelector('input[name="datePickerstartTime"]').click()}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12">
                            <Controller
                                name="endTime"
                                control={controlTimeBranch}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <DatePicker
                                            name="datePickerEndTime"
                                            timePicker={true}
                                            isGregorian={isGregorian}
                                            className="form-input hidden"
                                            onChange={(date) => {
                                                field.onChange(date);
                                                limitDatepicker(date, 'endTime');
                                            }}
                                        />
                                        <TextField
                                            type="text"
                                            color={'primary'}
                                            label="زمان پایان"
                                            variant="outlined"
                                            error={!!errorsTimeBranch.endTime}
                                            helperText={errorsTimeBranch.endTime ? errorsTimeBranch.endTime.message : ''}
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-center' : 'text-black text-center', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    className: 'ltr'
                                                },
                                                readOnly: true
                                            }}
                                            value={endTime}
                                            onClick={() => document.querySelector('input[name="datePickerEndTime"]').click()}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن زمانبندی</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* Edit Branches */}
            <>
                <Dialog onClose={() => setShowEditTimeBranches(false)} open={showEditTimeBranches} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن شعبه
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowEditTimeBranches(false)}>
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
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب شعبه</InputLabel>
                                <MUISelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    defaultValue={timeBranchData?.branch}
                                    onChange={(event) => setTimeBranchData((prevState) => ({
                                        ...prevState,
                                        'branchId': event.target?.value?._id,
                                    }))}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب شعبه"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                    />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            <span>{selected?.nameFa}</span>
                                        </div>
                                    )}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                    {branches?.map((data, index) => (
                                        <MenuItem key={index} value={data}>{data.nameFa}</MenuItem>
                                    ))}
                                </MUISelect>
                            </FormControl>

                        </div>

                        <div className="col-span-12 md:col-span-6 pointer-events-none">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={0}
                                    customInput={TextField}
                                    type="tel"
                                    label="حداکثر ظرفیت تعداد درخواست"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' },
                                        classes: { root: 'pointer-events-none' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={timeBranchData?.capacity} />
                                <FormHelperText className="text-sell text-xs -mb-6">این فیلد قابل تغییر نمی باشد</FormHelperText>
                            </FormControl>
                        </div>

                        <div className="col-span-12 md:col-span-4 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={timeBranchData?.isRecurring}
                                        onChange={(event) => {
                                            setTimeBranchData({ ...timeBranchData, isRecurring: event.target.checked });
                                        }}
                                    />}
                                    label="هفتگی تکرار شود ؟"
                                />
                            </FormGroup>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <FormControl className="w-full">
                                <DatePicker
                                    name="editdatePickerstartTime"
                                    timePicker={true}
                                    isGregorian={isGregorian}
                                    className="form-input hidden"
                                    onChange={(date) => editLimitDatepicker(date, 'startTime')}
                                />
                                <TextField
                                    type="text"
                                    color={'primary'}
                                    label="زمان شروع"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-center' : 'text-black text-center', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            className: 'ltr'
                                        },
                                        readOnly: true
                                    }}
                                    value={editStartTime}
                                    onClick={() => document.querySelector('input[name="editdatePickerstartTime"]').click()}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <FormControl className="w-full">
                                <DatePicker
                                    name="editdatePickerEndTime"
                                    timePicker={true}
                                    isGregorian={isGregorian}
                                    className="form-input hidden"
                                    onChange={(date) => editLimitDatepicker(date, 'endTime')}
                                />
                                <TextField
                                    type="text"
                                    color={'primary'}
                                    label="زمان پایان"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-center' : 'text-black text-center', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            className: 'ltr'
                                        },
                                        readOnly: true
                                    }}
                                    value={editEndTime}
                                    onClick={() => document.querySelector('input[name="editdatePickerEndTime"]').click()}
                                />
                            </FormControl>
                        </div>

                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={editTimeBranch(timeBranchData?._id)}>
                                <text className="text-black font-semibold">ویرایش زمانبندی</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomEditTimeBranchesDrawer}
                    onClose={() => setOpenBottomEditTimeBranchesDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن شعبه
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomEditTimeBranchesDrawer(false)}>
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
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب شعبه</InputLabel>
                                <MUISelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    defaultValue={timeBranchData?.branch}
                                    onChange={(event) => setTimeBranchData((prevState) => ({
                                        ...prevState,
                                        'branchId': event.target?.value?._id,
                                    }))}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب شعبه"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                    />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            <span>{selected?.nameFa}</span>
                                        </div>
                                    )}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                    {branches?.map((data, index) => (
                                        <MenuItem key={index} value={data}>{data.nameFa}</MenuItem>
                                    ))}
                                </MUISelect>
                            </FormControl>

                        </div>

                        <div className="col-span-12">
                            <FormControl className="w-full pointer-events-none">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={0}
                                    customInput={TextField}
                                    type="tel"
                                    label="حداکثر ظرفیت تعداد درخواست"
                                    variant="outlined"
                                    readOnly
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' },
                                        classes: { root: 'pointer-events-none' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={timeBranchData?.capacity} />
                                <FormHelperText className="text-sell text-xs -mb-6">این فیلد قابل تغییر نمی باشد</FormHelperText>
                            </FormControl>
                        </div>

                        <div className="col-span-12 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={timeBranchData?.isRecurring}
                                        onChange={(event) => {
                                            setTimeBranchData({ ...timeBranchData, isRecurring: event.target.checked });
                                        }}
                                    />}
                                    label="هفتگی تکرار شود ؟"
                                />
                            </FormGroup>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <DatePicker
                                    name="editdatePickerstartTime"
                                    timePicker={true}
                                    isGregorian={isGregorian}
                                    className="form-input hidden"
                                    onChange={(date) => editLimitDatepicker(date, 'startTime')}
                                />
                                <TextField
                                    type="text"
                                    color={'primary'}
                                    label="زمان شروع"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-center' : 'text-black text-center', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            className: 'ltr'
                                        },
                                        readOnly: true
                                    }}
                                    value={editStartTime}
                                    onClick={() => document.querySelector('input[name="editdatePickerstartTime"]').click()}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <DatePicker
                                    name="editdatePickerEndTime"
                                    timePicker={true}
                                    isGregorian={isGregorian}
                                    className="form-input hidden"
                                    onChange={(date) => editLimitDatepicker(date, 'endTime')}
                                />
                                <TextField
                                    type="text"
                                    color={'primary'}
                                    label="زمان پایان"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-center' : 'text-black text-center', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            className: 'ltr'
                                        },
                                        readOnly: true
                                    }}
                                    value={editEndTime}
                                    onClick={() => document.querySelector('input[name="editdatePickerEndTime"]').click()}
                                />
                            </FormControl>
                        </div>

                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={editTimeBranch(timeBranchData?._id)}>
                                <text className="text-black font-semibold">ویرایش زمانبندی</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

        </div>
    )
}

export default ProductsBranchPageCompo;