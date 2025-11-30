import '@/styles/globals.css'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

// Multi Language
import { NextIntlClientProvider } from 'next-intl'

// Context
import { AppWrapper } from "../context/AppContext"
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Components
import PanelPageLayout from "../components/layout/panel-page-layout"
import AdminPageLayout from "../components/layout/admin-page-layout"
import AuthPageLayout from "../components/layout/auth-page-layout"

let layouts = {}

import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#ffc300',
      light: '#ffc300',
      dark: '#ffc3008f',
      contrastText: '#ffc3008f',
    },
    success: {
      main: 'rgb(65, 182, 42)',
      light: 'rgb(65, 182, 42)',
      dark: 'rgb(45, 127, 29)',
      contrastText: 'rgb(45, 127, 29)',
    },
    error: {
      main: 'rgb(255, 63, 63)',
      light: 'rgb(255, 63, 63)',
      dark: 'rgb(178, 44, 44)',
      contrastText: 'rgb(178, 44, 44)',
    },
    white: {
      main: '#FFFFFF',
      light: '#FFFFFF',
      dark: '#000000',
      contrastText: '#FFFFFF',
    },
    black: {
      main: '#000000',
      light: '#000000',
      dark: '#FFFFFF',
      contrastText: '#000000',
    },
  },
});

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
  prepend: true
});

import panelFaMessages from '../context/languages/panel-fa.json';

import authFaMessages from '../context/languages/authentication-fa.json';

import adminFaMessages from '../context/languages/admin-fa.json';

const messagesMap = {
  PanelPageLayout: {
    fa: panelFaMessages
  },
  LandingPageLayout: {
    fa: authFaMessages
  },
  AuthPageLayout: {
    fa: authFaMessages
  },
  AdminPageLayout: {
    fa: adminFaMessages
  },
}

export default function App({ Component, pageProps }) {

  const { locale } = useRouter();

  layouts = {
    PanelPageLayout: PanelPageLayout,
    AdminPageLayout: AdminPageLayout,
    AuthPageLayout: AuthPageLayout
  }

  const currentLayout = Component.Layout || 'LandingPageLayout';
  const messages = messagesMap[currentLayout]?.[locale] || messagesMap[currentLayout]?.[process.env.NEXT_PUBLIC_DEFAULTLOCALE || 'fa'];

  const Layout = layouts[Component.Layout] || ((props) => <Component {...props} />);

  // const direction = messages?.Dir || 'rtl';

  // create pwa dynamic
  const [noRefresh, setnoRefresh] = useState(true);
  const [refresh, setRefresh] = useState(true);
  useEffect(() => {
    const siteInfo = JSON.parse(localStorage.getItem('siteInfo'));
    if (siteInfo && refresh) {
      console.log('start');
      setRefresh(false);
      const manifestElement = document.getElementById("manifest");
      const manifestString = JSON.stringify({
        theme_color: "#ffc300",
        background_color: "#ffc300",
        display: "standalone",
        scope: `${window.location.origin}`,
        start_url: `${window.location.origin}`,
        short_name: siteInfo?.title,
        name: siteInfo?.title,
        icons: [
          {
            "src": `${process.env.NEXT_PUBLIC_BASEURL}${siteInfo?.lightIconImage}`,
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": `${process.env.NEXT_PUBLIC_BASEURL}${siteInfo?.lightIconImage}`,
            "sizes": "512x512",
            "type": "image/png"
          }
        ]
      });
      manifestElement?.setAttribute(
        "href",
        "data:application/json;charset=utf-8," + encodeURIComponent(manifestString),
      );
    }
  }, [noRefresh]);

  return (
    <AppWrapper>
      <CacheProvider value={cacheRtl}>
        <ThemeProvider theme={theme}>
          <NextIntlClientProvider locale={locale} timeZone="Europe/London" messages={messages}>
            <Head>
              <meta name="robots" content="noindex, nofollow" />
            </Head>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </NextIntlClientProvider>
        </ThemeProvider>
      </CacheProvider>
    </AppWrapper>
  )
}
