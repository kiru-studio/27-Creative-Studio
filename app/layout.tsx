import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Syne, Space_Grotesk, Martian_Mono } from 'next/font/google'
import { siteContent, getSiteBaseUrl } from '@/lib/site-content'
import { CookieBanner } from '@/components/ui/cookie-banner'
import { AnalyticsTracker } from '@/components/analytics-tracker'
import './globals.css'

const displayFont = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-syne',
  weight: ['700', '800'],
})

const bodyFont = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
})

const monoFont = Martian_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-martian-mono',
  weight: ['400', '700'],
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
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'google45f4cf06452d5046',
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
    <html lang="en" className="bg-[#0B0B0B] text-[#FF2DA8]">
      <body className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} antialiased bg-[#0B0B0B] text-[#FF2DA8] selection:bg-[#FF2DA8] selection:text-[#0B0B0B]`}>
        {/* Global SVG Duotone Shaders (Strict 3-Colour Law: Jet Black #0B0B0B, Hot Pink #FF2DA8, Chartreuse #D4FF3F) */}
        <svg className="sr-only" aria-hidden="true" width="0" height="0">
          <defs>
            {/* Duotone: Jet Black (#0B0B0B) to Hot Pink (#FF2DA8) */}
            <filter id="duotone-pink" colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0
                                                   0.2126 0.7152 0.0722 0 0
                                                   0.2126 0.7152 0.0722 0 0
                                                   0      0      0      1 0" />
              <feComponentTransfer>
                <feFuncR type="table" tableValues="0.043 1.000" />
                <feFuncG type="table" tableValues="0.043 0.176" />
                <feFuncB type="table" tableValues="0.043 0.658" />
              </feComponentTransfer>
            </filter>

            {/* Duotone: Jet Black (#0B0B0B) to Chartreuse (#D4FF3F) */}
            <filter id="duotone-chartreuse" colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0
                                                   0.2126 0.7152 0.0722 0 0
                                                   0.2126 0.7152 0.0722 0 0
                                                   0      0      0      1 0" />
              <feComponentTransfer>
                <feFuncR type="table" tableValues="0.043 0.831" />
                <feFuncG type="table" tableValues="0.043 1.000" />
                <feFuncB type="table" tableValues="0.043 0.247" />
              </feComponentTransfer>
            </filter>
          </defs>
        </svg>

        {children}
        <CookieBanner />
        <AnalyticsTracker />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
