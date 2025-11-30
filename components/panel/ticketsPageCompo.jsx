import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
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
import Tooltip from '@mui/material/Tooltip';
import CancelIcon from '@mui/icons-material/CancelOutlined'
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import moment from 'jalali-moment'

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
import ConfirmDialog from '../shared/ConfirmDialog'

/**
 * TicketsPageCompo component that displays the Tickets Page Component of the website.
 * @returns The rendered Tickets Page component.
 */
const TicketsPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, priceInfo, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [loading, setLoading] = useState(false);

    const MESSAGES_TABLE_HEAD = [
        {
            label: 'عنوان',
            classes: ""
        },
        {
            label: 'تاریخ ارسال',
            classes: ""
        },
        {
            label: 'وضعیت',
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
        getTickets();
    }, [pageItem]);

    /**
         * Retrieves Messages list.
         * @returns None
        */
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [messagesLimit, setMessagesLimit] = useState(10);
    const [messagesTotal, setMessagesTotal] = useState(0);
    const getTickets = () => {
        setLoadingMessages(true);
        ApiCall('/ticket', 'GET', locale, {}, `userId=${userInfo?._id}&sortOrder=0&sortBy=createdAt&limit=${messagesLimit}&skip=${(pageItem * messagesLimit) - messagesLimit}`, 'user', router).then(async (result) => {
            setMessagesTotal(result.count);
            setMessages(result.data);
            setLoadingMessages(false);
        }).catch((error) => {
            setLoadingMessages(false);
            console.log(error);
        });
    }

    const [showAddTicket, setShowAddTicket] = useState(false);
    const [openBottomAddTicketDrawer, setOpenBottomAddTicketDrawer] = useState(false);
    const handleShowAddTicket = () => {
        if (window.innerWidth >= 1024) {
            setShowAddTicket(true);
            setOpenBottomAddTicketDrawer(false);
        } else {
            setShowAddTicket(false);
            setOpenBottomAddTicketDrawer(true);
        }
    }

    const validationSchema = Yup.object({
        subject: Yup.string().required('این فیلد الزامی است')
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const clearForm = () => {
        setValue('subject', '');
    }

    /**
       * Add Ticket Request.
       * @returns None
      */
    const [ticketTitle, setTicketTitle] = useState('');
    const [addTicketLoading, setAddTicketLoading] = useState(false);
    const addTicket = () => {
        if (ticketTitle) {
            setAddTicketLoading(true);
            ApiCall('/ticket', 'POST', locale, { subject: ticketTitle }, '', 'user', router).then(async (result) => {
                dispatch({
                    type: 'setSnackbarProps', value: {
                        open: true, content: 'با موفقیت انجام شد',
                        type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                    }
                });
                setAddTicketLoading(false);
                clearForm();
                setShowAddTicket(false);
                setOpenBottomAddTicketDrawer(false);
                getTickets();
                window.open(`/panel/ticket?id=${result.id}`, { target: '_blank' });
            }).catch((error) => {
                setAddTicketLoading(false);
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
    }

    const handleRefresh = (event) => {
        getTickets();
    }

    const [openDialog, setOpenDialog] = useState(false);
    const [ticketId, setTicketId] = useState('');
    const handleOpenDialog = (ticketId) => (event) => {
        setTicketId(ticketId);
        setOpenDialog(true);
    }
    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    /**
     * Close A Message.
     * @returns None
    */
    const [closeLoading, setCloseLoading] = useState(false);
    const closeMessage = () => {
        setCloseLoading(true);
        ApiCall(`/ticket/${ticketId}/deactivate`, 'PATCH', locale, {}, '', 'user', router).then(async (result) => {
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
            setCloseLoading(false);
            getTickets();
            handleCloseDialog();
        }).catch((error) => {
            setCloseLoading(false);
            handleCloseDialog();
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
        <div className="xl:max-w-[60rem] xl:mx-auto">
            <section className="flex items-center justify-between">
                <h1 className="text-large-2">تیکت ها</h1>
                <div className="flex items-center gap-x-4">
                    <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation onClick={handleShowAddTicket}>
                        <text className="text-black font-semibold">ارسال تیکت</text>
                    </Button >
                </div>
            </section>

            <section>
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
                                            <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                <Tooltip title={data.subject} placement="top-start">
                                                    <p className="w-[250px] truncate">{data.subject}</p>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                    .locale('fa')
                                                    .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                            </TableCell>
                                            <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                <div className="flex items-center gap-x-2">
                                                    {data.isActive ? <Chip label="در جریان" variant="outlined" size="small" className="w-full badge badge-success" /> :
                                                        <Chip label="بسته شده" variant="outlined" size="small" className="w-full badge badge-error" />}
                                                    {data.hasNewMessageForUser ? <Chip label="خوانده نشده" variant="outlined" size="small" className="w-full badge badge-primary" /> :
                                                        <Chip label="خوانده شده" variant="outlined" size="small" className="w-full badge badge-info" />}
                                                </div>
                                            </TableCell>
                                            <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                <LinkRouter legacyBehavior href={`/panel/ticket?id=${data._id}`}>
                                                    <Button href={`/panel/ticket?id=${data._id}`} variant="text" size="medium" color="primary" className="rounded-lg" disableElevation>
                                                        <text className=" font-semibold">جزئیات بیشتر</text>
                                                    </Button >
                                                </LinkRouter>
                                            </TableCell>
                                            <TableCell className="text-center rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                {data.isActive ? <Tooltip title="بستن تیکت">
                                                    <IconButton
                                                        color={`error`}
                                                        onClick={handleOpenDialog(data._id)}>
                                                        <CancelIcon />
                                                    </IconButton>
                                                </Tooltip> : '----'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <ConfirmDialog
                            open={openDialog}
                            onClose={handleCloseDialog}
                            onConfirm={closeMessage}
                            title="آیا مطمئن هستید؟"
                            loading={closeLoading}
                            darkModeToggle={darkModeToggle}
                        />
                        {Math.ceil(messagesTotal / messagesLimit) > 1 ?
                            <div className="text-center mt-4">
                                <Pagination siblingCount={0} count={Math.ceil(messagesTotal / messagesLimit)} variant="outlined" color="primary" className="justify-center"
                                    page={pageItem} onChange={(event, value) => setPageItem(value)} />
                            </div>
                            : ''}
                    </>
                    : <div className="py-16">
                        <span className="block text-center text-large-1 text-primary-gray">تیکتی ارسال نشده است.</span>
                    </div>}

            </section>

            {/* AddTicket */}
            <>
                <Dialog onClose={() => setShowAddTicket(false)} open={showAddTicket} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <Typography component={'h2'} className="flex items-center gap-x-2">ارسال تیکت</Typography>
                    <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate autoComplete="off" onSubmit={handleSubmit(addTicket)}>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="subject"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="عنوان تیکت"
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
                                                setTicketTitle(event.target.value);
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={addTicketLoading}>
                                <text className="text-black font-semibold">ارسال تیکت</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomAddTicketDrawer}
                    onClose={() => setOpenBottomAddTicketDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <Typography component={'h2'} className="flex items-center gap-x-2">ارسال تیکت</Typography>
                    <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate autoComplete="off" onSubmit={handleSubmit(addTicket)}>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="subject"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="عنوان تیکت"
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
                                                setTicketTitle(event.target.value);
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={addTicketLoading}>
                                <text className="text-black font-semibold">ارسال تیکت</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>
        </div>
    )
}

export default TicketsPageCompo;