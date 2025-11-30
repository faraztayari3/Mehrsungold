import React from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const GiftcardSettingsPageCompo = dynamic(() => import("../../../components/admin/giftcardsSettingsPageCompo"), { ssr: false })

const GiftcardSettingsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminGiftcardSettings.Title')} description={langText('AdminGiftcardSettings.description')} keywords={langText('AdminGiftcardSettings.keywords')} pageUrl={langText('AdminGiftcardSettings.pageUrl')} metaIndex={langText('AdminGiftcardSettings.metaIndex')} />
      <GiftcardSettingsPageCompo />
    </>
  )
}

GiftcardSettingsPage.Layout = "AdminPageLayout";

export default GiftcardSettingsPage;


