/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          DEFAULT: '#556B45',
          dark: '#445637',
          light: '#6B8557',
          subtle: '#EAEFE8',
        },
        sage: {
          DEFAULT: '#A7C4A0',
          dark: '#8AA883',
          light: '#C4DABF',
          subtle: '#EDF4EC',
        },
        peach: {
          DEFAULT: '#E8976B',
          dark: '#D27F51',
          light: '#F2B594',
          subtle: '#FDEDE4',
        },
        blush: {
          DEFAULT: '#E8A7A1',
          dark: '#D48E88',
          light: '#F4C5C0',
          subtle: '#FCF1F0',
        },
        beige: {
          DEFAULT: '#F4E1D4',
          dark: '#E5CDBC',
          light: '#FAF1EB',
          subtle: '#FDF8F5',
        },
        ivory: {
          DEFAULT: '#FDF6F2',
          surface: '#FFFFFF',
          darker: '#F7EDE6',
        },
        terracotta: {
          DEFAULT: '#C87B5A',
          dark: '#B06443',
          light: '#DB9676',
        },
        forest: {
          DEFAULT: '#2E3D2F',
          dark: '#1F2A20',
          muted: '#4F6151',
          subtle: '#7A8C7C',
        },
        error: {
          DEFAULT: '#BA3D3B',
          light: '#FBEBEB',
          border: '#F0B8B7',
        }
      },
      fontFamily: {
        sans: [
          'Lexend',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        heading: [
          'Lexend',
          'sans-serif',
        ],
        serif: [
          'Playfair Display',
          'Georgia',
          'serif',
        ]
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(46, 61, 47, 0.04)',
        'card': '0 4px 20px -2px rgba(46, 61, 47, 0.06), 0 2px 6px -1px rgba(46, 61, 47, 0.03)',
        'card-hover': '0 8px 25px -4px rgba(46, 61, 47, 0.1), 0 4px 10px -2px rgba(46, 61, 47, 0.04)',
      },
    },
  },
  plugins: [],
}

