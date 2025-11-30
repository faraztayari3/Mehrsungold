import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import IconButton from '@mui/material/IconButton'
import RefreshIcon from '@mui/icons-material/Refresh'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MUISelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import DatePicker from "react-datepicker2"
import moment from 'jalali-moment'

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call"

/**
 * FinancialPageCompo component that displays the Financial Page Component of the website.
 * @returns The rendered Financial Page component.
 */
const FinancialPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, priceInfo, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [addFinancialTime, setAddFinancialTime] = useState({
        startDate: (moment().subtract(1, 'month')).toISOString(),
        endDate: (new Date()).toISOString()
    });

    useEffect(() => {
        getFinancialInfo();
    }, []);

    /**
        * Retrieves Dashboard Info.
        * @returns None
       */
    const [financialInfo, setFinancialInfo] = useState();
    const [loadingdFinancialInfo, setLoadingdFinancialInfo] = useState(true);
    const getFinancialInfo = () => {
        setLoadingdFinancialInfo(true);
        ApiCall('/general/statistics', 'GET', locale, {}, `startDate=${addFinancialTime?.startDate}&endDate=${addFinancialTime?.endDate}`, 'admin', router).then(async (result) => {
            setFinancialInfo(result);
            setLoadingdFinancialInfo(false);
        }).catch((error) => {
            setLoadingdFinancialInfo(false);
            console.log(error);
        });
    }

    const handleRefresh = (event) => {
        getFinancialInfo();
    }
    const [periodChange, setPeriodChange] = useState('month');
    const handleChangeDate = (event) => {
        switch (event.target.value) {
            case 'week':
                setAddFinancialTime({ ...addFinancialTime, startDate: (moment().subtract(7, 'days')).toISOString() });
                setStartDate(moment(moment().subtract(7, 'days'), 'YYYY-MM-DD')
                    .locale('fa')
                    .format('jYYYY-jMM-jDD'));
                setEndDate(moment(new Date(), 'YYYY-MM-DD')
                    .locale('fa')
                    .format('jYYYY-jMM-jDD'))
                break;
            case 'month':
                setStartDate(moment(moment().subtract(1, 'month'), 'YYYY-MM-DD')
                    .locale('fa')
                    .format('jYYYY-jMM-jDD'));
                setAddFinancialTime({ ...addFinancialTime, startDate: (moment().subtract(1, 'month')).toISOString() });
                setEndDate(moment(new Date(), 'YYYY-MM-DD')
                    .locale('fa')
                    .format('jYYYY-jMM-jDD'))
                break;
            case 'year':
                setStartDate(moment(moment().subtract(1, 'year'), 'YYYY-MM-DD')
                    .locale('fa')
                    .format('jYYYY-jMM-jDD'));
                setAddFinancialTime({ ...addFinancialTime, startDate: (moment().subtract(1, 'year')).toISOString() });
                setEndDate(moment(new Date(), 'YYYY-MM-DD')
                    .locale('fa')
                    .format('jYYYY-jMM-jDD'))
                break;

            default:
                setStartDate(moment(moment().subtract(7, 'days'), 'YYYY-MM-DD')
                    .locale('fa')
                    .format('jYYYY-jMM-jDD'));
                setAddFinancialTime({ ...addFinancialTime, startDate: (moment().subtract(7, 'days')).toISOString() });
                setEndDate(moment(new Date(), 'YYYY-MM-DD')
                    .locale('fa')
                    .format('jYYYY-jMM-jDD'))
                break;
        }
        setPeriodChange(event.target.value);
    }

    /**
  * save financial start and end date with the selected date from the datepicker.
  * @param {Event} event - The event object containing the selected date.
  * @returns None
  */
    const [startDate, setStartDate] = useState(moment(moment().subtract(1, 'month'), 'YYYY-MM-DD')
        .locale('fa')
        .format('jYYYY-jMM-jDD'));
    const [endDate, setEndDate] = useState(moment(new Date(), 'YYYY-MM-DD')
        .locale('fa')
        .format('jYYYY-jMM-jDD'));
    const [isGregorian, setIsGregorian] = useState(locale == "fa" ? false : true);
    const financialDatepicker = (event, type) => {
        setAddFinancialTime({ ...addFinancialTime, [type]: event.locale(locale).format("YYYY-MM-DDTHH:mm:ss") });
        if (locale == 'fa') {
            type == 'startDate' ? setStartDate(event.locale(locale).format("jYYYY-jMM-jDD")) : setEndDate(event.locale(locale).format("jYYYY-jMM-jDD"));
        } else {
            type == 'startDate' ? setStartDate(event.locale(locale).format("YYYY-MM-DD")) : setEndDate(event.locale(locale).format("YYYY-MM-DD"));
        }
    }

    return (
        <div className="xl:max-w-[60rem] xl:mx-auto">
            <section>
                <div className="flex items-center justify-between">
                    <h1 className="text-large-3 mb-6">حسابداری</h1>
                    <IconButton
                        color={`${darkModeToggle ? 'white' : 'black'}`}
                        onClick={handleRefresh}>
                        <RefreshIcon />
                    </IconButton>
                </div>
                <div className="grid grid-cols-12 gap-4 mb-8">
                    <div className="col-span-12 lg:col-span-2">
                        <MUISelect
                            type="text"
                            variant="filled"
                            color="black"
                            label="بازه زمانی"
                            className="form-select w-full"
                            value={periodChange}
                            onChange={handleChangeDate}
                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                            <MenuItem value="week" >هفتگی</MenuItem>
                            <MenuItem value="month" >ماهانه</MenuItem>
                            <MenuItem value="year" >سالانه</MenuItem>
                        </MUISelect>
                    </div>
                    <div className="col-span-12 md:col-span-5 lg:col-span-4">
                        <FormControl className="w-full">
                            <DatePicker
                                name="datePickerstartDate"
                                timePicker={true}
                                isGregorian={isGregorian}
                                className="form-input hidden"
                                onChange={(date) => {
                                    financialDatepicker(date, 'startDate');
                                }}
                            />
                            <TextField
                                type="text"
                                color={'primary'}
                                label="تاریخ شروع"
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
                                value={startDate}
                                onClick={() => document.querySelector('input[name="datePickerstartDate"]').click()}
                            />
                        </FormControl>
                    </div>
                    <div className="col-span-12 md:col-span-5 lg:col-span-4">
                        <FormControl className="w-full">
                            <DatePicker
                                name="datePickerEndDate"
                                timePicker={true}
                                isGregorian={isGregorian}
                                className="form-input hidden"
                                onChange={(date) => {
                                    financialDatepicker(date, 'endDate');
                                }}
                            />
                            <TextField
                                type="text"
                                color={'primary'}
                                label="تاریخ پایان"
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
                                value={endDate}
                                onClick={() => document.querySelector('input[name="datePickerEndDate"]').click()}
                            />
                        </FormControl>
                    </div>
                    <div className="col-span-12 md:col-span-2 lg:col-span-2">
                        <Button type="button" variant="contained" size="medium" className="rounded-2xl !py-4" fullWidth disableElevation onClick={() => getFinancialInfo()}>
                            <text className="text-black font-semibold">فیلتر</text>
                        </Button >
                    </div>
                </div>
                {loadingdFinancialInfo ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : <div className="grid grid-cols-12 gap-x-4 gap-y-14">
                    <div className="col-span-12 md:col-span-6">
                        <div className="h-full custom-card flex flex-col justify-between gap-y-3 rounded-2xl p-5">
                            <div className="flex flex-col ">
                                <span className="flex items-center gap-x-4"><svg viewBox="0 0 24 24" className="svg-icon"><path d="m12.1 3.393-7.127.164a1 1 0 0 0-.33.065 3.61 3.61 0 0 0-2.328 3.373v4.17c-.001 3.064-.039 3.588-.096 6.018a1 1 0 0 0 0 .078c.114 2.07 2.194 4.47 5.81 4.383h9.216c2.435 0 4.436-1.996 4.436-4.43v-.354a1.94 1.94 0 0 0 .967-1.664v-1.879a1.94 1.94 0 0 0-.967-1.664v-.58c0-2.434-2-4.434-4.436-4.434H15.62c.02-.342.035-.67.008-.994-.035-.432-.15-.913-.478-1.318-.329-.406-.808-.643-1.301-.766-.493-.122-1.037-.162-1.717-.168a1 1 0 0 0-.032 0zm.045 2-.031.002c.599.005 1.019.05 1.252.107.232.058.24.096.228.082-.01-.013.022.012.04.225.014.177.003.475-.018.83H6.75c-.897 0-1.735.274-2.436.738v-.382c0-.643.382-1.185.959-1.443zM6.75 8.639h10.49a2.433 2.433 0 0 1 2.436 2.434v.313h-.848a2.841 2.841 0 0 0-.783.113 2.833 2.833 0 0 0-.977.5c-.018.014-.037.026-.054.04l-.002.003a2.8 2.8 0 0 0-.205.187l-.002.002a2.82 2.82 0 0 0-.203.225l-.002.002c-.064.078-.125.16-.18.246l-.002.002a2.874 2.874 0 0 0-.152.266s-.002 0-.002.002a2.86 2.86 0 0 0-.295 1.537c.033.386.145.74.314 1.059v.002c.042.079.088.156.137.23v.002a2.993 2.993 0 0 0 1.203 1.03h.002a3.094 3.094 0 0 0 1.314.294h.736v.086a2.43 2.43 0 0 1-2.436 2.43H7.997a1 1 0 0 0-.023.002c-2.696.065-3.72-1.803-3.76-2.492.055-2.338.095-2.946.096-5.986v-.093A2.433 2.433 0 0 1 6.746 8.64zm.678 2.004a.875.875 0 0 0-.877.875.875.875 0 0 0 .877.875h6.396a.875.875 0 0 0 .875-.875.875.875 0 0 0-.875-.875zm11.4 2.742h1.816v1.742h-1.705c-.187 0-.367-.052-.52-.139h-.002a.971.971 0 0 1-.36-.351.713.713 0 0 1-.095-.3 1 1 0 0 0-.002-.013.81.81 0 0 1 .252-.674 1 1 0 0 0 .017-.02.803.803 0 0 1 .598-.245z"></path></svg> موجودی کل تومان کاربران:</span>
                                <div className="text-large-1 self-end"><span className="block"><span className="ltr">{(financialInfo?.totalUserBalance || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> تومان</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <div className="h-full custom-card flex flex-col rounded-2xl p-5">
                            <span className="flex items-center gap-x-4"><svg viewBox="0 0 24 24" className="svg-icon"><path d="M8.24 1.744a6.504 6.504 0 0 0-6.494 6.494.749.749 0 0 0 1.498 0 5 5 0 0 1 3.609-4.801l-.611 1.092a.75.75 0 1 0 1.307.729L8.893 2.86a.75.75 0 0 0-.652-1.115zm6.492 1.484c-3.145 0-5.746 2.42-6.035 5.492-3.067.294-5.48 2.892-5.48 6.033 0 3.337 2.725 6.063 6.062 6.063 3.144 0 5.741-2.419 6.031-5.49 3.068-.294 5.484-2.893 5.484-6.035 0-3.337-2.725-6.062-6.062-6.062zm-5.453 7.465c.085 0 .183.008.314.016a4.056 4.056 0 0 1 3.738 3.738c.002.12.007.23.007.306a4.044 4.044 0 0 1-4.06 4.064 4.047 4.047 0 0 1-4.065-4.064 4.044 4.044 0 0 1 4.064-4.06zm12.23 4.32a.75.75 0 0 0-.748.748 5 5 0 0 1-3.61 4.801l.612-1.092a.75.75 0 1 0-1.307-.73l-1.344 2.4a.75.75 0 0 0 .652 1.114 6.504 6.504 0 0 0 6.494-6.494.749.749 0 0 0-.75-.748z"></path></svg> سود کل {siteInfo?.title || 'صرافی'}:</span>
                            <div className="text-large-1 self-end"><span className="block"><span className="ltr">{(financialInfo?.ownerProfit || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })}</span> تومان</span></div>
                        </div>
                    </div>
                    <div className="col-span-12">
                        <div className="h-full custom-card flex flex-col gap-y-4 rounded-2xl p-5">
                            <span className="flex items-center gap-x-4">
                                <svg viewBox="0 0 24 24" className="svg-icon">
                                    <path d="M11.5 5.413c-1.11.15-2.177.397-3.158.723a.75.75 0 0 0-.438.382C7.397 7.56 7.148 8.332 6.9 9.192a.75.75 0 0 0-.028.274c.022.252.1.388.17.51s.075.186.3.355l.31.266c-1.606.485-3.026.88-4.992 1.8a.75.75 0 0 0-.387.423c-.388 1.062-.532 2.187-.758 2.986a.75.75 0 0 0 .098.617l.242.367a.75.75 0 0 0 .33.275c1.262.544 2.382 1.201 3.82 1.684a.75.75 0 0 0 .434.014l8.146-2.186c.666.583 1.317 1.153 1.89 1.662.15.144.312.103.483.158a.75.75 0 0 0 .072.04.75.75 0 0 0 .026-.008c.18.043.372.178.511.166.298-.027.524-.107.602-.127l3.424-.89c.448-.11.758-.512.795-.558a.75.75 0 0 0 .144-.656l-.628-2.46a.75.75 0 0 0-.106-.233l-.314-.469a.75.75 0 0 0-.018-.008.75.75 0 0 0-.033-.05c-2.871-2.714-6.175-5.183-9.383-7.589a.75.75 0 0 0-.549-.142zm-.09 1.551c2.711 2.033 5.364 4.133 7.81 6.314-.525.128-1.03.257-1.534.406-2.04-1.886-4.818-4.464-7.014-5.955a.75.75 0 0 0-1.043.201.75.75 0 0 0 .2 1.041c2.05 1.393 4.92 4.055 6.972 5.951-.103.475-.166.944-.232 1.414a754.808 754.808 0 0 0-8.115-7.029c.178-.596.38-1.159.684-1.822.715-.22 1.478-.399 2.273-.521zm-2.412 4.789.953.818-3.367.916c-.322-.122-.83-.273-1.246-.447 1.18-.422 2.33-.848 3.66-1.287zm2.328 1.998c.65.56 1.254 1.082 1.895 1.639l-5.816 1.561-.125-2.098zm-7.803.213c.7.198 1.488.52 2.25.822l.133 2.287c-.936-.37-1.831-.807-2.848-1.262.156-.635.305-1.255.465-1.848zm16.98.527.434 1.707-2.955.768c.08-.642.164-1.281.306-1.893a75.18 75.18 0 0 1 2.215-.582z"></path>
                                </svg>
                                موجودی واحد های قابل معامله کاربران:</span>
                            {financialInfo?.totalUserInventories?.length > 0 ?
                                <div className="flex flex-col gap-y-4">
                                    {financialInfo?.totalUserInventories?.map((data, index) => (
                                        <div key={index} className="flex items-center justify-between gap-x-2 border-b border-x-0 border-t-0 border-solid border-dark-secondary last:border-none pb-4">
                                            <div className="flex items-center gap-x-4">
                                                <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.tradeable?.image}`} alt={data.tradeable?.name}
                                                    className="w-10 h-10 rounded-[50%]" />
                                                <span>{data.tradeable?.name} - {data.tradeable?.nameFa}</span>
                                            </div>
                                            <span>{(data?.total || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم</span>
                                        </div>
                                    ))}
                                </div>
                                : <span className="block text-center text-large-1 text-primary-red mt-4 -mb-4">موجودی واحدها صفر می باشد</span>}
                        </div>
                    </div>
                </div>}
            </section>
        </div>
    )
}

export default FinancialPageCompo;