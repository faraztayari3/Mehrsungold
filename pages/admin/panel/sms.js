import Head from 'next/head'

// Context
import { useAppContext } from "../../../context/AppContext"

// Layout
import AdminPageLayout from '../../../components/layout/admin-page-layout'

// Component
import SMSPageCompo from "../../../components/admin/smsPageCompo"

/**
 * SMS management page
 * @returns The rendered SMS management page
 */
const SMS = () => {

    const { state, dispatch } = useAppContext()
    const { siteInfo } = state

    return (
        <>
            <Head>
                <title>{`${siteInfo?.name || ''} - مدیریت پیامک ها`}</title>
            </Head>
            <AdminPageLayout>
                <SMSPageCompo />
            </AdminPageLayout>
        </>
    )
}

export default SMS

export async function getStaticProps({ locale }) {
    return {
        props: {
            messages: (await import(`../../../context/languages/${locale}.json`)).default
        }
    }
}
