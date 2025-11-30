import { useEffect } from 'react'
import dynamic from "next/dynamic"
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../components/shared/seo"), { ssr: false })
const AuthPageCompo = dynamic(() => import("../components/authentication/authPageCompo"), { ssr: false })

const AuthPage = () => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('Auth.Title')} description={langText('Auth.description')} keywords={langText('Auth.keywords')} pageUrl={langText('Auth.pageUrl')} metaIndex={langText('Auth.metaIndex')} />
      <AuthPageCompo />
    </>
  )
}

AuthPage.Layout = "AuthPageLayout";

export default AuthPage;

