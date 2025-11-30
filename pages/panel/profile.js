import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../components/shared/seo"), { ssr: false })
const ProfilePageCompo = dynamic(() => import("../../components/panel/profilePageCompo"), { ssr: false })

const ProfilePage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('PanelProfile.Title')} description={langText('PanelProfile.description')} keywords={langText('PanelProfile.keywords')} pageUrl={langText('PanelProfile.pageUrl')} metaIndex={langText('PanelProfile.metaIndex')} />
      {/* <ProfilePageCompo data={props.data} /> */}
      <ProfilePageCompo />
    </>
  )
}

ProfilePage.Layout = "PanelPageLayout";

export default ProfilePage;


