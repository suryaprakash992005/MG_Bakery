/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          brown: {
            50: '#FDFBFB',
            100: '#F7EFEF',
            200: '#ECDCDC',
            300: '#DCBEBE',
            400: '#C29696',
            500: '#A46E6E',
            600: '#865151',
            700: '#6E4040',
            800: '#5B3535',
            900: '#4D2E2E',
            950: '#2C1717', // Warm Chocolate Brown
          },
          cream: {
            50: '#FAF8F5',  // Cream White
            100: '#F3EDE2', // Soft Beige
            200: '#E7DCBA',
            300: '#D5C493',
            400: '#BEA66B',
            500: '#A38848',
          },
          gold: {
            50: '#FCF9EE',
            100: '#F8F2CE',
            200: '#EFE295',
            300: '#E0CC56',
            400: '#CFB12B',
            500: '#B89B1C', // Golden Caramel Accent
            600: '#9C8114',
            700: '#7E6610',
            850: '#D4AF37', // Metallic Gold
          },
          orange: {
            50: '#FFF9F5',
            100: '#FFEEDF',
            200: '#FED2B3',
            300: '#FDAE7B',
            400: '#FC843C',
            500: '#F45A07', // Warm Orange
          }
        }
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        poppins: ['"Poppins"', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        }
      }
    },
  },
  plugins: [],
}
