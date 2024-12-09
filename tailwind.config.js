/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)', // Main blue
          light: 'var(--color-primary-light)', // Lighter blue for hover states
          dark: 'var(--color-primary-dark)', // Darker blue
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', // Green for actions
          light: 'var(--color-secondary-light)', // Lighter green
          dark: 'var(--color-secondary-dark)', // Darker green
        },
        neutral: {
          DEFAULT: 'var(--color-neutral)', // Slightly darker for cards
          light: 'var(--color-neutral-light)', // Backgrounds
          dark: 'var(--color-neutral-dark)', // Text and borders
        },
        danger: {
          DEFAULT: 'var(--color-error)', // Red for warnings/errors
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Clean, professional font
      },
      boxShadow: {
        sidebar: "2px 0 5px rgba(0, 0, 0, 0.1)", // For sidebar shadow
      },
    },
  },
  plugins: [
    require('daisyui')
  ],
}

