export default function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="w-error anim-fade-up">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{flexShrink:0}}>
        <circle cx="6.5" cy="6.5" r="5.5" stroke="#F82629"/>
        <path d="M6.5 3.5v3.5M6.5 9h.01" stroke="#F82629" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {message}
    </p>
  )
}
