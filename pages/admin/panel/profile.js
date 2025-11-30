import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const ProfilePageCompo = dynamic(() => import("../../../components/admin/profilePageCompo"), { ssr: false })

const ProfilePage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminProfile.Title')} description={langText('AdminProfile.description')} keywords={langText('AdminProfile.keywords')} pageUrl={langText('AdminProfile.pageUrl')} metaIndex={langText('AdminProfile.metaIndex')} />
      <ProfilePageCompo />
    </>
  )
}

ProfilePage.Layout = "AdminPageLayout";

export default ProfilePage;


