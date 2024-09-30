/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        surface: '#1E1E1E',
        primary: '#BB86FC',
        primaryVariant: '#3700B3',
        text: '#FFFFFF',
        secondaryText: '#B0BEC5',
        mutedText: '#757575',
        accent: '#03DAC6',
        error: '#CF6679',
        warning: '#FFC107',
        link: '#BB86FC',
        border: '#424242',
        shadow: 'rgba(0, 0, 0, 0.5)',
      },
      fontFamily: {
        heading: ['"Playfair Display"','serif']
      } 
    },
  },
  plugins: [],
};
