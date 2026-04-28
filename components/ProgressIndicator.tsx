'use client'

const STEPS = ['PRODUCT', 'ISSUE', 'PURCHASE', 'YOUR DETAILS', 'REVIEW']

interface Props { current: number; onGoTo: (step: number) => void }

export default function ProgressIndicator({ current, onGoTo }: Props) {
  return (
    <div className="w-full mb-8 md:mb-10">
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute top-4 left-0 right-0 h-px bg-brand-border z-0" />
        <div
          className="absolute top-4 left-0 h-px z-0 transition-all duration-500"
          style={{ width: `${(current / (STEPS.length - 1)) * 100}%`, background: 'linear-gradient(90deg, #FF8000, #F82629)' }}
        />

        {STEPS.map((label, i) => {
          const done = i < current
          const active = i === current
          const clickable = i < current

          return (
            <button
              key={i}
              onClick={() => clickable && onGoTo(i)}
              disabled={!clickable}
              aria-current={active ? 'step' : undefined}
              className="flex flex-col items-center gap-2 z-10 disabled:cursor-default"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  done
                    ? 'text-white'
                    : active
                    ? 'bg-brand-bg-1 border-2 text-brand-orange'
                    : 'bg-brand-bg-1 border border-brand-border text-brand-gray'
                }`}
                style={done ? { background: 'linear-gradient(135deg, #FF8000, #F82629)' } : active ? { borderColor: '#FF8000' } : {}}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : (
                  <span className="font-display text-[11px]">{i + 1}</span>
                )}
              </div>
              <span className={`font-body text-[10px] tracking-widest uppercase hidden md:block transition-colors ${active ? 'text-white' : done ? 'text-brand-orange' : 'text-brand-gray'}`}>
                {label}
              </span>
              <span className="font-display text-[9px] text-brand-gray md:hidden">{i + 1}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
