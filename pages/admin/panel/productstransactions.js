import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const ProductsTransactionsPageCompo = dynamic(() => import("../../../components/admin/productTransactionsPageCompo"), { ssr: false })

const ProductsTransactionsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminProductsTransactions.Title')} description={langText('AdminProductsTransactions.description')} keywords={langText('AdminProductsTransactions.keywords')} pageUrl={langText('AdminProductsTransactions.pageUrl')} metaIndex={langText('AdminProductsTransactions.metaIndex')} />
      <ProductsTransactionsPageCompo />
    </>
  )
}

ProductsTransactionsPage.Layout = "AdminPageLayout";

export default ProductsTransactionsPage;


