'use client'
import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import ProgressIndicator from '@/components/ProgressIndicator'
import Step1Product from '@/components/Step1Product'
import Step2Issue from '@/components/Step2Issue'
import Step3Purchase from '@/components/Step3Purchase'
import Step4Details from '@/components/Step4Details'
import SiteNav from '@/components/SiteNav'
import Step5Review from '@/components/Step5Review'
import SuccessScreen from '@/components/SuccessScreen'
import { generateReferenceNumber } from '@/lib/schema'

const STEP_FIELDS: string[][] = [
  ['product.type', 'product.serialNumber'],
  ['issue.type', 'issue.description', 'issue.attachments'],
  ['purchase.date', 'purchase.location', 'purchase.otherLocation', 'purchase.registered'],
  ['customer.firstName', 'customer.lastName', 'customer.email', 'customer.phone', 'customer.address.street', 'customer.address.city', 'customer.address.state', 'customer.address.postalCode', 'customer.address.country'],
  [],
]

const STEP_TITLES = ['PRODUCT', 'ISSUE', 'PURCHASE', 'YOUR DETAILS', 'REVIEW']

const schema = z.object({
  product: z.object({
    type: z.string().min(1, 'This field is required.'),
    colorway: z.string().nullable().optional(),
    serialNumber: z.string().regex(/^[a-zA-Z0-9]{8,20}$/, 'Serial numbers are 8 to 20 characters, letters and numbers only.'),
  }),
  issue: z.object({
    type: z.string().min(1, 'This field is required.'),
    description: z.string().min(50, 'Add a bit more detail. Minimum 50 characters.').max(1500, 'Description is too long. Maximum 1500 characters.'),
    attachments: z.array(z.any()).optional().default([]),
  }),
  purchase: z.object({
    date: z.string().min(1, 'This field is required.'),
    location: z.string().min(1, 'This field is required.'),
    resellerName: z.string().nullable().optional(),
    otherLocation: z.string().optional(),
    registered: z.string().min(1, 'This field is required.'),
  }),
  customer: z.object({
    firstName: z.string().min(1, 'This field is required.'),
    lastName: z.string().min(1, 'This field is required.'),
    email: z.string().email('Enter a valid email address.'),
    phone: z.string().min(7, 'Enter a valid phone number with country code.'),
    address: z.object({
      street: z.string().min(1, 'This field is required.'),
      city: z.string().min(1, 'This field is required.'),
      state: z.string().min(1, 'This field is required.'),
      postalCode: z.string().min(1, 'This field is required.'),
      country: z.string().min(1, 'This field is required.'),
    }),
  }),
})

