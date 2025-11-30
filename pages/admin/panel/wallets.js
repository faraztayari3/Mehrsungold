import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const WalletsPageCompo = dynamic(() => import("../../../components/admin/walletsPageCompo"), { ssr: false })

const WalletsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminWallets.Title')} description={langText('AdminWallets.description')} keywords={langText('AdminWallets.keywords')} pageUrl={langText('AdminWallets.pageUrl')} metaIndex={langText('AdminWallets.metaIndex')} />
      <WalletsPageCompo />
    </>
  )
}

WalletsPage.Layout = "AdminPageLayout";

export default WalletsPage;


