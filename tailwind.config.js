/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f0f',
        surface: '#1a1a1a',
        border: '#2a2a2a',
        accent: '#00d4ff',
        'text-primary': '#ffffff',
        'text-secondary': '#aaaaaa',
      },
    },
  },
  plugins: [],
}
