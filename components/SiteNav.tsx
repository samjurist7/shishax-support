'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function SiteNav() {
  const path = usePathname()

  const tabs = [
    { label: 'Register Warranty', href: '/' },
    { label: 'Submit a Claim', href: '/claim' },
    { label: 'Get Support', href: '/ticket' },
  ]

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
      <a href="https://shishax.com" style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 18, color: '#FF8000', letterSpacing: '0.1em', textDecoration: 'none' }}>
        SHISHAX
      </a>
      <div style={{ display: 'flex', gap: 4, background: '#111', border: '1px solid #2A2A2A', borderRadius: 10, padding: 4, flexWrap: 'wrap' }}>
        {tabs.map(tab => {
          const active = tab.href === '/' ? path === '/' : path.startsWith(tab.href)
          return (
            <Link key={tab.href} href={tab.href} style={{
              fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.06em',
              textTransform: 'uppercase', textDecoration: 'none', padding: '8px 14px', borderRadius: 7,
              transition: 'all 0.15s',
              background: active ? 'linear-gradient(135deg, #FF8000, #F82629)' : 'transparent',
              color: active ? '#fff' : '#666',
            }}>{tab.label}</Link>
          )
        })}
      </div>
    </nav>
  )
}
