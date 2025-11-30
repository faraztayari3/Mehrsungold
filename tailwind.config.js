/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: "class",
  corePlugins: {
    preflight: false
  },
  content: [
    './pages/**/*.js',
    './components/**/*.jsx',
    './components/**/*.js',
    "./node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
  ],
  // important: '__next',
  theme: {
    container: {
      center: true,
      // padding: {
      //   // DEFAULT: '1rem',
      //   sm: '2rem',
      //   lg: '10rem',
      //   // xl: '5rem',
      //   // '2xl': '10rem',
      // }
    },
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1900px',
      },
      fontFamily: {
        iransans: ['iransans', 'tahoma']
      },
      fontSize: {
        'large-0': '1em',
        'large-1': '1.33em',
        'large-2': '1.7689em',
        'large-3': '2.352637em',
        'large-4': '3.12900721em',
        'large-5': '4.1615795893em',
        'large-6': '5.5349008538em',
        'large-7': '7.3614181355em',
        'large-8': '1.625rem',
        'large-9': '3rem',
        'large-10': '1.3125rem',
        'large-p5': '1.1532562595em',
        'small-0': '1em',
        'small-1': '0.9em',
        'small-2': '0.81em',
        'small-3': '0.729em',
        'small-4': '0.6561em',
        'small-5': '0.59049em',
        'small-6': '0.531441em',
        'small-7': '0.4782969em'
      },
      colors: {
        // mehrsun new colors
        // #ffd60a gold
        // #ffc300 primary
        // #003566 blue
        // #001d3d blue dark mehrsun new colors
        // #000814 black
        'primary': '#ffc300',
        'gold': '#ffd60a',
        'dark': '#001413ff',
        'dark-alt': '#012f38',
        'dark-secondary': '#067470c7',
        'secondary-primary': '#fcaf17',
        'secondary': '#7979f2',
        'secondary-alt': '#5252cc',
        'buy': '#12FF0E',
        'sell': '#ff3f3f',
        'dark-gray': '#222',
        'light-gray': '#ddd',
        'primary-gray': 'gray',
        'secondary-gray': '#bfbcb6',
        'gray-alt': '#aba69a',
        'primary-green': '#2e7d32',
        'secondary-green': '#26D192',
        'primary-yellow': '#ed6c02',
        'primary-red': '#d32f2f',
        'alert-info': '#071318',
        'alert-info-foreground': '#b8e7fb',
        'alert-info-icon': '#29b6f6',
        'alert-warning': '#191207',
        'alert-warning-foreground': '#ffe2b7',
        'alert-warning-icon': '#ffa726',
        'alert-error': '#160b0b',
        'alert-error-foreground': '#f4c7c7',
        'alert-error-icon': '#f44336',
        'light-secondary-foreground': '#F9F9F9'
      }
    }
  },
  plugins: [],
};
