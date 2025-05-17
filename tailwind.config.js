/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'white': '#ffffff',
        'github-blue': '#0969da',
        'github-text': '#24292f',
        'github-secondary': '#57606a',
        'github-border': '#d0d7de',
        'github-hover': '#f6f8fa',
        'github-error': '#cf222e',
        'github-error-bg': '#ffebe9',
      },
      animation: {
        'spin-slow': 'spin 0.8s linear infinite',
      },
    },
  },
  plugins: [],
}
