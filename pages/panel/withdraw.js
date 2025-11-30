import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../components/shared/seo"), { ssr: false })
const WithdrawPageCompo = dynamic(() => import("../../components/panel/withdrawPageCompo"), { ssr: false })

const WithdrawPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('PanelWithdraw.Title')} description={langText('PanelWithdraw.description')} keywords={langText('PanelWithdraw.keywords')} pageUrl={langText('PanelWithdraw.pageUrl')} metaIndex={langText('PanelWithdraw.metaIndex')} />
      <WithdrawPageCompo />
    </>
  )
}

WithdrawPage.Layout = "PanelPageLayout";

export default WithdrawPage;


