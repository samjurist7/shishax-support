'use client'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import FieldError from './FieldError'

const PRODUCTS = ['VOLTA Black', 'VOLTA 24K Gold', 'Swappable Battery', 'Ceramic Chambers'] as const

interface Props { onCeramicReject: () => void }

export default function Step1Product({ onCeramicReject }: Props) {
  const { register, watch, setValue, formState: { errors } } = useFormContext()
  const productType = watch('product.type')

  useEffect(() => {
    if (productType === 'Ceramic Chambers') {
      onCeramicReject()
    }
  }, [productType])

  const showColorway = productType === 'VOLTA Black' || productType === 'VOLTA 24K Gold'
  const colorwayValue = productType === 'VOLTA Black' ? 'Black' : productType === 'VOLTA 24K Gold' ? '24K Gold' : ''

  useEffect(() => {
    if (showColorway) setValue('product.colorway', colorwayValue)
    else setValue('product.colorway', null)
  }, [productType])

  const productErrors = (errors?.product as any) || {}

  return (
    <div className="animate-slide-in space-y-6">
      <div>
        <p className="text-brand-gray mb-4" style={{ fontSize: 15 }}>Which product is this claim for?</p>
        <label className="warranty-label">Product *</label>
        <select className={`warranty-select ${productErrors.type ? 'error' : ''}`} {...register('product.type')}>
          <option value="">Select a product</option>
          {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <FieldError message={productErrors.type?.message} />
      </div>

      {showColorway && (
        <div className="animate-fade-in">
          <label className="warranty-label">Colorway</label>
          <input className="warranty-input opacity-60 cursor-not-allowed" value={colorwayValue} readOnly />
          <p className="warranty-helper">Auto-filled based on your product selection. Reserved for future colorway options.</p>
        </div>
      )}

      <div>
        <label className="warranty-label">Serial number *</label>
        <input
          className={`warranty-input ${productErrors.serialNumber ? 'error' : ''}`}
          placeholder="e.g. SHX12345678"
          {...register('product.serialNumber')}
        />
        <FieldError message={productErrors.serialNumber?.message} />
        <p className="warranty-helper">Find this on the bottom of your VOLTA, on the battery module, or on the original packaging.</p>
      </div>
    </div>
  )
}
