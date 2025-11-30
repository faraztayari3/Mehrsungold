import React from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

// Components
const Seo = dynamic(() => import("../../components/shared/seo"), { ssr: false })
const BankAccountsPageCompo = dynamic(() => import("../../components/panel/bankAccountsPageCompo"), { ssr: false })

const BankAccountsPage = (props) => {

  const langText = useTranslations('');

  return (
    <>
      <Seo title={langText('PanelBankAccounts.Title')} description={langText('PanelBankAccounts.description')} keywords={langText('PanelBankAccounts.keywords')} pageUrl={langText('PanelBankAccounts.pageUrl')} metaIndex={langText('PanelBankAccounts.metaIndex')} />
      <BankAccountsPageCompo />
    </>
  )
}

BankAccountsPage.Layout = "PanelPageLayout";

export default BankAccountsPage;


