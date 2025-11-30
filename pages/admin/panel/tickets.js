import React from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const TicketsPageCompo = dynamic(() => import("../../../components/admin/ticketsPageCompo"), { ssr: false })

const TicketsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminTickets.Title')} description={langText('AdminTickets.description')} keywords={langText('AdminTickets.keywords')} pageUrl={langText('AdminTickets.pageUrl')} metaIndex={langText('AdminTickets.metaIndex')} />
      <TicketsPageCompo />
    </>
  )
}

TicketsPage.Layout = "AdminPageLayout";

export default TicketsPage;


