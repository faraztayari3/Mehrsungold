import dynamic from "next/dynamic"
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../components/shared/seo"), { ssr: false })
const Error500 = dynamic(() => import("../components/landing/error"), { ssr: false })

const Custom500 = () => {

    const langText = useTranslations('');

    return (
        <>
            <Seo title={langText('Error.Title')} description={langText('Error.description')} keywords={langText('Error.keywords')} pageUrl={langText('Error.pageUrl')} metaIndex={langText('Error.metaIndex')} />
            <Error500 />
        </>
    )
}

export default Custom500;