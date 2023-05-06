/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');
const typography = require('@tailwindcss/typography');
const { createThemes } = require('tw-colors');

module.exports = {
  content: ['./src/renderer/**/*.tsx'],
  darkMode: 'class',
  theme: {
    extend: {
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
  plugins: [
    typography,
    createThemes({
      light: {
        white: colors.white,
        slate: colors.slate,
        normal: colors.gray['700'],
        gray: colors.gray,
        green: {
          ...colors.green,
        },
      },
      dark: {
        white: colors.slate['900'],
        slate: {
          ...colors.slate,
          200: colors.slate['800'],
          400: colors.slate['600'],
          500: colors.slate['700'],
        },
        gray: {
          ...colors.gray,
          200: colors.slate['300'],
        },
        green: {
          ...colors.green,
          600: colors.slate['600'],
        },
        normal: colors.gray['300'],
      },
      violet: {
        white: colors.violet['100'],
        slate: {
          ...colors.red,
          200: colors.violet['400'],
          400: colors.violet['600'],
          500: colors.violet['700'],
        },
        gray: {
          ...colors.gray,
          200: colors.violet['200'],
        },
        normal: colors.gray['700'],
        green: {
          ...colors.green,
          600: colors.violet['600'],
        },
      },
    }),
  ],
};
