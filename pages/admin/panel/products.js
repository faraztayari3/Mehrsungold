import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const ProductsPageCompo = dynamic(() => import("../../../components/admin/productsPageCompo"), { ssr: false })

const ProductsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminProducts.Title')} description={langText('AdminProducts.description')} keywords={langText('AdminProducts.keywords')} pageUrl={langText('AdminProducts.pageUrl')} metaIndex={langText('AdminProducts.metaIndex')} />
      <ProductsPageCompo />
    </>
  )
}

ProductsPage.Layout = "AdminPageLayout";

export default ProductsPage;


