'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import SiteNav from '@/components/SiteNav'

// ── Types ──────────────────────────────────────────────────────────────────
type Category = 'Device / Warranty' | 'App Issue' | 'Order & Shipping' | 'Returns & Refunds' | 'General Question'

interface FileItem { file: File; preview: string; id: string }

// ── Pill ───────────────────────────────────────────────────────────────────
function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      background: selected ? 'rgba(255,128,0,0.08)' : '#111111',
      border: `1px solid ${selected ? '#FF8000' : '#1F1F1F'}`,
      borderRadius: 999, padding: '8px 18px', fontSize: 14,
      fontFamily: 'Space Grotesk, sans-serif', fontWeight: 500,
      color: selected ? '#FFFFFF' : '#9A9A9A', cursor: 'pointer',
      transition: 'border-color 0.15s, color 0.15s',
    }}>
      {label}
    </button>
  )
}

// ── Category Card ──────────────────────────────────────────────────────────
function CategoryCard({ label, icon, selected, onClick }: { label: string; icon: React.ReactNode; selected: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: '#111111', border: `1px solid ${selected || hovered ? '#FF8000' : '#1A1A1A'}`,
        borderRadius: 16, padding: '32px 24px', cursor: 'pointer', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        transition: 'border-color 0.15s', width: '100%',
      }}>
      <div style={{ color: '#FF8000' }}>{icon}</div>
      <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 16, color: '#FFFFFF' }}>{label}</span>
    </button>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────
const IconShield = () => <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><path d="M16 3L5 7v9c0 6.627 4.925 12.824 11 14 6.075-1.176 11-7.373 11-14V7L16 3z" stroke="#FF8000" strokeWidth="2" strokeLinejoin="round"/><path d="M11 16l3 3 7-7" stroke="#FF8000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
const IconPhone = () => <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><rect x="9" y="3" width="14" height="26" rx="3" stroke="#FF8000" strokeWidth="2"/><circle cx="16" cy="26" r="1" fill="#FF8000"/></svg>
const IconBox = () => <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><path d="M28 10l-12 7L4 10" stroke="#FF8000" strokeWidth="2" strokeLinejoin="round"/><path d="M4 10l12 7 12-7M16 17v12M4 10v12l12 7 12-7V10L16 3 4 10z" stroke="#FF8000" strokeWidth="2" strokeLinejoin="round"/></svg>
const IconReturn = () => <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><path d="M7 16A9 9 0 1016 7" stroke="#FF8000" strokeWidth="2" strokeLinecap="round"/><path d="M7 7v9H16" stroke="#FF8000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
const IconQuestion = () => <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" stroke="#FF8000" strokeWidth="2"/><path d="M12.5 12a3.5 3.5 0 016.5 1.75c0 2-3 2.75-3 5" stroke="#FF8000" strokeWidth="2" strokeLinecap="round"/><circle cx="16" cy="22" r="1" fill="#FF8000"/></svg>

