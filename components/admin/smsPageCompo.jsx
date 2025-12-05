import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import LoadingButton from '@mui/lab/LoadingButton'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'
import Tooltip from '@mui/material/Tooltip'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import Chip from '@mui/material/Chip'

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext"

// Service
import ApiCall from "../../services/api_call"

// Components
import CustomSwitch from "../shared/CustomSwitch"

/**
 * SMSPageCompo component for managing SMS templates and settings
 * @returns The rendered SMS management page component
 */
const SMSPageCompo = () => {

    const { state, dispatch } = useAppContext()
    const { darkModeToggle } = state

    const langText = useTranslations('')
    const router = useRouter()
    const { locale } = useRouter()

    const [firstLoading, setFirstLoading] = useState(true)
    const [loading, setLoading] = useState(false)

    // SMS Templates State
    const [smsSettings, setSmsSettings] = useState({
        registration: {
            enabled: false,
            templateName: '',
            tokens: {}
        },
        deposit: {
            enabled: false,
            templateName: '',
            tokens: {}
        },
        withdrawal: {
            enabled: false,
            templateName: '',
            tokens: {}
        },
        verifiedUsers: {
            enabled: false,
            templateName: '',
            tokens: {}
        },
        unverifiedUsers: {
            enabled: false,
            templateName: '',
            tokens: {}
        }
    })

    // SMS Template configurations with token definitions
    const smsConfigs = [
        {
            key: 'registration',
            title: 'پیامک ثبت نام',
            description: 'پیامکی که بعد از ثبت نام کاربر ارسال می‌شود',
            availableTokens: [
                { name: 'token', desc: 'نام کاربر', variable: '[نام کاربر]' },
                { name: 'token2', desc: 'نام خانوادگی', variable: '[نام خانوادگی]' },
                { name: 'token3', desc: 'شماره موبایل', variable: '[شماره موبایل]' }
            ],
            templatePlaceholder: 'gold-register'
        },
        {
            key: 'deposit',
            title: 'پیامک واریز',
            description: 'پیامکی که بعد از واریز موفق ارسال می‌شود',
            availableTokens: [
                { name: 'token', desc: 'نام کاربر', variable: '[نام کاربر]' },
                { name: 'token2', desc: 'مبلغ واریزی', variable: '[مبلغ تراکنش]' },
                { name: 'token3', desc: 'موجودی فعلی', variable: '[موجودی]' },
                { name: 'token4', desc: 'تاریخ تراکنش', variable: '[تاریخ]' }
            ],
            templatePlaceholder: 'gold-deposit'
        },
        {
            key: 'withdrawal',
            title: 'پیامک برداشت',
            description: 'پیامکی که بعد از برداشت موفق ارسال می‌شود',
            availableTokens: [
                { name: 'token', desc: 'نام کاربر', variable: '[نام کاربر]' },
                { name: 'token2', desc: 'مبلغ برداشتی', variable: '[مبلغ تراکنش]' },
                { name: 'token3', desc: 'موجودی فعلی', variable: '[موجودی]' },
                { name: 'token4', desc: 'تاریخ تراکنش', variable: '[تاریخ]' }
            ],
            templatePlaceholder: 'gold-withdrawal'
        },
        {
            key: 'verifiedUsers',
            title: 'پیامک کاربران احراز شده',
            description: 'ارسال پیامک گروهی به کاربران احراز هویت شده',
            availableTokens: [
                { name: 'token', desc: 'نام کاربر', variable: '[نام کاربر]' },
                { name: 'token2', desc: 'نام خانوادگی', variable: '[نام خانوادگی]' }
            ],
            templatePlaceholder: 'gold-verified'
        },
        {
            key: 'unverifiedUsers',
            title: 'پیامک کاربران احراز نشده',
            description: 'ارسال پیامک گروهی به کاربران احراز هویت نشده',
            availableTokens: [
                { name: 'token', desc: 'نام کاربر', variable: '[نام کاربر]' },
                { name: 'token2', desc: 'شماره موبایل', variable: '[شماره موبایل]' }
            ],
            templatePlaceholder: 'gold-unverified'
        }
    ]

    // Fetch SMS settings from API
    const getSmsSettings = async () => {
        setFirstLoading(true)
        try {
            const res = await ApiCall('/settings/sms', 'GET', locale, {}, '', 'admin', router, true)
            if (res?.data) {
                setSmsSettings(res.data)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setFirstLoading(false)
        }
    }

    useEffect(() => {
        getSmsSettings()
    }, [])

    // Handle toggle change
    const handleToggle = (key, value) => {
        setSmsSettings(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                enabled: value
            }
        }))
    }

    // Handle template name change
    const handleTemplateNameChange = (key, value) => {
        setSmsSettings(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                templateName: value
            }
        }))
    }

    // Handle token change
    const handleTokenChange = (key, tokenName, value) => {
        console.log('Token change:', { key, tokenName, value })
        setSmsSettings(prev => {
            const updated = {
                ...prev,
                [key]: {
                    ...prev[key],
                    tokens: {
                        ...prev[key].tokens,
                        [tokenName]: value
                    }
                }
            }
            console.log('Updated settings:', updated)
            return updated
        })
    }

    // Save SMS settings
    const handleSave = async () => {
        setLoading(true)
        try {
            console.log('Saving SMS settings:', JSON.stringify(smsSettings, null, 2))
            const res = await ApiCall('/settings/sms', 'PUT', locale, smsSettings, '', 'admin', router, true)
            console.log('Save response:', res)
            // Check for both statusCode and message
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
                throw new Error('Failed to save')
            }
        } catch (error) {
            console.log('Save error:', error)
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



    return (
        <div className="flex flex-col gap-y-8">
            {firstLoading ? (
                <div className="flex justify-center items-center mt-16">
                    <CircularProgress color={darkModeToggle ? 'white' : 'black'} />
                </div>
            ) : (
                <>
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

                    <Alert severity="info">
                        از شورتکات های موجود در هر بخش برای شخصی سازی پیامک ها استفاده کنید.
                    </Alert>

                    <div className="flex flex-col gap-y-6">
                        {smsConfigs.map((config) => (
                            <div
                                key={config.key}
                                className="border border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col gap-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-y-1">
                                        <Typography variant="h6" className="dark:text-white">
                                            {config.title}
                                        </Typography>
                                        <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                            {config.description}
                                        </Typography>
                                    </div>
                                    <FormControlLabel
                                        control={
                                            <CustomSwitch
                                                checked={smsSettings[config.key]?.enabled || false}
                                                onChange={(e) => handleToggle(config.key, e.target.checked)}
                                            />
                                        }
                                        label={smsSettings[config.key]?.enabled ? 'فعال' : 'غیرفعال'}
                                        className="dark:text-white"
                                    />
                                </div>

                                {smsSettings[config.key]?.enabled && (
                                    <>
                                        <Alert severity="warning" className="bg-yellow-50 dark:bg-yellow-900/20">
                                            <Typography variant="body2" className="dark:text-white mb-2">
                                                <strong>نکته:</strong> متن پیامک را در پنل کاوه‌نگار تعریف کنید و فقط نام الگو و مقادیر توکن‌ها را اینجا وارد کنید.
                                            </Typography>
                                            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                                                برای هر متغیر در الگو، یک توکن تعریف کنید (مثل %token, %token2, ...)
                                            </Typography>
                                        </Alert>

                                        <FormControl fullWidth>
                                            <TextField
                                                label="نام الگو (Template Name)"
                                                placeholder={config.templatePlaceholder}
                                                value={smsSettings[config.key]?.templateName || ''}
                                                onChange={(e) => handleTemplateNameChange(config.key, e.target.value)}
                                                InputLabelProps={{
                                                    sx: {
                                                        color: darkModeToggle
                                                            ? 'rgb(255, 255, 255,0.7)'
                                                            : 'rgb(0, 0, 0,0.7)'
                                                    }
                                                }}
                                                InputProps={{
                                                    classes: {
                                                        root: 'dark:bg-dark',
                                                        input: darkModeToggle ? 'text-white rtl' : 'text-black rtl',
                                                        focused: 'border-none'
                                                    },
                                                    sx: {
                                                        border: '1px solid rgb(255, 255, 255,0.2)',
                                                        borderRadius: '16px'
                                                    }
                                                }}
                                            />
                                        </FormControl>

                                        <div className="flex flex-col gap-y-3">
                                            <Typography variant="body2" className="dark:text-white font-semibold">
                                                توکن‌های الگو:
                                            </Typography>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {config.availableTokens.map((tokenInfo) => (
                                                    <div key={tokenInfo.name} className="flex flex-col gap-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Chip
                                                                label={`%${tokenInfo.name}`}
                                                                size="small"
                                                                className="bg-yellow-500 text-black font-mono"
                                                            />
                                                            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                                                                {tokenInfo.desc}
                                                            </Typography>
                                                        </div>
                                                        <TextField
                                                            size="small"
                                                            placeholder={tokenInfo.variable}
                                                            value={smsSettings[config.key]?.tokens?.[tokenInfo.name] || ''}
                                                            onChange={(e) => handleTokenChange(config.key, tokenInfo.name, e.target.value)}
                                                            InputProps={{
                                                                classes: {
                                                                    root: 'dark:bg-dark',
                                                                    input: darkModeToggle ? 'text-white rtl' : 'text-black rtl'
                                                                },
                                                                sx: {
                                                                    border: '1px solid rgb(255, 255, 255,0.2)',
                                                                    borderRadius: '8px'
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Alert severity="info">
                                            <Typography variant="caption" className="dark:text-white">
                                                مقادیر وارد شده برای توکن‌ها به عنوان متغیر در الگوی کاوه‌نگار جایگزین می‌شوند.
                                            </Typography>
                                        </Alert>
                                    </>
                                )}
                            </div>
                        ))}
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
                </>
            )}
        </div>
    )
}

export default SMSPageCompo
