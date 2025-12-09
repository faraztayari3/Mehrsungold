import React, { useEffect, useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import {
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    TextField,
    Select,
    FormControl,
    InputLabel,
    Grid,
    Typography,
    Paper,
    Button,
    CircularProgress,
    MenuItem
} from '@mui/material'

const SMS_API_URL = process.env.NEXT_PUBLIC_SMS_API_URL || 'http://localhost:3005'

const SmsLogsPageCompo = () => {
    const { dispatch } = useAppContext()
    const [loading, setLoading] = useState(false)
    const [logs, setLogs] = useState([])
    const [statistics, setStatistics] = useState({ total: 0, sent: 0, failed: 0, pending: 0 })
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(20)
    const [totalRecords, setTotalRecords] = useState(0)
    
    const [filterType, setFilterType] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterMobile, setFilterMobile] = useState('')
    const [shouldFetch, setShouldFetch] = useState(true)

    useEffect(() => {
        if (!shouldFetch) return
        if (typeof window === 'undefined') return
        
        const loadData = async () => {
            setLoading(true)
            try {
                const cookies = document.cookie.split(';')
                const tokenCookie = cookies.find(c => c.trim().startsWith('adminToken='))
                const token = tokenCookie ? tokenCookie.split('=')[1] : ''

                const params = new URLSearchParams({
                    page: page + 1,
                    limit: rowsPerPage,
                    sortBy: 'sentAt',
                    sortOrder: 'desc'
                })

                if (filterType) params.append('type', filterType)
                if (filterStatus) params.append('status', filterStatus)
                if (filterMobile) params.append('mobileNumber', filterMobile)

                const response = await fetch(`${SMS_API_URL}/sms/logs?${params}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                const res = await response.json()
                if (res?.statusCode === 200) {
                    setLogs(res.data.logs || [])
                    setTotalRecords(res.data.pagination.total)
                    setStatistics(res.data.statistics || { total: 0, sent: 0, failed: 0, pending: 0 })
                }
            } catch (error) {
                console.error('[SMS Logs] Error:', error)
            } finally {
                setLoading(false)
                setShouldFetch(false)
            }
        }

        loadData()
    }, [shouldFetch])

    const getStatusColor = (status) => {
        if (status === 'sent') return 'success'
        if (status === 'failed') return 'error'
        if (status === 'pending') return 'warning'
        return 'default'
    }

    const getStatusText = (status) => {
        if (status === 'sent') return 'ارسال شده'
        if (status === 'failed') return 'ناموفق'
        if (status === 'pending') return 'در انتظار'
        return status
    }

    const getTypeText = (type) => {
        if (type === 'registration') return 'ثبت‌نام'
        if (type === 'deposit') return 'واریز'
        if (type === 'withdrawal') return 'برداشت'
        if (type === 'bulk') return 'گروهی'
        if (type === 'filtered') return 'فیلتر شده'
        return type
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{statistics.total}</Typography>
                        <Typography variant="body2">کل</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{statistics.sent}</Typography>
                        <Typography variant="body2">ارسال شده</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{statistics.failed}</Typography>
                        <Typography variant="body2">ناموفق</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{statistics.pending}</Typography>
                        <Typography variant="body2">در انتظار</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>فیلترها</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>نوع</InputLabel>
                                <Select value={filterType} label="نوع" onChange={(e) => setFilterType(e.target.value)}>
                                    <MenuItem value="">همه</MenuItem>
                                    <MenuItem value="registration">ثبت‌نام</MenuItem>
                                    <MenuItem value="deposit">واریز</MenuItem>
                                    <MenuItem value="withdrawal">برداشت</MenuItem>
                                    <MenuItem value="bulk">گروهی</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>وضعیت</InputLabel>
                                <Select value={filterStatus} label="وضعیت" onChange={(e) => setFilterStatus(e.target.value)}>
                                    <MenuItem value="">همه</MenuItem>
                                    <MenuItem value="sent">ارسال شده</MenuItem>
                                    <MenuItem value="failed">ناموفق</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4} md={3}>
                            <TextField fullWidth size="small" label="شماره" value={filterMobile} onChange={(e) => setFilterMobile(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={12} md={3}>
                            <Button variant="contained" onClick={() => { setPage(0); setShouldFetch(true) }} fullWidth>
                                <text className="text-white font-semibold">اعمال</text>
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ردیف</TableCell>
                                            <TableCell>شماره</TableCell>
                                            <TableCell>نوع</TableCell>
                                            <TableCell>پیام</TableCell>
                                            <TableCell>وضعیت</TableCell>
                                            <TableCell>زمان</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {logs.map((log, index) => (
                                            <TableRow key={log._id}>
                                                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                                <TableCell>{log.mobileNumber}</TableCell>
                                                <TableCell><Chip label={getTypeText(log.type)} size="small" /></TableCell>
                                                <TableCell>{log.message.substring(0, 50)}...</TableCell>
                                                <TableCell><Chip label={getStatusText(log.status)} color={getStatusColor(log.status)} size="small" /></TableCell>
                                                <TableCell>{formatDate(log.sentAt)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                count={totalRecords}
                                page={page}
                                onPageChange={(e, newPage) => { setPage(newPage); setShouldFetch(true) }}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); setShouldFetch(true) }}
                                rowsPerPageOptions={[10, 20, 50]}
                            />
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    )
}

export default SmsLogsPageCompo
