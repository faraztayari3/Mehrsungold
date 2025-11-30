import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../components/shared/seo"), { ssr: false })
const OrderPageCompo = dynamic(() => import("../../components/panel/orderPageCompo"), { ssr: false })

const OrderPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('PanelOrder.Title')} description={langText('PanelOrder.description')} keywords={langText('PanelOrder.keywords')} pageUrl={langText('PanelOrder.pageUrl')} metaIndex={langText('PanelOrder.metaIndex')} />
      <OrderPageCompo />
    </>
  )
}

OrderPage.Layout = "PanelPageLayout";

export default OrderPage;


