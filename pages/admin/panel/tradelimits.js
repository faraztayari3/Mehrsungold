import React from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const TradeLimitsPageCompo = dynamic(() => import("../../../components/admin/tradesLimitsPageCompo"), { ssr: false })

const TradeLimitsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminTradeLimits.Title')} description={langText('AdminTradeLimits.description')} keywords={langText('AdminTradeLimits.keywords')} pageUrl={langText('AdminTradeLimits.pageUrl')} metaIndex={langText('AdminTradeLimits.metaIndex')} />
      <TradeLimitsPageCompo />
    </>
  )
}

TradeLimitsPage.Layout = "AdminPageLayout";

export default TradeLimitsPage;


