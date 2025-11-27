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
        dark: {
          normal: colors.gray['300'],
        },
        light: {
          normal: colors.gray['700'],
        },
        theme: {
          bg: 'var(--theme-bg)',
          'bg-secondary': 'var(--theme-bg-secondary)',
          text: 'var(--theme-text)',
          'text-secondary': 'var(--theme-text-secondary)',
          primary: 'var(--theme-primary)',
          secondary: 'var(--theme-secondary)',
          border: 'var(--theme-border)',
          accent: 'var(--theme-accent)',
        },
      },
      fontFamily: {
        sans: ['Lato', ...defaultTheme.fontFamily.sans],
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
