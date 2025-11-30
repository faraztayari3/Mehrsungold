import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const FactorsPageCompo = dynamic(() => import("../../../components/admin/factorsPageCompo"), { ssr: false })

const FactorsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminFactors.Title')} description={langText('AdminFactors.description')} keywords={langText('AdminFactors.keywords')} pageUrl={langText('AdminFactors.pageUrl')} metaIndex={langText('AdminFactors.metaIndex')} />
      <FactorsPageCompo />
    </>
  )
}

FactorsPage.Layout = "AdminPageLayout";

export default FactorsPage;


