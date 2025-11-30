import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const TradePageCompo = dynamic(() => import("../../../components/panel/tradePageCompo"), { ssr: false })

const TradePage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('PanelTrade.Title')} description={langText('PanelTrade.description')} keywords={langText('PanelTrade.keywords')} pageUrl={langText('PanelTrade.pageUrl')} metaIndex={langText('PanelTrade.metaIndex')} />
      <TradePageCompo />
    </>
  )
}

TradePage.Layout = "PanelPageLayout";

export default TradePage;


