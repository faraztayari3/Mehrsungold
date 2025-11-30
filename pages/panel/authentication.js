import React from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../../components/shared/seo"), { ssr: false })
const AuthenticationPageCompo = dynamic(() => import("../../components/panel/authenticationPageCompo"), { ssr: false })

const AuthenticationPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('PanelAuthentication.Title')} description={langText('PanelAuthentication.description')} keywords={langText('Panelauthentication.keywords')} pageUrl={langText('Panelauthentication.pageUrl')} metaIndex={langText('Panelauthentication.metaIndex')} />
      <AuthenticationPageCompo />
    </>
  )
}

AuthenticationPage.Layout = "PanelPageLayout";

export default AuthenticationPage;


