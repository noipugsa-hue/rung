import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,vue}',
    './components/**/*.{js,ts,jsx,tsx,vue}',
    './layouts/**/*.{js,ts,jsx,tsx,vue}',
    './pages/**/*.{js,ts,jsx,tsx,vue}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFC83D',
        dark: '#29231F',
        cream: '#FFF9F1',
        'soft-green': '#DDEFE5',
        orange: '#FF8A4C',
      },
      borderRadius: {
        'lung': '18px',
        'lung-lg': '28px',
      },
      boxShadow: {
        'lung': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'lung-lg': '0 12px 40px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config
