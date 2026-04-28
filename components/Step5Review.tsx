'use client'
import { useFormContext } from 'react-hook-form'

interface Props { onGoTo: (step: number) => void; confirmChecked: boolean; onConfirmChange: (v: boolean) => void }

function Section({ title, step, onGoTo, children }: { title: string; step: number; onGoTo: (s: number) => void; children: React.ReactNode }) {
  return (
    <div className="border border-brand-border rounded-lg overflow-hidden mb-4">
      <div className="flex items-center justify-between px-5 py-3 bg-brand-bg-1 border-b border-brand-border">
        <h3 className="font-display text-white text-sm uppercase tracking-widest">{title}</h3>
        <button type="button" onClick={() => onGoTo(step)} className="font-body text-brand-orange text-xs hover:underline">Edit</button>
      </div>
      <div className="px-5 py-4 space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-4">
      <span className="text-brand-gray text-sm w-40 shrink-0">{label}</span>
      <span className="text-white text-sm">{value}</span>
    </div>
  )
}

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States', GB: 'United Kingdom', ES: 'Spain', DE: 'Germany', FR: 'France',
  IT: 'Italy', NL: 'Netherlands', BE: 'Belgium', AU: 'Australia', CA: 'Canada',
  AE: 'UAE', SA: 'Saudi Arabia', TR: 'Turkey', PL: 'Poland', SE: 'Sweden',
  NO: 'Norway', CH: 'Switzerland', AT: 'Austria', UA: 'Ukraine', OTHER: 'Other',
}

export default function Step5Review({ onGoTo, confirmChecked, onConfirmChange }: Props) {
  const { watch } = useFormContext()
  const data = watch()

  return (
    <div className="animate-slide-in">
      <p className="text-brand-gray mb-6" style={{ fontSize: 15 }}>Take a moment to make sure everything below is correct. You can edit any section before submitting.</p>

      <Section title="Product" step={0} onGoTo={onGoTo}>
        <Row label="Product" value={data.product?.type} />
        {data.product?.colorway && <Row label="Colorway" value={data.product.colorway} />}
        <Row label="Serial number" value={data.product?.serialNumber} />
      </Section>

      <Section title="Issue" step={1} onGoTo={onGoTo}>
        <Row label="Issue type" value={data.issue?.type} />
        <div className="flex gap-4">
          <span className="text-brand-gray text-sm w-40 shrink-0">Description</span>
          <span className="text-white text-sm leading-relaxed">{data.issue?.description}</span>
        </div>
        <div className="flex gap-4">
          <span className="text-brand-gray text-sm w-40 shrink-0">Attachments</span>
          <span className="text-white text-sm">{data.issue?.attachments?.length || 0} file{data.issue?.attachments?.length !== 1 ? 's' : ''} attached</span>
        </div>
      </Section>

      <Section title="Purchase" step={2} onGoTo={onGoTo}>
        <Row label="Purchase date" value={data.purchase?.date ? new Date(data.purchase.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : undefined} />
        <Row label="Purchased from" value={data.purchase?.location} />
        {data.purchase?.resellerName && <Row label="Reseller" value={data.purchase.resellerName} />}
        <Row label="Product registered" value={data.purchase?.registered === 'yes' ? 'Yes' : data.purchase?.registered === 'no' ? 'No' : "I'm not sure"} />
      </Section>

      <Section title="Your details" step={3} onGoTo={onGoTo}>
        <Row label="Name" value={`${data.customer?.firstName || ''} ${data.customer?.lastName || ''}`.trim()} />
        <Row label="Email" value={data.customer?.email} />
        <Row label="Phone" value={data.customer?.phone} />
        <Row label="Address" value={[data.customer?.address?.street, data.customer?.address?.city, data.customer?.address?.state, data.customer?.address?.postalCode, COUNTRY_NAMES[data.customer?.address?.country] || data.customer?.address?.country].filter(Boolean).join(', ')} />
      </Section>

      <label className="flex items-start gap-3 cursor-pointer mt-6 group">
        <input
          type="checkbox"
          checked={confirmChecked}
          onChange={e => onConfirmChange(e.target.checked)}
          className="mt-0.5 w-5 h-5 rounded border border-brand-border bg-brand-bg-2 accent-brand-orange cursor-pointer shrink-0"
          style={{ minWidth: 20 }}
        />
        <span className="text-white text-sm leading-relaxed">I confirm the information above is accurate.</span>
      </label>
    </div>
  )
}
