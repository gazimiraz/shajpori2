import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand:    { DEFAULT: '#D81B60', light: '#F06292', pale: '#FCE4EC' },
        ink:      { DEFAULT: '#0F172A', muted: '#475569', light: '#94A3B8' },
        surface:  { DEFAULT: '#FFFFFF', soft: '#F8FAFC', warm: '#F1F5F9', dark: '#0F172A' },
        line:     '#E2E8F0',
        sale:     '#E11D48',
        // legacy compat
        pink:     { DEFAULT: '#D81B60', hot: '#F06292', pale: '#FCE4EC',
                    50:'#FCE4EC', 100:'#F8BBD0', 400:'#D81B60', 600:'#C2185B', 800:'#880E4F' },
        charcoal: { DEFAULT: '#0F172A', light: '#1E293B' },
        muted:    '#475569',
        'off-white': '#F8FAFC',
        border:   '#E2E8F0',
        'pale-pink': '#FCE4EC',
        accent:   '#EAB308', // Gold accent
      },
      boxShadow: {
        card:  '0 4px 24px rgba(0,0,0,0.06)',
        lift:  '0 12px 40px rgba(0,0,0,0.12)',
        modal: '0 24px 60px rgba(0,0,0,0.18)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        card: '16px',
        glass: '16px',
      },
      animation: {
        'shimmer': 'shimmer 2.5s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
export default config
