/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 👈 Tambahkan ini untuk enable dark mode dengan class
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
}
