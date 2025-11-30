import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const ProductsBranchPageCompo = dynamic(() => import("../../../components/admin/productsBranchPageCompo"), { ssr: false })

const ProductsBranchPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminProductsBranch.Title')} description={langText('AdminProductsBranch.description')} keywords={langText('AdminProductsBranch.keywords')} pageUrl={langText('AdminProductsBranch.pageUrl')} metaIndex={langText('AdminProductsBranch.metaIndex')} />
      <ProductsBranchPageCompo />
    </>
  )
}

ProductsBranchPage.Layout = "AdminPageLayout";

export default ProductsBranchPage;


