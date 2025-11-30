import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useTranslations } from 'next-intl'
import { parseCookies, setCookie } from 'nookies'

// Components
const Seo = dynamic(() => import("../../../components/shared/seo"), { ssr: false })
const BankAccountsPageCompo = dynamic(() => import("../../../components/admin/bankAccountsPageCompo"), { ssr: false })

const BankAccountsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('AdminBankAccounts.Title')} description={langText('AdminBankAccounts.description')} keywords={langText('AdminBankAccounts.keywords')} pageUrl={langText('AdminBankAccounts.pageUrl')} metaIndex={langText('AdminBankAccounts.metaIndex')} />
      <BankAccountsPageCompo />
    </>
  )
}

BankAccountsPage.Layout = "AdminPageLayout";

export default BankAccountsPage;


