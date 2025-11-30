import React from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../../components/shared/seo"), { ssr: false })
const TicketPageCompo = dynamic(() => import("../../components/panel/ticketPageCompo"), { ssr: false })

const TicketPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('PanelTicketPage.Title')} description={langText('PanelTicketPage.description')} keywords={langText('PanelTicketPage.keywords')} pageUrl={langText('PanelTicketPage.pageUrl')} metaIndex={langText('PanelTicketPage.metaIndex')} />
      <TicketPageCompo />
    </>
  )
}

TicketPage.Layout = "PanelPageLayout";

export default TicketPage;