export default function WarrantyPage() {
  const [step, setStep] = useState(0)
  const [ceramicReject, setCeramicReject] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [refNumber, setRefNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmChecked, setConfirmChecked] = useState(false)

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      product: { type: '', colorway: null, serialNumber: '' },
      issue: { type: '', description: '', attachments: [] },
      purchase: { date: '', location: '', resellerName: null, otherLocation: '', registered: '' },
      customer: { firstName: '', lastName: '', email: '', phone: '', address: { street: '', city: '', state: '', postalCode: '', country: '' } },
    },
    mode: 'onBlur',
  })

  const { trigger, getValues } = methods

  const handleContinue = async () => {
    const fields = STEP_FIELDS[step] as any[]
    const valid = fields.length === 0 ? true : await trigger(fields)
    if (valid) setStep(s => Math.min(s + 1, 4))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(false)
    try {
      const data = getValues()
      const months = data.product.type === 'Swappable Battery' ? 6 : 12
      const expiry = new Date(data.purchase.date); expiry.setMonth(expiry.getMonth() + months)
      const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / 86400000)

      const payload = { ...data, meta: { warrantyStatus: daysLeft > 0 ? 'within' : 'expired', daysRemaining: daysLeft, submittedAt: new Date().toISOString(), userAgent: navigator.userAgent } }

      const res = await fetch('/api/warranty-claims', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()

      if (json.success) {
        const ref = json.referenceNumber || generateReferenceNumber()
        sessionStorage.setItem('shishax_warranty_ref', ref)
        sessionStorage.setItem('shishax_warranty_email', data.customer.email)
        setRefNumber(ref)
        setSubmitted(true)
      } else { setSubmitError(true) }
    } catch { setSubmitError(true) }
    setSubmitting(false)
  }

  // ── Success ──
  if (submitted) return (
    <main style={{ minHeight: '100vh', padding: '48px 20px' }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        <SiteNav />
        <SuccessScreen referenceNumber={refNumber} email={methods.getValues('customer.email')} />
      </div>
    </main>
  )

  // ── Ceramic soft reject ──
  if (ceramicReject) return (
    <main style={{ minHeight: '100vh', padding: '48px 20px' }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        <SiteNav />
        <div className="w-card anim-fade-up">
          <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 16, lineHeight: 1.4 }}>Ceramic chambers are not covered under warranty</h2>
          <p style={{ color: '#888', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
            Ceramic chambers are designed for repeated multi-session use, but they're a consumable accessory and don't carry warranty coverage. If you're experiencing a different issue or need help, contact us directly.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <a href="mailto:sales@shishax.com" className="btn-primary">Email sales@shishax.com</a>
            <button onClick={() => { setCeramicReject(false); methods.setValue('product.type', '') }} className="btn-secondary">Back</button>
          </div>
        </div>
      </div>
    </main>
  )

  // ── Main form ──
  return (
    <main style={{ minHeight: '100vh', padding: '48px 20px' }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        <SiteNav />
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(24px, 5vw, 36px)', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 10 }}>WARRANTY CLAIM</h1>
          <p style={{ color: '#666', fontSize: 15 }}>Submit a claim for your VOLTA in 5 steps. We review every submission within 1–3 business days.</p>
        </div>

        {/* Progress */}
        <ProgressIndicator current={step} onGoTo={setStep} />

        {/* Card */}
        <div className="w-card">
          <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 20, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 28 }}>
            {STEP_TITLES[step]}
          </h2>

          <FormProvider {...methods}>
            <form onSubmit={e => e.preventDefault()}>
              {step === 0 && <Step1Product onCeramicReject={() => setCeramicReject(true)} />}
              {step === 1 && <Step2Issue />}
              {step === 2 && <Step3Purchase />}
              {step === 3 && <Step4Details />}
              {step === 4 && <Step5Review onGoTo={setStep} confirmChecked={confirmChecked} onConfirmChange={setConfirmChecked} />}
            </form>
          </FormProvider>
        </div>

        {/* Submit error */}
        {submitError && (
          <div className="anim-fade-up" style={{ marginTop: 16, padding: '16px 20px', borderRadius: 10, background: 'rgba(248,38,41,0.06)', border: '1px solid rgba(248,38,41,0.2)' }}>
            <p style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>Something went wrong</p>
            <p style={{ color: '#888', fontSize: 14 }}>We couldn't submit your claim. Please try again. If the problem continues, email <a href="mailto:sales@shishax.com" style={{ color: '#FF8000' }}>sales@shishax.com</a> directly.</p>
          </div>
        )}

        {/* Nav */}
        <div style={{ display: 'flex', justifyContent: step > 0 ? 'space-between' : 'flex-end', marginTop: 24, gap: 12 }}>
          {step > 0 && <button onClick={() => setStep(s => s - 1)} className="btn-secondary">BACK</button>}
          {step < 4
            ? <button onClick={handleContinue} className="btn-primary">CONTINUE</button>
            : <button onClick={handleSubmit} disabled={!confirmChecked || submitting} className="btn-primary">
                {submitting ? 'SUBMITTING…' : 'SUBMIT CLAIM'}
              </button>
          }
        </div>
      </div>
    </main>
  )
}
