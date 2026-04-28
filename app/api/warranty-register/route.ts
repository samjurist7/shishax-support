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
    const { productType, serialNumber, purchaseDate, purchaseLocation, resellerName, otherLocation, firstName, lastName, email, phone } = body

    if (!productType || !serialNumber || !purchaseDate || !purchaseLocation || !firstName || !lastName || !email) {
      return NextResponse.json({ success: false, error: { message: 'Missing required fields.' } }, { status: 400 })
    }

    if (purchaseLocation === 'Other' && !otherLocation?.trim()) {
      return NextResponse.json({ success: false, error: { message: 'Please describe where you purchased.' } }, { status: 400 })
    }

    const referenceNumber = generateRefNumber()
    const expiryDate = warrantyExpiry(productType, purchaseDate)

    // Resolve displayed purchase location
    const locationDisplay = purchaseLocation === 'Other'
      ? `Other — ${otherLocation}`
      : purchaseLocation === 'Authorized reseller' && resellerName
        ? `Authorized reseller — ${resellerName}`
        : purchaseLocation

    // Insert as pending_review
    const { error: dbError } = await supabase.from('warranty_registrations').insert({
      reference_number: referenceNumber,
      product_type: productType,
      serial_number: serialNumber,
      purchase_date: purchaseDate,
      purchase_location: locationDisplay,
      reseller_name: resellerName || null,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || null,
      warranty_expires_at: expiryDate,
      status: 'pending_review',
    })

    if (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json({ success: false, error: { message: 'Failed to save registration.' } }, { status: 500 })
    }

    const warrantyMonths = productType === 'Swappable Battery' ? 6 : 12
    const expiryFormatted = new Date(expiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    // Receipt email to customer — "we received it, pending review"
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'ShishaX <noreply@shishax.com>',
        to: email,
        subject: `We received your warranty registration — ${referenceNumber}`,
        html: `
          <div style="background:#0A0A0A;color:#fff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 32px;border-radius:12px;">
            <p style="font-size:22px;font-weight:700;letter-spacing:0.1em;color:#FF8000;margin:0 0 32px;">SHISHAX</p>
            <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.02em;">Registration Received</h1>
            <p style="color:#888;font-size:15px;line-height:1.6;margin:0 0 24px;">Hi ${firstName}, we've received your warranty registration for your <strong style="color:#fff;">${productType}</strong>. Our team will review it within <strong style="color:#fff;">1–3 business days</strong>.</p>
            <div style="background:#111;border:1px solid #2A2A2A;border-radius:10px;padding:24px;margin-bottom:24px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="color:#666;font-size:13px;padding:6px 0;width:160px;">Reference number</td><td style="color:#FF8000;font-size:14px;font-weight:700;font-family:monospace;">${referenceNumber}</td></tr>
                <tr><td style="color:#666;font-size:13px;padding:6px 0;">Product</td><td style="color:#fff;font-size:14px;">${productType}</td></tr>
                <tr><td style="color:#666;font-size:13px;padding:6px 0;">Serial number</td><td style="color:#fff;font-size:14px;font-family:monospace;">${serialNumber}</td></tr>
                <tr><td style="color:#666;font-size:13px;padding:6px 0;">Warranty period</td><td style="color:#fff;font-size:14px;">${warrantyMonths} months from purchase date</td></tr>
                <tr><td style="color:#666;font-size:13px;padding:6px 0;">Status</td><td style="color:#fde68a;font-size:14px;font-weight:600;">Pending review</td></tr>
              </table>
            </div>
            <p style="color:#888;font-size:14px;line-height:1.6;margin:0 0 24px;">Once approved, you'll receive a separate confirmation email with your active registration details. Keep this reference number in the meantime.</p>
            <p style="color:#444;font-size:13px;margin:0;">Questions? Email <a href="mailto:sales@shishax.com" style="color:#FF8000;">sales@shishax.com</a></p>
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
        subject: `New warranty registration to review — ${referenceNumber}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;padding:24px;">
            <h2 style="margin:0 0 8px;">New Warranty Registration</h2>
            <p style="color:#888;font-size:14px;margin:0 0 20px;">Pending your review. Approve or reject in the admin panel.</p>
            <table style="border-collapse:collapse;width:100%;margin-bottom:24px;">
              <tr><td style="color:#666;padding:5px 0;width:160px;font-size:13px;">Reference</td><td style="font-weight:700;">${referenceNumber}</td></tr>
              <tr><td style="color:#666;padding:5px 0;font-size:13px;">Product</td><td>${productType}</td></tr>
              <tr><td style="color:#666;padding:5px 0;font-size:13px;">Serial number</td><td style="font-family:monospace;">${serialNumber}</td></tr>
              <tr><td style="color:#666;padding:5px 0;font-size:13px;">Purchase date</td><td>${purchaseDate}</td></tr>
              <tr><td style="color:#666;padding:5px 0;font-size:13px;">Purchased from</td><td>${locationDisplay}</td></tr>
              <tr><td style="color:#666;padding:5px 0;font-size:13px;">Name</td><td>${firstName} ${lastName}</td></tr>
              <tr><td style="color:#666;padding:5px 0;font-size:13px;">Email</td><td>${email}</td></tr>
              ${phone ? `<tr><td style="color:#666;padding:5px 0;font-size:13px;">Phone</td><td>${phone}</td></tr>` : ''}
              <tr><td style="color:#666;padding:5px 0;font-size:13px;">Warranty expires</td><td>${expiryFormatted}</td></tr>
            </table>
            <a href="https://wholesale.shishax.com/admin/warranty-registrations" style="display:inline-block;background:#FF8000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;">REVIEW IN ADMIN →</a>
          </div>
        `,
      }),
    })

    return NextResponse.json({ success: true, referenceNumber })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
