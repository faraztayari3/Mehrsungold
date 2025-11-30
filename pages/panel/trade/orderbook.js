import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const OrderbookTradePageCompo = dynamic(() => import("../../../components/panel/orderbookTradePageCompo"), { ssr: false })

const OrderbookTradePage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('PanelOrderbookTrade.Title')} description={langText('PanelOrderbookTrade.description')} keywords={langText('PanelOrderbookTrade.keywords')} pageUrl={langText('PanelOrderbookTrade.pageUrl')} metaIndex={langText('PanelOrderbookTrade.metaIndex')} />
      <OrderbookTradePageCompo />
    </>
  )
}

OrderbookTradePage.Layout = "PanelPageLayout";

export default OrderbookTradePage;


