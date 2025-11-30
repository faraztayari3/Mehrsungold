import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const OrderbooksPageCompo = dynamic(() => import("../../../components/admin/orderbooksPageCompo"), { ssr: false })

const OrderbooksPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminOrderbooks.Title')} description={langText('AdminOrderbooks.description')} keywords={langText('AdminOrderbooks.keywords')} pageUrl={langText('AdminOrderbooks.pageUrl')} metaIndex={langText('AdminOrderbooks.metaIndex')} />
      <OrderbooksPageCompo />
    </>
  )
}

OrderbooksPage.Layout = "AdminPageLayout";

export default OrderbooksPage;


