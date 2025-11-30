import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const TradesPageCompo = dynamic(() => import("../../../components/admin/tradesPageCompo"), { ssr: false })

const TradesPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminTrades.Title')} description={langText('AdminTrades.description')} keywords={langText('AdminTrades.keywords')} pageUrl={langText('AdminTrades.pageUrl')} metaIndex={langText('AdminTrades.metaIndex')} />
      <TradesPageCompo />
    </>
  )
}

TradesPage.Layout = "AdminPageLayout";

export default TradesPage;


