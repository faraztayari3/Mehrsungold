import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const TradeablesPageCompo = dynamic(() => import("../../../components/admin/tradeablesPageCompo"), { ssr: false })

const TradeablesPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminTradeables.Title')} description={langText('AdminTradeables.description')} keywords={langText('AdminTradeables.keywords')} pageUrl={langText('AdminTradeables.pageUrl')} metaIndex={langText('AdminTradeables.metaIndex')} />
      <TradeablesPageCompo />
    </>
  )
}

TradeablesPage.Layout = "AdminPageLayout";

export default TradeablesPage;


