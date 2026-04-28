'use client'
import { useCallback, useEffect, useState } from 'react'
import { useFormContext, useController } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import FieldError from './FieldError'

const ISSUE_TYPES = ["Won't power on", 'Display issue', 'Heating malfunction', 'Battery not charging', 'Battery not holding charge', 'App connection issue', 'Physical damage', 'Other']
const MAX_SIZE = 50 * 1024 * 1024
const MAX_FILES = 5

interface FP { file: File; preview: string; id: string }

export default function Step2Issue() {
  const { register, watch, control, formState: { errors } } = useFormContext()
  const [files, setFiles] = useState<FP[]>([])
  const [fileError, setFileError] = useState('')
  const description = watch('issue.description') || ''
  const issueErrors = (errors?.issue as any) || {}

  // Register attachments via useController so setValue is properly tracked by RHF
  const { field: attachmentsField } = useController({
    name: 'issue.attachments',
    control,
    rules: { validate: (v) => (Array.isArray(v) && v.length > 0) || 'At least one photo or video is required.' },
    defaultValue: [],
  })

  const buildAttachments = async (fps: FP[]) => {
    return Promise.all(fps.map(async fp => {
      const buf = await fp.file.arrayBuffer()
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
      return { filename: fp.file.name, mimeType: fp.file.type, sizeBytes: fp.file.size, data: b64 }
    }))
  }

  const onDrop = useCallback(async (accepted: File[], rejected: any[]) => {
    setFileError('')
    if (rejected.length > 0) {
      const code = rejected[0].errors[0]?.code
      if (code === 'file-too-large') setFileError('File is too large. Maximum 50MB.')
      else if (code === 'file-invalid-type') setFileError('File type not supported. Use JPG, PNG, HEIC, MP4, or MOV.')
      return
    }
    if (files.length + accepted.length > MAX_FILES) {
      setFileError('Maximum 5 files. Remove one to add another.')
      return
    }
    const previews: FP[] = accepted.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      id: Math.random().toString(36).slice(2),
    }))
    const updated = [...files, ...previews]
    setFiles(updated)
    const attachments = await buildAttachments(updated)
    attachmentsField.onChange(attachments)
  }, [files, attachmentsField])

  const removeFile = async (id: string) => {
    const updated = files.filter(f => f.id !== id)
    setFiles(updated)
    if (updated.length === 0) {
      attachmentsField.onChange([])
    } else {
      const attachments = await buildAttachments(updated)
      attachmentsField.onChange(attachments)
    }
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => { files.forEach(fp => { if (fp.preview) URL.revokeObjectURL(fp.preview) }) }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/heic': [], 'video/mp4': [], 'video/quicktime': [] },
    maxSize: MAX_SIZE,
    disabled: files.length >= MAX_FILES,
  })

  const attachmentError = issueErrors.attachments?.message || (issueErrors.attachments?.root?.message)

  return (
    <div className="anim-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <p style={{ color: '#888', fontSize: 15 }}>What's going on?</p>

      <div>
        <label className="w-label">Issue type *</label>
        <select className={`w-select${issueErrors.type ? ' is-error' : ''}`} {...register('issue.type')}>
          <option value="">Select an issue</option>
          {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <FieldError message={issueErrors.type?.message} />
      </div>

      <div>
        <label className="w-label">
          Description *{' '}
          <span style={{ color: '#555', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 12, marginLeft: 4 }}>
            {description.length}/1500
          </span>
        </label>
        <textarea
          className={`w-input${issueErrors.description ? ' is-error' : ''}`}
          rows={5}
          style={{ resize: 'none', minHeight: 120 }}
          placeholder="Describe the issue in detail..."
          {...register('issue.description')}
        />
        <FieldError message={issueErrors.description?.message} />
        <p className="w-helper">The more detail you give us, the faster we can resolve this. Include when it started, what you were doing, and anything you've already tried.</p>
      </div>

      <div>
        <label className="w-label">
          Photos / Videos *{' '}
          <span style={{ color: '#555', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 12, marginLeft: 4 }}>
            {files.length}/5
          </span>
        </label>

        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? '#FF8000' : attachmentError ? '#F82629' : '#2A2A2A'}`,
            borderRadius: 8, padding: '24px 16px',
            cursor: files.length >= MAX_FILES ? 'not-allowed' : 'pointer',
            textAlign: 'center', transition: 'border-color 0.15s',
            opacity: files.length >= MAX_FILES ? 0.4 : 1,
            background: isDragActive ? 'rgba(255,128,0,0.05)' : 'transparent',
          }}
        >
          <input {...getInputProps()} />
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ margin: '0 auto 8px', display: 'block' }}>
            <path d="M14 4v16M6 12l8-8 8 8M4 22h20" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p style={{ color: '#666', fontSize: 14 }}>
            {isDragActive ? 'Drop files here' : 'Drop photos or videos here, or click to browse. At least one is required.'}
          </p>
          <p style={{ color: '#444', fontSize: 12, marginTop: 4 }}>Up to 5 files, 50MB each. JPG, PNG, HEIC, MP4, MOV.</p>
        </div>

        {(fileError || attachmentError) && (
          <p className="w-error anim-fade-up" style={{ marginTop: 8 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="6.5" cy="6.5" r="5.5" stroke="#F82629" />
              <path d="M6.5 3.5v3.5M6.5 9h.01" stroke="#F82629" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {fileError || attachmentError}
          </p>
        )}

        {files.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
            {files.map(fp => (
              <div key={fp.id} style={{ position: 'relative' }}>
                {fp.preview
                  ? <img src={fp.preview} alt={fp.file.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #2A2A2A', display: 'block' }} />
                  : <div style={{ width: 72, height: 72, borderRadius: 8, border: '1px solid #2A2A2A', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#555" strokeWidth="1.5" />
                      </svg>
                    </div>
                }
                <button
                  type="button"
                  onClick={() => removeFile(fp.id)}
                  style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#F82629', border: 'none', color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
                >×</button>
                <p style={{ fontSize: 10, color: '#555', marginTop: 4, width: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fp.file.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
