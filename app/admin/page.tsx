import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata, getSEOConfig } from '@/lib/seo'
import AdminClient from './AdminClient'
import { AdminAuthProvider } from '@/components/providers/AdminAuthProvider'

export const metadata: Metadata = generateSEOMetadata(getSEOConfig('admin'))

export default function AdminPage() {
  return (
    <AdminAuthProvider>
      <AdminClient />
    </AdminAuthProvider>
  )
}
