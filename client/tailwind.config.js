/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: 'var(--tblr-blue)',
        indigo: 'var(--tblr-indigo)',
        purple: 'var(--tblr-purple)',
        pink: 'var(--tblr-pink)',
        red: 'var(--tblr-red)',
        orange: 'var(--tblr-orange)',
        yellow: 'var(--tblr-yellow)',
        green: 'var(--tblr-green)',
        teal: 'var(--tblr-teal)',
        cyan: 'var(--tblr-cyan)',
        white: 'var(--tblr-white)',
        gray: {
          DEFAULT: 'var(--tblr-gray)',
          100: 'var(--tblr-gray-100)',
          200: 'var(--tblr-gray-200)',
          300: 'var(--tblr-gray-300)',
          400: 'var(--tblr-gray-400)',
          500: 'var(--tblr-gray-500)',
          600: 'var(--tblr-gray-600)',
          700: 'var(--tblr-gray-700)',
          800: 'var(--tblr-gray-800)',
          900: 'var(--tblr-gray-900)',
        },
        primary: 'var(--tblr-primary)',
        secondary: 'var(--tblr-secondary)',
        success: 'var(--tblr-success)',
        info: 'var(--tblr-info)',
        warning: 'var(--tblr-warning)',
        danger: 'var(--tblr-danger)',
        light: 'var(--tblr-light)',
        dark: 'var(--tblr-dark)',
        muted: 'var(--tblr-muted)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',  // Slower spin animation
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
