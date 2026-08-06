/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-orange': 'var(--primary-orange)',
        'button-orange': 'var(--button-orange)',
        'hover-orange': 'var(--hover-orange)',
        sidebar: 'var(--sidebar)',
        'bg-light': 'var(--bg-light)',
        'input-bg': 'var(--input-bg)',
        'border-light': 'var(--border-light)',
        'border-orange': 'var(--border-orange)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        placeholder: 'var(--placeholder)',
        white: 'var(--white)'
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
