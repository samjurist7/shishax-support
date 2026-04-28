import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit a Support Ticket',
  description: 'Get help with your VOLTA device, app, order, or return. Our support team typically responds within 1–2 business days.',
  robots: 'noindex, nofollow',
}

export default function TicketLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
