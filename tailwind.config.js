/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enables dark mode
  content: ["./src/**/*.{html,js,liquid,md}"], // Adjust paths if needed
  theme: {
    extend: {
      fontFamily: {
        sans: ['Atkinson Next', 'Inter', 'sans-serif'],
      },
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        savoyBlue: '#3d60e2',
        aliceBlue: '#e0ecff',
        oxfordBlue: '#000022',
        ebony: '#515751',
        icterine: '#EDF060',
        taupeGray: '#C0B5B5',
      },
      textColor: {
        normal: '#000022',
        normalLight: '#515751',
        primary: '#3d60e2',
        primaryInverted: '#F7CB15',
        inverted: '#f2f2f2',
        invertedLight: '#A39594',
      },
      backgroundColor: {
        normal: 'white',
        secondary: ' #f2f2f2',
        secondaryInverted: '#A39594',
        inverted: '#000022',
        primary: '#3d60e2',
        primaryInverted: '#F7CB15',
      },
      textDecorationColor: {
        normal: '#000022',
        inverted: '#f2f2f2',
        primary: '#3d60e2',
        primaryInverted: '#F7CB15',
      },
      borderColor: {
        normal: '#f2f2f2',
        inverted: '#1E1E1E',
      },
      boxShadow: {
        // Light Mode Shadows
        low: '0px 1px 3px rgba(0, 0, 34, 0.1), 0px 1px 1px rgba(0, 0, 0, 0.10), 0px 2px 1px rgba(0, 0, 0, 0.08)',
        medium: '0px 2px 4px rgba(0, 0, 34, 0.1), 0px 3px 6px rgba(0, 0, 0, 0.14)',
        high: '0px 10px 20px rgba(0, 0, 34, 0.1), 0px 6px 6px rgba(0, 0, 0, 0.23)',

        // Dark Mode Shadows
        lowInverted: '0px 1px 3px rgba(255, 255, 255, 0.12), 0px 1px 1px rgba(255, 255, 255, 0.04), 0px 2px 1px rgba(255, 255, 255, 0.03)',
        mediumInverted: '0px 3px 6px rgba(255, 255, 255, 0.12), 0px 3px 6px rgba(255, 255, 255, 0.06)',
        highInverted: '0px 10px 20px rgba(255, 255, 255, 0.12), 0px 6px 6px rgba(255, 255, 255, 0.08)',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('textColor.normal'),
            '--tw-prose-headings': theme('textColor.normal'),
            '--tw-prose-links': theme('textColor.primary'),
            '--tw-prose-bold': theme('textColor.normal'),
            '--tw-prose-counters': theme('textColor.normalLight'),
            '--tw-prose-bullets': theme('textColor.primary'),
            '--tw-prose-hr': theme('color.ebony'),
            '--tw-prose-quotes': theme('borderColor.normalLight'),
            '--tw-prose-quote-borders': theme('colors.icterine'),
            '--tw-prose-captions': theme('textColor.normalLight'),
            '--tw-prose-code': theme('textColor.invertedLight'),
            '--tw-prose-pre-code': theme('textColor.primaryInverted'),
            '--tw-prose-pre-bg': theme('backgroundColor.inverted'),
            '--tw-prose-th-borders': theme('borderColor.normalLight'),
            '--tw-prose-td-borders': theme('borderColor.normal'),
          },
        },
        inverted: {
          css: {
            '--tw-prose-body': theme('textColor.inverted'),
            '--tw-prose-headings': theme('textColor.inverted'),
            '--tw-prose-links': theme('textColor.primaryInverted'),
            '--tw-prose-bold': theme('textColor.inverted'),
            '--tw-prose-counters': theme('textColor.invertedLight'),
            '--tw-prose-bullets': theme('textColor.primaryInverted'),
            '--tw-prose-hr': theme('textColor.invertedLight'),
            '--tw-prose-quotes': theme('textColor.invertedLight'),
            '--tw-prose-quote-borders': theme('colors.icterine'),
            '--tw-prose-captions': theme('textColor.invertedLight'),
            '--tw-prose-code': theme('textColor.primaryInverted'),
            '--tw-prose-pre-code': theme('textColor.normal'),
            '--tw-prose-pre-bg': theme('textColor.inverted'),
            '--tw-prose-th-borders': theme('borderColor.inverted'),
            '--tw-prose-td-borders': theme('borderColor.inverted'),
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')], // Adds typography plugin
};