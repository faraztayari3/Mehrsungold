import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const MessagesPageCompo = dynamic(() => import("../../../components/admin/messagesPageCompo"), { ssr: false })

const MessagesPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminMessages.Title')} description={langText('AdminMessages.description')} keywords={langText('AdminMessages.keywords')} pageUrl={langText('AdminMessages.pageUrl')} metaIndex={langText('AdminMessages.metaIndex')} />
      <MessagesPageCompo />
    </>
  )
}

MessagesPage.Layout = "AdminPageLayout";

export default MessagesPage;


