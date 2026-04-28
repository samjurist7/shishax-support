'use client'
import { useFormContext, Controller } from 'react-hook-form'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import FieldError from './FieldError'

const COUNTRIES = [
  { c: 'US', n: 'United States' }, { c: 'GB', n: 'United Kingdom' }, { c: 'ES', n: 'Spain' },
  { c: 'DE', n: 'Germany' }, { c: 'FR', n: 'France' }, { c: 'IT', n: 'Italy' },
  { c: 'NL', n: 'Netherlands' }, { c: 'BE', n: 'Belgium' }, { c: 'AU', n: 'Australia' },
  { c: 'CA', n: 'Canada' }, { c: 'AE', n: 'UAE' }, { c: 'SA', n: 'Saudi Arabia' },
  { c: 'TR', n: 'Turkey' }, { c: 'PL', n: 'Poland' }, { c: 'SE', n: 'Sweden' },
  { c: 'NO', n: 'Norway' }, { c: 'CH', n: 'Switzerland' }, { c: 'AT', n: 'Austria' },
  { c: 'UA', n: 'Ukraine' }, { c: 'OTHER', n: 'Other' },
]

export default function Step4Details() {
  const { register, control, formState: { errors } } = useFormContext()
  const ce = (errors?.customer as any) || {}
  const ae = ce?.address || {}

  return (
    <div className="anim-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ color: '#888', fontSize: 15, marginBottom: 16 }}>How can we reach you?</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="w-label">First name *</label>
            <input className={`w-input${ce.firstName ? ' is-error' : ''}`} placeholder="First name" {...register('customer.firstName')} />
            <FieldError message={ce.firstName?.message} />
          </div>
          <div>
            <label className="w-label">Last name *</label>
            <input className={`w-input${ce.lastName ? ' is-error' : ''}`} placeholder="Last name" {...register('customer.lastName')} />
            <FieldError message={ce.lastName?.message} />
          </div>
        </div>
      </div>

      <div>
        <label className="w-label">Email address *</label>
        <input type="email" className={`w-input${ce.email ? ' is-error' : ''}`} placeholder="you@example.com" {...register('customer.email')} />
        <FieldError message={ce.email?.message} />
      </div>

      <div>
        <label className="w-label">Phone number *</label>
        <div className={`w-input${ce.phone ? ' is-error' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px' }}>
          <Controller name="customer.phone" control={control} render={({ field }) => (
            <PhoneInput international defaultCountry="US" value={field.value} onChange={field.onChange} style={{ flex: 1 }} />
          )} />
        </div>
        <FieldError message={ce.phone?.message} />
      </div>

      <div>
        <p style={{ color: '#888', fontSize: 15, marginBottom: 16 }}>Where should we send a replacement if your claim is approved?</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="w-label">Street address *</label>
            <input className={`w-input${ae.street ? ' is-error' : ''}`} placeholder="123 Main Street" {...register('customer.address.street')} />
            <FieldError message={ae.street?.message} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="w-label">City *</label>
              <input className={`w-input${ae.city ? ' is-error' : ''}`} placeholder="City" {...register('customer.address.city')} />
              <FieldError message={ae.city?.message} />
            </div>
            <div>
              <label className="w-label">State / Province / Region *</label>
              <input className={`w-input${ae.state ? ' is-error' : ''}`} placeholder="State / Province" {...register('customer.address.state')} />
              <FieldError message={ae.state?.message} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="w-label">Postal code *</label>
              <input className={`w-input${ae.postalCode ? ' is-error' : ''}`} placeholder="Postal code" {...register('customer.address.postalCode')} />
              <FieldError message={ae.postalCode?.message} />
            </div>
            <div>
              <label className="w-label">Country *</label>
              <select className={`w-select${ae.country ? ' is-error' : ''}`} {...register('customer.address.country')}>
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c.c} value={c.c}>{c.n}</option>)}
              </select>
              <FieldError message={ae.country?.message} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
