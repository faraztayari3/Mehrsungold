import React from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../../components/shared/seo"), { ssr: false })
const GiftcardsPageCompo = dynamic(() => import("../../components/panel/giftcardsPageCompo"), { ssr: false })

const GiftcardsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('PanelGiftcards.Title')} description={langText('PanelGiftcards.description')} keywords={langText('PanelGiftcards.keywords')} pageUrl={langText('PanelGiftcards.pageUrl')} metaIndex={langText('PanelGiftcards.metaIndex')} />
      <GiftcardsPageCompo />
    </>
  )
}

GiftcardsPage.Layout = "PanelPageLayout";

export default GiftcardsPage;


