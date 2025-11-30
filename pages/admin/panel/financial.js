import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const FinancialPageCompo = dynamic(() => import("../../../components/admin/financialPageCompo"), { ssr: false })

const FinancialPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminFinancial.Title')} description={langText('AdminFinancial.description')} keywords={langText('AdminFinancial.keywords')} pageUrl={langText('AdminFinancial.pageUrl')} metaIndex={langText('AdminFinancial.metaIndex')} />
      <FinancialPageCompo />
    </>
  )
}

FinancialPage.Layout = "AdminPageLayout";

export default FinancialPage;


