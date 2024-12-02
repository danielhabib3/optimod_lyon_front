/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb", // Main blue
          light: "#3b82f6", // Lighter blue for hover states
          dark: "#1e40af", // Darker blue
        },
        secondary: {
          DEFAULT: "#10b981", // Green for actions
          light: "#34d399", // Lighter green
          dark: "#059669", // Darker green
        },
        neutral: {
          light: "#f9fafb", // Backgrounds
          DEFAULT: "#f3f4f6", // Slightly darker for cards
          dark: "#374151", // Text and borders
        },
        danger: {
          DEFAULT: "#ef4444", // Red for warnings/errors
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
  plugins: [],
}

