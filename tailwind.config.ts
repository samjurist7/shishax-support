import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF8000',
          red: '#F82629',
          'bg-0': '#0A0A0A',
          'bg-1': '#111111',
          'bg-2': '#1A1A1A',
          white: '#FFFFFF',
          gray: '#999999',
          border: '#2A2A2A',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Space Grotesk', 'sans-serif'],
      },
      keyframes: {
        'slide-in': { from: { opacity: '0', transform: 'translateX(40px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        'slide-out': { from: { opacity: '1', transform: 'translateX(0)' }, to: { opacity: '0', transform: 'translateX(-40px)' } },
        'fade-in': { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'draw': { from: { 'stroke-dashoffset': '100' }, to: { 'stroke-dashoffset': '0' } },
      },
      animation: {
        'slide-in': 'slide-in 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'draw': 'draw 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}

export default config
