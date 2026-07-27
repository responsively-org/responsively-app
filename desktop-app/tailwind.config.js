/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');
const typography = require('@tailwindcss/typography');

module.exports = {
  content: ['./src/renderer/**/*.tsx'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Legacy palette — remove once the dark: variants are fully collapsed.
        dark: {
          normal: colors.gray['300'],
        },
        light: {
          normal: colors.gray['700'],
        },
        // Hybrid Studio semantic tokens (values live in App.css per theme).
        bg: 'var(--bg)',
        dot: 'var(--dot)',
        panel: 'var(--panel)',
        card: 'var(--card)',
        line: 'var(--line)',
        'line-soft': 'var(--line-soft)',
        fg: 'var(--fg)',
        muted: 'var(--muted)',
        input: 'var(--input)',
        hover: 'var(--hover)',
        active: 'var(--active)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        'on-accent': 'var(--on-accent)',
        titlebar: 'var(--titlebar)',
        'titlebar-fg': 'var(--titlebar-fg)',
      },
      boxShadow: {
        elevated: 'var(--shadow)',
      },
      fontFamily: {
        sans: ['Lato', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      maxHeight: (theme) => ({
        ...theme('spacing'),
      }),
      maxWidth: (theme) => ({
        ...theme('spacing'),
      }),
      minHeight: (theme) => ({
        ...theme('spacing'),
      }),
      minWidth: (theme) => ({
        ...theme('spacing'),
      }),
    },
  },
  plugins: [typography],
};
