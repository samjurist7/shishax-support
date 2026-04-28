'use client'
import { useFormContext } from 'react-hook-form'
import FieldError from './FieldError'

function getWarrantyStatus(productType: string, dateStr: string) {
  if (!dateStr || !productType || productType === 'Ceramic Chambers') return null
  const purchase = new Date(dateStr)
  if (isNaN(purchase.getTime())) return null
  const months = productType === 'Swappable Battery' ? 6 : 12
  const expiry = new Date(purchase)
  expiry.setMonth(expiry.getMonth() + months)
  const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / 86400000)
  return { daysLeft, expiry, within: daysLeft > 0 }
}

export default function Step3Purchase() {
  const { register, watch, formState: { errors } } = useFormContext()
  const purchaseErrors = (errors?.purchase as any) || {}
  const purchaseDate = watch('purchase.date')
  const purchaseLocation = watch('purchase.location')
  const registered = watch('purchase.registered')
  const productType = watch('product.type')
  const today = new Date().toISOString().split('T')[0]
  const fiveYearsAgo = new Date(Date.now() - 5 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const ws = getWarrantyStatus(productType, purchaseDate)

  const pillColor = ws ? (ws.within && ws.daysLeft > 30 ? { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)', dot: '#22c55e', text: '#86efac' } : ws.within ? { bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.25)', dot: '#eab308', text: '#fde68a' } : { bg: 'rgba(248,38,41,0.08)', border: 'rgba(248,38,41,0.2)', dot: '#F82629', text: '#fca5a5' }) : null

  return (
    <div className="anim-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <p style={{ color: '#888', fontSize: 15 }}>When and where did you buy it?</p>

      <div>
        <label className="w-label">Purchase date *</label>
        <input type="date" className={`w-input${purchaseErrors.date ? ' is-error' : ''}`} max={today} min={fiveYearsAgo}
          {...register('purchase.date', {
            validate: v => {
              if (!v) return 'This field is required.'
              if (v > today) return "Purchase date can't be in the future."
              if (v < fiveYearsAgo) return "Purchase date can't be more than 5 years ago."
              return true
            }
          })}
          style={{ colorScheme: 'dark' }}
        />
        <FieldError message={purchaseErrors.date?.message} />

        {ws && pillColor && (
          <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 10, padding: '10px 14px', borderRadius: 8, background: pillColor.bg, border: `1px solid ${pillColor.border}` }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: pillColor.dot, marginTop: 5, flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: pillColor.text, lineHeight: 1.5 }}>
              {ws.within
                ? `Within warranty. Expires ${ws.expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. (${ws.daysLeft} ${ws.daysLeft === 1 ? 'day' : 'days'} remaining.)`
                : "Outside warranty period. You can still submit your claim and our team will review it."}
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="w-label">Where did you purchase? *</label>

        {purchaseLocation === 'Authorized reseller' && (
          <div className="anim-fade-up" style={{ marginBottom: 12, padding: '12px 16px', borderRadius: 8, background: 'rgba(255,128,0,0.05)', border: '1px solid rgba(255,128,0,0.2)' }}>
            <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.5 }}>Buying from a reseller? For the fastest resolution, we recommend contacting your reseller first. You can still submit a claim with us if needed.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['shishax.com', 'Authorized reseller', 'Other'].map(loc => (
            <label key={loc} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input type="radio" value={loc} {...register('purchase.location')} style={{ display: 'none' }} />
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${purchaseLocation === loc ? '#FF8000' : '#2A2A2A'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 0.15s' }}>
                {purchaseLocation === loc && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF8000' }} />}
              </div>
              <span style={{ fontSize: 15, color: '#fff' }}>{loc}</span>
            </label>
          ))}
        </div>
        <FieldError message={purchaseErrors.location?.message} />
      </div>

      {purchaseLocation === 'Authorized reseller' && (
        <div className="anim-fade-up">
          <label className="w-label">Which reseller? *</label>
          <input className={`w-input${purchaseErrors.resellerName ? ' is-error' : ''}`} placeholder="Reseller name" {...register('purchase.resellerName')} />
          <FieldError message={purchaseErrors.resellerName?.message} />
        </div>
      )}

      {purchaseLocation === 'Other' && (
        <div className="anim-fade-up">
          <label className="w-label">Where did you purchase? *</label>
          <input
            className={`w-input${purchaseErrors.otherLocation ? ' is-error' : ''}`}
            placeholder="e.g. Amazon, local shop, gift, etc."
            {...register('purchase.otherLocation', {
              required: purchaseLocation === 'Other' ? 'Please tell us where you purchased.' : false,
            })}
          />
          <FieldError message={purchaseErrors.otherLocation?.message} />
        </div>
      )}

      <div>
        <label className="w-label">Was the product registered with us? *</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          {[{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }, { v: 'unsure', l: "I'm not sure" }].map(opt => (
            <label key={opt.v} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input type="radio" value={opt.v} {...register('purchase.registered')} style={{ display: 'none' }} />
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${registered === opt.v ? '#FF8000' : '#2A2A2A'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 0.15s' }}>
                {registered === opt.v && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF8000' }} />}
              </div>
              <span style={{ fontSize: 15, color: '#fff' }}>{opt.l}</span>
            </label>
          ))}
        </div>
        <FieldError message={purchaseErrors.registered?.message} />
      </div>
    </div>
  )
}
