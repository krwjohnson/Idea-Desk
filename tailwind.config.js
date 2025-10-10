/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#121416',
        panel: '#1b1e22',
        accent: '#00ff9c',
        accent2: '#ffd24a',
        ledRed: '#ff4d4d',
        noteYellow: '#f5d76e',
        notePink: '#f6a5c0',
        noteBlue: '#8fd3ff',
        grid: '#2a2f35'
      },
      borderRadius: {
        panel: '12px',
        note: '10px'
      },
      boxShadow: {
        elev: '0 8px 24px rgba(0,0,0,.35)'
      },
      fontFamily: {
        mono: ['Industry', 'Inter', 'system-ui', 'sans-serif']
      },
      letterSpacing: {
        tight: '-0.02em'
      }
    },
  },
  plugins: [],
}
