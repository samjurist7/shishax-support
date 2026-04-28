'use client'
import { useFormContext } from 'react-hook-form'

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States', GB: 'United Kingdom', ES: 'Spain', DE: 'Germany', FR: 'France',
  IT: 'Italy', NL: 'Netherlands', BE: 'Belgium', AU: 'Australia', CA: 'Canada',
  AE: 'UAE', SA: 'Saudi Arabia', TR: 'Turkey', PL: 'Poland', SE: 'Sweden',
  NO: 'Norway', CH: 'Switzerland', AT: 'Austria', UA: 'Ukraine', OTHER: 'Other',
}

function Section({ title, step, onGoTo, children }: { title: string; step: number; onGoTo: (s: number) => void; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid #2A2A2A', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#0F0F0F', borderBottom: '1px solid #2A2A2A' }}>
        <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff' }}>{title}</span>
        <button type="button" onClick={() => onGoTo(step)} style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: '#FF8000', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <span style={{ fontSize: 14, color: '#666', width: 140, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#ddd', flex: 1 }}>{value}</span>
    </div>
  )
}

export default function Step5Review({ onGoTo, confirmChecked, onConfirmChange }: { onGoTo: (s: number) => void; confirmChecked: boolean; onConfirmChange: (v: boolean) => void }) {
  const { watch } = useFormContext()
  const d = watch()

  return (
    <div className="anim-slide-in">
      <p style={{ color: '#888', fontSize: 15, marginBottom: 24 }}>Take a moment to make sure everything below is correct. You can edit any section before submitting.</p>

      <Section title="Product" step={0} onGoTo={onGoTo}>
        <Row label="Product" value={d.product?.type} />
        {d.product?.colorway && <Row label="Colorway" value={d.product.colorway} />}
        <Row label="Serial number" value={d.product?.serialNumber} />
      </Section>

      <Section title="Issue" step={1} onGoTo={onGoTo}>
        <Row label="Issue type" value={d.issue?.type} />
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 14, color: '#666', width: 140, flexShrink: 0 }}>Description</span>
          <span style={{ fontSize: 14, color: '#ddd', flex: 1, lineHeight: 1.6 }}>{d.issue?.description}</span>
        </div>
        <Row label="Attachments" value={`${d.issue?.attachments?.length || 0} file${d.issue?.attachments?.length !== 1 ? 's' : ''} attached`} />
      </Section>

      <Section title="Purchase" step={2} onGoTo={onGoTo}>
        <Row label="Purchase date" value={d.purchase?.date ? new Date(d.purchase.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : undefined} />
        <Row label="Purchased from" value={d.purchase?.location} />
        {d.purchase?.resellerName && <Row label="Reseller" value={d.purchase.resellerName} />}
        <Row label="Registered" value={d.purchase?.registered === 'yes' ? 'Yes' : d.purchase?.registered === 'no' ? 'No' : "I'm not sure"} />
      </Section>

      <Section title="Your details" step={3} onGoTo={onGoTo}>
        <Row label="Name" value={`${d.customer?.firstName || ''} ${d.customer?.lastName || ''}`.trim()} />
        <Row label="Email" value={d.customer?.email} />
        <Row label="Phone" value={d.customer?.phone} />
        <Row label="Address" value={[d.customer?.address?.street, d.customer?.address?.city, d.customer?.address?.state, d.customer?.address?.postalCode, COUNTRY_NAMES[d.customer?.address?.country] || d.customer?.address?.country].filter(Boolean).join(', ')} />
      </Section>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginTop: 8 }}>
        <div
          onClick={() => onConfirmChange(!confirmChecked)}
          style={{ width: 20, height: 20, minWidth: 20, borderRadius: 5, border: `2px solid ${confirmChecked ? '#FF8000' : '#2A2A2A'}`, background: confirmChecked ? '#FF8000' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', marginTop: 2 }}
        >
          {confirmChecked && <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </div>
        <span style={{ fontSize: 15, color: '#ccc', lineHeight: 1.5 }}>I confirm the information above is accurate.</span>
      </label>
    </div>
  )
}
