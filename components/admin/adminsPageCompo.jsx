import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Pagination from '@mui/material/Pagination';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CancelIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline'
import moment from 'jalali-moment'

import { PatternFormat } from 'react-number-format';

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
import ConvertText from "../../services/convertPersianToEnglish";

import ConfirmDialog from '../shared/ConfirmDialog';

/**
 * AdminsPageCompo component that displays the Admins Page Component of the website.
 * @returns The rendered Admins Page component.
 */
const AdminsPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, adminInfo, userLoading } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const ADMINS_TABLE_HEAD = [
        {
            label: 'نام ادمین',
            classes: ""
        },
        {
            label: 'شماره موبایل',
            classes: ""
        },
        {
            label: 'ایمیل',
            classes: ""
        },
        {
            label: 'نوع حساب',
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

    // const ADMINS_ROLES = [
    //     {
    //         label: 'SuperAdmin',
    //         value: "SuperAdmin"
    //     },
    //     {
    //         label: 'Admin',
    //         value: "Admin"
    //     }
    // ]

    const [pageItem, setPageItem] = useState(1);
    useEffect(() => {
        if (adminInfo?.role == 'SuperAdmin') {
            getAdmins(1);
        }
    }, [adminInfo]);

    /**
        * Retrieves Users.
        * @returns None
       */
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [usersLimit, setUsersLimit] = useState(10);
    const [usersTotal, setUsersTotal] = useState(0);
    const getAdmins = (page, search) => {
        setLoadingUsers(true);
        ApiCall('/user', 'GET', locale, {}, `${search ? `search=${search}&` : ''}roles=ExtConsumer&roles=Admin&roles=SuperAdmin&sortOrder=0&sortBy=createdAt&limit=${usersLimit}&skip=${(page * usersLimit) - usersLimit}`, 'admin', router).then(async (result) => {
            setUsersTotal(result.count);
            setUsers(result.data);
            setLoadingUsers(false);
        }).catch((error) => {
            setLoadingUsers(false);
            console.log(error);
        });
    }

    const handlePageChange = (event, value) => {
        setPageItem(value);
        getAdmins(value);
    }

    /**
     * Search for a Admins based on the input value and filter the displayed Admins accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchAdmins, setSearchAdmins] = useState('');
    var typingTimerAdmins;
    const doneTypingIntervalAdmins = 300;
    const searchAdminsItems = (event) => {
        clearTimeout(typingTimerAdmins);

        typingTimerAdmins = setTimeout(() => {
            if (event.target.value == '') {
                setSearchAdmins('');
                setPageItem(1);
                getAdmins(1, '');
            } else {
                setSearchAdmins(event.target.value);
                setPageItem(1);
                getAdmins(1, event.target.value);
            }
        }, doneTypingIntervalAdmins);

    }
    const searchAdminsItemsHandler = () => {
        clearTimeout(typingTimerAdmins)
    }

    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [openBottomAddAdminDrawer, setOpenBottomAddAdminDrawer] = useState(false);
    const handleShowAddAdmin = () => {
        if (window.innerWidth >= 1024) {
            setShowAddAdmin(true);
            setOpenBottomAddAdminDrawer(false);
        } else {
            setShowAddAdmin(false);
            setOpenBottomAddAdminDrawer(true);
        }
    }

    /**
     * Handles the change event for Adding products inputs.
     * @param {string} input - The name of the input field being changed.
     * @param {string} type - The type of the input field.
     * @param {Event} event - The change event object.
     * @returns None
     */
    const [addAdmin, setAddAdmin] = useState({
        mobileNumber: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        sex: 'Male'
    });
    const validationSchema = Yup.object({
        mobileNumber: Yup.string()
            .required('این فیلد الزامی است')
            .transform(value => value.replace(/\s+/g, ''))
            .test('starts-with-09', 'شماره موبایل نامعتبر می باشد', value => value && value.startsWith('09'))
            .matches(
                /^(\+?98[\-\s]?|0)9[0-39]\d[\-\s]?\d{3}[\-\s]?\d{4}$/,
                'شماره موبایل نامعتبر می باشد'
            )
            .matches(/^\d{11}$/, 'شماره موبایل باید 11 رقم باشد'),
        password: Yup.string()
            .required('این فیلد الزامی است')
            .min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد')
            .matches(/[a-z]/, 'رمز عبور باید حداقل یک حرف کوچک انگلیسی باشد')
            .matches(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ انگلیسی باشد')
            .matches(/[0-9]/, 'رمز عبور باید حداقل یک عدد باشد'),
        firstName: Yup.string().required('این فیلد الزامی است'),
        lastName: Yup.string().required('این فیلد الزامی است'),
        email: Yup.string().required('این فیلد الزامی است')
            .matches(
                /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,
                'فرمت ایمیل نادرست است'
            )
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const clearForm = () => {
        setValue('mobileNumber', '');
        setValue('password', '');
        setValue('firstName', '');
        setValue('lastName', '');
        setValue('email', '');
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
            case "patternFormat":
                value = event.value;
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
        setAddAdmin((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
     * Add A Admin.
     * @returns None
    */
    const saveAdmin = () => {
        setLoading(true);
        ApiCall('/user/create-admin', 'POST', locale, { ...addAdmin }, '', 'admin', router).then(async (result) => {
            setLoading(false);
            setAddAdmin({
                mobileNumber: '',
                password: '',
                firstName: '',
                lastName: '',
                email: '',
                sex: 'Male'
            });
            clearForm();
            getAdmins(1);
            setShowAddAdmin(false);
            setOpenBottomAddAdminDrawer(false);
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

    const [openDialog, setOpenDialog] = useState(false);
    const [userId, setUserId] = useState('');
    const [isActive, setIsActive] = useState('');

    const handleOpenDialog = (userId, active) => (event) => {
        setUserId(userId);
        setIsActive(active);
        setOpenDialog(true);
    }
    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    /**
    * Delete a Admin.
    * @returns None
   */
    const [deleteLoading, setDeleteLoading] = useState(false);
    const changeStatusAdmin = () => {
        if (location.origin.includes("https://gold.viraasr.com")) {
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: 'این قابلیت به دلیل دمو بودن اسکریپت غیرفعال می باشد',
                    type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        } else {
            setDeleteLoading(true);
            ApiCall(`/user/${userId}`, 'PATCH', locale, { isActive }, '', 'admin', router).then(async (result) => {
                setDeleteLoading(false);
                getAdmins(1);
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
    }

    return (
        <div className=" flex flex-col gap-y-8">
            {userLoading ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> :
                <>
                    <section className="flex items-center justify-between">
                        <h1 className="text-large-2">ادمین ها</h1>
                        {adminInfo?.role == 'SuperAdmin' ? <div className="flex items-center gap-x-4">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation onClick={handleShowAddAdmin}>
                                <text className="text-black font-semibold">افزودن ادمین</text>
                            </Button >
                        </div> : ''}
                    </section>
                    {adminInfo?.role == 'SuperAdmin' ?
                        <>
                            <section>
                                <div className="flex items-center justify-between gap-x-4">
                                    <form autoComplete="off">
                                        <FormControl className="w-full md:w-auto">
                                            <TextField
                                                size="small"
                                                type="text"
                                                label="جستجو ادمین"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                                }}
                                                onChange={(event) => setSearchAdmins(event.target.value)}
                                                onKeyDown={searchAdminsItemsHandler}
                                                onKeyUp={searchAdminsItems} />
                                        </FormControl>
                                    </form>
                                    <span className="dark:text-white">تعداد کل: {loadingUsers ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (usersTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>

                                {loadingUsers ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : users.length > 0 ?
                                    <>
                                        <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                                            <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                                <TableHead className="dark:bg-dark">
                                                    <TableRow>
                                                        {ADMINS_TABLE_HEAD.map((data, index) => (
                                                            <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
                                                                <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {users.map((data, index) => (
                                                        <TableRow
                                                            key={index}
                                                            sx={{ '&:last-child td': { border: 0 } }}
                                                            className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                                            <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                                <LinkRouter legacyBehavior href={`/admin/panel/adminsinglepage?id=${data._id}`}>
                                                                    <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                                                        <span>({data.mobileNumber}) {data.firstName} {data.lastName}</span>
                                                                    </a>
                                                                </LinkRouter>
                                                            </TableCell>
                                                            <TableCell className="border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                                {data.mobileNumber}
                                                            </TableCell>
                                                            <TableCell className="border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                                {data.email}
                                                            </TableCell>
                                                            <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                                <Chip label={data.role} variant="outlined" size="small" className="badge badge-primary" />
                                                            </TableCell>
                                                            <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                                <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                    .locale('fa')
                                                                    .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                            </TableCell>
                                                            <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                                <LinkRouter legacyBehavior href={`/admin/panel/adminsinglepage?id=${data._id}`}>
                                                                    <Button href={`/admin/panel/adminsinglepage?id=${data._id}`} target="_blank" variant="text" size="medium" color="primary" className="rounded-lg" disableElevation>
                                                                        <text className=" font-semibold">جزئیات بیشتر</text>
                                                                    </Button>
                                                                </LinkRouter>
                                                            </TableCell>
                                                            <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                                {data.role != 'SuperAdmin' ? data.isActive ?
                                                                    <Tooltip title="غیرفعالسازی ادمین">
                                                                        <IconButton
                                                                            color={`error`}
                                                                            onClick={handleOpenDialog(data._id, false)}>
                                                                            <CancelIcon />
                                                                        </IconButton>
                                                                    </Tooltip> : <Tooltip title="فعالسازی ادمین">
                                                                        <IconButton
                                                                            color={`success`}
                                                                            onClick={handleOpenDialog(data._id, true)}>
                                                                            <CheckCircleIcon />
                                                                        </IconButton>
                                                                    </Tooltip> : '------'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                        <ConfirmDialog
                                            open={openDialog}
                                            onClose={handleCloseDialog}
                                            onConfirm={changeStatusAdmin}
                                            title="آیا مطمئن هستید؟"
                                            loading={deleteLoading}
                                            darkModeToggle={darkModeToggle}
                                        />
                                    </>
                                    : <div className="py-16">
                                        <span className="block text-center text-large-1 text-primary-gray">ادمینی تعریف نشده است.</span>
                                    </div>}
                            </section>
                            {Math.ceil(usersTotal / usersLimit) > 1 ?
                                <div className="text-center mt-4">
                                    <Pagination siblingCount={0} count={Math.ceil(usersTotal / usersLimit)} variant="outlined" color="primary" className="justify-center"
                                        page={pageItem} onChange={handlePageChange} />
                                </div>
                                : ''}

                            {/* AddAdmin */}
                            <>
                                <Dialog onClose={() => setShowAddAdmin(false)} open={showAddAdmin} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                                    <div className="flex flex-col gap-y-6">
                                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن ادمین
                                            <IconButton
                                                color={darkModeToggle ? 'white' : 'black'}
                                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                                onClick={() => setShowAddAdmin(false)}>
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
                                        onSubmit={handleSubmit(saveAdmin)}
                                    >
                                        <Controller
                                            name="firstName"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl className="w-full col-span-12 md:col-span-6">
                                                    <TextField
                                                        {...field}
                                                        type="text"
                                                        label="نام ادمین"
                                                        variant="outlined"
                                                        error={!!errors.firstName}
                                                        helperText={errors.firstName ? errors.firstName.message : ''}
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            handleChangeAddData(event, 'firstName', 'text');
                                                        }} />
                                                </FormControl>
                                            )}
                                        />
                                        <Controller
                                            name="lastName"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl className="w-full col-span-12 md:col-span-6">
                                                    <TextField
                                                        {...field}
                                                        type="text"
                                                        label="نام خانوادگی ادمین"
                                                        variant="outlined"
                                                        error={!!errors.lastName}
                                                        helperText={errors.lastName ? errors.lastName.message : ''}
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            handleChangeAddData(event, 'lastName', 'text');
                                                        }} />
                                                </FormControl>
                                            )}
                                        />
                                        <Controller
                                            name="mobileNumber"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl className="w-full col-span-12 md:col-span-6">
                                                    <PatternFormat
                                                        {...field}
                                                        format="#### ### ## ##"
                                                        customInput={TextField}
                                                        type="tel"
                                                        label="شماره موبایل ادمین"
                                                        variant="outlined"
                                                        error={!!errors.mobileNumber}
                                                        helperText={errors.mobileNumber ? errors.mobileNumber.message : ''}
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
                                                        value={addAdmin?.mobileNumber}
                                                        onValueChange={(event) => {
                                                            handleChangeAddData(event, 'mobileNumber', 'mobileNumberFormat');
                                                        }}
                                                        onPaste={(event) => {
                                                            event.preventDefault();
                                                            const pastedText = event.clipboardData.getData('Text');
                                                            const converted = ConvertText(pastedText);
                                                            const mobileNumber = converted.startsWith('0') ? converted : `0${converted}`;
                                                            setAddAdmin((prevState) => ({
                                                                ...prevState,
                                                                mobileNumber: mobileNumber,
                                                            }));
                                                        }} />
                                                </FormControl>
                                            )}
                                        />
                                        <Controller
                                            name="email"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl className="w-full col-span-12 md:col-span-6">
                                                    <TextField
                                                        {...field}
                                                        type="email"
                                                        label="ایمیل ادمین"
                                                        variant="outlined"
                                                        error={!!errors.email}
                                                        helperText={errors.email ? errors.email.message : ''}
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            handleChangeAddData(event, 'email', 'text');
                                                        }} />
                                                </FormControl>
                                            )}
                                        />
                                        <Controller
                                            name="password"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl className="w-full col-span-12">
                                                    <TextField
                                                        {...field}
                                                        type={showPassword ? "text" : "password"}
                                                        label="رمز عبور ادمین"
                                                        variant="outlined"
                                                        error={!!errors.password}
                                                        helperText={errors.password ? errors.password.message : ''}
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                            endAdornment: (
                                                                <IconButton
                                                                    color={`${darkModeToggle ? 'white' : 'black'}`}
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                >
                                                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                                </IconButton>
                                                            )
                                                        }}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            handleChangeAddData(event, 'password', 'text');
                                                        }} />
                                                </FormControl>
                                            )}
                                        />
                                        <div className="col-span-12 text-end">
                                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                                <text className="text-black font-semibold">افزودن ادمین</text>
                                            </LoadingButton>
                                        </div>
                                    </form>
                                </Dialog>

                                <SwipeableDrawer
                                    disableBackdropTransition={true}
                                    disableDiscovery={true}
                                    disableSwipeToOpen={true}
                                    anchor={'bottom'}
                                    open={openBottomAddAdminDrawer}
                                    onClose={() => setOpenBottomAddAdminDrawer(false)}
                                    PaperProps={{ className: 'drawers' }}
                                    ModalProps={{
                                        keepMounted: false
                                    }}>
                                    <div className="block mb-6"><div className="puller"></div></div>
                                    <div className="flex flex-col gap-y-6">
                                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن ادمین
                                            <IconButton
                                                color={darkModeToggle ? 'white' : 'black'}
                                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                                onClick={() => setOpenBottomAddAdminDrawer(false)}>
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
                                        onSubmit={handleSubmit(saveAdmin)}
                                    >
                                        <Controller
                                            name="firstName"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl className="w-full col-span-12 md:col-span-6">
                                                    <TextField
                                                        {...field}
                                                        type="text"
                                                        label="نام ادمین"
                                                        variant="outlined"
                                                        error={!!errors.firstName}
                                                        helperText={errors.firstName ? errors.firstName.message : ''}
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            handleChangeAddData(event, 'firstName', 'text');
                                                        }} />
                                                </FormControl>
                                            )}
                                        />
                                        <Controller
                                            name="lastName"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl className="w-full col-span-12 md:col-span-6">
                                                    <TextField
                                                        {...field}
                                                        type="text"
                                                        label="نام خانوادگی ادمین"
                                                        variant="outlined"
                                                        error={!!errors.lastName}
                                                        helperText={errors.lastName ? errors.lastName.message : ''}
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            handleChangeAddData(event, 'lastName', 'text');
                                                        }} />
                                                </FormControl>
                                            )}
                                        />
                                        <Controller
                                            name="mobileNumber"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl className="w-full col-span-12 md:col-span-6">
                                                    <PatternFormat
                                                        {...field}
                                                        format="#### ### ## ##"
                                                        customInput={TextField}
                                                        type="tel"
                                                        label="شماره موبایل ادمین"
                                                        variant="outlined"
                                                        error={!!errors.mobileNumber}
                                                        helperText={errors.mobileNumber ? errors.mobileNumber.message : ''}
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
                                                        value={addAdmin?.mobileNumber}
                                                        onValueChange={(event) => {
                                                            handleChangeAddData(event, 'mobileNumber', 'mobileNumberFormat');
                                                        }}
                                                        onPaste={(event) => {
                                                            event.preventDefault();
                                                            const pastedText = event.clipboardData.getData('Text');
                                                            const converted = ConvertText(pastedText);
                                                            const mobileNumber = converted.startsWith('0') ? converted : `0${converted}`;
                                                            setAddAdmin((prevState) => ({
                                                                ...prevState,
                                                                mobileNumber: mobileNumber,
                                                            }));
                                                        }} />
                                                </FormControl>
                                            )}
                                        />
                                        <Controller
                                            name="email"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl className="w-full col-span-12 md:col-span-6">
                                                    <TextField
                                                        {...field}
                                                        type="email"
                                                        label="ایمیل ادمین"
                                                        variant="outlined"
                                                        error={!!errors.email}
                                                        helperText={errors.email ? errors.email.message : ''}
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        }}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            handleChangeAddData(event, 'email', 'text');
                                                        }} />
                                                </FormControl>
                                            )}
                                        />
                                        <Controller
                                            name="password"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl className="w-full col-span-12">
                                                    <TextField
                                                        {...field}
                                                        type={showPassword ? "text" : "password"}
                                                        label="رمز عبور ادمین"
                                                        variant="outlined"
                                                        error={!!errors.password}
                                                        helperText={errors.password ? errors.password.message : ''}
                                                        InputLabelProps={{
                                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                        }}
                                                        InputProps={{
                                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                            endAdornment: (
                                                                <IconButton
                                                                    color={`${darkModeToggle ? 'white' : 'black'}`}
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                >
                                                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                                </IconButton>
                                                            )
                                                        }}
                                                        onChange={(event) => {
                                                            field.onChange(event);
                                                            handleChangeAddData(event, 'password', 'text');
                                                        }} />
                                                </FormControl>
                                            )}
                                        />
                                        <div className="col-span-12 text-end">
                                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                                <text className="text-black font-semibold">افزودن ادمین</text>
                                            </LoadingButton>
                                        </div>
                                    </form>
                                </SwipeableDrawer>
                            </>
                        </> : <div className="py-16">
                            <span className="block text-center text-large-1 text-primary-gray">سطح دسترسی شما باید SuperAdmin باشد.</span>
                        </div>}
                </>}
        </div>
    )
}

export default AdminsPageCompo;