'use client'
import { useEffect, useRef, useState } from 'react'

export default function SuccessScreen({ referenceNumber, email }: { referenceNumber: string; email: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => { headingRef.current?.focus() }, [])

  const copy = () => {
    navigator.clipboard.writeText(referenceNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="anim-fade-up" style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto', padding: '32px 0' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #FF8000, #F82629)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M7 16l6 6 12-12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="anim-draw" />
        </svg>
      </div>

      <h1 ref={headingRef} tabIndex={-1} style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 32, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 16, outline: 'none' }}>
        CLAIM SUBMITTED
      </h1>

      <p style={{ color: '#888', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
        Thanks for reaching out. We've received your warranty claim and our team will review it within 2 business days.
        You'll get an email at <span style={{ color: '#fff' }}>{email}</span> when we have an update.
      </p>

      <div style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: 12, padding: '28px 32px', marginBottom: 16 }}>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666', marginBottom: 12 }}>YOUR REFERENCE NUMBER</p>
        <p style={{ fontFamily: 'monospace', fontSize: 28, color: '#FF8000', letterSpacing: '0.1em', marginBottom: 8 }}>{referenceNumber}</p>
        <p style={{ fontSize: 13, color: '#555', marginBottom: 20 }}>Save your reference number in case you need to follow up.</p>
        <button onClick={copy} className="btn-primary" style={{ width: '100%' }}>
          {copied ? 'COPIED ✓' : 'COPY REFERENCE NUMBER'}
        </button>
      </div>

      <a href="https://shishax.com" className="btn-secondary" style={{ display: 'block', width: '100%', textAlign: 'center' }}>BACK TO SHISHAX.COM</a>
    </div>
  )
}
