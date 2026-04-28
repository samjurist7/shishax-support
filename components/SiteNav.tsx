'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function SiteNav() {
  const path = usePathname()
  const isRegister = path === '/' || path === ''
  const isClaim = path === '/claim'

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
      <a href="https://shishax.com" style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 18, color: '#FF8000', letterSpacing: '0.1em', textDecoration: 'none' }}>
        SHISHAX
      </a>
      <div style={{ display: 'flex', gap: 4, background: '#111', border: '1px solid #2A2A2A', borderRadius: 10, padding: 4 }}>
        <Link href="/" style={{
          fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.06em',
          textTransform: 'uppercase', textDecoration: 'none', padding: '8px 16px', borderRadius: 7,
          transition: 'all 0.15s',
          background: isRegister ? 'linear-gradient(135deg, #FF8000, #F82629)' : 'transparent',
          color: isRegister ? '#fff' : '#666',
        }}>Register Warranty</Link>
        <Link href="/claim" style={{
          fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.06em',
          textTransform: 'uppercase', textDecoration: 'none', padding: '8px 16px', borderRadius: 7,
          transition: 'all 0.15s',
          background: isClaim ? 'linear-gradient(135deg, #FF8000, #F82629)' : 'transparent',
          color: isClaim ? '#fff' : '#666',
        }}>Submit a Claim</Link>
      </div>
    </nav>
  )
}
