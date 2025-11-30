import React from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const AdminSinglePageCompo = dynamic(() => import("../../../components/admin/adminSinglePageCompo"), { ssr: false })

const AdminSinglePage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminAdminSinglePage.Title')} description={langText('AdminAdminSinglePage.description')} keywords={langText('AdminAdminSinglePage.keywords')} pageUrl={langText('AdminAdminSinglePage.pageUrl')} metaIndex={langText('AdminAdminSinglePage.metaIndex')} />
      <AdminSinglePageCompo />
    </>
  )
}

AdminSinglePage.Layout = "AdminPageLayout";

export default AdminSinglePage;


