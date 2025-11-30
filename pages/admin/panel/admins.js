import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const AdminsPageCompo = dynamic(() => import("../../../components/admin/adminsPageCompo"), { ssr: false })

const AdminsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('Admins.Title')} description={langText('Admins.description')} keywords={langText('Admins.keywords')} pageUrl={langText('Admins.pageUrl')} metaIndex={langText('Admins.metaIndex')} />
      <AdminsPageCompo />
    </>
  )
}

AdminsPage.Layout = "AdminPageLayout";

export default AdminsPage;


