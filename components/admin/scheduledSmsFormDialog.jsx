import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Typography,
    Box,
    Divider,
    Switch
} from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { faIR } from 'date-fns/locale'

const SMS_API_URL = process.env.NEXT_PUBLIC_SMS_API_URL || 'http://localhost:3005'

const ScheduledSmsFormDialog = ({ open, onClose, onSuccess, editData = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        message: '',
        scheduledTime: new Date(),
        isRecurring: false,
        cronExpression: '',
        filters: {
            userType: 'all',
            userLevels: [],
            balanceRange: { min: '', max: '' },
            transactionVolumeRange: { min: '', max: '' },
            registrationDateRange: { from: null, to: null },
            verificationStatus: 'all',
            accountStatus: 'all',
            goldBalanceRange: { min: '', max: '' },
            silverBalanceRange: { min: '', max: '' }
        }
    })

    const [levels, setLevels] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            loadLevels()
            if (editData) {
                setFormData({
                    ...editData,
                    scheduledTime: new Date(editData.scheduledTime)
                })
            }
        }
    }, [open, editData])

    const loadLevels = async () => {
        try {
            const cookies = document.cookie.split(';')
            const tokenCookie = cookies.find(c => c.trim().startsWith('adminToken='))
            const token = tokenCookie ? tokenCookie.split('=')[1] : ''

            // فرض می‌کنیم API برای دریافت سطوح داریم
            const response = await fetch(`${SMS_API_URL.replace(':3006', ':3001')}/level`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (data?.statusCode === 200) {
                setLevels(data.data || [])
            }
        } catch (error) {
            console.error('Error loading levels:', error)
        }
    }

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleFilterChange = (filterField, value) => {
        setFormData(prev => ({
            ...prev,
            filters: {
                ...prev.filters,
                [filterField]: value
            }
        }))
    }

    const handleRangeChange = (rangeField, minOrMax, value) => {
        setFormData(prev => ({
            ...prev,
            filters: {
                ...prev.filters,
                [rangeField]: {
                    ...prev.filters[rangeField],
                    [minOrMax]: value
                }
            }
        }))
    }

    const handleLevelToggle = (levelId) => {
        setFormData(prev => {
            const currentLevels = prev.filters.userLevels || []
            const newLevels = currentLevels.includes(levelId)
                ? currentLevels.filter(id => id !== levelId)
                : [...currentLevels, levelId]
            
            return {
                ...prev,
                filters: {
                    ...prev.filters,
                    userLevels: newLevels
                }
            }
        })
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const cookies = document.cookie.split(';')
            const tokenCookie = cookies.find(c => c.trim().startsWith('adminToken='))
            const token = tokenCookie ? tokenCookie.split('=')[1] : ''

            const url = editData 
                ? `${SMS_API_URL}/sms/scheduled/${editData._id}`
                : `${SMS_API_URL}/sms/scheduled`
            
            const method = editData ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()
            if (data?.statusCode === 200 || data?.statusCode === 201) {
                onSuccess?.()
                onClose()
            }
        } catch (error) {
            console.error('Error saving scheduled SMS:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{editData ? 'ویرایش' : 'ایجاد'} پیامک شرطی</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        {/* اطلاعات پایه */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="نام پیامک"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                required
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="متن پیامک"
                                value={formData.message}
                                onChange={(e) => handleChange('message', e.target.value)}
                                multiline
                                rows={3}
                                required
                            />
                        </Grid>

                        {/* زمان‌بندی */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }}>
                                <Typography variant="body2">زمان‌بندی</Typography>
                            </Divider>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={faIR}>
                                <DateTimePicker
                                    label="زمان ارسال"
                                    value={formData.scheduledTime}
                                    onChange={(newValue) => handleChange('scheduledTime', newValue)}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isRecurring}
                                        onChange={(e) => handleChange('isRecurring', e.target.checked)}
                                    />
                                }
                                label="تکراری"
                            />
                            {formData.isRecurring && (
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="عبارت Cron"
                                    value={formData.cronExpression}
                                    onChange={(e) => handleChange('cronExpression', e.target.value)}
                                    placeholder="*/5 * * * *"
                                    helperText="مثال: */5 * * * * (هر 5 دقیقه)"
                                />
                            )}
                        </Grid>

                        {/* فیلترهای کاربر */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }}>
                                <Typography variant="body2">فیلترهای کاربر</Typography>
                            </Divider>
                        </Grid>

                        {/* 1. نوع کاربر */}
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>نوع کاربر</InputLabel>
                                <Select
                                    value={formData.filters.userType}
                                    label="نوع کاربر"
                                    onChange={(e) => handleFilterChange('userType', e.target.value)}
                                >
                                    <MenuItem value="all">همه</MenuItem>
                                    <MenuItem value="special">ویژه</MenuItem>
                                    <MenuItem value="normal">عادی</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* 2. وضعیت احراز */}
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>وضعیت احراز</InputLabel>
                                <Select
                                    value={formData.filters.verificationStatus}
                                    label="وضعیت احراز"
                                    onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
                                >
                                    <MenuItem value="all">همه</MenuItem>
                                    <MenuItem value="verified">احراز شده</MenuItem>
                                    <MenuItem value="pending">در انتظار</MenuItem>
                                    <MenuItem value="rejected">رد شده</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* 3. وضعیت حساب */}
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>وضعیت حساب</InputLabel>
                                <Select
                                    value={formData.filters.accountStatus}
                                    label="وضعیت حساب"
                                    onChange={(e) => handleFilterChange('accountStatus', e.target.value)}
                                >
                                    <MenuItem value="all">همه</MenuItem>
                                    <MenuItem value="active">فعال</MenuItem>
                                    <MenuItem value="inactive">غیرفعال</MenuItem>
                                    <MenuItem value="suspended">مسدود</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* 4. سطح کاربر (چک‌باکس) */}
                        <Grid item xs={12}>
                            <Typography variant="body2" sx={{ mb: 1 }}>سطح کاربر:</Typography>
                            <FormGroup row>
                                {levels.map((level) => (
                                    <FormControlLabel
                                        key={level._id}
                                        control={
                                            <Checkbox
                                                checked={formData.filters.userLevels?.includes(level._id)}
                                                onChange={() => handleLevelToggle(level._id)}
                                            />
                                        }
                                        label={level.name}
                                    />
                                ))}
                            </FormGroup>
                        </Grid>

                        {/* 5. بازه موجودی */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ mb: 1 }}>بازه موجودی (تومان):</Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="حداقل"
                                        type="number"
                                        value={formData.filters.balanceRange.min}
                                        onChange={(e) => handleRangeChange('balanceRange', 'min', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="حداکثر"
                                        type="number"
                                        value={formData.filters.balanceRange.max}
                                        onChange={(e) => handleRangeChange('balanceRange', 'max', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* 6. بازه گردش مالی */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ mb: 1 }}>بازه گردش مالی (تومان):</Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="حداقل"
                                        type="number"
                                        value={formData.filters.transactionVolumeRange.min}
                                        onChange={(e) => handleRangeChange('transactionVolumeRange', 'min', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="حداکثر"
                                        type="number"
                                        value={formData.filters.transactionVolumeRange.max}
                                        onChange={(e) => handleRangeChange('transactionVolumeRange', 'max', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* 7. موجودی طلا */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ mb: 1 }}>موجودی طلا (گرم):</Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="حداقل"
                                        type="number"
                                        value={formData.filters.goldBalanceRange.min}
                                        onChange={(e) => handleRangeChange('goldBalanceRange', 'min', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="حداکثر"
                                        type="number"
                                        value={formData.filters.goldBalanceRange.max}
                                        onChange={(e) => handleRangeChange('goldBalanceRange', 'max', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* 8. موجودی نقره */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ mb: 1 }}>موجودی نقره (گرم):</Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="حداقل"
                                        type="number"
                                        value={formData.filters.silverBalanceRange.min}
                                        onChange={(e) => handleRangeChange('silverBalanceRange', 'min', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="حداکثر"
                                        type="number"
                                        value={formData.filters.silverBalanceRange.max}
                                        onChange={(e) => handleRangeChange('silverBalanceRange', 'max', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* 9. بازه زمان ثبت‌نام */}
                        <Grid item xs={12}>
                            <Typography variant="body2" sx={{ mb: 1 }}>بازه زمان ثبت‌نام:</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={faIR}>
                                        <DateTimePicker
                                            label="از تاریخ"
                                            value={formData.filters.registrationDateRange.from}
                                            onChange={(newValue) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    filters: {
                                                        ...prev.filters,
                                                        registrationDateRange: {
                                                            ...prev.filters.registrationDateRange,
                                                            from: newValue
                                                        }
                                                    }
                                                }))
                                            }}
                                            renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={faIR}>
                                        <DateTimePicker
                                            label="تا تاریخ"
                                            value={formData.filters.registrationDateRange.to}
                                            onChange={(newValue) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    filters: {
                                                        ...prev.filters,
                                                        registrationDateRange: {
                                                            ...prev.filters.registrationDateRange,
                                                            to: newValue
                                                        }
                                                    }
                                                }))
                                            }}
                                            renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>انصراف</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? 'در حال ذخیره...' : 'ذخیره'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ScheduledSmsFormDialog
