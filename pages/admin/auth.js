import dynamic from "next/dynamic"
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../../components/shared/seo"), { ssr: false })
const AuthPageCompo = dynamic(() => import("../../components/authentication/adminAuthPageCompo"), { ssr: false })

const AuthPage = () => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminAuth.Title')} description={langText('AdminAuth.description')} keywords={langText('AdminAuth.keywords')} pageUrl={langText('AdminAuth.pageUrl')} metaIndex={langText('AdminAuth.metaIndex')} />
      <AuthPageCompo />
    </>
  )
}

AuthPage.Layout = "AuthPageLayout";

export default AuthPage;


