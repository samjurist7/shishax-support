import { NextRequest, NextResponse } from 'next/server'

function generateTicketNumber(): string {
  const ts = Date.now().toString().slice(-5)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const rand = chars[Math.floor(Math.random() * chars.length)] + chars[Math.floor(Math.random() * chars.length)]
  return `SHX-TKT-${ts}${rand}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const ticketNumber = generateTicketNumber()
    // Log payload, redacting attachment data
    const safe = { ...body, attachments: body.attachments?.map((a: { filename: string }) => ({ filename: a.filename, data: '[redacted]' })) }
    console.log('[SUPPORT TICKET]', ticketNumber, JSON.stringify(safe, null, 2))
    return NextResponse.json({ success: true, ticketNumber })
  } catch (err) {
    console.error('[SUPPORT TICKET ERROR]', err)
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 })
  }
}
