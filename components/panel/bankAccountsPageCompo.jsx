import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import DeleteIcon from '@mui/icons-material/Delete'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'

import { PatternFormat } from 'react-number-format';

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call"
import CheckCardNumber from "../../services/checkCardNumber"

//Components
import AddBankAccount from "./compos/addBankAccount"

/**
 * BankAccountsPageCompo component that displays the BankAccounts Page Component of the website.
 * @returns The rendered BankAccounts Page component.
 */
const BankAccountsPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, refreshData, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getBankAccounts();
    }, [refreshData]);

    /**
        * Retrieves BankAccounts.
        * @returns None
       */
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loadingBankAccounts, setLoadingBankAccounts] = useState(true);
    const [bankAccountsLimit, setBankAccountsLimit] = useState(50);
    const [bankAccountsTotal, setBankAccountsTotal] = useState(0);
    const getBankAccounts = () => {
        setLoadingBankAccounts(true);
        ApiCall('/user/card', 'GET', locale, {}, `limit=${bankAccountsLimit}&skip=${(1 * bankAccountsLimit) - bankAccountsLimit}`, 'user', router).then(async (result) => {
            setBankAccountsTotal(result.count);
            let notDeletedCards = result.data.filter(item => item.status !== 'Deleted');
            setBankAccounts(notDeletedCards);
            setLoadingBankAccounts(false);
        }).catch((error) => {
            setLoadingBankAccounts(false);
            console.log(error);
        });
    }

    const [itemData, setItemData] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [openBottomRejectDrawer, setOpenBottomRejectDrawer] = useState(false);
    const handleShowReject = (data) => () => {
        setItemData(data);
        if (window.innerWidth >= 1024) {
            setShowReject(true);
            setOpenBottomRejectDrawer(false);
        } else {
            setShowReject(false);
            setOpenBottomRejectDrawer(true);
        }
    }

    return (
        <div className="xl:max-w-[40rem] xl:mx-auto">
            <section>
                <div className="flex items-center justify-between gap-x-4">
                    <span className="text-large-2">کارت‌های بانکی</span>
                    <AddBankAccount />
                </div>
                <div>
                    {loadingBankAccounts ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : bankAccounts.length > 0 ?
                        <div className="grid grid-cols-12 gap-2 py-16">
                            {bankAccounts.map((data, index) => {
                                return (
                                    <div className="col-span-12 md:col-span-6 custom-card rounded-2xl p-2" key={index}>
                                        <div className="flex items-center justify-between gap-x-2">
                                            <div className="flex items-center gap-x-2">
                                                <img alt={CheckCardNumber(data.number).name} title={CheckCardNumber(data.number).name} src={CheckCardNumber(data.number).image} width="48" height="48" decoding="async" data-nimg="1" loading="lazy" className="w-14 h-14 object-contain" />
                                                <span>{CheckCardNumber(data.number).name}</span>
                                            </div>
                                            {data.status == 'Active' || data.status == 'Accepted' ?
                                                <div className="flex items-center gap-x-2">
                                                    {/* <IconButton
                                                        color={`${darkModeToggle ? 'white' : 'black'}`}
                                                        onClick={editBA(data)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton> */}
                                                    {/* <IconButton
                                                        color={`${darkModeToggle ? 'white' : 'black'}`}
                                                        onClick={deleteBankAccount(data._id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton> */}
                                                </div> :
                                                <>
                                                    {data.status == 'Active' || data.status == 'Accepted' ? <Chip label="تائید شده" variant="outlined" size="small" className="badge badge-success" /> : ''}
                                                    {data.status == 'Pending' ? <Chip label="در انتظار تائید" variant="outlined" size="small" className="badge badge-primary" /> : ''}
                                                    {data.status == 'Deactive' ? <Chip label="رد شده" variant="outlined" size="small" className="badge badge-error cursor-pointer" onClick={handleShowReject(data)} /> : ''}
                                                    {data.status == 'Deleted' ? <Chip label="حذف شده" variant="outlined" size="small" className="badge badge-error" /> : ''}
                                                </>}

                                        </div>
                                        <div className="w-full flex flex-col items-center gap-y-2 mt-4">
                                            <PatternFormat displayType='text' value={data.number} format="####-####-####-####" dir="ltr" className="text-xl font-semibold" />
                                            {data.iban ? <PatternFormat displayType='text' value={(data.iban)?.replace('ir', '').replace('IR', '')} format="IR## #### #### #### #### #### ##" className="text-base font-normal" /> : 'فاقد شماره شبا'}
                                        </div>
                                    </div>
                                )
                            })}
                        </div> :
                        <div className="py-16">
                            <span className="block text-center text-large-1 text-primary-gray">کارتی تعریف نشده است.</span>
                        </div>}
                </div>
            </section>

            {/* Reject Description */}
            <>
                <Dialog onClose={() => setShowReject(false)} open={showReject} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <Typography component={'h2'}>علت رد شدن کارت بانکی</Typography>
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
                                value={itemData?.confirmDescription || itemData?.rejectReason} />
                        </FormControl>
                        <div className="flex items-center justify-end gap-x-2">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                onClick={() => setShowReject(false)}>
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
                    open={openBottomRejectDrawer}
                    onClose={() => setOpenBottomRejectDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <Typography component={'h2'}>علت رد شدن کارت بانکی</Typography>
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
                                value={itemData?.confirmDescription || itemData?.rejectReason} />
                        </FormControl>
                        <Button type="button" variant="contained" size="medium" fullWidth className="rounded-lg" disableElevation
                            onClick={() => setOpenBottomRejectDrawer(false)}>
                            <text className="text-black font-semibold">بستن</text>
                        </Button >
                    </div>
                </SwipeableDrawer>
            </>
        </div>
    )
}

export default BankAccountsPageCompo;