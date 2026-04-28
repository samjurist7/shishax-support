'use client'
import { useCallback, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import FieldError from './FieldError'

const ISSUE_TYPES = ["Won't power on", 'Display issue', 'Heating malfunction', 'Battery not charging', 'Battery not holding charge', 'App connection issue', 'Physical damage', 'Other']
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'video/mp4', 'video/quicktime']
const MAX_SIZE = 50 * 1024 * 1024
const MAX_FILES = 5

interface FilePreview { file: File; preview: string; id: string }

export default function Step2Issue() {
  const { register, watch, setValue, formState: { errors } } = useFormContext()
  const [files, setFiles] = useState<FilePreview[]>([])
  const [fileError, setFileError] = useState('')
  const description = watch('issue.description') || ''
  const issueErrors = (errors?.issue as any) || {}

  const onDrop = useCallback(async (accepted: File[], rejected: any[]) => {
    setFileError('')
    if (rejected.length > 0) {
      const r = rejected[0]
      if (r.errors[0]?.code === 'file-too-large') setFileError('File is too large. Maximum 50MB.')
      else if (r.errors[0]?.code === 'file-invalid-type') setFileError('File type not supported. Use JPG, PNG, HEIC, MP4, or MOV.')
      return
    }
    const newFiles = accepted.slice(0, MAX_FILES - files.length)
    if (files.length + accepted.length > MAX_FILES) {
      setFileError('Maximum 5 files. Remove one to add another.')
    }

    const previews: FilePreview[] = await Promise.all(newFiles.map(async file => {
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
      return { file, preview, id: Math.random().toString(36).slice(2) }
    }))

    const updated = [...files, ...previews]
    setFiles(updated)

    // Convert to base64 for payload
    const attachments = await Promise.all(updated.map(async fp => {
      const buf = await fp.file.arrayBuffer()
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
      return { filename: fp.file.name, mimeType: fp.file.type, sizeBytes: fp.file.size, data: b64 }
    }))
    setValue('issue.attachments', attachments, { shouldValidate: true })
  }, [files])

  const removeFile = (id: string) => {
    const updated = files.filter(f => f.id !== id)
    setFiles(updated)
    setValue('issue.attachments', updated.length ? updated.map(fp => ({ filename: fp.file.name, mimeType: fp.file.type, sizeBytes: fp.file.size, data: '' })) : [], { shouldValidate: true })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/jpeg': [], 'image/png': [], 'image/heic': [], 'video/mp4': [], 'video/quicktime': [] },
    maxSize: MAX_SIZE, disabled: files.length >= MAX_FILES,
  })

  return (
    <div className="animate-slide-in space-y-6">
      <div>
        <p className="text-brand-gray mb-4" style={{ fontSize: 15 }}>What's going on?</p>
        <label className="warranty-label">Issue type *</label>
        <select className={`warranty-select ${issueErrors.type ? 'error' : ''}`} {...register('issue.type')}>
          <option value="">Select an issue</option>
          {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <FieldError message={issueErrors.type?.message} />
      </div>

      <div>
        <label className="warranty-label">Description * <span className="text-brand-gray normal-case font-normal tracking-normal ml-1" style={{ fontSize: 12 }}>{description.length}/1500</span></label>
        <textarea
          className={`warranty-input resize-none ${issueErrors.description ? 'error' : ''}`}
          rows={5}
          placeholder="Describe the issue in detail..."
          {...register('issue.description')}
        />
        <FieldError message={issueErrors.description?.message} />
        <p className="warranty-helper">The more detail you give us, the faster we can resolve this. Include when it started, what you were doing, and anything you've already tried.</p>
      </div>

      <div>
        <label className="warranty-label">Photos / Videos * <span className="text-brand-gray normal-case font-normal tracking-normal ml-1" style={{ fontSize: 12 }}>{files.length}/5</span></label>

        {/* Desktop drop zone */}
        <div
          {...getRootProps()}
          className={`hidden md:flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${isDragActive ? 'border-brand-orange bg-brand-orange/5' : 'border-brand-border hover:border-brand-gray'} ${files.length >= MAX_FILES ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mb-3 text-brand-gray"><path d="M16 4v16M8 12l8-8 8 8M6 24h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <p className="text-brand-gray text-sm">{isDragActive ? 'Drop files here' : 'Drop photos or videos here, or click to browse. At least one is required.'}</p>
          <p className="text-brand-gray mt-1" style={{ fontSize: 12 }}>Up to 5 files, 50MB each. JPG, PNG, HEIC, MP4, MOV.</p>
        </div>

        {/* Mobile tap to upload */}
        <div
          {...getRootProps()}
          className={`md:hidden flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-brand-orange' : 'border-brand-border'} ${files.length >= MAX_FILES ? 'opacity-40 cursor-not-allowed' : ''}`}
          style={{ minHeight: 48 }}
        >
          <input {...getInputProps()} />
          <p className="text-brand-gray text-sm py-3">Tap to upload photos or videos</p>
        </div>

        {(fileError || issueErrors.attachments) && (
          <p className="warranty-error animate-fade-in mt-2">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" stroke="#F82629" /><path d="M6.5 4v3M6.5 8.5v.5" stroke="#F82629" strokeWidth="1.5" strokeLinecap="round" /></svg>
            {fileError || issueErrors.attachments?.message}
          </p>
        )}

        {files.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {files.map(fp => (
              <div key={fp.id} className="relative group">
                {fp.preview
                  ? <img src={fp.preview} alt={fp.file.name} className="w-20 h-20 object-cover rounded-lg border border-brand-border" />
                  : <div className="w-20 h-20 rounded-lg border border-brand-border bg-brand-bg-2 flex items-center justify-center"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M15 10l5 5-5 5M9 14l-5-5 5-5" stroke="#999" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
                }
                <button type="button" onClick={() => removeFile(fp.id)} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-brand-red text-white text-xs flex items-center justify-center">×</button>
                <p className="text-brand-gray mt-1 w-20 truncate" style={{ fontSize: 10 }}>{fp.file.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
