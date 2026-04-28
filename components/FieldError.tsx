export default function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="warranty-error animate-fade-in">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" stroke="#F82629" /><path d="M6.5 4v3M6.5 8.5v.5" stroke="#F82629" strokeWidth="1.5" strokeLinecap="round" /></svg>
      {message}
    </p>
  )
}
