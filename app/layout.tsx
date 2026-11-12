import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Big_Shoulders, Figtree, Martian_Mono } from 'next/font/google'
import { siteContent, getSiteBaseUrl } from '@/lib/site-content'
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

const siteUrl = getSiteBaseUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteContent.seo.title,
    template: '%s | 27 Creative Studio',
  },
  description: siteContent.seo.description,
  keywords: [
    '27 Creative Studio',
    'Video Production Thoothukudi',
    'Instagram Reels Agency Tuticorin',
    'Commercial Ad Films Tamil Nadu',
    'Social Media Marketing Thoothukudi',
    'Brand Growth Studio Tirunelveli',
    'Creative Agency Thoothukudi',
    'Local Business Visibility Tamil Nadu',
    'Digital Marketing Thoothukudi',
    'Reels Shoot Thoothukudi',
    'Commercial Videography Tamil Nadu',
    'Short Form Video Agency India',
  ],
  authors: [{ name: '27 Creative Studio', url: siteUrl }],
  creator: '27 Creative Studio',
  publisher: '27 Creative Studio',
  category: 'Video Production & Digital Marketing',
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  generator: 'Next.js',
  applicationName: siteContent.seo.siteName,
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteContent.seo.ogTitle,
    description: siteContent.seo.ogDescription,
    url: siteUrl,
    siteName: siteContent.seo.siteName,
    locale: siteContent.seo.locale,
    type: 'website',
    images: [
      {
        url: '/images/og-preview.png',
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
    images: ['/images/og-preview.png'],
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
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
