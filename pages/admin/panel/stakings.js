import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const StakingPageCompo = dynamic(() => import("../../../components/admin/stakingPageCompo"), { ssr: false })

const StakingPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminStaking.Title')} description={langText('AdminStaking.description')} keywords={langText('AdminStaking.keywords')} pageUrl={langText('AdminStaking.pageUrl')} metaIndex={langText('AdminStaking.metaIndex')} />
      <StakingPageCompo />
    </>
  )
}

StakingPage.Layout = "AdminPageLayout";

export default StakingPage;


