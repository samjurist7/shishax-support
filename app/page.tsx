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
import Step5Review from '@/components/Step5Review'
import SuccessScreen from '@/components/SuccessScreen'
import { generateReferenceNumber } from '@/lib/schema'

// Per-step validation fields
const STEP_FIELDS: string[][] = [
  ['product.type', 'product.serialNumber'],
  ['issue.type', 'issue.description', 'issue.attachments'],
  ['purchase.date', 'purchase.location', 'purchase.registered'],
  ['customer.firstName', 'customer.lastName', 'customer.email', 'customer.phone', 'customer.address.street', 'customer.address.city', 'customer.address.state', 'customer.address.postalCode', 'customer.address.country'],
  [],
]

const formSchema = z.object({
  product: z.object({
    type: z.string().min(1, 'This field is required.'),
    colorway: z.string().nullable().optional(),
    serialNumber: z.string().regex(/^[a-zA-Z0-9]{8,20}$/, 'Serial numbers are 8 to 20 characters, letters and numbers only.'),
  }),
  issue: z.object({
    type: z.string().min(1, 'This field is required.'),
    description: z.string().min(50, 'Add a bit more detail. Minimum 50 characters.').max(1500, 'Description is too long. Maximum 1500 characters.'),
    attachments: z.array(z.any()).min(1, 'At least one photo or video is required.'),
  }),
  purchase: z.object({
    date: z.string().min(1, 'This field is required.'),
    location: z.string().min(1, 'This field is required.'),
    resellerName: z.string().nullable().optional(),
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
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: { type: '', colorway: null, serialNumber: '' },
      issue: { type: '', description: '', attachments: [] },
      purchase: { date: '', location: '', resellerName: null, registered: '' },
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
      const productType = data.product.type
      const purchaseDate = data.purchase.date
      const months = productType === 'Swappable Battery' ? 6 : 12
      const expiry = new Date(purchaseDate); expiry.setMonth(expiry.getMonth() + months)
      const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / 86400000)

      const payload = {
        ...data,
        meta: { warrantyStatus: daysLeft > 0 ? 'within' : 'expired', daysRemaining: daysLeft, submittedAt: new Date().toISOString(), userAgent: navigator.userAgent }
      }

      const res = await fetch('/api/warranty-claims', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()

      if (json.success) {
        const ref = json.referenceNumber || generateReferenceNumber()
        sessionStorage.setItem('shishax_warranty_ref', ref)
        sessionStorage.setItem('shishax_warranty_email', data.customer.email)
        setRefNumber(ref)
        setSubmitted(true)
      } else {
        setSubmitError(true)
      }
    } catch {
      setSubmitError(true)
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <main className="min-h-screen px-5 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <header className="text-center mb-10">
            <a href="https://shishax.com" className="font-display font-bold text-brand-orange text-xl tracking-widest">SHISHAX</a>
          </header>
          <SuccessScreen referenceNumber={refNumber} email={methods.getValues('customer.email')} />
        </div>
      </main>
    )
  }

  if (ceramicReject) {
    return (
      <main className="min-h-screen px-5 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <header className="text-center mb-10">
            <a href="https://shishax.com" className="font-display font-bold text-brand-orange text-xl tracking-widest">SHISHAX</a>
            <h1 className="font-display font-bold text-white text-2xl md:text-3xl uppercase tracking-wide mt-3">WARRANTY CLAIM</h1>
          </header>
          <div className="bg-brand-bg-1 border border-brand-border rounded-xl p-8 animate-fade-in">
            <h2 className="font-display font-bold text-white text-xl mb-4">Ceramic chambers are not covered under warranty</h2>
            <p className="text-brand-gray leading-relaxed mb-8" style={{ fontSize: 15 }}>
              Ceramic chambers are designed for repeated multi-session use, but they're a consumable accessory and don't carry warranty coverage. If you're experiencing a different issue or need help, contact us directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="mailto:sales@shishax.com" className="btn-primary text-center">Email sales@shishax.com</a>
              <button onClick={() => { setCeramicReject(false); methods.setValue('product.type', '') }} className="btn-secondary">Back</button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-5 py-12 md:py-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <a href="https://shishax.com" className="font-display font-bold text-brand-orange text-xl tracking-widest">SHISHAX</a>
          <h1 className="font-display font-bold text-white text-2xl md:text-4xl uppercase tracking-wide mt-3">WARRANTY CLAIM</h1>
          <p className="text-brand-gray mt-2" style={{ fontSize: 15 }}>Submit a claim for your VOLTA in 5 steps. We review every submission within 2 business days.</p>
        </header>

        {/* Progress */}
        <ProgressIndicator current={step} onGoTo={setStep} />

        {/* Form card */}
        <div className="bg-brand-bg-1 border border-brand-border rounded-xl p-6 md:p-8">
          <h2 className="font-display font-bold text-white text-xl md:text-2xl uppercase tracking-wide mb-6">
            {['PRODUCT', 'ISSUE', 'PURCHASE', 'YOUR DETAILS', 'REVIEW'][step]}
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
          <div className="mt-4 p-4 bg-red-950/30 border border-red-800/40 rounded-lg animate-fade-in">
            <p className="text-white font-body font-medium mb-1">Something went wrong</p>
            <p className="text-brand-gray text-sm">We couldn't submit your claim. Please try again. If the problem continues, email <a href="mailto:sales@shishax.com" className="text-brand-orange hover:underline">sales@shishax.com</a> directly.</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          {step > 0
            ? <button onClick={() => setStep(s => s - 1)} className="btn-secondary">BACK</button>
            : <div />
          }
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
