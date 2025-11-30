import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../components/shared/seo"), { ssr: false })
const PanelIndexPageCompo = dynamic(() => import("../../components/panel/panelIndexPageCompo"), { ssr: false })

const PanelIndexPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('PanelIndex.Title')} description={langText('PanelIndex.description')} keywords={langText('PanelIndex.keywords')} pageUrl={langText('PanelIndex.pageUrl')} metaIndex={langText('PanelIndex.metaIndex')} />
      {/* <PanelIndexPageCompo data={props.data} /> */}
      <PanelIndexPageCompo />
    </>
  )
}

PanelIndexPage.Layout = "PanelPageLayout";

export default PanelIndexPage;
