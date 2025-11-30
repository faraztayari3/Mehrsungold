import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const UserSinglePageCompo = dynamic(() => import("../../../components/admin/userSinglePageCompo"), { ssr: false })

const UserSinglePage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminUserSinglePage.Title')} description={langText('AdminUserSinglePage.description')} keywords={langText('AdminUserSinglePage.keywords')} pageUrl={langText('AdminUserSinglePage.pageUrl')} metaIndex={langText('AdminUserSinglePage.metaIndex')} />
      <UserSinglePageCompo />
    </>
  )
}

UserSinglePage.Layout = "AdminPageLayout";

export default UserSinglePage;


