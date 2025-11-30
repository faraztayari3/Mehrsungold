import React from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const GiftcardsPageCompo = dynamic(() => import("../../../components/admin/giftcardsPageCompo"), { ssr: false })

const GiftcardsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminGiftcards.Title')} description={langText('AdminGiftcards.description')} keywords={langText('AdminGiftcards.keywords')} pageUrl={langText('AdminGiftcards.pageUrl')} metaIndex={langText('AdminGiftcards.metaIndex')} />
      <GiftcardsPageCompo />
    </>
  )
}

GiftcardsPage.Layout = "AdminPageLayout";

export default GiftcardsPage;


