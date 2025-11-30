import { useState, useEffect } from 'react'
import LinkRouter from "next/link"
import { useRouter } from 'next/router'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import LoadingButton from '@mui/lab/LoadingButton'
import Slider from '@mui/material/Slider'
import CircularProgress from '@mui/material/CircularProgress'

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
import CheckCardNumber from "../../services/checkCardNumber"
import FormatNumberFromText from "../../services/formatNumberFromText"

//Components
import AddBankAccount from "./compos/addBankAccount"

/**
 * WithdrawPageCompo component that displays the Withdraw Page Component of the website.
 * @returns The rendered Withdraw Page component.
 */
const WithdrawPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, refreshData, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();
    const [isGregorian, setIsGregorian] = useState(locale == "fa" ? false : true);
    const [hasBirthDate, setHasBirthDate] = useState(userInfo?.birthDate ? true : false);

    const [loading, setLoading] = useState(false);
    const [openAlert, setOpenAlert] = useState(true);

    const validationSchema = Yup.object({
        amount: Yup.string().required('این فیلد الزامی است')
    });

    const { control, setValue, handleSubmit, formState: { errors }, clearErrors } = useForm({
        resolver: yupResolver(validationSchema)
    });

    const clearForm = () => {
        setValue('amount', '');
    }

    useEffect(() => {
        getBankAccounts();
    }, [refreshData]);


    /**
     * Retrieves User Info for the user.
     * @returns None
    */
    const getUserInformation = () => {
        ApiCall('/user/me', 'GET', locale, {}, '', 'user', router).then(async (result) => {
            dispatch({
                type: 'setUserInfo', value: result
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    /**
        * Retrieves BankAccounts.
        * @returns None
       */
    const [userCard, setUserCard] = useState();
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loadingBankAccounts, setLoadingBankAccounts] = useState(true);
    const [bankAccountsLimit, setBankAccountsLimit] = useState(10);
    const [bankAccountsTotal, setBankAccountsTotal] = useState(0);
    const getBankAccounts = () => {
        setLoadingBankAccounts(true);
        ApiCall('/user/card', 'GET', locale, {}, `status=Active&limit=${bankAccountsLimit}&skip=${(1 * bankAccountsLimit) - bankAccountsLimit}`, 'user', router).then(async (result) => {
            setBankAccountsTotal(result.count);
            setUserCard(result.data[0]?._id || '');
            setBankAccounts(result.data);
            setLoadingBankAccounts(false);
        }).catch((error) => {
            setLoadingBankAccounts(false);
            console.log(error);
        });
    }

    /**
     * Calculates the slider value for withdraw Amount.
     * @returns None
     */
    const [sliderValue, setSliderValue] = useState(0);
    const calcAmountSlider = (event) => {
        setSliderValue(event.target.value);
        setErrorWithdraw(false);
        const value = event.target.value;
        let size = (userInfo?.tomanBalance) * (value / 100);
        if (value == 0) {
            setAmount('');
            setValue('amount', '');
        } else {
            setAmount(size);
            setValue('amount', size);
            clearErrors();
        }
    }

    /**
        * User Withdraw Request.
        * @returns None
       */
    const [errorWithdraw, setErrorWithdraw] = useState(false);
    const [errorDepositCreditCard, setErrorDepositCreditCard] = useState(false);
    const [amount, setAmount] = useState('');
    const userWithdraw = () => {
        if (((!siteInfo?.offlineFirstStepUserVerifyEnabled && !siteInfo?.onlineFirstStepUserVerifyEnabled) || !siteInfo?.secondStepUserVerifyEnabled) || (['SecondLevelVerified'].includes(userInfo?.verificationStatus))) {
            if (amount >= (siteInfo?.minWithdrawAmount || 0)) {
                if (!userCard) {
                    setErrorDepositCreditCard(true);
                    return false;
                }
                setLoading(true);
                ApiCall('/balance-transaction/withdraw', 'POST', locale, { amount: parseInt(amount), cardId: userCard }, '', 'user', router).then(async (result) => {
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: langText('Global.Success'),
                            type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                    setLoading(false);
                    clearForm();
                    getUserInformation();
                    setTimeout(() => {
                        router.push('/panel/history', '/panel/history', { locale });
                    }, 1000);
                }).catch((error) => {
                    setLoading(false);
                    console.log(error);
                    let list = '';
                    error.message && typeof error.message == 'object' ? error.message.map(item => {
                        list += `${item}<br />`
                    }) : list = error.message;
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: FormatNumberFromText(list),
                            type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });

                });
            } else {
                setErrorWithdraw(true);
            }
        } else {
            if (window.innerWidth >= 1024) {
                dispatch({
                    type: 'setShowAuthenticate', value: true
                });
                dispatch({
                    type: 'setOpenBottomAuthenticate', value: false
                });
            } else {
                dispatch({
                    type: 'setShowAuthenticate', value: false
                });
                dispatch({
                    type: 'setOpenBottomAuthenticate', value: true
                });
            }
        }
    }

    return (
        <div className="xl:max-w-[40rem] xl:mx-auto">
            <form className="flex flex-col gap-y-4" noValidate autoComplete="off" onSubmit={handleSubmit(userWithdraw)}>
                <h1 className="text-large-3">برداشت</h1>
                {siteInfo?.balanceTransPageDesc3 ? <Collapse in={openAlert}>
                    <Alert
                        severity="info"
                        variant="filled"
                        color="info"
                        className="custom-alert info"
                        onClose={() => setOpenAlert(false)}
                    >
                        <p className="whitespace-pre-line my-0">
                            {siteInfo?.balanceTransPageDesc3}
                        </p>
                    </Alert>
                </Collapse> : <Collapse in={openAlert}>
                    <Alert
                        severity="info"
                        variant="filled"
                        color="info"
                        className="custom-alert info"
                        onClose={() => setOpenAlert(false)}
                    >
                        <span>لطفا قبل از ثبت برداشت به این موارد توجه فرمایید:</span>
                        <ul className="flex flex-col gap-y-4 list-none p-0 text-justify">
                            <li>حداقل مقدار برداشت {(siteInfo?.minWithdrawAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان می‌باشد.</li>
                            <li>فرآیند برداشت نهایتاً یک روز کاری زمان خواهد برد. بدین صورت که در اولین فرصت، درخواست واریز بانکی توسط {siteInfo?.title} ثبت و معمولاً در اولین سیکل تسویه پایا (بنا بر دستورالعمل بانک مرکزی) به حساب مشتری واریز می‌شود.</li>
                        </ul>
                    </Alert>
                </Collapse>}
                <div className="custom-card flex flex-col gap-y-4 rounded-2xl pt-8 px-3">
                    <FormControl className="w-full">
                        <Controller
                            name="amount"
                            control={control}
                            render={({ field }) => (
                                <NumericFormat
                                    {...field}
                                    thousandSeparator
                                    decimalScale={0}
                                    allowNegative={false}
                                    customInput={TextField}
                                    type="tel"
                                    label="مبلغ را وارد کنید"
                                    variant="outlined"
                                    error={!!errors.amount}
                                    helperText={errors.amount ? errors.amount.message : ''}
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            className: 'ltr pl-4', maxLength: 15,
                                            inputMode: 'decimal'
                                        },
                                        endAdornment: <span className="input-end-span">تومان</span>,
                                    }}
                                    value={amount}
                                    onChange={(event) => {
                                        field.onChange(event);
                                        let withdrawAmount = 0;
                                        setSliderValue(0);
                                        setAmount(event.target.value?.replace(/,/g, ''));
                                        withdrawAmount = event.target.value?.replace(/,/g, '');
                                        setErrorWithdraw(false);

                                        const calculatedSliderValue = (withdrawAmount / (userInfo?.tomanBalance || 0)) * 100;
                                        if (calculatedSliderValue > 100) {
                                            setSliderValue(100);
                                        } else if (calculatedSliderValue < 0) {
                                            setSliderValue(0);
                                        } else {
                                            setSliderValue(calculatedSliderValue);
                                        }
                                    }} />
                            )}
                        />
                    </FormControl>
                    <div className="px-4">
                        <span className="flex items-center gap-x-4">
                            <svg viewBox="0 0 24 24" className="svg-icon">
                                <path d="m12.1 3.393-7.127.164a1 1 0 0 0-.33.065 3.61 3.61 0 0 0-2.328 3.373v4.17c-.001 3.064-.039 3.588-.096 6.018a1 1 0 0 0 0 .078c.114 2.07 2.194 4.47 5.81 4.383h9.216c2.435 0 4.436-1.996 4.436-4.43v-.354a1.94 1.94 0 0 0 .967-1.664v-1.879a1.94 1.94 0 0 0-.967-1.664v-.58c0-2.434-2-4.434-4.436-4.434H15.62c.02-.342.035-.67.008-.994-.035-.432-.15-.913-.478-1.318-.329-.406-.808-.643-1.301-.766-.493-.122-1.037-.162-1.717-.168a1 1 0 0 0-.032 0zm.045 2-.031.002c.599.005 1.019.05 1.252.107.232.058.24.096.228.082-.01-.013.022.012.04.225.014.177.003.475-.018.83H6.75c-.897 0-1.735.274-2.436.738v-.382c0-.643.382-1.185.959-1.443zM6.75 8.639h10.49a2.433 2.433 0 0 1 2.436 2.434v.313h-.848a2.841 2.841 0 0 0-.783.113 2.833 2.833 0 0 0-.977.5c-.018.014-.037.026-.054.04l-.002.003a2.8 2.8 0 0 0-.205.187l-.002.002a2.82 2.82 0 0 0-.203.225l-.002.002c-.064.078-.125.16-.18.246l-.002.002a2.874 2.874 0 0 0-.152.266s-.002 0-.002.002a2.86 2.86 0 0 0-.295 1.537c.033.386.145.74.314 1.059v.002c.042.079.088.156.137.23v.002a2.993 2.993 0 0 0 1.203 1.03h.002a3.094 3.094 0 0 0 1.314.294h.736v.086a2.43 2.43 0 0 1-2.436 2.43H7.997a1 1 0 0 0-.023.002c-2.696.065-3.72-1.803-3.76-2.492.055-2.338.095-2.946.096-5.986v-.093A2.433 2.433 0 0 1 6.746 8.64zm.678 2.004a.875.875 0 0 0-.877.875.875.875 0 0 0 .877.875h6.396a.875.875 0 0 0 .875-.875.875.875 0 0 0-.875-.875zm11.4 2.742h1.816v1.742h-1.705c-.187 0-.367-.052-.52-.139h-.002a.971.971 0 0 1-.36-.351.713.713 0 0 1-.095-.3 1 1 0 0 0-.002-.013.81.81 0 0 1 .252-.674 1 1 0 0 0 .017-.02.803.803 0 0 1 .598-.245z"></path>
                            </svg>
                            <span>موجودی کیف پول: <span>{(userInfo?.tomanBalance || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> تومان</span>
                        </span>

                        <Slider className="gold" valueLabelFormat={(value) => {
                            return (value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })
                        }} value={sliderValue} step={10} marks min={0} valueLabelDisplay="auto" max={100} disabled={(userInfo?.tomanBalance || 0) == 0}
                            onChange={calcAmountSlider} />
                    </div>
                </div>

                {loadingBankAccounts ? <div className="flex justify-center items-center my-4"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> :
                    <>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <span>کارت بانکی خود را جهت واریز انتخاب کنید:</span>
                            {bankAccounts.length > 0 ? <AddBankAccount /> : ''}
                        </div>
                        {bankAccounts.length == 0 ? <Alert
                            severity="warning"
                            variant="filled"
                            color="warning"
                            className="custom-alert warning"
                            action={
                                <AddBankAccount />
                            }
                            sx={{ mb: 2 }}
                        >
                            کارتی در سامانه تعریف نشده است.
                        </Alert> : ''}

                        {bankAccounts.length > 0 ? <div className="lg:grid grid-cols-12 gap-2 flex flex-nowrap overflow-x-auto overflow-y-hidden pb-2">
                            {bankAccounts.map((data, index) => {
                                return (
                                    <div className={`${bankAccounts?.length == 1 ? 'min-w-full' : 'min-w-[95%]'} col-span-12`} key={index}>
                                        <input type="radio" className="hidden peer" id={data._id} name="card" defaultChecked={index == 0} onChange={(event) => setUserCard(event.target.id)} />
                                        <label htmlFor={data._id} className="custom-card rounded-2xl p-2 flex flex-col lg:flex-row lg:items-center justify-between gap-x-2 transition cursor-pointer border-light-secondary-foreground dark:border-dark border-solid peer-checked:border-primary peer-checked:border-solid">
                                            <div className="flex items-center gap-x-2 whitespace-nowrap">
                                                <img alt={CheckCardNumber(data.number).name} title={CheckCardNumber(data.number).name} src={CheckCardNumber(data.number).image} width="48" height="48" decoding="async" data-nimg="1" loading="lazy" className="w-14 h-14 object-contain" />
                                                <span>{CheckCardNumber(data.number).name}</span>
                                            </div>
                                            <div className="w-full flex flex-col items-center lg:items-end gap-y-2 mt-4">
                                                <PatternFormat displayType='text' value={data.number} format="####-####-####-####" dir="ltr" className="text-xl font-semibold" />
                                                {data.iban ? <PatternFormat displayType='text' value={(data.iban)?.replace('ir', '').replace('IR', '')} format="IR## #### #### #### #### #### ##" className="text-base font-normal" /> : 'فاقد شماره شبا'}
                                            </div>
                                        </label>
                                    </div>
                                )
                            })}
                        </div> : ''}

                        {errorDepositCreditCard ? <Alert
                            severity="error"
                            variant="filled"
                            color="error"
                            className="custom-alert error"
                            sx={{ mb: 2 }}
                        >
                            کارت بانکی خود را جهت واریز انتخاب نمائید.
                        </Alert> : ''}

                        {errorWithdraw ? <Alert
                            severity="error"
                            variant="filled"
                            color="error"
                            className="custom-alert error"
                            sx={{ mb: 2 }}
                        >
                            <div className="flex flex-col gap-y-3">
                                <b className="block">حداقل مقدار برداشت {(siteInfo?.minWithdrawAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان می‌باشد.</b>
                            </div>
                        </Alert> : ''}
                    </>}

                <div className="lg:max-w-32 lg:mx-auto">
                    <LoadingButton type="submit" variant="contained" size="medium" fullWidth className="rounded-lg px-10" disableElevation loading={loading}>
                        <text className="text-black font-semibold">برداشت</text>
                    </LoadingButton >
                </div>
            </form>
        </div>
    )
}

export default WithdrawPageCompo;