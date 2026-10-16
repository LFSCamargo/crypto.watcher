/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        tone: {
          amber: {
            DEFAULT: 'hsl(var(--tone-amber) / <alpha-value>)',
            strong: 'hsl(var(--tone-amber-strong) / <alpha-value>)',
          },
          coral: {
            DEFAULT: 'hsl(var(--tone-coral) / <alpha-value>)',
            strong: 'hsl(var(--tone-coral-strong) / <alpha-value>)',
          },
          violet: {
            DEFAULT: 'hsl(var(--tone-violet) / <alpha-value>)',
            strong: 'hsl(var(--tone-violet-strong) / <alpha-value>)',
          },
          sky: {
            DEFAULT: 'hsl(var(--tone-sky) / <alpha-value>)',
            strong: 'hsl(var(--tone-sky-strong) / <alpha-value>)',
          },
          teal: {
            DEFAULT: 'hsl(var(--tone-teal) / <alpha-value>)',
            strong: 'hsl(var(--tone-teal-strong) / <alpha-value>)',
          },
          pink: {
            DEFAULT: 'hsl(var(--tone-pink) / <alpha-value>)',
            strong: 'hsl(var(--tone-pink-strong) / <alpha-value>)',
          },
        },
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          strong: 'hsl(var(--primary-strong))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          strong: 'hsl(var(--destructive-strong))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
          strong: 'hsl(var(--success-strong))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
          strong: 'hsl(var(--warning-strong))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      transitionTimingFunction: {
        glass: 'var(--ease-glass)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Raleway', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-in-from-top': {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-bottom': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'radar-sweep': {
          to: { transform: 'rotate(360deg)' },
        },
        'radar-ping': {
          '0%': {
            scale: '1.18',
            boxShadow: '0 0 0 6px hsl(var(--primary) / 0.35)',
            borderColor: 'hsl(var(--primary))',
          },
          '18%, 100%': {
            scale: '1',
            boxShadow: '0 0 0 0 hsl(var(--primary) / 0)',
          },
        },
        'hero-scan': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '6%': { opacity: '1' },
          '40%': { transform: 'translateY(100%)', opacity: '1' },
          '44%, 100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'bar-fill': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        'highlight-draw': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        stamp: {
          '0%': { transform: 'scale(1.8) rotate(-12deg)', opacity: '0' },
          '60%': { transform: 'scale(0.92) rotate(2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radar-sweep 6s linear infinite',
        'radar-ping': 'radar-ping 6s ease-out infinite',
        'hero-scan': 'hero-scan 4.5s var(--ease-glass) 0.2s infinite both',
        'bar-fill': 'bar-fill 0.9s var(--ease-glass) both',
        'highlight-draw': 'highlight-draw 0.7s var(--ease-glass) 0.35s both',
        stamp: 'stamp 0.5s var(--ease-glass) 1.8s both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
