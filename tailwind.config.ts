import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Approved ink-wash palette; legacy names retain every existing control.
        rausch: {
          DEFAULT: '#285f64',
          active: '#203e40',
          disabled: '#dce6e1',
        },
        ink: '#203e40',
        bodytext: '#344e50',
        muted: {
          DEFAULT: '#526b6b',
          soft: '#5c7070',
        },
        hairline: {
          DEFAULT: '#dce4df',
          soft: '#e6ece7',
        },
        canvas: '#f8f9f5',
        'surface-soft': '#edf2ee',
        'surface-strong': '#e1eae4',
      },
      fontFamily: {
        sans: [
          'var(--font-tc)',
          '-apple-system',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Microsoft JhengHei',
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
