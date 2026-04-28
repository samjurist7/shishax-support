import { NextRequest, NextResponse } from 'next/server'
import { warrantySchema, generateReferenceNumber } from '@/lib/schema'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = warrantySchema.safeParse(body)

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((e) => {
        fieldErrors[e.path.map(String).join('.')] = e.message
      })
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', fieldErrors } }, { status: 400 })
    }

    const referenceNumber = generateReferenceNumber()
    console.log('[WARRANTY CLAIM]', referenceNumber, JSON.stringify({ ...result.data, issue: { ...result.data.issue, attachments: result.data.issue.attachments.map(a => ({ ...a, data: '[redacted]' })) } }, null, 2))

    return NextResponse.json({ success: true, referenceNumber })
  } catch (err) {
    console.error('[WARRANTY CLAIM ERROR]', err)
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong.' } }, { status: 500 })
  }
}
