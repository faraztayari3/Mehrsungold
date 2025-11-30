import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../components/shared/seo"), { ssr: false })
const DepositPageCompo = dynamic(() => import("../../components/panel/depositPageCompo"), { ssr: false })

const DepositPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('PanelDeposit.Title')} description={langText('PanelDeposit.description')} keywords={langText('PanelDeposit.keywords')} pageUrl={langText('PanelDeposit.pageUrl')} metaIndex={langText('PanelDeposit.metaIndex')} />
      <DepositPageCompo />
    </>
  )
}

DepositPage.Layout = "PanelPageLayout";

export default DepositPage;


