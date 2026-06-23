import { pixelBasedPreset, type TailwindConfig } from '@react-email/tailwind'

// Matches apps/web dark theme (.dark in index.css) — emails always use dark mode.
export const emailTailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        foreground: '#f5f2e8',
        primary: {
          DEFAULT: '#ffd633',
          foreground: '#0a0a0a',
        },
        secondary: {
          DEFAULT: '#1c1c1c',
          foreground: '#f5f2e8',
        },
        muted: {
          DEFAULT: '#1c1c1c',
          foreground: '#9e9e9e',
        },
        card: {
          DEFAULT: '#0d0d0d',
          foreground: '#f5f2e8',
        },
        border: '#242424',
        success: '#36b37a',
      },
      fontFamily: {
        sans: ['Raleway', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        full: '9999px',
      },
    },
  },
} satisfies TailwindConfig
