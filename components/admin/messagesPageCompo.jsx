import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
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
import MUISelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import moment from 'jalali-moment'

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
 * MessagesPageCompo component that displays the Messages Page Component of the website.
 * @returns The rendered Messages Page component.
 */
const MessagesPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, priceInfo, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);

    const MESSAGES_TABLE_HEAD = [
        // {
        //     label: 'فرستنده',
        //     classes: ""
        // },
        {
            label: 'گیرنده',
            classes: ""
        },
        {
            label: 'عنوان',
            classes: ""
        },
        {
            label: 'تاریخ ارسال',
            classes: ""
        },
        {
            label: 'اقدامات',
            classes: ""
        },
    ]

    const [pageItem, setPageItem] = useState(1);
    useEffect(() => {
        getMessages(1);
    }, []);

    /**
         * Retrieves Messages list.
         * @returns None
        */
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [messagesLimit, setMessagesLimit] = useState(10);
    const [messagesTotal, setMessagesTotal] = useState(0);
    const getMessages = (page, search) => {
        setLoadingMessages(true);
        ApiCall('/message', 'GET', locale, {}, `${search ? `search=${search}&` : ''}limit=${messagesLimit}&skip=${(page * messagesLimit) - messagesLimit}&sortOrder=0&sortBy=createdAt`, 'admin', router).then(async (result) => {
            setMessagesTotal(result.count);
            setMessages(result.data);
            setLoadingMessages(false);
        }).catch((error) => {
            setLoadingMessages(false);
            console.log(error);
        });
    }

    const handlePageChange = (event, value) => {
        setPageItem(value);
        getMessages(value);
    }

    /**
     * Search for a Messages based on the input value and filter the displayed Messages accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchMessages, setSearchMessages] = useState('');
    var typingTimerMessages;
    const doneTypingIntervalMessages = 300;
    const searchMessagesItems = (event) => {
        clearTimeout(typingTimerMessages);

        typingTimerMessages = setTimeout(() => {
            if (event.target.value == '') {
                setSearchMessages('');
                setPageItem(1);
                getMessages(1, '');
            } else {
                setSearchMessages(event.target.value);
                setPageItem(1);
                getMessages(1, event.target.value);
            }
        }, doneTypingIntervalMessages);

    }
    const searchMessagesItemsHandler = () => {
        clearTimeout(typingTimerMessages)
    }

    const [showAddMessage, setShowAddMessage] = useState(false);
    const [openBottomAddMessageDrawer, setOpenBottomAddMessageDrawer] = useState(false);
    const handleShowAddMessage = () => {
        getUsers();
        if (window.innerWidth >= 1024) {
            setShowAddMessage(true);
            setOpenBottomAddMessageDrawer(false);
        } else {
            setShowAddMessage(false);
            setOpenBottomAddMessageDrawer(true);
        }
    }

    const [messageData, setMessageData] = useState();
    const [showMoreData, setShowMoreData] = useState(false);
    const [openBottomMoreDataDrawer, setOpenBottomMoreDataDrawer] = useState(false);
    const handleShowMoreData = (data) => () => {
        setMessageData(data);
        if (window.innerWidth >= 1024) {
            setShowMoreData(true);
            setOpenBottomMoreDataDrawer(false);
        } else {
            setShowMoreData(false);
            setOpenBottomMoreDataDrawer(true);
        }
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
                ApiCall('/user', 'GET', locale, {}, `limit=${usersLimit}${search ? `&search=${search}` : ''}`, 'admin', router).then(async (result) => {
                    setUserselectLoading(false);
                    setUsers(result.data);
                }).catch((error) => {
                    setUserselectLoading(false);
                    setUsers([]);
                });
            } else {
                ApiCall('/user', 'GET', locale, {}, `limit=${usersLimit}&skip=${type ? 0 : (pageItem * usersLimit) - usersLimit}`, 'admin', router).then(async (result) => {
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

    /**
     * Handles the change event for Adding products inputs.
     * @param {string} input - The name of the input field being changed.
     * @param {string} type - The type of the input field.
     * @param {Event} event - The change event object.
     * @returns None
     */
    // [ SMS, All ]
    const [addMessage, setAddMessage] = useState(
        {
            receiverId: '',
            subject: '',
            text: '',
            notifyType: 'None'
        }
    )
    const [totalUser, setTotalUser] = useState(true);
    const validationSchema = Yup.object({
        totalUser: Yup.boolean(),
        receiverId: Yup.string().when("totalUser", {
            is: true,
            then: schema => schema.optional(),
            otherwise: schema => schema.required('کاربر را انتخاب نمائید'),
        }),
        subject: Yup.string().required('این فیلد الزامی است'),
        text: Yup.string().required('این فیلد الزامی است')
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const clearForm = () => {
        setValue('receiverId', '');
        setValue('subject', '');
        setValue('text', '');
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
        setAddMessage((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
     * Add A Message.
     * @returns None
    */
    const saveMessage = () => {
        let body;
        const { notifyType, receiverId, ...addMessageData } = addMessage;
        if (totalUser) {
            body = { ...addMessageData }
        } else {
            if (addMessage?.notifyType == 'None') {
                body = { ...addMessageData, receiverId }
            } else {
                body = { ...addMessage }
            }
        }
        setLoading(true);
        ApiCall('/message', 'POST', locale, body, '', 'admin', router).then(async (result) => {
            setLoading(false);
            setAddMessage({
                receiverId: '',
                subject: '',
                text: '',
                notifyType: 'None'
            });
            clearForm();
            setShowAddMessage(false);
            setOpenBottomAddMessageDrawer(false);
            getMessages(1);
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

    return (
        <div className=" flex flex-col gap-y-8">
            <section className="flex items-center justify-between">
                <h1 className="text-large-2">پیام ها</h1>
                <div className="flex items-center gap-x-4">
                    <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation onClick={handleShowAddMessage}>
                        <text className="text-black font-semibold">ارسال پیام</text>
                    </Button >
                </div>
            </section>

            <section>
                <div className="flex items-center justify-between gap-x-4">
                    <form autoComplete="off">
                        <FormControl className="w-full md:w-auto">
                            <TextField
                                size="small"
                                type="text"
                                label="جستجو پیام"
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                onChange={(event) => setSearchMessages(event.target.value)}
                                onKeyDown={searchMessagesItemsHandler}
                                onKeyUp={searchMessagesItems} />
                        </FormControl>
                    </form>
                    <span className="dark:text-white">تعداد کل: {loadingMessages ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (messagesTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
                {loadingMessages ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : messages.length > 0 ?
                    <>
                        <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                            <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                <TableHead className="dark:bg-dark">
                                    <TableRow>
                                        {MESSAGES_TABLE_HEAD.map((data, index) => (
                                            <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
                                                <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {messages.map((data, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{ '&:last-child td': { border: 0 } }}
                                            className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                            <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                <LinkRouter legacyBehavior href={`/admin/panel/usersinglepage?id=${data.receiver?._id}`}>
                                                    <a target="_blank" className="no-underline text-blue-400 hover:underline">
                                                        <span>({data.receiver?.mobileNumber}) {data.receiver?.firstName} {data.receiver?.lastName}</span>
                                                    </a>
                                                </LinkRouter>
                                            </TableCell>
                                            <TableCell className=" border-none px-8 py-4 text-sm dark:text-white">
                                                {data.subject}
                                            </TableCell>
                                            <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                    .locale('fa')
                                                    .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                            </TableCell>
                                            <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                <Button variant="text" size="medium" color="primary" className="rounded-lg" disableElevation
                                                    onClick={handleShowMoreData(data)}>
                                                    <text className=" font-semibold">جزئیات بیشتر</text>
                                                </Button >
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {Math.ceil(messagesTotal / messagesLimit) > 1 ?
                            <div className="text-center mt-4">
                                <Pagination siblingCount={0} count={Math.ceil(messagesTotal / messagesLimit)} variant="outlined" color="primary" className="justify-center"
                                    page={pageItem} onChange={handlePageChange} />
                            </div>
                            : ''}
                    </>
                    : <div className="py-16">
                        <span className="block text-center text-large-1 text-primary-gray">پیامی ارسال نشده است.</span>
                    </div>}

            </section>

            {/* AddMessage */}
            <>
                <Dialog onClose={() => setShowAddMessage(false)} open={showAddMessage} maxWidth={'sm'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ارسال پیام
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowAddMessage(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate autoComplete="off" onSubmit={handleSubmit(saveMessage)}>
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
                                                    setValue('receiverId', '');
                                                    if (event.target.checked) {
                                                        setAddMessage({ ...addMessage, notifyType: 'None', receiverId: '' });
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
                                    name="receiverId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={users}
                                            loading={usersSelectLoading}
                                            contentRenderer={usersCustomContentRenderer}
                                            dropdownRenderer={usersCustomDropdownRenderer}
                                            onChange={(values) => {
                                                field.onChange(values.length > 0 ? values[0]._id : '');
                                                setAddMessage({ ...addMessage, receiverId: values.length > 0 ? values[0]._id : '' });
                                            }}
                                            values={[]}
                                            dropdownGap={0}
                                            direction={'ltr'}
                                            searchBy={'username,mobileNumber'}
                                        />
                                    )}
                                />
                                {errors.receiverId && <FormHelperText className="text-red-500 mx-4">{errors.receiverId.message}</FormHelperText>}
                            </div>
                        )}
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="subject"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="عنوان پیام"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.subject}
                                            helperText={errors.subject ? errors.subject.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'subject', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="text"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="توضیحات پیام"
                                            multiline
                                            rows={4}
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                            }}
                                            error={!!errors.text}
                                            helperText={errors.text ? errors.text.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'text', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <MUISelect
                                type="text"
                                variant="filled"
                                color="black"
                                label="نحوه ارسال"
                                className="form-select w-full"
                                IconComponent={() => { }}
                                disabled={true}
                                // value={totalUser ? 'None' : addMessage?.notifyType}
                                value={'None'}
                                // onChange={(event) => handleChangeAddData(event, 'notifyType', 'text')}
                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                <MenuItem value="ALL" >همه</MenuItem>
                                <MenuItem value="None" >اعلانی</MenuItem>
                                <MenuItem value="SMS" >پیامکی</MenuItem>
                            </MUISelect>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">ارسال پیام</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomAddMessageDrawer}
                    onClose={() => setOpenBottomAddMessageDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ارسال پیام
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomAddMessageDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate autoComplete="off" onSubmit={handleSubmit(saveMessage)}>
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
                                                    setValue('receiverId', '');
                                                    if (event.target.checked) {
                                                        setAddMessage({ ...addMessage, notifyType: 'None', receiverId: '' });
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
                                    name="receiverId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={users}
                                            loading={usersSelectLoading}
                                            contentRenderer={usersCustomContentRenderer}
                                            dropdownRenderer={usersCustomDropdownRenderer}
                                            onChange={(values) => {
                                                field.onChange(values.length > 0 ? values[0]._id : '');
                                                setAddMessage({ ...addMessage, receiverId: values.length > 0 ? values[0]._id : '' });
                                            }}
                                            values={[]}
                                            dropdownGap={0}
                                            direction={'ltr'}
                                            searchBy={'username,mobileNumber'}
                                        />
                                    )}
                                />
                                {errors.receiverId && <FormHelperText className="text-red-500 mx-4">{errors.receiverId.message}</FormHelperText>}
                            </div>
                        )}
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="subject"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="عنوان پیام"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.subject}
                                            helperText={errors.subject ? errors.subject.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'subject', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="text"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="توضیحات پیام"
                                            multiline
                                            rows={4}
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                            }}
                                            error={!!errors.text}
                                            helperText={errors.text ? errors.text.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'text', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <MUISelect
                                type="text"
                                variant="filled"
                                color="black"
                                label="نحوه ارسال"
                                className="form-select w-full"
                                IconComponent={() => { }}
                                disabled={true}
                                // value={totalUser ? 'None' : addMessage?.notifyType}
                                value={'None'}
                                // onChange={(event) => handleChangeAddData(event, 'notifyType', 'text')}
                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                <MenuItem value="ALL" >همه</MenuItem>
                                <MenuItem value="None" >اعلانی</MenuItem>
                                <MenuItem value="SMS" >پیامکی</MenuItem>
                            </MUISelect>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">ارسال پیام</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* MoreData */}
            <>
                <Dialog onClose={() => setShowMoreData(false)} open={showMoreData} maxWidth={'sm'} fullWidth PaperProps={{ className: 'modals' }}>
                    <Typography component={'h2'} className="flex items-center gap-x-2">توضیحات پیام</Typography>
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
                                value={messageData?.text} />
                        </FormControl>
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
                    <Typography component={'h2'} className="flex items-center gap-x-2">توضیحات پیام</Typography>
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
                                value={messageData?.text} />
                        </FormControl>
                        <div className="flex items-center justify-end gap-x-2">
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

export default MessagesPageCompo;