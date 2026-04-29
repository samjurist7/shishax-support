import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { warrantySchema, generateReferenceNumber } from '@/lib/schema'

const RESEND_API_KEY = process.env.RESEND_API_KEY!

async function sendClaimEmails(
  refNumber: string,
  data: {
    firstName: string; lastName: string; email: string; phone?: string;
    productType: string; colorway?: string | null; serialNumber: string;
    issueType: string; issueDescription: string;
    purchaseDate: string; purchaseLocation: string; resellerName?: string | null;
    warrantyRegistered: string;
    shippingStreet: string; shippingCity: string; shippingState: string;
    shippingPostalCode: string; shippingCountry: string;
    hasAttachments: boolean;
  }
) {
  const { firstName, email, productType, serialNumber, issueType, issueDescription } = data

  // Receipt to customer
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'ShishaX <noreply@shishax.com>',
      to: email,
      subject: `Warranty claim received — ${refNumber}`,
      html: `
        <div style="background:#0A0A0A;color:#fff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 32px;border-radius:12px;">
          <p style="font-size:22px;font-weight:700;letter-spacing:0.1em;color:#FF8000;margin:0 0 32px;">SHISHAX</p>
          <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.02em;">Claim Received</h1>
          <p style="color:#888;font-size:15px;line-height:1.6;margin:0 0 24px;">Hi ${firstName}, we've received your warranty claim. Our team will review it within <strong style="color:#fff;">2–3 business days</strong> and follow up with next steps.</p>
          <div style="background:#111;border:1px solid #2A2A2A;border-radius:10px;padding:24px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="color:#666;font-size:13px;padding:6px 0;width:160px;">Claim reference</td><td style="color:#FF8000;font-size:14px;font-weight:700;font-family:monospace;">${refNumber}</td></tr>
              <tr><td style="color:#666;font-size:13px;padding:6px 0;">Product</td><td style="color:#fff;font-size:14px;">${productType}</td></tr>
              <tr><td style="color:#666;font-size:13px;padding:6px 0;">Serial number</td><td style="color:#fff;font-size:14px;font-family:monospace;">${serialNumber}</td></tr>
              <tr><td style="color:#666;font-size:13px;padding:6px 0;">Issue</td><td style="color:#fff;font-size:14px;">${issueType}</td></tr>
              <tr><td style="color:#666;font-size:13px;padding:6px 0;">Status</td><td style="color:#fde68a;font-size:14px;font-weight:600;">Under Review</td></tr>
            </table>
          </div>
          <p style="color:#888;font-size:14px;line-height:1.6;margin:0 0 24px;">Keep this reference number. You'll hear from us at this email address once we've assessed your claim.</p>
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
      subject: `New warranty claim — ${refNumber} — ${productType}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;padding:24px;">
          <h2 style="margin:0 0 8px;">New Warranty Claim</h2>
          <p style="color:#888;font-size:14px;margin:0 0 20px;">Pending review.</p>
          <table style="border-collapse:collapse;width:100%;margin-bottom:24px;">
            <tr><td style="color:#666;padding:5px 0;width:160px;font-size:13px;">Reference</td><td style="font-weight:700;">${refNumber}</td></tr>
            <tr><td style="color:#666;padding:5px 0;font-size:13px;">Product</td><td>${productType}${data.colorway ? ` (${data.colorway})` : ''}</td></tr>
            <tr><td style="color:#666;padding:5px 0;font-size:13px;">Serial</td><td style="font-family:monospace;">${serialNumber}</td></tr>
            <tr><td style="color:#666;padding:5px 0;font-size:13px;">Issue type</td><td>${issueType}</td></tr>
            <tr><td style="color:#666;padding:5px 0;font-size:13px;">Description</td><td style="font-size:13px;">${issueDescription.slice(0, 200)}${issueDescription.length > 200 ? '…' : ''}</td></tr>
            <tr><td style="color:#666;padding:5px 0;font-size:13px;">Name</td><td>${firstName} ${data.lastName}</td></tr>
            <tr><td style="color:#666;padding:5px 0;font-size:13px;">Email</td><td>${email}</td></tr>
            ${data.phone ? `<tr><td style="color:#666;padding:5px 0;font-size:13px;">Phone</td><td>${data.phone}</td></tr>` : ''}
            <tr><td style="color:#666;padding:5px 0;font-size:13px;">Ship to</td><td style="font-size:13px;">${data.shippingStreet}, ${data.shippingCity}, ${data.shippingState} ${data.shippingPostalCode}, ${data.shippingCountry}</td></tr>
            <tr><td style="color:#666;padding:5px 0;font-size:13px;">Registered</td><td>${data.warrantyRegistered}</td></tr>
            ${data.hasAttachments ? '<tr><td style="color:#666;padding:5px 0;font-size:13px;">Attachments</td><td>Yes — view in Team SHO</td></tr>' : ''}
          </table>
        </div>
      `,
    }),
  })
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

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

    const d = result.data
    const referenceNumber = generateReferenceNumber()

    // Upload attachments to Supabase Storage if provided
    const attachmentUrls: string[] = []
    for (const att of d.issue.attachments ?? []) {
      try {
        const buffer = Buffer.from(att.data, 'base64')
        const fileName = `${referenceNumber}/${Date.now()}-${att.filename}`
        const { data: uploadData } = await supabase.storage
          .from('warranty-claims')
          .upload(fileName, buffer, { contentType: att.mimeType, upsert: false })
        if (uploadData?.path) {
          const { data: urlData } = supabase.storage.from('warranty-claims').getPublicUrl(uploadData.path)
          attachmentUrls.push(urlData.publicUrl)
        }
      } catch {
        // Non-fatal — log but continue
        console.error(`[WARRANTY CLAIM] Attachment upload failed for ${att.filename}`)
      }
    }

    // Insert into warranty_claims
    const { error: dbError } = await supabase.from('warranty_claims').insert({
      reference_number: referenceNumber,
      product_type: d.product.type,
      colorway: d.product.colorway ?? null,
      serial_number: d.product.serialNumber,
      issue_type: d.issue.type,
      issue_description: d.issue.description,
      has_attachments: attachmentUrls.length > 0,
      attachment_urls: attachmentUrls.length > 0 ? attachmentUrls : null,
      purchase_date: d.purchase.date ? new Date(d.purchase.date).toISOString().split('T')[0] : null,
      purchase_location: d.purchase.location,
      reseller_name: d.purchase.resellerName ?? null,
      warranty_registered: d.purchase.registered,
      first_name: d.customer.firstName,
      last_name: d.customer.lastName,
      email: d.customer.email,
      phone: d.customer.phone,
      shipping_street: d.customer.address.street,
      shipping_city: d.customer.address.city,
      shipping_state: d.customer.address.state,
      shipping_postal_code: d.customer.address.postalCode,
      shipping_country: d.customer.address.country,
      meta: d.meta ?? null,
      status: 'pending_review',
    })

    if (dbError) {
      console.error('[WARRANTY CLAIM] DB error:', dbError)
      return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: 'Failed to save claim.' } }, { status: 500 })
    }

    // Send emails (non-fatal if they fail)
    try {
      await sendClaimEmails(referenceNumber, {
        firstName: d.customer.firstName,
        lastName: d.customer.lastName,
        email: d.customer.email,
        phone: d.customer.phone,
        productType: d.product.type,
        colorway: d.product.colorway,
        serialNumber: d.product.serialNumber,
        issueType: d.issue.type,
        issueDescription: d.issue.description,
        purchaseDate: d.purchase.date,
        purchaseLocation: d.purchase.location,
        resellerName: d.purchase.resellerName,
        warrantyRegistered: d.purchase.registered,
        shippingStreet: d.customer.address.street,
        shippingCity: d.customer.address.city,
        shippingState: d.customer.address.state,
        shippingPostalCode: d.customer.address.postalCode,
        shippingCountry: d.customer.address.country,
        hasAttachments: attachmentUrls.length > 0,
      })
    } catch (emailErr) {
      console.error('[WARRANTY CLAIM] Email error (non-fatal):', emailErr)
    }

    return NextResponse.json({ success: true, referenceNumber })
  } catch (err) {
    console.error('[WARRANTY CLAIM ERROR]', err)
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong.' } }, { status: 500 })
  }
}
