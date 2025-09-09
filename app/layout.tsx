import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers/Providers'
import { ConditionalToaster } from '@/components/ui/ConditionalToaster'
import { ConditionalNavigation } from '@/components/layout/ConditionalNavigation'
import { getStructuredData, getOrganizationData } from './structured-data'
import { FloatingWhatsAppButton } from '@/components/ui/WhatsAppButton'
import { ConditionalProviders } from '@/components/providers/ConditionalProviders'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { NotificationProvider } from '@/components/providers/NotificationProvider'

const inter = Inter({ 
  subsets: ['latin'],
  fallback: ['system-ui', 'arial']
})

export const metadata = {
  title: {
    default: 'StripeForm - Create Beautiful Forms',
    template: '%s | StripeForm'
  },
  description: 'Design forms people love to fill. Create beautiful, interactive forms that get higher response rates. No coding required. Build surveys, questionnaires, and data collection forms with our modern form builder.',
  keywords: [
    'form builder',
    'survey maker',
    'online forms',
    'questionnaire creator',
    'data collection',
    'interactive forms',
    'conversational forms',
    'typeform alternative',

    'lead generation forms',
    'contact forms',
    'registration forms',
    'feedback forms',
    'web forms',
    'form design',
    'form analytics',
    'form responses',
    'form validation',
    'mobile forms'
  ].join(', '),
  authors: [{ name: 'StripeForm', url: 'https://stripeform.app' }],
  creator: 'StripeForm',
  publisher: 'StripeForm',
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: 'https://stripeform.app',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://stripeform.app',
    siteName: 'StripeForm',
    title: 'StripeForm - Create Beautiful Forms',
    description: 'Design forms people love to fill. Create beautiful, interactive forms that get higher response rates. No coding required.',
    images: [
      {
        url: 'https://stripeform.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'StripeForm - Create Beautiful Forms',
        type: 'image/png',
      },
      {
        url: 'https://stripeform.app/og-image-square.png',
        width: 600,
        height: 600,
        alt: 'StripeForm Logo',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@stripeform',
    creator: '@stripeform',
    title: 'StripeForm - Create Beautiful Forms',
    description: 'Design forms people love to fill. Create beautiful, interactive forms that get higher response rates.',
    images: ['https://stripeform.app/og-image.png'],
  },
  other: {
    'application-name': 'StripeForm',
    'apple-mobile-web-app-title': 'StripeForm',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'msapplication-config': '/browserconfig.xml',
    'msapplication-TileColor': '#6C5CE7',
    'msapplication-tap-highlight': 'no',
    'theme-color': '#6C5CE7',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Favicon and app icons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style" />
        <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" /></noscript>
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Cache control and performance */}
        <meta httpEquiv="Cache-Control" content="max-age=86400" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Structured data for better SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getStructuredData())
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationData())
          }}
        />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        <NotificationProvider>
          <AuthProvider>
            <ConditionalProviders>
              <div className="min-h-screen bg-gray-50">
                <ConditionalNavigation />
                {children}
              </div>
              <ConditionalToaster />
              <FloatingWhatsAppButton />
            </ConditionalProviders>
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  )
} 