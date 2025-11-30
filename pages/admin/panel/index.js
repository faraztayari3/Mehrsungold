import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const AdminIndexPageCompo = dynamic(() => import("../../../components/admin/adminIndexPageCompo"), { ssr: false })

const AdminIndexPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminIndex.Title')} description={langText('AdminIndex.description')} keywords={langText('AdminIndex.keywords')} pageUrl={langText('AdminIndex.pageUrl')} metaIndex={langText('AdminIndex.metaIndex')} />
      <AdminIndexPageCompo />
    </>
  )
}

AdminIndexPage.Layout = "AdminPageLayout";

export default AdminIndexPage;


