'use client'
import { useFormContext } from 'react-hook-form'
import FieldError from './FieldError'

function getWarrantyStatus(productType: string, dateStr: string) {
  if (!dateStr || !productType) return null
  const purchase = new Date(dateStr)
  const now = new Date()
  if (isNaN(purchase.getTime())) return null
  const months = productType === 'Swappable Battery' ? 6 : 12
  const expiry = new Date(purchase)
  expiry.setMonth(expiry.getMonth() + months)
  const msLeft = expiry.getTime() - now.getTime()
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24))
  return { daysLeft, expiry, within: daysLeft > 0 }
}

export default function Step3Purchase() {
  const { register, watch, formState: { errors } } = useFormContext()
  const purchaseErrors = (errors?.purchase as any) || {}
  const purchaseDate = watch('purchase.date')
  const purchaseLocation = watch('purchase.location')
  const productType = watch('product.type')
  const today = new Date().toISOString().split('T')[0]
  const fiveYearsAgo = new Date(Date.now() - 5 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const ws = getWarrantyStatus(productType, purchaseDate)

  return (
    <div className="animate-slide-in space-y-6">
      <p className="text-brand-gray" style={{ fontSize: 15 }}>When and where did you buy it?</p>

      <div>
        <label className="warranty-label">Purchase date *</label>
        <input
          type="date"
          className={`warranty-input ${purchaseErrors.date ? 'error' : ''}`}
          max={today}
          min={fiveYearsAgo}
          {...register('purchase.date', {
            validate: v => {
              if (!v) return 'This field is required.'
              if (v > today) return 'Purchase date can\'t be in the future.'
              if (v < fiveYearsAgo) return 'Purchase date can\'t be more than 5 years ago.'
              return true
            }
          })}
        />
        <FieldError message={purchaseErrors.date?.message} />

        {ws && (
          <div className={`flex items-center gap-2 mt-2 animate-fade-in px-3 py-2 rounded-lg border ${ws.within && ws.daysLeft > 30 ? 'border-green-800/40 bg-green-950/20' : ws.within ? 'border-yellow-700/40 bg-yellow-950/20' : 'border-red-800/40 bg-red-950/20'}`}>
            <div className={`w-2 h-2 rounded-full ${ws.within && ws.daysLeft > 30 ? 'bg-green-400' : ws.within ? 'bg-yellow-400' : 'bg-red-400'}`} />
            <p className={`text-sm ${ws.within && ws.daysLeft > 30 ? 'text-green-400' : ws.within ? 'text-yellow-400' : 'text-red-400'}`}>
              {ws.within
                ? `Within warranty. Expires ${ws.expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. (${ws.daysLeft} ${ws.daysLeft === 1 ? 'day' : 'days'} remaining.)`
                : "Outside warranty period. You can still submit your claim and our team will review it."}
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="warranty-label">Where did you purchase? *</label>

        {purchaseLocation === 'Authorized reseller' && (
          <div className="mb-3 p-4 rounded-lg border border-brand-border bg-brand-bg-1 animate-fade-in">
            <p className="text-brand-gray text-sm">Buying from a reseller? For the fastest resolution, we recommend contacting your reseller first. You can still submit a claim with us if needed.</p>
          </div>
        )}

        <div className="space-y-3">
          {['shishax.com', 'Authorized reseller', 'Other'].map(loc => (
            <label key={loc} className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" value={loc} {...register('purchase.location')} className="sr-only peer" />
              <div className="w-5 h-5 rounded-full border border-brand-border peer-checked:border-brand-orange flex items-center justify-center transition-colors">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-orange opacity-0 peer-checked:opacity-100 transition-opacity" style={{ opacity: purchaseLocation === loc ? 1 : 0 }} />
              </div>
              <span className="text-white text-sm group-hover:text-brand-orange transition-colors">{loc}</span>
            </label>
          ))}
        </div>
        <FieldError message={purchaseErrors.location?.message} />
      </div>

      {purchaseLocation === 'Authorized reseller' && (
        <div className="animate-fade-in">
          <label className="warranty-label">Which reseller? *</label>
          <input className={`warranty-input ${purchaseErrors.resellerName ? 'error' : ''}`} placeholder="Reseller name" {...register('purchase.resellerName')} />
          <FieldError message={purchaseErrors.resellerName?.message} />
        </div>
      )}

      <div>
        <label className="warranty-label">Was the product registered with us? *</label>
        <div className="space-y-3 mt-2">
          {[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: "I'm not sure" }].map(opt => {
            const registered = watch('purchase.registered')
            return (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                <input type="radio" value={opt.value} {...register('purchase.registered')} className="sr-only" />
                <div className="w-5 h-5 rounded-full border border-brand-border flex items-center justify-center transition-colors" style={{ borderColor: registered === opt.value ? '#FF8000' : '' }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-orange transition-opacity" style={{ opacity: registered === opt.value ? 1 : 0 }} />
                </div>
                <span className="text-white text-sm">{opt.label}</span>
              </label>
            )
          })}
        </div>
        <FieldError message={purchaseErrors.registered?.message} />
      </div>
    </div>
  )
}
