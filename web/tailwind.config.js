/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bird-green': '#2d5016',
        'bird-blue': '#2c5f7f',
        'bird-earth': '#8b7355',
      },
    },
  },
  plugins: [],
}
