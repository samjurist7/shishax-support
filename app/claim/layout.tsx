import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit a Warranty Claim',
  description: 'Submit a warranty claim for your ShishaX VOLTA. Our team reviews every submission within 1–3 business days.',
}

export default function ClaimLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
