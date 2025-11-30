import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const UsersPageCompo = dynamic(() => import("../../../components/admin/usersPageCompo"), { ssr: false })

const UsersPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminUsers.Title')} description={langText('AdminUsers.description')} keywords={langText('AdminUsers.keywords')} pageUrl={langText('AdminUsers.pageUrl')} metaIndex={langText('AdminUsers.metaIndex')} />
      <UsersPageCompo />
    </>
  )
}

UsersPage.Layout = "AdminPageLayout";

export default UsersPage;


