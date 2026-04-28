import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function generateRefNumber(): string {
  const ts = Date.now().toString().slice(-5)
  const rand = Math.random().toString(36).slice(2, 4).toUpperCase()
  return `SHX-REG-${ts}${rand}`
}

function warrantyExpiry(productType: string, purchaseDate: string): string {
  const d = new Date(purchaseDate)
  const months = productType === 'Swappable Battery' ? 6 : 12
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const RESEND_API_KEY = process.env.RESEND_API_KEY!

  try {
    const body = await req.json()
    const { productType, serialNumber, purchaseDate, purchaseLocation, resellerName, firstName, lastName, email, phone } = body

    // Basic validation
    if (!productType || !serialNumber || !purchaseDate || !purchaseLocation || !firstName || !lastName || !email) {
      return NextResponse.json({ success: false, error: { message: 'Missing required fields.' } }, { status: 400 })
    }

    const referenceNumber = generateRefNumber()
    const expiryDate = warrantyExpiry(productType, purchaseDate)

    // Insert into Supabase
    const { error: dbError } = await supabase.from('warranty_registrations').insert({
      reference_number: referenceNumber,
      product_type: productType,
      serial_number: serialNumber,
      purchase_date: purchaseDate,
      purchase_location: purchaseLocation,
      reseller_name: resellerName || null,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || null,
      warranty_expires_at: expiryDate,
    })

    if (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json({ success: false, error: { message: 'Failed to save registration.' } }, { status: 500 })
    }

    const warrantyMonths = productType === 'Swappable Battery' ? 6 : 12
    const expiryFormatted = new Date(expiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    // Send confirmation email to customer
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'ShishaX <noreply@shishax.com>',
        to: email,
        subject: `Your ${productType} warranty is registered — ${referenceNumber}`,
        html: `
          <div style="background:#0A0A0A;color:#fff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 32px;border-radius:12px;">
            <p style="font-size:22px;font-weight:700;letter-spacing:0.1em;color:#FF8000;margin:0 0 32px;">SHISHAX</p>
            <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.02em;">Warranty Registered</h1>
            <p style="color:#888;font-size:15px;line-height:1.6;margin:0 0 32px;">Hi ${firstName}, your <strong style="color:#fff;">${productType}</strong> warranty is now active.</p>
            <div style="background:#111;border:1px solid #2A2A2A;border-radius:10px;padding:24px;margin-bottom:32px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="color:#666;font-size:13px;padding:6px 0;width:160px;">Registration number</td><td style="color:#FF8000;font-size:15px;font-weight:700;font-family:monospace;">${referenceNumber}</td></tr>
                <tr><td style="color:#666;font-size:13px;padding:6px 0;">Product</td><td style="color:#fff;font-size:15px;">${productType}</td></tr>
                <tr><td style="color:#666;font-size:13px;padding:6px 0;">Serial number</td><td style="color:#fff;font-size:15px;font-family:monospace;">${serialNumber}</td></tr>
                <tr><td style="color:#666;font-size:13px;padding:6px 0;">Warranty period</td><td style="color:#fff;font-size:15px;">${warrantyMonths} months</td></tr>
                <tr><td style="color:#666;font-size:13px;padding:6px 0;">Expires</td><td style="color:#fff;font-size:15px;">${expiryFormatted}</td></tr>
              </table>
            </div>
            <p style="color:#888;font-size:14px;line-height:1.6;margin:0 0 24px;">Keep your registration number safe — you'll need it if you ever submit a warranty claim.</p>
            <a href="https://support.shishax.com/claim" style="display:inline-block;background:linear-gradient(135deg,#FF8000,#F82629);color:#fff;font-size:13px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;text-decoration:none;padding:14px 28px;border-radius:8px;">Submit a Claim</a>
            <p style="color:#444;font-size:13px;margin:32px 0 0;">Questions? Email <a href="mailto:sales@shishax.com" style="color:#FF8000;">sales@shishax.com</a></p>
          </div>
        `,
      }),
    })

    // Internal notification to Kristina
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'ShishaX <noreply@shishax.com>',
        to: 'kristina@shishax.com',
        subject: `New warranty registration — ${referenceNumber}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;padding:24px;">
            <h2 style="margin:0 0 16px;">New Warranty Registration</h2>
            <table style="border-collapse:collapse;width:100%;">
              <tr><td style="color:#666;padding:4px 0;width:160px;">Reference</td><td><strong>${referenceNumber}</strong></td></tr>
              <tr><td style="color:#666;padding:4px 0;">Product</td><td>${productType}</td></tr>
              <tr><td style="color:#666;padding:4px 0;">Serial number</td><td>${serialNumber}</td></tr>
              <tr><td style="color:#666;padding:4px 0;">Purchase date</td><td>${purchaseDate}</td></tr>
              <tr><td style="color:#666;padding:4px 0;">Purchased from</td><td>${purchaseLocation}${resellerName ? ` — ${resellerName}` : ''}</td></tr>
              <tr><td style="color:#666;padding:4px 0;">Name</td><td>${firstName} ${lastName}</td></tr>
              <tr><td style="color:#666;padding:4px 0;">Email</td><td>${email}</td></tr>
              ${phone ? `<tr><td style="color:#666;padding:4px 0;">Phone</td><td>${phone}</td></tr>` : ''}
              <tr><td style="color:#666;padding:4px 0;">Warranty expires</td><td>${expiryFormatted}</td></tr>
            </table>
            <a href="https://wholesale.shishax.com/admin/warranty-registrations" style="display:inline-block;margin-top:24px;background:#FF8000;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">View in Admin</a>
          </div>
        `,
      }),
    })

    console.log('Warranty registration:', { referenceNumber, productType, serialNumber, email })
    return NextResponse.json({ success: true, referenceNumber })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
