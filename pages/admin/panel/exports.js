import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const ExportsPageCompo = dynamic(() => import("../../../components/admin/exportsPageCompo"), { ssr: false })

const ExportsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminExports.Title')} description={langText('AdminExports.description')} keywords={langText('AdminExports.keywords')} pageUrl={langText('AdminExports.pageUrl')} metaIndex={langText('AdminExports.metaIndex')} />
      <ExportsPageCompo />
    </>
  )
}

ExportsPage.Layout = "AdminPageLayout";

export default ExportsPage;


