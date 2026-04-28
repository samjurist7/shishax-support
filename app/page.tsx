'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import SiteNav from '@/components/SiteNav'
import FieldError from '@/components/FieldError'

const PRODUCTS = ['VOLTA Black', 'VOLTA 24K Gold', 'Swappable Battery'] as const
const LOCATIONS = ['shishax.com', 'Authorized reseller', 'Other'] as const

const schema = z.object({
  productType: z.string().refine(v => PRODUCTS.includes(v as typeof PRODUCTS[number]), { message: 'Please select a product.' }),
  serialNumber: z.string().regex(/^[a-zA-Z0-9]{8,20}$/, 'Serial numbers are 8–20 characters, letters and numbers only.'),
  purchaseDate: z.string().min(1, 'Purchase date is required.'),
  purchaseLocation: z.string().refine(v => LOCATIONS.includes(v as typeof LOCATIONS[number]), { message: 'Please select where you purchased.' }),
  resellerName: z.string().optional(),
  otherLocation: z.string().optional(),
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().min(7, 'Enter a valid phone number.').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

function PendingScreen({ email }: { email: string }) {
  return (
    <div className="anim-fade-up" style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto', padding: '16px 0' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#111', border: '2px solid #FF8000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="10" stroke="#FF8000" strokeWidth="2"/>
          <path d="M16 10v7l4 4" stroke="#FF8000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 26, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 12 }}>REGISTRATION RECEIVED</h1>
      <p style={{ color: '#888', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
        We've received your warranty registration and our team will review it within <strong style={{ color: '#fff' }}>1–2 business days</strong>.
        Once approved, you'll get a confirmation email at <span style={{ color: '#fff' }}>{email}</span> with your registration number.
      </p>
      <div style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
        <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>
          Questions? Email us at{' '}
          <a href="mailto:sales@shishax.com" style={{ color: '#FF8000', textDecoration: 'none' }}>sales@shishax.com</a>
        </p>
      </div>
      <a href="https://shishax.com" style={{ fontSize: 14, color: '#555', textDecoration: 'none' }}>← Back to ShishaX.com</a>
    </div>
  )
}

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const fiveYearsAgo = new Date(Date.now() - 5 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  })

  const productType = watch('productType')
  const purchaseLocation = watch('purchaseLocation')

  const onSubmit = async (data: FormData) => {
    // Validate "Other" location has a description
    if (data.purchaseLocation === 'Other' && !data.otherLocation?.trim()) {
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/warranty-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        setSubmittedEmail(data.email)
        setSubmitted(true)
      } else {
        setSubmitError(json.error?.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  if (submitted) return (
    <main style={{ minHeight: '100vh', padding: '48px 20px' }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        <SiteNav />
        <PendingScreen email={submittedEmail} />
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', padding: '48px 20px' }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        <SiteNav />

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 5vw, 34px)', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 10 }}>REGISTER YOUR WARRANTY</h1>
          <p style={{ color: '#666', fontSize: 15 }}>Activate your product warranty. Takes less than 2 minutes.</p>
        </div>

        <div className="w-card">
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 24 }} noValidate>

            {/* Product */}
            <div>
              <label className="w-label">Product *</label>
              <select className={`w-select${errors.productType ? ' is-error' : ''}`} {...register('productType')} defaultValue="">
                <option value="" disabled>Select your product</option>
                {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <FieldError message={errors.productType?.message} />
            </div>

            {/* Serial number */}
            <div>
              <label className="w-label">Serial number *</label>
              <input className={`w-input${errors.serialNumber ? ' is-error' : ''}`} placeholder="e.g. SHX12345678" {...register('serialNumber')} />
              <FieldError message={errors.serialNumber?.message} />
              <p className="w-helper">Found on the bottom of your device, on the battery module, or on the original packaging.</p>
            </div>

            {/* Purchase date */}
            <div>
              <label className="w-label">Purchase date *</label>
              <input type="date" className={`w-input${errors.purchaseDate ? ' is-error' : ''}`} max={today} min={fiveYearsAgo} {...register('purchaseDate')} style={{ colorScheme: 'dark' }} />
              <FieldError message={errors.purchaseDate?.message} />
              {productType && (
                <p className="w-helper anim-fade-up">
                  {productType === 'Swappable Battery' ? '6-month' : '12-month'} warranty from your purchase date.
                </p>
              )}
            </div>

            {/* Where purchased */}
            <div>
              <label className="w-label">Purchased from *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                {LOCATIONS.map(loc => (
                  <label key={loc} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <input type="radio" value={loc} {...register('purchaseLocation')} style={{ display: 'none' }} />
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${purchaseLocation === loc ? '#FF8000' : '#2A2A2A'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 0.15s' }}>
                      {purchaseLocation === loc && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF8000' }} />}
                    </div>
                    <span style={{ fontSize: 15, color: '#fff' }}>{loc}</span>
                  </label>
                ))}
              </div>
              <FieldError message={errors.purchaseLocation?.message} />
            </div>

            {/* Reseller name */}
            {purchaseLocation === 'Authorized reseller' && (
              <div className="anim-fade-up">
                <label className="w-label">Reseller name *</label>
                <input className={`w-input${errors.resellerName ? ' is-error' : ''}`} placeholder="e.g. Smoke House NYC" {...register('resellerName')} />
                <FieldError message={errors.resellerName?.message} />
              </div>
            )}

            {/* Other location */}
            {purchaseLocation === 'Other' && (
              <div className="anim-fade-up">
                <label className="w-label">Where did you purchase? *</label>
                <input
                  className={`w-input${errors.otherLocation ? ' is-error' : ''}`}
                  placeholder="e.g. Amazon, local shop, gift, etc."
                  {...register('otherLocation', { required: purchaseLocation === 'Other' ? 'Please tell us where you purchased.' : false })}
                />
                <FieldError message={errors.otherLocation?.message} />
              </div>
            )}

            {/* Divider */}
            <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: 8 }}>
              <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', marginBottom: 20 }}>YOUR DETAILS</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="w-label">First name *</label>
                    <input className={`w-input${errors.firstName ? ' is-error' : ''}`} placeholder="First name" {...register('firstName')} />
                    <FieldError message={errors.firstName?.message} />
                  </div>
                  <div>
                    <label className="w-label">Last name *</label>
                    <input className={`w-input${errors.lastName ? ' is-error' : ''}`} placeholder="Last name" {...register('lastName')} />
                    <FieldError message={errors.lastName?.message} />
                  </div>
                </div>

                <div>
                  <label className="w-label">Email address *</label>
                  <input type="email" className={`w-input${errors.email ? ' is-error' : ''}`} placeholder="you@example.com" {...register('email')} />
                  <FieldError message={errors.email?.message} />
                  <p className="w-helper">Your confirmation email will be sent here once your registration is approved.</p>
                </div>

                <div>
                  <label className="w-label">Phone number <span style={{ color: '#444', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <input type="tel" className={`w-input${errors.phone ? ' is-error' : ''}`} placeholder="+1 (555) 000-0000" {...register('phone')} />
                  <FieldError message={errors.phone?.message} />
                </div>
              </div>
            </div>

            {submitError && (
              <div style={{ padding: '14px 16px', borderRadius: 8, background: 'rgba(248,38,41,0.06)', border: '1px solid rgba(248,38,41,0.2)' }}>
                <p style={{ color: '#fca5a5', fontSize: 14 }}>{submitError}</p>
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', marginTop: 4 }}>
              {submitting ? 'SUBMITTING…' : 'SUBMIT FOR REVIEW'}
            </button>

            <p style={{ fontSize: 13, color: '#444', textAlign: 'center' }}>
              Already registered? <a href="/claim" style={{ color: '#FF8000', textDecoration: 'none' }}>Submit a claim →</a>
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}
