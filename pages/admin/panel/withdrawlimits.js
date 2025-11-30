import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const WithdrawLimitsPageCompo = dynamic(() => import("../../../components/admin/withdrawLimitsPageCompo"), { ssr: false })

const WithdrawLimitsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminWithdrawLimits.Title')} description={langText('AdminWithdrawLimits.description')} keywords={langText('AdminWithdrawLimits.keywords')} pageUrl={langText('AdminWithdrawLimits.pageUrl')} metaIndex={langText('AdminWithdrawLimits.metaIndex')} />
      <WithdrawLimitsPageCompo />
    </>
  )
}

WithdrawLimitsPage.Layout = "AdminPageLayout";

export default WithdrawLimitsPage;


