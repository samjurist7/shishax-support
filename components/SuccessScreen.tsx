'use client'
import { useEffect, useRef, useState } from 'react'

interface Props { referenceNumber: string; email: string }

export default function SuccessScreen({ referenceNumber, email }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => { headingRef.current?.focus() }, [])

  const copy = () => {
    navigator.clipboard.writeText(referenceNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="animate-fade-in text-center max-w-lg mx-auto py-8">
      {/* Animated checkmark */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF8000, #F82629)' }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path
            d="M8 18l7 7 13-13"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="100"
            className="animate-draw"
          />
        </svg>
      </div>

      <h1 ref={headingRef} tabIndex={-1} className="font-display font-bold text-white text-3xl md:text-4xl uppercase tracking-wide mb-4 outline-none">
        CLAIM SUBMITTED
      </h1>

      <p className="text-brand-gray mb-8 leading-relaxed" style={{ fontSize: 15 }}>
        Thanks for reaching out. We've received your warranty claim and our team will review it within 2 business days.
        You'll get an email at <span className="text-white">{email}</span> when we have an update.
      </p>

      {/* Reference number */}
      <div className="bg-brand-bg-1 border border-brand-border rounded-xl p-6 mb-6">
        <p className="warranty-label mb-2 text-center">YOUR REFERENCE NUMBER</p>
        <p className="font-mono text-3xl text-brand-orange tracking-widest mb-4">{referenceNumber}</p>
        <p className="text-brand-gray text-sm mb-4">Save your reference number in case you need to follow up.</p>
        <button onClick={copy} className="btn-primary w-full">
          {copied ? 'COPIED ✓' : 'COPY REFERENCE NUMBER'}
        </button>
      </div>

      <a href="https://shishax.com" className="btn-secondary block w-full text-center">BACK TO SHISHAX.COM</a>
    </div>
  )
}
