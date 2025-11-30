import { useState, useEffect } from 'react'
import Head from "next/head"
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import moment from 'jalali-moment'

import heic2any from 'heic2any';
import imageCompression from 'browser-image-compression';

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call"
import ImageFormats from "../../services/imageFormats";
import ConvertToJalali from "../../services/convertToJalali";

// Components
import ConfirmDialog from '../shared/ConfirmDialog'

/**
 * TicketPageCompo component that displays the Admin Ticket Page Component of the website.
 * @returns The rendered Admin Ticket Page component.
 */
const TicketPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, priceInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [ticketId, setTicketId] = useState(router.query?.id);

    useEffect(() => {
        if (router.query?.id) {
            getTicketData();
        }
    }, [router.query?.id]);

    /**
  * Retrieves Ticket Data.
  * @returns None
 */
    const [ticketData, setTicketData] = useState([]);
    const [loadingTicketData, setLoadingTicketData] = useState(true);
    const getTicketData = () => {
        setLoadingTicketData(true);
        ApiCall('/ticket/chat', 'GET', locale, {}, `ticketId=${ticketId}`, 'user', router).then(async (result) => {
            setTicketData(result);
            setTicketId(result.ticket?._id);
            if (result.ticket?.hasNewMessageForUser) {
                readTicket(result.ticket?._id);
            }
            setLoadingTicketData(false);
        }).catch((error) => {
            setLoadingTicketData(false);
            console.log(error);
        });
    }

    /**
     * Reads a ticket with the given ticketId and performs necessary actions.
     * @param {{string}} ticketId - The ID of the ticket to be read.
     * @returns None
    */
    const readTicket = (ticketId) => {
        ApiCall(`/ticket/${ticketId}/read`, 'PATCH', locale, {}, '', 'user', router).then(async (result) => {
            dispatch({
                type: 'setRefreshUnreadTickets', value: parseInt(Math.floor(Math.random() * 100) + 1)
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    /**
     * Opens the image file dialog when the event is triggered, if the `isDisabled` flag is not set.
     * @param {Event} event - The event that triggers the function.
     * @returns None
     */
    const openTicketFile = (event) => {
        if (!isDisabled) {
            document.querySelector('input#ticket').click();
        }
    }
    const [isDisabled, setIsDisabled] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    /**
     * Converts HEIC image to JPEG if needed.
     * @param {File} file
     * @returns {Promise<File>}
     */
    async function convertHeicIfNeeded(file) {
        if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
            try {
                setImageLoading(true);
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.9,
                });

                return new File(
                    [convertedBlob],
                    file.name.replace(/\.heic$/i, '.jpg'),
                    { type: 'image/jpeg' }
                );
            } catch (error) {
                console.error('HEIC conversion failed', error);
                throw error;
            }
        }
        return file;
    }

    /**
     * Uploads ticket file with optional HEIC conversion and compression.
     */
    const uploadTicketFile = async (event) => {
        try {
            const originalFile = event.target.files?.[0];
            if (!originalFile) return;

            setImageLoading(true);
            setIsDisabled(true);

            const file = await convertHeicIfNeeded(originalFile);

            let finalFile = file;

            if (file.type.startsWith('image/') && file.size / 1024 / 1024 > 5) {
                const options = {
                    maxSizeMB: 5,
                    maxWidthOrHeight: 3000,
                    useWebWorker: true,
                    initialQuality: 0.9,
                };

                let compressedFile = await imageCompression(file, options);

                while (compressedFile.size / 1024 / 1024 > 5 && options.initialQuality > 0.5) {
                    options.initialQuality -= 0.05;
                    compressedFile = await imageCompression(file, options);
                }

                finalFile = new File([compressedFile], file.name, {
                    type: file.type || 'image/jpeg',
                });
            }

            const formData = new FormData();
            formData.append("file", finalFile);

            ApiCall('/ticket/upload', 'POST', locale, formData, '', 'user', router, true)
                .then((result) => {
                    setImageLoading(false);
                    setIsDisabled(false);
                    setTicketFile(result.fileUrl);
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true,
                            content: 'با موفقیت انجام شد',
                            type: 'success',
                            duration: 1000,
                            refresh: Math.floor(Math.random() * 100) + 1
                        }
                    });
                })
                .catch((error) => {
                    setImageLoading(false);
                    setIsDisabled(false);
                    let list = '';
                    if (error?.message && typeof error?.message === 'object') {
                        error.message.forEach(item => {
                            list += `${item}<br />`;
                        });
                    } else {
                        list = error.message;
                    }
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true,
                            content: list,
                            type: 'error',
                            duration: 3000,
                            refresh: Math.floor(Math.random() * 100) + 1
                        }
                    });
                });

        } catch (error) {
            setIsDisabled(false);
            console.error('Upload failed:', error);
        }
    }

    /**
           * Add Ticket Request.
           * @returns None
          */
    const [ticketText, setTicketText] = useState('');
    const [ticketFile, setTicketFile] = useState('');
    const [addTicketLoading, setAddTicketLoading] = useState(false);
    const addTicket = (event) => {
        event.preventDefault();
        if (ticketText) {
            setAddTicketLoading(true);
            let body = ticketFile ? { ticketId, text: ticketText, fileUrl: ticketFile } : { ticketId, text: ticketText }
            ApiCall('/ticket/message', 'POST', locale, body, '', 'user', router).then(async (result) => {
                event.target.disabled = false;
                setAddTicketLoading(false);
                dispatch({
                    type: 'setSnackbarProps', value: {
                        open: true, content: 'با موفقیت انجام شد',
                        type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                    }
                });
                setTicketText('');
                setTicketFile('');
                getTicketData();
            }).catch((error) => {
                setAddTicketLoading(false);
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

    const [openDialog, setOpenDialog] = useState(false);
    const handleOpenDialog = (event) => {
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
                    open: true, content: 'با موفقیت انجام شد',
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
            setCloseLoading(false);
            getTicketData();
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
        <>
            <Head>
                <title>تیکت : {ticketData?.ticket?.subject}</title>
            </Head>
            <div className="xl:max-w-[60rem] xl:mx-auto">
                {loadingTicketData ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> :
                    <div className="relative h-full flex flex-col gap-y-4 lg:h-auto lg:rounded-[1.25rem] lg:border lg:border-solid lg:bg-light-secondary-foreground lg:border-light-gray lg:dark:bg-dark-alt lg:dark:bg-dark-foreground lg:dark:bg-opacity-25 lg:dark:border-dark-alt">
                        <div className="relative h-[80svh] md:h-[75svh] lg:h-[70svh] flex flex-col gap-y-7 py-4 lg:px-4 overflow-y-auto overflow-x-hidden">
                            {ticketData?.ticket?.isActive ? <div className="absolute top-3 rtl:left-0 ltr:right-0 lg:top-3 rtl:lg:left-3 ltr:lg:right-3">
                                <Button type="button" variant="contained" size="small" color="error" className="rounded-lg" disableElevation
                                    onClick={handleOpenDialog}>
                                    <text className="text-white font-semibold">بستن تیکت</text>
                                </Button >
                            </div> : ''}
                            <div className="flex flex-col gap-y-4 h-full">
                                <div className="ticekt-title w-full flex flex-col items-center gap-y-2 px-2.5 pb-2">
                                    <span className=" text-base font-normal leading-normal">عنوان تیکت:<br /></span>
                                    <span className=" text-base font-normal leading-normal dark:text-white">{ticketData?.ticket?.subject}</span>
                                    <span className="flex text-primary-gray text-sm font-normal leading-tight">
                                        <span className="mx-2">{moment(moment(ticketData?.ticket?.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                            .locale('fa')
                                            .format('jYYYY/jMM/jDD')}</span>
                                        <span>{ConvertToJalali(ticketData?.ticket?.createdAt)}</span></span>
                                </div>
                                <div className="flex flex-col gap-y-3.5 pb-[30%] md:pb-[15%] lg:pb-[20%] xl:pb-[15%]">
                                    {ticketData?.data?.map((data, index) => {
                                        if (data.sender?._id == userInfo?._id) {
                                            return (
                                                <div key={index} className="flex flex-col gap-y-4">
                                                    {data.text ? <div className="w-[80%] lg:w-[50%] 2xl:w-1/3 flex flex-col items-start bg-light-gray dark:bg-dark-alt rtl:rounded-[1.875rem_1.875rem_0.625rem_1.875rem] ltr:rounded-[1.875rem_1.875rem_1.875rem_0.625rem] px-2.5 pt-6 pb-2">
                                                        <span className="text-sm font-normal leading-normal">{data.text}</span>
                                                        <span className="flex justify-end text-primary-gray text-xs font-normal leading-tight mt-4">
                                                            <span className="mx-2">{moment(moment(data?.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD')}</span>
                                                            <span>{ConvertToJalali(data?.createdAt)}</span>
                                                        </span>
                                                    </div> : ''}
                                                    {data.file ? ImageFormats.includes(data.file?.split('.')?.pop()) ? <div onClick={() => window.open(`${process.env.NEXT_PUBLIC_BASEURL}${data.file}`, { target: '_blank' })}
                                                        className="relative w-[80%] lg:w-[50%] 2xl:w-1/3 h-28 flex flex-col items-start cursor-pointer bg-[#2675EC] rtl:rounded-[1.875rem_1.875rem_0.625rem_1.875rem] ltr:rounded-[1.875rem_1.875rem_1.875rem_0.625rem] p-0">
                                                        <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.file}`} alt="ticket-image" className="w-full h-[80%] rtl:rounded-[1.875rem_1.875rem_0.625rem_1.875rem] ltr:rounded-[1.875rem_1.875rem_1.875rem_0.625rem]" />
                                                        <span className="flex justify-end text-white text-xs font-normal leading-tight absolute bottom-2 rtl:right-2 ltr:left-2">
                                                            <span className="mx-2">{moment(moment(data?.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD')}</span>
                                                            <span>{ConvertToJalali(data?.createdAt)}</span>
                                                        </span>
                                                    </div> : <div className="w-[80%] lg:w-[50%] 2xl:w-1/3 flex flex-col items-start bg-light-gray dark:bg-dark-alt rtl:rounded-[1.875rem_1.875rem_0.625rem_1.875rem] ltr:rounded-[1.875rem_1.875rem_1.875rem_0.625rem] px-2.5 pt-6 pb-2">
                                                        <div className="flex items-center gap-x-4">
                                                            <div className="w-12 h-12 px-3 py-3 bg-primary-gray dark:bg-dark rounded-lg justify-center items-center flex cursor-pointer"
                                                                onClick={() => window.open(`${process.env.NEXT_PUBLIC_BASEURL}${data.file}`, { target: '_blank' })}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="27" viewBox="0 0 25 27" fill="none">
                                                                    <path d="M9.375 19.2933C9.27083 19.2933 9.17708 19.2715 9.07292 19.2281C8.78125 19.1085 8.59375 18.8042 8.59375 18.4781V11.9563C8.59375 11.5107 8.94792 11.1411 9.375 11.1411C9.80208 11.1411 10.1562 11.5107 10.1562 11.9563V16.5107L10.9063 15.7281C11.2083 15.4129 11.7083 15.4129 12.0104 15.7281C12.3125 16.0433 12.3125 16.565 12.0104 16.8802L9.92708 19.0542C9.78125 19.2063 9.57292 19.2933 9.375 19.2933Z" fill="#9E9E9E" />
                                                                    <path d="M9.37504 19.2933C9.17712 19.2933 8.97921 19.2172 8.82296 19.0542L6.73962 16.8803C6.43754 16.5651 6.43754 16.0433 6.73962 15.7281C7.04171 15.4129 7.54171 15.4129 7.84379 15.7281L9.92712 17.902C10.2292 18.2172 10.2292 18.739 9.92712 19.0542C9.77087 19.2172 9.57296 19.2933 9.37504 19.2933Z" fill="#9E9E9E" />
                                                                    <path d="M15.625 24.7285H9.37504C3.71879 24.7285 1.30212 22.2067 1.30212 16.3045V9.7828C1.30212 3.88063 3.71879 1.35889 9.37504 1.35889H14.5834C15.0105 1.35889 15.3646 1.72845 15.3646 2.1741C15.3646 2.61976 15.0105 2.98932 14.5834 2.98932H9.37504C4.57296 2.98932 2.86462 4.77193 2.86462 9.7828V16.3045C2.86462 21.3154 4.57296 23.098 9.37504 23.098H15.625C20.4271 23.098 22.1355 21.3154 22.1355 16.3045V10.8698C22.1355 10.4241 22.4896 10.0545 22.9167 10.0545C23.3438 10.0545 23.698 10.4241 23.698 10.8698V16.3045C23.698 22.2067 21.2813 24.7285 15.625 24.7285Z" fill="#9E9E9E" />
                                                                    <path d="M22.9167 11.6848H18.75C15.1875 11.6848 13.8021 10.2392 13.8021 6.52179V2.17396C13.8021 1.84788 13.9896 1.54353 14.2813 1.42396C14.573 1.29353 14.9063 1.36962 15.1355 1.59788L23.4688 10.2935C23.6875 10.5218 23.7605 10.8805 23.6355 11.1848C23.5105 11.4892 23.2292 11.6848 22.9167 11.6848ZM15.3646 4.14136V6.52179C15.3646 9.32614 16.0625 10.0544 18.75 10.0544H21.0313L15.3646 4.14136Z" fill="#9E9E9E" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex flex-col gap-y-0.5">
                                                                <div className="text-right text-black dark:text-white text-sm font-normal leading-normal">فایل پیوست</div>
                                                                {/* <div className="text-right text-neutral-400 text-xs font-normal leading-tight">2.5 مگابایت</div> */}
                                                            </div>
                                                        </div>
                                                        <span className="flex justify-end text-black dark:text-white text-xs font-normal leading-tight mt-4">
                                                            <span className="mx-2">{moment(moment(data?.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD')}</span>
                                                            <span>{ConvertToJalali(data?.createdAt)}</span>
                                                        </span>
                                                    </div> : ''}
                                                </div>
                                            )
                                        } else {
                                            return (
                                                <div className="flex flex-col items-end gap-y-4" key={index}>
                                                    {data.text ? <div className="w-[80%] lg:w-[50%] 2xl:w-1/3 flex flex-col items-start bg-light-gray dark:bg-dark-alt ltr:rounded-[1.875rem_1.875rem_0.625rem_1.875rem] rtl:rounded-[1.875rem_1.875rem_1.875rem_0.625rem] px-2.5 pt-6 pb-2">
                                                        <span className="text-sm font-normal leading-normal">{data.text}</span>
                                                        <span className="flex justify-end w-full text-end text-primary-gray text-xs font-normal leading-tight mt-4">
                                                            <span className="mx-2">{moment(moment(data?.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD')}</span>
                                                            <span>{ConvertToJalali(data?.createdAt)}</span>
                                                        </span>
                                                    </div> : ''}
                                                    {data.file ? ImageFormats.includes(data.file?.split('.')?.pop()) ? <div onClick={() => window.open(`${process.env.NEXT_PUBLIC_BASEURL}${data.file}`, { target: '_blank' })}
                                                        className="relative w-[80%] lg:w-[50%] 2xl:w-1/3 h-28 flex flex-col items-start cursor-pointer bg-[#2675EC] ltr:rounded-[1.875rem_1.875rem_0.625rem_1.875rem] rtl:rounded-[1.875rem_1.875rem_1.875rem_0.625rem] p-0">
                                                        <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.file}`} alt="ticket-image" className="w-full h-[80%] ltr:rounded-[1.875rem_1.875rem_0.625rem_1.875rem] rtl:rounded-[1.875rem_1.875rem_1.875rem_0.625rem]" />
                                                        <span className="flex justify-end w-full text-white text-end text-xs font-normal leading-tight absolute bottom-2 ltr:right-2 rtl:left-2">
                                                            <span className="mx-2">{moment(moment(data?.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD')}</span>
                                                            <span>{ConvertToJalali(data?.createdAt)}</span>
                                                        </span>
                                                    </div> : <div className="w-[80%] lg:w-[50%] 2xl:w-1/3 flex flex-col items-start bg-light-gray dark:bg-dark-alt ltr:rounded-[1.875rem_1.875rem_0.625rem_1.875rem] rtl:rounded-[1.875rem_1.875rem_1.875rem_0.625rem] px-2.5 pt-6 pb-2">
                                                        <div className="flex items-center gap-x-4">
                                                            <div className="w-12 h-12 px-3 py-3 bg-primary-gray dark:bg-dark rounded-lg justify-center items-center flex cursor-pointer"
                                                                onClick={() => window.open(`${process.env.NEXT_PUBLIC_BASEURL}${data.file}`, { target: '_blank' })}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="27" viewBox="0 0 25 27" fill="none">
                                                                    <path d="M9.375 19.2933C9.27083 19.2933 9.17708 19.2715 9.07292 19.2281C8.78125 19.1085 8.59375 18.8042 8.59375 18.4781V11.9563C8.59375 11.5107 8.94792 11.1411 9.375 11.1411C9.80208 11.1411 10.1562 11.5107 10.1562 11.9563V16.5107L10.9063 15.7281C11.2083 15.4129 11.7083 15.4129 12.0104 15.7281C12.3125 16.0433 12.3125 16.565 12.0104 16.8802L9.92708 19.0542C9.78125 19.2063 9.57292 19.2933 9.375 19.2933Z" fill="#9E9E9E" />
                                                                    <path d="M9.37504 19.2933C9.17712 19.2933 8.97921 19.2172 8.82296 19.0542L6.73962 16.8803C6.43754 16.5651 6.43754 16.0433 6.73962 15.7281C7.04171 15.4129 7.54171 15.4129 7.84379 15.7281L9.92712 17.902C10.2292 18.2172 10.2292 18.739 9.92712 19.0542C9.77087 19.2172 9.57296 19.2933 9.37504 19.2933Z" fill="#9E9E9E" />
                                                                    <path d="M15.625 24.7285H9.37504C3.71879 24.7285 1.30212 22.2067 1.30212 16.3045V9.7828C1.30212 3.88063 3.71879 1.35889 9.37504 1.35889H14.5834C15.0105 1.35889 15.3646 1.72845 15.3646 2.1741C15.3646 2.61976 15.0105 2.98932 14.5834 2.98932H9.37504C4.57296 2.98932 2.86462 4.77193 2.86462 9.7828V16.3045C2.86462 21.3154 4.57296 23.098 9.37504 23.098H15.625C20.4271 23.098 22.1355 21.3154 22.1355 16.3045V10.8698C22.1355 10.4241 22.4896 10.0545 22.9167 10.0545C23.3438 10.0545 23.698 10.4241 23.698 10.8698V16.3045C23.698 22.2067 21.2813 24.7285 15.625 24.7285Z" fill="#9E9E9E" />
                                                                    <path d="M22.9167 11.6848H18.75C15.1875 11.6848 13.8021 10.2392 13.8021 6.52179V2.17396C13.8021 1.84788 13.9896 1.54353 14.2813 1.42396C14.573 1.29353 14.9063 1.36962 15.1355 1.59788L23.4688 10.2935C23.6875 10.5218 23.7605 10.8805 23.6355 11.1848C23.5105 11.4892 23.2292 11.6848 22.9167 11.6848ZM15.3646 4.14136V6.52179C15.3646 9.32614 16.0625 10.0544 18.75 10.0544H21.0313L15.3646 4.14136Z" fill="#9E9E9E" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex flex-col gap-y-0.5">
                                                                <div className="text-right text-black dark:text-white text-sm font-normal leading-normal">فایل پیوست</div>
                                                                {/* <div className="text-right text-neutral-400 text-xs font-normal leading-tight">2.5 مگابایت</div> */}
                                                            </div>
                                                        </div>
                                                        <span className="flex justify-end w-full text-end text-black dark:text-white text-xs font-normal leading-tight mt-4">
                                                            <span className="mx-2">{moment(moment(data?.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                                .locale('fa')
                                                                .format('jYYYY/jMM/jDD')}</span>
                                                            <span>{ConvertToJalali(data?.createdAt)}</span>
                                                        </span>
                                                    </div> : ''}
                                                </div>
                                            )
                                        }
                                    })}
                                </div>
                            </div>
                        </div>
                        <Paper id="footer" sx={{ position: 'absolute', zIndex: 30, minHeight: '3.5rem', maxHeight: '7rem' }} elevation={3}
                            className="flex items-center justify-between gap-x-2 md:gap-x-4 border border-t rounded-lg p-2 shadow-none border-light-gray dark:bg-dark-alt dark:border-dark-alt border-solid
                        w-[95%] bottom-0 md:bottom-8 md:w-auto md:right-20 md:left-20">
                            {ticketData?.ticket?.isActive ?
                                <>
                                    <IconButton className="p-0"
                                        onClick={addTicket}
                                        disabled={addTicketLoading}>
                                        <div className="w-6 h-6 p-3 bg-primary rounded-[50%] justify-center items-center flex">
                                            {addTicketLoading ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} /> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"
                                                className="w-6 h-6">
                                                <path d="M4.50834 18.125C3.57501 18.125 2.98334 17.8083 2.60834 17.4333C1.87501 16.7 1.35834 15.1416 3.00834 11.8333L3.73334 10.3916C3.82501 10.2 3.82501 9.79996 3.73334 9.60829L3.00834 8.16663C1.35001 4.85829 1.87501 3.29162 2.60834 2.56662C3.33334 1.83329 4.90001 1.30829 8.20001 2.96662L15.3333 6.53329C17.1083 7.41662 18.0833 8.64996 18.0833 9.99996C18.0833 11.35 17.1083 12.5833 15.3417 13.4666L8.20834 17.0333C6.59167 17.8416 5.39167 18.125 4.50834 18.125ZM4.50834 3.12496C4.05834 3.12496 3.70834 3.23329 3.49167 3.44996C2.88334 4.04996 3.12501 5.60829 4.12501 7.59996L4.85001 9.04996C5.11667 9.59162 5.11667 10.4083 4.85001 10.95L4.12501 12.3916C3.12501 14.3916 2.88334 15.9416 3.49167 16.5416C4.09167 17.15 5.65001 16.9083 7.65001 15.9083L14.7833 12.3416C16.0917 11.6916 16.8333 10.8333 16.8333 9.99162C16.8333 9.14996 16.0833 8.29162 14.775 7.64162L7.64167 4.08329C6.37501 3.44996 5.28334 3.12496 4.50834 3.12496Z" fill="white" />
                                                <path d="M9.03333 10.625H4.53333C4.19166 10.625 3.90833 10.3417 3.90833 10C3.90833 9.65833 4.19166 9.375 4.53333 9.375H9.03333C9.37499 9.375 9.65833 9.65833 9.65833 10C9.65833 10.3417 9.37499 10.625 9.03333 10.625Z" fill="white" />
                                            </svg>}
                                        </div>

                                    </IconButton>
                                    <FormControl className="w-full">
                                        <TextField
                                            label="پیام خود  را تایپ کنید..."
                                            type="text"
                                            multiline
                                            maxRows={4}
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            onChange={(event) => setTicketText(event.target.value)} />
                                    </FormControl>
                                    <input type="file" id="ticket" className="hidden" onChange={uploadTicketFile} />
                                    <IconButton color={darkModeToggle ? 'white' : 'black'} className="p-1" onClick={openTicketFile}>
                                        {imageLoading ? <div className="flex items-center justify-center"><CircularProgress size={30} /></div> : ticketFile ? ImageFormats.includes(ticketFile?.split('.')?.pop()) ? <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${ticketFile}`} alt="ticketFile" className="w-6 h-6 rounded-[50%]" /> :
                                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="27" viewBox="0 0 25 27" fill="none">
                                                <path d="M9.375 19.2933C9.27083 19.2933 9.17708 19.2715 9.07292 19.2281C8.78125 19.1085 8.59375 18.8042 8.59375 18.4781V11.9563C8.59375 11.5107 8.94792 11.1411 9.375 11.1411C9.80208 11.1411 10.1562 11.5107 10.1562 11.9563V16.5107L10.9063 15.7281C11.2083 15.4129 11.7083 15.4129 12.0104 15.7281C12.3125 16.0433 12.3125 16.565 12.0104 16.8802L9.92708 19.0542C9.78125 19.2063 9.57292 19.2933 9.375 19.2933Z" fill="#9E9E9E" />
                                                <path d="M9.37504 19.2933C9.17712 19.2933 8.97921 19.2172 8.82296 19.0542L6.73962 16.8803C6.43754 16.5651 6.43754 16.0433 6.73962 15.7281C7.04171 15.4129 7.54171 15.4129 7.84379 15.7281L9.92712 17.902C10.2292 18.2172 10.2292 18.739 9.92712 19.0542C9.77087 19.2172 9.57296 19.2933 9.37504 19.2933Z" fill="#9E9E9E" />
                                                <path d="M15.625 24.7285H9.37504C3.71879 24.7285 1.30212 22.2067 1.30212 16.3045V9.7828C1.30212 3.88063 3.71879 1.35889 9.37504 1.35889H14.5834C15.0105 1.35889 15.3646 1.72845 15.3646 2.1741C15.3646 2.61976 15.0105 2.98932 14.5834 2.98932H9.37504C4.57296 2.98932 2.86462 4.77193 2.86462 9.7828V16.3045C2.86462 21.3154 4.57296 23.098 9.37504 23.098H15.625C20.4271 23.098 22.1355 21.3154 22.1355 16.3045V10.8698C22.1355 10.4241 22.4896 10.0545 22.9167 10.0545C23.3438 10.0545 23.698 10.4241 23.698 10.8698V16.3045C23.698 22.2067 21.2813 24.7285 15.625 24.7285Z" fill="#9E9E9E" />
                                                <path d="M22.9167 11.6848H18.75C15.1875 11.6848 13.8021 10.2392 13.8021 6.52179V2.17396C13.8021 1.84788 13.9896 1.54353 14.2813 1.42396C14.573 1.29353 14.9063 1.36962 15.1355 1.59788L23.4688 10.2935C23.6875 10.5218 23.7605 10.8805 23.6355 11.1848C23.5105 11.4892 23.2292 11.6848 22.9167 11.6848ZM15.3646 4.14136V6.52179C15.3646 9.32614 16.0625 10.0544 18.75 10.0544H21.0313L15.3646 4.14136Z" fill="#9E9E9E" />
                                            </svg> :
                                            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="36" viewBox="0 0 35 36" fill="none" className="w-8 h-8">
                                                <path d="M17.9812 31.6207C16.3916 31.6207 14.8021 31.0228 13.5916 29.8124C11.1708 27.3916 11.1708 23.4687 13.5916 21.0478L17.2083 17.4457C17.6312 17.0228 18.3312 17.0228 18.7541 17.4457C19.1771 17.8687 19.1771 18.5687 18.7541 18.9916L15.1375 22.5937C13.5771 24.1541 13.5771 26.7062 15.1375 28.2666C16.6979 29.827 19.25 29.827 20.8104 28.2666L26.4833 22.5937C28.2041 20.8728 29.1521 18.5832 29.1521 16.1478C29.1521 13.7124 28.2041 11.4228 26.4833 9.70199C22.925 6.14365 17.15 6.14365 13.5916 9.70199L7.40831 15.8853C5.96456 17.3291 5.16248 19.2541 5.16248 21.2957C5.16248 23.3374 5.96456 25.2624 7.40831 26.7062C7.83123 27.1291 7.83123 27.8291 7.40831 28.252C6.98539 28.6749 6.28539 28.6749 5.86248 28.252C4.01039 26.3853 2.97498 23.9207 2.97498 21.2957C2.97498 18.6707 3.99581 16.1916 5.86248 14.3395L12.0458 8.15615C16.45 3.75199 23.625 3.75199 28.0291 8.15615C30.1583 10.2853 31.3396 13.1291 31.3396 16.1478C31.3396 19.1666 30.1583 22.0103 28.0291 24.1395L22.3562 29.8124C21.1458 31.0228 19.5708 31.6207 17.9812 31.6207Z" fill="#9E9E9E" />
                                            </svg>}
                                    </IconButton>
                                </>
                                : <span className="text-primary-red text-sm font-normal leading-normal mx-auto">این گفتگو به پایان رسیده است.</span>}
                        </Paper>
                    </div>}
            </div>

            <ConfirmDialog
                open={openDialog}
                onClose={handleCloseDialog}
                onConfirm={closeMessage}
                title="آیا مطمئن هستید؟"
                loading={closeLoading}
                darkModeToggle={darkModeToggle}
            />
        </>
    )
}

export default TicketPageCompo;