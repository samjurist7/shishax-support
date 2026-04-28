'use client'
import { useFormContext, Controller } from 'react-hook-form'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import FieldError from './FieldError'

const COUNTRIES = [
  { code: 'US', name: 'United States' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'ES', name: 'Spain' }, { code: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' }, { code: 'NL', name: 'Netherlands' }, { code: 'BE', name: 'Belgium' },
  { code: 'AU', name: 'Australia' }, { code: 'CA', name: 'Canada' }, { code: 'AE', name: 'UAE' },
  { code: 'SA', name: 'Saudi Arabia' }, { code: 'TR', name: 'Turkey' }, { code: 'PL', name: 'Poland' },
  { code: 'SE', name: 'Sweden' }, { code: 'NO', name: 'Norway' }, { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' }, { code: 'UA', name: 'Ukraine' }, { code: 'OTHER', name: 'Other' },
]

export default function Step4Details() {
  const { register, control, formState: { errors } } = useFormContext()
  const customerErrors = (errors?.customer as any) || {}
  const addressErrors = customerErrors?.address || {}

  return (
    <div className="animate-slide-in space-y-6">
      <div>
        <p className="text-brand-gray mb-4" style={{ fontSize: 15 }}>How can we reach you?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="warranty-label">First name *</label>
            <input className={`warranty-input ${customerErrors.firstName ? 'error' : ''}`} placeholder="First name" {...register('customer.firstName')} />
            <FieldError message={customerErrors.firstName?.message} />
          </div>
          <div>
            <label className="warranty-label">Last name *</label>
            <input className={`warranty-input ${customerErrors.lastName ? 'error' : ''}`} placeholder="Last name" {...register('customer.lastName')} />
            <FieldError message={customerErrors.lastName?.message} />
          </div>
        </div>
      </div>

      <div>
        <label className="warranty-label">Email address *</label>
        <input type="email" className={`warranty-input ${customerErrors.email ? 'error' : ''}`} placeholder="you@example.com" {...register('customer.email')} />
        <FieldError message={customerErrors.email?.message} />
      </div>

      <div>
        <label className="warranty-label">Phone number *</label>
        <Controller
          name="customer.phone"
          control={control}
          render={({ field }) => (
            <PhoneInput
              international
              defaultCountry="US"
              value={field.value}
              onChange={field.onChange}
              className={`warranty-input phone-input-wrapper ${customerErrors.phone ? 'error' : ''}`}
            />
          )}
        />
        <FieldError message={customerErrors.phone?.message} />
      </div>

      <div>
        <p className="text-brand-gray mb-4" style={{ fontSize: 15 }}>Where should we send a replacement if your claim is approved?</p>

        <div className="space-y-4">
          <div>
            <label className="warranty-label">Street address *</label>
            <input className={`warranty-input ${addressErrors.street ? 'error' : ''}`} placeholder="123 Main Street" {...register('customer.address.street')} />
            <FieldError message={addressErrors.street?.message} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="warranty-label">City *</label>
              <input className={`warranty-input ${addressErrors.city ? 'error' : ''}`} placeholder="City" {...register('customer.address.city')} />
              <FieldError message={addressErrors.city?.message} />
            </div>
            <div>
              <label className="warranty-label">State / Province / Region *</label>
              <input className={`warranty-input ${addressErrors.state ? 'error' : ''}`} placeholder="State / Province / Region" {...register('customer.address.state')} />
              <FieldError message={addressErrors.state?.message} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="warranty-label">Postal code *</label>
              <input className={`warranty-input ${addressErrors.postalCode ? 'error' : ''}`} placeholder="Postal code" {...register('customer.address.postalCode')} />
              <FieldError message={addressErrors.postalCode?.message} />
            </div>
            <div>
              <label className="warranty-label">Country *</label>
              <select className={`warranty-select ${addressErrors.country ? 'error' : ''}`} {...register('customer.address.country')}>
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
              <FieldError message={addressErrors.country?.message} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
