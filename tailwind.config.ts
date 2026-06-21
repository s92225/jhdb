import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Airbnb design system tokens
        rausch: {
          DEFAULT: '#ff385c',
          active: '#e00b41',
          disabled: '#ffd1da',
        },
        ink: '#222222',
        bodytext: '#3f3f3f',
        muted: {
          DEFAULT: '#6a6a6a',
          soft: '#929292',
        },
        hairline: {
          DEFAULT: '#dddddd',
          soft: '#ebebeb',
        },
        canvas: '#ffffff',
        'surface-soft': '#f7f7f7',
        'surface-strong': '#f2f2f2',
      },
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'Circular',
          '-apple-system',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        // The single Airbnb elevation tier
        airbnb:
          'rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px 0, rgba(0, 0, 0, 0.1) 0 4px 8px 0',
      },
      maxWidth: {
        content: '1280px',
      },
    },
  },
  plugins: [],
}

export default config
