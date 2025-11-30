import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const TransfersPageCompo = dynamic(() => import("../../../components/admin/transfersPageCompo"), { ssr: false })

const TransfersPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminTransfers.Title')} description={langText('AdminTransfers.description')} keywords={langText('AdminTransfers.keywords')} pageUrl={langText('AdminTransfers.pageUrl')} metaIndex={langText('AdminTransfers.metaIndex')} />
      <TransfersPageCompo />
    </>
  )
}

TransfersPage.Layout = "AdminPageLayout";

export default TransfersPage;


