import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const OrderbookSettingsPageCompo = dynamic(() => import("../../../components/admin/orderbookSettingsPageCompo"), { ssr: false })

const OrderbookSettingsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminOrderbookSettings.Title')} description={langText('AdminOrderbookSettings.description')} keywords={langText('AdminOrderbookSettings.keywords')} pageUrl={langText('AdminOrderbookSettings.pageUrl')} metaIndex={langText('AdminOrderbookSettings.metaIndex')} />
      <OrderbookSettingsPageCompo />
    </>
  )
}

OrderbookSettingsPage.Layout = "AdminPageLayout";

export default OrderbookSettingsPage;


