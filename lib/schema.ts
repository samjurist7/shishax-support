import { z } from 'zod'

export const warrantySchema = z.object({
  product: z.object({
    type: z.enum(['VOLTA Black', 'VOLTA 24K Gold', 'Swappable Battery']),
    colorway: z.string().nullable(),
    serialNumber: z.string().regex(/^[a-zA-Z0-9]{8,20}$/, 'Serial numbers are 8 to 20 characters, letters and numbers only.'),
  }),
  issue: z.object({
    type: z.enum(['Won\'t power on', 'Display issue', 'Heating malfunction', 'Battery not charging', 'Battery not holding charge', 'App connection issue', 'Physical damage', 'Other']),
    description: z.string().min(50, 'Add a bit more detail. Minimum 50 characters.').max(1500, 'Description is too long. Maximum 1500 characters.'),
    attachments: z.array(z.object({
      filename: z.string(),
      mimeType: z.string(),
      sizeBytes: z.number(),
      data: z.string(),
    })).min(1, 'At least one photo or video is required.').max(5, 'Maximum 5 files. Remove one to add another.'),
  }),
  purchase: z.object({
    date: z.string(),
    location: z.enum(['shishax.com', 'Authorized reseller', 'Other']),
    resellerName: z.string().nullable(),
    registered: z.enum(['yes', 'no', 'unsure']),
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
      country: z.string().min(2, 'This field is required.'),
    }),
  }),
  meta: z.object({
    warrantyStatus: z.enum(['within', 'expired']),
    daysRemaining: z.number(),
    submittedAt: z.string(),
    userAgent: z.string(),
  }),
})

export type WarrantyClaim = z.infer<typeof warrantySchema>

export function generateReferenceNumber(): string {
  const ts = Date.now().toString().slice(-5)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const rand = chars[Math.floor(Math.random() * chars.length)] + chars[Math.floor(Math.random() * chars.length)]
  return `SHX-WAR-${ts}${rand}`
}
