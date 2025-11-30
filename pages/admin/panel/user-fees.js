import React from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const UserFeesPageCompo = dynamic(() => import("../../../components/admin/userFeesPageCompo"), { ssr: false })

const UserFeesPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminUserFees.Title')} description={langText('AdminUserFees.description')} keywords={langText('AdminUserFees.keywords')} pageUrl={langText('AdminUserFees.pageUrl')} metaIndex={langText('AdminUserFees.metaIndex')} />
      <UserFeesPageCompo />
    </>
  )
}

UserFeesPage.Layout = "AdminPageLayout";

export default UserFeesPage;


