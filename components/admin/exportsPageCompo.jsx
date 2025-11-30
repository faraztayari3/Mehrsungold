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
import Chip from '@mui/material/Chip';
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

// Components
import CustomSwitch from "../shared/CustomSwitch"

/**
 * ExportsPageCompo component that displays the Exports Page Component of the website.
 * @returns The rendered Exports Page component.
 */
const ExportsPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const EXPORTS_TABLE_HEAD = [
        {
            label: 'کاربر',
            classes: ""
        },
        {
            label: 'لینک دانلود',
            classes: ""
        },
        {
            label: 'بازه زمانی',
            classes: ""
        },
        {
            label: 'تاریخ ثبت',
            classes: ""
        }
    ]

    const [pageItem, setPageItem] = useState(1);
    useEffect(() => {
        getExports(1);
    }, []);

    /**
        * Retrieves Exports
        * @returns None
       */
    const [exports, setExports] = useState([]);
    const [loadingExports, setLoadingExports] = useState(true);
    const [exportsLimit, setExportsLimit] = useState(10);
    const [exportsTotal, setExportsTotal] = useState(0);
    const [totalUser, setTotalUser] = useState(true);
    const getExports = (page, search) => {
        setLoadingExports(true);
        ApiCall('/transaction/report', 'GET', locale, {}, `${search ? `search=${search}&` : ''}sortOrder=0&sortBy=createdAt&limit=${exportsLimit}&skip=${(page * exportsLimit) - exportsLimit}`, 'admin', router).then(async (result) => {
            setExportsTotal(result.count);
            setExports(result.data);
            setLoadingExports(false);
        }).catch((error) => {
            setLoadingExports(false);
            console.log(error);
        });
    }

    const handlePageChange = (event, value) => {
        setPageItem(value);
        getExports(value);
    }

    /**
     * Search for a Exports based on the input value and filter the displayed Exports accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchExports, setSearchExports] = useState('');
    var typingTimerExports;
    const doneTypingIntervalExports = 300;
    const searchExportsItems = (event) => {
        clearTimeout(typingTimerExports);

        typingTimerExports = setTimeout(() => {
            if (event.target.value == '') {
                setSearchExports('');
                setPageItem(1);
                getExports(1, '');
            } else {
                setSearchExports(event.target.value);
                setPageItem(1);
                getExports(1, event.target.value);
            }
        }, doneTypingIntervalExports);

    }
    const searchExportsItemsHandler = () => {
        clearTimeout(typingTimerExports)
    }

    const [showAddExports, setShowAddExports] = useState(false);
    const [openBottomAddExportsDrawer, setOpenBottomAddExportsDrawer] = useState(false);
    const handleShowAddExports = () => {
        getUsers();
        if (window.innerWidth >= 1024) {
            setShowAddExports(true);
            setOpenBottomAddExportsDrawer(false);
        } else {
            setShowAddExports(false);
            setOpenBottomAddExportsDrawer(true);
        }
    }

    const [addExports, setAddExports] = useState({
        userId: '',
        startDate: '',
        endDate: ''
    });

    const validationSchema = Yup.object({
        totalUser: Yup.boolean(),
        userId: Yup.string().when("totalUser", {
            is: true,
            then: schema => schema.optional(),
            otherwise: schema => schema.required('کاربر را انتخاب نمائید'),
        }),
        startDate: Yup.string().required('این فیلد الزامی است'),
        endDate: Yup.string().required('این فیلد الزامی است'),
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const clearForm = () => {
        setValue('userId', '');
        setValue('startDate', '');
        setValue('endDate', '');
    }

    /**
  * save Export start and end date with the selected date from the datepicker.
  * @param {Event} event - The event object containing the selected date.
  * @returns None
  */
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isGregorian, setIsGregorian] = useState(locale == "fa" ? false : true);
    const limitDatepicker = (event, type) => {
        setAddExports({ ...addExports, [type]: event.locale(locale).format("YYYY-MM-DDTHH:mm:ssZ") });
        if (locale == 'fa') {
            type == 'startDate' ? setStartDate(event.locale(locale).format("jYYYY-jMM-jDD")) : setEndDate(event.locale(locale).format("jYYYY-jMM-jDD"));
        } else {
            type == 'startDate' ? setStartDate(event.locale(locale).format("YYYY-MM-DD")) : setEndDate(event.locale(locale).format("YYYY-MM-DD"));
        }
    }

    /**
         * Handles the change event for saving withdraw limits data.
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
                value = Number(event.target.value.replace(/,/g, ''));
                break;
            default:
                value = event.target.value;
                break;
        }
        setAddExports((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
    * Save new Export.
    * @returns None
   */
    const saveExport = () => {
        setLoading(true);
        const { userId, ...exportsData } = addExports;
        let body = totalUser ? { ...exportsData } : { ...addExports };
        ApiCall('/transaction/report', 'POST', locale, body, '', 'admin', router).then(async (result) => {
            setLoading(false);
            getExports(1);
            setShowAddExports(false);
            setOpenBottomAddExportsDrawer(false);
            setAddExports({
                userId: '',
                startDate: '',
                endDate: ''
            });
            setStartDate('');
            setEndDate('');
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

    const [users, setUsers] = useState([]);
    const [usersSelectLoading, setUserselectLoading] = useState(true);
    const [pageUsers, setPageUsers] = useState(1);
    const [showMoreUsers, setShowMoreUsers] = useState(false);
    const [usersLimit, setUsersLimit] = useState(10);
    const getUsers = async (search, type) => {
        setTimeout(async () => {
            if (search) {
                setShowMoreUsers(false);
                ApiCall('/user', 'GET', locale, {}, `roles=User&sortOrder=0&sortBy=createdAt&limit=${usersLimit}${search ? `&search=${search}` : ''}`, 'admin', router).then(async (result) => {
                    setUserselectLoading(false);
                    setUsers(result.data);
                }).catch((error) => {
                    setUserselectLoading(false);
                    setUsers([]);
                });
            } else {
                ApiCall('/user', 'GET', locale, {}, `roles=User&sortOrder=0&sortBy=createdAt&limit=${usersLimit}&skip=${type ? 0 : (pageItem * usersLimit) - usersLimit}`, 'admin', router).then(async (result) => {
                    if (type) {
                        Math.ceil(result.count / usersLimit) == 1 ? setShowMoreUsers(false) : setShowMoreUsers(true);
                        setUsers(result.data);
                        setPageUsers(2);
                    } else {
                        pageUsers == Math.ceil(result.count / usersLimit) ? setShowMoreUsers(false) : setShowMoreUsers(true);
                        setUsers([...users, ...result.data]);
                        setPageUsers((prevPage) => prevPage + 1);
                    }
                    setUserselectLoading(false);
                }).catch((error) => {
                    setUserselectLoading(false);
                    setUsers([]);
                });
            }

        }, 1000);
    }

    const handleScrollUsers = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;

        // Check if the user has scrolled to the bottom
        if ((scrollHeight - scrollTop === clientHeight) && usersSelectLoading == false) {
            // Call the fetchData function to load more data
            if (showMoreUsers) {
                setUserselectLoading(true);
                getUsers('', false);
            }
        }
    }

    /**
     * Search for a coin based on the input value and filter the displayed coin pairs accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchUsers, setSearchUsers] = useState('');
    var typingTimerUsers;
    const doneTypingIntervalUsers = 300;
    const searchUsersItems = (event) => {
        clearTimeout(typingTimerUsers);

        typingTimerUsers = setTimeout(() => {
            if (event.target.value == '') {
                setSearchUsers('');
                getUsers('', true);
            } else {
                setPageUsers(1);
                setSearchUsers(event.target.value);
                getUsers(event.target.value, false);
            }
        }, doneTypingIntervalUsers);

    }
    const searchUsersItemsHandler = () => {
        clearTimeout(typingTimerUsers)
    }

    /**
     * Renders custom content for the users component.
     * @param {object} props - The props passed to the component.
     * @param {object} state - The state of the component.
     * @param {object} methods - The methods available to the component.
     * @returns {JSX.Element} - The JSX element to render.
     */
    const usersCustomContentRenderer = ({ props, state, methods }) => {
        if (state.values.length > 0) {
            return (
                <div className="flex items-center justify-start gap-2">
                    <img src={'/assets/img/general/userPic.png'} alt={state.values[0].mobileNumber} className="rounded-[50%]" width={25} height={25} />
                    <span>{state.values[0].firstName && state.values[0].lastName ? `${state.values[0].firstName} ${state.values[0].lastName}` : `${state.values[0].mobileNumber}`} </span>
                </div>
            )
        } else {
            return <span>انتخاب کاربر</span>
        }

    }
    /**
     * Custom renderer function for rendering a dropdown component with users options.
     * @param {object} options - The options object containing props, state, and methods.
     * @returns {JSX.Element} - The rendered dropdown component.
     */
    const usersCustomDropdownRenderer = ({ props, state, methods }) => {
        const regexp = new RegExp(methods.safeString(state.search), "i");

        return (
            <div onScroll={handleScrollUsers} style={{ height: '300px', overflow: 'auto' }}>
                <div className="select-user-dropdown">
                    <div className="px-4">
                        <input
                            type="text"
                            value={searchUsers}
                            onChange={(event) => setSearchUsers(event.target.value)}
                            onKeyDown={searchUsersItemsHandler}
                            onKeyUp={searchUsersItems}
                            placeholder="جستجو کاربر"
                            className="w-full form-input border rounded-lg p-3 my-3 mx-auto"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-y-4">
                    {props.options
                        .filter((item) => { let search = props.searchBy.split(','); return regexp.test(item[search[0]]) || regexp.test(item[search[1]]) || regexp.test(item[search[2]]) || regexp.test(item[search[3]]) })
                        .map(option => {
                            return (
                                <div key={option._id} onClick={() => methods.addItem(option)} className="flex items-center justify-start gap-2 px-4">
                                    <img src={'/assets/img/general/userPic.png'} alt={option.mobileNumber} className="rounded-[50%]" width={25} height={25} />
                                    <label style={{ cursor: "pointer" }}>{option.firstName && option.lastName ? `${option.firstName} ${option.lastName}` : `${option.mobileNumber}`}</label>
                                </div>
                            );
                        })}
                </div>
                {usersSelectLoading ? <div className="flex justify-center items-center mt-4"><CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} /></div> : null}
            </div>
        );
    }

    return (
        <div className=" flex flex-col gap-y-8">
            <section className="flex items-center justify-between">
                <h1 className="text-2xl md:text-large-2">تاریخچه خروجی ها</h1>
                <div className="flex items-center gap-x-4">
                    <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation onClick={handleShowAddExports}>
                        <text className="text-black font-semibold">خروجی جدید</text>
                    </Button >
                </div>
            </section>
            <div className="flex items-center justify-between gap-x-4">
                <form autoComplete="off">
                    <FormControl className="w-full md:w-auto">
                        <TextField
                            size="small"
                            type="text"
                            label="جستجو خروجی"
                            InputLabelProps={{
                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                            }}
                            InputProps={{
                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                            }}
                            onChange={(event) => setSearchExports(event.target.value)}
                            onKeyDown={searchExportsItemsHandler}
                            onKeyUp={searchExportsItems} />
                    </FormControl>
                </form>
                <span className="dark:text-white">تعداد کل: {loadingExports ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (exportsTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>
            {loadingExports ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div>
                :
                <section className="overflow-x-auto overflow-y-hidden">
                    {exports.length > 0 ?
                        <>
                            <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                                <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                    <TableHead className="dark:bg-dark">
                                        <TableRow>
                                            {EXPORTS_TABLE_HEAD.map((data, index) => (
                                                <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-center pb-4`} key={index}>
                                                    <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {exports.map((data, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{ '&:last-child td': { border: 0 } }}
                                                className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                                <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                    {data.user && Object.keys(data.user).length > 0 ?
                                                        <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data.user?._id}`}>
                                                            <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                                                <span>({data.user?.mobileNumber}) {data.user?.firstName} {data.user?.lastName}</span>
                                                            </a>
                                                        </LinkRouter> : <Chip label="تمام کاربران" variant="outlined" size="small" className="badge badge-primary px-4" />}
                                                </TableCell>
                                                <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                    <LinkRouter legacyBehavior href={`${process.env.NEXT_PUBLIC_BASEURL}${data.url}`}>
                                                        <Button href={`${process.env.NEXT_PUBLIC_BASEURL}${data.url}`} target="_blank" variant="text" size="medium" color="primary" className="rounded-lg" disableElevation>
                                                            <text className=" font-semibold">دانلود فایل</text>
                                                        </Button >
                                                    </LinkRouter>
                                                </TableCell>
                                                <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                    <span>از {moment(moment(data.startDate).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                        .locale('fa')
                                                        .format('jYYYY/jMM/jDD | HH:mm')} تا {moment(moment(data.endDate).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                            .locale('fa')
                                                            .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                </TableCell>
                                                <TableCell className="text-center rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                    <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                        .locale('fa')
                                                        .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                        : <div className="py-16">
                            <span className="block text-center text-large-1 text-primary-gray">خروجی یافت نشد</span>
                        </div>}
                </section>
            }

            {Math.ceil(exportsTotal / exportsLimit) > 1 ?
                <div className="text-center mt-4">
                    <Pagination siblingCount={0} count={Math.ceil(exportsTotal / exportsLimit)} variant="outlined" color="primary" className="justify-center"
                        page={pageItem} onChange={handlePageChange} />
                </div>
                : ''}

            {/* AddExports */}
            <>
                <Dialog onClose={() => setShowAddExports(false)} open={showAddExports} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">خروجی جدید
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowAddExports(false)}>
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
                        onSubmit={handleSubmit(saveExport)}
                    >
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <Controller
                                    name="totalUser"
                                    control={control}
                                    defaultValue={totalUser}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            className="justify-between text-end m-0"
                                            control={<CustomSwitch
                                                {...field}
                                                checked={field.value}
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    setTotalUser(event.target.checked);
                                                    setValue('userId', '');
                                                    if (event.target.checked) {
                                                        setAddExports({ ...addExports, userId: '' });
                                                    }
                                                }}
                                            />}
                                            label="تمام کاربران ؟" />
                                    )}
                                />
                            </FormGroup>
                        </div>
                        {totalUser ? (
                            <div className="col-span-12 md:col-span-6 invisible">
                                <Select
                                    options={users}
                                    values={[]}
                                    dropdownGap={0}
                                    direction={'ltr'}
                                />
                            </div>
                        ) : (
                            <div className="col-span-12 md:col-span-6">
                                <Controller
                                    name="userId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={users}
                                            loading={usersSelectLoading}
                                            contentRenderer={usersCustomContentRenderer}
                                            dropdownRenderer={usersCustomDropdownRenderer}
                                            onChange={(values) => {
                                                field.onChange(values.length > 0 ? values[0]._id : '');
                                                setAddExports({ ...addExports, userId: values.length > 0 ? values[0]._id : '' });
                                            }}
                                            values={[]}
                                            dropdownGap={0}
                                            direction={'ltr'}
                                            searchBy={'username,mobileNumber'}
                                        />
                                    )}
                                />
                                {errors.userId && <FormHelperText className="text-red-500 mx-4">{errors.userId.message}</FormHelperText>}
                            </div>
                        )}
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="startDate"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <DatePicker
                                            name="datePickerstartDate"
                                            timePicker={true}
                                            isGregorian={isGregorian}
                                            className="form-input hidden"
                                            onChange={(date) => {
                                                field.onChange(date);
                                                limitDatepicker(date, 'startDate');
                                            }}
                                        />
                                        <TextField
                                            type="text"
                                            color={'primary'}
                                            label="تاریخ شروع"
                                            variant="outlined"
                                            error={!!errors.startDate}
                                            helperText={errors.startDate ? errors.startDate.message : ''}
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
                                            value={startDate}
                                            onClick={() => document.querySelector('input[name="datePickerstartDate"]').click()}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="endDate"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <DatePicker
                                            name="datePickerEndDate"
                                            timePicker={true}
                                            isGregorian={isGregorian}
                                            className="form-input hidden"
                                            onChange={(date) => {
                                                field.onChange(date);
                                                limitDatepicker(date, 'endDate');
                                            }}
                                        />
                                        <TextField
                                            type="text"
                                            color={'primary'}
                                            label="تاریخ پایان"
                                            variant="outlined"
                                            error={!!errors.endDate}
                                            helperText={errors.endDate ? errors.endDate.message : ''}
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
                                            value={endDate}
                                            onClick={() => document.querySelector('input[name="datePickerEndDate"]').click()}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">گرفتن خروجی</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomAddExportsDrawer}
                    onClose={() => setOpenBottomAddExportsDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">خروجی جدید
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomAddExportsDrawer(false)}>
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
                        onSubmit={handleSubmit(saveExport)}
                    >
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <Controller
                                    name="totalUser"
                                    control={control}
                                    defaultValue={totalUser}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            className="justify-between text-end m-0"
                                            control={<CustomSwitch
                                                {...field}
                                                checked={field.value}
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    setTotalUser(event.target.checked);
                                                    setValue('userId', '');
                                                    if (event.target.checked) {
                                                        setAddExports({ ...addExports, userId: '' });
                                                    }
                                                }}
                                            />}
                                            label="تمام کاربران ؟" />
                                    )}
                                />
                            </FormGroup>
                        </div>
                        {totalUser ? (
                            <div className="col-span-12 md:col-span-6 invisible">
                                <Select
                                    options={users}
                                    values={[]}
                                    dropdownGap={0}
                                    direction={'ltr'}
                                />
                            </div>
                        ) : (
                            <div className="col-span-12 md:col-span-6">
                                <Controller
                                    name="userId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={users}
                                            loading={usersSelectLoading}
                                            contentRenderer={usersCustomContentRenderer}
                                            dropdownRenderer={usersCustomDropdownRenderer}
                                            onChange={(values) => {
                                                field.onChange(values.length > 0 ? values[0]._id : '');
                                                setAddExports({ ...addExports, userId: values.length > 0 ? values[0]._id : '' });
                                            }}
                                            values={[]}
                                            dropdownGap={0}
                                            direction={'ltr'}
                                            searchBy={'username,mobileNumber'}
                                        />
                                    )}
                                />
                                {errors.userId && <FormHelperText className="text-red-500 mx-4">{errors.userId.message}</FormHelperText>}
                            </div>
                        )}
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="startDate"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <DatePicker
                                            name="datePickerstartDate"
                                            timePicker={true}
                                            isGregorian={isGregorian}
                                            className="form-input hidden"
                                            onChange={(date) => {
                                                field.onChange(date);
                                                limitDatepicker(date, 'startDate');
                                            }}
                                        />
                                        <TextField
                                            type="text"
                                            color={'primary'}
                                            label="تاریخ شروع"
                                            variant="outlined"
                                            error={!!errors.startDate}
                                            helperText={errors.startDate ? errors.startDate.message : ''}
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
                                            value={startDate}
                                            onClick={() => document.querySelector('input[name="datePickerstartDate"]').click()}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Controller
                                name="endDate"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <DatePicker
                                            name="datePickerEndDate"
                                            timePicker={true}
                                            isGregorian={isGregorian}
                                            className="form-input hidden"
                                            onChange={(date) => {
                                                field.onChange(date);
                                                limitDatepicker(date, 'endDate');
                                            }}
                                        />
                                        <TextField
                                            type="text"
                                            color={'primary'}
                                            label="تاریخ پایان"
                                            variant="outlined"
                                            error={!!errors.endDate}
                                            helperText={errors.endDate ? errors.endDate.message : ''}
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
                                            value={endDate}
                                            onClick={() => document.querySelector('input[name="datePickerEndDate"]').click()}
                                        />
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">گرفتن خروجی</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>
        </div>
    )
}

export default ExportsPageCompo;