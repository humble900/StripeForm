import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata, getSEOConfig } from '@/lib/seo'
import PricingClient from './PricingClient'

export const metadata: Metadata = generateSEOMetadata(getSEOConfig('pricing'))

// Force dynamic rendering to avoid SSR issues with useAuth
export const dynamic = 'force-dynamic'

export default function PricingPage() {
  return <PricingClient />
}
