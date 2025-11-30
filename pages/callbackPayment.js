import dynamic from "next/dynamic"
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../components/shared/seo"), { ssr: false })
const CallbackPayment = dynamic(() => import("../components/landing/callbackPayment"), { ssr: false })

const CallbackPaymentPage = () => {

    const langText = useTranslations('');

    return (
        <>
            <Seo title={langText('Payment.Title')} description={langText('Payment.description')} keywords={langText('Payment.keywords')} pageUrl={langText('Payment.pageUrl')} metaIndex={langText('Payment.metaIndex')} />
            <CallbackPayment />
        </>
    )
}

export default CallbackPaymentPage;