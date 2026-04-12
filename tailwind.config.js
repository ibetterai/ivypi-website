/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './**/index.html',
    './components/*.html',
    './assets/js/*.js',
    './blog/*.html'
  ],
  theme: {
    extend: {
      fontFamily: {
        jost: ['Jost', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        'serif-display': ['"DM Serif Display"', 'Georgia', 'serif']
      },
      colors: {
        brand: {
          navy: '#044d76',
          blue: '#01a2e8',
          dark: '#00627a',
          'navy-800': '#015a96',
          light: '#e8f1f5',
          muted: '#9DC3D5',
          'muted-light': '#c6dde8',
          'muted-dark': '#7BA8BD'
        },
        sky: {
          700: '#0270ba',
          800: '#015a96'
        }
      }
    }
  },
  plugins: []
}