// ── Dropzone ───────────────────────────────────────────────────────────────
function FileDropzone({ files, setFiles }: { files: FileItem[]; setFiles: (f: FileItem[]) => void }) {
  const onDrop = useCallback((accepted: File[]) => {
    const remaining = 5 - files.length
    const toAdd = accepted.slice(0, remaining).map(file => ({
      file, id: Math.random().toString(36).slice(2),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
    }))
    setFiles([...files, ...toAdd])
  }, [files])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, maxSize: 50 * 1024 * 1024, disabled: files.length >= 5,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/heic': [], 'video/mp4': [], 'video/quicktime': [] },
  })
  return (
    <div>
      <div {...getRootProps()} style={{ border: '2px dashed #FF8000', borderRadius: 8, padding: '32px 16px', textAlign: 'center', cursor: files.length >= 5 ? 'not-allowed' : 'pointer', opacity: files.length >= 5 ? 0.4 : 1, background: isDragActive ? 'rgba(255,128,0,0.04)' : 'transparent' }}>
        <input {...getInputProps()} />
        <svg width="28" height="28" fill="none" viewBox="0 0 28 28" style={{ margin: '0 auto 8px', display: 'block' }}><path d="M14 4v16M6 12l8-8 8 8M4 22h20" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <p style={{ color: '#5A5A5A', fontSize: 15, fontFamily: 'Space Grotesk, sans-serif' }}>
          {isDragActive ? 'Drop files here' : <>Drop files here or <span style={{ color: '#FF8000', textDecoration: 'underline', cursor: 'pointer' }}>Browse files</span></>}
        </p>
        <p style={{ color: '#3A3A3A', fontSize: 12, marginTop: 4, fontFamily: 'Space Grotesk, sans-serif' }}>Up to 5 files, 50MB each. JPG, PNG, HEIC, MP4, MOV.</p>
      </div>
      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
          {files.map(fp => (
            <div key={fp.id} style={{ position: 'relative' }}>
              {fp.preview
                ? <img src={fp.preview} alt={fp.file.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #1F1F1F', display: 'block' }} />
                : <div style={{ width: 64, height: 64, borderRadius: 6, border: '1px solid #1F1F1F', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M12 2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7l-5-5z" stroke="#555" strokeWidth="1.2"/></svg></div>}
              <button type="button" onClick={() => setFiles(files.filter(f => f.id !== fp.id))} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#F82629', border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Section Label ──────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FF8000', marginBottom: 14 }}>{children}</p>
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return <label style={{ display: 'block', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9A9A9A', marginBottom: 7 }}>{children}{required && <span style={{ color: '#FF8000', marginLeft: 2 }}>*</span>}</label>
}

function ErrMsg({ msg }: { msg: string }) {
  return msg ? <p style={{ color: '#F82629', fontSize: 13, marginTop: 6, fontFamily: 'Space Grotesk, sans-serif' }}>{msg}</p> : null
}

// ── Progress Bar ───────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
      <div style={{ display: 'flex', gap: 4, flex: 1 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i <= step ? '#FF8000' : '#1F1F1F', transition: 'background 0.3s' }} />
        ))}
      </div>
      <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 500, fontSize: 14, color: '#9A9A9A', whiteSpace: 'nowrap' }}>Step {step} of 4</span>
    </div>
  )
}

// ── Success ────────────────────────────────────────────────────────────────
function SuccessScreen({ ticketNumber, email, onReset }: { ticketNumber: string; email: string; onReset: () => void }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="anim-fade-up" style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto', padding: '32px 0' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #FF8000, #F82629)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M7 16l6 6 12-12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 28, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 12 }}>TICKET SUBMITTED</h1>
      <p style={{ color: '#9A9A9A', fontSize: 15, lineHeight: 1.7, marginBottom: 32, fontFamily: 'Space Grotesk, sans-serif' }}>
        We typically respond within <strong style={{ color: '#fff' }}>1–2 business days</strong>. A confirmation has been sent to <span style={{ color: '#fff' }}>{email}</span>.
      </p>
      <div style={{ background: '#111', border: '1px solid #1F1F1F', borderRadius: 12, padding: '24px 28px', marginBottom: 16 }}>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666', marginBottom: 10 }}>TICKET NUMBER</p>
        <p style={{ fontFamily: 'monospace', fontSize: 24, color: '#FF8000', letterSpacing: '0.1em', marginBottom: 6 }}>{ticketNumber}</p>
        <p style={{ fontSize: 13, color: '#555', marginBottom: 18, fontFamily: 'Space Grotesk, sans-serif' }}>Keep this for your records.</p>
        <button onClick={() => { navigator.clipboard.writeText(ticketNumber); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="btn-primary" style={{ width: '100%' }}>{copied ? 'COPIED ✓' : 'COPY TICKET NUMBER'}</button>
      </div>
      <button onClick={onReset} className="btn-secondary" style={{ display: 'block', width: '100%', textAlign: 'center', marginBottom: 12 }}>Submit Another Ticket</button>
      <a href="https://shishax.com" style={{ fontSize: 14, color: '#555', textDecoration: 'none', fontFamily: 'Space Grotesk, sans-serif' }}>← Back to ShishaX.com</a>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function TicketPage() {
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState<Category | null>(null)
  const [catErr, setCatErr] = useState('')

  // Step 2 state
  const [deviceSelection, setDeviceSelection] = useState('')
  const [issueSelections, setIssueSelections] = useState<string[]>([])
  const [singlePill, setSinglePill] = useState('')
  const [multiPills, setMultiPills] = useState<string[]>([])
  const [step2Err, setStep2Err] = useState('')

  // Step 3 state
  const [description, setDescription] = useState('')
  const [descErr, setDescErr] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [serialErr, setSerialErr] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [purchaseLocation, setPurchaseLocation] = useState('')
  const [appDevice, setAppDevice] = useState('')
  const [appOS, setAppOS] = useState('')
  const [appVersion, setAppVersion] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [orderErr, setOrderErr] = useState('')
  const [files, setFiles] = useState<FileItem[]>([])

  // Step 4 state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [step4Errors, setStep4Errors] = useState<Record<string, string>>({})

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [ticketNumber, setTicketNumber] = useState('')

  const CATEGORIES: { label: Category; icon: React.ReactNode }[] = [
    { label: 'Device / Warranty', icon: <IconShield /> },
    { label: 'App Issue', icon: <IconPhone /> },
    { label: 'Order & Shipping', icon: <IconBox /> },
    { label: 'Returns & Refunds', icon: <IconReturn /> },
    { label: 'General Question', icon: <IconQuestion /> },
  ]

  function reset() {
    setStep(1); setCategory(null); setCatErr(''); setDeviceSelection(''); setIssueSelections([]); setSinglePill(''); setMultiPills([]); setStep2Err(''); setDescription(''); setDescErr(''); setSerialNumber(''); setSerialErr(''); setPurchaseDate(''); setPurchaseLocation(''); setAppDevice(''); setAppOS(''); setAppVersion(''); setOrderNumber(''); setOrderErr(''); setFiles([]); setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setConfirmed(false); setStep4Errors({}); setSubmitError(''); setSubmitted(false);
  }

  function handleContinue() {
    if (step === 1) {
      if (!category) { setCatErr('Please select a category.'); return }
      setCatErr(''); setStep(2)
    } else if (step === 2) {
      if (category === 'Device / Warranty') {
        if (!deviceSelection || issueSelections.length === 0) { setStep2Err('Please select a device and at least one issue.'); return }
      } else if (category === 'Returns & Refunds' || category === 'General Question') {
        if (!singlePill) { setStep2Err('Please select an option.'); return }
      } else {
        if (multiPills.length === 0) { setStep2Err('Please select at least one option.'); return }
      }
      setStep2Err(''); setStep(3)
    } else if (step === 3) {
      let ok = true
      if (!description || description.length < 20) { setDescErr('Please describe your issue in at least 20 characters.'); ok = false } else setDescErr('')
      if (serialNumber && !/^[a-zA-Z0-9]{8,20}$/.test(serialNumber)) { setSerialErr('Serial number must be 8–20 letters and numbers.'); ok = false } else setSerialErr('')
      if ((category === 'Order & Shipping' || category === 'Returns & Refunds') && !orderNumber.trim()) { setOrderErr('Order number is required.'); ok = false } else setOrderErr('')
      if (ok) setStep(4)
    }
  }

  async function handleSubmit() {
    const errs: Record<string, string> = {}
    if (!firstName.trim()) errs.firstName = 'Required.'
    if (!lastName.trim()) errs.lastName = 'Required.'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.'
    if (!confirmed) errs.confirmed = 'Please confirm before submitting.'
    setStep4Errors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const payload = {
        category, deviceSelection, issueSelections, singlePill, multiPills,
        description, serialNumber, purchaseDate, purchaseLocation,
        appDevice, appOS, appVersion, orderNumber,
        firstName, lastName, email, phone,
        attachments: await Promise.all(files.map(async fp => {
          const buf = await fp.file.arrayBuffer()
          const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
          return { filename: fp.file.name, mimeType: fp.file.type, sizeBytes: fp.file.size, data: b64 }
        })),
      }
      const res = await fetch('/api/support-ticket', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (json.success) { setTicketNumber(json.ticketNumber); setSubmitted(true) }
      else setSubmitError(json.error || 'Something went wrong. Please try again.')
    } catch { setSubmitError('Something went wrong. Please try again.') }
    setSubmitting(false)
  }

  const step2Pills = (opts: string[], multi: boolean) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {opts.map(opt => (
        <Pill key={opt} label={opt}
          selected={multi ? multiPills.includes(opt) : singlePill === opt}
          onClick={() => {
            setStep2Err('')
            if (multi) setMultiPills(prev => prev.includes(opt) ? prev.filter(p => p !== opt) : [...prev, opt])
            else setSinglePill(opt)
          }} />
      ))}
    </div>
  )

  const inputStyle = (err?: string) => ({ display: 'block', width: '100%', background: '#111111', border: `1px solid ${err ? '#F82629' : '#1F1F1F'}`, borderRadius: 8, padding: '13px 16px', color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, outline: 'none', minHeight: 50 } as React.CSSProperties)
  const selectStyle = { ...inputStyle(), appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 40, cursor: 'pointer' } as React.CSSProperties

  const divider = (label: string) => (
    <div style={{ borderTop: '1px solid #1A1A1A', paddingTop: 24, marginTop: 8 }}>
      <SectionLabel>{label}</SectionLabel>
    </div>
  )

  if (submitted) return (
    <main style={{ minHeight: '100vh', background: '#000', padding: '48px 20px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <SiteNav />
        <SuccessScreen ticketNumber={ticketNumber} email={email} onReset={reset} />
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#000' }}>
      {/* Header strip */}
      <div style={{ background: '#050505', borderBottom: '1px solid #1A1A1A', padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(28px, 6vw, 60px)', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.03em', margin: 0 }}>SUBMIT A SUPPORT TICKET</h1>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, color: '#9A9A9A', marginTop: 10 }}>We typically respond within 1–2 business days.</p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 20px' }}>
        <SiteNav />
        <ProgressBar step={step} />

        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} style={{ background: 'none', border: 'none', color: '#9A9A9A', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, marginBottom: 24, padding: 0 }}>← Back</button>
        )}

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="anim-slide-in">
            <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 4vw, 28px)', color: '#fff', marginBottom: 8 }}>What do you need help with?</h2>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, color: '#9A9A9A', marginBottom: 28 }}>Select the category that best describes your issue.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 8 }}>
              {CATEGORIES.slice(0, 4).map(c => (
                <CategoryCard key={c.label} label={c.label} icon={c.icon} selected={category === c.label} onClick={() => { setCategory(c.label); setCatErr('') }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <div style={{ width: 'calc(50% - 8px)' }}>
                <CategoryCard label={CATEGORIES[4].label} icon={CATEGORIES[4].icon} selected={category === CATEGORIES[4].label} onClick={() => { setCategory(CATEGORIES[4].label); setCatErr('') }} />
              </div>
            </div>
            {catErr && <p style={{ color: '#F82629', fontSize: 13, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 8 }}>{catErr}</p>}
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="anim-slide-in">
            {category === 'Device / Warranty' && (
              <>
                <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(20px, 4vw, 28px)', color: '#fff', marginBottom: 28 }}>Tell us about the device</h2>
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15, color: '#fff', marginBottom: 14 }}>Which device?</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {['VOLTA Black', 'VOLTA 24K Gold', 'Swappable Battery', 'Ceramic Chambers'].map(opt => (
                      <Pill key={opt} label={opt} selected={deviceSelection === opt} onClick={() => { setDeviceSelection(opt); setStep2Err('') }} />
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15, color: '#fff', marginBottom: 14 }}>What's the issue? <span style={{ color: '#9A9A9A', fontWeight: 400, fontSize: 13 }}>(select all that apply)</span></p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {["Won't power on", 'Overheating', 'Display issue', 'Battery draining fast', "App won't connect", 'Physical damage', 'Other'].map(opt => (
                      <Pill key={opt} label={opt} selected={issueSelections.includes(opt)} onClick={() => { setStep2Err(''); setIssueSelections(prev => prev.includes(opt) ? prev.filter(p => p !== opt) : [...prev, opt]) }} />
                    ))}
                  </div>
                </div>
              </>
            )}
            {category === 'App Issue' && (
              <>
                <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(20px, 4vw, 28px)', color: '#fff', marginBottom: 8 }}>What's the app issue?</h2>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, color: '#9A9A9A', marginBottom: 28 }}>Select all that apply.</p>
                {step2Pills(["Won't open", 'Crashes during use', "Can't connect to device", 'Login problems', 'Notifications not working', 'Other'], true)}
              </>
            )}
            {category === 'Order & Shipping' && (
              <>
                <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(20px, 4vw, 28px)', color: '#fff', marginBottom: 8 }}>What's the issue?</h2>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, color: '#9A9A9A', marginBottom: 28 }}>Select all that apply.</p>
                {step2Pills(["Haven't received my order", 'Order arrived damaged', 'Wrong item received', 'Missing items in order', 'Tracking not updating', 'Other'], true)}
              </>
            )}
            {category === 'Returns & Refunds' && (
              <>
                <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(20px, 4vw, 28px)', color: '#fff', marginBottom: 8 }}>What do you need?</h2>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, color: '#9A9A9A', marginBottom: 28 }}>Select one.</p>
                {step2Pills(['Start a return', 'Check return status', 'Request a refund', 'Refund not received'], false)}
              </>
            )}
            {category === 'General Question' && (
              <>
                <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(20px, 4vw, 28px)', color: '#fff', marginBottom: 8 }}>What's it about?</h2>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, color: '#9A9A9A', marginBottom: 28 }}>Select one.</p>
                {step2Pills(['Product information', 'Wholesale / B2B', 'Compatibility', 'Something else'], false)}
              </>
            )}
            {step2Err && <p style={{ color: '#F82629', fontSize: 13, marginTop: 16, fontFamily: 'Space Grotesk, sans-serif' }}>{step2Err}</p>}
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className="anim-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(20px, 4vw, 28px)', color: '#fff', marginBottom: 28 }}>Tell us more</h2>

            {/* Description — all paths */}
            <SectionLabel>DESCRIPTION</SectionLabel>
            <textarea
              value={description} onChange={e => { setDescription(e.target.value); if (e.target.value.length >= 20) setDescErr('') }}
              rows={5} placeholder={category === 'General Question' ? 'What would you like to know?' : 'Describe the issue in detail. What happened? When did it start? What have you tried?'}
              style={{ ...inputStyle(descErr), resize: 'none', minHeight: 120 }}
              onFocus={e => { e.target.style.borderColor = '#FF8000' }} onBlur={e => { e.target.style.borderColor = descErr ? '#F82629' : '#1F1F1F' }}
            />
            <ErrMsg msg={descErr} />

            {/* Device / Warranty extras */}
            {category === 'Device / Warranty' && (
              <>
                {divider('SERIAL NUMBERS')}
                <FieldLabel>Serial number</FieldLabel>
                <input value={serialNumber} onChange={e => { setSerialNumber(e.target.value); setSerialErr('') }} placeholder="e.g. SHX12345678" style={inputStyle(serialErr)}
                  onFocus={e => e.target.style.borderColor = '#FF8000'} onBlur={e => e.target.style.borderColor = serialErr ? '#F82629' : '#1F1F1F'} />
                <ErrMsg msg={serialErr} />
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: '#5A5A5A', marginTop: 6 }}>Found on the bottom of your device or original packaging. (Optional)</p>

                {divider('DEVICE INFO')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <FieldLabel>Purchase date</FieldLabel>
                    <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} style={{ ...inputStyle(), colorScheme: 'dark' }}
                      onFocus={e => e.target.style.borderColor = '#FF8000'} onBlur={e => e.target.style.borderColor = '#1F1F1F'} />
                  </div>
                  <div>
                    <FieldLabel>Purchased from</FieldLabel>
                    <select value={purchaseLocation} onChange={e => setPurchaseLocation(e.target.value)} style={selectStyle}
                      onFocus={e => e.target.style.borderColor = '#FF8000'} onBlur={e => e.target.style.borderColor = '#1F1F1F'}>
                      <option value="">Select…</option>
                      <option>shishax.com</option>
                      <option>Authorized reseller</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* App Issue extras */}
            {category === 'App Issue' && (
              <>
                {divider('DEVICE INFO')}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <FieldLabel>Which device?</FieldLabel>
                      <select value={appDevice} onChange={e => setAppDevice(e.target.value)} style={selectStyle}
                        onFocus={e => e.target.style.borderColor = '#FF8000'} onBlur={e => e.target.style.borderColor = '#1F1F1F'}>
                        <option value="">Select…</option>
                        <option>VOLTA Black</option>
                        <option>VOLTA 24K Gold</option>
                        <option>Swappable Battery</option>
                      </select>
                    </div>
                    <div>
                      <FieldLabel>Operating system</FieldLabel>
                      <select value={appOS} onChange={e => setAppOS(e.target.value)} style={selectStyle}
                        onFocus={e => e.target.style.borderColor = '#FF8000'} onBlur={e => e.target.style.borderColor = '#1F1F1F'}>
                        <option value="">Select…</option>
                        <option>iOS</option>
                        <option>Android</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <FieldLabel>App version</FieldLabel>
                    <input value={appVersion} onChange={e => setAppVersion(e.target.value)} placeholder="e.g. 2.1.4 (optional)" style={inputStyle()}
                      onFocus={e => e.target.style.borderColor = '#FF8000'} onBlur={e => e.target.style.borderColor = '#1F1F1F'} />
                  </div>
                </div>
              </>
            )}

            {/* Order / Returns extras */}
            {(category === 'Order & Shipping' || category === 'Returns & Refunds') && (
              <>
                {divider('ORDER INFO')}
                <FieldLabel required>Order number</FieldLabel>
                <input value={orderNumber} onChange={e => { setOrderNumber(e.target.value); setOrderErr('') }} placeholder="e.g. SHX-ORD-12345" style={inputStyle(orderErr)}
                  onFocus={e => e.target.style.borderColor = '#FF8000'} onBlur={e => e.target.style.borderColor = orderErr ? '#F82629' : '#1F1F1F'} />
                <ErrMsg msg={orderErr} />
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: '#5A5A5A', marginTop: 6 }}>Found in your order confirmation email.</p>
              </>
            )}

            {/* Attachments — all paths */}
            {divider('ATTACHMENTS')}
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: '#5A5A5A', marginBottom: 12 }}>Photos or videos to help us understand the issue. (Optional)</p>
            <FileDropzone files={files} setFiles={setFiles} />
          </div>
        )}

        {/* ── STEP 4 ── */}
        {step === 4 && (
          <div className="anim-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(20px, 4vw, 28px)', color: '#fff', marginBottom: 8 }}>Your details</h2>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, color: '#9A9A9A', marginBottom: 8 }}>So we know how to reach you.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <FieldLabel required>First name</FieldLabel>
                <input value={firstName} onChange={e => { setFirstName(e.target.value); setStep4Errors(p => ({ ...p, firstName: '' })) }} placeholder="First name" style={inputStyle(step4Errors.firstName)}
                  onFocus={e => e.target.style.borderColor = '#FF8000'} onBlur={e => e.target.style.borderColor = step4Errors.firstName ? '#F82629' : '#1F1F1F'} />
                <ErrMsg msg={step4Errors.firstName} />
              </div>
              <div>
                <FieldLabel required>Last name</FieldLabel>
                <input value={lastName} onChange={e => { setLastName(e.target.value); setStep4Errors(p => ({ ...p, lastName: '' })) }} placeholder="Last name" style={inputStyle(step4Errors.lastName)}
                  onFocus={e => e.target.style.borderColor = '#FF8000'} onBlur={e => e.target.style.borderColor = step4Errors.lastName ? '#F82629' : '#1F1F1F'} />
                <ErrMsg msg={step4Errors.lastName} />
              </div>
            </div>

            <div>
              <FieldLabel required>Email address</FieldLabel>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setStep4Errors(p => ({ ...p, email: '' })) }} placeholder="you@example.com" style={inputStyle(step4Errors.email)}
                onFocus={e => e.target.style.borderColor = '#FF8000'} onBlur={e => e.target.style.borderColor = step4Errors.email ? '#F82629' : '#1F1F1F'} />
              <ErrMsg msg={step4Errors.email} />
            </div>

            <div>
              <FieldLabel>Phone number</FieldLabel>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000 (optional)" style={inputStyle()}
                onFocus={e => e.target.style.borderColor = '#FF8000'} onBlur={e => e.target.style.borderColor = '#1F1F1F'} />
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginTop: 8 }}>
              <div onClick={() => { setConfirmed(!confirmed); setStep4Errors(p => ({ ...p, confirmed: '' })) }}
                style={{ width: 20, height: 20, minWidth: 20, borderRadius: 5, border: `2px solid ${step4Errors.confirmed ? '#F82629' : confirmed ? '#FF8000' : '#1F1F1F'}`, background: confirmed ? '#FF8000' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', marginTop: 2 }}>
                {confirmed && <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, color: '#ccc', lineHeight: 1.5 }}>I confirm the information above is accurate and I agree to be contacted by ShishaX support regarding this ticket.</span>
            </label>
            <ErrMsg msg={step4Errors.confirmed} />

            {submitError && (
              <div style={{ padding: '14px 16px', borderRadius: 8, background: 'rgba(248,38,41,0.06)', border: '1px solid rgba(248,38,41,0.2)' }}>
                <p style={{ color: '#fca5a5', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif' }}>{submitError}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Navigation buttons ── */}
        <div style={{ marginTop: 32 }}>
          {step < 4
            ? <button onClick={handleContinue} className="btn-primary" style={{ width: '100%' }}>CONTINUE</button>
            : <button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{ width: '100%' }}>{submitting ? 'SUBMITTING…' : 'SUBMIT TICKET'}</button>
          }
        </div>
      </div>
    </main>
  )
}
