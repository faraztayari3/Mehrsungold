import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const FiatTransactionsPageCompo = dynamic(() => import("../../../components/admin/fiatTransactionsPageCompo"), { ssr: false })

const FiatTransactionsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminFiatTransactions.Title')} description={langText('AdminFiatTransactions.description')} keywords={langText('AdminFiatTransactions.keywords')} pageUrl={langText('AdminFiatTransactions.pageUrl')} metaIndex={langText('AdminFiatTransactions.metaIndex')} />
      <FiatTransactionsPageCompo />
    </>
  )
}

FiatTransactionsPage.Layout = "AdminPageLayout";

export default FiatTransactionsPage;


