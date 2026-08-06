/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'border-emerald-600', 'text-emerald-600', 'bg-emerald-50',
    'border-blue-600', 'text-blue-600', 'bg-blue-50',
    'border-purple-600', 'text-purple-600', 'bg-purple-50',
    'border-amber-600', 'text-amber-600', 'bg-amber-50'
  ],
  theme: {
    extend: {
      colors: {
        'primary-orange': '#FF5A14',
        'button-orange': '#FF7A45',
        'hover-orange': '#F56B2F',
        sidebar: '#4A4A4A',
        'bg-light': '#FFFFFF',
        'input-bg': '#FFF7F2',
        'border-light': '#D8D8D8',
        'border-orange': '#FF8A55',
        'text-primary': '#666666',
        'text-secondary': '#888888',
        placeholder: '#B0B0B0',
        white: '#FFFFFF'
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
