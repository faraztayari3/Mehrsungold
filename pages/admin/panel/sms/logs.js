import React from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useAppContext } from '@/context/AppContext'
import AdminPageLayout from '@/components/layout/admin-page-layout'

// Disable SSR for this component to avoid document.cookie issues
const SmsLogsPageCompo = dynamic(
    () => import('@/components/admin/smsLogsPageCompo'),
    { ssr: false }
)

const SmsLogsPage = () => {
    const { state } = useAppContext()
    const { siteInfo } = state

    return (
        <>
            <Head>
                <title>{`${siteInfo?.name || ''} - گزارش پیامک‌ها`}</title>
            </Head>
            <AdminPageLayout>
                <SmsLogsPageCompo />
            </AdminPageLayout>
        </>
    )
}

export default SmsLogsPage
