/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#12163A', light: '#1B2150', deep: '#0B0E28' },
        gold: { DEFAULT: '#E3A335', light: '#F4CB7B', deep: '#C9862A' },
        paper: '#FAF7F1',
        ink: '#12163A',
        slate: '#6B6F7B',
        mute: '#8A8672',
        line: '#DCD5C4',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
