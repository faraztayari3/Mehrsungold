import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Pagination from '@mui/material/Pagination';
import RefreshIcon from '@mui/icons-material/Refresh'
import moment from 'jalali-moment'

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call"

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

    const [pageItem, setPageItem] = useState(1);
    useEffect(() => {
        getMessages();
    }, [pageItem]);

    /**
         * Retrieves Messages list.
         * @returns None
        */
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [messagesLimit, setMessagesLimit] = useState(10);
    const [messagesTotal, setMessagesTotal] = useState(0);
    const getMessages = () => {
        setLoadingMessages(true);
        ApiCall('/message/my-messages', 'GET', locale, {}, `limit=${messagesLimit}&skip=${(pageItem * messagesLimit) - messagesLimit}`, 'user', router).then(async (result) => {
            setMessagesTotal(result.count);
            setMessages(result.data);
            setLoadingMessages(false);
        }).catch((error) => {
            setLoadingMessages(false);
            console.log(error);
        });
    }

    /**
     * Reads a message with the given messageId and performs necessary actions.
     * @param {{string}} messageId - The ID of the message to be read.
     * @param {{Event}} event - The event object triggered by the action.
     * @returns None
    */
    const readMessage = (messageId, index) => (event) => {
        event.preventDefault();
        event.stopPropagation();
        setLoading(true);
        ApiCall(`/message/read/${messageId}`, 'PATCH', locale, {}, '', 'user', router).then(async (result) => {
            setMessages(prevMessages =>
                prevMessages.map((message, i) =>
                    i === index ? { ...message, seen: true } : message
                )
            );
        }).catch((error) => {
            setLoading(false);
            console.log(error);
        });
    }

    const handleRefresh = (event) => {
        getMessages();
    }

    return (
        <div className="xl:max-w-[40rem] xl:mx-auto">
            <section className="flex items-center justify-between">
                <h1 className="text-large-2">پیام ها</h1>
                <IconButton
                    color={`${darkModeToggle ? 'white' : 'black'}`}
                    onClick={handleRefresh}>
                    <RefreshIcon />
                </IconButton>
            </section>

            <section className="my-10 flex flex-col gap-y-4">
                {loadingMessages ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : messages.length > 0 ?
                    <>
                        {messages.map((data, index) => (
                            <Accordion key={index}
                                onClick={data.seen ? () => false : readMessage(data._id, index)}
                                disabled={data.text ? false : true}
                                className={`${data.seen ? '' : 'cursor-pointer'} custom-accordion relative !rounded-2xl border border-solid p-0 !shadow-none dark:bg-dark-secondary dark:border-dark `} sx={{ '&:before': { display: 'none' } }}>
                                <AccordionSummary
                                    className="p-0"
                                    classes={{ content: 'm-0' }}
                                    id="panel1a-header">
                                    <Button color={'black'} className="w-full flex justify-start items-center gap-x-2.5 rounded-2xl py-5 px-4">
                                        {data.seen ? <img src="/assets/img/svg/success-notif.svg" alt="success-notif" /> : <img src="/assets/img/svg/secondary-notif.svg" alt="secondary-notif" />}
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex flex-col items-start text-start gap-y-1.5 dark:text-white">
                                                <h4 className=" text-dark-gray dark:text-white text-sm font-bold">{data.subject}</h4>
                                            </div>
                                            <span className="text-xs font-medium">
                                                {moment.utc(data.createdAt, "YYYY-MM-DDTHH:mm")
                                                    .format("YYYY/MM/DD HH:mm")}
                                            </span>
                                        </div>
                                    </Button>
                                </AccordionSummary>
                                <AccordionDetails className="custom-accordion-text text-sm text-justify whitespace-pre-line text-black dark:text-white">
                                    <p>{data.text}</p>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                        {Math.ceil(messagesTotal / messagesLimit) > 1 ?
                            <div className="text-center mt-4">
                                <Pagination siblingCount={0} count={Math.ceil(messagesTotal / messagesLimit)} variant="outlined" color="primary" className="justify-center"
                                    page={pageItem} onChange={(event, value) => setPageItem(value)} />
                            </div>
                            : ''}
                    </>
                    : <div className="py-16">
                        <span className="block text-center text-large-1 text-primary-gray">پیامی جهت نمایش وجود ندارد.</span>
                    </div>}

            </section>
        </div>
    )
}

export default MessagesPageCompo;