import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Warranty Claim — ShishaX',
  description: 'Submit a warranty claim for your VOLTA. Our team reviews every submission within 2 business days.',
  robots: 'noindex',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
