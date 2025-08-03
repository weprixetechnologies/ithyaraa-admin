/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: '#3D82E8',
        success: '#28a745',
        failed: '#dc3545',
        pending: '#ffc107',
        'primary-light': '#6696DC',
        'cerulean-text': '#3C7A89',
        'light-cerulean-text': '#9EC4D1',
        'light-secondary-text': '#a4a8b5',
        'dark-secondary-text': '#353638',
        'secondary-text': '#6c757d',
        'primary-dark': '#2E4756',
        'dark-text': '#232323',
        'cool-grey': '#9FA2B2',
        'unique': '#0B4A77',
        'secondary-primary': '#a1a1a1',
        'light-grey': '#e5e5e5'
      },
    },
  },
  keyframes: {
    fadeIn: {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 },
    }
  },
  animation: {
    fadeIn: 'fadeIn 0.8s ease-in-out',
  },
  plugins: [],
}

