import React from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../../components/shared/seo"), { ssr: false })
const MessagesPageCompo = dynamic(() => import("../../components/panel/messagesPageCompo"), { ssr: false })

const MessagesPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('PanelMessages.Title')} description={langText('PanelMessages.description')} keywords={langText('PanelMessages.keywords')} pageUrl={langText('PanelMessages.pageUrl')} metaIndex={langText('PanelMessages.metaIndex')} />
      <MessagesPageCompo />
    </>
  )
}

MessagesPage.Layout = "PanelPageLayout";

export default MessagesPage;


