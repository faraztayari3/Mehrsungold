import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../components/shared/seo"), { ssr: false })
const HistoryPageCompo = dynamic(() => import("../../components/panel/historyPageCompo"), { ssr: false })

const HistoryPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('PanelHistory.Title')} description={langText('PanelHistory.description')} keywords={langText('PanelHistory.keywords')} pageUrl={langText('PanelHistory.pageUrl')} metaIndex={langText('PanelHistory.metaIndex')} />
      <HistoryPageCompo />
    </>
  )
}

HistoryPage.Layout = "PanelPageLayout";

export default HistoryPage;


