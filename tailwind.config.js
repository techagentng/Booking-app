/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // GTBank Official Brand Colors
        gtbank: {
          primary: '#F58220',
          secondary: '#00425F',
          navy: '#002B3D',
          'light-orange': '#FF9A4D',
          'soft-blue': '#1F6F8B',
          'bg-gray': '#F5F7FA',
          'border-gray': '#E6E9EE',
          'muted-text': '#6B7280',
          'dark-text': '#111827',
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#DC2626',
          info: '#3B82F6',
        },
        // Light mode colors
        light: {
          bg: {
            primary: '#ffffff',
            secondary: '#F5F7FA',
            tertiary: '#E6E9EE',
          },
          text: {
            primary: '#111827',
            secondary: '#6B7280',
            tertiary: '#9CA3AF',
          },
          border: '#E6E9EE',
          accent: {
            primary: '#F58220',
            secondary: '#00425F',
            success: '#16A34A',
            danger: '#DC2626',
            warning: '#F59E0B',
            info: '#3B82F6',
          },
        },
        // Dark mode colors
        dark: {
          bg: {
            primary: '#002B3D',
            secondary: '#00425F',
            tertiary: '#1F6F8B',
          },
          text: {
            primary: '#ffffff',
            secondary: '#E6E9EE',
            tertiary: '#9CA3AF',
          },
          border: '#1F6F8B',
          accent: {
            primary: '#F58220',
            secondary: '#FF9A4D',
            success: '#16A34A',
            danger: '#DC2626',
            warning: '#F59E0B',
            info: '#3B82F6',
          },
        },
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0,0,0,0.05)',
        sm: '0 2px 8px rgba(0,0,0,0.06)',
        md: '0 8px 24px rgba(0,0,0,0.10)',
        lg: '0 12px 32px rgba(0,0,0,0.14)',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
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
