/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          sunken: 'var(--color-surface-sunken)',
          subtle: 'var(--color-surface-subtle)',
          elevated: 'var(--color-surface-elevated)',
        },
        main: 'var(--color-text-main)',
        muted: 'var(--color-text-muted)',
        inverse: 'var(--color-text-inverse)',
        border: {
          DEFAULT: 'var(--color-border)',
          focus: 'var(--color-border-focus)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          subtle: 'var(--color-primary-subtle)',
          tint: 'var(--color-primary-tint)',
        },
        'on-primary': 'var(--color-on-primary)',
        special: {
          DEFAULT: 'var(--color-special)',
          tint: 'var(--color-special-tint)',
        },
        win: {
          DEFAULT: 'var(--color-win)',
          tint: 'var(--color-win-tint)',
          border: 'var(--color-win-border)',
        },
        pending: {
          DEFAULT: 'var(--color-pending)',
          tint: 'var(--color-pending-tint)',
          border: 'var(--color-pending-border)',
        },
        loss: {
          DEFAULT: 'var(--color-loss)',
          bg: 'var(--color-loss-bg)',
          border: 'var(--color-loss-border)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          tint: 'var(--color-error-tint)',
        },
      },
      borderRadius: {
        none: '0px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        full: '9999px',
      },
      fontFamily: {
        sans: ['BeVietnamPro-Regular'],
        regular: ['BeVietnamPro-Regular'],
        medium: ['BeVietnamPro-Medium'],
        semibold: ['BeVietnamPro-SemiBold'],
        bold: ['BeVietnamPro-Bold'],
      },
    },
  },
  plugins: [],
};
