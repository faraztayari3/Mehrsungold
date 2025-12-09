import React from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useAppContext } from '@/context/AppContext'
import AdminPageLayout from '@/components/layout/admin-page-layout'

const AdvancedSmsPageCompo = dynamic(() => import('@/components/admin/advancedSmsPageCompo'), { ssr: false })

const AdvancedSmsPage = () => {
    const { state } = useAppContext()
    const { siteInfo } = state

    return (
        <>
            <Head>
                <title>{`${siteInfo?.name || ''} - پیامک پیشرفته`}</title>
            </Head>
            <AdminPageLayout>
                <AdvancedSmsPageCompo />
            </AdminPageLayout>
        </>
    )
}

export default AdvancedSmsPage
