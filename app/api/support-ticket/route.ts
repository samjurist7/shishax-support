import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function generateTicketNumber(): string {
  const ts = Date.now().toString().slice(-5)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const rand = chars[Math.floor(Math.random() * chars.length)] + chars[Math.floor(Math.random() * chars.length)]
  return `SHX-TKT-${ts}${rand}`
}

function priorityFromCategory(category: string): string {
  if (category === 'Device / Warranty') return 'high'
  if (category === 'Returns & Refunds') return 'high'
  if (category === 'Order & Shipping') return 'normal'
  return 'normal'
}

// Map support portal category → CS ticket category
function mapCategory(category: string): string {
  if (category === 'Device / Warranty') return 'Warranty'
  if (category === 'Returns & Refunds') return 'Returns'
  if (category === 'Order & Shipping') return 'Order'
  if (category === 'App Issue') return 'Technical'
  return 'Other'
}

async function sendTicketEmails(
  ticketNumber: string,
  data: {
    firstName: string; lastName: string; email: string; phone?: string;
    category: string; deviceSelection?: string; issueSelections?: string[];
    description: string; serialNumber?: string; orderNumber?: string;
    hasAttachments: boolean;
  }
) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY!
  const { firstName, email, category, description } = data

  // Receipt to customer
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'ShishaX <noreply@shishax.com>',
      to: email,
      subject: `Support ticket received — ${ticketNumber}`,
      html: `
        <div style="background:#0A0A0A;color:#fff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 32px;border-radius:12px;">
          <p style="font-size:22px;font-weight:700;letter-spacing:0.1em;color:#FF8000;margin:0 0 32px;">SHISHAX</p>
          <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.02em;">Support Ticket Received</h1>
          <p style="color:#888;font-size:15px;line-height:1.6;margin:0 0 24px;">Hi ${firstName}, we've received your support request. We'll follow up within <strong style="color:#fff;">1–2 business days</strong>.</p>
          <div style="background:#111;border:1px solid #2A2A2A;border-radius:10px;padding:24px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="color:#666;font-size:13px;padding:6px 0;width:160px;">Ticket number</td><td style="color:#FF8000;font-size:14px;font-weight:700;font-family:monospace;">${ticketNumber}</td></tr>
              <tr><td style="color:#666;font-size:13px;padding:6px 0;">Category</td><td style="color:#fff;font-size:14px;">${category}</td></tr>
              ${data.deviceSelection ? `<tr><td style="color:#666;font-size:13px;padding:6px 0;">Device</td><td style="color:#fff;font-size:14px;">${data.deviceSelection}</td></tr>` : ''}
              ${data.serialNumber ? `<tr><td style="color:#666;font-size:13px;padding:6px 0;">Serial #</td><td style="color:#fff;font-size:14px;font-family:monospace;">${data.serialNumber}</td></tr>` : ''}
              ${data.orderNumber ? `<tr><td style="color:#666;font-size:13px;padding:6px 0;">Order #</td><td style="color:#fff;font-size:14px;">${data.orderNumber}</td></tr>` : ''}
              <tr><td style="color:#666;font-size:13px;padding:6px 0;">Status</td><td style="color:#86efac;font-size:14px;font-weight:600;">Open</td></tr>
            </table>
          </div>
          <p style="color:#888;font-size:14px;line-height:1.6;margin:0 0 24px;">We'll reply to this email address. Keep your ticket number for reference.</p>
          <p style="color:#444;font-size:13px;margin:0;">Questions? Email <a href="mailto:support@shishax.com" style="color:#FF8000;">support@shishax.com</a></p>
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
      subject: `New support ticket — ${ticketNumber} — ${category}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;padding:24px;">
          <h2 style="margin:0 0 8px;">New Support Ticket</h2>
          <p style="color:#888;font-size:14px;margin:0 0 20px;">Awaiting response. <a href="https://teamsho.app/cs/shishax">View in TeamSHO →</a></p>
          <table style="border-collapse:collapse;width:100%;margin-bottom:24px;">
            <tr><td style="color:#666;padding:5px 0;width:160px;font-size:13px;">Ticket #</td><td style="font-weight:700;">${ticketNumber}</td></tr>
            <tr><td style="color:#666;padding:5px 0;font-size:13px;">Category</td><td>${category}</td></tr>
            ${data.deviceSelection ? `<tr><td style="color:#666;padding:5px 0;font-size:13px;">Device</td><td>${data.deviceSelection}</td></tr>` : ''}
            ${data.issueSelections?.length ? `<tr><td style="color:#666;padding:5px 0;font-size:13px;">Issues</td><td>${data.issueSelections.join(', ')}</td></tr>` : ''}
            <tr><td style="color:#666;padding:5px 0;font-size:13px;">Description</td><td style="font-size:13px;">${description.slice(0, 300)}${description.length > 300 ? '…' : ''}</td></tr>
            ${data.serialNumber ? `<tr><td style="color:#666;padding:5px 0;font-size:13px;">Serial #</td><td style="font-family:monospace;">${data.serialNumber}</td></tr>` : ''}
            ${data.orderNumber ? `<tr><td style="color:#666;padding:5px 0;font-size:13px;">Order #</td><td>${data.orderNumber}</td></tr>` : ''}
            <tr><td style="color:#666;padding:5px 0;font-size:13px;">Name</td><td>${firstName} ${data.lastName}</td></tr>
            <tr><td style="color:#666;padding:5px 0;font-size:13px;">Email</td><td>${email}</td></tr>
            ${data.phone ? `<tr><td style="color:#666;padding:5px 0;font-size:13px;">Phone</td><td>${data.phone}</td></tr>` : ''}
            ${data.hasAttachments ? '<tr><td style="color:#666;padding:5px 0;font-size:13px;">Attachments</td><td>Yes — view in Team SHO</td></tr>' : ''}
          </table>
        </div>
      `,
    }),
  })
}

// ── Write ticket into TeamSHO (sho-dashboard Supabase) ──────────────────────
async function syncToTeamSHO(
  ticketNumber: string,
  data: {
    firstName: string; lastName: string; email: string; phone?: string;
    category: string; deviceSelection?: string; issueSelections?: string[];
    description: string; serialNumber?: string; orderNumber?: string;
    attachmentUrls: string[];
    priority: string;
  }
) {
  const TEAMSHO_URL = process.env.TEAMSHO_SUPABASE_URL
  const TEAMSHO_KEY = process.env.TEAMSHO_SUPABASE_SERVICE_KEY
  if (!TEAMSHO_URL || !TEAMSHO_KEY) {
    console.warn('[SUPPORT TICKET] TEAMSHO env vars not set — skipping TeamSHO sync')
    return
  }

  const sho = createClient(TEAMSHO_URL, TEAMSHO_KEY)
  const now = new Date().toISOString()
  const ticketId = Date.now() + Math.floor(Math.random() * 1000)
  const customerName = `${data.firstName} ${data.lastName}`
  const requesterId = Math.abs(
    data.email.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0)
  ) % 2147483647

  // Upsert requester in cs_users
  await sho.from('cs_users').upsert(
    { id: requesterId, name: customerName, email: data.email, synced_at: now },
    { onConflict: 'id' }
  )

  // Build subject
  const subject = data.deviceSelection
    ? `${data.category} — ${data.deviceSelection}`
    : data.category

  // Build ticket body
  const bodyLines = [
    `**Category:** ${data.category}`,
    data.deviceSelection ? `**Device:** ${data.deviceSelection}` : null,
    data.issueSelections?.length ? `**Issues:** ${data.issueSelections.join(', ')}` : null,
    data.serialNumber ? `**Serial #:** ${data.serialNumber}` : null,
    data.orderNumber ? `**Order #:** ${data.orderNumber}` : null,
    data.phone ? `**Phone:** ${data.phone}` : null,
    ``,
    data.description,
    data.attachmentUrls.length ? `\n**Attachments:**\n${data.attachmentUrls.join('\n')}` : null,
  ].filter(Boolean).join('\n')

  // Insert CS ticket
  await sho.from('cs_tickets').insert({
    id: ticketId,
    subject,
    status: 'open',
    priority: data.priority,
    category: mapCategory(data.category),
    source: 'web_form',
    brand: 'shishax',
    requester_id: requesterId,
    serial_number: data.serialNumber ?? null,
    device_type: data.deviceSelection ?? null,
    issue_type: data.issueSelections?.[0] ?? null,
    shopify_order_id: data.orderNumber ?? null,
    tags: ['web-form', ticketNumber],
    created_at: now,
    updated_at: now,
    synced_at: now,
  })

  // Insert first comment (customer message)
  await sho.from('cs_comments').insert({
    id: Date.now() + Math.floor(Math.random() * 10000),
    ticket_id: ticketId,
    author_name: customerName,
    author_email: data.email,
    body: bodyLines,
    html_body: `<div>${bodyLines.replace(/\n/g, '<br>')}</div>`,
    public: true,
    created_at: now,
    synced_at: now,
  })
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await req.json()

    // Basic validation
    const { category, description, firstName, lastName, email } = body
    if (!category || !description || !firstName || !lastName || !email) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 })
    }
    if (description.length < 20) {
      return NextResponse.json({ success: false, error: 'Description too short.' }, { status: 400 })
    }

    const ticketNumber = generateTicketNumber()
    const priority = priorityFromCategory(category)

    // Upload attachments
    const attachmentUrls: string[] = []
    for (const att of body.attachments ?? []) {
      try {
        const buffer = Buffer.from(att.data as string, 'base64')
        const fileName = `${ticketNumber}/${Date.now()}-${att.filename}`
        const { data: uploadData } = await supabase.storage
          .from('support-tickets')
          .upload(fileName, buffer, { contentType: att.mimeType, upsert: false })
        if (uploadData?.path) {
          const { data: urlData } = supabase.storage.from('support-tickets').getPublicUrl(uploadData.path)
          attachmentUrls.push(urlData.publicUrl)
        }
      } catch {
        console.error(`[SUPPORT TICKET] Attachment upload failed for ${att.filename}`)
      }
    }

    // 1. Insert into support_tickets (ShishaX own DB — source of truth for the portal)
    const { error: dbError } = await supabase.from('support_tickets').insert({
      ticket_number: ticketNumber,
      category,
      device_selection: body.deviceSelection ?? null,
      issue_selections: body.issueSelections?.length ? body.issueSelections : null,
      single_pill: body.singlePill ?? null,
      multi_pills: body.multiPills?.length ? body.multiPills : null,
      description,
      serial_number: body.serialNumber ?? null,
      purchase_date: body.purchaseDate ?? null,
      purchase_location: body.purchaseLocation ?? null,
      order_number: body.orderNumber ?? null,
      app_version: body.appVersion ?? null,
      os_version: body.osVersion ?? null,
      has_attachments: attachmentUrls.length > 0,
      attachment_urls: attachmentUrls.length > 0 ? attachmentUrls : null,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: body.phone ?? null,
      status: 'open',
      priority,
    })

    if (dbError) {
      console.error('[SUPPORT TICKET] DB error:', dbError)
      return NextResponse.json({ success: false, error: 'Failed to save ticket.' }, { status: 500 })
    }

    // 2. Sync into TeamSHO CS inbox (non-fatal)
    try {
      await syncToTeamSHO(ticketNumber, {
        firstName,
        lastName,
        email,
        phone: body.phone,
        category,
        deviceSelection: body.deviceSelection,
        issueSelections: body.issueSelections,
        description,
        serialNumber: body.serialNumber,
        orderNumber: body.orderNumber,
        attachmentUrls,
        priority,
      })
    } catch (syncErr) {
      console.error('[SUPPORT TICKET] TeamSHO sync error (non-fatal):', syncErr)
    }

    // 3. Send emails (non-fatal)
    try {
      await sendTicketEmails(ticketNumber, {
        firstName,
        lastName,
        email,
        phone: body.phone,
        category,
        deviceSelection: body.deviceSelection,
        issueSelections: body.issueSelections,
        description,
        serialNumber: body.serialNumber,
        orderNumber: body.orderNumber,
        hasAttachments: attachmentUrls.length > 0,
      })
    } catch (emailErr) {
      console.error('[SUPPORT TICKET] Email error (non-fatal):', emailErr)
    }

    return NextResponse.json({ success: true, ticketNumber })
  } catch (err) {
    console.error('[SUPPORT TICKET ERROR]', err)
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 })
  }
}
