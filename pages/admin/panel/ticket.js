import React from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const TicketPageCompo = dynamic(() => import("../../../components/admin/ticketPageCompo"), { ssr: false })

const TicketPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminTicketPage.Title')} description={langText('AdminTicketPage.description')} keywords={langText('AdminTicketPage.keywords')} pageUrl={langText('AdminTicketPage.pageUrl')} metaIndex={langText('AdminTicketPage.metaIndex')} />
      <TicketPageCompo />
    </>
  )
}

TicketPage.Layout = "AdminPageLayout";

export default TicketPage;


