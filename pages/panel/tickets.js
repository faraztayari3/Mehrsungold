import React from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../../components/shared/seo"), { ssr: false })
const TicketsPageCompo = dynamic(() => import("../../components/panel/ticketsPageCompo"), { ssr: false })

const TicketsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('PanelTickets.Title')} description={langText('PanelTickets.description')} keywords={langText('PanelTickets.keywords')} pageUrl={langText('PanelTickets.pageUrl')} metaIndex={langText('PanelTickets.metaIndex')} />
      <TicketsPageCompo />
    </>
  )
}

TicketsPage.Layout = "PanelPageLayout";

export default TicketsPage;