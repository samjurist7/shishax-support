'use client'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import FieldError from './FieldError'

const PRODUCTS = ['VOLTA Black', 'VOLTA 24K Gold', 'Swappable Battery', 'Ceramic Chambers'] as const

export default function Step1Product({ onCeramicReject }: { onCeramicReject: () => void }) {
  const { register, watch, setValue, formState: { errors } } = useFormContext()
  const productType = watch('product.type')
  const productErrors = (errors?.product as any) || {}

  useEffect(() => {
    if (productType === 'Ceramic Chambers') onCeramicReject()
  }, [productType])

  const showColorway = productType === 'VOLTA Black' || productType === 'VOLTA 24K Gold'
  const colorwayValue = productType === 'VOLTA Black' ? 'Black' : productType === 'VOLTA 24K Gold' ? '24K Gold' : ''

  useEffect(() => {
    setValue('product.colorway', showColorway ? colorwayValue : null)
  }, [productType])

  return (
    <div className="anim-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <p style={{ color: '#888', fontSize: 15 }}>Which product is this claim for?</p>

      <div>
        <label className="w-label">Product *</label>
        <select className={`w-select${productErrors.type ? ' is-error' : ''}`} {...register('product.type')}>
          <option value="">Select a product</option>
          {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <FieldError message={productErrors.type?.message} />
      </div>

      {showColorway && (
        <div className="anim-fade-up">
          <label className="w-label">Colorway</label>
          <input className="w-input" value={colorwayValue} readOnly style={{ opacity: 0.5, cursor: 'not-allowed' }} />
          <p className="w-helper">Auto-filled based on your product selection.</p>
        </div>
      )}

      <div>
        <label className="w-label">Serial number *</label>
        <input className={`w-input${productErrors.serialNumber ? ' is-error' : ''}`} placeholder="e.g. SHX12345678" {...register('product.serialNumber')} />
        <FieldError message={productErrors.serialNumber?.message} />
        <p className="w-helper">Find this on the bottom of your VOLTA, on the battery module, or on the original packaging.</p>
      </div>
    </div>
  )
}
