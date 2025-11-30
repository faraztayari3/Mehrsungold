import React from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../../components/shared/seo"), { ssr: false })
const StakingPageCompo = dynamic(() => import("../../components/panel/stakingPageCompo"), { ssr: false })

const StakingPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('PanelStaking.Title')} description={langText('PanelStaking.description')} keywords={langText('PanelStaking.keywords')} pageUrl={langText('PanelStaking.pageUrl')} metaIndex={langText('PanelStaking.metaIndex')} />
      <StakingPageCompo />
    </>
  )
}

StakingPage.Layout = "PanelPageLayout";

export default StakingPage;


