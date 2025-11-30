import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const SettingsPageCompo = dynamic(() => import("../../../components/admin/settingsPageCompo"), { ssr: false })

const SettingsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminSettings.Title')} description={langText('AdminSettings.description')} keywords={langText('AdminSettings.keywords')} pageUrl={langText('AdminSettings.pageUrl')} metaIndex={langText('AdminSettings.metaIndex')} />
      <SettingsPageCompo />
    </>
  )
}

SettingsPage.Layout = "AdminPageLayout";

export default SettingsPage;


