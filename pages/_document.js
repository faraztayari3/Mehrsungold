import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html dir="rtl" className="dark">
      <Head>
        <link rel="manifest" id="manifest" />

        {/* Google tag (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-5ZHRN43NRF"
        ></script>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-5ZHRN43NRF', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </Head>

      <body className="!overflow-y-scroll !overflow-x-hidden dark:bg-dark dark:text-white m-0 !p-0">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}