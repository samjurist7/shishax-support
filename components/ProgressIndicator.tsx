'use client'

const STEPS = ['PRODUCT', 'ISSUE', 'PURCHASE', 'DETAILS', 'REVIEW']

export default function ProgressIndicator({ current, onGoTo }: { current: number; onGoTo: (s: number) => void }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        {/* Track line */}
        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, height: 1, background: '#2A2A2A', zIndex: 0 }} />
        {/* Fill */}
        <div style={{ position: 'absolute', top: 16, left: 16, height: 1, zIndex: 0, transition: 'width 0.4s ease', width: `calc(${(current / (STEPS.length - 1)) * 100}% - 32px * ${current / (STEPS.length - 1)})`, background: 'linear-gradient(90deg, #FF8000, #F82629)' }} />

        {STEPS.map((label, i) => {
          const done = i < current
          const active = i === current
          return (
            <button
              key={i}
              onClick={() => i < current && onGoTo(i)}
              disabled={i > current}
              aria-current={active ? 'step' : undefined}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1, background: 'none', border: 'none', cursor: i < current ? 'pointer' : 'default', padding: 0 }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'linear-gradient(135deg, #FF8000, #F82629)' : '#111',
                border: active ? '2px solid #FF8000' : '1px solid #2A2A2A',
                transition: 'all 0.25s',
              }}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3.5 3.5 5.5-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 11, color: active ? '#FF8000' : '#555', fontWeight: 700 }}>{i + 1}</span>
                )}
              </div>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: active ? '#fff' : done ? '#FF8000' : '#444', display: 'none' }} className="md-label">{label}</span>
            </button>
          )
        })}
      </div>

      {/* Step labels — desktop */}
      <style>{`.md-label { display: none; } @media(min-width:640px){.md-label{display:block;}}`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        {STEPS.map((label, i) => (
          <span key={i} style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: i === current ? '#fff' : i < current ? '#FF8000' : '#444', flex: 1, textAlign: i === 0 ? 'left' : i === STEPS.length - 1 ? 'right' : 'center' }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
