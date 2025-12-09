import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import LoadingButton from '@mui/lab/LoadingButton'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useAppContext } from '../../context/AppContext'
import CustomSwitch from '../shared/CustomSwitch'

const SMSPageCompo = () => {
    const { state, dispatch } = useAppContext()
    const { darkModeToggle } = state

    const [firstLoading, setFirstLoading] = useState(true)
    const [loading, setLoading] = useState(false)
    const [sendingSimple, setSendingSimple] = useState(false)

    const [smsSettings, setSmsSettings] = useState({
        simple: { enabled: true, receptor: '', message: '' },
        welcome: { enabled: false, message: '' },
        deposit: { enabled: false, message: '' },
        withdrawal: { enabled: false, message: '' },
        filtered: { enabled: false, message: '', minBalance: '', maxBalance: '', vip: false, level: '' }
    })

    const availableTags = {
        simple: ['[نام]', '[نام خانوادگی]', '[شماره موبایل]'],
        welcome: ['[نام]', '[نام خانوادگی]'],
        deposit: ['[username]', '[مبلغ واریزی]', '[موجودی فعلی]', '[تاریخ]'],
        withdrawal: ['[username]', '[مبلغ برداشتی]', '[موجودی فعلی]', '[تاریخ]'],
        filtered: ['[نام]', '[نام خانوادگی]', '[سطح]', '[موجودی]']
    }

    const SMS_API_URL = process.env.NEXT_PUBLIC_SMS_API_URL || 'http://localhost:3005'

    const updateSection = (section, key, value) => {
        setSmsSettings((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }))
    }

    const appendTag = (section, tag) => {
        setSmsSettings((prev) => {
            const current = prev[section].message || ''
            const spacer = current && !current.endsWith(' ') ? ' ' : ''
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    message: `${current}${spacer}${tag}`
                }
            }
        })
    }

    const getSmsSettings = async () => {
        setFirstLoading(true)
        try {
            const response = await fetch(`${SMS_API_URL}/settings/sms`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${document.cookie.split('adminToken=')[1]?.split(';')[0]}`
                }
            })

            const res = await response.json()
            if (res?.data) {
                setSmsSettings({
                    simple: {
                        enabled: true,
                        receptor: res.data?.unverifiedUsers?.tokens?.receptor || '',
                        message: res.data?.unverifiedUsers?.message || ''
                    },
                    welcome: {
                        enabled: res.data?.registration?.enabled || false,
                        message: res.data?.registration?.message || ''
                    },
                    deposit: {
                        enabled: res.data?.deposit?.enabled || false,
                        message: res.data?.deposit?.message || ''
                    },
                    withdrawal: {
                        enabled: res.data?.withdrawal?.enabled || false,
                        message: res.data?.withdrawal?.message || ''
                    },
                    filtered: {
                        enabled: res.data?.verifiedUsers?.enabled || false,
                        message: res.data?.verifiedUsers?.message || '',
                        minBalance: res.data?.verifiedUsers?.tokens?.minBalance || '',
                        maxBalance: res.data?.verifiedUsers?.tokens?.maxBalance || '',
                        vip: !!res.data?.verifiedUsers?.tokens?.vip,
                        level: res.data?.verifiedUsers?.tokens?.level || ''
                    }
                })
            }
        } catch (error) {
            console.log('[SMS Settings] Fetch error:', error)
            dispatch({
                type: 'setSnackbarProps',
                value: {
                    open: true,
                    content: 'خطا در دریافت تنظیمات پیامک',
                    type: 'error',
                    duration: 3000,
                    refresh: Math.floor(Math.random() * 100)
                }
            })
        } finally {
            setFirstLoading(false)
        }
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const payload = {
                registration: {
                    enabled: smsSettings.welcome.enabled,
                    message: smsSettings.welcome.message,
                    tokens: {}
                },
                deposit: {
                    enabled: smsSettings.deposit.enabled,
                    message: smsSettings.deposit.message,
                    tokens: {}
                },
                withdrawal: {
                    enabled: smsSettings.withdrawal.enabled,
                    message: smsSettings.withdrawal.message,
                    tokens: {}
                },
                verifiedUsers: {
                    enabled: smsSettings.filtered.enabled,
                    message: smsSettings.filtered.message,
                    tokens: {
                        minBalance: smsSettings.filtered.minBalance,
                        maxBalance: smsSettings.filtered.maxBalance,
                        vip: smsSettings.filtered.vip,
                        level: smsSettings.filtered.level
                    }
                },
                unverifiedUsers: {
                    enabled: true,
                    message: smsSettings.simple.message,
                    tokens: {
                        receptor: smsSettings.simple.receptor
                    }
                }
            }

            const response = await fetch(`${SMS_API_URL}/settings/sms`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${document.cookie.split('adminToken=')[1]?.split(';')[0]}`
                },
                body: JSON.stringify(payload)
            })

            const res = await response.json()
            if (res?.statusCode === 200 || res?.statusCode === 201 || res?.message) {
                dispatch({
                    type: 'setSnackbarProps',
                    value: {
                        open: true,
                        content: res?.message || 'تنظیمات پیامک با موفقیت ذخیره شد',
                        type: 'success',
                        duration: 3000,
                        refresh: Math.floor(Math.random() * 100)
                    }
                })
            } else {
                throw new Error(res?.message || 'Failed to save')
            }
        } catch (error) {
            console.log('[SMS Settings] Save error:', error)
            dispatch({
                type: 'setSnackbarProps',
                value: {
                    open: true,
                    content: 'خطا در ذخیره تنظیمات',
                    type: 'error',
                    duration: 3000,
                    refresh: Math.floor(Math.random() * 100)
                }
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSendSimple = async () => {
        if (!smsSettings.simple.receptor) {
            dispatch({
                type: 'setSnackbarProps',
                value: {
                    open: true,
                    content: 'شماره گیرنده را وارد کنید',
                    type: 'error',
                    duration: 3000,
                    refresh: Math.floor(Math.random() * 100)
                }
            })
            return
        }

        setSendingSimple(true)
        try {
            const response = await fetch(`${SMS_API_URL}/sms/send/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${document.cookie.split('adminToken=')[1]?.split(';')[0]}`
                },
                body: JSON.stringify({
                    recipients: [smsSettings.simple.receptor],
                    templateType: 'unverified'
                })
            })

            if (response.status === 404) {
                throw new Error('مسیر ارسال پیامک روی سرور فعال نیست. لطفا sms-standalone-server.js را اجرا/به‌روز کنید یا آدرس NEXT_PUBLIC_SMS_API_URL را بررسی کنید.')
            }

            const res = await response.json()
            if (res?.statusCode === 200 || res?.message) {
                dispatch({
                    type: 'setSnackbarProps',
                    value: {
                        open: true,
                        content: res?.message || 'پیامک ساده ارسال شد',
                        type: 'success',
                        duration: 3000,
                        refresh: Math.floor(Math.random() * 100)
                    }
                })
            } else {
                throw new Error(res?.message || 'Failed to send SMS')
            }
        } catch (error) {
            console.log('[SMS] Simple send error:', error)
            dispatch({
                type: 'setSnackbarProps',
                value: {
                    open: true,
                    content: error?.message || 'خطا در ارسال پیامک ساده',
                    type: 'error',
                    duration: 3000,
                    refresh: Math.floor(Math.random() * 100)
                }
            })
        } finally {
            setSendingSimple(false)
        }
    }

    useEffect(() => {
        getSmsSettings()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fieldProps = {
        InputLabelProps: {
            sx: {
                color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)'
            }
        },
        InputProps: {
            classes: {
                root: 'dark:bg-dark',
                input: darkModeToggle ? 'text-white rtl' : 'text-black rtl',
                focused: 'border-none'
            },
            sx: {
                border: '1px solid rgb(255, 255, 255,0.2)',
                borderRadius: '12px'
            }
        }
    }

    const renderTags = (section) => (
        <div className="flex items-center gap-2 flex-wrap">
            {availableTags[section].map((tag) => (
                <Chip
                    key={`${section}-${tag}`}
                    label={tag}
                    size="small"
                    className="bg-yellow-500 text-black font-mono cursor-pointer"
                    onClick={() => appendTag(section, tag)}
                />
            ))}
        </div>
    )

    const renderHeader = (title, section, showToggle = true) => (
        <div className="flex items-center justify-between">
            <Typography variant="h6" className="dark:text-white">{title}</Typography>
            {showToggle && (
                <FormControlLabel
                    control={
                        <CustomSwitch
                            checked={smsSettings[section].enabled}
                            onChange={(e) => updateSection(section, 'enabled', e.target.checked)}
                        />
                    }
                    label={smsSettings[section].enabled ? 'فعال' : 'غیرفعال'}
                    className="dark:text-white"
                />
            )}
        </div>
    )

    if (firstLoading) {
        return (
            <div className="flex justify-center items-center mt-16">
                <CircularProgress color={darkModeToggle ? 'white' : 'black'} />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-large-2">مدیریت پیامک ها</h1>
                <LoadingButton
                    type="button"
                    variant="contained"
                    size="medium"
                    className="rounded-lg"
                    disableElevation
                    loading={loading}
                    onClick={handleSave}
                >
                    <span className="text-black font-semibold">ذخیره تغییرات</span>
                </LoadingButton>
            </div>

            <Alert severity="info">متن پیامک را اینجا بنویسید. برای درج سریع، روی تگ‌ها کلیک کنید.</Alert>

            {/* Simple SMS */}
            <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col gap-y-4">
                {renderHeader('پیامک ساده (متن و شماره گیرنده)', 'simple', false)}
                {renderTags('simple')}
                <TextField
                    label="شماره گیرنده"
                    value={smsSettings.simple.receptor}
                    onChange={(e) => updateSection('simple', 'receptor', e.target.value)}
                    placeholder="مثال: 09120000000"
                    {...fieldProps}
                />
                <TextField
                    label="متن پیامک"
                    multiline
                    minRows={3}
                    value={smsSettings.simple.message}
                    onChange={(e) => updateSection('simple', 'message', e.target.value)}
                    placeholder="مثال: کاربر گرامی [نام]، ثبت‌نام شما انجام شد."
                    {...fieldProps}
                />
                <div className="flex justify-end">
                    <LoadingButton
                        type="button"
                        variant="contained"
                        size="small"
                        className="rounded-lg"
                        disableElevation
                        loading={sendingSimple}
                        onClick={handleSendSimple}
                    >
                        <span className="text-black font-semibold">ارسال پیامک ساده</span>
                    </LoadingButton>
                </div>
            </div>

            {/* Welcome SMS */}
            <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col gap-y-4">
                {renderHeader('پیامک خوش‌آمد (ثبت‌نام)', 'welcome')}
                {renderTags('welcome')}
                <TextField
                    label="متن پیامک"
                    multiline
                    minRows={3}
                    value={smsSettings.welcome.message}
                    onChange={(e) => updateSection('welcome', 'message', e.target.value)}
                    placeholder="مثال: [نام] عزیز، به مهرسنج خوش آمدید."
                    {...fieldProps}
                />
            </div>

            {/* Deposit SMS */}
            <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col gap-y-4">
                {renderHeader('پیامک واریز', 'deposit')}
                {renderTags('deposit')}
                <TextField
                    label="متن پیامک"
                    multiline
                    minRows={3}
                    value={smsSettings.deposit.message}
                    onChange={(e) => updateSection('deposit', 'message', e.target.value)}
                    placeholder="مثال: [username] عزیز، مبلغ [مبلغ واریزی] به حساب شما افزوده شد."
                    {...fieldProps}
                />
            </div>

            {/* Withdrawal SMS */}
            <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col gap-y-4">
                {renderHeader('پیامک برداشت', 'withdrawal')}
                {renderTags('withdrawal')}
                <TextField
                    label="متن پیامک"
                    multiline
                    minRows={3}
                    value={smsSettings.withdrawal.message}
                    onChange={(e) => updateSection('withdrawal', 'message', e.target.value)}
                    placeholder="مثال: [username] عزیز، برداشت شما به مبلغ [مبلغ برداشتی] ثبت شد."
                    {...fieldProps}
                />
            </div>

            {/* Filtered bulk SMS */}
            <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col gap-y-4">
                {renderHeader('پیامک فیلتر شده (کاربران تایید شده)', 'filtered')}
                {renderTags('filtered')}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        label="حداقل موجودی"
                        type="number"
                        value={smsSettings.filtered.minBalance}
                        onChange={(e) => updateSection('filtered', 'minBalance', e.target.value)}
                        placeholder="مثال: 1000000"
                        {...fieldProps}
                    />
                    <TextField
                        label="حداکثر موجودی"
                        type="number"
                        value={smsSettings.filtered.maxBalance}
                        onChange={(e) => updateSection('filtered', 'maxBalance', e.target.value)}
                        placeholder="مثال: 5000000"
                        {...fieldProps}
                    />
                    <TextField
                        select
                        label="سطح کاربری"
                        value={smsSettings.filtered.level}
                        onChange={(e) => updateSection('filtered', 'level', e.target.value)}
                        placeholder="مثال: سطح 2"
                        {...fieldProps}
                    >
                        <MenuItem value="">همه سطوح</MenuItem>
                        <MenuItem value="1">سطح 1</MenuItem>
                        <MenuItem value="2">سطح 2</MenuItem>
                        <MenuItem value="3">سطح 3</MenuItem>
                        <MenuItem value="4">سطح 4</MenuItem>
                        <MenuItem value="5">سطح 5</MenuItem>
                    </TextField>
                    <FormControlLabel
                        control={
                            <CustomSwitch
                                checked={smsSettings.filtered.vip}
                                onChange={(e) => updateSection('filtered', 'vip', e.target.checked)}
                            />
                        }
                        label="فقط کاربران VIP"
                        className="dark:text-white"
                    />
                </div>
                <TextField
                    label="متن پیامک"
                    multiline
                    minRows={3}
                    value={smsSettings.filtered.message}
                    onChange={(e) => updateSection('filtered', 'message', e.target.value)}
                    placeholder="مثال: [نام] عزیز، طرح ویژه سطح [سطح] برای موجودی [موجودی] فعال است."
                    {...fieldProps}
                />
            </div>

            <div className="flex justify-end">
                <LoadingButton
                    type="button"
                    variant="contained"
                    size="large"
                    className="rounded-lg"
                    disableElevation
                    loading={loading}
                    onClick={handleSave}
                >
                    <span className="text-black font-semibold">ذخیره تغییرات</span>
                </LoadingButton>
            </div>
        </div>
    )
}

export default SMSPageCompo
