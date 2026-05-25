/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // GTBank Brand Colors
        gtbank: {
          orange: '#FF6600',
          'orange-light': '#FF8533',
          'orange-dark': '#CC5200',
          navy: '#003366',
          'navy-dark': '#002244',
          'navy-light': '#004488',
        },
        // Light mode colors
        light: {
          bg: {
            primary: '#ffffff',
            secondary: '#f5f7fa',
            tertiary: '#e8eef5',
          },
          text: {
            primary: '#003366',
            secondary: '#4a5568',
            tertiary: '#718096',
          },
          border: '#e2e8f0',
          accent: {
            primary: '#FF6600',
            secondary: '#003366',
            success: '#00A651',
            danger: '#DC2626',
            warning: '#F59E0B',
            info: '#003366',
          },
        },
        // Dark mode colors
        dark: {
          bg: {
            primary: '#002244',
            secondary: '#003366',
            tertiary: '#004488',
          },
          text: {
            primary: '#ffffff',
            secondary: '#e2e8f0',
            tertiary: '#a0aec0',
          },
          border: '#004488',
          accent: {
            primary: '#FF6600',
            secondary: '#FF8533',
            success: '#00A651',
            danger: '#DC2626',
            warning: '#F59E0B',
            info: '#FF8533',
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'slide-in-up': 'slideInUp 0.4s ease-out',
        'slide-in-down': 'slideInDown 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
};
