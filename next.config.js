/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  sw: 'service-worker.js'
});

const nextConfig = withPWA({
  reactStrictMode: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
  },
  i18n: {
    locales: ['fa'],
    defaultLocale: process.env.NEXT_PUBLIC_DEFAULTLOCALE || 'fa',
    localeDetection: false
  },
  swcMinify: true,
  images: {
    loader: "akamai",
    path: " "
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'sameorigin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'same-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=self', // allow specified policies here
          },
          {
            key: 'Permissions-Policy',
            value: 'microphone=self', // allow specified policies here
          },
        ]
      }
    ]
  },
  async redirects() {
    return [{
      source: '/',
      destination: '/panel',
      permanent: true,
    }]
  }
});

module.exports = nextConfig
