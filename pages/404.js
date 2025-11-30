import dynamic from "next/dynamic"
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../components/shared/seo"), { ssr: false })
const Custom404PageCompo = dynamic(() => import("../components/landing/notfound"), { ssr: false })

const Custom404Page = () => {

    const langText = useTranslations('');

    return (
        <>
            <Seo title={langText('Not_found.Title')} description={langText('Not_found.description')} keywords={langText('Not_found.keywords')} pageUrl={langText('Not_found.pageUrl')} metaIndex={langText('Not_found.metaIndex')} />
            <Custom404PageCompo />
        </>
    )
}

export default Custom404Page;