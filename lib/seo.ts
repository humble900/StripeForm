import { Metadata } from 'next'

export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  noIndex?: boolean
  structuredData?: any
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonical,
    ogImage = 'https://stripeform.app/og-image.png',
    ogType = 'website',
    noIndex = false
  } = config

  const fullTitle = title.includes('StripeForm') ? title : `${title} | StripeForm`
  const canonicalUrl = canonical || 'https://stripeform.app'

  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: ogType,
      locale: 'en_US',
      url: canonicalUrl,
      siteName: 'StripeForm',
      title: fullTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@stripeform',
      creator: '@stripeform',
      title: fullTitle,
      description,
      images: [ogImage],
    },
  }
}

// Predefined SEO configurations for common pages
export const seoConfigs = {
  home: {
    title: 'StripeForm - Create Beautiful Forms',
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
    ],
    canonical: 'https://stripeform.app'
  },

  pricing: {
    title: 'Pricing - Simple & Transparent',
    description: 'Choose the perfect plan for your form building needs. Free plan available with 5 forms. Pro plan with unlimited forms, advanced analytics, and custom branding.',
    keywords: [
      'form builder pricing',
      'survey tool pricing',
      'online form pricing',
      'form builder plans',
      'free form builder',
      'pro form builder',
      'form builder subscription',
      'form builder cost'
    ],
    canonical: 'https://stripeform.app/pricing'
  },

  features: {
    title: 'Features - Everything You Need',
    description: 'Discover all the powerful features that make StripeForm the best form builder. Drag & drop interface, real-time preview, analytics, custom branding, and more.',
    keywords: [
      'form builder features',
      'survey tool features',
      'form builder capabilities',
      'drag and drop forms',
      'form analytics',
      'custom form branding',
      'form templates',
      'form validation',
      'mobile form builder',
      'responsive forms'
    ],
    canonical: 'https://stripeform.app/features'
  },

  faq: {
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about StripeForm. Learn about features, pricing, integrations, and how to get the most out of our form builder.',
    keywords: [
      'form builder FAQ',
      'survey tool help',
      'form builder questions',
      'StripeForm help',
      'form builder support',
      'how to use form builder',
      'form builder tutorial'
    ],
    canonical: 'https://stripeform.app/faq'
  },

  contact: {
    title: 'Contact Us - Get in Touch',
    description: 'Get in touch with our team. We\'re here to help you create amazing forms. Contact us for support, sales inquiries, or partnership opportunities.',
    keywords: [
      'contact form builder',
      'form builder support',
      'StripeForm contact',
      'form builder help',
      'customer support',
      'sales inquiry',
      'partnership'
    ],
    canonical: 'https://stripeform.app/contact'
  },

  about: {
    title: 'About Us - Our Story',
    description: 'Learn about StripeForm\'s mission to make form building simple and beautiful. Discover our story, values, and commitment to helping you create better forms.',
    keywords: [
      'about StripeForm',
      'form builder company',
      'our story',
      'company mission',
      'form builder team',
      'StripeForm values'
    ],
    canonical: 'https://stripeform.app/about'
  },

  privacy: {
    title: 'Privacy Policy',
    description: 'Read our privacy policy to understand how we collect, use, and protect your data when you use StripeForm.',
    keywords: [
      'privacy policy',
      'data protection',
      'GDPR compliance',
      'user privacy',
      'data security'
    ],
    canonical: 'https://stripeform.app/privacy'
  },

  terms: {
    title: 'Terms of Service',
    description: 'Read our terms of service to understand the rules and guidelines for using StripeForm.',
    keywords: [
      'terms of service',
      'user agreement',
      'terms and conditions',
      'legal terms'
    ],
    canonical: 'https://stripeform.app/terms'
  },

  login: {
    title: 'Sign In to Your Account',
    description: 'Sign in to your StripeForm account to access your forms, analytics, and settings.',
    keywords: [
      'sign in',
      'login',
      'account access',
      'user login'
    ],
    canonical: 'https://stripeform.app/login',
    noIndex: true
  },

  register: {
    title: 'Create Your Account',
    description: 'Join StripeForm and start creating beautiful forms. Sign up for free and get access to our powerful form builder.',
    keywords: [
      'sign up',
      'register',
      'create account',
      'join StripeForm',
      'free account'
    ],
    canonical: 'https://stripeform.app/register',
    noIndex: true
  },

  dashboard: {
    title: 'Dashboard - Your Forms',
    description: 'Manage your forms, view analytics, and access all your StripeForm features from your dashboard.',
    keywords: [
      'dashboard',
      'form management',
      'form analytics',
      'user dashboard'
    ],
    canonical: 'https://stripeform.app/dashboard',
    noIndex: true
  },

  builder: {
    title: 'Form Builder - Create Forms',
    description: 'Build beautiful, interactive forms with our drag-and-drop form builder. No coding required.',
    keywords: [
      'form builder',
      'create forms',
      'drag and drop',
      'form designer',
      'build forms'
    ],
    canonical: 'https://stripeform.app/builder',
    noIndex: true
  },

  admin: {
    title: 'Admin Dashboard - System Management',
    description: 'Comprehensive admin dashboard for managing users, support tickets, notifications, and system analytics.',
    keywords: [
      'admin dashboard',
      'system management',
      'support tickets',
      'user management',
      'analytics',
      'notifications'
    ],
    canonical: 'https://stripeform.app/admin',
    noIndex: true
  }
}

// Helper function to get SEO config by page
export function getSEOConfig(page: keyof typeof seoConfigs): SEOConfig {
  return seoConfigs[page]
}
