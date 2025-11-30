import Head from "next/head"
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

/**
 * Component for generating SEO meta tags for a web page.
 * @param {{string}} title - The title of the web page.
 * @param {{string}} description - The description of the web page.
 * @param {{string}} keywords - The keywords associated with the web page.
 * @param {{string}} pageUrl - The URL of the web page.
 * @param {{string}} metaIndex - The meta index value for search engine robots.
 * @returns A React component that renders the SEO meta tags.
 */
const Seo = ({ title, description, keywords, pageUrl, metaIndex }) => {

    const { state } = useAppContext();
    const { siteInfo } = state;

    const langText = useTranslations('');
    const { locale } = useRouter();

    /**
     * Generates the HTML head section for a web page with various meta tags and links.
     * @param {{string}} title - The title of the page.
     * @param {{object}} siteInfo - Information about the site.
     * @param {{string}} description - The description of the page.
     * @param {{string}} keywords - The keywords associated with the page.
     * @param {{string}} pageUrl - The URL of the page.
     * @param {{string}} metaIndex - The meta index value.
     * @param {{string}} locale - The locale of the page.
     * @returns The HTML head section with meta tags and links.
     */
    return (
        <Head>
            <title>{title} {siteInfo && siteInfo.title ? `- ${siteInfo.title}` : ''}</title>
            <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />
            <meta version={siteInfo ? siteInfo.version : '1'} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={pageUrl} />
            <meta name="robots" content={metaIndex} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={pageUrl} />
            <meta property="og:site_name" content={siteInfo ? siteInfo.siteName : langText('Seo.SiteName')} />
            <meta property="og:brand" content={siteInfo ? siteInfo.siteName : langText('Seo.SiteName')} />
            <meta property="og:locale" content={locale} />
            <meta crossOrigin="anonymous" property="og:image" content={siteInfo ? `${process.env.NEXT_PUBLIC_BASEURL}${siteInfo.lightIconImage}` : '/favicon.ico'} />
            {/* <meta name="twitter:card" content="summary" />
            <meta name="twitter:site" content="@viraasrcom" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} /> */}
            <link crossOrigin="anonymous" rel="icon" href={siteInfo ? `${process.env.NEXT_PUBLIC_BASEURL}${siteInfo?.lightIconImage}?v=1` : '/favicon.ico?v=1'} />
            <link crossOrigin="anonymous" rel="icon" type="image/png" sizes="32x32" href={siteInfo ? `${process.env.NEXT_PUBLIC_BASEURL}${siteInfo?.lightIconImage}?v=1` : '/favicon.ico?v=1'} />
            <link crossOrigin="anonymous" rel="icon" type="image/png" sizes="16x16" href={siteInfo ? `${process.env.NEXT_PUBLIC_BASEURL}${siteInfo?.lightIconImage}?v=1` : '/favicon.ico?v=1'} />
            <link crossOrigin="anonymous" rel="apple-touch-icon" href={siteInfo ? `${process.env.NEXT_PUBLIC_BASEURL}${siteInfo?.lightIconImage}` : '/favicon.ico?v=1'} />

            <meta name="apple-mobile-web-app-capable" content="yes" />
        </Head>
    )
}

export default Seo;