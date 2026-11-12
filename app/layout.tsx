import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Big_Shoulders, Figtree, Martian_Mono } from 'next/font/google'
import { siteContent } from '@/lib/site-content'
import { CookieBanner } from '@/components/ui/cookie-banner'
import { AnalyticsTracker } from '@/components/analytics-tracker'
import './globals.css'

const displayFont = Big_Shoulders({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
  variable: '--font-next-display',
})

const bodyFont = Figtree({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-next-body',
})

const monoFont = Martian_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-next-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteContent.seo.url),
  title: {
    default: siteContent.seo.title,
    template: '%s | 27 Creative Studio',
  },
  description: siteContent.seo.description,
  generator: 'Next.js',
  applicationName: siteContent.seo.siteName,
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: siteContent.seo.url,
  },
  openGraph: {
    title: siteContent.seo.ogTitle,
    description: siteContent.seo.ogDescription,
    url: siteContent.seo.url,
    siteName: siteContent.seo.siteName,
    locale: siteContent.seo.locale,
    type: 'website',
    images: [
      {
        url: siteContent.seo.ogImage,
        width: 1200,
        height: 630,
        alt: siteContent.seo.ogTitle,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: siteContent.seo.twitterCard,
    title: siteContent.seo.twitterTitle,
    description: siteContent.seo.twitterDescription,
    images: [siteContent.seo.twitterImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '32x32',
      },
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} antialiased`}>
        {children}
        <CookieBanner />
        <AnalyticsTracker />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
