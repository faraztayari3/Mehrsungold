import React, { useState, useEffect } from 'react'
import { useAppContext } from '@/context/AppContext'
import {
    Box,
    Card,
    CardContent,
    Button,
    Typography,
    Grid,
    Paper,
    Chip,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import ScheduledSmsFormDialog from './scheduledSmsFormDialog'

const SMS_API_URL = process.env.NEXT_PUBLIC_SMS_API_URL || 'http://localhost:3005'

const AdvancedSmsPageCompo = () => {
    const { dispatch } = useAppContext()
    const [loading, setLoading] = useState(false)
    const [scheduledSmsList, setScheduledSmsList] = useState([])
    const [statistics, setStatistics] = useState({ total: 0, pending: 0, completed: 0, failed: 0, active: 0 })
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(20)
    const [totalRecords, setTotalRecords] = useState(0)
    const [openDialog, setOpenDialog] = useState(false)
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
                    limit: rowsPerPage
                })

                const [listRes, statsRes] = await Promise.all([
                    fetch(`${SMS_API_URL}/sms/scheduled?${params}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${SMS_API_URL}/sms/scheduled/stats/summary`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ])

                const listData = await listRes.json()
                const statsData = await statsRes.json()

                if (listData?.statusCode === 200) {
                    setScheduledSmsList(listData.data.items || [])
                    setTotalRecords(listData.data.pagination.total)
                }

                if (statsData?.statusCode === 200) {
                    setStatistics(statsData.data)
                }
            } catch (error) {
                console.error('[Advanced SMS] Error:', error)
            } finally {
                setLoading(false)
                setShouldFetch(false)
            }
        }

        loadData()
    }, [shouldFetch])

    const getStatusColor = (status) => {
        const colors = {
            pending: 'warning',
            processing: 'info',
            completed: 'success',
            failed: 'error',
            cancelled: 'default'
        }
        return colors[status] || 'default'
    }

    const getStatusText = (status) => {
        const texts = {
            pending: 'در انتظار',
            processing: 'در حال پردازش',
            completed: 'تکمیل شده',
            failed: 'ناموفق',
            cancelled: 'لغو شده'
        }
        return texts[status] || status
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

    const handleToggleActive = async (id, currentStatus) => {
        try {
            const cookies = document.cookie.split(';')
            const tokenCookie = cookies.find(c => c.trim().startsWith('adminToken='))
            const token = tokenCookie ? tokenCookie.split('=')[1] : ''

            const response = await fetch(`${SMS_API_URL}/sms/scheduled/${id}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive: !currentStatus })
            })

            const data = await response.json()
            if (data?.statusCode === 200) {
                setShouldFetch(true)
            }
        } catch (error) {
            console.error('Error toggling status:', error)
        }
    }

    const handleExecuteNow = async (id) => {
        if (!confirm('آیا مطمئن هستید که می‌خواهید این پیامک را الان اجرا کنید؟')) return

        try {
            const cookies = document.cookie.split(';')
            const tokenCookie = cookies.find(c => c.trim().startsWith('adminToken='))
            const token = tokenCookie ? tokenCookie.split('=')[1] : ''

            const response = await fetch(`${SMS_API_URL}/sms/scheduled/${id}/execute`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await response.json()
            if (data?.statusCode === 200) {
                alert('پیامک در حال ارسال است')
                setShouldFetch(true)
            }
        } catch (error) {
            console.error('Error executing SMS:', error)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('آیا مطمئن هستید که می‌خواهید این پیامک را حذف کنید؟')) return

        try {
            const cookies = document.cookie.split(';')
            const tokenCookie = cookies.find(c => c.trim().startsWith('adminToken='))
            const token = tokenCookie ? tokenCookie.split('=')[1] : ''

            const response = await fetch(`${SMS_API_URL}/sms/scheduled/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await response.json()
            if (data?.statusCode === 200) {
                setShouldFetch(true)
            }
        } catch (error) {
            console.error('Error deleting SMS:', error)
        }
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">پیامک پیشرفته</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    <text className="text-white font-semibold">ایجاد پیامک شرطی جدید</text>
                </Button>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{statistics.total}</Typography>
                        <Typography variant="body2">کل</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{statistics.active}</Typography>
                        <Typography variant="body2">فعال</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{statistics.pending}</Typography>
                        <Typography variant="body2">در انتظار</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{statistics.completed}</Typography>
                        <Typography variant="body2">تکمیل شده</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{statistics.failed}</Typography>
                        <Typography variant="body2">ناموفق</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Card>
                <CardContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>نام</TableCell>
                                    <TableCell>زمان اجرا</TableCell>
                                    <TableCell>وضعیت</TableCell>
                                    <TableCell>تکراری</TableCell>
                                    <TableCell>تعداد ارسالی</TableCell>
                                    <TableCell>عملیات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {scheduledSmsList.map((item) => (
                                    <TableRow key={item._id}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{formatDate(item.scheduledTime)}</TableCell>
                                        <TableCell>
                                            <Chip label={getStatusText(item.status)} color={getStatusColor(item.status)} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            {item.isRecurring ? <Chip label="تکراری" size="small" color="primary" /> : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {item.execution.sentCount || 0} / {item.execution.totalRecipients || 0}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size="small" onClick={() => handleToggleActive(item._id, item.isActive)}>
                                                {item.isActive ? <PauseIcon /> : <PlayArrowIcon />}
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleExecuteNow(item._id)}>
                                                <PlayArrowIcon color="primary" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDelete(item._id)}>
                                                <DeleteIcon color="error" />
                                            </IconButton>
                                        </TableCell>
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
                        labelRowsPerPage="تعداد در صفحه:"
                    />
                </CardContent>
            </Card>

            <ScheduledSmsFormDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSuccess={() => setShouldFetch(true)}
            />
        </Box>
    )
}

export default AdvancedSmsPageCompo
